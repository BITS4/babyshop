"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useCart } from "../../context/CartContext"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/app/firebase"
import { doc, getDoc } from "firebase/firestore"

import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { cartTotalCents } from "@/lib/cart/cart"
import { validateCheckoutCustomer } from "@/lib/checkout/customer"

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = publishableKey ? loadStripe(publishableKey) : null

/* ---------------- INTERNAL FORM ---------------- */

function CheckoutForm() {
  const { cart, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const stripe = useStripe()
  const elements = useElements()

  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod")

  const [nameLocked, setNameLocked] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [paymentIntent, setPaymentIntent] = useState<{
    fingerprint: string
    clientSecret: string
  } | null>(null)
  const [paymentError, setPaymentError] = useState("")
  const idempotencyKeys = useRef(new Map<string, string>())

  /* ---------- LOAD PROFILE ---------- */
  useEffect(() => {
    const load = async () => {
      if (!user?.uid) {
        setLoadingProfile(false)
        return
      }
      try {
        const snap = await getDoc(doc(db, "users", user.uid))
        if (snap.exists()) {
          const data = snap.data() as {
            name?: string
            address?: string
            phone?: string
          }
          if (data.name) {
            setName(data.name)
            setNameLocked(true)
          }
          if (data.address) setAddress(data.address)
          if (data.phone) setPhone(String(data.phone).replace(/\D/g, ""))
        }
      } finally {
        setLoadingProfile(false)
      }
    }
    load()
  }, [user?.uid])

  /* ---------- CREATE PAYMENT INTENT ---------- */
  const totalCents = useMemo(() => cartTotalCents(cart), [cart])
  const totalAmount = totalCents / 100
  const cartFingerprint = useMemo(
    () =>
      cart
        .map((item) => `${item.id}:${item.quantity}`)
        .sort()
        .join("|"),
    [cart]
  )
  const activeClientSecret =
    paymentIntent?.fingerprint === cartFingerprint ? paymentIntent.clientSecret : null

  useEffect(() => {
    if (paymentMethod !== "card" || activeClientSecret || !user || !cartFingerprint) return

    const controller = new AbortController()

    const createIntent = async () => {
      try {
        setPaymentError("")
        const token = await user.getIdToken()
        const idempotencyKey =
          idempotencyKeys.current.get(cartFingerprint) ?? `checkout:${crypto.randomUUID()}`
        idempotencyKeys.current.set(cartFingerprint, idempotencyKey)
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey,
          },
          body: JSON.stringify({
            items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
            currency: "usd",
          }),
          signal: controller.signal,
        })
        const data = (await response.json()) as {
          clientSecret?: string
          error?: { message?: string }
        }
        if (!response.ok || !data.clientSecret) {
          throw new Error(data.error?.message ?? "Payment could not be initialized")
        }
        setPaymentIntent({ fingerprint: cartFingerprint, clientSecret: data.clientSecret })
      } catch (error: unknown) {
        if (!controller.signal.aborted) {
          setPaymentError(
            error instanceof Error ? error.message : "Payment could not be initialized"
          )
        }
      }
    }

    void createIntent()
    return () => controller.abort()
  }, [activeClientSecret, cart, cartFingerprint, paymentMethod, user])

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    if (!user?.uid || !user?.email) {
      router.push("/login")
      return
    }

    const customer = validateCheckoutCustomer({ name, address, phone, paymentMethod })
    if (!customer.success) {
      alert(customer.error.issues[0]?.message ?? "Please fill all fields correctly.")
      return
    }

    let paymentIntentId: string | null = null

    try {
      setSubmitting(true)

      /* ---- CARD PAYMENT ---- */
      if (paymentMethod === "card") {
        if (!stripe || !elements || !activeClientSecret) {
          alert("Payment not ready.")
          setSubmitting(false)
          return
        }

        const result = await stripe.confirmCardPayment(activeClientSecret, {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name: customer.data.name,
              email: user.email,
            },
          },
        })

        if (result.error || result.paymentIntent?.status !== "succeeded") {
          alert(result.error?.message || "Payment failed.")
          setSubmitting(false)
          return
        }

        paymentIntentId = result.paymentIntent?.id
      }

      /* ---- SAVE VERIFIED ORDER ---- */
      const token = await user.getIdToken()
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: customer.data.name,
          address: customer.data.address,
          phone: customer.data.phone,
          paymentMethod,
          paymentIntentId,
          items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
        }),
      })
      const orderResult = (await orderResponse.json()) as { error?: { message?: string } }
      if (!orderResponse.ok) {
        throw new Error(orderResult.error?.message ?? "Order could not be saved")
      }

      localStorage.setItem(
        "lastOrder",
        JSON.stringify({
          name: customer.data.name,
          email: user.email,
          address: customer.data.address,
          phone: customer.data.phone,
          items: cart,
          paymentMethod,
          paid: paymentMethod === "card",
          paymentIntentId,
          timestamp: new Date().toISOString(),
        })
      )

      clearCart()
      router.push("/thankyou")
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pink-50 text-gray-900">
        Loading…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pink-50 px-4 py-10 text-gray-900">
      <div className="mx-auto max-w-md">
        <button onClick={() => router.back()} className="mb-4 text-pink-600 hover:underline">
          ← Back
        </button>

        <h1 className="mb-6 text-center text-3xl font-bold text-pink-600">Checkout</h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border border-pink-100 bg-white p-6 text-gray-900 shadow-md"
        >
          {/* Name */}
          <div>
            <label className="mb-1 block font-semibold">Full Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={nameLocked}
              className="w-full rounded border px-3 py-2 text-gray-900"
            />
          </div>

          {/* Address */}
          <div>
            <label className="mb-1 block font-semibold">Shipping Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full rounded border px-3 py-2 text-gray-900"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1 block font-semibold">Phone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded border px-3 py-2 text-gray-900"
            />
          </div>

          {/* Payment Method */}
          <div className="rounded border p-3">
            <p className="mb-2 font-semibold">Payment Method</p>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              Cash on Delivery
            </label>

            <label className="mt-2 flex items-center gap-2">
              <input
                type="radio"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
              />
              Card (Stripe)
            </label>
          </div>

          {/* Card UI */}
          {paymentMethod === "card" && activeClientSecret && (
            <div className="rounded border bg-white p-3">
              <CardElement
                options={{
                  style: {
                    base: {
                      color: "#111827",
                      fontSize: "16px",
                      "::placeholder": { color: "#9CA3AF" },
                    },
                  },
                }}
              />
            </div>
          )}
          {paymentMethod === "card" && paymentError && (
            <p role="alert" className="text-sm text-red-600">
              {paymentError}
            </p>
          )}
          <div className="text-right font-semibold text-pink-600">
            Total: ${totalAmount.toFixed(2)}
          </div>
          <button
            type="submit"
            disabled={
              submitting ||
              (paymentMethod === "card" && (!stripe || !elements || !activeClientSecret))
            }
            className="w-full rounded bg-pink-500 py-2 text-white hover:bg-pink-600"
          >
            {submitting
              ? "Processing…"
              : paymentMethod === "card"
                ? "Pay & Place Order"
                : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ---------------- PAGE WRAPPER ---------------- */

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  )
}
