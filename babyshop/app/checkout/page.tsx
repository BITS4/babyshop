"use client"

import { useState } from "react"
import { useCart } from "../../context/CartContext"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const [name, setName] = useState("")
  const [address, setAddress] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !address) {
      alert("❌ Please fill in all fields.")
      return
    }

    if (cart.length === 0) {
      alert("❌ Your cart is empty.")
      return
    }

    const orderData = {
      name,
      email: user, // use logged-in user email
      address,
      items: [...cart],
      timestamp: new Date().toISOString(),
    }

    const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]")
    existingOrders.push(orderData)
    localStorage.setItem("orders", JSON.stringify(existingOrders))

    clearCart()
    router.push("/thankyou")
  }

  return (
    <div className="min-h-screen bg-pink-50 py-10 px-4">
        <div className="w-full max-w-sm">
          {/* Back Button */}
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 text-pink-600 hover:underline flex items-center">
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
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Shipping Address</label>
          <textarea
            required
            value={address}
            onChange={e => setAddress(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
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
