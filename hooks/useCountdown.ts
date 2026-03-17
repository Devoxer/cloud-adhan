import { useEffect, useState } from 'react'

type CountdownValues = {
  hours: number
  minutes: number
  seconds: number
}

const ZERO: CountdownValues = { hours: 0, minutes: 0, seconds: 0 }

function computeRemaining(targetDate: Date | null): CountdownValues {
  if (!targetDate) return ZERO
  const diff = targetDate.getTime() - Date.now()
  if (diff <= 0) return ZERO
  const totalSeconds = Math.floor(diff / 1000)
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

export function useCountdown(targetDate: Date | null): CountdownValues {
  const [state, setState] = useState<CountdownValues>(() => computeRemaining(targetDate))

  useEffect(() => {
    const update = () => {
      setState(computeRemaining(targetDate))
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  return state
}
