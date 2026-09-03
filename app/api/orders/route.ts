import { FieldValue } from "firebase-admin/firestore"
import { NextResponse } from "next/server"
import { createTrustedOrder } from "@/lib/orders/create-order"
import { logger } from "@/lib/observability/logger"
import { incrementCounter } from "@/lib/observability/metrics"
import { AuthenticationError, PaymentVerificationError, toPublicError } from "@/lib/security/errors"
import { FixedWindowRateLimiter } from "@/lib/security/rate-limit"
import { getBearerToken, getClientIp, readJsonBody } from "@/lib/security/request"
import { adminAuth, adminDatabase } from "@/lib/server/firebase-admin"
import { loadCatalogProducts } from "@/lib/server/catalog"
import { stripeClient } from "@/lib/server/stripe"

const rateLimiter = new FixedWindowRateLimiter(30, 60_000)

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json(
      {
        error: { code: "UNSUPPORTED_MEDIA_TYPE", message: "Content-Type must be application/json" },
      },
      { status: 415 }
    )
  }
  const rateLimit = rateLimiter.consume(getClientIp(request.headers))
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many order attempts" } },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    )
  }

  const token = getBearerToken(request.headers.get("authorization"))
  if (!token) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Authentication is required" } },
      { status: 401 }
    )
  }

  try {
    const decoded = await adminAuth()
      .verifyIdToken(token, true)
      .catch(() => {
        throw new AuthenticationError()
      })
    if (!decoded.email) {
      return NextResponse.json(
        { error: { code: "EMAIL_REQUIRED", message: "A verified email is required" } },
        { status: 403 }
      )
    }

    const body = await readJsonBody(request)
    const result = await createTrustedOrder(
      body,
      { uid: decoded.uid, email: decoded.email },
      {
        loadCatalog: loadCatalogProducts,
        verifyPayment: async (paymentIntentId, expected) => {
          const payment = await stripeClient().paymentIntents.retrieve(paymentIntentId)
          if (
            payment.status !== "succeeded" ||
            payment.amount_received !== expected.amount ||
            payment.currency !== "usd" ||
            payment.metadata.userId !== expected.userId
          ) {
            throw new PaymentVerificationError()
          }
        },
        saveOrder: async (order) => {
          const document = await adminDatabase()
            .collection("orders")
            .add({
              ...order,
              status: "pending",
              paymentStatus: order.paid ? "succeeded" : "not_required",
              createdAt: FieldValue.serverTimestamp(),
            })
          return { id: document.id }
        },
      }
    )

    logger.info({ orderId: result.id, userId: decoded.uid }, "order created")
    incrementCounter("babyshop_orders_created_total")
    return NextResponse.json({ orderId: result.id }, { status: 201 })
  } catch (error: unknown) {
    const publicError = toPublicError(error)
    incrementCounter("babyshop_orders_failed_total")
    logger.error({ err: error, code: publicError.code }, "order creation failed")
    return NextResponse.json(
      { error: { code: publicError.code, message: publicError.message } },
      { status: publicError.status }
    )
  }
}
