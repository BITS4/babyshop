import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { adminDb } from "@/app/admin/firebaseAdmin"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
})

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature") || ""
  const body = await req.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error("Webhook signature failed:", err.message)
    return NextResponse.json(
      { error: err.message },
      { status: 400 }
    )
  }

  if (event.type === "payment_intent.succeeded") {
    const intent = event.data.object as Stripe.PaymentIntent
    const orderId = intent.metadata.orderId

    if (!orderId) {
      console.error("Missing orderId in metadata")
      return NextResponse.json({ received: true })
    }

    try {
      await adminDb
        .collection("orders")
        .doc(orderId)
        .update({
          paid: true,
          status: "processing",
        })

      console.log(`✅ Order ${orderId} marked as paid`)
    } catch (err) {
      console.error("Firestore update failed:", err)
    }
  }

  return NextResponse.json({ received: true })
}
