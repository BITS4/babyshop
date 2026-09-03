import type { CartItem } from "@/lib/cart/cart"
import type { CheckoutCustomer } from "./customer"
import { z } from "zod"

const failureSchema = z.object({ error: z.object({ message: z.string() }) })

export async function submitOrder(options: {
  customer: CheckoutCustomer
  cart: readonly CartItem[]
  paymentIntentId: string | null
  email: string
  getIdToken: () => Promise<string>
  fetcher?: typeof fetch
}): Promise<void> {
  const token = await options.getIdToken()
  const response = await (options.fetcher ?? fetch)("/api/orders", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      ...options.customer,
      paymentIntentId: options.paymentIntentId,
      items: options.cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
    }),
  })
  if (!response.ok) {
    const payload: unknown = await response.json()
    const failure = failureSchema.safeParse(payload)
    throw new Error(failure.success ? failure.data.error.message : "Order could not be saved")
  }
}
