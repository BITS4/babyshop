import { NextResponse } from "next/server"
import { createTrustedPaymentIntent } from "@/lib/payments/create-intent"
import { AuthenticationError, toPublicError } from "@/lib/security/errors"
import { FixedWindowRateLimiter } from "@/lib/security/rate-limit"
import { getBearerToken, getClientIp, readJsonBody } from "@/lib/security/request"
import { logger } from "@/lib/observability/logger"
import { incrementCounter } from "@/lib/observability/metrics"
import { adminAuth } from "@/lib/server/firebase-admin"
import { loadCatalogProducts } from "@/lib/server/catalog"
import { stripeClient } from "@/lib/server/stripe"

const rateLimiter = new FixedWindowRateLimiter(20, 60_000)

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
      { error: { code: "RATE_LIMITED", message: "Too many payment attempts" } },
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
    const body = await readJsonBody(request)
    const result = await createTrustedPaymentIntent(
      body,
      token,
      request.headers.get("idempotency-key") ?? "",
      {
        verifyUser: async (idToken) => {
          try {
            return await adminAuth().verifyIdToken(idToken, true)
          } catch {
            throw new AuthenticationError()
          }
        },
        loadCatalog: async (productIds) => loadCatalogProducts(productIds),
        createIntent: async ({ amount, currency, userId, idempotencyKey }) => {
          const paymentIntent = await stripeClient().paymentIntents.create(
            {
              amount,
              currency,
              automatic_payment_methods: { enabled: true },
              metadata: { userId },
            },
            { idempotencyKey }
          )
          if (!paymentIntent.client_secret) throw new Error("Stripe returned no client secret")
          return { id: paymentIntent.id, clientSecret: paymentIntent.client_secret }
        },
      }
    )

    logger.info({ paymentIntentId: result.id }, "payment intent created")
    incrementCounter("babyshop_payment_intents_created_total")
    return NextResponse.json({ clientSecret: result.clientSecret })
  } catch (error: unknown) {
    const publicError = toPublicError(error)
    incrementCounter("babyshop_payment_intents_failed_total")
    logger.error({ err: error, code: publicError.code }, "payment intent failed")
    return NextResponse.json(
      { error: { code: publicError.code, message: publicError.message } },
      { status: publicError.status }
    )
  }
}
