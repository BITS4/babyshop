"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-pink-50 px-6 text-gray-900">
        <main className="max-w-md rounded-xl bg-white p-8 text-center shadow">
          <h1 className="text-2xl font-bold text-pink-600">Something went wrong</h1>
          <p className="mt-3 text-gray-600">The error was recorded. You can safely try again.</p>
          <button className="mt-6 rounded bg-pink-600 px-5 py-2 text-white" onClick={reset}>
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
