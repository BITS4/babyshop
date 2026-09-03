import Stripe from "stripe"

let stripe: Stripe | undefined

export function stripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is missing")
  stripe ??= new Stripe(secretKey)
  return stripe
}
