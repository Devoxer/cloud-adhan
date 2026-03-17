import { renderHook, act } from '@testing-library/react-native'

import { useCountdown } from '@/hooks/useCountdown'

describe('hooks/useCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-03-15T12:00:00Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns hours, minutes, seconds for a future target date', () => {
    // Target: 2 hours 30 minutes 45 seconds in the future
    const target = new Date('2026-03-15T14:30:45Z')
    const { result } = renderHook(() => useCountdown(target))

    expect(result.current.hours).toBe(2)
    expect(result.current.minutes).toBe(30)
    expect(result.current.seconds).toBe(45)
  })

  it('updates every second with fake timers', () => {
    const target = new Date('2026-03-15T12:05:00Z') // 5 minutes in the future
    const { result } = renderHook(() => useCountdown(target))

    expect(result.current.minutes).toBe(5)
    expect(result.current.seconds).toBe(0)

    // Advance 1 second
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(result.current.minutes).toBe(4)
    expect(result.current.seconds).toBe(59)

    // Advance another second
    act(() => {
      jest.advanceTimersByTime(1000)
    })

    expect(result.current.minutes).toBe(4)
    expect(result.current.seconds).toBe(58)
  })

  it('returns zeros when target is null', () => {
    const { result } = renderHook(() => useCountdown(null))

    expect(result.current.hours).toBe(0)
    expect(result.current.minutes).toBe(0)
    expect(result.current.seconds).toBe(0)
  })

  it('returns zeros when target is in the past', () => {
    const pastDate = new Date('2026-03-15T11:00:00Z') // 1 hour ago
    const { result } = renderHook(() => useCountdown(pastDate))

    expect(result.current.hours).toBe(0)
    expect(result.current.minutes).toBe(0)
    expect(result.current.seconds).toBe(0)
  })

  it('cleans up interval on unmount', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval')
    const target = new Date('2026-03-15T13:00:00Z')
    const { unmount } = renderHook(() => useCountdown(target))

    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
    clearIntervalSpy.mockRestore()
  })

  it('recalculates when targetDate changes', () => {
    const target1 = new Date('2026-03-15T13:00:00Z') // 1 hour away
    const target2 = new Date('2026-03-15T14:00:00Z') // 2 hours away

    const { result, rerender } = renderHook(
      ({ target }: { target: Date | null }) => useCountdown(target),
      { initialProps: { target: target1 } },
    )

    expect(result.current.hours).toBe(1)
    expect(result.current.minutes).toBe(0)

    rerender({ target: target2 })

    expect(result.current.hours).toBe(2)
    expect(result.current.minutes).toBe(0)
  })
})
