import { renderHook } from '@testing-library/react-native'

import { usePrayerTimes, useMultiDayPrayerTimes } from '@/hooks/usePrayerTimes'
import { buildDayPrayerTimes, calculatePrayerTimes } from '@/services/prayer'
import type { PrayerTimes } from '@/types/prayer'

// Mock Reanimated (needed if any downstream hook uses it)
jest.mock('react-native-reanimated', () => ({
  useReducedMotion: jest.fn(() => false),
  useSharedValue: jest.fn((initial: number) => ({ value: initial })),
  useAnimatedStyle: jest.fn(() => ({})),
  withTiming: jest.fn((value: number) => value),
  default: {
    Text: 'Animated.Text',
  },
}))

const mockCoordinates = { latitude: 21.4225, longitude: 39.8262 }

jest.mock('@/stores/location', () => ({
  useLocationStore: jest.fn((selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      coordinates: mockCoordinates,
      cityName: 'Makkah',
      source: 'gps',
      lastUpdated: null,
    }),
  ),
}))

jest.mock('@/stores/settings', () => ({
  useSettingsStore: jest.fn((selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      calculationMethod: 'UmmAlQura',
      madhab: 'shafi',
      prayerAdjustments: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
    }),
  ),
}))

const mockPrayerTimes: PrayerTimes = {
  fajr: new Date('2026-03-15T02:14:00Z'),
  sunrise: new Date('2026-03-15T03:30:00Z'),
  dhuhr: new Date('2026-03-15T09:30:00Z'),
  asr: new Date('2026-03-15T12:53:00Z'),
  maghrib: new Date('2026-03-15T15:30:00Z'),
  isha: new Date('2026-03-15T17:00:00Z'),
}

const mockDayPrayerTimes = Array.from({ length: 13 }, (_, i) => ({
  date: new Date(`2026-03-${String(15 + i).padStart(2, '0')}T00:00:00Z`),
  times: mockPrayerTimes,
}))

jest.mock('@/services/prayer', () => ({
  calculatePrayerTimes: jest.fn(() => mockPrayerTimes),
  buildDayPrayerTimes: jest.fn(() => mockDayPrayerTimes),
  getNextPrayer: jest.fn(),
}))

const mockedCalculate = calculatePrayerTimes as jest.MockedFunction<typeof calculatePrayerTimes>
const mockedBuildDays = buildDayPrayerTimes as jest.MockedFunction<typeof buildDayPrayerTimes>

describe('hooks/usePrayerTimes', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-03-15T12:00:00Z'))
    mockedCalculate.mockReturnValue(mockPrayerTimes)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns PrayerTimes when coordinates are available', () => {
    const { result } = renderHook(() => usePrayerTimes())

    expect(result.current).not.toBeNull()
    expect(result.current?.fajr).toEqual(mockPrayerTimes.fajr)
    expect(result.current?.dhuhr).toEqual(mockPrayerTimes.dhuhr)
    expect(result.current?.isha).toEqual(mockPrayerTimes.isha)
  })

  it('returns null when coordinates are null', () => {
    const { useLocationStore } = require('@/stores/location')
    ;(useLocationStore as jest.Mock).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) =>
        selector({
          coordinates: null,
          cityName: null,
          source: 'gps',
          lastUpdated: null,
        }),
    )

    const { result } = renderHook(() => usePrayerTimes())
    expect(result.current).toBeNull()

    // Restore
    ;(useLocationStore as jest.Mock).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) =>
        selector({
          coordinates: mockCoordinates,
          cityName: 'Makkah',
          source: 'gps',
          lastUpdated: null,
        }),
    )
  })

  it('recalculates when settings change', () => {
    const altPrayerTimes: PrayerTimes = {
      fajr: new Date('2026-03-15T02:20:00Z'),
      sunrise: new Date('2026-03-15T03:35:00Z'),
      dhuhr: new Date('2026-03-15T09:30:00Z'),
      asr: new Date('2026-03-15T13:10:00Z'),
      maghrib: new Date('2026-03-15T15:30:00Z'),
      isha: new Date('2026-03-15T17:05:00Z'),
    }

    mockedCalculate.mockReturnValue(mockPrayerTimes)

    const { result, rerender } = renderHook(() => usePrayerTimes())
    expect(result.current?.asr).toEqual(mockPrayerTimes.asr)

    // Simulate settings change by updating mock
    const { useSettingsStore } = require('@/stores/settings')
    ;(useSettingsStore as jest.Mock).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) =>
        selector({
          calculationMethod: 'Egyptian',
          madhab: 'hanafi',
          prayerAdjustments: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
        }),
    )
    mockedCalculate.mockReturnValue(altPrayerTimes)

    rerender({})
    expect(result.current?.asr).toEqual(altPrayerTimes.asr)

    // Restore
    ;(useSettingsStore as jest.Mock).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) =>
        selector({
          calculationMethod: 'UmmAlQura',
          madhab: 'shafi',
          prayerAdjustments: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
        }),
    )
  })

  it('calls calculatePrayerTimes with correct parameters including prayerAdjustments', () => {
    renderHook(() => usePrayerTimes())

    expect(mockedCalculate).toHaveBeenCalledWith(
      mockCoordinates,
      expect.any(Date),
      'UmmAlQura',
      'shafi',
      expect.objectContaining({ fajr: 0, dhuhr: 0 }),
    )
  })

  it('accepts an optional date parameter', () => {
    const customDate = new Date('2026-03-20T00:00:00Z')
    renderHook(() => usePrayerTimes(customDate))

    expect(mockedCalculate).toHaveBeenCalledWith(
      mockCoordinates,
      expect.any(Date),
      'UmmAlQura',
      'shafi',
      expect.objectContaining({ fajr: 0, dhuhr: 0 }),
    )
  })
})

describe('hooks/useMultiDayPrayerTimes', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-03-15T12:00:00Z'))
    mockedBuildDays.mockReturnValue(mockDayPrayerTimes)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns DayPrayerTimes[] with correct number of entries', () => {
    const { result } = renderHook(() => useMultiDayPrayerTimes(13))

    expect(result.current).not.toBeNull()
    expect(result.current).toHaveLength(13)
  })

  it('calls buildDayPrayerTimes with correct parameters including prayerAdjustments', () => {
    renderHook(() => useMultiDayPrayerTimes(13))

    expect(mockedBuildDays).toHaveBeenCalledWith(
      mockCoordinates,
      'UmmAlQura',
      'shafi',
      13,
      expect.objectContaining({ fajr: 0, dhuhr: 0 }),
    )
  })

  it('returns null when coordinates are null', () => {
    const { useLocationStore } = require('@/stores/location')
    ;(useLocationStore as jest.Mock).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) =>
        selector({
          coordinates: null,
          cityName: null,
          source: 'gps',
          lastUpdated: null,
        }),
    )

    const { result } = renderHook(() => useMultiDayPrayerTimes(13))
    expect(result.current).toBeNull()

    // Restore
    ;(useLocationStore as jest.Mock).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) =>
        selector({
          coordinates: mockCoordinates,
          cityName: 'Makkah',
          source: 'gps',
          lastUpdated: null,
        }),
    )
  })

  it('memoizes result for same inputs', () => {
    const { result, rerender } = renderHook(() => useMultiDayPrayerTimes(13))

    const first = result.current
    rerender({})
    const second = result.current

    expect(first).toBe(second)
  })
})
