import type { PrayerSounds } from '@/constants/sounds'
import type {
  CalculationMethod,
  Coordinates,
  Madhab,
  NotificationSettings,
  PrayerAdjustments,
  PrayerTimes,
  ReminderSettings,
} from '@/types/prayer'

export type DayPrayerTimes = {
  date: Date
  times: PrayerTimes
}

export type NotificationConfig = {
  settings: NotificationSettings
  prayerSounds: PrayerSounds
  reminders: ReminderSettings
}

export type RescheduleParams = {
  coordinates: Coordinates
  calculationMethod: CalculationMethod
  madhab: Madhab
  notifications: NotificationSettings
  prayerSounds: PrayerSounds
  prayerAdjustments: PrayerAdjustments
  reminders: ReminderSettings
}

export interface NotificationService {
  initialize(): Promise<void>
  checkPermissions(): Promise<boolean>
  requestPermissions(): Promise<boolean>
  schedulePrayerNotifications(
    prayerTimes: DayPrayerTimes[],
    config: NotificationConfig,
  ): Promise<void>
  cancelAllNotifications(): Promise<void>
  reschedule(params: RescheduleParams): Promise<void>
  getScheduledCount(): Promise<number>
}
