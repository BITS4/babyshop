"use client"

import { CheckoutForm } from "@/components/checkout/CheckoutForm"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"

const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripe = key ? loadStripe(key) : null

export default function CheckoutPage() {
  return (
    <Elements stripe={stripe}>
      <CheckoutForm />
    </Elements>
  )
}
