import {
  calculateDistance,
  hasSignificantLocationChange,
  detectLocation,
  resolveLocationName,
  requestLocationPermission,
  SIGNIFICANT_DISTANCE_KM,
} from '@/services/location'
import type { Coordinates } from '@/types/prayer'

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
  Accuracy: {
    Lowest: 1,
    Low: 2,
    Balanced: 3,
    High: 4,
    Highest: 5,
    BestForNavigation: 6,
  },
}))

import * as Location from 'expo-location'

const mockRequestPermissions =
  Location.requestForegroundPermissionsAsync as jest.Mock
const mockGetCurrentPosition =
  Location.getCurrentPositionAsync as jest.Mock
const mockReverseGeocode = Location.reverseGeocodeAsync as jest.Mock

// Known city coordinates
const newYork: Coordinates = { latitude: 40.7128, longitude: -74.006 }
const losAngeles: Coordinates = { latitude: 34.0522, longitude: -118.2437 }
const london: Coordinates = { latitude: 51.5074, longitude: -0.1278 }
const paris: Coordinates = { latitude: 48.8566, longitude: 2.3522 }
const makkah: Coordinates = { latitude: 21.4225, longitude: 39.8262 }
const madinah: Coordinates = { latitude: 24.4672, longitude: 39.6112 }

