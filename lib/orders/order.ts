import { z } from "zod"

export type FirestoreDate = { toDate: () => Date; toMillis: () => number }

const firestoreDateSchema = z.custom<FirestoreDate>(
  (value) =>
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function" &&
    "toMillis" in value &&
    typeof value.toMillis === "function"
)

const orderDocumentSchema = z
  .object({
    name: z.string().default(""),
    email: z.string().default(""),
    address: z.string().default(""),
    phone: z.coerce.string().optional(),
    items: z
      .array(
        z.object({ name: z.string(), quantity: z.coerce.number().int().positive() }).passthrough()
      )
      .default([]),
    status: z.enum(["pending", "shipped", "delivered", "cancelled"]).default("pending"),
    createdAt: firestoreDateSchema.nullish(),
    timestamp: z.string().datetime().nullish(),
  })
  .passthrough()

export type Order = {
  id: string
  name: string
  email: string
  address: string
  phone?: string
  items: Array<{ name: string; quantity: number }>
  status: "pending" | "shipped" | "delivered" | "cancelled"
  createdAt?: FirestoreDate
  timestamp?: string
}

export function parseOrderDocument(id: string, value: unknown): Order | null {
  const result = orderDocumentSchema.safeParse(value)
  if (!result.success) return null
  const { createdAt, timestamp, phone, ...order } = result.data
  return {
    id,
    ...order,
    ...(phone ? { phone } : {}),
    ...(createdAt ? { createdAt } : {}),
    ...(timestamp ? { timestamp } : {}),
  }
}

export function orderTime(order: Order): number {
  if (order.createdAt) return order.createdAt.toMillis()
  if (order.timestamp) {
    const milliseconds = Date.parse(order.timestamp)
    return Number.isNaN(milliseconds) ? 0 : milliseconds
  }
  return 0
}

export function sortOrdersNewestFirst(orders: readonly Order[]): Order[] {
  return [...orders].sort((a, b) => orderTime(b) - orderTime(a))
}
