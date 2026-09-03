import { describe, expect, it } from "vitest"
import type { PaymentRequest } from "./payment-request"
import { OrderPricingError, priceOrder } from "./price-order"

const request: PaymentRequest = {
  items: [
    { productId: 1, quantity: 2 },
    { productId: 2, quantity: 1 },
  ],
  currency: "usd",
}

describe("server-side order pricing", () => {
  it("uses catalog prices instead of client-provided totals", () => {
    expect(
      priceOrder(request, [
        { id: 1, price: 10.1 },
        { id: 2, price: 4.25 },
      ])
    ).toBe(2445)
  })

  it("rejects products missing from the trusted catalog", () => {
    expect(() => priceOrder(request, [{ id: 1, price: 10 }])).toThrowError(OrderPricingError)
    try {
      priceOrder(request, [{ id: 1, price: 10 }])
    } catch (error) {
      expect(error).toMatchObject({ code: "PRODUCT_NOT_FOUND" })
    }
  })

  it.each([Number.NaN, -1, Number.POSITIVE_INFINITY])(
    "rejects an invalid catalog price: %s",
    (price) => {
      expect(() =>
        priceOrder({ items: [{ productId: 1, quantity: 1 }], currency: "usd" }, [{ id: 1, price }])
      ).toThrow()
    }
  )

  it("enforces Stripe amount boundaries", () => {
    expect(() =>
      priceOrder({ items: [{ productId: 1, quantity: 1 }], currency: "usd" }, [
        { id: 1, price: 0.49 },
      ])
    ).toThrow()
    expect(() =>
      priceOrder({ items: [{ productId: 1, quantity: 20 }], currency: "usd" }, [
        { id: 1, price: 501 },
      ])
    ).toThrow()
  })
})
