import {
  Prayer,
  type CalculationMethod,
  type Madhab,
  type Language,
  type NotifiablePrayer,
  type NotificationSettings,
  type PrayerTimes,
  type Coordinates,
  type PrayerTimeInfo,
} from '@/types/prayer'

describe('types/prayer', () => {
  describe('existing types preserved', () => {
    it('Prayer enum has all 6 values', () => {
      expect(Prayer.Fajr).toBe('fajr')
      expect(Prayer.Sunrise).toBe('sunrise')
      expect(Prayer.Dhuhr).toBe('dhuhr')
      expect(Prayer.Asr).toBe('asr')
      expect(Prayer.Maghrib).toBe('maghrib')
      expect(Prayer.Isha).toBe('isha')
    })

    it('CalculationMethod type accepts valid methods', () => {
      const method: CalculationMethod = 'MuslimWorldLeague'
      expect(method).toBe('MuslimWorldLeague')
    })

    it('Madhab type accepts valid values', () => {
      const madhab: Madhab = 'shafi'
      expect(madhab).toBe('shafi')
    })

    it('Language type accepts valid values', () => {
      const lang: Language = 'en'
      expect(lang).toBe('en')
    })

    it('NotifiablePrayer excludes Sunrise', () => {
      const prayer: NotifiablePrayer = Prayer.Fajr
      expect(prayer).toBe('fajr')
    })

    it('NotificationSettings maps notifiable prayers to booleans', () => {
      const settings: NotificationSettings = {
        [Prayer.Fajr]: true,
        [Prayer.Dhuhr]: true,
        [Prayer.Asr]: false,
        [Prayer.Maghrib]: true,
        [Prayer.Isha]: true,
      }
      expect(settings[Prayer.Fajr]).toBe(true)
    })
  })

  describe('PrayerTimes interface', () => {
    it('has all 6 prayer times as Date objects', () => {
      const now = new Date()
      const times: PrayerTimes = {
        fajr: now,
        sunrise: now,
        dhuhr: now,
        asr: now,
        maghrib: now,
        isha: now,
      }
      expect(times.fajr).toBeInstanceOf(Date)
      expect(times.sunrise).toBeInstanceOf(Date)
      expect(times.dhuhr).toBeInstanceOf(Date)
      expect(times.asr).toBeInstanceOf(Date)
      expect(times.maghrib).toBeInstanceOf(Date)
      expect(times.isha).toBeInstanceOf(Date)
    })
  })

  describe('Coordinates type', () => {
    it('has latitude and longitude as numbers', () => {
      const coords: Coordinates = { latitude: 21.4225, longitude: 39.8262 }
      expect(coords.latitude).toBe(21.4225)
      expect(coords.longitude).toBe(39.8262)
    })

    it('matches existing stores/location.ts shape', () => {
      const coords: Coordinates = { latitude: 0, longitude: 0 }
      expect(typeof coords.latitude).toBe('number')
      expect(typeof coords.longitude).toBe('number')
    })
  })

  describe('PrayerTimeInfo type', () => {
    it('has prayer and time fields', () => {
      const info: PrayerTimeInfo = {
        prayer: Prayer.Fajr,
        time: new Date(),
      }
      expect(info.prayer).toBe(Prayer.Fajr)
      expect(info.time).toBeInstanceOf(Date)
    })
  })
})
