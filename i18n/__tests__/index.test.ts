import i18n from '../index'

// Mock MMKV
jest.mock('@/utils/storage', () => ({
  mmkv: {
    getString: jest.fn(() => undefined),
  },
}))

// Mock expo-localization
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'en' }]),
}))

describe('i18n configuration', () => {
  it('initializes i18next successfully', () => {
    expect(i18n.isInitialized).toBe(true)
  })

  it('has English as fallback language', () => {
    expect(i18n.options.fallbackLng).toEqual(['en'])
  })

  it('has escapeValue disabled', () => {
    expect(i18n.options.interpolation?.escapeValue).toBe(false)
  })

  it('translates English prayer names', () => {
    expect(i18n.t('prayer.fajr')).toBe('Fajr')
    expect(i18n.t('prayer.dhuhr')).toBe('Dhuhr')
    expect(i18n.t('prayer.maghrib')).toBe('Maghrib')
  })

  it('translates English tab labels', () => {
    expect(i18n.t('tab.home')).toBe('Home')
    expect(i18n.t('tab.qibla')).toBe('Qibla')
    expect(i18n.t('tab.settings')).toBe('Settings')
  })

  it('translates Arabic prayer names when language is ar', async () => {
    await i18n.changeLanguage('ar')
    expect(i18n.t('prayer.fajr')).toBe('الفجر')
    expect(i18n.t('prayer.isha')).toBe('العشاء')
    await i18n.changeLanguage('en')
  })

  it('supports interpolation', () => {
    expect(i18n.t('common.prayerTimeIn', { prayer: 'Fajr' })).toBe('Fajr in')
  })
})

describe('language detector', () => {
  const { mmkv } = jest.requireMock('@/utils/storage') as {
    mmkv: { getString: jest.Mock }
  }
  const { getLocales } = jest.requireMock('expo-localization') as {
    getLocales: jest.Mock
  }

  beforeEach(() => {
    mmkv.getString.mockReset()
    getLocales.mockReset()
    getLocales.mockReturnValue([{ languageCode: 'en' }])
  })

  it('reads persisted language from MMKV', () => {
    mmkv.getString.mockReturnValue(JSON.stringify({ state: { language: 'ar' }, version: 0 }))
    // Re-detect by calling detect directly
    const detector = (i18n.services as unknown as Record<string, unknown>).languageDetector as {
      detect: () => string
    }
    expect(detector.detect()).toBe('ar')
  })

  it('falls back to device locale when MMKV is empty', () => {
    mmkv.getString.mockReturnValue(undefined)
    getLocales.mockReturnValue([{ languageCode: 'ar' }])
    const detector = (i18n.services as unknown as Record<string, unknown>).languageDetector as {
      detect: () => string
    }
    expect(detector.detect()).toBe('ar')
  })

  it('defaults to en for non-Arabic device locales', () => {
    mmkv.getString.mockReturnValue(undefined)
    getLocales.mockReturnValue([{ languageCode: 'fr' }])
    const detector = (i18n.services as unknown as Record<string, unknown>).languageDetector as {
      detect: () => string
    }
    expect(detector.detect()).toBe('en')
  })

  it('handles malformed MMKV data gracefully', () => {
    mmkv.getString.mockReturnValue('not-valid-json')
    getLocales.mockReturnValue([{ languageCode: 'en' }])
    const detector = (i18n.services as unknown as Record<string, unknown>).languageDetector as {
      detect: () => string
    }
    expect(detector.detect()).toBe('en')
  })
})
