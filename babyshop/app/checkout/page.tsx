"use client"

import { useEffect, useState } from "react"
import { useCart } from "../../context/CartContext"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/app/firebase"
import { doc, getDoc } from "firebase/firestore"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"

export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [nameLocked, setNameLocked] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)

  // Load profile from Firestore and prefill fields
  useEffect(() => {
    const load = async () => {
      if (!user?.uid) { setLoadingProfile(false); return }
      try {
        const snap = await getDoc(doc(db, "users", user.uid))
        if (snap.exists()) {
          const data = snap.data() as { name?: string; address?: string }
          if (data?.name) {
            setName(data.name)
            setNameLocked(true) // make name uneditable if saved
          }
          if (data?.address) setAddress(data.address) // editable but prefilled
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

    if (!user?.email) {
      alert("Please log in first.")
      router.push("/login")
      return
    }
    if (!name.trim() || !address.trim()) {
      alert("❌ Please fill in all fields.")
      return
    }
    if (cart.length === 0) {
      alert("❌ Your cart is empty.")
      return
    }

    const orderData = {
      name: name.trim(),
      email: user.email,          // save email as string
      address: address.trim(),
      items: [...cart],
      timestamp: new Date().toISOString(),
    }

    await addDoc(collection(db, "orders"), {
      userId: user.uid,
      email: user.email,
      name: orderData.name,
      address: orderData.address,
      items: orderData.items,
      createdAt: serverTimestamp()
    })

    clearCart()
    router.push("/thankyou")
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-pink-50 py-10 px-4 flex items-center justify-center">
        <p className="text-gray-600">Loading your profile…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pink-50 py-10 px-4">
      <div className="w-full max-w-sm">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 text-pink-600 hover:underline flex items-center"
        >
          ← Back
        </button>
      </div>

      <h1 className="text-3xl font-bold text-center text-pink-600 mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded shadow space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border px-3 py-2 rounded disabled:bg-gray-50"
            disabled={nameLocked}
            readOnly={nameLocked}
          />
          {nameLocked ? (
            <p className="text-xs text-gray-500 mt-1">Using your saved profile name.</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">
              No saved name found. You can set it on your <button type="button" className="underline text-pink-600" onClick={() => router.push("/profile")}>Profile</button>.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Shipping Address</label>
          <textarea
            required
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            rows={3}
          />
          <p className="text-xs text-gray-500 mt-1">Prefilled from your profile (you can edit).</p>
        </div>

        <button
          type="submit"
          className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600 transition"
        >
          Place Order
        </button>
      </form>
    </div>
  )
}
