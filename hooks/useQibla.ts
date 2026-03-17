import { Magnetometer } from 'expo-sensors'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Platform } from 'react-native'

import { calculateQiblaDirection } from '@/services/prayer'
import { useLocationStore } from '@/stores/location'

const FACING_THRESHOLD = 5
const UPDATE_INTERVAL = 60
const CALIBRATION_SAMPLE_COUNT = 5
const EARTH_FIELD_MIN = 25
const EARTH_FIELD_MAX = 65
const STUCK_TOLERANCE = 0.1

type UseQiblaReturn = {
  qiblaBearing: number | null
  compassHeading: number | null
  qiblaDirection: number | null
  facingQibla: boolean
  needsCalibration: boolean
  isCompassAvailable: boolean
  error: string | null
}

function magnetometerToHeading(x: number, y: number): number {
  const heading = Math.atan2(-x, y) * (180 / Math.PI)
  return ((heading % 360) + 360) % 360
}

export function useQibla(): UseQiblaReturn {
  const coordinates = useLocationStore((s) => s.coordinates)

  const [compassHeading, setCompassHeading] = useState<number | null>(null)
  const [isCompassAvailable, setIsCompassAvailable] = useState(false)
  const [needsCalibration, setNeedsCalibration] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lastReadings = useRef<{ x: number; y: number; z: number }[]>([])

  const qiblaBearing = useMemo(
    () => (coordinates ? calculateQiblaDirection(coordinates) : null),
    [coordinates],
  )

  const checkCalibration = useCallback((x: number, y: number, z: number) => {
    const magnitude = Math.sqrt(x * x + y * y + z * z)
    if (magnitude < EARTH_FIELD_MIN || magnitude > EARTH_FIELD_MAX) {
      setNeedsCalibration(true)
      return
    }

    lastReadings.current.push({ x, y, z })
    if (lastReadings.current.length > CALIBRATION_SAMPLE_COUNT) {
      lastReadings.current.shift()
    }

    if (lastReadings.current.length === CALIBRATION_SAMPLE_COUNT) {
      const ref = lastReadings.current[0]
      const allSame = lastReadings.current.every(
        (r) =>
          Math.abs(r.x - ref.x) < STUCK_TOLERANCE &&
          Math.abs(r.y - ref.y) < STUCK_TOLERANCE &&
          Math.abs(r.z - ref.z) < STUCK_TOLERANCE,
      )
      setNeedsCalibration(allSame)
    }
  }, [])

  useEffect(() => {
    if (Platform.OS === 'web') {
      setIsCompassAvailable(false)
      return
    }

    let subscription: { remove: () => void } | null = null

    const setup = async () => {
      try {
        const available = await Magnetometer.isAvailableAsync()
        setIsCompassAvailable(available)

        if (!available) return

        Magnetometer.setUpdateInterval(UPDATE_INTERVAL)
        subscription = Magnetometer.addListener(({ x, y, z }) => {
          const heading = magnetometerToHeading(x, y)
          setCompassHeading(heading)
          checkCalibration(x, y, z)
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to access magnetometer')
        setIsCompassAvailable(false)
      }
    }

    setup()

    return () => {
      subscription?.remove()
    }
  }, [checkCalibration])

  let qiblaDirection: number | null = null
  let facingQibla = false

  if (qiblaBearing !== null && compassHeading !== null) {
    let diff = qiblaBearing - compassHeading
    if (diff > 180) diff -= 360
    if (diff < -180) diff += 360
    qiblaDirection = diff
    facingQibla = Math.abs(diff) <= FACING_THRESHOLD
  }

  return {
    qiblaBearing,
    compassHeading,
    qiblaDirection,
    facingQibla,
    needsCalibration,
    isCompassAvailable,
    error,
  }
}
