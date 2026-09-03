import { renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { CartItem } from "@/lib/cart/cart"

const requestPaymentIntent = vi.hoisted(() => vi.fn())
vi.mock("./payment-intent-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./payment-intent-client")>()),
  requestPaymentIntent,
}))

import { usePaymentIntent } from "./use-payment-intent"

const item = {
  id: 1,
  quantity: 1,
  name: "Hat",
  price: 4,
  image: "/hat",
  description: "Warm",
  category: "hats",
} satisfies CartItem
const user = { getIdToken: vi.fn().mockResolvedValue("token") }

describe("usePaymentIntent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requestPaymentIntent.mockResolvedValue("client-secret")
  })

  it("requests once and reuses the secret for an unchanged cart", async () => {
    const { result, rerender } = renderHook(({ cart }) => usePaymentIntent(cart, user, true), {
      initialProps: { cart: [item] },
    })
    await waitFor(() => expect(result.current.clientSecret).toBe("client-secret"))
    rerender({ cart: [item] })
    expect(requestPaymentIntent).toHaveBeenCalledOnce()
    expect(result.current.fingerprint).toBe("1:1")
  })

  it("does not contact Stripe when card payment is disabled", () => {
    const { result } = renderHook(() => usePaymentIntent([item], user, false))
    expect(result.current.clientSecret).toBeNull()
    expect(requestPaymentIntent).not.toHaveBeenCalled()
  })

  it("exposes provider failures for accessible rendering", async () => {
    requestPaymentIntent.mockRejectedValue(new Error("Stripe unavailable"))
    const { result } = renderHook(() => usePaymentIntent([item], user, true))
    await waitFor(() => expect(result.current.error).toBe("Stripe unavailable"))
  })
})
