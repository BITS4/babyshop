import { ZodError } from "zod"
import { OrderPricingError } from "../payments/price-order"

export type PublicError = { status: number; code: string; message: string }

export class AuthenticationError extends Error {
  readonly code = "UNAUTHORIZED"

  constructor() {
    super("Authentication failed")
    this.name = "AuthenticationError"
  }
}

export class PaymentVerificationError extends Error {
  readonly code = "PAYMENT_NOT_VERIFIED"

  constructor() {
    super("Payment verification failed")
    this.name = "PaymentVerificationError"
  }
}

export class PayloadTooLargeError extends Error {
  readonly code = "PAYLOAD_TOO_LARGE"

  constructor() {
    super("PayloadTooLargeError")
    this.name = "PayloadTooLargeError"
  }
}

export function toPublicError(error: unknown): PublicError {
  if (error instanceof ZodError) {
    return { status: 400, code: "INVALID_REQUEST", message: "The request is invalid" }
  }
  if (error instanceof OrderPricingError) {
    return { status: 400, code: error.code, message: error.message }
  }
  if (error instanceof AuthenticationError) {
    return { status: 401, code: error.code, message: "Authentication is invalid or expired" }
  }
  if (error instanceof PaymentVerificationError) {
    return { status: 409, code: error.code, message: "The payment could not be verified" }
  }
  if (error instanceof PayloadTooLargeError) {
    return { status: 413, code: error.code, message: "The request body is too large" }
  }
  if (error instanceof SyntaxError) {
    return { status: 400, code: "INVALID_JSON", message: "The request body must be valid JSON" }
  }

  return { status: 500, code: "INTERNAL_ERROR", message: "The request could not be completed" }
}

export function errorMessage(error: unknown, fallback = "Something went wrong"): string {
  return error instanceof Error && error.message.trim() ? error.message : fallback
}
