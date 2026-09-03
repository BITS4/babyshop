import { z } from "zod"

export const emailSchema = z.string().trim().toLowerCase().email().max(254)
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128)
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/\d/, "Password must contain a number")

export const credentialsSchema = z.object({ email: emailSchema, password: passwordSchema }).strict()

export function validateCredentials(value: unknown) {
  return credentialsSchema.safeParse(value)
}
