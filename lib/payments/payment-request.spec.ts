import { describe, expect, it } from "vitest"
import { parsePaymentRequest } from "./payment-request"

describe("payment request validation", () => {
  it("normalizes IDs, quantities, and the default currency", () => {
    expect(parsePaymentRequest({ items: [{ productId: "42", quantity: "2" }] })).toEqual({
      items: [{ productId: 42, quantity: 2 }],
      currency: "usd",
    })
  })

  it.each([0, -1, 1.5, 21, Number.NaN])("rejects invalid quantity %s", (quantity) => {
    expect(() => parsePaymentRequest({ items: [{ productId: 42, quantity }] })).toThrow()
  })

  it("rejects empty and oversized carts", () => {
    expect(() => parsePaymentRequest({ items: [] })).toThrow()
    expect(() =>
      parsePaymentRequest({
        items: Array.from({ length: 26 }, (_, index) => ({ productId: index + 1, quantity: 1 })),
      })
    ).toThrow()
  })

  it("rejects a client-supplied amount or unsupported currency", () => {
    expect(() =>
      parsePaymentRequest({ items: [{ productId: 1, quantity: 1 }], amount: 1 })
    ).toThrow()
    expect(() =>
      parsePaymentRequest({ items: [{ productId: 1, quantity: 1 }], currency: "eur" })
    ).toThrow()
  })
})
