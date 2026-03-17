import { act, render, screen } from '@testing-library/react-native'
import { Platform } from 'react-native'

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
        'home.locationDenied': 'Location access is needed',
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
jest.mock('@/stores/location', () => ({
  useLocationStore: jest.fn((selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      coordinates: { latitude: 21.42, longitude: 39.82 },
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
jest.mock('@/hooks/useFirstLaunch', () => ({
  useFirstLaunch: () => ({
    loading: false,
    locationGranted: true,
    notificationGranted: true,
    error: null,
    canAskAgain: true,
    retry: jest.fn(),
  }),
}))

jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: jest.fn(() => ({
    permissionGranted: true,
    scheduledCount: 0,
    reschedule: jest.fn(),
  })),
}))

// Mock prayer hooks
jest.mock('@/hooks/usePrayerStates', () => ({
  usePrayerStates: jest.fn(() => [
    { prayer: 'fajr', time: new Date('2026-03-15T02:14:00Z'), state: 'passed' },
    { prayer: 'sunrise', time: new Date('2026-03-15T03:30:00Z'), state: 'passed' },
    { prayer: 'dhuhr', time: new Date('2026-03-15T09:30:00Z'), state: 'current' },
    { prayer: 'asr', time: new Date('2026-03-15T12:53:00Z'), state: 'next' },
    { prayer: 'maghrib', time: new Date('2026-03-15T15:30:00Z'), state: 'upcoming' },
    { prayer: 'isha', time: new Date('2026-03-15T17:00:00Z'), state: 'upcoming' },
  ]),
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

const originalPlatformOS = Platform.OS

// In jest-expo (node environment), window exists but has no real addEventListener.
// Set up a minimal mock so the component's useEffect can register its handler.
let capturedKeydownHandler: ((e: unknown) => void) | null = null

const mockAddEventListener = jest.fn((type: string, handler: (e: unknown) => void) => {
  if (type === 'keydown') capturedKeydownHandler = handler
})
const mockRemoveEventListener = jest.fn()

Object.defineProperty(globalThis, 'window', {
  value: {
    ...globalThis,
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
  },
  writable: true,
  configurable: true,
})

describe('HomeScreen — keyboard navigation on web', () => {
  beforeEach(() => {
    capturedKeydownHandler = null
    mockAddEventListener.mockClear()
    mockRemoveEventListener.mockClear()
    Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true })
  })

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: originalPlatformOS, configurable: true })
  })

  it('advances date on ArrowRight when no input is focused', () => {
    render(<HomeScreen />)

    // Initially today — no "Go to today" button
    expect(screen.queryByLabelText('Go to today')).toBeNull()
    expect(capturedKeydownHandler).not.toBeNull()

    // Simulate ArrowRight with no specific target
    act(() => {
      capturedKeydownHandler!({ key: 'ArrowRight', target: {} })
    })

    // After advancing, "Go to today" button should appear
    expect(screen.getByLabelText('Go to today')).toBeTruthy()
  })

  it('goes back on ArrowLeft', () => {
    render(<HomeScreen />)

    // First advance, then go back to today
    act(() => {
      capturedKeydownHandler!({ key: 'ArrowRight', target: {} })
    })
    expect(screen.getByLabelText('Go to today')).toBeTruthy()

    act(() => {
      capturedKeydownHandler!({ key: 'ArrowLeft', target: {} })
    })
    // Back to today — "Go to today" should be gone
    expect(screen.queryByLabelText('Go to today')).toBeNull()
  })

  it('ignores arrow keys when target is an INPUT element', () => {
    render(<HomeScreen />)

    act(() => {
      capturedKeydownHandler!({
        key: 'ArrowRight',
        target: { tagName: 'INPUT', isContentEditable: false },
      })
    })

    // Date should NOT have changed — "Go to today" still absent (still on today)
    expect(screen.queryByLabelText('Go to today')).toBeNull()
  })

  it('ignores arrow keys when target is a TEXTAREA element', () => {
    render(<HomeScreen />)

    act(() => {
      capturedKeydownHandler!({
        key: 'ArrowRight',
        target: { tagName: 'TEXTAREA', isContentEditable: false },
      })
    })

    expect(screen.queryByLabelText('Go to today')).toBeNull()
  })
})
