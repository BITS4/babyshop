import { describe, expect, it } from "vitest"
import type { CartItem } from "./cart"
import { parseStoredCart, serializeCart } from "./storage"

const cart: CartItem[] = [
  {
    id: 1,
    name: "Hat",
    description: "Warm",
    price: 8,
    image: "/hat.jpg",
    category: "hats",
    quantity: 2,
  },
]

describe("cart persistence", () => {
  it("round-trips a valid cart", () => {
    expect(parseStoredCart(serializeCart(cart))).toEqual(cart)
  })

  it.each([null, "", "not-json", "{}", JSON.stringify([{ ...cart[0], quantity: 999 }])])(
    "fails closed for malformed storage: %s",
    (stored) => {
      expect(parseStoredCart(stored)).toEqual([])
    }
  )

  it("refuses to serialize invalid state", () => {
    expect(() => serializeCart([{ ...cart[0]!, quantity: 0 }])).toThrow()
  })
})
