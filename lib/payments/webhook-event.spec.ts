import { describe, expect, it } from "vitest"
import type Stripe from "stripe"
import { mapStripeEvent } from "./webhook-event"

function event(type: string, id = "pi_123"): Stripe.Event {
  return { type, data: { object: { id } } } as Stripe.Event
}

describe("Stripe webhook event mapping", () => {
  it("maps successful and failed intents", () => {
    expect(mapStripeEvent(event("payment_intent.succeeded"))).toEqual({
      kind: "payment_succeeded",
      paymentIntentId: "pi_123",
    })
    expect(mapStripeEvent(event("payment_intent.payment_failed"))).toEqual({
      kind: "payment_failed",
      paymentIntentId: "pi_123",
    })
  })

  it("ignores unrelated Stripe events", () => {
    expect(mapStripeEvent(event("customer.created"))).toEqual({ kind: "ignored" })
  })
})
