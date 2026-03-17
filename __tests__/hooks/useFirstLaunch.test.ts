import { renderHook, act, waitFor } from '@testing-library/react-native'

import { useFirstLaunch } from '@/hooks/useFirstLaunch'

// Mock expo-location
const mockGetForegroundPermissions = jest.fn()
const mockRequestForegroundPermissions = jest.fn()

jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: (...args: unknown[]) => mockGetForegroundPermissions(...args),
  requestForegroundPermissionsAsync: (...args: unknown[]) =>
    mockRequestForegroundPermissions(...args),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: { Low: 2 },
}))

// Mock expo-notifications
const mockGetNotifPermissions = jest.fn()
const mockRequestNotifPermissions = jest.fn()
const mockSetNotifChannel = jest.fn()

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: (...args: unknown[]) => mockGetNotifPermissions(...args),
  requestPermissionsAsync: (...args: unknown[]) => mockRequestNotifPermissions(...args),
  setNotificationChannelAsync: (...args: unknown[]) => mockSetNotifChannel(...args),
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

jest.mock('@/stores/settings', () => ({
  useSettingsStore: jest.fn((selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      calculationMethod: 'NorthAmerica',
      setCalculationMethod: mockSetCalculationMethod,
    }),
  ),
}))

// Mock services
const mockDetectLocation = jest.fn()
jest.mock('@/services/location', () => ({
  detectLocation: (...args: unknown[]) => mockDetectLocation(...args),
}))

const mockGetRecommendedMethod = jest.fn((_lat: number, _lng: number) => 'UmmAlQura' as const)
jest.mock('@/utils/region', () => ({
  getRecommendedMethod: (...args: [number, number]) => mockGetRecommendedMethod(...args),
}))

describe('hooks/useFirstLaunch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCoordinates = null
    mockGetForegroundPermissions.mockResolvedValue({ status: 'undetermined', canAskAgain: true })
    mockGetNotifPermissions.mockResolvedValue({ status: 'undetermined' })
    mockRequestNotifPermissions.mockResolvedValue({ status: 'granted' })
    mockSetNotifChannel.mockResolvedValue(undefined)
  })

  it('skips permissions when coordinates already exist', async () => {
    mockCoordinates = { latitude: 21.42, longitude: 39.82 }
    mockGetNotifPermissions.mockResolvedValue({ status: 'granted' })

    const { result } = renderHook(() => useFirstLaunch())

    expect(result.current.locationGranted).toBe(true)
    expect(result.current.loading).toBe(false)
    expect(mockDetectLocation).not.toHaveBeenCalled()

    // Returning users get accurate notification status
    await waitFor(() => {
      expect(result.current.notificationGranted).toBe(true)
    })
    expect(mockGetNotifPermissions).toHaveBeenCalledTimes(1)
  })

  it('starts in loading state when no coordinates exist (first launch)', () => {
    mockCoordinates = null
    mockDetectLocation.mockReturnValue(new Promise(() => {})) // never resolves

    const { result } = renderHook(() => useFirstLaunch())

    // Skeleton should show immediately — no flash of empty content
    expect(result.current.loading).toBe(true)
    expect(result.current.locationGranted).toBe(false)
  })

  it('requests location then notification in sequence', async () => {
    mockDetectLocation.mockResolvedValue({
      success: true,
      coordinates: { latitude: 21.42, longitude: 39.82 },
      cityName: 'Makkah',
    })

    const { result } = renderHook(() => useFirstLaunch())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Location was requested first
    expect(mockDetectLocation).toHaveBeenCalledTimes(1)
    expect(result.current.locationGranted).toBe(true)

    // Notification was requested after
    expect(mockRequestNotifPermissions).toHaveBeenCalledTimes(1)
    expect(result.current.notificationGranted).toBe(true)
  })

  it('auto-detects region and sets calculation method on location grant', async () => {
    mockDetectLocation.mockResolvedValue({
      success: true,
      coordinates: { latitude: 21.42, longitude: 39.82 },
      cityName: 'Makkah',
    })

    const { result } = renderHook(() => useFirstLaunch())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockGetRecommendedMethod).toHaveBeenCalledWith(21.42, 39.82)
    expect(mockSetCalculationMethod).toHaveBeenCalledWith('UmmAlQura')
    expect(mockSetLocation).toHaveBeenCalledWith(
      { latitude: 21.42, longitude: 39.82 },
      'Makkah',
      'gps',
    )
  })

  it('handles location denial gracefully', async () => {
    mockDetectLocation.mockResolvedValue({
      success: false,
      reason: 'permission_denied',
    })
    mockGetForegroundPermissions.mockResolvedValue({ status: 'denied', canAskAgain: false })

    const { result } = renderHook(() => useFirstLaunch())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.locationGranted).toBe(false)
    expect(result.current.error).toBe('permission_denied')
    expect(result.current.canAskAgain).toBe(false)
    // Notification should NOT be requested when location fails
    expect(mockRequestNotifPermissions).not.toHaveBeenCalled()
  })

  it('handles notification denial gracefully (still shows prayer times)', async () => {
    mockDetectLocation.mockResolvedValue({
      success: true,
      coordinates: { latitude: 48.85, longitude: 2.35 },
      cityName: 'Paris',
    })
    mockRequestNotifPermissions.mockResolvedValue({ status: 'denied' })

    const { result } = renderHook(() => useFirstLaunch())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Location still granted even though notification denied
    expect(result.current.locationGranted).toBe(true)
    expect(result.current.notificationGranted).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('retry function re-requests location', async () => {
    mockDetectLocation
      .mockResolvedValueOnce({ success: false, reason: 'permission_denied' })
      .mockResolvedValueOnce({
        success: true,
        coordinates: { latitude: 21.42, longitude: 39.82 },
        cityName: 'Makkah',
      })
    mockGetForegroundPermissions.mockResolvedValue({ status: 'denied', canAskAgain: true })

    const { result } = renderHook(() => useFirstLaunch())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('permission_denied')

    // Retry
    await act(async () => {
      result.current.retry()
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockDetectLocation).toHaveBeenCalledTimes(2)
    expect(result.current.locationGranted).toBe(true)
    expect(result.current.error).toBeNull()
  })
})
