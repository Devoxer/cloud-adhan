import { getLocales } from 'expo-localization'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import { mmkv } from '@/utils/storage'

import ar from './ar.json'
import en from './en.json'

const languageDetector = {
  type: 'languageDetector' as const,
  detect: (): string => {
    // 1. Try persisted language from MMKV settings store
    try {
      const raw = mmkv.getString('settings')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.state?.language) return parsed.state.language
      }
    } catch {
      // Fall through to device detection
    }
    // 2. Fall back to device locale
    const deviceLang = getLocales()[0]?.languageCode ?? 'en'
    return deviceLang.startsWith('ar') ? 'ar' : 'en'
  },
  init: () => {},
  cacheUserLanguage: () => {},
}

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, ar: { translation: ar } },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
  })

export default i18n
