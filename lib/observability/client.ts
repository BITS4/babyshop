import * as Sentry from "@sentry/nextjs"

export function reportClientError(
  error: unknown,
  context?: Record<string, string | number | boolean>
) {
  Sentry.captureException(error, context ? { extra: context } : undefined)
}
