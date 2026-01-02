"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type OrderProduct = {
  id: number
  name: string
  quantity: number
  price: number
  image?: string
}

type Order = {
  name: string
  email: string
  address: string
  phone?: string
  paymentMethod: "cod" | "card"
  paid?: boolean
  items: OrderProduct[]
  timestamp?: string
  paymentIntentId?: string
}

export default function ThankYouPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem("lastOrder")
    if (saved) {
      try {
        setOrder(JSON.parse(saved) as Order)
      } catch {
        setOrder(null)
      }
    }
  }, [])

  const getTotal = () => {
    if (!order?.items?.length) return "0.00"
    const sum = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
    return sum.toFixed(2)
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center text-gray-900">
        <p>No order found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pink-50 py-10 px-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-center text-pink-600 mb-4">
        {order.paid ? "🎉 Payment Successful!" : "✅ Order Placed!"}
      </h1>
      <p className="text-center text-green-600 font-semibold text-lg mb-6">
        {order.paid
          ? "Thank you! Your payment has been received."
          : "Your order has been placed. Please pay on delivery."}
      </p>

      <div className="max-w-2xl w-full bg-white p-6 rounded shadow space-y-4 mb-6 text-gray-900">
        <h2 className="text-xl font-bold text-pink-600">Order Summary</h2>

        <div className="space-y-1">
          <p><strong>Name:</strong> {order.name}</p>
          <p><strong>Email:</strong> {order.email}</p>
          <p><strong>Address:</strong> {order.address}</p>
          <p><strong>Phone:</strong> {order.phone || "—"}</p>
          <p><strong>Payment Method:</strong> {order.paymentMethod === "cod" ? "Cash on Delivery" : "Card (Stripe)"}</p>
          {order.paymentMethod === "card" && order.paymentIntentId && (
            <p className="text-sm text-gray-500">Payment ID: {order.paymentIntentId}</p>
          )}
        </div>

        <div>
          <h3 className="font-semibold mb-2 mt-4">Items:</h3>
          {order.items.map(item => (
            <div
              key={item.id}
              className="flex justify-between border-b py-2 text-sm text-gray-700"
            >
              <span>{item.name} × {item.quantity}</span>
              <span>${(item.quantity * item.price).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="text-right font-bold text-lg text-pink-600 border-t pt-4">
          Total: ${getTotal()}
        </div>
      </div>

      <button
        type="button"
        onClick={() => router.push('/')}
        className="bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600"
      >
        🏠 Go to Home
      </button>
    </div>
  )
}
