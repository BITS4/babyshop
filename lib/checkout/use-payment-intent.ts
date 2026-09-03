"use client"

import type { CartItem } from "@/lib/cart/cart"
import { useEffect, useMemo, useRef, useState } from "react"
import { cartFingerprint, requestPaymentIntent, type PaymentUser } from "./payment-intent-client"

export function usePaymentIntent(
  cart: readonly CartItem[],
  user: PaymentUser | null,
  enabled: boolean
) {
  const fingerprint = useMemo(() => cartFingerprint(cart), [cart])
  const keys = useRef(new Map<string, string>())
  const [intent, setIntent] = useState<{ fingerprint: string; secret: string } | null>(null)
  const [error, setError] = useState("")
  const clientSecret = intent?.fingerprint === fingerprint ? intent.secret : null

  useEffect(() => {
    if (!enabled || !user || !fingerprint || clientSecret) return
    const controller = new AbortController()
    const idempotencyKey = keys.current.get(fingerprint) ?? `checkout:${crypto.randomUUID()}`
    keys.current.set(fingerprint, idempotencyKey)
    queueMicrotask(() => setError(""))
    void requestPaymentIntent({ cart, user, idempotencyKey, signal: controller.signal })
      .then((secret) => setIntent({ fingerprint, secret }))
      .catch((reason: unknown) => {
        if (!controller.signal.aborted)
          setError(reason instanceof Error ? reason.message : "Payment could not be initialized")
      })
    return () => controller.abort()
  }, [cart, clientSecret, enabled, fingerprint, user])

  return { clientSecret, error, fingerprint }
}
