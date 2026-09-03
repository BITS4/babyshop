import { describe, expect, it, vi } from "vitest"
import { submitOrder } from "./order-client"

const options = {
  customer: {
    name: "A Parent",
    address: "12 Family Street",
    phone: "12345678",
    paymentMethod: "cod" as const,
  },
  cart: [
    {
      id: 1,
      quantity: 2,
      name: "Hat",
      price: 4,
      image: "/hat",
      description: "Warm",
      category: "hats",
    },
  ],
  paymentIntentId: null,
  email: "parent@example.com",
  getIdToken: vi.fn().mockResolvedValue("token"),
}

describe("order client", () => {
  it("submits authenticated product IDs without trusting browser prices", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 201 }))
    await submitOrder({ ...options, fetcher })
    const init = fetcher.mock.calls[0]?.[1] as RequestInit
    expect(init.headers).toMatchObject({ Authorization: "Bearer token" })
    expect(init.body).not.toContain("price")
    expect(init.body).toContain('"productId":1')
  })

  it("surfaces a structured API failure", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ error: { message: "Payment not verified" } }), {
          status: 422,
        })
      )
    await expect(submitOrder({ ...options, fetcher })).rejects.toThrow("Payment not verified")
  })

  it("uses a safe fallback for malformed failures", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response("{}", { status: 500 }))
    await expect(submitOrder({ ...options, fetcher })).rejects.toThrow("Order could not be saved")
  })
})
