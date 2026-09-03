import { describe, expect, it } from "vitest"
import { z } from "zod"
import { OrderPricingError } from "../payments/price-order"
import {
  AuthenticationError,
  errorMessage,
  PayloadTooLargeError,
  PaymentVerificationError,
  toPublicError,
} from "./errors"

describe("safe error mapping", () => {
  it("maps validation, pricing, and JSON errors", () => {
    const validation = (() => {
      try {
        z.string().min(3).parse("")
      } catch (error) {
        return error
      }
    })()
    expect(toPublicError(validation)).toMatchObject({ status: 400, code: "INVALID_REQUEST" })
    expect(toPublicError(new OrderPricingError("Unavailable", "PRODUCT_NOT_FOUND"))).toEqual({
      status: 400,
      code: "PRODUCT_NOT_FOUND",
      message: "Unavailable",
    })
    expect(toPublicError(new SyntaxError())).toMatchObject({ status: 400, code: "INVALID_JSON" })
  })

  it("does not leak internal exception messages", () => {
    expect(toPublicError(new Error("database password leaked"))).toEqual({
      status: 500,
      code: "INTERNAL_ERROR",
      message: "The request could not be completed",
    })
  })

  it("maps authentication and payment verification failures", () => {
    expect(toPublicError(new AuthenticationError())).toMatchObject({
      status: 401,
      code: "UNAUTHORIZED",
    })
    expect(toPublicError(new PaymentVerificationError())).toMatchObject({
      status: 409,
      code: "PAYMENT_NOT_VERIFIED",
    })
    expect(toPublicError(new PayloadTooLargeError())).toMatchObject({
      status: 413,
      code: "PAYLOAD_TOO_LARGE",
    })
  })

  it("extracts safe UI messages with a fallback", () => {
    expect(errorMessage(new Error("Try again"))).toBe("Try again")
    expect(errorMessage("bad", "Fallback")).toBe("Fallback")
    expect(errorMessage(new Error(""))).toBe("Something went wrong")
  })
})
