describe('utils/env', () => {
  const originalDSN = process.env.EXPO_PUBLIC_SENTRY_DSN

  beforeEach(() => {
    jest.resetModules()
  })

  afterEach(() => {
    if (originalDSN === undefined) {
      delete process.env.EXPO_PUBLIC_SENTRY_DSN
    } else {
      process.env.EXPO_PUBLIC_SENTRY_DSN = originalDSN
    }
  })

  it('parses env with EXPO_PUBLIC_SENTRY_DSN set', () => {
    process.env.EXPO_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123'
    const { env } = require('@/utils/env')
    expect(env.EXPO_PUBLIC_SENTRY_DSN).toBe('https://test@sentry.io/123')
  })

  it('parses env with EXPO_PUBLIC_SENTRY_DSN undefined', () => {
    delete process.env.EXPO_PUBLIC_SENTRY_DSN
    const { env } = require('@/utils/env')
    expect(env.EXPO_PUBLIC_SENTRY_DSN).toBeUndefined()
  })
})
