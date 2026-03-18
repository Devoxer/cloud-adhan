import * as Notifications from 'expo-notifications'

import { notificationService } from '@/services/notification'
import { Prayer } from '@/types/prayer'
import type { DayPrayerTimes, NotificationConfig, RescheduleParams } from '@/types/notification'

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn().mockResolvedValue('notification-id'),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  SchedulableTriggerInputTypes: {
    DATE: 'date',
    TIME_INTERVAL: 'timeInterval',
    CALENDAR: 'calendar',
  },
  AndroidImportance: { HIGH: 4 },
}))

// Mock prayer calculation service
const mockPrayerTimesForDay = {
  fajr: new Date('2026-03-17T05:30:00'),
  sunrise: new Date('2026-03-17T06:45:00'),
  dhuhr: new Date('2026-03-17T12:30:00'),
  asr: new Date('2026-03-17T15:45:00'),
  maghrib: new Date('2026-03-17T18:30:00'),
  isha: new Date('2026-03-17T20:00:00'),
}

jest.mock('@/services/prayer', () => ({
  calculatePrayerTimes: jest.fn(() => mockPrayerTimesForDay),
  buildDayPrayerTimes: jest.fn((_coords, _method, _madhab, days: number) => {
    const result = []
    const baseDate = new Date('2026-03-17T00:00:00')
    for (let i = 0; i < days; i++) {
      const date = new Date(baseDate)
      date.setDate(date.getDate() + i)
      const dayNum = 17 + i
      const monthStr = dayNum > 31 ? '04' : '03'
      const dayStr = String(dayNum > 31 ? dayNum - 31 : dayNum).padStart(2, '0')
      result.push({
        date,
        times: {
          fajr: new Date(`2026-${monthStr}-${dayStr}T05:30:00`),
          sunrise: new Date(`2026-${monthStr}-${dayStr}T06:45:00`),
          dhuhr: new Date(`2026-${monthStr}-${dayStr}T12:30:00`),
          asr: new Date(`2026-${monthStr}-${dayStr}T15:45:00`),
          maghrib: new Date(`2026-${monthStr}-${dayStr}T18:30:00`),
          isha: new Date(`2026-${monthStr}-${dayStr}T20:00:00`),
        },
      })
    }
    return result
  }),
}))

// Mock i18n
jest.mock('@/i18n', () => ({
  t: jest.fn((key: string, params?: Record<string, unknown>) => {
    const map: Record<string, string> = {
      'prayer.fajr': 'Fajr',
      'prayer.dhuhr': 'Dhuhr',
      'prayer.asr': 'Asr',
      'prayer.maghrib': 'Maghrib',
      'prayer.isha': 'Isha',
      'notification.reminderTitle': 'Reminder',
    }
    if (key === 'notification.reminderBody' && params) {
      return `${params.prayer} in ${params.minutes} minutes`
    }
    return map[key] ?? key
  }),
}))

