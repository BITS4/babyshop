"use client"
import { useState } from "react"

export default function CheckoutPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-pink-50 py-10 px-4">
      <h1 className="text-3xl font-bold text-center text-pink-600 mb-6">Checkout</h1>
      {submitted ? (
        <p className="text-center text-green-600 font-semibold text-xl">
          ✅ Order placed successfully! Thank you 💖
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded shadow space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Full Name</label>
            <input type="text" required className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input type="email" required className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Shipping Address</label>
            <textarea required className="w-full border px-3 py-2 rounded" />
          </div>
          <button type="submit" className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600 transition">
            Place Order
          </button>
        </form>
      )}
    </div>
  )
}
