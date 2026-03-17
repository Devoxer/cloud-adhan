import * as Notifications from 'expo-notifications'

import AlarmManagerModule from '@/modules/alarm-manager'
import { Prayer } from '@/types/prayer'
import type { DayPrayerTimes, NotificationConfig, RescheduleParams } from '@/types/notification'

// Mock the native AlarmManager module
jest.mock('@/modules/alarm-manager', () => ({
  __esModule: true,
  default: {
    scheduleAlarm: jest.fn().mockResolvedValue(undefined),
    cancelAlarm: jest.fn().mockResolvedValue(undefined),
    cancelAllAlarms: jest.fn().mockResolvedValue(undefined),
    getScheduledAlarmCount: jest.fn().mockResolvedValue(0),
  },
}))

// Mock expo-notifications (used for permission checks on Android)
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
}))

// Mock prayer calculation service
jest.mock('@/services/prayer', () => ({
  calculatePrayerTimes: jest.fn(() => ({
    fajr: new Date('2026-03-17T05:30:00'),
    sunrise: new Date('2026-03-17T06:45:00'),
    dhuhr: new Date('2026-03-17T12:30:00'),
    asr: new Date('2026-03-17T15:45:00'),
    maghrib: new Date('2026-03-17T18:30:00'),
    isha: new Date('2026-03-17T20:00:00'),
  })),
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

// Import the Android-specific service directly to bypass jest-expo platform resolution
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { notificationService } = require('@/services/notification.android')

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

function defaultConfig(): NotificationConfig {
  return {
    settings: {
      [Prayer.Fajr]: true,
      [Prayer.Dhuhr]: true,
      [Prayer.Asr]: true,
      [Prayer.Maghrib]: true,
      [Prayer.Isha]: true,
    },
    athanSound: 'makkah',
    fajrSound: 'fajr-makkah',
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
    athanSound: 'makkah',
    fajrSound: 'fajr-makkah',
  }
}

describe('services/notification.android', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-03-17T04:00:00').getTime())
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('initialize', () => {
    it('is a no-op (channel created in useFirstLaunch)', async () => {
      await notificationService.initialize()
      // Should not throw, no side effects
    })
  })

  describe('checkPermissions', () => {
    it('returns true when granted', async () => {
      ;(Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' })
      const result = await notificationService.checkPermissions()
      expect(result).toBe(true)
    })

    it('returns false when denied', async () => {
      ;(Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' })
      const result = await notificationService.checkPermissions()
      expect(result).toBe(false)
    })
  })

  describe('requestPermissions', () => {
    it('returns true when granted', async () => {
      ;(Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' })
      const result = await notificationService.requestPermissions()
      expect(result).toBe(true)
    })

    it('returns false when denied', async () => {
      ;(Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' })
      const result = await notificationService.requestPermissions()
      expect(result).toBe(false)
    })
  })

  describe('schedulePrayerNotifications', () => {
    it('calls scheduleAlarm for each enabled prayer', async () => {
      const days = makeFutureDays(1)
      await notificationService.schedulePrayerNotifications(days, defaultConfig())

      // 5 prayers x 1 day = 5 calls
      expect(AlarmManagerModule.scheduleAlarm).toHaveBeenCalledTimes(5)
    })

    it('cancels all existing alarms before scheduling', async () => {
      const days = makeFutureDays(1)
      await notificationService.schedulePrayerNotifications(days, defaultConfig())

      expect(AlarmManagerModule.cancelAllAlarms).toHaveBeenCalledTimes(1)
      const cancelOrder = (AlarmManagerModule.cancelAllAlarms as jest.Mock).mock
        .invocationCallOrder[0]
      const firstScheduleOrder = (AlarmManagerModule.scheduleAlarm as jest.Mock).mock
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
      expect(AlarmManagerModule.scheduleAlarm).toHaveBeenCalledTimes(3)
    })

    it('uses fajrSound for Fajr and athanSound for other prayers', async () => {
      const days = makeFutureDays(1)
      await notificationService.schedulePrayerNotifications(days, defaultConfig())

      const calls = (AlarmManagerModule.scheduleAlarm as jest.Mock).mock.calls

      // Fajr should use fajr_makkah (androidRawName for fajr-makkah)
      expect(calls[0][2]).toBe('fajr_makkah')

      // Dhuhr, Asr, Maghrib, Isha should use makkah
      expect(calls[1][2]).toBe('makkah')
      expect(calls[2][2]).toBe('makkah')
      expect(calls[3][2]).toBe('makkah')
      expect(calls[4][2]).toBe('makkah')
    })

    it('skips past prayer times', async () => {
      jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-03-17T13:00:00').getTime())

      const days = makeFutureDays(1)
      await notificationService.schedulePrayerNotifications(days, defaultConfig())

      // Only Asr, Maghrib, Isha remain (3 prayers)
      expect(AlarmManagerModule.scheduleAlarm).toHaveBeenCalledTimes(3)
    })

    it('generates unique prayerId per prayer+date', async () => {
      const days = makeFutureDays(2)
      await notificationService.schedulePrayerNotifications(days, defaultConfig())

      const calls = (AlarmManagerModule.scheduleAlarm as jest.Mock).mock.calls
      const prayerIds = calls.map((c: unknown[]) => c[0])

      // All prayerIds should be unique
      const uniqueIds = new Set(prayerIds)
      expect(uniqueIds.size).toBe(prayerIds.length)

      // Verify format: "{prayer}-{YYYY-MM-DD}"
      expect(prayerIds[0]).toBe('fajr-2026-03-17')
      expect(prayerIds[5]).toBe('fajr-2026-03-18')
    })

    it('schedules correct number for multiple days', async () => {
      const days = makeFutureDays(7)
      await notificationService.schedulePrayerNotifications(days, defaultConfig())

      // 5 prayers x 7 days = 35
      expect(AlarmManagerModule.scheduleAlarm).toHaveBeenCalledTimes(35)
    })

    it('passes correct timestamp to scheduleAlarm', async () => {
      const days = makeFutureDays(1)
      await notificationService.schedulePrayerNotifications(days, defaultConfig())

      const firstCall = (AlarmManagerModule.scheduleAlarm as jest.Mock).mock.calls[0]
      // Fajr time for day 1
      expect(firstCall[1]).toBe(new Date('2026-03-17T05:30:00').getTime())
    })
  })

  describe('cancelAllNotifications', () => {
    it('calls cancelAllAlarms', async () => {
      await notificationService.cancelAllNotifications()
      expect(AlarmManagerModule.cancelAllAlarms).toHaveBeenCalledTimes(1)
    })
  })

  describe('reschedule', () => {
    it('cancels existing then schedules fresh', async () => {
      await notificationService.reschedule(defaultRescheduleParams())

      expect(AlarmManagerModule.cancelAllAlarms).toHaveBeenCalled()
      expect(AlarmManagerModule.scheduleAlarm).toHaveBeenCalled()
    })

    it('schedules 7 days of prayers', async () => {
      await notificationService.reschedule(defaultRescheduleParams())

      // 5 prayers x 7 days = 35
      expect(AlarmManagerModule.scheduleAlarm).toHaveBeenCalledTimes(35)
    })
  })

  describe('getScheduledCount', () => {
    it('returns count from native module', async () => {
      ;(AlarmManagerModule.getScheduledAlarmCount as jest.Mock).mockResolvedValue(15)

      const count = await notificationService.getScheduledCount()
      expect(count).toBe(15)
    })
  })
})
