import { describe, expect, it } from "vitest"
import { getBearerToken, getClientIp, readJsonBody } from "./request"

describe("request security helpers", () => {
  it("extracts a bounded bearer token", () => {
    expect(getBearerToken(`Bearer ${"a".repeat(24)}.signature`)).toBe(`${"a".repeat(24)}.signature`)
  })

  it.each([null, "Basic abc", "Bearer short", "Bearer token with spaces"])(
    "rejects malformed authorization %s",
    (authorization) => expect(getBearerToken(authorization)).toBeNull()
  )

  it("uses only the first trusted proxy address", () => {
    expect(getClientIp(new Headers({ "x-forwarded-for": "203.0.113.1, 10.0.0.1" }))).toBe(
      "203.0.113.1"
    )
    expect(getClientIp(new Headers({ "x-real-ip": "203.0.113.2" }))).toBe("203.0.113.2")
    expect(getClientIp(new Headers())).toBe("unknown")
  })

  it("reads bounded JSON bodies", async () => {
    const request = new Request("https://example.com", { method: "POST", body: '{"ok":true}' })
    await expect(readJsonBody(request)).resolves.toEqual({ ok: true })
  })

  it("rejects declared and actual oversized bodies", async () => {
    const declared = new Request("https://example.com", {
      headers: { "content-length": "100" },
    })
    const actual = new Request("https://example.com", {
      method: "POST",
      body: JSON.stringify({ value: "x".repeat(100) }),
    })
    await expect(readJsonBody(declared, 10)).rejects.toThrow("PayloadTooLargeError")
    await expect(readJsonBody(actual, 10)).rejects.toThrow("PayloadTooLargeError")
  })

  it("preserves invalid JSON as a syntax failure", async () => {
    const request = new Request("https://example.com", { method: "POST", body: "invalid" })
    await expect(readJsonBody(request)).rejects.toBeInstanceOf(SyntaxError)
  })
})
