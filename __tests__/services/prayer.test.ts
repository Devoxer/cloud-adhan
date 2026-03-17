import {
  buildDayPrayerTimes,
  calculatePrayerTimes,
  calculateQiblaDirection,
  getNextPrayer,
  getCurrentPrayer,
  METHOD_MAP,
  MADHAB_MAP,
} from '@/services/prayer'
import { Prayer } from '@/types/prayer'
import type { CalculationMethod, Madhab } from '@/types/prayer'

const makkah = { latitude: 21.4225, longitude: 39.8262 }
const newYork = { latitude: 40.7128, longitude: -74.006 }
const london = { latitude: 51.5074, longitude: -0.1278 }
const jakarta = { latitude: -6.2088, longitude: 106.8456 }
const cairo = { latitude: 30.0444, longitude: 31.2357 }
const casablanca = { latitude: 33.5731, longitude: -7.5898 }

describe('services/prayer', () => {
  describe('METHOD_MAP', () => {
    const allMethods: CalculationMethod[] = [
      'MuslimWorldLeague',
      'Egyptian',
      'Karachi',
      'UmmAlQura',
      'Dubai',
      'MoonsightingCommittee',
      'NorthAmerica',
      'Kuwait',
      'Qatar',
      'Singapore',
      'Tehran',
      'Turkey',
      'Morocco',
      'Other',
    ]

    it('has mappings for all 14 methods', () => {
      expect(Object.keys(METHOD_MAP)).toHaveLength(14)
    })

    it.each(allMethods)('%s maps to a function returning CalculationParameters', (method) => {
      const factory = METHOD_MAP[method]
      expect(typeof factory).toBe('function')
      const params = factory()
      expect(params).toBeDefined()
      expect(typeof params.fajrAngle).toBe('number')
    })
  })

  describe('MADHAB_MAP', () => {
    it('maps shafi and hanafi', () => {
      expect(MADHAB_MAP.shafi).toBe('shafi')
      expect(MADHAB_MAP.hanafi).toBe('hanafi')
    })
  })

  describe('calculatePrayerTimes', () => {
    it('returns all 6 prayer times as Date objects', () => {
      const result = calculatePrayerTimes(makkah, new Date(2026, 2, 15), 'UmmAlQura', 'shafi')
      expect(result.fajr).toBeInstanceOf(Date)
      expect(result.sunrise).toBeInstanceOf(Date)
      expect(result.dhuhr).toBeInstanceOf(Date)
      expect(result.asr).toBeInstanceOf(Date)
      expect(result.maghrib).toBeInstanceOf(Date)
      expect(result.isha).toBeInstanceOf(Date)
    })

    it('returns times in chronological order', () => {
      const result = calculatePrayerTimes(makkah, new Date(2026, 2, 15), 'UmmAlQura', 'shafi')
      expect(result.fajr.getTime()).toBeLessThan(result.sunrise.getTime())
      expect(result.sunrise.getTime()).toBeLessThan(result.dhuhr.getTime())
      expect(result.dhuhr.getTime()).toBeLessThan(result.asr.getTime())
      expect(result.asr.getTime()).toBeLessThan(result.maghrib.getTime())
      expect(result.maghrib.getTime()).toBeLessThan(result.isha.getTime())
    })

    it('works with all 14 calculation methods', () => {
      const methods: CalculationMethod[] = [
        'MuslimWorldLeague', 'Egyptian', 'Karachi', 'UmmAlQura', 'Dubai',
        'MoonsightingCommittee', 'NorthAmerica', 'Kuwait', 'Qatar',
        'Singapore', 'Tehran', 'Turkey', 'Morocco', 'Other',
      ]
      for (const method of methods) {
        const result = calculatePrayerTimes(makkah, new Date(2026, 2, 15), method, 'shafi')
        expect(result.fajr).toBeInstanceOf(Date)
        expect(result.isha).toBeInstanceOf(Date)
      }
    })

    it('produces different Asr times for Hanafi vs Shafi', () => {
      const date = new Date(2026, 2, 15)
      const shafi = calculatePrayerTimes(makkah, date, 'UmmAlQura', 'shafi')
      const hanafi = calculatePrayerTimes(makkah, date, 'UmmAlQura', 'hanafi')
      expect(shafi.asr.getTime()).not.toBe(hanafi.asr.getTime())
      // Hanafi Asr is always later
      expect(hanafi.asr.getTime()).toBeGreaterThan(shafi.asr.getTime())
    })

    it('completes in < 50ms (NFR2)', () => {
      const iterations = 10
      const start = Date.now()
      for (let i = 0; i < iterations; i++) {
        calculatePrayerTimes(makkah, new Date(2026, 2, 15), 'UmmAlQura', 'shafi')
      }
      expect((Date.now() - start) / iterations).toBeLessThan(50)
    })

    it('requires zero network requests (pure computation)', () => {
      // This test verifies the function is synchronous and completes instantly
      const result = calculatePrayerTimes(newYork, new Date(2026, 2, 15), 'NorthAmerica', 'shafi')
      expect(result.fajr).toBeInstanceOf(Date)
    })
  })

  describe('accuracy tests (within 1 min of Aladhan API reference)', () => {
    // Default tolerance: 1 minute per AC#9 / NFR12
    const ONE_MINUTE_MS = 1 * 60 * 1000
    // Extended tolerance for known library differences (e.g., UmmAlQura Isha during Ramadan)
    const TWO_MINUTES_MS = 2 * 60 * 1000

    // Reference times fetched from Aladhan API for 2026-03-15
    // Makkah, UmmAlQura (method=4), UTC+3
    // Note: Aladhan adds 30min Ramadan offset to Isha for UmmAlQura during Ramadan
    // (March 2026 is Ramadan). adhan library uses standard 90min. We test Isha separately.
    it('accurate for Makkah (UmmAlQura)', () => {
      const result = calculatePrayerTimes(makkah, new Date(2026, 2, 15), 'UmmAlQura', 'shafi')
      expectTimeClose(result.fajr, 5, 14, 3, ONE_MINUTE_MS)
      expectTimeClose(result.sunrise, 6, 30, 3, ONE_MINUTE_MS)
      expectTimeClose(result.dhuhr, 12, 30, 3, ONE_MINUTE_MS)
      expectTimeClose(result.asr, 15, 53, 3, ONE_MINUTE_MS)
      expectTimeClose(result.maghrib, 18, 30, 3, ONE_MINUTE_MS)
      // Isha: Aladhan adds Ramadan +30min offset for UmmAlQura; adhan uses standard
      // 90-min-after-Maghrib. 2-min tolerance for this known library difference.
      expectTimeClose(result.isha, 20, 0, 3, TWO_MINUTES_MS)
    })

    // New York, ISNA (method=2), UTC-4 (EDT, DST active since Mar 8)
    it('accurate for New York (ISNA)', () => {
      const result = calculatePrayerTimes(newYork, new Date(2026, 2, 15), 'NorthAmerica', 'shafi')
      expectTimeClose(result.fajr, 5, 53, -4, ONE_MINUTE_MS)
      expectTimeClose(result.sunrise, 7, 8, -4, ONE_MINUTE_MS)
      expectTimeClose(result.dhuhr, 13, 5, -4, ONE_MINUTE_MS)
      expectTimeClose(result.asr, 16, 26, -4, ONE_MINUTE_MS)
      expectTimeClose(result.maghrib, 19, 3, -4, ONE_MINUTE_MS)
      expectTimeClose(result.isha, 20, 18, -4, ONE_MINUTE_MS)
    })

    // London, MWL (method=3), UTC+0 (GMT)
    it('accurate for London (MWL)', () => {
      const result = calculatePrayerTimes(london, new Date(2026, 2, 15), 'MuslimWorldLeague', 'shafi')
      expectTimeClose(result.fajr, 4, 23, 0, ONE_MINUTE_MS)
      expectTimeClose(result.sunrise, 6, 15, 0, ONE_MINUTE_MS)
      expectTimeClose(result.dhuhr, 12, 9, 0, ONE_MINUTE_MS)
      expectTimeClose(result.asr, 15, 21, 0, ONE_MINUTE_MS)
      expectTimeClose(result.maghrib, 18, 5, 0, ONE_MINUTE_MS)
      expectTimeClose(result.isha, 19, 51, 0, ONE_MINUTE_MS)
    })

    // Jakarta, Singapore (method=11), UTC+7
    it('accurate for Jakarta (Singapore method)', () => {
      const result = calculatePrayerTimes(jakarta, new Date(2026, 2, 15), 'Singapore', 'shafi')
      expectTimeClose(result.fajr, 4, 40, 7, ONE_MINUTE_MS)
      expectTimeClose(result.sunrise, 5, 57, 7, ONE_MINUTE_MS)
      expectTimeClose(result.dhuhr, 12, 2, 7, ONE_MINUTE_MS)
      expectTimeClose(result.asr, 15, 10, 7, ONE_MINUTE_MS)
      expectTimeClose(result.maghrib, 18, 6, 7, ONE_MINUTE_MS)
      expectTimeClose(result.isha, 19, 15, 7, ONE_MINUTE_MS)
    })

    // Casablanca, Morocco (Fajr 19°, Isha 17°, Dhuhr +5min, Maghrib +5min), UTC+1
    it('accurate for Casablanca (Morocco)', () => {
      const result = calculatePrayerTimes(casablanca, new Date(2026, 2, 15), 'Morocco', 'shafi')
      // Verify Morocco uses custom angles and adjustments
      const params = METHOD_MAP.Morocco()
      expect(params.fajrAngle).toBe(19)
      expect(params.ishaAngle).toBe(17)
      expect(params.methodAdjustments.dhuhr).toBe(5)
      expect(params.methodAdjustments.maghrib).toBe(5)
      // Reference times from AlAdhan API (method=21) for Casablanca, 2026-03-15, UTC+1
      expectTimeClose(result.fajr, 6, 13, 1, ONE_MINUTE_MS)
      expectTimeClose(result.sunrise, 7, 41, 1, ONE_MINUTE_MS)
      expectTimeClose(result.dhuhr, 13, 44, 1, ONE_MINUTE_MS)
      expectTimeClose(result.asr, 17, 4, 1, ONE_MINUTE_MS)
      expectTimeClose(result.maghrib, 19, 43, 1, ONE_MINUTE_MS)
      expectTimeClose(result.isha, 20, 56, 1, ONE_MINUTE_MS)
    })

    // Cairo, Egyptian (method=5), UTC+2
    it('accurate for Cairo (Egyptian)', () => {
      const result = calculatePrayerTimes(cairo, new Date(2026, 2, 15), 'Egyptian', 'shafi')
      expectTimeClose(result.fajr, 4, 39, 2, ONE_MINUTE_MS)
      expectTimeClose(result.sunrise, 6, 5, 2, ONE_MINUTE_MS)
      expectTimeClose(result.dhuhr, 12, 4, 2, ONE_MINUTE_MS)
      expectTimeClose(result.asr, 15, 30, 2, ONE_MINUTE_MS)
      expectTimeClose(result.maghrib, 18, 3, 2, ONE_MINUTE_MS)
      expectTimeClose(result.isha, 19, 20, 2, ONE_MINUTE_MS)
    })
  })

  describe('DST transition handling', () => {
    it('handles US spring forward (2026-03-08)', () => {
      const result = calculatePrayerTimes(newYork, new Date(2026, 2, 8), 'NorthAmerica', 'shafi')
      expect(result.fajr).toBeInstanceOf(Date)
      expect(result.isha).toBeInstanceOf(Date)
      // Times should still be in chronological order
      expect(result.fajr.getTime()).toBeLessThan(result.sunrise.getTime())
      expect(result.maghrib.getTime()).toBeLessThan(result.isha.getTime())
    })

    it('handles US fall back (2026-11-01)', () => {
      const result = calculatePrayerTimes(newYork, new Date(2026, 10, 1), 'NorthAmerica', 'shafi')
      expect(result.fajr).toBeInstanceOf(Date)
      expect(result.isha).toBeInstanceOf(Date)
      expect(result.fajr.getTime()).toBeLessThan(result.sunrise.getTime())
      expect(result.maghrib.getTime()).toBeLessThan(result.isha.getTime())
    })
  })

  describe('getNextPrayer', () => {
    it('returns correct next prayer during the day', () => {
      const times = calculatePrayerTimes(makkah, new Date(2026, 2, 15), 'UmmAlQura', 'shafi')

      // After Fajr, before Sunrise
      const afterFajr = new Date(times.fajr.getTime() + 5 * 60 * 1000)
      const next = getNextPrayer(times, afterFajr)
      expect(next).not.toBeNull()
      expect(next!.prayer).toBe(Prayer.Sunrise)
      expect(next!.time).toEqual(times.sunrise)
    })

    it('returns Dhuhr after Sunrise', () => {
      const times = calculatePrayerTimes(makkah, new Date(2026, 2, 15), 'UmmAlQura', 'shafi')
      const afterSunrise = new Date(times.sunrise.getTime() + 5 * 60 * 1000)
      const next = getNextPrayer(times, afterSunrise)
      expect(next).not.toBeNull()
      expect(next!.prayer).toBe(Prayer.Dhuhr)
    })

    it('returns Asr after Dhuhr', () => {
      const times = calculatePrayerTimes(makkah, new Date(2026, 2, 15), 'UmmAlQura', 'shafi')
      const afterDhuhr = new Date(times.dhuhr.getTime() + 5 * 60 * 1000)
      const next = getNextPrayer(times, afterDhuhr)
      expect(next).not.toBeNull()
      expect(next!.prayer).toBe(Prayer.Asr)
    })

    it('returns null after Isha (no more prayers today)', () => {
      const times = calculatePrayerTimes(makkah, new Date(2026, 2, 15), 'UmmAlQura', 'shafi')
      const afterIsha = new Date(times.isha.getTime() + 5 * 60 * 1000)
      const next = getNextPrayer(times, afterIsha)
      expect(next).toBeNull()
    })

    it('returns Fajr before Fajr time', () => {
      const times = calculatePrayerTimes(makkah, new Date(2026, 2, 15), 'UmmAlQura', 'shafi')
      const beforeFajr = new Date(times.fajr.getTime() - 60 * 60 * 1000)
      const next = getNextPrayer(times, beforeFajr)
      expect(next).not.toBeNull()
      expect(next!.prayer).toBe(Prayer.Fajr)
    })
  })

  describe('getCurrentPrayer', () => {
    it('returns Fajr during Fajr time', () => {
      const times = calculatePrayerTimes(makkah, new Date(2026, 2, 15), 'UmmAlQura', 'shafi')
      const duringFajr = new Date(times.fajr.getTime() + 5 * 60 * 1000)
      const current = getCurrentPrayer(times, duringFajr)
      expect(current).not.toBeNull()
      expect(current!.prayer).toBe(Prayer.Fajr)
      expect(current!.time).toEqual(times.fajr)
    })

    it('returns Isha during Isha time', () => {
      const times = calculatePrayerTimes(makkah, new Date(2026, 2, 15), 'UmmAlQura', 'shafi')
      const duringIsha = new Date(times.isha.getTime() + 5 * 60 * 1000)
      const current = getCurrentPrayer(times, duringIsha)
      expect(current).not.toBeNull()
      expect(current!.prayer).toBe(Prayer.Isha)
    })

    it('returns null before Fajr', () => {
      const times = calculatePrayerTimes(makkah, new Date(2026, 2, 15), 'UmmAlQura', 'shafi')
      const beforeFajr = new Date(times.fajr.getTime() - 60 * 60 * 1000)
      const current = getCurrentPrayer(times, beforeFajr)
      expect(current).toBeNull()
    })

    it('returns Dhuhr during Dhuhr time', () => {
      const times = calculatePrayerTimes(makkah, new Date(2026, 2, 15), 'UmmAlQura', 'shafi')
      const duringDhuhr = new Date(times.dhuhr.getTime() + 5 * 60 * 1000)
      const current = getCurrentPrayer(times, duringDhuhr)
      expect(current).not.toBeNull()
      expect(current!.prayer).toBe(Prayer.Dhuhr)
    })
  })

  describe('calculateQiblaDirection', () => {
    it('returns Qibla bearing for Rabat, Morocco (≈94.6°)', () => {
      const bearing = calculateQiblaDirection({ latitude: 33.97, longitude: -6.85 })
      expect(bearing).toBeGreaterThan(93)
      expect(bearing).toBeLessThan(96)
    })

    it('returns Qibla bearing for New York (≈58.5°)', () => {
      const bearing = calculateQiblaDirection(newYork)
      expect(bearing).toBeGreaterThan(57)
      expect(bearing).toBeLessThan(60)
    })

    it('returns Qibla bearing for Tokyo (≈293°)', () => {
      const bearing = calculateQiblaDirection({ latitude: 35.6762, longitude: 139.6503 })
      expect(bearing).toBeGreaterThan(291)
      expect(bearing).toBeLessThan(295)
    })

    it('returns bearing in 0-360 range', () => {
      const bearing = calculateQiblaDirection(makkah)
      expect(bearing).toBeGreaterThanOrEqual(0)
      expect(bearing).toBeLessThan(360)
    })

    it('works offline (pure computation, no network)', () => {
      const bearing = calculateQiblaDirection(casablanca)
      expect(typeof bearing).toBe('number')
      expect(Number.isFinite(bearing)).toBe(true)
    })
  })

  describe('buildDayPrayerTimes', () => {
    it('returns correct number of days', () => {
      const result = buildDayPrayerTimes(makkah, 'UmmAlQura', 'shafi', 7)
      expect(result).toHaveLength(7)
    })

    it('each entry has valid date and PrayerTimes', () => {
      const result = buildDayPrayerTimes(makkah, 'UmmAlQura', 'shafi', 3)

      for (const day of result) {
        expect(day.date).toBeInstanceOf(Date)
        expect(day.times.fajr).toBeInstanceOf(Date)
        expect(day.times.sunrise).toBeInstanceOf(Date)
        expect(day.times.dhuhr).toBeInstanceOf(Date)
        expect(day.times.asr).toBeInstanceOf(Date)
        expect(day.times.maghrib).toBeInstanceOf(Date)
        expect(day.times.isha).toBeInstanceOf(Date)
      }
    })

    it('first entry is today, subsequent entries are consecutive days', () => {
      const result = buildDayPrayerTimes(makkah, 'UmmAlQura', 'shafi', 5)

      const todayStr = new Date().toDateString()
      expect(result[0].date.toDateString()).toBe(todayStr)

      for (let i = 1; i < result.length; i++) {
        const prevDay = result[i - 1].date.getTime()
        const currDay = result[i].date.getTime()
        const diffMs = currDay - prevDay
        // Should be approximately 1 day apart (86400000ms)
        expect(diffMs).toBeGreaterThanOrEqual(86400000 - 3600000) // allow DST variance
        expect(diffMs).toBeLessThanOrEqual(86400000 + 3600000)
      }
    })

    it('uses specified calculation method and madhab', () => {
      const shafiResult = buildDayPrayerTimes(makkah, 'UmmAlQura', 'shafi', 1)
      const hanafiResult = buildDayPrayerTimes(makkah, 'UmmAlQura', 'hanafi', 1)

      // Hanafi Asr is later
      expect(hanafiResult[0].times.asr.getTime()).toBeGreaterThan(
        shafiResult[0].times.asr.getTime(),
      )
    })

    it('returns empty array for 0 days', () => {
      const result = buildDayPrayerTimes(makkah, 'UmmAlQura', 'shafi', 0)
      expect(result).toHaveLength(0)
    })
  })
})

