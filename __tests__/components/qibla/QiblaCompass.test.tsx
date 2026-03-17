import { render, screen } from '@testing-library/react-native'

import { QiblaCompass } from '@/components/qibla/QiblaCompass'

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

// Mock expo-haptics
const mockNotificationAsync = jest.fn()
jest.mock('expo-haptics', () => ({
  __esModule: true,
  notificationAsync: (...args: unknown[]) => mockNotificationAsync(...args),
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
        qiblaDirection: '#5B9A8B',
        border: '#2A2420',
        surface: '#1A1614',
        textPrimary: '#F5F0E8',
        textSecondary: '#A89F94',
        onAccent: '#FFFFFF',
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
      typography: {
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
        'qibla.facingQibla': 'You are facing the Qibla',
        'qibla.needsCalibration':
          'Move your phone in a figure-8 to calibrate the compass',
        'qibla.bearingDegrees': `${params?.degrees ?? ''}° from North`,
        'qibla.staticFallback': 'Compass not available on this device',
      }
      return translations[key] ?? key
    },
  })),
}))

const defaultProps = {
  qiblaBearing: 94.6,
  compassHeading: 180,
  facingQibla: false,
  needsCalibration: false,
  isCompassAvailable: true,
}

describe('components/qibla/QiblaCompass', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders compass with cardinal direction labels', () => {
    render(<QiblaCompass {...defaultProps} />)
    expect(screen.getByText('N')).toBeTruthy()
    expect(screen.getByText('S')).toBeTruthy()
    expect(screen.getByText('E')).toBeTruthy()
    expect(screen.getByText('W')).toBeTruthy()
  })

  it('renders current heading degrees in center', () => {
    render(<QiblaCompass {...defaultProps} />)
    expect(screen.getByText('180°')).toBeTruthy()
  })

  it('shows "Facing Qibla" text when facingQibla is true', () => {
    render(<QiblaCompass {...defaultProps} facingQibla />)
    expect(screen.getByText('You are facing the Qibla')).toBeTruthy()
  })

  it('hides "Facing Qibla" from accessibility when not facing', () => {
    render(<QiblaCompass {...defaultProps} facingQibla={false} />)
    // Text renders in DOM (opacity 0) but is hidden from accessibility tree
    expect(screen.queryByText('You are facing the Qibla')).toBeNull()
    // Verify it exists in the full tree (including hidden elements)
    expect(
      screen.getByText('You are facing the Qibla', { includeHiddenElements: true }),
    ).toBeTruthy()
  })

  it('triggers haptic on false->true transition of facingQibla', () => {
    const { rerender } = render(<QiblaCompass {...defaultProps} facingQibla={false} />)
    expect(mockNotificationAsync).not.toHaveBeenCalled()

    rerender(<QiblaCompass {...defaultProps} facingQibla />)
    expect(mockNotificationAsync).toHaveBeenCalledWith('success')
  })

  it('does NOT trigger haptic on true->true (debounce)', () => {
    const { rerender } = render(<QiblaCompass {...defaultProps} facingQibla />)
    mockNotificationAsync.mockClear()

    rerender(<QiblaCompass {...defaultProps} facingQibla />)
    expect(mockNotificationAsync).not.toHaveBeenCalled()
  })

  it('shows calibration overlay when needsCalibration is true', () => {
    render(<QiblaCompass {...defaultProps} needsCalibration />)
    expect(
      screen.getByText('Move your phone in a figure-8 to calibrate the compass'),
    ).toBeTruthy()
  })

  it('does not show calibration overlay when needsCalibration is false', () => {
    render(<QiblaCompass {...defaultProps} needsCalibration={false} />)
    expect(
      screen.queryByText('Move your phone in a figure-8 to calibrate the compass'),
    ).toBeNull()
  })

  it('renders static fallback when isCompassAvailable is false', () => {
    render(<QiblaCompass {...defaultProps} isCompassAvailable={false} />)
    expect(
      screen.getByText('Compass not available on this device'),
    ).toBeTruthy()
  })

  it('shows bearing degrees text in static fallback', () => {
    render(
      <QiblaCompass {...defaultProps} isCompassAvailable={false} />,
    )
    expect(screen.getByText('95° from North')).toBeTruthy()
  })

  it('renders cardinal labels in static fallback', () => {
    render(<QiblaCompass {...defaultProps} isCompassAvailable={false} />)
    expect(screen.getByText('N')).toBeTruthy()
    expect(screen.getByText('S')).toBeTruthy()
    expect(screen.getByText('E')).toBeTruthy()
    expect(screen.getByText('W')).toBeTruthy()
  })

  it('does not show heading degrees when compassHeading is null', () => {
    render(<QiblaCompass {...defaultProps} compassHeading={null} />)
    expect(screen.queryByText(/°$/)).toBeNull()
  })

  it('renders 12 tick marks', () => {
    render(<QiblaCompass {...defaultProps} />)
    const ticks = screen.getAllByTestId(/^tick-/)
    expect(ticks).toHaveLength(12)
  })
})
