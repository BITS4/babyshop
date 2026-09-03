import { describe, expect, it, vi } from "vitest"
import { createTrustedOrder, type CreateOrderDependencies } from "./create-order"

const base = {
  name: "Ava Parent",
  address: "21 Main Street",
  phone: "12345678",
  items: [{ productId: 1, quantity: 2 }],
}

function dependencies(): CreateOrderDependencies {
  return {
    loadCatalog: vi.fn().mockResolvedValue([{ id: 1, price: 10, name: "Hat", image: "/hat.jpg" }]),
    verifyPayment: vi.fn().mockResolvedValue(undefined),
    saveOrder: vi.fn().mockResolvedValue({ id: "order-1" }),
  }
}

describe("trusted order creation", () => {
  it("creates an unpaid cash-on-delivery order from trusted prices", async () => {
    const deps = dependencies()
    await expect(
      createTrustedOrder(
        { ...base, paymentMethod: "cod" },
        { uid: "u1", email: "a@example.com" },
        deps
      )
    ).resolves.toEqual({ id: "order-1" })
    expect(deps.verifyPayment).not.toHaveBeenCalled()
    expect(deps.saveOrder).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 2000, paid: false })
    )
  })

  it("verifies a card payment against amount and owner", async () => {
    const deps = dependencies()
    await createTrustedOrder(
      { ...base, paymentMethod: "card", paymentIntentId: "pi_123" },
      { uid: "u1", email: "a@example.com" },
      deps
    )
    expect(deps.verifyPayment).toHaveBeenCalledWith("pi_123", { amount: 2000, userId: "u1" })
    expect(deps.saveOrder).toHaveBeenCalledWith(expect.objectContaining({ paid: true }))
  })

  it.each([
    { ...base, paymentMethod: "card" },
    { ...base, paymentMethod: "cod", paymentIntentId: "pi_123" },
    { ...base, paymentMethod: "wire" },
  ])("rejects inconsistent payment state", async (input) => {
    const deps = dependencies()
    await expect(
      createTrustedOrder(input, { uid: "u1", email: "a@example.com" }, deps)
    ).rejects.toThrow()
    expect(deps.saveOrder).not.toHaveBeenCalled()
  })

  it("does not save an order when Stripe verification fails", async () => {
    const deps = dependencies()
    vi.mocked(deps.verifyPayment).mockRejectedValue(new Error("payment mismatch"))
    await expect(
      createTrustedOrder(
        { ...base, paymentMethod: "card", paymentIntentId: "pi_123" },
        { uid: "u1", email: "a@example.com" },
        deps
      )
    ).rejects.toThrow("payment mismatch")
    expect(deps.saveOrder).not.toHaveBeenCalled()
  })
})
