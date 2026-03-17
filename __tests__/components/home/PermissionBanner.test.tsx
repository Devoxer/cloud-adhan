import { render, screen, fireEvent } from '@testing-library/react-native'

import { PermissionBanner } from '@/components/home/PermissionBanner'

// Mock Ionicons
jest.mock('@expo/vector-icons/Ionicons', () => {
  const RN = jest.requireActual('react-native')
  return RN.Text
})

// Mock expo-router
const mockPush = jest.fn()
jest.mock('expo-router', () => ({
  router: { push: (...args: unknown[]) => mockPush(...args) },
}))

// Mock Linking
const mockOpenSettings = jest.fn()
jest.spyOn(require('react-native').Linking, 'openSettings').mockImplementation(mockOpenSettings)

// Mock useTheme
jest.mock('@/hooks/useTheme', () => ({
  useTheme: jest.fn(() => ({
    tokens: {
      colors: {
        surface: '#1A1614',
        surfaceElevated: '#2A2420',
        textPrimary: '#F5F0E8',
        textSecondary: '#A89F94',
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
      }
      return translations[key] ?? key
    },
  })),
}))

describe('components/home/PermissionBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders denial message and action buttons', () => {
    render(<PermissionBanner canAskAgain={true} onRetry={jest.fn()} />)

    expect(screen.getByText('Location access is needed for accurate prayer times')).toBeTruthy()
    expect(screen.getByText('Set Location Manually')).toBeTruthy()
    expect(screen.getByText('Try Again')).toBeTruthy()
  })

  it('"Try Again" calls retry function', () => {
    const onRetry = jest.fn()
    render(<PermissionBanner canAskAgain={true} onRetry={onRetry} />)

    fireEvent.press(screen.getByLabelText('Try Again'))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('"Open Settings" button present when canAskAgain is false', () => {
    render(<PermissionBanner canAskAgain={false} onRetry={jest.fn()} />)

    expect(screen.getByText('Open Settings')).toBeTruthy()
    expect(screen.queryByText('Try Again')).toBeNull()

    fireEvent.press(screen.getByLabelText('Open Settings'))
    expect(mockOpenSettings).toHaveBeenCalledTimes(1)
  })

  it('accessibility labels on all interactive elements', () => {
    render(<PermissionBanner canAskAgain={true} onRetry={jest.fn()} />)

    expect(screen.getByLabelText('Set Location Manually')).toBeTruthy()
    expect(screen.getByLabelText('Try Again')).toBeTruthy()
  })

  it('"Set Location Manually" navigates to settings', () => {
    render(<PermissionBanner canAskAgain={true} onRetry={jest.fn()} />)

    fireEvent.press(screen.getByLabelText('Set Location Manually'))
    expect(mockPush).toHaveBeenCalledWith('/(tabs)/settings')
  })
})
