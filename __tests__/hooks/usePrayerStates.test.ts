import { renderHook, act } from '@testing-library/react-native'

import { usePrayerStates } from '@/hooks/usePrayerStates'
import { getCurrentPrayer, getNextPrayer } from '@/services/prayer'
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
      arabicNumerals: false,
    }),
  ),
}))

// Build mock prayer times
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
  getCurrentPrayer: jest.fn(),
}))

const mockedGetNextPrayer = getNextPrayer as jest.MockedFunction<typeof getNextPrayer>
const mockedGetCurrentPrayer = getCurrentPrayer as jest.MockedFunction<typeof getCurrentPrayer>

describe('hooks/usePrayerStates', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    // Reset location mock to default state for each test
    const { useLocationStore } = require('@/stores/location')
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

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('returns correct states at various times of day (morning: Fajr=passed, Dhuhr=current, Asr=next)', () => {
    // Set time to after Fajr/Sunrise, during Dhuhr period
    jest.setSystemTime(new Date('2026-03-15T10:00:00Z'))
    mockedGetCurrentPrayer.mockReturnValue({ prayer: Prayer.Dhuhr, time: mockPrayerTimes.dhuhr })
    mockedGetNextPrayer.mockReturnValue({ prayer: Prayer.Asr, time: mockPrayerTimes.asr })

    const { result } = renderHook(() => usePrayerStates())

    expect(result.current).not.toBeNull()
    expect(result.current).toHaveLength(6)

    const stateMap = Object.fromEntries(result.current!.map((s) => [s.prayer, s.state]))
    expect(stateMap[Prayer.Fajr]).toBe('passed')
    expect(stateMap[Prayer.Sunrise]).toBe('passed')
    expect(stateMap[Prayer.Dhuhr]).toBe('current')
    expect(stateMap[Prayer.Asr]).toBe('next')
    expect(stateMap[Prayer.Maghrib]).toBe('upcoming')
    expect(stateMap[Prayer.Isha]).toBe('upcoming')
  })

  it('returns all-upcoming scenario (before Fajr)', () => {
    jest.setSystemTime(new Date('2026-03-15T01:00:00Z'))
    mockedGetCurrentPrayer.mockReturnValue(null)
    mockedGetNextPrayer.mockReturnValue({ prayer: Prayer.Fajr, time: mockPrayerTimes.fajr })

    const { result } = renderHook(() => usePrayerStates())

    expect(result.current).not.toBeNull()
    const stateMap = Object.fromEntries(result.current!.map((s) => [s.prayer, s.state]))
    expect(stateMap[Prayer.Fajr]).toBe('next')
    expect(stateMap[Prayer.Sunrise]).toBe('upcoming')
    expect(stateMap[Prayer.Dhuhr]).toBe('upcoming')
    expect(stateMap[Prayer.Asr]).toBe('upcoming')
    expect(stateMap[Prayer.Maghrib]).toBe('upcoming')
    expect(stateMap[Prayer.Isha]).toBe('upcoming')
  })

  it('returns all-passed-except-current scenario (after Isha)', () => {
    jest.setSystemTime(new Date('2026-03-15T18:00:00Z'))
    mockedGetCurrentPrayer.mockReturnValue({ prayer: Prayer.Isha, time: mockPrayerTimes.isha })
    mockedGetNextPrayer.mockReturnValue(null)

    const { result } = renderHook(() => usePrayerStates())

    expect(result.current).not.toBeNull()
    const stateMap = Object.fromEntries(result.current!.map((s) => [s.prayer, s.state]))
    expect(stateMap[Prayer.Fajr]).toBe('passed')
    expect(stateMap[Prayer.Sunrise]).toBe('passed')
    expect(stateMap[Prayer.Dhuhr]).toBe('passed')
    expect(stateMap[Prayer.Asr]).toBe('passed')
    expect(stateMap[Prayer.Maghrib]).toBe('passed')
    expect(stateMap[Prayer.Isha]).toBe('current')
  })

  it('detects real-time transition when prayer time passes (use fake timers)', () => {
    // Start during Dhuhr period
    jest.setSystemTime(new Date('2026-03-15T10:00:00Z'))
    mockedGetCurrentPrayer.mockReturnValue({ prayer: Prayer.Dhuhr, time: mockPrayerTimes.dhuhr })
    mockedGetNextPrayer.mockReturnValue({ prayer: Prayer.Asr, time: mockPrayerTimes.asr })

    const { result } = renderHook(() => usePrayerStates())
    expect(result.current!.find((s) => s.prayer === Prayer.Dhuhr)?.state).toBe('current')
    expect(result.current!.find((s) => s.prayer === Prayer.Asr)?.state).toBe('next')

    // Simulate time passing Asr — now Asr is current, Maghrib is next
    mockedGetCurrentPrayer.mockReturnValue({ prayer: Prayer.Asr, time: mockPrayerTimes.asr })
    mockedGetNextPrayer.mockReturnValue({ prayer: Prayer.Maghrib, time: mockPrayerTimes.maghrib })

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(result.current!.find((s) => s.prayer === Prayer.Dhuhr)?.state).toBe('passed')
    expect(result.current!.find((s) => s.prayer === Prayer.Asr)?.state).toBe('current')
    expect(result.current!.find((s) => s.prayer === Prayer.Maghrib)?.state).toBe('next')
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

    const { result } = renderHook(() => usePrayerStates())
    expect(result.current).toBeNull()
  })

  it('avoids unnecessary re-renders when states have not changed', () => {
    jest.setSystemTime(new Date('2026-03-15T10:00:00Z'))
    mockedGetCurrentPrayer.mockReturnValue({ prayer: Prayer.Dhuhr, time: mockPrayerTimes.dhuhr })
    mockedGetNextPrayer.mockReturnValue({ prayer: Prayer.Asr, time: mockPrayerTimes.asr })

    const { result } = renderHook(() => usePrayerStates())
    const firstResult = result.current

    // Advance timer but states remain the same
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    // Same reference means no re-render triggered
    expect(result.current).toBe(firstResult)
  })
})
