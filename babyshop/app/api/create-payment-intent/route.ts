import { NextResponse } from "next/server"
import Stripe from "stripe"

export const runtime = "nodejs"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
})

export async function POST(req: Request) {
  try {
    const { amount, orderId } = await req.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: orderId ?? "",
      },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (err: any) {
    console.error("Stripe error:", err)
    return NextResponse.json(
      { error: err.message ?? "Stripe error" },
      { status: 500 }
    )
  }
}
