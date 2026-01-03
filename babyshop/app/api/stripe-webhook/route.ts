import { NextResponse } from "next/server"
import Stripe from "stripe"

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is missing")
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

export async function POST(req: Request) {
  try {
    const { amount } = await req.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const stripe = getStripe()

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || "Stripe error" },
      { status: 500 }
    )
  }
}
