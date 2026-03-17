import { z } from 'zod'

const envSchema = z.object({
  EXPO_PUBLIC_SENTRY_DSN: z.string().optional(),
})

export const env = envSchema.parse({
  EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
})
