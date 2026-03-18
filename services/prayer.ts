import {
  CalculationMethod as AdhanCalculationMethod,
  Coordinates as AdhanCoordinates,
  Madhab as AdhanMadhab,
  PrayerTimes as AdhanPrayerTimes,
  type CalculationParameters,
  Qibla,
} from 'adhan'
import dayjs from 'dayjs'
import type { DayPrayerTimes } from '@/types/notification'
import {
  type CalculationMethod,
  type Coordinates,
  type Madhab,
  Prayer,
  type PrayerAdjustments,
  type PrayerTimeInfo,
  type PrayerTimes,
} from '@/types/prayer'

export const METHOD_MAP: Record<CalculationMethod, () => CalculationParameters> = {
  MuslimWorldLeague: AdhanCalculationMethod.MuslimWorldLeague,
  Egyptian: AdhanCalculationMethod.Egyptian,
  Karachi: AdhanCalculationMethod.Karachi,
  UmmAlQura: AdhanCalculationMethod.UmmAlQura,
  Dubai: AdhanCalculationMethod.Dubai,
  MoonsightingCommittee: AdhanCalculationMethod.MoonsightingCommittee,
  NorthAmerica: AdhanCalculationMethod.NorthAmerica,
  Kuwait: AdhanCalculationMethod.Kuwait,
  Qatar: AdhanCalculationMethod.Qatar,
  Singapore: AdhanCalculationMethod.Singapore,
  Tehran: AdhanCalculationMethod.Tehran,
  Turkey: AdhanCalculationMethod.Turkey,
  Morocco: () => {
    const params = AdhanCalculationMethod.Other()
    params.fajrAngle = 19
    params.ishaAngle = 17
    params.methodAdjustments.dhuhr = 5
    params.methodAdjustments.maghrib = 5
    return params
  },
}

export const MADHAB_MAP: Record<Madhab, (typeof AdhanMadhab)[keyof typeof AdhanMadhab]> = {
  shafi: AdhanMadhab.Shafi,
  hanafi: AdhanMadhab.Hanafi,
}

const PRAYER_ORDER: Prayer[] = [
  Prayer.Fajr,
  Prayer.Sunrise,
  Prayer.Dhuhr,
  Prayer.Asr,
  Prayer.Maghrib,
  Prayer.Isha,
]

export function calculatePrayerTimes(
  coordinates: Coordinates,
  date: Date,
  method: CalculationMethod,
  madhab: Madhab,
  prayerAdjustments?: PrayerAdjustments,
): PrayerTimes {
  const adhanCoords = new AdhanCoordinates(coordinates.latitude, coordinates.longitude)
  const params = METHOD_MAP[method]()
  params.madhab = MADHAB_MAP[madhab]
  if (prayerAdjustments) {
    params.adjustments.fajr = prayerAdjustments.fajr
    params.adjustments.sunrise = prayerAdjustments.sunrise
    params.adjustments.dhuhr = prayerAdjustments.dhuhr
    params.adjustments.asr = prayerAdjustments.asr
    params.adjustments.maghrib = prayerAdjustments.maghrib
    params.adjustments.isha = prayerAdjustments.isha
  }
  const adhanTimes = new AdhanPrayerTimes(adhanCoords, date, params)

  return {
    fajr: adhanTimes.fajr,
    sunrise: adhanTimes.sunrise,
    dhuhr: adhanTimes.dhuhr,
    asr: adhanTimes.asr,
    maghrib: adhanTimes.maghrib,
    isha: adhanTimes.isha,
  }
}

const PRAYER_TO_KEY: Record<Prayer, keyof PrayerTimes> = {
  [Prayer.Fajr]: 'fajr',
  [Prayer.Sunrise]: 'sunrise',
  [Prayer.Dhuhr]: 'dhuhr',
  [Prayer.Asr]: 'asr',
  [Prayer.Maghrib]: 'maghrib',
  [Prayer.Isha]: 'isha',
}

export function getNextPrayer(prayerTimes: PrayerTimes, now: Date): PrayerTimeInfo | null {
  for (const prayer of PRAYER_ORDER) {
    const time = prayerTimes[PRAYER_TO_KEY[prayer]]
    if (time.getTime() > now.getTime()) {
      return { prayer, time }
    }
  }
  return null
}

export function buildDayPrayerTimes(
  coordinates: Coordinates,
  calculationMethod: CalculationMethod,
  madhab: Madhab,
  days: number,
  prayerAdjustments?: PrayerAdjustments,
): DayPrayerTimes[] {
  const result: DayPrayerTimes[] = []
  const today = new Date()
  for (let i = 0; i < days; i++) {
    const date = dayjs(today).add(i, 'day').toDate()
    const times = calculatePrayerTimes(
      coordinates,
      date,
      calculationMethod,
      madhab,
      prayerAdjustments,
    )
    result.push({ date, times })
  }
  return result
}

export function getCurrentPrayer(prayerTimes: PrayerTimes, now: Date): PrayerTimeInfo | null {
  let current: PrayerTimeInfo | null = null
  for (const prayer of PRAYER_ORDER) {
    const time = prayerTimes[PRAYER_TO_KEY[prayer]]
    if (time.getTime() <= now.getTime()) {
      current = { prayer, time }
    }
  }
  return current
}

export function calculateQiblaDirection(coordinates: Coordinates): number {
  const adhanCoords = new AdhanCoordinates(coordinates.latitude, coordinates.longitude)
  return Qibla(adhanCoords)
}
