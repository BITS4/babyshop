import { z } from "zod"

const idempotencyKeySchema = z
  .string()
  .trim()
  .min(16)
  .max(128)
  .regex(/^[a-zA-Z0-9:_-]+$/)

export function parseIdempotencyKey(value: string | null): string {
  return idempotencyKeySchema.parse(value)
}