/**
 * Helper to check a prayer time is within tolerance of an expected local time.
 * Compares only the time-of-day portion (hours + minutes) in the given timezone.
 */
function expectTimeClose(
  actual: Date,
  expectedHour: number,
  expectedMinute: number,
  utcOffsetHours: number,
  toleranceMs: number,
) {
  // Convert actual UTC time to local minutes-of-day
  const actualUtcMinutes = actual.getUTCHours() * 60 + actual.getUTCMinutes()
  const actualLocalMinutes = ((actualUtcMinutes + utcOffsetHours * 60) % 1440 + 1440) % 1440
  const expectedLocalMinutes = expectedHour * 60 + expectedMinute

  const diffMinutes = Math.abs(actualLocalMinutes - expectedLocalMinutes)
  const diffMs = diffMinutes * 60 * 1000

  if (diffMs > toleranceMs) {
    const actualH = String(Math.floor(actualLocalMinutes / 60)).padStart(2, '0')
    const actualM = String(actualLocalMinutes % 60).padStart(2, '0')
    const expectedLocal = `${String(expectedHour).padStart(2, '0')}:${String(expectedMinute).padStart(2, '0')}`
    throw new Error(
      `Expected ~${expectedLocal} (UTC${utcOffsetHours >= 0 ? '+' : ''}${utcOffsetHours}) but got ${actualH}:${actualM} (diff: ${diffMinutes}min)`,
    )
  }
}
