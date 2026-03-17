import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { notificationService } from '@/services/notification'
import { useLocationStore } from '@/stores/location'
import { useSettingsStore } from '@/stores/settings'
import type { RescheduleParams } from '@/types/notification'
import { captureError } from '@/utils/sentry'

const DEBOUNCE_MS = 300

function buildRescheduleParams(): RescheduleParams | null {
  const { coordinates } = useLocationStore.getState()
  if (!coordinates) return null

  const { calculationMethod, madhab, notifications, athanSound, fajrSound } =
    useSettingsStore.getState()

  return { coordinates, calculationMethod, madhab, notifications, athanSound, fajrSound }
}

export function useNotifications() {
  const calculationMethod = useSettingsStore((s) => s.calculationMethod)
  const madhab = useSettingsStore((s) => s.madhab)
  const notifications = useSettingsStore((s) => s.notifications)
  const athanSound = useSettingsStore((s) => s.athanSound)
  const fajrSound = useSettingsStore((s) => s.fajrSound)
  const coordinates = useLocationStore((s) => s.coordinates)

  const [permissionGranted, setPermissionGranted] = useState(false)
  const [scheduledCount, setScheduledCount] = useState(0)
  const rescheduleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasMountedRef = useRef(false)

  // Build a trigger key that changes whenever any scheduling-relevant setting changes
  const schedulingTrigger = useMemo(
    () =>
      JSON.stringify({
        calculationMethod,
        madhab,
        notifications,
        athanSound,
        fajrSound,
        coordinates,
      }),
    [calculationMethod, madhab, notifications, athanSound, fajrSound, coordinates],
  )

  const reschedule = useCallback(async () => {
    const params = buildRescheduleParams()
    if (!params) return

    try {
      await notificationService.reschedule(params)
      const count = await notificationService.getScheduledCount()
      setScheduledCount(count)
    } catch (error) {
      captureError(error, { hook: 'useNotifications', operation: 'reschedule' })
    }
  }, [])

  const debouncedReschedule = useCallback(() => {
    if (rescheduleTimeoutRef.current) {
      clearTimeout(rescheduleTimeoutRef.current)
    }
    rescheduleTimeoutRef.current = setTimeout(() => {
      reschedule()
    }, DEBOUNCE_MS)
  }, [reschedule])

  // On mount: check permission status (do NOT request — useFirstLaunch handles that)
  useEffect(() => {
    if (hasMountedRef.current) return
    hasMountedRef.current = true

    notificationService
      .checkPermissions()
      .then((granted) => {
        setPermissionGranted(granted)
      })
      .catch(() => {
        // Permission check failure is non-blocking
      })
  }, [])

  // Reschedule when permission is granted or relevant settings/location change.
  // This handles both the initial schedule (when permissionGranted flips to true)
  // and subsequent reschedules on settings changes — single reschedule path.
  useEffect(() => {
    if (!hasMountedRef.current || !permissionGranted || !schedulingTrigger) return
    debouncedReschedule()
  }, [schedulingTrigger, permissionGranted, debouncedReschedule])

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (rescheduleTimeoutRef.current) {
        clearTimeout(rescheduleTimeoutRef.current)
      }
    }
  }, [])

  return { permissionGranted, scheduledCount, reschedule }
}
