import { Prayer } from '@/types/prayer'

// Mock react-native-mmkv
let mockMmkvStore: Record<string, string> = {}
jest.mock('react-native-mmkv', () => ({
  createMMKV: jest.fn(() => ({
    getString: (key: string) => mockMmkvStore[key] ?? undefined,
    set: (key: string, value: string) => {
      mockMmkvStore[key] = value
    },
    remove: (key: string) => {
      delete mockMmkvStore[key]
    },
  })),
}))

// Mock region util
jest.mock('@/utils/region', () => ({
  getRecommendedMethod: jest.fn(() => 'MuslimWorldLeague'),
}))

describe('stores/settings', () => {
  beforeEach(() => {
    mockMmkvStore = {}
    jest.resetModules()
  })

  function getStore() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { useSettingsStore } = require('@/stores/settings')
    return useSettingsStore as {
      getState: () => {
        prayerSounds: Record<string, string>
        calculationMethod: string
        prayerAdjustments: Record<string, number>
        reminders: Record<string, { enabled: boolean; minutes: number }>
        elevationRule: string
        setPrayerSound: (prayer: string, soundId: string) => void
        setPrayerAdjustment: (prayer: string, minutes: number) => void
        resetPrayerAdjustments: () => void
        setReminderEnabled: (prayer: string, enabled: boolean) => void
        setReminderMinutes: (prayer: string, minutes: number) => void
        setElevationRule: (rule: string) => void
      }
    }
  }

  describe('default values', () => {
    it('has prayerSounds with makkah defaults for all prayers', () => {
      const store = getStore()
      const state = store.getState()
      expect(state.prayerSounds).toEqual({
        fajr: 'makkah',
        dhuhr: 'makkah',
        asr: 'makkah',
        maghrib: 'makkah',
        isha: 'makkah',
      })
    })

    it('does not have athanSound or fajrSound fields', () => {
      const store = getStore()
      const state = store.getState() as Record<string, unknown>
      expect('athanSound' in state).toBe(false)
      expect('fajrSound' in state).toBe(false)
    })
  })

  describe('prayerAdjustments defaults', () => {
    it('has prayerAdjustments with all-zero defaults', () => {
      const store = getStore()
      const state = store.getState()
      expect(state.prayerAdjustments).toEqual({
        fajr: 0,
        sunrise: 0,
        dhuhr: 0,
        asr: 0,
        maghrib: 0,
        isha: 0,
      })
    })

    it('has elevationRule defaulting to seaLevel', () => {
      const store = getStore()
      const state = store.getState()
      expect(state.elevationRule).toBe('seaLevel')
    })
  })

  describe('reminders defaults', () => {
    it('has reminders with all disabled and 15-minute defaults', () => {
      const store = getStore()
      const state = store.getState()
      expect(state.reminders).toEqual({
        fajr: { enabled: false, minutes: 15 },
        dhuhr: { enabled: false, minutes: 15 },
        asr: { enabled: false, minutes: 15 },
        maghrib: { enabled: false, minutes: 15 },
        isha: { enabled: false, minutes: 15 },
      })
    })
  })

  describe('setReminderEnabled', () => {
    it('toggles individual prayer reminder', () => {
      const store = getStore()
      store.getState().setReminderEnabled(Prayer.Fajr, true)
      expect(store.getState().reminders.fajr.enabled).toBe(true)
      // Other prayers remain unchanged
      expect(store.getState().reminders.dhuhr.enabled).toBe(false)
    })
  })

  describe('setReminderMinutes', () => {
    it('updates individual prayer offset', () => {
      const store = getStore()
      store.getState().setReminderMinutes(Prayer.Fajr, 10)
      expect(store.getState().reminders.fajr.minutes).toBe(10)
      // Other prayers remain unchanged
      expect(store.getState().reminders.dhuhr.minutes).toBe(15)
    })

    it('reminder state is independent per prayer', () => {
      const store = getStore()
      store.getState().setReminderEnabled(Prayer.Fajr, true)
      store.getState().setReminderMinutes(Prayer.Fajr, 5)
      store.getState().setReminderEnabled(Prayer.Isha, true)
      store.getState().setReminderMinutes(Prayer.Isha, 30)

      expect(store.getState().reminders.fajr).toEqual({ enabled: true, minutes: 5 })
      expect(store.getState().reminders.isha).toEqual({ enabled: true, minutes: 30 })
      expect(store.getState().reminders.dhuhr).toEqual({ enabled: false, minutes: 15 })
    })
  })

  describe('setPrayerAdjustment', () => {
    it('updates individual prayer adjustment', () => {
      const store = getStore()
      store.getState().setPrayerAdjustment(Prayer.Fajr, 5)
      expect(store.getState().prayerAdjustments.fajr).toBe(5)
      // Other prayers remain unchanged
      expect(store.getState().prayerAdjustments.dhuhr).toBe(0)
    })

    it('clamps value to [-30, 30] range', () => {
      const store = getStore()
      store.getState().setPrayerAdjustment(Prayer.Fajr, 50)
      expect(store.getState().prayerAdjustments.fajr).toBe(30)

      store.getState().setPrayerAdjustment(Prayer.Fajr, -50)
      expect(store.getState().prayerAdjustments.fajr).toBe(-30)
    })
  })

  describe('resetPrayerAdjustments', () => {
    it('resets all adjustments to zero', () => {
      const store = getStore()
      store.getState().setPrayerAdjustment(Prayer.Fajr, 10)
      store.getState().setPrayerAdjustment(Prayer.Isha, -5)
      store.getState().resetPrayerAdjustments()
      expect(store.getState().prayerAdjustments).toEqual({
        fajr: 0,
        sunrise: 0,
        dhuhr: 0,
        asr: 0,
        maghrib: 0,
        isha: 0,
      })
    })
  })

  describe('setElevationRule', () => {
    it('updates elevation rule', () => {
      const store = getStore()
      store.getState().setElevationRule('automatic')
      expect(store.getState().elevationRule).toBe('automatic')
    })
  })

  describe('setPrayerSound', () => {
    it('updates individual prayer sound', () => {
      const store = getStore()
      store.getState().setPrayerSound(Prayer.Fajr, 'madinah')
      expect(store.getState().prayerSounds.fajr).toBe('madinah')
      // Other prayers remain unchanged
      expect(store.getState().prayerSounds.dhuhr).toBe('makkah')
    })

    it('updates multiple prayers independently', () => {
      const store = getStore()
      store.getState().setPrayerSound(Prayer.Fajr, 'fajr-makkah')
      store.getState().setPrayerSound(Prayer.Isha, 'alaqsa')
      expect(store.getState().prayerSounds).toEqual({
        fajr: 'fajr-makkah',
        dhuhr: 'makkah',
        asr: 'makkah',
        maghrib: 'makkah',
        isha: 'alaqsa',
      })
    })
  })

  describe('migration from old athanSound/fajrSound format', () => {
    it('migrates old format to prayerSounds on rehydration', () => {
      // Simulate old zustand persist format with { state: {...}, version: 0 }
      const oldState = {
        state: {
          calculationMethod: 'Morocco',
          madhab: 'shafi',
          language: 'en',
          arabicNumerals: false,
          notifications: {
            fajr: true,
            dhuhr: true,
            asr: true,
            maghrib: true,
            isha: true,
          },
          athanSound: 'alaqsa',
          fajrSound: 'fajr-mishary',
        },
        version: 0,
      }
      mockMmkvStore.settings = JSON.stringify(oldState)

      const store = getStore()
      const state = store.getState()

      // After migration, prayerSounds should reflect old values
      expect(state.prayerSounds.fajr).toBe('fajr-mishary')
      expect(state.prayerSounds.dhuhr).toBe('alaqsa')
      expect(state.prayerSounds.asr).toBe('alaqsa')
      expect(state.prayerSounds.maghrib).toBe('alaqsa')
      expect(state.prayerSounds.isha).toBe('alaqsa')
    })

    it('does not migrate when prayerSounds already exists in stored state', () => {
      const newState = {
        state: {
          calculationMethod: 'Morocco',
          madhab: 'shafi',
          language: 'en',
          arabicNumerals: false,
          notifications: {
            fajr: true,
            dhuhr: true,
            asr: true,
            maghrib: true,
            isha: true,
          },
          prayerSounds: {
            fajr: 'mishary',
            dhuhr: 'madinah',
            asr: 'madinah',
            maghrib: 'madinah',
            isha: 'madinah',
          },
        },
        version: 0,
      }
      mockMmkvStore.settings = JSON.stringify(newState)

      const store = getStore()
      const state = store.getState()

      // Should keep existing prayerSounds, not overwrite
      expect(state.prayerSounds.fajr).toBe('mishary')
      expect(state.prayerSounds.dhuhr).toBe('madinah')
    })
  })
})
