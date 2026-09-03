import type { Product } from "../catalog/product"

export const MAX_CART_QUANTITY = 20

export type CartItem = Product & { quantity: number }

export function addCartItem(cart: readonly CartItem[], product: Product): CartItem[] {
  const existing = cart.find((item) => item.id === product.id)
  if (!existing) return [...cart, { ...product, quantity: 1 }]

  return cart.map((item) =>
    item.id === product.id
      ? { ...item, quantity: Math.min(MAX_CART_QUANTITY, item.quantity + 1) }
      : item
  )
}

export function setCartItemQuantity(
  cart: readonly CartItem[],
  productId: number,
  quantity: number
): CartItem[] {
  if (!Number.isInteger(quantity)) return [...cart]
  if (quantity <= 0) return cart.filter((item) => item.id !== productId)

  return cart.map((item) =>
    item.id === productId ? { ...item, quantity: Math.min(MAX_CART_QUANTITY, quantity) } : item
  )
}

export function cartTotalCents(cart: readonly CartItem[]): number {
  return cart.reduce((total, item) => total + Math.round(item.price * 100) * item.quantity, 0)
}
