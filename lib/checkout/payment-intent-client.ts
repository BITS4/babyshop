import type { CartItem } from "@/lib/cart/cart"
import { z } from "zod"

const intentResponseSchema = z.object({ clientSecret: z.string().min(1) })

export type PaymentUser = { getIdToken: () => Promise<string> }

export function cartFingerprint(cart: readonly CartItem[]): string {
  return cart
    .map((item) => `${item.id}:${item.quantity}`)
    .sort()
    .join("|")
}

export async function requestPaymentIntent(options: {
  cart: readonly CartItem[]
  user: PaymentUser
  idempotencyKey: string
  signal?: AbortSignal
  fetcher?: typeof fetch
}): Promise<string> {
  const token = await options.user.getIdToken()
  const response = await (options.fetcher ?? fetch)("/api/create-payment-intent", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Idempotency-Key": options.idempotencyKey,
    },
    body: JSON.stringify({
      items: options.cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
      currency: "usd",
    }),
    ...(options.signal ? { signal: options.signal } : {}),
  })
  const payload: unknown = await response.json()
  if (!response.ok) {
    const message = z.object({ error: z.object({ message: z.string() }) }).safeParse(payload)
    throw new Error(
      message.success ? message.data.error.message : "Payment could not be initialized"
    )
  }
  const parsed = intentResponseSchema.safeParse(payload)
  if (!parsed.success) throw new Error("Payment provider returned an invalid response")
  return parsed.data.clientSecret
}
