import { describe, expect, it } from "vitest"
import { validateCredentials } from "./credentials"

describe("authentication input validation", () => {
  it("normalizes valid email credentials", () => {
    const result = validateCredentials({ email: "  Parent@Example.COM ", password: "SafePass123" })
    expect(result.success && result.data.email).toBe("parent@example.com")
  })

  it.each(["short1A", "alllowercase1", "ALLUPPERCASE1", "NoNumbersHere"])(
    "rejects weak password %s",
    (password) => {
      expect(validateCredentials({ email: "parent@example.com", password }).success).toBe(false)
    }
  )

  it.each(["missing-at.example", "@example.com", "", `${"x".repeat(250)}@x.com`])(
    "rejects malformed email %s",
    (email) => {
      expect(validateCredentials({ email, password: "SafePass123" }).success).toBe(false)
    }
  )

  it("rejects privilege injection", () => {
    expect(
      validateCredentials({ email: "parent@example.com", password: "SafePass123", admin: true })
        .success
    ).toBe(false)
  })
})
