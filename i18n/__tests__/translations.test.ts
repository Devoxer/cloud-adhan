import ar from '../ar.json'
import en from '../en.json'

function flattenKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'object' && value !== null) {
      return flattenKeys(value as Record<string, unknown>, fullKey)
    }
    return [fullKey]
  })
}

const enKeys = flattenKeys(en).sort()
const arKeys = flattenKeys(ar).sort()

describe('translation files', () => {
  it('en.json and ar.json have identical key sets', () => {
    expect(enKeys).toEqual(arKeys)
  })

  it('contains all required namespaces', () => {
    const namespaces = [
      'prayer',
      'tab',
      'screen',
      'settings',
      'common',
      'error',
      'countdown',
      'timeline',
      'permission',
      'home',
      'date',
    ]
    for (const ns of namespaces) {
      expect(enKeys.some((k) => k.startsWith(`${ns}.`))).toBe(true)
    }
  })

  it('contains all prayer names', () => {
    const prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']
    for (const p of prayers) {
      expect(en.prayer).toHaveProperty(p)
      expect(ar.prayer).toHaveProperty(p)
    }
  })

  it('contains all tab labels', () => {
    expect(en.tab).toEqual({ home: 'Home', qibla: 'Qibla', settings: 'Settings' })
  })

  it('Arabic prayer names are proper Arabic', () => {
    expect(ar.prayer.fajr).toBe('الفجر')
    expect(ar.prayer.sunrise).toBe('الشروق')
    expect(ar.prayer.dhuhr).toBe('الظهر')
    expect(ar.prayer.asr).toBe('العصر')
    expect(ar.prayer.maghrib).toBe('المغرب')
    expect(ar.prayer.isha).toBe('العشاء')
  })

  it('Arabic tab labels are proper Arabic', () => {
    expect(ar.tab.home).toBe('الرئيسية')
    expect(ar.tab.qibla).toBe('القبلة')
    expect(ar.tab.settings).toBe('الإعدادات')
  })

  it('no empty translation values in en.json', () => {
    for (const key of enKeys) {
      const parts = key.split('.')
      let value: unknown = en
      for (const part of parts) {
        value = (value as Record<string, unknown>)[part]
      }
      expect(value).not.toBe('')
    }
  })

  it('no empty translation values in ar.json', () => {
    for (const key of arKeys) {
      const parts = key.split('.')
      let value: unknown = ar
      for (const part of parts) {
        value = (value as Record<string, unknown>)[part]
      }
      expect(value).not.toBe('')
    }
  })
})
