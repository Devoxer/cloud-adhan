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
  | 'Other'

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
