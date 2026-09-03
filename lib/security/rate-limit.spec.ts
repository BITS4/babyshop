import { describe, expect, it } from "vitest"
import { FixedWindowRateLimiter } from "./rate-limit"

describe("fixed-window rate limiting", () => {
  it("permits requests up to the limit", () => {
    const limiter = new FixedWindowRateLimiter(2, 10_000, () => 1_000)
    expect(limiter.consume("user").allowed).toBe(true)
    expect(limiter.consume("user").allowed).toBe(true)
    expect(limiter.consume("user")).toEqual({ allowed: false, retryAfterSeconds: 10 })
  })

  it("tracks callers independently", () => {
    const limiter = new FixedWindowRateLimiter(1, 1_000, () => 0)
    limiter.consume("a")
    expect(limiter.consume("b").allowed).toBe(true)
  })

  it("opens a new window after expiry", () => {
    let now = 0
    const limiter = new FixedWindowRateLimiter(1, 1_000, () => now)
    limiter.consume("user")
    now = 1_000
    expect(limiter.consume("user").allowed).toBe(true)
  })

  it("rejects invalid configuration", () => {
    expect(() => new FixedWindowRateLimiter(0, 1_000)).toThrow()
    expect(() => new FixedWindowRateLimiter(1, 0)).toThrow()
  })
})
