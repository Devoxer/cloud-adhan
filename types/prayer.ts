export enum Prayer {
  Fajr = 'fajr',
  Sunrise = 'sunrise',
  Dhuhr = 'dhuhr',
  Asr = 'asr',
  Maghrib = 'maghrib',
  Isha = 'isha',
}

export type CalculationMethod =
  | 'MuslimWorldLeague'
  | 'Egyptian'
  | 'Karachi'
  | 'UmmAlQura'
  | 'Dubai'
  | 'MoonsightingCommittee'
  | 'NorthAmerica'
  | 'Kuwait'
  | 'Qatar'
  | 'Singapore'
  | 'Tehran'
  | 'Turkey'
  | 'Morocco'

export type Madhab = 'hanafi' | 'shafi'

export type Language = 'en' | 'ar'

export type NotifiablePrayer = Exclude<Prayer, Prayer.Sunrise>

export type NotificationSettings = Record<NotifiablePrayer, boolean>

export interface PrayerTimes {
  fajr: Date
  sunrise: Date
  dhuhr: Date
  asr: Date
  maghrib: Date
  isha: Date
}

export type Coordinates = {
  latitude: number
  longitude: number
}

export type PrayerTimeInfo = {
  prayer: Prayer
  time: Date
}

export type PrayerAdjustments = Record<Prayer, number>

export const DEFAULT_PRAYER_ADJUSTMENTS: PrayerAdjustments = {
  fajr: 0,
  sunrise: 0,
  dhuhr: 0,
  asr: 0,
  maghrib: 0,
  isha: 0,
}

export type ReminderConfig = { enabled: boolean; minutes: number }
export type ReminderSettings = Record<NotifiablePrayer, ReminderConfig>

export const REMINDER_OFFSET_OPTIONS = [5, 10, 15, 20, 30] as const

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  fajr: { enabled: false, minutes: 15 },
  dhuhr: { enabled: false, minutes: 15 },
  asr: { enabled: false, minutes: 15 },
  maghrib: { enabled: false, minutes: 15 },
  isha: { enabled: false, minutes: 15 },
}
