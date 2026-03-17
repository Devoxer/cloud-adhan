import { act, renderHook, waitFor } from '@testing-library/react-native'
import { Platform } from 'react-native'

import { useFirstLaunch } from '@/hooks/useFirstLaunch'

// Mock expo-location
const mockGetForegroundPermissions = jest.fn()

jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: (...args: unknown[]) => mockGetForegroundPermissions(...args),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: { Low: 2 },
}))

// Mock expo-notifications
const mockGetNotifPermissions = jest.fn()
const mockRequestNotifPermissions = jest.fn()

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: (...args: unknown[]) => mockGetNotifPermissions(...args),
  requestPermissionsAsync: (...args: unknown[]) => mockRequestNotifPermissions(...args),
  setNotificationChannelAsync: jest.fn(),
  AndroidImportance: { HIGH: 4 },
}))

// Mock stores
const mockSetLocation = jest.fn()
const mockSetCalculationMethod = jest.fn()
let mockCoordinates: { latitude: number; longitude: number } | null = null

jest.mock('@/stores/location', () => ({
  useLocationStore: jest.fn((selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      coordinates: mockCoordinates,
      setLocation: mockSetLocation,
    }),
  ),
}))

jest.mock('@/stores/settings', () => {
  const state = {
    calculationMethod: 'NorthAmerica',
    setCalculationMethod: mockSetCalculationMethod,
  }
  const store = (selector: (s: Record<string, unknown>) => unknown) => selector(state)
  store.getState = () => state
  return { useSettingsStore: store }
})

// Mock location service
jest.mock('@/services/location', () => ({
  detectLocation: jest.fn(),
}))

// Mock region utils
jest.mock('@/utils/region', () => ({
  getRecommendedMethod: jest.fn(() => 'NorthAmerica'),
}))

const originalPlatformOS = Platform.OS

describe('useFirstLaunch — web platform', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true })
    mockCoordinates = { latitude: 33.57, longitude: -7.59 }
  })

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: originalPlatformOS, configurable: true })
  })

  it('returns notificationGranted: false immediately on web (no permission request)', async () => {
    const { result } = renderHook(() => useFirstLaunch())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.notificationGranted).toBe(false)
    // Should NOT call notification permission APIs on web
    expect(mockGetNotifPermissions).not.toHaveBeenCalled()
    expect(mockRequestNotifPermissions).not.toHaveBeenCalled()
  })

  it('still sets locationGranted true when coordinates exist on web', async () => {
    const { result } = renderHook(() => useFirstLaunch())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.locationGranted).toBe(true)
  })
})
