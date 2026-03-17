import dayjs from 'dayjs'
import * as Notifications from 'expo-notifications'

import { getSoundById } from '@/constants/sounds'
import i18n from '@/i18n'
import { buildDayPrayerTimes } from '@/services/prayer'
import type {
  DayPrayerTimes,
  NotificationConfig,
  NotificationService,
  RescheduleParams,
} from '@/types/notification'
import { type NotifiablePrayer, Prayer } from '@/types/prayer'
import { formatTime } from '@/utils/format'

const MAX_IOS_NOTIFICATIONS = 64
const SCHEDULE_DAYS = 13

const NOTIFIABLE_PRAYERS: NotifiablePrayer[] = [
  Prayer.Fajr,
  Prayer.Dhuhr,
  Prayer.Asr,
  Prayer.Maghrib,
  Prayer.Isha,
]

function getPrayerNotificationContent(
  prayer: NotifiablePrayer,
  time: Date,
  config: NotificationConfig,
): { title: string; body: string; sound: string } {
  const title = i18n.t(`prayer.${prayer}`)
  const body = formatTime(time)
  const soundId = prayer === Prayer.Fajr ? config.fajrSound : config.athanSound
  const soundMeta = getSoundById(soundId)
  const sound = soundMeta?.iosCafFile ?? 'makkah.caf'

  return { title, body, sound }
}

async function initialize(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  })

  // TODO: Register BGAppRefreshTask when expo-background-fetch and expo-task-manager are installed.
  // The app-open and notification-received triggers provide sufficient coverage for most users.
  // The 12.8-day notification window means users who open the app at least once every 12 days
  // will never miss a notification. See Story 3.4 for background task implementation.
}

async function checkPermissions(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync()
  return status === 'granted'
}

async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync()
  return status === 'granted'
}

async function schedulePrayerNotifications(
  days: DayPrayerTimes[],
  config: NotificationConfig,
): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync()

  let scheduled = 0
  const now = Date.now()

  for (const day of days) {
    if (scheduled >= MAX_IOS_NOTIFICATIONS) break

    for (const prayer of NOTIFIABLE_PRAYERS) {
      if (scheduled >= MAX_IOS_NOTIFICATIONS) break
      if (!config.settings[prayer]) continue

      const time = day.times[prayer]
      if (time.getTime() <= now) continue

      const { title, body, sound } = getPrayerNotificationContent(prayer, time, config)

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound,
          data: {
            prayer,
            date: dayjs(day.date).format('YYYY-MM-DD'),
            type: 'prayer-notification',
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: time,
        },
      })
      scheduled++
    }
  }
}

async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync()
}

async function reschedule(params: RescheduleParams): Promise<void> {
  const { coordinates, calculationMethod, madhab, notifications, athanSound, fajrSound } = params

  const days = buildDayPrayerTimes(coordinates, calculationMethod, madhab, SCHEDULE_DAYS)

  const config: NotificationConfig = {
    settings: notifications,
    athanSound,
    fajrSound,
  }

  await schedulePrayerNotifications(days, config)
}

async function getScheduledCount(): Promise<number> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync()
  return scheduled.length
}

export const notificationService: NotificationService = {
  initialize,
  checkPermissions,
  requestPermissions,
  schedulePrayerNotifications,
  cancelAllNotifications,
  reschedule,
  getScheduledCount,
}
