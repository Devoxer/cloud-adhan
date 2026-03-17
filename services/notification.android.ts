import dayjs from 'dayjs'
import * as Notifications from 'expo-notifications'

import { getSoundById } from '@/constants/sounds'
import AlarmManagerModule from '@/modules/alarm-manager'
import { buildDayPrayerTimes } from '@/services/prayer'
import type {
  DayPrayerTimes,
  NotificationConfig,
  NotificationService,
  RescheduleParams,
} from '@/types/notification'
import { type NotifiablePrayer, Prayer } from '@/types/prayer'

const NOTIFIABLE_PRAYERS: NotifiablePrayer[] = [
  Prayer.Fajr,
  Prayer.Dhuhr,
  Prayer.Asr,
  Prayer.Maghrib,
  Prayer.Isha,
]
const SCHEDULE_DAYS = 7

async function initialize(): Promise<void> {
  // No-op: Android notification channel already created in useFirstLaunch.ts
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
  await AlarmManagerModule.cancelAllAlarms()

  const now = Date.now()

  for (const day of days) {
    for (const prayer of NOTIFIABLE_PRAYERS) {
      if (!config.settings[prayer]) continue

      const time = day.times[prayer]
      if (time.getTime() <= now) continue

      const soundId = prayer === Prayer.Fajr ? config.fajrSound : config.athanSound
      const sound = getSoundById(soundId)
      const soundName = sound?.androidRawName ?? 'makkah'
      const prayerId = `${prayer}-${dayjs(day.date).format('YYYY-MM-DD')}`

      await AlarmManagerModule.scheduleAlarm(prayerId, time.getTime(), soundName)
    }
  }
}

async function cancelAllNotifications(): Promise<void> {
  await AlarmManagerModule.cancelAllAlarms()
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
  return AlarmManagerModule.getScheduledAlarmCount()
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
