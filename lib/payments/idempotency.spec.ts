import { describe, expect, it } from "vitest"
import { parseIdempotencyKey } from "./idempotency"

describe("Stripe idempotency keys", () => {
  it("accepts UUID-like and namespaced keys", () => {
    expect(parseIdempotencyKey("checkout:550e8400-e29b-41d4-a716-446655440000")).toBe(
      "checkout:550e8400-e29b-41d4-a716-446655440000"
    )
  })

  it.each([null, "short", "a".repeat(129), "checkout key with spaces", "checkout/key"])(
    "rejects unsafe key %s",
    (key) => {
      expect(() => parseIdempotencyKey(key)).toThrow()
    }
  )
})
