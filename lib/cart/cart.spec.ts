import { describe, expect, it } from "vitest"
import type { Product } from "../catalog/product"
import {
  addCartItem,
  cartTotalCents,
  MAX_CART_QUANTITY,
  setCartItemQuantity,
  type CartItem,
} from "./cart"

const product: Product = {
  id: 1,
  name: "Onesie",
  description: "Soft",
  price: 10.1,
  image: "/onesie.jpg",
  category: "onesie",
}

describe("cart domain", () => {
  it("adds a new item without mutating the old cart", () => {
    const original: CartItem[] = []
    const result = addCartItem(original, product)
    expect(result).toEqual([{ ...product, quantity: 1 }])
    expect(original).toEqual([])
  })

  it("increments existing items and caps quantity", () => {
    const cart = [{ ...product, quantity: MAX_CART_QUANTITY }]
    expect(addCartItem(cart, product)[0]?.quantity).toBe(MAX_CART_QUANTITY)
  })

  it("updates and removes quantities", () => {
    const cart = [{ ...product, quantity: 1 }]
    expect(setCartItemQuantity(cart, 1, 3)[0]?.quantity).toBe(3)
    expect(setCartItemQuantity(cart, 1, 0)).toEqual([])
  })

  it("ignores fractional quantities", () => {
    const cart = [{ ...product, quantity: 1 }]
    expect(setCartItemQuantity(cart, 1, 1.5)).toEqual(cart)
  })

  it("calculates totals in integer cents", () => {
    expect(cartTotalCents([{ ...product, quantity: 3 }])).toBe(3030)
  })
})
