import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import {
  type CalculationMethod,
  type Language,
  type Madhab,
  type NotificationSettings,
  Prayer,
} from '@/types/prayer'
import { mmkvStorage } from '@/utils/storage'

type SettingsState = {
  calculationMethod: CalculationMethod
  madhab: Madhab
  language: Language
  arabicNumerals: boolean
  notifications: NotificationSettings
  athanSound: string
  fajrSound: string
  setCalculationMethod: (method: CalculationMethod) => void
  setMadhab: (madhab: Madhab) => void
  setLanguage: (language: Language) => void
  setArabicNumerals: (enabled: boolean) => void
  setNotifications: (notifications: NotificationSettings) => void
  setAthanSound: (sound: string) => void
  setFajrSound: (sound: string) => void
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
      athanSound: 'makkah',
      fajrSound: 'fajr-makkah',
      setCalculationMethod: (method) => set({ calculationMethod: method }),
      setMadhab: (madhab) => set({ madhab }),
      setLanguage: (language) => set({ language }),
      setArabicNumerals: (enabled) => set({ arabicNumerals: enabled }),
      setNotifications: (notifications) => set({ notifications }),
      setAthanSound: (sound) => set({ athanSound: sound }),
      setFajrSound: (sound) => set({ fajrSound: sound }),
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
)
