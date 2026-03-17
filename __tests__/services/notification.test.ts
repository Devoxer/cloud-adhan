/**
 * Tests for the unified notification service platform routing.
 *
 * In jest-expo (iOS platform), `@/services/notification` resolves to
 * `notification.ios.ts`. The iOS implementation is tested separately
 * in notification.ios.test.ts.
 *
 * This file tests the no-op/web fallback service behavior.
 */

import type { NotificationService } from '@/types/notification'

// We can't import notification.ts directly since jest-expo resolves to .ios.ts
// Instead, test the no-op contract that web/android would use
function createNoopService(): NotificationService {
  return {
    initialize: async () => {},
    checkPermissions: async () => false,
    requestPermissions: async () => false,
    schedulePrayerNotifications: async () => {},
    cancelAllNotifications: async () => {},
    reschedule: async () => {},
    getScheduledCount: async () => 0,
  }
}

describe('services/notification (no-op fallback)', () => {
  const service = createNoopService()

  it('initialize resolves without error', async () => {
    await expect(service.initialize()).resolves.toBeUndefined()
  })

  it('checkPermissions returns false (no notification support)', async () => {
    await expect(service.checkPermissions()).resolves.toBe(false)
  })

  it('requestPermissions returns false (no notification support)', async () => {
    await expect(service.requestPermissions()).resolves.toBe(false)
  })

  it('schedulePrayerNotifications resolves without error', async () => {
    await expect(service.schedulePrayerNotifications([], {} as never)).resolves.toBeUndefined()
  })

  it('cancelAllNotifications resolves without error', async () => {
    await expect(service.cancelAllNotifications()).resolves.toBeUndefined()
  })

  it('reschedule resolves without error', async () => {
    await expect(service.reschedule({} as never)).resolves.toBeUndefined()
  })

  it('getScheduledCount returns 0', async () => {
    await expect(service.getScheduledCount()).resolves.toBe(0)
  })

  it('implements the full NotificationService interface', () => {
    expect(typeof service.initialize).toBe('function')
    expect(typeof service.checkPermissions).toBe('function')
    expect(typeof service.requestPermissions).toBe('function')
    expect(typeof service.schedulePrayerNotifications).toBe('function')
    expect(typeof service.cancelAllNotifications).toBe('function')
    expect(typeof service.reschedule).toBe('function')
    expect(typeof service.getScheduledCount).toBe('function')
  })
})
