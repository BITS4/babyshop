import { z } from "zod"

const lastOrderSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  address: z.string(),
  phone: z.string().optional(),
  paymentMethod: z.enum(["cod", "card"]),
  paid: z.boolean().optional(),
  items: z.array(
    z
      .object({
        id: z.coerce.number().int().positive(),
        name: z.string(),
        quantity: z.number().int().positive(),
        price: z.number().finite().nonnegative(),
        image: z.string().optional(),
      })
      .passthrough()
  ),
  timestamp: z.string().datetime().optional(),
  paymentIntentId: z.string().optional().nullable(),
})

export type LastOrder = z.infer<typeof lastOrderSchema>

export function parseLastOrder(value: string | null): LastOrder | null {
  if (!value) return null
  try {
    const result = lastOrderSchema.safeParse(JSON.parse(value) as unknown)
    return result.success ? result.data : null
  } catch {
    return null
  }
}