describe('services/location', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('SIGNIFICANT_DISTANCE_KM', () => {
    it('equals 5', () => {
      expect(SIGNIFICANT_DISTANCE_KM).toBe(5)
    })
  })

  describe('calculateDistance', () => {
    it('returns ~3944km for New York to Los Angeles', () => {
      const distance = calculateDistance(newYork, losAngeles)
      expect(distance).toBeGreaterThan(3900)
      expect(distance).toBeLessThan(4000)
    })

    it('returns ~344km for London to Paris', () => {
      const distance = calculateDistance(london, paris)
      expect(distance).toBeGreaterThan(330)
      expect(distance).toBeLessThan(360)
    })

    it('returns ~339km for Makkah to Madinah', () => {
      const distance = calculateDistance(makkah, madinah)
      expect(distance).toBeGreaterThan(330)
      expect(distance).toBeLessThan(350)
    })

    it('returns 0km for same point', () => {
      const distance = calculateDistance(makkah, makkah)
      expect(distance).toBe(0)
    })

    it('is commutative (A→B equals B→A)', () => {
      const ab = calculateDistance(london, paris)
      const ba = calculateDistance(paris, london)
      expect(ab).toBeCloseTo(ba, 10)
    })
  })

  describe('hasSignificantLocationChange', () => {
    it('returns false for distance < 5km', () => {
      // Two points ~1km apart
      const coord1: Coordinates = { latitude: 21.4225, longitude: 39.8262 }
      const coord2: Coordinates = { latitude: 21.4315, longitude: 39.8262 }
      expect(calculateDistance(coord1, coord2)).toBeLessThan(5)
      expect(hasSignificantLocationChange(coord1, coord2)).toBe(false)
    })

    it('returns false for exactly same coordinates', () => {
      expect(hasSignificantLocationChange(makkah, makkah)).toBe(false)
    })

    it('returns true for distance > 5km', () => {
      // Two points ~10km apart
      const coord1: Coordinates = { latitude: 21.4225, longitude: 39.8262 }
      const coord2: Coordinates = { latitude: 21.5125, longitude: 39.8262 }
      expect(calculateDistance(coord1, coord2)).toBeGreaterThan(5)
      expect(hasSignificantLocationChange(coord1, coord2)).toBe(true)
    })

    it('returns false for ~4.9km (just under threshold)', () => {
      // ~4.9km apart
      const coord1: Coordinates = { latitude: 21.4225, longitude: 39.8262 }
      const coord2: Coordinates = { latitude: 21.4665, longitude: 39.8262 }
      const dist = calculateDistance(coord1, coord2)
      expect(dist).toBeLessThan(5)
      expect(hasSignificantLocationChange(coord1, coord2)).toBe(false)
    })

    it('returns true for ~5.1km (just over threshold)', () => {
      // ~5.6km apart
      const coord1: Coordinates = { latitude: 21.4225, longitude: 39.8262 }
      const coord2: Coordinates = { latitude: 21.4725, longitude: 39.8262 }
      const dist = calculateDistance(coord1, coord2)
      expect(dist).toBeGreaterThan(5)
      expect(hasSignificantLocationChange(coord1, coord2)).toBe(true)
    })

    it('returns true when oldCoords is null', () => {
      expect(hasSignificantLocationChange(null, makkah)).toBe(true)
    })

    it('returns true when newCoords is null', () => {
      expect(hasSignificantLocationChange(makkah, null)).toBe(true)
    })

    it('returns true when both coords are null', () => {
      expect(hasSignificantLocationChange(null, null)).toBe(true)
    })
  })

  describe('requestLocationPermission', () => {
    it('returns true when permission is granted', async () => {
      mockRequestPermissions.mockResolvedValue({
        status: 'granted',
        granted: true,
        canAskAgain: true,
      })
      const result = await requestLocationPermission()
      expect(result).toBe(true)
      expect(mockRequestPermissions).toHaveBeenCalledTimes(1)
    })

    it('returns false when permission is denied', async () => {
      mockRequestPermissions.mockResolvedValue({
        status: 'denied',
        granted: false,
        canAskAgain: false,
      })
      const result = await requestLocationPermission()
      expect(result).toBe(false)
    })

    it('returns false when requestForegroundPermissionsAsync throws', async () => {
      mockRequestPermissions.mockRejectedValue(
        new Error('Platform error'),
      )
      const result = await requestLocationPermission()
      expect(result).toBe(false)
    })
  })

  describe('detectLocation', () => {
    it('returns success with coordinates and city name', async () => {
      mockRequestPermissions.mockResolvedValue({
        status: 'granted',
        granted: true,
      })
      mockGetCurrentPosition.mockResolvedValue({
        coords: { latitude: 21.4225, longitude: 39.8262, accuracy: 1000 },
        timestamp: Date.now(),
      })
      mockReverseGeocode.mockResolvedValue([
        { city: 'Makkah', country: 'Saudi Arabia' },
      ])

      const result = await detectLocation()

      expect(result).toEqual({
        success: true,
        coordinates: { latitude: 21.4225, longitude: 39.8262 },
        cityName: 'Makkah',
      })
      expect(mockGetCurrentPosition).toHaveBeenCalledWith({
        accuracy: Location.Accuracy.Low,
      })
    })

    it('returns permission_denied when permission not granted', async () => {
      mockRequestPermissions.mockResolvedValue({
        status: 'denied',
        granted: false,
      })

      const result = await detectLocation()

      expect(result).toEqual({
        success: false,
        reason: 'permission_denied',
      })
      expect(mockGetCurrentPosition).not.toHaveBeenCalled()
    })

    it('returns unavailable when getCurrentPositionAsync throws', async () => {
      mockRequestPermissions.mockResolvedValue({
        status: 'granted',
        granted: true,
      })
      mockGetCurrentPosition.mockRejectedValue(
        new Error('Location services disabled'),
      )

      const result = await detectLocation()

      expect(result).toEqual({
        success: false,
        reason: 'unavailable',
      })
    })

    it('returns success with null cityName when reverse geocode fails', async () => {
      mockRequestPermissions.mockResolvedValue({
        status: 'granted',
        granted: true,
      })
      mockGetCurrentPosition.mockResolvedValue({
        coords: { latitude: 0, longitude: 0 },
        timestamp: Date.now(),
      })
      mockReverseGeocode.mockRejectedValue(
        new Error('Geocoding unavailable'),
      )

      const result = await detectLocation()

      expect(result).toEqual({
        success: true,
        coordinates: { latitude: 0, longitude: 0 },
        cityName: null,
      })
    })

    it('returns unavailable when requestForegroundPermissionsAsync throws', async () => {
      mockRequestPermissions.mockRejectedValue(
        new Error('Unexpected error'),
      )

      const result = await detectLocation()

      expect(result).toEqual({
        success: false,
        reason: 'unavailable',
      })
    })

    it('returns timeout when getCurrentPositionAsync takes too long', async () => {
      jest.useFakeTimers()
      mockRequestPermissions.mockResolvedValue({
        status: 'granted',
        granted: true,
      })
      mockGetCurrentPosition.mockImplementation(
        () =>
          new Promise(() => {
            // Never resolves — simulates GPS hang
          }),
      )

      const resultPromise = detectLocation()

      // Flush microtasks so permission check resolves, then advance past timeout
      await jest.advanceTimersByTimeAsync(15_000)

      const result = await resultPromise

      expect(result).toEqual({
        success: false,
        reason: 'timeout',
      })

      jest.useRealTimers()
    })
  })

  describe('resolveLocationName', () => {
    it('returns city name on success', async () => {
      mockReverseGeocode.mockResolvedValue([
        { city: 'Makkah', country: 'Saudi Arabia' },
      ])

      const result = await resolveLocationName(makkah)
      expect(result).toBe('Makkah')
    })

    it('returns null when no city in result', async () => {
      mockReverseGeocode.mockResolvedValue([{ country: 'Ocean' }])

      const result = await resolveLocationName({
        latitude: 0,
        longitude: 0,
      })
      expect(result).toBeNull()
    })

    it('returns null when reverseGeocodeAsync returns empty array', async () => {
      mockReverseGeocode.mockResolvedValue([])

      const result = await resolveLocationName(makkah)
      expect(result).toBeNull()
    })

    it('returns null when reverseGeocodeAsync throws', async () => {
      mockReverseGeocode.mockRejectedValue(
        new Error('Network error'),
      )

      const result = await resolveLocationName(makkah)
      expect(result).toBeNull()
    })
  })
})
