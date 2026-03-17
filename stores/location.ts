import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { mmkvStorage } from '@/utils/storage'

type LocationSource = 'gps' | 'manual'

type LocationState = {
  coordinates: { latitude: number; longitude: number } | null
  cityName: string | null
  source: LocationSource
  lastUpdated: number | null
  setLocation: (
    coordinates: { latitude: number; longitude: number },
    cityName: string | null,
    source: LocationSource,
  ) => void
  clearLocation: () => void
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      coordinates: null,
      cityName: null,
      source: 'gps',
      lastUpdated: null,
      setLocation: (coordinates, cityName, source) =>
        set({
          coordinates,
          cityName,
          source,
          lastUpdated: Date.now(),
        }),
      clearLocation: () =>
        set({
          coordinates: null,
          cityName: null,
          source: 'gps',
          lastUpdated: null,
        }),
    }),
    {
      name: 'location',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
)
