import { z } from "zod"
import { checkoutCustomerSchema } from "../checkout/customer"
import { paymentRequestSchema } from "../payments/payment-request"
import { priceOrder, type CatalogPrice } from "../payments/price-order"

export const createOrderRequestSchema = checkoutCustomerSchema
  .extend({
    items: paymentRequestSchema.shape.items,
    paymentIntentId: z.string().startsWith("pi_").max(128).nullable().optional(),
  })
  .superRefine((value, context) => {
    if (value.paymentMethod === "card" && !value.paymentIntentId) {
      context.addIssue({
        code: "custom",
        path: ["paymentIntentId"],
        message: "Card payment is required",
      })
    }
    if (value.paymentMethod === "cod" && value.paymentIntentId) {
      context.addIssue({
        code: "custom",
        path: ["paymentIntentId"],
        message: "COD cannot include a payment",
      })
    }
  })

export type CreateOrderDependencies = {
  loadCatalog: (
    productIds: number[]
  ) => Promise<Array<CatalogPrice & { name: string; image: string }>>
  verifyPayment: (
    paymentIntentId: string,
    expected: { amount: number; userId: string }
  ) => Promise<void>
  saveOrder: (order: {
    userId: string
    email: string
    name: string
    address: string
    phone: string
    paymentMethod: "cod" | "card"
    paymentIntentId: string | null
    paid: boolean
    amount: number
    items: Array<{ id: number; name: string; image: string; price: number; quantity: number }>
  }) => Promise<{ id: string }>
}

export async function createTrustedOrder(
  input: unknown,
  user: { uid: string; email: string },
  dependencies: CreateOrderDependencies
) {
  const request = createOrderRequestSchema.parse(input)
  const productIds = Array.from(new Set(request.items.map((item) => item.productId)))
  const catalog = await dependencies.loadCatalog(productIds)
  const amount = priceOrder({ items: request.items, currency: "usd" }, catalog)

  if (request.paymentMethod === "card" && request.paymentIntentId) {
    await dependencies.verifyPayment(request.paymentIntentId, { amount, userId: user.uid })
  }

  return dependencies.saveOrder({
    userId: user.uid,
    email: user.email,
    name: request.name,
    address: request.address,
    phone: request.phone,
    paymentMethod: request.paymentMethod,
    paymentIntentId: request.paymentIntentId ?? null,
    paid: request.paymentMethod === "card",
    amount,
    items: request.items.map((item) => {
      const product = catalog.find(({ id }) => id === item.productId)
      if (!product) throw new Error("Trusted catalog became inconsistent")
      return { ...product, quantity: item.quantity }
    }),
  })
}
