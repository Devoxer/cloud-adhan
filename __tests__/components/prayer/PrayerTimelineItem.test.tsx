import { render, screen } from '@testing-library/react-native'

import { PrayerTimelineItem } from '@/components/prayer/PrayerTimelineItem'
import type { PrayerStateType } from '@/hooks/usePrayerStates'
import { Prayer } from '@/types/prayer'

// Mock Ionicons — renders name as text for testability
jest.mock('@expo/vector-icons/Ionicons', () => {
  const React = jest.requireActual('react')
  const RN = jest.requireActual('react-native')
  const MockIonicons = (props: { name: string; size: number; color: string }) =>
    React.createElement(RN.Text, { testID: 'prayer-icon' }, props.name)
  return MockIonicons
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
        'prayer.dhuhr': 'Dhuhr',
        'prayer.asr': 'Asr',
        'prayer.maghrib': 'Maghrib',
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
  formatTime: jest.fn((_date: Date, _use24: boolean, arabicNumerals: boolean) =>
    arabicNumerals ? '٣:٤٥ م' : '3:45 PM',
  ),
}))

const testTime = new Date('2026-03-15T12:45:00Z')

describe('components/prayer/PrayerTimelineItem', () => {
  it('renders prayer name and time correctly', () => {
    render(
      <PrayerTimelineItem prayer={Prayer.Dhuhr} time={testTime} state="current" arabicNumerals={false} />,
    )

    expect(screen.getByText('Dhuhr')).toBeTruthy()
    expect(screen.getByText('3:45 PM')).toBeTruthy()
  })

  it('applies correct accessibility label for each prayer state', () => {
    render(
      <PrayerTimelineItem prayer={Prayer.Dhuhr} time={testTime} state="current" arabicNumerals={false} />,
    )

    expect(screen.getByLabelText('Dhuhr at 3:45 PM, current prayer')).toBeTruthy()
  })

  it.each<[PrayerStateType, string, string]>([
    ['passed', 'checkmark-circle', 'passed'],
    ['current', 'ellipse', 'current prayer'],
    ['next', 'notifications', 'next prayer'],
    ['upcoming', 'notifications-outline', 'upcoming'],
  ])('renders correct icon and label for %s state', (state, expectedIcon, expectedStatus) => {
    render(
      <PrayerTimelineItem prayer={Prayer.Fajr} time={testTime} state={state} arabicNumerals={false} />,
    )

    expect(screen.getByText(expectedIcon)).toBeTruthy()
    expect(screen.getByLabelText(`Fajr at 3:45 PM, ${expectedStatus}`)).toBeTruthy()
  })

  it('renders with Arabic numerals', () => {
    render(
      <PrayerTimelineItem prayer={Prayer.Asr} time={testTime} state="next" arabicNumerals={true} />,
    )

    expect(screen.getByText('٣:٤٥ م')).toBeTruthy()
  })

  it('accessibility label includes state information', () => {
    render(
      <PrayerTimelineItem prayer={Prayer.Maghrib} time={testTime} state="upcoming" arabicNumerals={false} />,
    )

    expect(screen.getByLabelText('Maghrib at 3:45 PM, upcoming')).toBeTruthy()
  })

  it('uses marginStart (not marginLeft) for RTL-aware spacing on prayer name', () => {
    render(
      <PrayerTimelineItem prayer={Prayer.Dhuhr} time={testTime} state="current" arabicNumerals={false} />,
    )

    const prayerNameElement = screen.getByText('Dhuhr')
    const flattenedStyle = Array.isArray(prayerNameElement.props.style)
      ? Object.assign({}, ...prayerNameElement.props.style.flat())
      : prayerNameElement.props.style
    expect(flattenedStyle.marginStart).toBe(8)
    expect(flattenedStyle.marginLeft).toBeUndefined()
  })
})
