import { describe, expect, it, vi } from "vitest"
import { createTrustedPaymentIntent, type PaymentDependencies } from "./create-intent"

function dependencies(): PaymentDependencies {
  return {
    verifyUser: vi.fn().mockResolvedValue({ uid: "user-123" }),
    loadCatalog: vi.fn().mockResolvedValue([{ id: 42, price: 12.5 }]),
    createIntent: vi.fn().mockResolvedValue({ id: "pi_123", clientSecret: "secret" }),
  }
}

describe("trusted payment intent orchestration", () => {
  it("authenticates, reprices, deduplicates catalog IDs, and creates an intent", async () => {
    const deps = dependencies()
    const result = await createTrustedPaymentIntent(
      {
        items: [
          { productId: 42, quantity: 2 },
          { productId: 42, quantity: 1 },
        ],
      },
      "firebase-token",
      "checkout:550e8400-e29b-41d4-a716-446655440000",
      deps
    )

    expect(result).toEqual({ id: "pi_123", clientSecret: "secret" })
    expect(deps.verifyUser).toHaveBeenCalledWith("firebase-token")
    expect(deps.loadCatalog).toHaveBeenCalledWith([42])
    expect(deps.createIntent).toHaveBeenCalledWith({
      amount: 3750,
      currency: "usd",
      userId: "user-123",
      idempotencyKey: "checkout:550e8400-e29b-41d4-a716-446655440000",
    })
  })

  it("stops before external calls when input is invalid", async () => {
    const deps = dependencies()
    await expect(
      createTrustedPaymentIntent(
        { items: [], amount: 1 },
        "token",
        "checkout:550e8400-e29b-41d4-a716-446655440000",
        deps
      )
    ).rejects.toThrow()
    expect(deps.verifyUser).not.toHaveBeenCalled()
  })

  it("does not create a payment when authentication fails", async () => {
    const deps = dependencies()
    vi.mocked(deps.verifyUser).mockRejectedValue(new Error("unauthorized"))
    await expect(
      createTrustedPaymentIntent(
        { items: [{ productId: 42, quantity: 1 }] },
        "invalid-token",
        "checkout:550e8400-e29b-41d4-a716-446655440000",
        deps
      )
    ).rejects.toThrow("unauthorized")
    expect(deps.createIntent).not.toHaveBeenCalled()
  })
})
