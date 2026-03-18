import { renderHook, act, waitFor } from '@testing-library/react-native'

import { useNotifications } from '@/hooks/useNotifications'
import { Prayer } from '@/types/prayer'

// Mock notification service
const mockReschedule = jest.fn().mockResolvedValue(undefined)
const mockCheckPermissions = jest.fn().mockResolvedValue(true)
const mockGetScheduledCount = jest.fn().mockResolvedValue(25)

jest.mock('@/services/notification', () => ({
  notificationService: {
    initialize: jest.fn().mockResolvedValue(undefined),
    reschedule: (...args: unknown[]) => mockReschedule(...args),
    checkPermissions: (...args: unknown[]) => mockCheckPermissions(...args),
    requestPermissions: jest.fn().mockResolvedValue(true),
    cancelAllNotifications: jest.fn().mockResolvedValue(undefined),
    schedulePrayerNotifications: jest.fn().mockResolvedValue(undefined),
    getScheduledCount: (...args: unknown[]) => mockGetScheduledCount(...args),
  },
}))

// Mock stores
let mockSettings = {
  calculationMethod: 'Morocco',
  madhab: 'shafi' as const,
  notifications: {
    [Prayer.Fajr]: true,
    [Prayer.Dhuhr]: true,
    [Prayer.Asr]: true,
    [Prayer.Maghrib]: true,
    [Prayer.Isha]: true,
  },
  prayerSounds: {
    fajr: 'makkah',
    dhuhr: 'makkah',
    asr: 'makkah',
    maghrib: 'makkah',
    isha: 'makkah',
  },
  prayerAdjustments: {
    fajr: 0,
    sunrise: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  },
  reminders: {
    fajr: { enabled: false, minutes: 15 },
    dhuhr: { enabled: false, minutes: 15 },
    asr: { enabled: false, minutes: 15 },
    maghrib: { enabled: false, minutes: 15 },
    isha: { enabled: false, minutes: 15 },
  },
}

let mockCoordinates: { latitude: number; longitude: number } | null = {
  latitude: 33.5731,
  longitude: -7.5898,
}

jest.mock('@/stores/settings', () => {
  const fn = jest.fn((selector: (state: Record<string, unknown>) => unknown) =>
    selector(mockSettings as unknown as Record<string, unknown>),
  )
  ;(fn as unknown as Record<string, unknown>).getState = () => mockSettings
  return { useSettingsStore: fn }
})

jest.mock('@/stores/location', () => {
  const fn = jest.fn((selector: (state: Record<string, unknown>) => unknown) =>
    selector({ coordinates: mockCoordinates } as unknown as Record<string, unknown>),
  )
  ;(fn as unknown as Record<string, unknown>).getState = () => ({
    coordinates: mockCoordinates,
  })
  return { useLocationStore: fn }
})

