import { FieldValue } from "firebase-admin/firestore"
import { NextResponse } from "next/server"
import { logger } from "@/lib/observability/logger"
import { incrementCounter } from "@/lib/observability/metrics"
import { mapStripeEvent } from "@/lib/payments/webhook-event"
import { adminDatabase } from "@/lib/server/firebase-admin"
import { stripeClient } from "@/lib/server/stripe"

const MAX_WEBHOOK_BYTES = 1_000_000

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const declaredLength = Number(request.headers.get("content-length") ?? "0")

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook signature is required" }, { status: 400 })
  }
  if (declaredLength > MAX_WEBHOOK_BYTES) {
    return NextResponse.json({ error: "Webhook payload is too large" }, { status: 413 })
  }

  try {
    const rawBody = await request.text()
    if (new TextEncoder().encode(rawBody).byteLength > MAX_WEBHOOK_BYTES) {
      return NextResponse.json({ error: "Webhook payload is too large" }, { status: 413 })
    }

    const event = stripeClient().webhooks.constructEvent(rawBody, signature, webhookSecret)
    const action = mapStripeEvent(event)

    if (action.kind !== "ignored") {
      const database = adminDatabase()
      const eventReference = database.collection("stripeEvents").doc(event.id)
      const isNewEvent = await database.runTransaction(async (transaction) => {
        const existing = await transaction.get(eventReference)
        if (existing.exists) return false
        transaction.create(eventReference, {
          type: event.type,
          paymentIntentId: action.paymentIntentId,
          receivedAt: FieldValue.serverTimestamp(),
        })
        return true
      })

      if (isNewEvent) {
        const orders = await database
          .collection("orders")
          .where("paymentIntentId", "==", action.paymentIntentId)
          .limit(10)
          .get()
        const batch = database.batch()
        orders.docs.forEach((order) =>
          batch.update(order.ref, {
            paid: action.kind === "payment_succeeded",
            paymentStatus: action.kind === "payment_succeeded" ? "succeeded" : "failed",
            updatedAt: FieldValue.serverTimestamp(),
          })
        )
        await batch.commit()
      }
    }

    logger.info({ stripeEventId: event.id, type: event.type }, "Stripe webhook processed")
    incrementCounter("babyshop_stripe_webhooks_processed_total")
    return NextResponse.json({ received: true })
  } catch (error: unknown) {
    incrementCounter("babyshop_stripe_webhooks_rejected_total")
    logger.warn({ err: error }, "Stripe webhook rejected")
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 })
  }
}
