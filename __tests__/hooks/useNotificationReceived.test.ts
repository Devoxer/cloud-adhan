import { renderHook, act } from '@testing-library/react-native'
import { Platform } from 'react-native'

import { useNotificationReceived } from '@/hooks/useNotificationReceived'

// Capture listener callbacks for simulating notifications
let receivedCallback: (() => void) | null = null
let responseCallback: (() => void) | null = null
const mockReceivedRemove = jest.fn()
const mockResponseRemove = jest.fn()

jest.mock('expo-notifications', () => ({
  addNotificationReceivedListener: jest.fn((cb: () => void) => {
    receivedCallback = cb
    return { remove: mockReceivedRemove }
  }),
  addNotificationResponseReceivedListener: jest.fn((cb: () => void) => {
    responseCallback = cb
    return { remove: mockResponseRemove }
  }),
}))

const Notifications = require('expo-notifications')

describe('hooks/useNotificationReceived', () => {
  const originalOS = Platform.OS

  beforeEach(() => {
    jest.clearAllMocks()
    receivedCallback = null
    responseCallback = null
    Object.defineProperty(Platform, 'OS', { value: 'ios', writable: true })
  })

  afterEach(() => {
    Object.defineProperty(Platform, 'OS', { value: originalOS, writable: true })
  })

  it('sets up both listeners on mount', () => {
    const onReceived = jest.fn()
    renderHook(() => useNotificationReceived(onReceived))

    expect(Notifications.addNotificationReceivedListener).toHaveBeenCalledTimes(1)
    expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalledTimes(1)
  })

  it('calls callback when notification is received', () => {
    const onReceived = jest.fn()
    renderHook(() => useNotificationReceived(onReceived))

    act(() => {
      receivedCallback?.()
    })

    expect(onReceived).toHaveBeenCalledTimes(1)
  })

  it('calls callback when notification response is received', () => {
    const onReceived = jest.fn()
    renderHook(() => useNotificationReceived(onReceived))

    act(() => {
      responseCallback?.()
    })

    expect(onReceived).toHaveBeenCalledTimes(1)
  })

  it('cleans up listeners on unmount', () => {
    const onReceived = jest.fn()
    const { unmount } = renderHook(() => useNotificationReceived(onReceived))

    unmount()

    expect(mockReceivedRemove).toHaveBeenCalledTimes(1)
    expect(mockResponseRemove).toHaveBeenCalledTimes(1)
  })

  it('does not add listeners on web', () => {
    Object.defineProperty(Platform, 'OS', { value: 'web', writable: true })

    const onReceived = jest.fn()
    renderHook(() => useNotificationReceived(onReceived))

    expect(Notifications.addNotificationReceivedListener).not.toHaveBeenCalled()
    expect(Notifications.addNotificationResponseReceivedListener).not.toHaveBeenCalled()
  })

  it('uses latest callback via ref (no stale closure)', () => {
    const firstCallback = jest.fn()
    const secondCallback = jest.fn()

    const { rerender } = renderHook<void, { cb: () => void }>(
      ({ cb }) => useNotificationReceived(cb),
      { initialProps: { cb: firstCallback } },
    )

    rerender({ cb: secondCallback })

    act(() => {
      receivedCallback?.()
    })

    expect(firstCallback).not.toHaveBeenCalled()
    expect(secondCallback).toHaveBeenCalledTimes(1)
  })
})
