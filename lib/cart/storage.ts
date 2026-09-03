import { z } from "zod"
import { productSchema } from "../catalog/product"
import { MAX_CART_QUANTITY, type CartItem } from "./cart"

const storedCartSchema = z
  .array(productSchema.extend({ quantity: z.number().int().min(1).max(MAX_CART_QUANTITY) }))
  .max(50)

export function parseStoredCart(value: string | null): CartItem[] {
  if (!value) return []

  try {
    const result = storedCartSchema.safeParse(JSON.parse(value) as unknown)
    return result.success ? result.data : []
  } catch {
    return []
  }
}

export function serializeCart(cart: readonly CartItem[]): string {
  return JSON.stringify(storedCartSchema.parse(cart))
}
