import { z } from "zod"

export const paymentRequestSchema = z
  .object({
    items: z
      .array(
        z
          .object({
            productId: z.coerce.number().int().positive(),
            quantity: z.coerce.number().int().min(1).max(20),
          })
          .strict()
      )
      .min(1)
      .max(25),
    currency: z.literal("usd").default("usd"),
  })
  .strict()

export type PaymentRequest = z.infer<typeof paymentRequestSchema>

export function parsePaymentRequest(value: unknown): PaymentRequest {
  return paymentRequestSchema.parse(value)
}
