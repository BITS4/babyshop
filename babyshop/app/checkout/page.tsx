"use client"

import { useEffect, useState } from "react"
import { useCart } from "../../context/CartContext"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/app/firebase"
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore"

export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [nameLocked, setNameLocked] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Load profile from Firestore and prefill fields
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
          if (data?.name) {
            setName(data.name)
            setNameLocked(true)
          }
          if (data?.address) setAddress(data.address)
          if (data?.phone) setPhone(String(data.phone).replace(/\D/g, ""))
        }
      } catch (e) {
        console.error("Failed to load profile for checkout:", e)
      } finally {
        setLoadingProfile(false)
      }
    }
    load()
  }, [user?.uid])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    if (!user?.email) {
      alert("Please log in first.")
      router.push("/login")
      return
    }

    if (!name.trim() || !address.trim()) {
      alert("❌ Please fill in all fields.")
      return
    }

    const digits = phone.replace(/\D/g, "")
    if (!digits) {
      alert("❌ Please enter your phone number.")
      return
    }
    if (digits.length < 8 || digits.length > 15) {
      alert("❌ Phone must be 8–15 digits.")
      return
    }
    if (cart.length === 0) {
      alert("❌ Your cart is empty.")
      return
    }

    try {
      setSubmitting(true)

      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        email: user.email,
        name: name.trim(),
        address: address.trim(),
        phone: digits,
        items: cart.map(item => ({
          name: String(item.name ?? ""),
          price: Number(item.price ?? 0),
          quantity: Number(item.quantity ?? 1),
          image: String(item.image ?? ""),
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
          timestamp: new Date().toISOString(),
        })
      )

      clearCart()
      router.push("/thankyou")
    } catch (err: any) {
      console.error("Order submission failed:", err)
      alert(`Order failed: ${err?.message ?? "Unknown error"}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <p className="text-gray-700">Loading your profile…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pink-50 py-10 px-4">
      <div className="max-w-md mx-auto">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 text-pink-600 hover:underline flex items-center"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-center text-pink-600 mb-6">
          Checkout
        </h1>

        {/* OPAQUE FORM CARD */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/100 text-gray-900 p-6 rounded-lg shadow-md border border-pink-100 space-y-4"
        >
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={nameLocked}
              readOnly={nameLocked}
              placeholder="e.g., John Kim"
              className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            {nameLocked ? (
              <p className="text-xs text-gray-700 mt-1">
                Using your saved profile name.
              </p>
            ) : (
              <p className="text-xs text-gray-700 mt-1">
                No saved name found. You can set it on your{" "}
                <button
                  type="button"
                  className="underline text-pink-600"
                  onClick={() => router.push("/profile")}
                >
                  Profile
                </button>.
              </p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Shipping Address
            </label>
            <textarea
              required
              value={address}
              onChange={e => setAddress(e.target.value)}
              rows={3}
              placeholder="City, district, street, building…"
              className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <p className="text-xs text-gray-700 mt-1">
              Prefilled from your profile (you can edit).
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
              placeholder="Numbers only (8–15 digits)"
              required
              className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <p className="text-xs text-gray-700 mt-1">
              {phone
                ? "Prefilled from your profile (you can edit)."
                : "Please provide a contact number for delivery."}
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600 transition disabled:opacity-60"
          >
            {submitting ? "Placing Order…" : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  )
}
