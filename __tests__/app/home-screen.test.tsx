import { render, screen } from '@testing-library/react-native'

import HomeScreen from '@/app/(tabs)/index'

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
    useAnimatedStyle: jest.fn((fn: () => Record<string, unknown>) => fn()),
    withTiming: jest.fn((value: number) => value),
    withRepeat: jest.fn((value: number) => value),
    runOnJS: jest.fn((fn: (...args: unknown[]) => unknown) => fn),
    default: {
      View: RN.View,
      Text: RN.Text,
      createAnimatedComponent: (comp: unknown) => comp,
    },
  }
})

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const RN = jest.requireActual('react-native')
  return {
    GestureDetector: ({ children }: { children: React.ReactNode }) => children,
    Gesture: {
      Fling: () => ({
        direction: () => ({
          onStart: () => ({}),
        }),
      }),
      Race: () => ({}),
    },
    Directions: { LEFT: 2, RIGHT: 1 },
  }
})

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const RN = jest.requireActual('react-native')
  return {
    SafeAreaView: RN.View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  }
})

// Mock useTheme
jest.mock('@/hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    tokens: {
      colors: {
        background: '#000000',
        surface: '#1A1614',
        surfaceElevated: '#2A2420',
        textPrimary: '#F5F0E8',
        textSecondary: '#A89F94',
        textTertiary: '#6B6158',
        accent: '#C4A34D',
        accentSubtle: 'rgba(196, 163, 77, 0.15)',
        teal: '#5B9A8B',
        warning: '#E8A84A',
        prayerActive: '#C4A34D',
        prayerCurrent: '#5B9A8B',
        onAccent: '#FFFFFF',
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
      typography: {
        countdownLarge: { size: 56, weight: '300', lineHeight: 1.1 },
        countdownUnit: { size: 20, weight: '400', lineHeight: 1.2 },
        h1: { size: 28, weight: '600', lineHeight: 1.3 },
        h2: { size: 22, weight: '600', lineHeight: 1.3 },
        h3: { size: 18, weight: '600', lineHeight: 1.4 },
        body: { size: 16, weight: '400', lineHeight: 1.5 },
        bodySmall: { size: 14, weight: '400', lineHeight: 1.5 },
        caption: { size: 12, weight: '400', lineHeight: 1.4 },
        label: { size: 14, weight: '500', lineHeight: 1.2 },
      },
      radii: { sm: 8, md: 12, lg: 16, full: 9999 },
    },
  })),
}))

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'home.locationDenied': 'Location access is needed for accurate prayer times',
        'home.setManually': 'Set Location Manually',
        'home.tryAgain': 'Try Again',
        'home.openSettings': 'Open Settings',
        'home.today': 'Today',
        'date.previousDay': 'Previous day',
        'date.nextDay': 'Next day',
        'date.goToToday': 'Go to today',
        'date.dateFormat': 'dddd, MMMM D',
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
        'common.prayerTimeIn': '{{prayer}} in',
      }
      return translations[key] ?? key
    },
  })),
}))

// Mock formatTime and formatNumber
jest.mock('@/utils/format', () => ({
  formatTime: jest.fn(() => '12:00 PM'),
  formatNumber: jest.fn((val: string | number) => String(val)),
}))

// Mock stores
let mockCoordinates: { latitude: number; longitude: number } | null = null

jest.mock('@/stores/location', () => ({
  useLocationStore: jest.fn((selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      coordinates: mockCoordinates,
      cityName: 'Makkah',
      source: 'gps',
      setLocation: jest.fn(),
    }),
  ),
}))

jest.mock('@/stores/settings', () => ({
  useSettingsStore: jest.fn((selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      calculationMethod: 'UmmAlQura',
      madhab: 'shafi',
      language: 'en',
      arabicNumerals: false,
      setCalculationMethod: jest.fn(),
    }),
  ),
}))

// Mock useFirstLaunch
let mockFirstLaunchState = {
  loading: false,
  locationGranted: true,
  notificationGranted: true,
  error: null as string | null,
  canAskAgain: true,
  retry: jest.fn(),
}

