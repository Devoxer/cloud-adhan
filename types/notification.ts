import type {
  CalculationMethod,
  Coordinates,
  Madhab,
  NotificationSettings,
  PrayerTimes,
} from '@/types/prayer'

export type DayPrayerTimes = {
  date: Date
  times: PrayerTimes
}

export type NotificationConfig = {
  settings: NotificationSettings
  athanSound: string
  fajrSound: string
}

export type RescheduleParams = {
  coordinates: Coordinates
  calculationMethod: CalculationMethod
  madhab: Madhab
  notifications: NotificationSettings
  athanSound: string
  fajrSound: string
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
