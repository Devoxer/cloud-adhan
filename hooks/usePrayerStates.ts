import { useCallback, useEffect, useState } from 'react'

import { usePrayerTimes } from '@/hooks/usePrayerTimes'
import { getCurrentPrayer, getNextPrayer } from '@/services/prayer'
import { Prayer, type PrayerTimes as PrayerTimesType } from '@/types/prayer'

export type PrayerStateType = 'passed' | 'current' | 'next' | 'upcoming'

export type PrayerStateEntry = {
  prayer: Prayer
  time: Date
  state: PrayerStateType
}

const PRAYER_ORDER: Prayer[] = [
  Prayer.Fajr,
  Prayer.Sunrise,
  Prayer.Dhuhr,
  Prayer.Asr,
  Prayer.Maghrib,
  Prayer.Isha,
]

function computeStates(prayerTimes: PrayerTimesType, now: Date): PrayerStateEntry[] {
  const current = getCurrentPrayer(prayerTimes, now)
  const next = getNextPrayer(prayerTimes, now)

  return PRAYER_ORDER.map((prayer) => {
    const time = prayerTimes[prayer]
    let state: PrayerStateType

    if (next && prayer === next.prayer) {
      state = 'next'
    } else if (current && prayer === current.prayer) {
      state = 'current'
    } else if (time.getTime() <= now.getTime()) {
      state = 'passed'
    } else {
      state = 'upcoming'
    }

    return { prayer, time, state }
  })
}

export function usePrayerStates(date?: Date): PrayerStateEntry[] | null {
  const prayerTimes = usePrayerTimes(date)

  const compute = useCallback((): PrayerStateEntry[] | null => {
    if (!prayerTimes) return null
    return computeStates(prayerTimes, new Date())
  }, [prayerTimes])

  const [states, setStates] = useState<PrayerStateEntry[] | null>(compute)

  useEffect(() => {
    const update = () => {
      const next = compute()
      setStates((prev) => {
        if (prev && next && prev.every((p, i) => p.state === next[i].state)) return prev
        return next
      })
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [compute])

  return states
}