jest.mock('@/hooks/useFirstLaunch', () => ({
  useFirstLaunch: () => mockFirstLaunchState,
}))

jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: jest.fn(() => ({
    permissionGranted: true,
    scheduledCount: 0,
    reschedule: jest.fn(),
  })),
}))

// Mock prayer hooks
const mockPrayerStates = [
  { prayer: 'fajr', time: new Date('2026-03-15T02:14:00Z'), state: 'passed' },
  { prayer: 'sunrise', time: new Date('2026-03-15T03:30:00Z'), state: 'passed' },
  { prayer: 'dhuhr', time: new Date('2026-03-15T09:30:00Z'), state: 'current' },
  { prayer: 'asr', time: new Date('2026-03-15T12:53:00Z'), state: 'next' },
  { prayer: 'maghrib', time: new Date('2026-03-15T15:30:00Z'), state: 'upcoming' },
  { prayer: 'isha', time: new Date('2026-03-15T17:00:00Z'), state: 'upcoming' },
]

jest.mock('@/hooks/usePrayerStates', () => ({
  usePrayerStates: jest.fn(() => mockPrayerStates),
}))

jest.mock('@/hooks/useNextPrayer', () => ({
  useNextPrayer: jest.fn(() => ({
    prayer: 'dhuhr',
    time: new Date('2026-03-15T09:30:00Z'),
  })),
}))

jest.mock('@/hooks/useCountdown', () => ({
  useCountdown: jest.fn(() => ({ hours: 1, minutes: 30, seconds: 45 })),
}))

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}))

describe('app/(tabs)/index - HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCoordinates = { latitude: 21.42, longitude: 39.82 }
    mockFirstLaunchState = {
      loading: false,
      locationGranted: true,
      notificationGranted: true,
      error: null,
      canAskAgain: true,
      retry: jest.fn(),
    }
  })

  it('renders CountdownHero and PrayerTimeline when location available', () => {
    render(<HomeScreen />)

    // PrayerTimeline renders prayer names
    expect(screen.getByText('Fajr')).toBeTruthy()
    expect(screen.getByText('Dhuhr')).toBeTruthy()
    expect(screen.getByText('Isha')).toBeTruthy()

    // DateNavigator shows date
    expect(screen.getByLabelText('Previous day')).toBeTruthy()
    expect(screen.getByLabelText('Next day')).toBeTruthy()
  })

  it('shows skeleton while loading', () => {
    mockFirstLaunchState = {
      ...mockFirstLaunchState,
      loading: true,
      locationGranted: false,
    }

    const { toJSON } = render(<HomeScreen />)

    // Skeleton is rendered (hidden from accessibility so we check the tree)
    const tree = toJSON()
    expect(tree).toBeTruthy()

    // Should NOT show prayer names while loading
    expect(screen.queryByText('Fajr')).toBeNull()
  })

  it('shows PermissionBanner when location denied and no cache', () => {
    mockCoordinates = null
    mockFirstLaunchState = {
      ...mockFirstLaunchState,
      loading: false,
      locationGranted: false,
      error: 'permission_denied',
      canAskAgain: true,
    }

    render(<HomeScreen />)

    expect(screen.getByText('Location access is needed for accurate prayer times')).toBeTruthy()
    expect(screen.getByText('Set Location Manually')).toBeTruthy()
    expect(screen.getByText('Try Again')).toBeTruthy()
  })

  it('works with cached coordinates (offline mode)', () => {
    // Coordinates exist but useFirstLaunch didn't run (offline)
    mockCoordinates = { latitude: 21.42, longitude: 39.82 }
    mockFirstLaunchState = {
      ...mockFirstLaunchState,
      loading: false,
      locationGranted: true,
    }

    render(<HomeScreen />)

    // Should render prayer content even offline
    expect(screen.getByText('Fajr')).toBeTruthy()
    expect(screen.getByText('Dhuhr')).toBeTruthy()
  })
})
