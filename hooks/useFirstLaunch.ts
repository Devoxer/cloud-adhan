import * as Location from 'expo-location'
import * as Notifications from 'expo-notifications'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'

import { detectLocation } from '@/services/location'
import { useLocationStore } from '@/stores/location'
import { useSettingsStore } from '@/stores/settings'
import type { CalculationMethod } from '@/types/prayer'
import { getRecommendedMethod } from '@/utils/region'
import { captureError } from '@/utils/sentry'

// Must match the initial default in stores/settings.ts — used to detect first-launch
const STORE_DEFAULT_METHOD: CalculationMethod = 'NorthAmerica'

type FirstLaunchState = {
  loading: boolean
  locationGranted: boolean
  notificationGranted: boolean
  error: string | null
  canAskAgain: boolean
  retry: () => void
}

async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false // No notifications on web
  try {
    // Android 13+ requires notification channel before requesting permission
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('prayer-alerts', {
        name: 'Prayer Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      })
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    if (existingStatus === 'granted') {
      return true
    }

    const { status } = await Notifications.requestPermissionsAsync()
    return status === 'granted'
  } catch {
    // Notification denial is non-blocking
    return false
  }
}

export function useFirstLaunch(): FirstLaunchState {
  const coordinates = useLocationStore((s) => s.coordinates)
  const setLocation = useLocationStore((s) => s.setLocation)
  const calculationMethod = useSettingsStore((s) => s.calculationMethod)
  const setCalculationMethod = useSettingsStore((s) => s.setCalculationMethod)

  const [loading, setLoading] = useState(!coordinates)
  const [locationGranted, setLocationGranted] = useState(!!coordinates)
  const [notificationGranted, setNotificationGranted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canAskAgain, setCanAskAgain] = useState(true)
  const hasRun = useRef(false)

  const runPermissionFlow = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Check if location permission is already granted
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync()
      if (existingStatus === 'granted' && coordinates) {
        setLocationGranted(true)
        // Still request notification permission if not yet done
        const notifGranted = await requestNotificationPermission()
        setNotificationGranted(notifGranted)
        setLoading(false)
        return
      }

      // Request location (system dialog — TAP 1)
      const result = await detectLocation()

      if (result.success) {
        setLocationGranted(true)
        setLocation(result.coordinates, result.cityName, 'gps')

        // Auto-detect region and set default calculation method (FR6)
        // Only set on first launch — don't overwrite user's existing selection
        if (calculationMethod === STORE_DEFAULT_METHOD) {
          const recommended = getRecommendedMethod(
            result.coordinates.latitude,
            result.coordinates.longitude,
          )
          setCalculationMethod(recommended)
        }

        // Request notifications (system dialog — TAP 2)
        const notifGranted = await requestNotificationPermission()
        setNotificationGranted(notifGranted)
      } else {
        // Check if we can ask again
        const { canAskAgain: canRetry } = await Location.getForegroundPermissionsAsync()
        setCanAskAgain(canRetry)
        setError(result.reason)
      }
    } catch (error) {
      captureError(error, { hook: 'useFirstLaunch', operation: 'permissionFlow' })
      setError('unavailable')
    } finally {
      setLoading(false)
    }
  }, [coordinates, setLocation, calculationMethod, setCalculationMethod])

  const retry = useCallback(() => {
    runPermissionFlow()
  }, [runPermissionFlow])

  // Run permission flow on mount if no coordinates exist
  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    if (coordinates) {
      // Returning user — coordinates already cached
      setLocationGranted(true)
      setLoading(false)
      // Check current notification status without re-requesting (skip on web)
      if (Platform.OS !== 'web') {
        Notifications.getPermissionsAsync().then(({ status }) => {
          setNotificationGranted(status === 'granted')
        })
      }
      return
    }

    runPermissionFlow()
  }, [coordinates, runPermissionFlow])

  return {
    loading,
    locationGranted,
    notificationGranted,
    error,
    canAskAgain,
    retry,
  }
}
