import { useCallback, useEffect, useState } from 'react'

import { usePrayerTimes } from '@/hooks/usePrayerTimes'
import { calculatePrayerTimes, getNextPrayer } from '@/services/prayer'
import { useLocationStore } from '@/stores/location'
import { useSettingsStore } from '@/stores/settings'
import type { PrayerTimeInfo } from '@/types/prayer'

export function useNextPrayer(): PrayerTimeInfo | null {
  const coordinates = useLocationStore((s) => s.coordinates)
  const method = useSettingsStore((s) => s.calculationMethod)
  const madhab = useSettingsStore((s) => s.madhab)
  const prayerAdjustments = useSettingsStore((s) => s.prayerAdjustments)
  const todayTimes = usePrayerTimes()

  const computeNext = useCallback((): PrayerTimeInfo | null => {
    if (!todayTimes || !coordinates) return null

    const now = new Date()
    const next = getNextPrayer(todayTimes, now)

    if (next) return next

    // After Isha: calculate tomorrow's Fajr
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowTimes = calculatePrayerTimes(
      coordinates,
      tomorrow,
      method,
      madhab,
      prayerAdjustments,
    )
    return getNextPrayer(tomorrowTimes, now)
  }, [todayTimes, coordinates, method, madhab, prayerAdjustments])

  const [nextPrayer, setNextPrayer] = useState<PrayerTimeInfo | null>(computeNext)

  useEffect(() => {
    const update = () => {
      const next = computeNext()
      setNextPrayer((prev) => {
        if (prev?.prayer === next?.prayer && prev?.time?.getTime() === next?.time?.getTime())
          return prev
        return next
      })
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [computeNext])

  return nextPrayer
}