describe('hooks/useNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    mockCheckPermissions.mockResolvedValue(true)
    mockReschedule.mockResolvedValue(undefined)
    mockGetScheduledCount.mockResolvedValue(25)
    mockSettings = {
      calculationMethod: 'Morocco',
      madhab: 'shafi',
      notifications: {
        [Prayer.Fajr]: true,
        [Prayer.Dhuhr]: true,
        [Prayer.Asr]: true,
        [Prayer.Maghrib]: true,
        [Prayer.Isha]: true,
      },
      prayerSounds: {
        fajr: 'makkah',
        dhuhr: 'makkah',
        asr: 'makkah',
        maghrib: 'makkah',
        isha: 'makkah',
      },
      prayerAdjustments: {
        fajr: 0,
        sunrise: 0,
        dhuhr: 0,
        asr: 0,
        maghrib: 0,
        isha: 0,
      },
      reminders: {
        fajr: { enabled: false, minutes: 15 },
        dhuhr: { enabled: false, minutes: 15 },
        asr: { enabled: false, minutes: 15 },
        maghrib: { enabled: false, minutes: 15 },
        isha: { enabled: false, minutes: 15 },
      },
    }
    mockCoordinates = { latitude: 33.5731, longitude: -7.5898 }
  })

  afterEach(() => {
    // Flush any pending timers before switching to real timers
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('triggers debounced reschedule on mount when permission granted', async () => {
    renderHook(() => useNotifications())

    await waitFor(() => {
      expect(mockCheckPermissions).toHaveBeenCalledTimes(1)
    })

    // Reschedule is debounced (300ms) after permission is confirmed
    act(() => {
      jest.advanceTimersByTime(350)
    })

    await waitFor(() => {
      expect(mockReschedule).toHaveBeenCalledTimes(1)
    })
  })

  it('does not reschedule on mount when permission denied', async () => {
    mockCheckPermissions.mockResolvedValue(false)

    renderHook(() => useNotifications())

    await waitFor(() => {
      expect(mockCheckPermissions).toHaveBeenCalledTimes(1)
    })

    act(() => {
      jest.advanceTimersByTime(350)
    })

    // No reschedule since permission was denied
    expect(mockReschedule).not.toHaveBeenCalled()
  })

  it('triggers reschedule when calculation method changes', async () => {
    const { useSettingsStore } = require('@/stores/settings')

    const { rerender } = renderHook(() => useNotifications())

    await waitFor(() => {
      expect(mockCheckPermissions).toHaveBeenCalledTimes(1)
    })

    // Let initial debounced reschedule fire
    act(() => {
      jest.advanceTimersByTime(350)
    })

    await waitFor(() => {
      expect(mockReschedule).toHaveBeenCalledTimes(1)
    })

    // Change calculation method
    mockSettings = { ...mockSettings, calculationMethod: 'Egyptian' }
    ;(useSettingsStore as jest.Mock).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) =>
        selector(mockSettings as unknown as Record<string, unknown>),
    )
    rerender({})

    // Wait for debounce
    act(() => {
      jest.advanceTimersByTime(350)
    })

    await waitFor(() => {
      expect(mockReschedule).toHaveBeenCalledTimes(2)
    })
  })

  it('triggers reschedule when location changes', async () => {
    const { useLocationStore } = require('@/stores/location')

    const { rerender } = renderHook(() => useNotifications())

    await waitFor(() => {
      expect(mockCheckPermissions).toHaveBeenCalledTimes(1)
    })

    act(() => {
      jest.advanceTimersByTime(350)
    })

    await waitFor(() => {
      expect(mockReschedule).toHaveBeenCalledTimes(1)
    })

    // Change location
    mockCoordinates = { latitude: 21.42, longitude: 39.82 }
    ;(useLocationStore as jest.Mock).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) =>
        selector({ coordinates: mockCoordinates } as unknown as Record<string, unknown>),
    )
    rerender({})

    act(() => {
      jest.advanceTimersByTime(350)
    })

    await waitFor(() => {
      expect(mockReschedule).toHaveBeenCalledTimes(2)
    })
  })

  it('triggers reschedule when notification toggles change', async () => {
    const { useSettingsStore } = require('@/stores/settings')

    const { rerender } = renderHook(() => useNotifications())

    await waitFor(() => {
      expect(mockCheckPermissions).toHaveBeenCalledTimes(1)
    })

    act(() => {
      jest.advanceTimersByTime(350)
    })

    await waitFor(() => {
      expect(mockReschedule).toHaveBeenCalledTimes(1)
    })

    // Toggle off Dhuhr
    mockSettings = {
      ...mockSettings,
      notifications: { ...mockSettings.notifications, [Prayer.Dhuhr]: false },
    }
    ;(useSettingsStore as jest.Mock).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) =>
        selector(mockSettings as unknown as Record<string, unknown>),
    )
    rerender({})

    act(() => {
      jest.advanceTimersByTime(350)
    })

    await waitFor(() => {
      expect(mockReschedule).toHaveBeenCalledTimes(2)
    })
  })

  it('triggers reschedule when prayer sound changes', async () => {
    const { useSettingsStore } = require('@/stores/settings')

    const { rerender } = renderHook(() => useNotifications())

    await waitFor(() => {
      expect(mockCheckPermissions).toHaveBeenCalledTimes(1)
    })

    act(() => {
      jest.advanceTimersByTime(350)
    })

    await waitFor(() => {
      expect(mockReschedule).toHaveBeenCalledTimes(1)
    })

    // Change prayer sound
    mockSettings = { ...mockSettings, prayerSounds: { ...mockSettings.prayerSounds, fajr: 'madinah' } }
    ;(useSettingsStore as jest.Mock).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) =>
        selector(mockSettings as unknown as Record<string, unknown>),
    )
    rerender({})

    act(() => {
      jest.advanceTimersByTime(350)
    })

    await waitFor(() => {
      expect(mockReschedule).toHaveBeenCalledTimes(2)
    })
  })

  it('triggers reschedule when prayerAdjustments changes', async () => {
    const { useSettingsStore } = require('@/stores/settings')

    const { rerender } = renderHook(() => useNotifications())

    await waitFor(() => {
      expect(mockCheckPermissions).toHaveBeenCalledTimes(1)
    })

    act(() => {
      jest.advanceTimersByTime(350)
    })

    await waitFor(() => {
      expect(mockReschedule).toHaveBeenCalledTimes(1)
    })

    // Change prayerAdjustments
    mockSettings = {
      ...mockSettings,
      prayerAdjustments: { ...mockSettings.prayerAdjustments, fajr: 5 },
    }
    ;(useSettingsStore as jest.Mock).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) =>
        selector(mockSettings as unknown as Record<string, unknown>),
    )
    rerender({})

    act(() => {
      jest.advanceTimersByTime(350)
    })

    await waitFor(() => {
      expect(mockReschedule).toHaveBeenCalledTimes(2)
    })

    // Verify params include prayerAdjustments
    const lastCallParams = mockReschedule.mock.calls[1][0]
    expect(lastCallParams).toHaveProperty('prayerAdjustments')
    expect(lastCallParams.prayerAdjustments.fajr).toBe(5)
  })

  it('triggers reschedule when reminders change', async () => {
    const { useSettingsStore } = require('@/stores/settings')

    const { rerender } = renderHook(() => useNotifications())

    await waitFor(() => {
      expect(mockCheckPermissions).toHaveBeenCalledTimes(1)
    })

    act(() => {
      jest.advanceTimersByTime(350)
    })

    await waitFor(() => {
      expect(mockReschedule).toHaveBeenCalledTimes(1)
    })

    // Change reminders
    mockSettings = {
      ...mockSettings,
      reminders: {
        ...mockSettings.reminders,
        fajr: { enabled: true, minutes: 15 },
      },
    }
    ;(useSettingsStore as jest.Mock).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) =>
        selector(mockSettings as unknown as Record<string, unknown>),
    )
    rerender({})

    act(() => {
      jest.advanceTimersByTime(350)
    })

    await waitFor(() => {
      expect(mockReschedule).toHaveBeenCalledTimes(2)
    })

    // Verify params include reminders
    const lastCallParams = mockReschedule.mock.calls[1][0]
    expect(lastCallParams).toHaveProperty('reminders')
    expect(lastCallParams.reminders.fajr.enabled).toBe(true)
  })

  it('debounces rapid setting changes into a single reschedule', async () => {
    const { useSettingsStore } = require('@/stores/settings')

    const { rerender } = renderHook(() => useNotifications())

    // Wait for permission check — initial debounce timer is now pending
    await waitFor(() => {
      expect(mockCheckPermissions).toHaveBeenCalledTimes(1)
    })

    // Rapidly change 3 settings within 100ms each
    // Each change resets the debounce timer (including the initial one)
    mockSettings = { ...mockSettings, prayerSounds: { ...mockSettings.prayerSounds, dhuhr: 'madinah' } }
    ;(useSettingsStore as jest.Mock).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) =>
        selector(mockSettings as unknown as Record<string, unknown>),
    )
    rerender({})

    act(() => {
      jest.advanceTimersByTime(100)
    })

    mockSettings = { ...mockSettings, prayerSounds: { ...mockSettings.prayerSounds, fajr: 'fajr-mishary' } }
    ;(useSettingsStore as jest.Mock).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) =>
        selector(mockSettings as unknown as Record<string, unknown>),
    )
    rerender({})

    act(() => {
      jest.advanceTimersByTime(100)
    })

    mockSettings = { ...mockSettings, calculationMethod: 'Egyptian' }
    ;(useSettingsStore as jest.Mock).mockImplementation(
      (selector: (state: Record<string, unknown>) => unknown) =>
        selector(mockSettings as unknown as Record<string, unknown>),
    )
    rerender({})

    // Before debounce completes — no reschedule yet (initial was also debounced)
    expect(mockReschedule).toHaveBeenCalledTimes(0)

    // After debounce
    act(() => {
      jest.advanceTimersByTime(350)
    })

    await waitFor(() => {
      // All changes (including initial) debounced into one reschedule
      expect(mockReschedule).toHaveBeenCalledTimes(1)
    })
  })

  it('returns permissionGranted and scheduledCount', async () => {
    const { result } = renderHook(() => useNotifications())

    await waitFor(() => {
      expect(result.current.permissionGranted).toBe(true)
    })

    act(() => {
      jest.advanceTimersByTime(350)
    })

    await waitFor(() => {
      expect(result.current.scheduledCount).toBe(25)
    })

    expect(typeof result.current.reschedule).toBe('function')
  })
})
