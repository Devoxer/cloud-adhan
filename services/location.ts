import * as Location from 'expo-location'

import type { Coordinates } from '@/types/prayer'
import { captureError } from '@/utils/sentry'

export type LocationResult =
  | { success: true; coordinates: Coordinates; cityName: string | null }
  | { success: false; reason: 'permission_denied' | 'unavailable' | 'timeout' }

export const SIGNIFICANT_DISTANCE_KM = 5
const GPS_TIMEOUT_MS = 15_000

export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { granted } = await Location.requestForegroundPermissionsAsync()
    return granted
  } catch {
    return false
  }
}

export async function detectLocation(): Promise<LocationResult> {
  try {
    const { granted } = await Location.requestForegroundPermissionsAsync()
    if (!granted) {
      return { success: false, reason: 'permission_denied' }
    }

    const location = await Promise.race([
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('GPS_TIMEOUT')), GPS_TIMEOUT_MS),
      ),
    ])

    const coordinates: Coordinates = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    }

    const cityName = await resolveLocationName(coordinates)

    return { success: true, coordinates, cityName }
  } catch (error) {
    if (error instanceof Error && error.message === 'GPS_TIMEOUT') {
      return { success: false, reason: 'timeout' }
    }
    captureError(error, { service: 'location', operation: 'detectLocation' })
    return { success: false, reason: 'unavailable' }
  }
}

export async function resolveLocationName(coordinates: Coordinates): Promise<string | null> {
  try {
    const addresses = await Location.reverseGeocodeAsync({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    })
    return addresses[0]?.city ?? null
  } catch (error) {
    captureError(error, { service: 'location', operation: 'resolveLocationName' })
    return null
  }
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371
  const dLat = toRad(coord2.latitude - coord1.latitude)
  const dLon = toRad(coord2.longitude - coord1.longitude)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.latitude)) *
      Math.cos(toRad(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function hasSignificantLocationChange(
  oldCoords: Coordinates | null,
  newCoords: Coordinates | null,
): boolean {
  if (!oldCoords || !newCoords) {
    return true
  }
  return calculateDistance(oldCoords, newCoords) > SIGNIFICANT_DISTANCE_KM
}
