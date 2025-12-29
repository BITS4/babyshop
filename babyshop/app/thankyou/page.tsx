"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type OrderProduct = {
  id: number
  name: string
  quantity: number
  price: number
}

type Order = {
  name: string
  email: string
  address: string
  phone?: string
  items: OrderProduct[]
  timestamp?: string
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
    const sum = order.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    )
    return sum.toFixed(2)
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <p className="text-gray-700">No order found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pink-50 py-10 px-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-center text-pink-600 mb-4">
        🎉 Thank You!
      </h1>

      <p className="text-center text-green-600 font-semibold text-lg mb-6">
        Your order was placed successfully 💖
      </p>

      {/* OPAQUE CARD */}
      <div className="max-w-2xl w-full bg-white/100 text-gray-900 p-6 rounded-lg shadow-md border border-pink-100 space-y-4 mb-6">
        <h2 className="text-xl font-bold text-pink-600">Order Summary</h2>

        <div className="space-y-1">
          <p>
            <span className="font-semibold">Name:</span> {order.name}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {order.email}
          </p>
          <p>
            <span className="font-semibold">Address:</span> {order.address}
          </p>
          <p>
            <span className="font-semibold">Phone:</span>{" "}
            {order.phone ? order.phone : <span className="text-gray-700">—</span>}
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2 mt-4">Items:</h3>
          {order.items.map(item => (
            <div
              key={item.id}
              className="flex justify-between border-b border-pink-100 py-2 text-sm text-gray-800"
            >
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>
                ${(item.quantity * item.price).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="text-right font-bold text-lg text-pink-600 border-t border-pink-100 pt-4">
          Total: ${getTotal()}
        </div>
      </div>

      <button
        type="button"
        onClick={() => router.push("/")}
        className="bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600"
      >
        🏠 Go to Home
      </button>
    </div>
  )
}
