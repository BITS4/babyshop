"use client"

import { useAuth } from "@/context/AuthContext"
import { useCart } from "@/context/CartContext"
import { cartTotalCents } from "@/lib/cart/cart"
import { validateCheckoutCustomer } from "@/lib/checkout/customer"
import { submitOrder } from "@/lib/checkout/order-client"
import { usePaymentIntent } from "@/lib/checkout/use-payment-intent"
import { reportClientError } from "@/lib/observability/client"
import { loadProfile } from "@/lib/profile/profile-repository"
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

export function CheckoutForm() {
  const { cart, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const stripe = useStripe()
  const elements = useElements()
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [nameLocked, setNameLocked] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod")
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { clientSecret, error: paymentError } = usePaymentIntent(
    cart,
    user,
    paymentMethod === "card"
  )
  const totalAmount = useMemo(() => cartTotalCents(cart) / 100, [cart])

  useEffect(() => {
    if (!user?.uid) {
      queueMicrotask(() => setLoadingProfile(false))
      return
    }
    void loadProfile(user.uid)
      .then((profile) => {
        setName(profile.name)
        setAddress(profile.address)
        setPhone(profile.phone)
        setNameLocked(Boolean(profile.name))
      })
      .catch((error: unknown) => reportClientError(error, { operation: "checkout_profile" }))
      .finally(() => setLoadingProfile(false))
  }, [user?.uid])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (submitting) return
    if (!user?.uid || !user.email) {
      router.replace("/login")
      return
    }
    const customer = validateCheckoutCustomer({ name, address, phone, paymentMethod })
    if (!customer.success) {
      alert(customer.error.issues[0]?.message ?? "Please check your details.")
      return
    }
    setSubmitting(true)
    try {
      let paymentIntentId: string | null = null
      if (paymentMethod === "card") {
        const card = elements?.getElement(CardElement)
        if (!stripe || !card || !clientSecret) {
          alert("Payment not ready.")
          return
        }
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card,
            billing_details: { name: customer.data.name, email: user.email },
          },
        })
        if (result.error || result.paymentIntent?.status !== "succeeded") {
          alert(result.error?.message ?? "Payment failed.")
          return
        }
        paymentIntentId = result.paymentIntent.id
      }
      await submitOrder({
        customer: customer.data,
        cart,
        paymentIntentId,
        email: user.email,
        getIdToken: () => user.getIdToken(),
      })
      localStorage.setItem(
        "lastOrder",
        JSON.stringify({
          ...customer.data,
          email: user.email,
          items: cart,
          paid: paymentMethod === "card",
          paymentIntentId,
          timestamp: new Date().toISOString(),
        })
      )
      clearCart()
      router.push("/thankyou")
    } catch (error: unknown) {
      reportClientError(error, { operation: "submit_order" })
      alert(error instanceof Error ? error.message : "Order could not be placed.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingProfile)
    return (
      <div role="status" className="flex min-h-screen items-center justify-center bg-pink-50">
        Loading…
      </div>
    )

  return (
    <main className="min-h-screen bg-pink-50 px-4 py-10 text-gray-900">
      <div className="mx-auto max-w-md">
        <button type="button" onClick={() => router.back()} className="mb-4 text-pink-600">
          ← Back
        </button>
        <h1 className="mb-6 text-center text-3xl font-bold text-pink-600">Checkout</h1>
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="space-y-4 rounded-lg border border-pink-100 bg-white p-6 shadow-md"
        >
          <label className="block font-semibold">
            Full name
            <input
              aria-label="Full name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={nameLocked}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </label>
          <label className="block font-semibold">
            Shipping address
            <textarea
              aria-label="Shipping address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              rows={3}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </label>
          <label className="block font-semibold">
            Phone
            <input
              aria-label="Phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value.replace(/\D/g, ""))}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </label>
          <fieldset className="rounded border p-3">
            <legend className="font-semibold">Payment method</legend>
            <label className="flex gap-2">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              Cash on delivery
            </label>
            <label className="mt-2 flex gap-2">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
              />
              Card (Stripe)
            </label>
          </fieldset>
          {paymentMethod === "card" && clientSecret ? (
            <div aria-label="Card details" className="rounded border p-3">
              <CardElement />
            </div>
          ) : null}
          {paymentMethod === "card" && paymentError ? (
            <p role="alert" className="text-sm text-red-600">
              {paymentError}
            </p>
          ) : null}
          <p className="text-right font-semibold text-pink-600">Total: ${totalAmount.toFixed(2)}</p>
          <button
            type="submit"
            disabled={
              submitting || (paymentMethod === "card" && (!stripe || !elements || !clientSecret))
            }
            className="w-full rounded bg-pink-500 py-2 text-white disabled:opacity-50"
          >
            {submitting
              ? "Processing…"
              : paymentMethod === "card"
                ? "Pay & place order"
                : "Place order"}
          </button>
        </form>
      </div>
    </main>
  )
}
