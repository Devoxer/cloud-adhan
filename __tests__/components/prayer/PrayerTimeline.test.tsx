import { render, screen } from '@testing-library/react-native'

import { PrayerTimeline } from '@/components/prayer/PrayerTimeline'
import type { PrayerStateEntry } from '@/hooks/usePrayerStates'
import { Prayer } from '@/types/prayer'

// Mock Ionicons
jest.mock('@expo/vector-icons/Ionicons', () => {
  const RN = jest.requireActual('react-native')
  return RN.Text
})

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const RN = jest.requireActual('react-native')
  return {
    __esModule: true,
    useReducedMotion: jest.fn(() => false),
    useSharedValue: jest.fn((initial: number) => ({ value: initial })),
    useAnimatedStyle: jest.fn(() => ({})),
    withTiming: jest.fn((value: number) => value),
    default: {
      View: RN.View,
      Text: RN.Text,
      createAnimatedComponent: (comp: unknown) => comp,
    },
  }
})

// Mock useTheme
jest.mock('@/hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    tokens: {
      colors: {
        surface: '#1A1614',
        textPrimary: '#F5F0E8',
        textSecondary: '#A89F94',
        textTertiary: '#6B6158',
        prayerActive: '#C4A34D',
        prayerCurrent: '#5B9A8B',
        accentSubtle: 'rgba(196, 163, 77, 0.15)',
      },
      spacing: { sm: 8, md: 16 },
      typography: {
        h3: { size: 18, weight: '600', lineHeight: 1.4 },
        body: { size: 16, weight: '400', lineHeight: 1.5 },
        bodySmall: { size: 14, weight: '400', lineHeight: 1.5 },
      },
      radii: { sm: 8, md: 12 },
    },
  })),
}))

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string, params?: Record<string, string>) => {
      const translations: Record<string, string> = {
        'prayer.fajr': 'Fajr',
        'prayer.sunrise': 'Sunrise',
        'prayer.dhuhr': 'Dhuhr',
        'prayer.asr': 'Asr',
        'prayer.maghrib': 'Maghrib',
        'prayer.isha': 'Isha',
        'timeline.passed': 'passed',
        'timeline.current': 'current prayer',
        'timeline.next': 'next prayer',
        'timeline.upcoming': 'upcoming',
      }
      if (key === 'timeline.accessibility' && params) {
        return `${params.prayer} at ${params.time}, ${params.status}`
      }
      return translations[key] ?? key
    },
  })),
}))

// Mock formatTime
jest.mock('@/utils/format', () => ({
  formatTime: jest.fn(() => '12:00 PM'),
}))

// Mock settings store
jest.mock('@/stores/settings', () => ({
  useSettingsStore: jest.fn((selector: (state: Record<string, unknown>) => unknown) =>
    selector({ arabicNumerals: false }),
  ),
}))

const mockPrayerStates: PrayerStateEntry[] = [
  { prayer: Prayer.Fajr, time: new Date('2026-03-15T02:14:00Z'), state: 'passed' },
  { prayer: Prayer.Sunrise, time: new Date('2026-03-15T03:30:00Z'), state: 'passed' },
  { prayer: Prayer.Dhuhr, time: new Date('2026-03-15T09:30:00Z'), state: 'current' },
  { prayer: Prayer.Asr, time: new Date('2026-03-15T12:53:00Z'), state: 'next' },
  { prayer: Prayer.Maghrib, time: new Date('2026-03-15T15:30:00Z'), state: 'upcoming' },
  { prayer: Prayer.Isha, time: new Date('2026-03-15T17:00:00Z'), state: 'upcoming' },
]

// Mock usePrayerStates
jest.mock('@/hooks/usePrayerStates', () => ({
  usePrayerStates: jest.fn(() => mockPrayerStates),
}))

const { usePrayerStates } = require('@/hooks/usePrayerStates')

describe('components/prayer/PrayerTimeline', () => {
  it('renders all 6 prayer rows', () => {
    render(<PrayerTimeline />)

    expect(screen.getByText('Fajr')).toBeTruthy()
    expect(screen.getByText('Sunrise')).toBeTruthy()
    expect(screen.getByText('Dhuhr')).toBeTruthy()
    expect(screen.getByText('Asr')).toBeTruthy()
    expect(screen.getByText('Maghrib')).toBeTruthy()
    expect(screen.getByText('Isha')).toBeTruthy()
  })

  it('handles null state gracefully', () => {
    ;(usePrayerStates as jest.Mock).mockReturnValueOnce(null)

    const { toJSON } = render(<PrayerTimeline />)
    expect(toJSON()).toBeTruthy()

    // Should not render any prayer names
    expect(screen.queryByText('Fajr')).toBeNull()
  })
})
