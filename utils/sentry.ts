import * as Sentry from '@sentry/react-native'

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (__DEV__) return
  Sentry.captureException(error, context ? { extra: context } : undefined)
}
