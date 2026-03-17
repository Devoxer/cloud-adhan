import { fireEvent, render, screen } from '@testing-library/react-native'
import { Linking, Platform } from 'react-native'

import { OEMBatteryGuide } from '@/components/settings/OEMBatteryGuide'

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
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
      typography: {
        h3: { size: 18, weight: '600', lineHeight: 1.4 },
        body: { size: 16, weight: '400', lineHeight: 1.5 },
        bodySmall: { size: 14, weight: '400', lineHeight: 1.5 },
      },
      radii: { md: 12 },
    },
  })),
}))

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string, params?: Record<string, string>) => {
      const translations: Record<string, string> = {
        'settings.batteryGuideTitle': `${params?.manufacturer} Battery Guide`,
        'settings.batteryGuideGeneric': 'Battery Optimization Guide',
        'settings.learnMore': 'Learn More',
      }
      return translations[key] ?? key
    },
  })),
}))

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const RN = jest.requireActual('react-native')
  return {
    SafeAreaView: RN.View,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  }
})

// Mock platform utility
let mockManufacturer: string | null = 'samsung'
let mockIsAndroid = true
jest.mock('@/utils/platform', () => ({
  getDeviceManufacturer: () => mockManufacturer,
  isAndroid: () => mockIsAndroid,
}))

const originalOS = Platform.OS

afterEach(() => {
  Object.defineProperty(Platform, 'OS', { value: originalOS, configurable: true })
})

describe('components/settings/OEMBatteryGuide', () => {
  beforeEach(() => {
    mockManufacturer = 'samsung'
    mockIsAndroid = true
  })

  it('renders Samsung-specific steps when manufacturer is samsung', () => {
    mockManufacturer = 'samsung'
    render(<OEMBatteryGuide />)

    expect(screen.getByText('Samsung Battery Guide')).toBeTruthy()
    expect(screen.getByText(/Settings > Apps > Cloud Athan > Battery > Unrestricted/)).toBeTruthy()
    expect(screen.getByText(/Background usage limits/)).toBeTruthy()
  })

  it('renders Xiaomi-specific steps when manufacturer is xiaomi', () => {
    mockManufacturer = 'xiaomi'
    render(<OEMBatteryGuide />)

    expect(screen.getByText('Xiaomi Battery Guide')).toBeTruthy()
    expect(screen.getByText(/Manage Apps > Cloud Athan > Battery Saver/)).toBeTruthy()
  })

  it('renders Huawei-specific steps when manufacturer is huawei', () => {
    mockManufacturer = 'huawei'
    render(<OEMBatteryGuide />)

    expect(screen.getByText('Huawei Battery Guide')).toBeTruthy()
    expect(screen.getByText(/App Launch > Cloud Athan > Manage Manually/)).toBeTruthy()
  })

  it('renders generic guide for unknown manufacturer', () => {
    mockManufacturer = 'unknownbrand'
    render(<OEMBatteryGuide />)

    expect(screen.getByText('Unknownbrand Battery Guide')).toBeTruthy()
    expect(screen.getByText(/Battery optimization > Cloud Athan/)).toBeTruthy()
    expect(screen.getByText(/dontkillmyapp.com for device-specific/)).toBeTruthy()
  })

  it('renders generic guide when manufacturer is null', () => {
    mockManufacturer = null
    render(<OEMBatteryGuide />)

    expect(screen.getByText('Battery Optimization Guide')).toBeTruthy()
  })

  it('includes Learn More link with correct URL for Samsung', () => {
    mockManufacturer = 'samsung'
    const openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true)
    render(<OEMBatteryGuide />)

    const learnMore = screen.getByLabelText('Learn More')
    expect(learnMore).toBeTruthy()
    expect(learnMore.props.accessibilityRole).toBe('link')

    fireEvent.press(learnMore)

    expect(openURLSpy).toHaveBeenCalledWith('https://dontkillmyapp.com/samsung')
    openURLSpy.mockRestore()
  })

  it('includes Learn More link with generic URL when manufacturer is null', () => {
    mockManufacturer = null
    const openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true)
    render(<OEMBatteryGuide />)

    const learnMore = screen.getByLabelText('Learn More')
    fireEvent.press(learnMore)

    expect(openURLSpy).toHaveBeenCalledWith('https://dontkillmyapp.com')
    openURLSpy.mockRestore()
  })

  it('renders numbered steps with accessibility role text', () => {
    mockManufacturer = 'samsung'
    render(<OEMBatteryGuide />)

    // Samsung has 3 steps
    expect(screen.getByText('1.')).toBeTruthy()
    expect(screen.getByText('2.')).toBeTruthy()
    expect(screen.getByText('3.')).toBeTruthy()
  })

  it('renders section header with accessibility role', () => {
    mockManufacturer = 'samsung'
    render(<OEMBatteryGuide />)

    const headers = screen.getAllByRole('header')
    expect(headers.length).toBeGreaterThanOrEqual(1)
  })

  it('returns null on iOS (not applicable)', () => {
    mockIsAndroid = false
    mockManufacturer = null
    const { toJSON } = render(<OEMBatteryGuide />)

    expect(toJSON()).toBeNull()
  })
})
