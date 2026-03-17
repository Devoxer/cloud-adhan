import { formatNumber, formatTime } from '../format'

describe('formatNumber', () => {
  it('returns Western digits when useArabicNumerals is false', () => {
    expect(formatNumber(123, false)).toBe('123')
    expect(formatNumber('456', false)).toBe('456')
  })

  it('converts Western digits to Arabic-Indic when useArabicNumerals is true', () => {
    expect(formatNumber(0, true)).toBe('٠')
    expect(formatNumber(123, true)).toBe('١٢٣')
    expect(formatNumber(9876543210, true)).toBe('٩٨٧٦٥٤٣٢١٠')
  })

  it('converts string input with digits', () => {
    expect(formatNumber('12:30', true)).toBe('١٢:٣٠')
    expect(formatNumber('12:30 PM', true)).toBe('١٢:٣٠ PM')
  })

  it('preserves non-digit characters', () => {
    expect(formatNumber('abc', true)).toBe('abc')
    expect(formatNumber('1-2-3', true)).toBe('١-٢-٣')
  })

  it('is a pure function with no side effects', () => {
    const result1 = formatNumber(42, true)
    const result2 = formatNumber(42, true)
    expect(result1).toBe(result2)
  })
})

describe('formatTime', () => {
  const testDate = new Date(2026, 2, 15, 14, 30, 0) // 2:30 PM

  it('formats time in 12-hour format by default', () => {
    expect(formatTime(testDate)).toBe('2:30 PM')
  })

  it('formats time in 24-hour format when use24Hour is true', () => {
    expect(formatTime(testDate, true)).toBe('14:30')
  })

  it('converts digits and AM/PM to Arabic when useArabicNumerals is true', () => {
    const result = formatTime(testDate, false, true)
    expect(result).toBe('٢:٣٠ م')
  })

  it('supports 24-hour with Arabic numerals (no AM/PM)', () => {
    const result = formatTime(testDate, true, true)
    expect(result).toBe('١٤:٣٠')
  })

  it('converts AM to Arabic marker', () => {
    const morning = new Date(2026, 2, 15, 9, 15, 0)
    expect(formatTime(morning, false, true)).toBe('٩:١٥ ص')
  })

  it('handles midnight correctly', () => {
    const midnight = new Date(2026, 2, 15, 0, 0, 0)
    expect(formatTime(midnight)).toBe('12:00 AM')
    expect(formatTime(midnight, true)).toBe('00:00')
  })

  it('is a pure function', () => {
    const r1 = formatTime(testDate)
    const r2 = formatTime(testDate)
    expect(r1).toBe(r2)
  })
})
