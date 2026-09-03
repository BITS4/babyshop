"use client"

import { useEffect, useState } from "react"
import { useCart } from "../../context/CartContext"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/app/firebase"
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore"

import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

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
  const [clientSecret, setClientSecret] = useState<string | null>(null)

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
  const totalAmount = cart.reduce(
    (acc, i) => acc + Number(i.price ?? 0) * Number(i.quantity ?? 1),
    0
  )

  useEffect(() => {
    if (paymentMethod !== "card" || clientSecret) return

    const createIntent = async () => {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(totalAmount * 100) }),
      })
      const data = await res.json()
      setClientSecret(data.clientSecret)
    }

    createIntent()
  }, [paymentMethod, totalAmount])

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    if (!user?.uid || !user?.email) {
      router.push("/login")
      return
    }

    const digits = phone.replace(/\D/g, "")
    if (!name.trim() || !address.trim() || digits.length < 8) {
      alert("Please fill all fields correctly.")
      return
    }

    let paymentIntentId: string | null = null

    try {
      setSubmitting(true)

      /* ---- CARD PAYMENT ---- */
      if (paymentMethod === "card") {
        if (!stripe || !elements || !clientSecret) {
          alert("Payment not ready.")
          setSubmitting(false)
          return
        }

        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name,
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

      /* ---- SAVE ORDER ---- */
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        email: user.email,
        name: name.trim(),
        address: address.trim(),
        phone: digits,
        paymentMethod,
        paid: paymentMethod === "card",
        paymentIntentId, 
        status: "pending",
        items: cart.map(i => ({
          id: String(i.id ?? ""),
          name: String(i.name ?? ""),
          price: Number(i.price ?? 0),
          quantity: Number(i.quantity ?? 1),
          image: String(i.image ?? ""),
        })),
        createdAt: serverTimestamp(),
      })

      localStorage.setItem(
        "lastOrder",
        JSON.stringify({
          name,
          email: user.email,
          address,
          phone: digits,
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
      <div className="min-h-screen bg-pink-50 flex items-center justify-center text-gray-900">
        Loading…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pink-50 py-10 px-4 text-gray-900">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-4 text-pink-600 hover:underline"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-center text-pink-600 mb-6">
          Checkout
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md border border-pink-100 space-y-4 text-gray-900"
        >
          {/* Name */}
          <div>
            <label className="block font-semibold mb-1">Full Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={nameLocked}
              className="w-full border px-3 py-2 rounded text-gray-900"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block font-semibold mb-1">
              Shipping Address
            </label>
            <textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              rows={3}
              className="w-full border px-3 py-2 rounded text-gray-900"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block font-semibold mb-1">Phone</label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
              className="w-full border px-3 py-2 rounded text-gray-900"
            />
          </div>

          {/* Payment Method */}
          <div className="border rounded p-3">
            <p className="font-semibold mb-2">Payment Method</p>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              Cash on Delivery
            </label>

            <label className="flex items-center gap-2 mt-2">
              <input
                type="radio"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
              />
              Card (Stripe)
            </label>
          </div>

          {/* Card UI */}
          {paymentMethod === "card" && clientSecret && (
            <div className="border rounded p-3 bg-white">
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
          <div className="text-right font-semibold text-pink-600">
            Total: ${totalAmount.toFixed(2)}
          </div>
          <button
            type="submit"
            disabled={submitting || 
              (paymentMethod === "card" && (!stripe || !elements || !clientSecret))}
            className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600"
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
