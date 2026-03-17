import { useMemo } from 'react'

import { buildDayPrayerTimes, calculatePrayerTimes } from '@/services/prayer'
import { useLocationStore } from '@/stores/location'
import { useSettingsStore } from '@/stores/settings'
import type { DayPrayerTimes } from '@/types/notification'
import type { PrayerTimes } from '@/types/prayer'

export function usePrayerTimes(date?: Date): PrayerTimes | null {
  const coordinates = useLocationStore((s) => s.coordinates)
  const method = useSettingsStore((s) => s.calculationMethod)
  const madhab = useSettingsStore((s) => s.madhab)

  const dateKey = (date ?? new Date()).toDateString()

  return useMemo(() => {
    if (!coordinates) return null
    return calculatePrayerTimes(coordinates, new Date(dateKey), method, madhab)
  }, [coordinates, method, madhab, dateKey])
}

export function useMultiDayPrayerTimes(days: number): DayPrayerTimes[] | null {
  const coordinates = useLocationStore((s) => s.coordinates)
  const method = useSettingsStore((s) => s.calculationMethod)
  const madhab = useSettingsStore((s) => s.madhab)
  const dateKey = new Date().toDateString()

  // biome-ignore lint/correctness/useExhaustiveDependencies: dateKey invalidates memo at midnight
  return useMemo(() => {
    if (!coordinates) return null
    return buildDayPrayerTimes(coordinates, method, madhab, days)
  }, [coordinates, method, madhab, days, dateKey])
}
