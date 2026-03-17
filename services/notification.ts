import type { NotificationService } from '@/types/notification'

// Web and fallback platform — no-op notification service
// React Native's module resolution auto-selects:
//   iOS → notification.ios.ts
//   Android → notification.android.ts (Story 3.2)
//   Web/other → notification.ts (this file)

export const notificationService: NotificationService = {
  initialize: async () => {},
  checkPermissions: async () => false,
  requestPermissions: async () => false,
  schedulePrayerNotifications: async () => {},
  cancelAllNotifications: async () => {},
  reschedule: async () => {},
  getScheduledCount: async () => 0,
}
