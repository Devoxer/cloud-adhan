import en from '@/i18n/en.json'
import ar from '@/i18n/ar.json'

describe('i18n/translations', () => {
  it('en.json and ar.json have identical top-level keys', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(ar).sort())
  })

  it('all nested keys in en.json exist in ar.json', () => {
    for (const [section, values] of Object.entries(en)) {
      const arSection = ar[section as keyof typeof ar]
      expect(arSection).toBeDefined()
      for (const key of Object.keys(values)) {
        expect((arSection as Record<string, string>)[key]).toBeDefined()
      }
    }
  })

})
