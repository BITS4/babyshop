import { z } from "zod"

export const checkoutCustomerSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    address: z.string().trim().min(10).max(300),
    phone: z
      .string()
      .transform((value) => value.replace(/\D/g, ""))
      .pipe(z.string().min(8).max(15)),
    paymentMethod: z.enum(["cod", "card"]),
  })
  .strict()

export type CheckoutCustomer = z.infer<typeof checkoutCustomerSchema>

export function validateCheckoutCustomer(value: unknown) {
  return checkoutCustomerSchema.safeParse(value)
}
