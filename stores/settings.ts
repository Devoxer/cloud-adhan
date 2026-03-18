import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { DEFAULT_PRAYER_SOUNDS, type PrayerSounds } from '@/constants/sounds'
import {
  type CalculationMethod,
  DEFAULT_PRAYER_ADJUSTMENTS,
  DEFAULT_REMINDER_SETTINGS,
  type Language,
  type Madhab,
  type NotifiablePrayer,
  type NotificationSettings,
  Prayer,
  type PrayerAdjustments,
  type ReminderSettings,
} from '@/types/prayer'
import { getRecommendedMethod } from '@/utils/region'
import { mmkv, mmkvStorage } from '@/utils/storage'

type SettingsState = {
  calculationMethod: CalculationMethod
  madhab: Madhab
  language: Language
  arabicNumerals: boolean
  notifications: NotificationSettings
  prayerSounds: PrayerSounds
  prayerAdjustments: PrayerAdjustments
  reminders: ReminderSettings
  elevationRule: 'automatic' | 'seaLevel'
  setCalculationMethod: (method: CalculationMethod) => void
  setMadhab: (madhab: Madhab) => void
  setLanguage: (language: Language) => void
  setArabicNumerals: (enabled: boolean) => void
  setNotifications: (notifications: NotificationSettings) => void
  setPrayerSound: (prayer: NotifiablePrayer, soundId: string) => void
  setPrayerAdjustment: (prayer: Prayer, minutes: number) => void
  resetPrayerAdjustments: () => void
  setReminderEnabled: (prayer: NotifiablePrayer, enabled: boolean) => void
  setReminderMinutes: (prayer: NotifiablePrayer, minutes: number) => void
  setElevationRule: (rule: 'automatic' | 'seaLevel') => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      calculationMethod: 'NorthAmerica',
      madhab: 'shafi',
      language: 'en',
      arabicNumerals: false,
      notifications: {
        [Prayer.Fajr]: true,
        [Prayer.Dhuhr]: true,
        [Prayer.Asr]: true,
        [Prayer.Maghrib]: true,
        [Prayer.Isha]: true,
      },
      prayerSounds: { ...DEFAULT_PRAYER_SOUNDS },
      prayerAdjustments: { ...DEFAULT_PRAYER_ADJUSTMENTS },
      reminders: { ...DEFAULT_REMINDER_SETTINGS },
      elevationRule: 'seaLevel',
      setPrayerSound: (prayer, soundId) =>
        set((state) => ({
          prayerSounds: { ...state.prayerSounds, [prayer]: soundId },
        })),
      setPrayerAdjustment: (prayer, minutes) =>
        set((state) => ({
          prayerAdjustments: {
            ...state.prayerAdjustments,
            [prayer]: Math.max(-30, Math.min(30, minutes)),
          },
        })),
      resetPrayerAdjustments: () => set({ prayerAdjustments: { ...DEFAULT_PRAYER_ADJUSTMENTS } }),
      setReminderEnabled: (prayer, enabled) =>
        set((state) => ({
          reminders: {
            ...state.reminders,
            [prayer]: { ...state.reminders[prayer], enabled },
          },
        })),
      setReminderMinutes: (prayer, minutes) =>
        set((state) => ({
          reminders: {
            ...state.reminders,
            [prayer]: { ...state.reminders[prayer], minutes },
          },
        })),
      setElevationRule: (rule) => set({ elevationRule: rule }),
      setCalculationMethod: (method) => set({ calculationMethod: method }),
      setMadhab: (madhab) => set({ madhab }),
      setLanguage: (language) => set({ language }),
      setArabicNumerals: (enabled) => set({ arabicNumerals: enabled }),
      setNotifications: (notifications) => set({ notifications }),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => mmkvStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return

        // Migrate old athanSound/fajrSound to prayerSounds
        const raw = mmkv.getString('settings')
        if (raw) {
          try {
            const parsed = JSON.parse(raw)
            // Zustand persist wraps state in { state: {...}, version: N }
            const storedState = parsed.state ?? parsed
            if ('athanSound' in storedState && !('prayerSounds' in storedState)) {
              const oldAthan = storedState.athanSound ?? 'makkah'
              const oldFajr = storedState.fajrSound ?? 'fajr-makkah'
              state.setPrayerSound(Prayer.Fajr, oldFajr)
              state.setPrayerSound(Prayer.Dhuhr, oldAthan)
              state.setPrayerSound(Prayer.Asr, oldAthan)
              state.setPrayerSound(Prayer.Maghrib, oldAthan)
              state.setPrayerSound(Prayer.Isha, oldAthan)
            }
          } catch {
            // Ignore parse errors
          }
        }

        // Existing migration: calculationMethod 'Other' → recommended
        if ((state.calculationMethod as string) === 'Other') {
          try {
            const locationJson = mmkv.getString('location')
            if (locationJson) {
              const { state: locationState } = JSON.parse(locationJson)
              if (locationState?.coordinates) {
                const { latitude, longitude } = locationState.coordinates
                state.setCalculationMethod(getRecommendedMethod(latitude, longitude))
                return
              }
            }
          } catch {
            // Fall through to default
          }
          state.setCalculationMethod('MuslimWorldLeague')
        }
      },
    },
  ),
)
