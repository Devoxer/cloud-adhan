import { renderHook, act } from '@testing-library/react-native'
import { Magnetometer } from 'expo-sensors'
import { Platform } from 'react-native'

import { useQibla } from '@/hooks/useQibla'

jest.mock('expo-sensors', () => ({
  Magnetometer: {
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
    setUpdateInterval: jest.fn(),
    isAvailableAsync: jest.fn().mockResolvedValue(true),
  },
}))

const rabat = { latitude: 33.97, longitude: -6.85 }

let mockCoordinates: { latitude: number; longitude: number } | null = rabat

jest.mock('@/stores/location', () => ({
  useLocationStore: jest.fn((selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      coordinates: mockCoordinates,
      cityName: 'Rabat',
      source: 'gps',
      lastUpdated: null,
    }),
  ),
}))

describe('hooks/useQibla', () => {
  let mockListener: ((data: { x: number; y: number; z: number }) => void) | null = null
  const mockRemove = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockListener = null
    mockCoordinates = rabat
    ;(Magnetometer.addListener as jest.Mock).mockImplementation((callback) => {
      mockListener = callback
      return { remove: mockRemove }
    })
    ;(Magnetometer.isAvailableAsync as jest.Mock).mockResolvedValue(true)
    Object.defineProperty(Platform, 'OS', { value: 'ios', writable: true })
  })

  it('returns qiblaBearing when coordinates are available', async () => {
    const { result } = renderHook(() => useQibla())
    await act(async () => {})

    expect(result.current.qiblaBearing).not.toBeNull()
    expect(result.current.qiblaBearing).toBeGreaterThan(93)
    expect(result.current.qiblaBearing).toBeLessThan(96)
  })

  it('returns null qiblaBearing when no coordinates', async () => {
    mockCoordinates = null
    const { result } = renderHook(() => useQibla())
    await act(async () => {})

    expect(result.current.qiblaBearing).toBeNull()
  })

  it('subscribes to magnetometer and provides compass heading', async () => {
    const { result } = renderHook(() => useQibla())
    await act(async () => {})

    expect(Magnetometer.setUpdateInterval).toHaveBeenCalledWith(60)
    expect(Magnetometer.addListener).toHaveBeenCalled()
    expect(result.current.isCompassAvailable).toBe(true)

    // Simulate device facing north: magnetic field in +y direction
    act(() => {
      mockListener?.({ x: 0, y: 40, z: 0 })
    })

    expect(result.current.compassHeading).toBe(0)
  })

  it('converts magnetometer readings to heading correctly', async () => {
    const { result } = renderHook(() => useQibla())
    await act(async () => {})

    // Device faces east: field in -x → heading 90°
    act(() => {
      mockListener?.({ x: -40, y: 0, z: 0 })
    })
    expect(result.current.compassHeading).toBeCloseTo(90, 0)

    // Device faces south: field in -y → heading 180°
    act(() => {
      mockListener?.({ x: 0, y: -40, z: 0 })
    })
    expect(result.current.compassHeading).toBeCloseTo(180, 0)

    // Device faces west: field in +x → heading 270°
    act(() => {
      mockListener?.({ x: 40, y: 0, z: 0 })
    })
    expect(result.current.compassHeading).toBeCloseTo(270, 0)
  })

  it('calculates relative qiblaDirection from heading', async () => {
    const { result } = renderHook(() => useQibla())
    await act(async () => {})

    // Heading 0° (north, field in +y), Qibla ~94.5° → direction ~94.5° (to the right)
    act(() => {
      mockListener?.({ x: 0, y: 40, z: 0 })
    })

    expect(result.current.qiblaDirection).not.toBeNull()
    expect(result.current.qiblaDirection).toBeGreaterThan(90)
    expect(result.current.qiblaDirection).toBeLessThan(100)
  })

  it('facingQibla is true when within ±5° threshold', async () => {
    const { result } = renderHook(() => useQibla())
    await act(async () => {})

    const qibla = result.current.qiblaBearing!
    // To produce heading H with atan2(-x, y): x = -sin(H) * mag, y = cos(H) * mag
    const radians = qibla * (Math.PI / 180)
    const x = -Math.sin(radians) * 40
    const y = Math.cos(radians) * 40

    act(() => {
      mockListener?.({ x, y, z: 30 })
    })

    expect(result.current.facingQibla).toBe(true)
  })

  it('facingQibla is false when outside ±5° threshold', async () => {
    const { result } = renderHook(() => useQibla())
    await act(async () => {})

    // Heading 0° (north, field in +y), Qibla ~94.5° → diff ~94.5° → not facing
    act(() => {
      mockListener?.({ x: 0, y: 40, z: 30 })
    })

    expect(result.current.facingQibla).toBe(false)
  })

  it('facingQibla at exactly ±5° boundary (inclusive)', async () => {
    const { result } = renderHook(() => useQibla())
    await act(async () => {})

    const qibla = result.current.qiblaBearing!
    const heading = qibla - 5
    const radians = heading * (Math.PI / 180)
    const x = -Math.sin(radians) * 40
    const y = Math.cos(radians) * 40

    act(() => {
      mockListener?.({ x, y, z: 30 })
    })

    expect(result.current.facingQibla).toBe(true)
  })

  it('facingQibla at ±5.1° is false', async () => {
    const { result } = renderHook(() => useQibla())
    await act(async () => {})

    const qibla = result.current.qiblaBearing!
    const heading = qibla - 5.1
    const radians = heading * (Math.PI / 180)
    const x = -Math.sin(radians) * 40
    const y = Math.cos(radians) * 40

    act(() => {
      mockListener?.({ x, y, z: 30 })
    })

    expect(result.current.facingQibla).toBe(false)
  })

  describe('calibration detection', () => {
    it('sets needsCalibration when magnitude is below Earth field range', async () => {
      const { result } = renderHook(() => useQibla())
      await act(async () => {})

      // Magnitude = sqrt(5² + 5² + 5²) ≈ 8.66 (below 25 μT)
      act(() => {
        mockListener?.({ x: 5, y: 5, z: 5 })
      })

      expect(result.current.needsCalibration).toBe(true)
    })

    it('sets needsCalibration when magnitude is above Earth field range', async () => {
      const { result } = renderHook(() => useQibla())
      await act(async () => {})

      // Magnitude = sqrt(50² + 50² + 50²) ≈ 86.6 (above 65 μT)
      act(() => {
        mockListener?.({ x: 50, y: 50, z: 50 })
      })

      expect(result.current.needsCalibration).toBe(true)
    })

    it('sets needsCalibration when readings are stuck', async () => {
      const { result } = renderHook(() => useQibla())
      await act(async () => {})

      // Send 5 identical readings within normal range
      for (let i = 0; i < 5; i++) {
        act(() => {
          mockListener?.({ x: 30, y: 20, z: 10 })
        })
      }

      expect(result.current.needsCalibration).toBe(true)
    })

    it('does not flag calibration for normal varying readings', async () => {
      const { result } = renderHook(() => useQibla())
      await act(async () => {})

      const readings = [
        { x: 30, y: 20, z: 10 },
        { x: 31, y: 19, z: 11 },
        { x: 29, y: 21, z: 10 },
        { x: 30, y: 20, z: 12 },
        { x: 32, y: 18, z: 11 },
      ]

      for (const reading of readings) {
        act(() => {
          mockListener?.(reading)
        })
      }

      expect(result.current.needsCalibration).toBe(false)
    })
  })

  describe('web/desktop fallback', () => {
    it('returns static bearing without compass on web', async () => {
      Object.defineProperty(Platform, 'OS', { value: 'web', writable: true })

      const { result } = renderHook(() => useQibla())
      await act(async () => {})

      expect(result.current.isCompassAvailable).toBe(false)
      expect(result.current.qiblaBearing).not.toBeNull()
      expect(result.current.compassHeading).toBeNull()
      expect(result.current.qiblaDirection).toBeNull()
      expect(result.current.facingQibla).toBe(false)
    })

    it('returns static bearing when magnetometer unavailable', async () => {
      ;(Magnetometer.isAvailableAsync as jest.Mock).mockResolvedValue(false)

      const { result } = renderHook(() => useQibla())
      await act(async () => {})

      expect(result.current.isCompassAvailable).toBe(false)
      expect(result.current.qiblaBearing).not.toBeNull()
      expect(result.current.compassHeading).toBeNull()
      expect(result.current.qiblaDirection).toBeNull()
      expect(result.current.facingQibla).toBe(false)
    })
  })

  it('cleans up subscription on unmount', async () => {
    const { unmount } = renderHook(() => useQibla())
    await act(async () => {})

    unmount()

    expect(mockRemove).toHaveBeenCalled()
  })

  it('handles magnetometer access error', async () => {
    ;(Magnetometer.isAvailableAsync as jest.Mock).mockRejectedValue(new Error('Sensor access denied'))

    const { result } = renderHook(() => useQibla())
    await act(async () => {})

    expect(result.current.error).toBe('Sensor access denied')
    expect(result.current.isCompassAvailable).toBe(false)
  })
})
