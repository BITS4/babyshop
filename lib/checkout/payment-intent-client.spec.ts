import { describe, expect, it, vi } from "vitest"
import type { CartItem } from "@/lib/cart/cart"
import { cartFingerprint, requestPaymentIntent } from "./payment-intent-client"

const cart = [
  {
    id: 8,
    quantity: 2,
    name: "Socks",
    price: 4,
    image: "/socks",
    description: "Soft",
    category: "socks",
  },
  {
    id: 2,
    quantity: 1,
    name: "Hat",
    price: 5,
    image: "/hat",
    description: "Warm",
    category: "hats",
  },
] satisfies CartItem[]

describe("payment intent client", () => {
  it("creates an order-independent stable cart fingerprint", () => {
    expect(cartFingerprint(cart)).toBe("2:1|8:2")
    expect(cartFingerprint([...cart].reverse())).toBe("2:1|8:2")
  })

  it("sends authenticated cart lines without client prices", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ clientSecret: "secret" })))
    const secret = await requestPaymentIntent({
      cart,
      user: { getIdToken: vi.fn().mockResolvedValue("token") },
      idempotencyKey: "checkout:stable-key",
      fetcher,
    })
    expect(secret).toBe("secret")
    const init = fetcher.mock.calls[0]?.[1] as RequestInit
    expect(init.headers).toMatchObject({
      Authorization: "Bearer token",
      "Idempotency-Key": "checkout:stable-key",
    })
    expect(init.body).not.toContain("price")
  })

  it("surfaces a structured API error", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ error: { message: "Cart changed" } }), { status: 409 })
      )
    await expect(
      requestPaymentIntent({
        cart,
        user: { getIdToken: vi.fn().mockResolvedValue("token") },
        idempotencyKey: "checkout:stable-key",
        fetcher,
      })
    ).rejects.toThrow("Cart changed")
  })

  it("rejects a malformed successful response", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("{}"))
    await expect(
      requestPaymentIntent({
        cart,
        user: { getIdToken: vi.fn().mockResolvedValue("token") },
        idempotencyKey: "checkout:stable-key",
        fetcher,
      })
    ).rejects.toThrow("invalid response")
  })
})
