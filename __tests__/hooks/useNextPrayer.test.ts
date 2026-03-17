import { renderHook, act } from '@testing-library/react-native'

import { useNextPrayer } from '@/hooks/useNextPrayer'
import { calculatePrayerTimes, getNextPrayer } from '@/services/prayer'
import { Prayer } from '@/types/prayer'
import type { PrayerTimes, PrayerTimeInfo } from '@/types/prayer'

// Mock Reanimated
jest.mock('react-native-reanimated', () => ({
  useReducedMotion: jest.fn(() => false),
  useSharedValue: jest.fn((initial: number) => ({ value: initial })),
  useAnimatedStyle: jest.fn(() => ({})),
  withTiming: jest.fn((value: number) => value),
  default: {
    Text: 'Animated.Text',
  },
}))

// Mock stores
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
    }),
  ),
}))

// Build mock prayer times for the test date
const testDate = new Date('2026-03-15T06:00:00Z')
const mockPrayerTimes: PrayerTimes = {
  fajr: new Date('2026-03-15T02:14:00Z'),
  sunrise: new Date('2026-03-15T03:30:00Z'),
  dhuhr: new Date('2026-03-15T09:30:00Z'),
  asr: new Date('2026-03-15T12:53:00Z'),
  maghrib: new Date('2026-03-15T15:30:00Z'),
  isha: new Date('2026-03-15T17:00:00Z'),
}

// Mock the prayer service
jest.mock('@/services/prayer', () => ({
  calculatePrayerTimes: jest.fn(() => mockPrayerTimes),
  getNextPrayer: jest.fn(),
}))

const mockedGetNextPrayer = getNextPrayer as jest.MockedFunction<typeof getNextPrayer>
const mockedCalculate = calculatePrayerTimes as jest.MockedFunction<typeof calculatePrayerTimes>

describe('hooks/useNextPrayer', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(testDate)
    mockedCalculate.mockReturnValue(mockPrayerTimes)
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('returns correct next prayer at various times of day', () => {
    const expectedNext: PrayerTimeInfo = { prayer: Prayer.Dhuhr, time: mockPrayerTimes.dhuhr }
    mockedGetNextPrayer.mockReturnValue(expectedNext)

    const { result } = renderHook(() => useNextPrayer())

    expect(result.current).not.toBeNull()
    expect(result.current?.prayer).toBe(Prayer.Dhuhr)
    expect(result.current?.time).toEqual(mockPrayerTimes.dhuhr)
  })

  it('transitions to next prayer when current prayer time passes', () => {
    // Initially Dhuhr is next
    const dhuhrNext: PrayerTimeInfo = { prayer: Prayer.Dhuhr, time: mockPrayerTimes.dhuhr }
    const asrNext: PrayerTimeInfo = { prayer: Prayer.Asr, time: mockPrayerTimes.asr }
    mockedGetNextPrayer.mockReturnValue(dhuhrNext)

    const { result } = renderHook(() => useNextPrayer())
    expect(result.current?.prayer).toBe(Prayer.Dhuhr)

    // Simulate time passing Dhuhr
    mockedGetNextPrayer.mockReturnValue(asrNext)
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(result.current?.prayer).toBe(Prayer.Asr)
  })

  it('handles after-Isha case (wraps to tomorrow Fajr)', () => {
    // After Isha, getNextPrayer returns null for today
    mockedGetNextPrayer
      .mockReturnValueOnce(null) // Initial call with today's times
      .mockReturnValue({ prayer: Prayer.Fajr, time: new Date('2026-03-16T02:14:00Z') }) // Tomorrow's Fajr

    const { result } = renderHook(() => useNextPrayer())

    expect(result.current).not.toBeNull()
    expect(result.current?.prayer).toBe(Prayer.Fajr)
  })

  it('returns null when no coordinates available', () => {
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

    mockedGetNextPrayer.mockReturnValue(null)
    mockedCalculate.mockReturnValue(null as unknown as PrayerTimes)

    const { result } = renderHook(() => useNextPrayer())
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
})
