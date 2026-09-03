import type Stripe from "stripe"

export type WebhookAction =
  | { kind: "payment_succeeded"; paymentIntentId: string }
  | { kind: "payment_failed"; paymentIntentId: string }
  | { kind: "ignored" }

export function mapStripeEvent(event: Stripe.Event): WebhookAction {
  if (event.type === "payment_intent.succeeded") {
    return { kind: "payment_succeeded", paymentIntentId: event.data.object.id }
  }
  if (event.type === "payment_intent.payment_failed") {
    return { kind: "payment_failed", paymentIntentId: event.data.object.id }
  }
  return { kind: "ignored" }
}
