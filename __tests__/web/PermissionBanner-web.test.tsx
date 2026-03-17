import { render, screen } from '@testing-library/react-native'
import { Platform } from 'react-native'

import { PermissionBanner } from '@/components/home/PermissionBanner'

// Mock Ionicons
jest.mock('@expo/vector-icons/Ionicons', () => {
  const RN = jest.requireActual('react-native')
  return RN.Text
})

// Mock expo-router
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}))

// Mock useTheme
jest.mock('@/hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    tokens: {
      colors: {
        surface: '#1A1614',
        surfaceElevated: '#2A2420',
        textPrimary: '#F5F0E8',
        textSecondary: '#A89F94',
        textTertiary: '#6B6158',
        accent: '#C4A34D',
        accentSubtle: 'rgba(196, 163, 77, 0.15)',
        warning: '#E8A84A',
        onAccent: '#FFFFFF',
      },
      spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
      typography: {
        bodySmall: { size: 14, weight: '400', lineHeight: 1.5 },
        label: { size: 14, weight: '500', lineHeight: 1.2 },
      },
      radii: { sm: 8, md: 12 },
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
        'home.enableLocationInBrowser': 'Please enable location in your browser settings',
      }
      return translations[key] ?? key
    },
  })),
}))

const originalPlatformOS = Platform.OS

describe('PermissionBanner — web platform', () => {
  beforeEach(() => {
    Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true })
  })

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: originalPlatformOS, configurable: true })
  })

  it('shows text instruction instead of "Open Settings" button on web when canAskAgain is false', () => {
    render(<PermissionBanner canAskAgain={false} onRetry={jest.fn()} />)

    expect(
      screen.getByText('Please enable location in your browser settings'),
    ).toBeTruthy()
    expect(screen.queryByText('Open Settings')).toBeNull()
  })

  it('still shows "Try Again" button on web when canAskAgain is true', () => {
    render(<PermissionBanner canAskAgain={true} onRetry={jest.fn()} />)

    expect(screen.getByText('Try Again')).toBeTruthy()
    expect(screen.queryByText('Please enable location in your browser settings')).toBeNull()
  })

  it('still shows "Set Location Manually" button on web', () => {
    render(<PermissionBanner canAskAgain={false} onRetry={jest.fn()} />)

    expect(screen.getByText('Set Location Manually')).toBeTruthy()
  })
})

describe('PermissionBanner — native platform', () => {
  beforeEach(() => {
    Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true })
  })

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: originalPlatformOS, configurable: true })
  })

  it('shows "Open Settings" button on native when canAskAgain is false', () => {
    render(<PermissionBanner canAskAgain={false} onRetry={jest.fn()} />)

    expect(screen.getByText('Open Settings')).toBeTruthy()
    expect(
      screen.queryByText('Please enable location in your browser settings'),
    ).toBeNull()
  })
})
