import { useCallback, useState } from 'react'

import { detectLocation, hasSignificantLocationChange } from '@/services/location'
import { useLocationStore } from '@/stores/location'

export function useLocation() {
  const coordinates = useLocationStore((s) => s.coordinates)
  const cityName = useLocationStore((s) => s.cityName)
  const source = useLocationStore((s) => s.source)
  const setLocation = useLocationStore((s) => s.setLocation)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [locationChanged, setLocationChanged] = useState(false)

  const requestLocation = useCallback(async () => {
    setLoading(true)
    setError(null)
    setLocationChanged(false)

    const result = await detectLocation()

    if (result.success) {
      const changed = hasSignificantLocationChange(coordinates, result.coordinates)
      setLocationChanged(changed)
      setLocation(result.coordinates, result.cityName, 'gps')
    } else {
      setError(result.reason)
    }

    setLoading(false)
  }, [coordinates, setLocation])

  return {
    coordinates,
    cityName,
    source,
    loading,
    error,
    requestLocation,
    locationChanged,
  }
}
