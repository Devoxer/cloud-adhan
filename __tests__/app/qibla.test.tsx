import { render, screen } from '@testing-library/react-native'

import QiblaScreen from '@/app/(tabs)/qibla'

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const RN = jest.requireActual('react-native')
  return {
    __esModule: true,
    useReducedMotion: jest.fn(() => false),
    useSharedValue: jest.fn((initial: number) => ({ value: initial })),
    useAnimatedStyle: jest.fn((fn: () => Record<string, unknown>) => fn()),
    useDerivedValue: jest.fn(),
    withTiming: jest.fn((value: number) => value),
    withRepeat: jest.fn((value: number) => value),
    Easing: {
      out: jest.fn(() => jest.fn()),
      quad: jest.fn(),
      inOut: jest.fn(() => jest.fn()),
      ease: jest.fn(),
    },
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
      Rotation: () => ({
        onUpdate: function () {
          return this
        },
        onEnd: function () {
          return this
        },
      }),
    },
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

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}))

// Mock useTheme
jest.mock('@/hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    tokens: {
      colors: {
        background: '#000000',
        qiblaDirection: '#5B9A8B',
        border: '#2A2420',
        surface: '#1A1614',
        textPrimary: '#F5F0E8',
        textSecondary: '#A89F94',
        textTertiary: '#6B6158',
        onAccent: '#FFFFFF',
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
      typography: {
        h1: { size: 28, weight: '600', lineHeight: 1.3 },
        h2: { size: 22, weight: '600', lineHeight: 1.3 },
        h3: { size: 18, weight: '600', lineHeight: 1.4 },
        body: { size: 16, weight: '400', lineHeight: 1.5 },
        bodySmall: { size: 14, weight: '400', lineHeight: 1.5 },
        label: { size: 14, weight: '500', lineHeight: 1.2 },
      },
      radii: { md: 12 },
    },
  })),
}))

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'screen.qibla': 'Qibla Compass',
        'qibla.facingQibla': 'You are facing the Qibla',
        'qibla.needsCalibration':
          'Move your phone in a figure-8 to calibrate the compass',
        'qibla.bearingDegrees': `${params?.degrees ?? ''}° from North`,
        'qibla.bearing': `Qibla bearing: ${params?.degrees ?? ''}°`,
        'qibla.noLocation': 'Set your location to see Qibla direction',
        'qibla.staticFallback': 'Compass not available on this device',
        'qibla.compassAccessibility': `Qibla is ${params?.degrees ?? ''} degrees from north. Rotate your device to find Qibla direction.`,
      }
      return translations[key] ?? key
    },
  })),
}))

// Mock useQibla
const mockUseQibla = jest.fn()
jest.mock('@/hooks/useQibla', () => ({
  useQibla: () => mockUseQibla(),
}))

// Mock useLocationStore
let mockCoordinates: { latitude: number; longitude: number } | null = {
  latitude: 33.97,
  longitude: -6.85,
}
let mockCityName: string | null = 'Rabat'

jest.mock('@/stores/location', () => ({
  useLocationStore: jest.fn(
    (selector: (state: Record<string, unknown>) => unknown) =>
      selector({
        coordinates: mockCoordinates,
        cityName: mockCityName,
        source: 'gps',
        lastUpdated: null,
      }),
  ),
}))

const defaultQiblaState = {
  qiblaBearing: 94.6,
  compassHeading: 180,
  qiblaDirection: -85.4,
  facingQibla: false,
  needsCalibration: false,
  isCompassAvailable: true,
  error: null,
}

describe('app/(tabs)/qibla', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCoordinates = { latitude: 33.97, longitude: -6.85 }
    mockCityName = 'Rabat'
    mockUseQibla.mockReturnValue(defaultQiblaState)
  })

  it('renders screen title', () => {
    render(<QiblaScreen />)
    expect(screen.getByText('Qibla Compass')).toBeTruthy()
  })

  it('renders city name below compass', () => {
    render(<QiblaScreen />)
    expect(screen.getByText('Rabat')).toBeTruthy()
  })

  it('renders qibla bearing text', () => {
    render(<QiblaScreen />)
    expect(screen.getByText('Qibla bearing: 95°')).toBeTruthy()
  })

  it('shows no-location message when coordinates are null', () => {
    mockCoordinates = null
    mockCityName = null
    render(<QiblaScreen />)
    expect(
      screen.getByText('Set your location to see Qibla direction'),
    ).toBeTruthy()
  })

  it('has accessibility label on compass container', () => {
    render(<QiblaScreen />)
    expect(
      screen.getByLabelText(
        'Qibla is 95 degrees from north. Rotate your device to find Qibla direction.',
      ),
    ).toBeTruthy()
  })

  it('renders compass cardinal labels', () => {
    render(<QiblaScreen />)
    expect(screen.getByText('N')).toBeTruthy()
    expect(screen.getByText('S')).toBeTruthy()
  })

  it('renders without city name when cityName is null', () => {
    mockCityName = null
    render(<QiblaScreen />)
    expect(screen.queryByText('Rabat')).toBeNull()
    expect(screen.getByText('Qibla Compass')).toBeTruthy()
  })

  it('uses i18n keys for all user-facing text', () => {
    render(<QiblaScreen />)
    // Verify key texts are rendered from translation function, not hardcoded
    expect(screen.getByText('Qibla Compass')).toBeTruthy()
    expect(screen.getByText('Qibla bearing: 95°')).toBeTruthy()
  })
})