// Mock format util
jest.mock('@/utils/format', () => ({
  formatTime: jest.fn((date: Date) => {
    const h = date.getHours()
    const m = String(date.getMinutes()).padStart(2, '0')
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${m} ${ampm}`
  }),
}))


function makeFutureDays(count: number): DayPrayerTimes[] {
  const days: DayPrayerTimes[] = []
  const baseDate = new Date('2026-03-17T00:00:00')

  for (let i = 0; i < count; i++) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() + i)
    const dayNum = 17 + i
    const monthStr = dayNum > 31 ? '04' : '03'
    const dayStr = String(dayNum > 31 ? dayNum - 31 : dayNum).padStart(2, '0')
    days.push({
      date,
      times: {
        fajr: new Date(`2026-${monthStr}-${dayStr}T05:30:00`),
        sunrise: new Date(`2026-${monthStr}-${dayStr}T06:45:00`),
        dhuhr: new Date(`2026-${monthStr}-${dayStr}T12:30:00`),
        asr: new Date(`2026-${monthStr}-${dayStr}T15:45:00`),
        maghrib: new Date(`2026-${monthStr}-${dayStr}T18:30:00`),
        isha: new Date(`2026-${monthStr}-${dayStr}T20:00:00`),
      },
    })
  }
  return days
}

const DEFAULT_REMINDERS = {
  fajr: { enabled: false, minutes: 15 },
  dhuhr: { enabled: false, minutes: 15 },
  asr: { enabled: false, minutes: 15 },
  maghrib: { enabled: false, minutes: 15 },
  isha: { enabled: false, minutes: 15 },
}

function defaultConfig(): NotificationConfig {
  return {
    settings: {
      [Prayer.Fajr]: true,
      [Prayer.Dhuhr]: true,
      [Prayer.Asr]: true,
      [Prayer.Maghrib]: true,
      [Prayer.Isha]: true,
    },
    prayerSounds: {
      fajr: 'fajr-makkah',
      dhuhr: 'makkah',
      asr: 'makkah',
      maghrib: 'makkah',
      isha: 'makkah',
    },
    reminders: { ...DEFAULT_REMINDERS },
  }
}

function defaultRescheduleParams(): RescheduleParams {
  return {
    coordinates: { latitude: 33.5731, longitude: -7.5898 },
    calculationMethod: 'Morocco',
    madhab: 'shafi',
    notifications: {
      [Prayer.Fajr]: true,
      [Prayer.Dhuhr]: true,
      [Prayer.Asr]: true,
      [Prayer.Maghrib]: true,
      [Prayer.Isha]: true,
    },
    prayerSounds: {
      fajr: 'fajr-makkah',
      dhuhr: 'makkah',
      asr: 'makkah',
      maghrib: 'makkah',
      isha: 'makkah',
    },
    prayerAdjustments: {
      fajr: 0,
      sunrise: 0,
      dhuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0,
    },
    reminders: { ...DEFAULT_REMINDERS },
  }
}

describe('services/notification.ios', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Set "now" to be before all test prayer times
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-03-17T04:00:00').getTime())
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('initialize', () => {
    it('sets notification handler', async () => {
      await notificationService.initialize()
      expect(Notifications.setNotificationHandler).toHaveBeenCalledTimes(1)
      expect(Notifications.setNotificationHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          handleNotification: expect.any(Function),
        }),
      )
    })

    it('notification handler returns correct config', async () => {
      await notificationService.initialize()
      const handler = (Notifications.setNotificationHandler as jest.Mock).mock.calls[0][0]
      const result = await handler.handleNotification()
      expect(result).toEqual({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      })
    })
  })

  describe('checkPermissions', () => {
    it('returns true when granted', async () => {
      ;(Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      })
      const result = await notificationService.checkPermissions()
      expect(result).toBe(true)
    })

    it('returns false when denied', async () => {
      ;(Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      })
      const result = await notificationService.checkPermissions()
      expect(result).toBe(false)
    })
  })

  describe('requestPermissions', () => {
    it('returns true when granted', async () => {
      ;(Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      })
      const result = await notificationService.requestPermissions()
      expect(result).toBe(true)
    })

    it('returns false when denied', async () => {
      ;(Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      })
      const result = await notificationService.requestPermissions()
      expect(result).toBe(false)
    })
  })

  describe('schedulePrayerNotifications', () => {
    it('schedules correct number of notifications (5 prayers x days)', async () => {
      const days = makeFutureDays(3)
      await notificationService.schedulePrayerNotifications(days, defaultConfig())

      // 5 prayers per day x 3 days = 15
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(15)
    })

    it('cancels all existing notifications before scheduling', async () => {
      const days = makeFutureDays(1)
      await notificationService.schedulePrayerNotifications(days, defaultConfig())

      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1)
      // Cancel should be called before any schedule
      const cancelOrder = (Notifications.cancelAllScheduledNotificationsAsync as jest.Mock).mock
        .invocationCallOrder[0]
      const firstScheduleOrder = (Notifications.scheduleNotificationAsync as jest.Mock).mock
        .invocationCallOrder[0]
      expect(cancelOrder).toBeLessThan(firstScheduleOrder)
    })

    it('skips disabled prayers (respects per-prayer toggles)', async () => {
      const days = makeFutureDays(1)
      const config = defaultConfig()
      config.settings[Prayer.Dhuhr] = false
      config.settings[Prayer.Asr] = false

      await notificationService.schedulePrayerNotifications(days, config)

      // 3 enabled prayers (Fajr, Maghrib, Isha) x 1 day = 3
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(3)
    })

    it('uses per-prayer sound lookup from prayerSounds', async () => {
      const days = makeFutureDays(1)
      await notificationService.schedulePrayerNotifications(days, defaultConfig())

      const calls = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls

      // First call is Fajr — should use fajr_makkah.caf
      expect(calls[0][0].content.sound).toBe('fajr_makkah.caf')

      // Subsequent calls (Dhuhr, Asr, Maghrib, Isha) should use makkah.caf
      expect(calls[1][0].content.sound).toBe('makkah.caf')
      expect(calls[2][0].content.sound).toBe('makkah.caf')
      expect(calls[3][0].content.sound).toBe('makkah.caf')
      expect(calls[4][0].content.sound).toBe('makkah.caf')
    })

    it('uses false for sound when prayer has silent sound selected', async () => {
      const days = makeFutureDays(1)
      const config = defaultConfig()
      config.prayerSounds.dhuhr = 'silent'

      await notificationService.schedulePrayerNotifications(days, config)

      const calls = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls
      // Dhuhr (index 1) should have sound: false
      expect(calls[1][0].content.sound).toBe(false)
      // Others should still have their normal sounds
      expect(calls[0][0].content.sound).toBe('fajr_makkah.caf')
      expect(calls[2][0].content.sound).toBe('makkah.caf')
    })

    it('notifications include correct title (prayer name), body (time), and sound', async () => {
      const days = makeFutureDays(1)
      await notificationService.schedulePrayerNotifications(days, defaultConfig())

      const firstCall = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0]
      expect(firstCall.content.title).toBe('Fajr')
      expect(firstCall.content.body).toBeDefined()
      expect(firstCall.content.sound).toBe('fajr_makkah.caf')
      expect(firstCall.content.data).toEqual(
        expect.objectContaining({
          prayer: Prayer.Fajr,
          type: 'prayer-notification',
        }),
      )
    })

    it('uses DATE trigger with correct prayer time', async () => {
      const days = makeFutureDays(1)
      await notificationService.schedulePrayerNotifications(days, defaultConfig())

      const firstCall = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls[0][0]
      expect(firstCall.trigger).toEqual({
        type: 'date',
        date: days[0].times.fajr,
      })
    })

    it('caps at 64 notifications even if more days calculated', async () => {
      const days = makeFutureDays(20) // 20 days x 5 prayers = 100, but capped at 64
      await notificationService.schedulePrayerNotifications(days, defaultConfig())

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(64)
    })

    it('skips past prayer times', async () => {
      // Set "now" to after Dhuhr
      jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-03-17T13:00:00').getTime())

      const days = makeFutureDays(1)
      await notificationService.schedulePrayerNotifications(days, defaultConfig())

      // Only Asr, Maghrib, Isha remain for first day (3 prayers)
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(3)
    })
  })

  describe('reminder notifications', () => {
    it('schedules reminder notification when reminder is enabled for a prayer', async () => {
      const days = makeFutureDays(1)
      const config = defaultConfig()
      config.reminders.fajr = { enabled: true, minutes: 15 }

      await notificationService.schedulePrayerNotifications(days, config)

      // 5 prayers + 1 reminder = 6
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(6)

      // Check the reminder notification (second call, after Fajr prayer)
      const calls = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls
      const reminderCall = calls[1][0]
      expect(reminderCall.content.data.type).toBe('prayer-reminder')
      expect(reminderCall.content.data.prayer).toBe('fajr')
      expect(reminderCall.content.title).toBe('Reminder')
    })

    it('does NOT schedule reminder when parent prayer is disabled', async () => {
      const days = makeFutureDays(1)
      const config = defaultConfig()
      config.settings[Prayer.Fajr] = false
      config.reminders.fajr = { enabled: true, minutes: 15 }

      await notificationService.schedulePrayerNotifications(days, config)

      // 4 prayers (Fajr disabled), 0 reminders (parent disabled)
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(4)
    })

    it('does NOT schedule reminder when reminder time is in the past', async () => {
      // Set "now" to 10 minutes before Fajr — reminder at 15 min before would be in the past
      jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-03-17T05:20:00').getTime())

      const days = makeFutureDays(1)
      const config = defaultConfig()
      config.reminders.fajr = { enabled: true, minutes: 15 }

      await notificationService.schedulePrayerNotifications(days, config)

      // Check that no prayer-reminder type was scheduled for fajr day 1
      const calls = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls
      const reminderCalls = calls.filter((c: unknown[]) => (c[0] as { content: { data: { type: string } } }).content.data.type === 'prayer-reminder')
      // Day 1 fajr reminder at 05:15 is in the past (now = 05:20), so skipped
      expect(reminderCalls.length).toBe(0)
    })
  })

  describe('iOS limit with reminders', () => {
    it('with 5 prayers + 5 reminders, schedules 6 days (totalPerDay=10)', async () => {
      const { buildDayPrayerTimes } = require('@/services/prayer')
      const params = defaultRescheduleParams()
      params.reminders = {
        fajr: { enabled: true, minutes: 15 },
        dhuhr: { enabled: true, minutes: 15 },
        asr: { enabled: true, minutes: 15 },
        maghrib: { enabled: true, minutes: 15 },
        isha: { enabled: true, minutes: 15 },
      }

      await notificationService.reschedule(params)

      // Math.floor(64 / 10) = 6 days
      expect(buildDayPrayerTimes).toHaveBeenCalledWith(
        expect.any(Object),
        'Morocco',
        'shafi',
        6,
        expect.objectContaining({ fajr: 0, dhuhr: 0 }),
      )
    })

    it('with 5 prayers + 3 reminders, schedules 8 days (totalPerDay=8)', async () => {
      const { buildDayPrayerTimes } = require('@/services/prayer')
      const params = defaultRescheduleParams()
      params.reminders = {
        fajr: { enabled: true, minutes: 15 },
        dhuhr: { enabled: true, minutes: 15 },
        asr: { enabled: true, minutes: 15 },
        maghrib: { enabled: false, minutes: 15 },
        isha: { enabled: false, minutes: 15 },
      }

      await notificationService.reschedule(params)

      // Math.floor(64 / 8) = 8 days
      expect(buildDayPrayerTimes).toHaveBeenCalledWith(
        expect.any(Object),
        'Morocco',
        'shafi',
        8,
        expect.objectContaining({ fajr: 0, dhuhr: 0 }),
      )
    })

    it('disabled prayer with enabled reminder does NOT count toward limit', async () => {
      const { buildDayPrayerTimes } = require('@/services/prayer')
      const params = defaultRescheduleParams()
      params.notifications[Prayer.Fajr] = false
      params.reminders = {
        fajr: { enabled: true, minutes: 15 }, // parent disabled — should NOT count
        dhuhr: { enabled: false, minutes: 15 },
        asr: { enabled: false, minutes: 15 },
        maghrib: { enabled: false, minutes: 15 },
        isha: { enabled: false, minutes: 15 },
      }

      await notificationService.reschedule(params)

      // 4 prayers, 0 valid reminders → totalPerDay=4, scheduleDays = floor(64/4) = 16
      expect(buildDayPrayerTimes).toHaveBeenCalledWith(
        expect.any(Object),
        'Morocco',
        'shafi',
        16,
        expect.objectContaining({ fajr: 0, dhuhr: 0 }),
      )
    })
  })

  describe('cancelAllNotifications', () => {
    it('calls cancelAllScheduledNotificationsAsync', async () => {
      await notificationService.cancelAllNotifications()
      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1)
    })
  })

  describe('reschedule', () => {
    it('cancels existing then schedules fresh', async () => {
      await notificationService.reschedule(defaultRescheduleParams())

      // Should cancel all then schedule new ones
      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled()
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled()
    })

    it('with 5 prayers enabled, schedules 12 days (60 notifications)', async () => {
      const { buildDayPrayerTimes } = require('@/services/prayer')
      await notificationService.reschedule(defaultRescheduleParams())

      // Math.floor(64 / 5) = 12 days
      expect(buildDayPrayerTimes).toHaveBeenCalledWith(
        expect.any(Object),
        'Morocco',
        'shafi',
        12,
        expect.objectContaining({ fajr: 0, dhuhr: 0 }),
      )
      // 12 days × 5 prayers = 60 notifications
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(60)
    })

    it('with 3 prayers enabled, schedules 21 days (63 notifications)', async () => {
      const { buildDayPrayerTimes } = require('@/services/prayer')
      const params = defaultRescheduleParams()
      params.notifications[Prayer.Dhuhr] = false
      params.notifications[Prayer.Asr] = false

      await notificationService.reschedule(params)

      // Math.floor(64 / 3) = 21 days
      expect(buildDayPrayerTimes).toHaveBeenCalledWith(
        expect.any(Object),
        'Morocco',
        'shafi',
        21,
        expect.objectContaining({ fajr: 0, dhuhr: 0 }),
      )
      // 21 days × 3 prayers = 63 notifications
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(63)
    })

    it('with 0 prayers enabled, cancels existing and schedules nothing', async () => {
      const params = defaultRescheduleParams()
      params.notifications[Prayer.Fajr] = false
      params.notifications[Prayer.Dhuhr] = false
      params.notifications[Prayer.Asr] = false
      params.notifications[Prayer.Maghrib] = false
      params.notifications[Prayer.Isha] = false

      await notificationService.reschedule(params)

      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1)
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled()
    })
  })

  describe('getScheduledCount', () => {
    it('returns count of pending scheduled notifications', async () => {
      ;(Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
        { id: '1' },
        { id: '2' },
        { id: '3' },
      ])

      const count = await notificationService.getScheduledCount()
      expect(count).toBe(3)
    })
  })
})
