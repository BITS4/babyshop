"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { parseLastOrder, type LastOrder } from "@/lib/orders/last-order"

export default function ThankYouPage() {
  const [order, setOrder] = useState<LastOrder | null>(null)
  const router = useRouter()

  useEffect(() => {
    queueMicrotask(() => setOrder(parseLastOrder(localStorage.getItem("lastOrder"))))
  }, [])

  const getTotal = () => {
    if (!order?.items?.length) return "0.00"
    const sum = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
    return sum.toFixed(2)
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-pink-50 text-gray-900">
        <p>No order found.</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-pink-50 px-4 py-10">
      <h1 className="mb-4 text-center text-3xl font-bold text-pink-600">
        {order.paid ? "🎉 Payment Successful!" : "✅ Order Placed!"}
      </h1>
      <p className="mb-6 text-center text-lg font-semibold text-green-600">
        {order.paid
          ? "Thank you! Your payment has been received."
          : "Your order has been placed. Please pay on delivery."}
      </p>

      <div className="mb-6 w-full max-w-2xl space-y-4 rounded bg-white p-6 text-gray-900 shadow">
        <h2 className="text-xl font-bold text-pink-600">Order Summary</h2>

        <div className="space-y-1">
          <p>
            <strong>Name:</strong> {order.name}
          </p>
          <p>
            <strong>Email:</strong> {order.email}
          </p>
          <p>
            <strong>Address:</strong> {order.address}
          </p>
          <p>
            <strong>Phone:</strong> {order.phone || "—"}
          </p>
          <p>
            <strong>Payment Method:</strong>{" "}
            {order.paymentMethod === "cod" ? "Cash on Delivery" : "Card (Stripe)"}
          </p>
          {order.paymentMethod === "card" && order.paymentIntentId && (
            <p className="text-sm text-gray-500">Payment ID: {order.paymentIntentId}</p>
          )}
        </div>

        <div>
          <h3 className="mt-4 mb-2 font-semibold">Items:</h3>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between border-b py-2 text-sm text-gray-700">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>${(item.quantity * item.price).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 text-right text-lg font-bold text-pink-600">
          Total: ${getTotal()}
        </div>
      </div>

      <button
        type="button"
        onClick={() => router.push("/")}
        className="rounded bg-pink-500 px-6 py-2 text-white hover:bg-pink-600"
      >
        🏠 Go to Home
      </button>
    </div>
  )
}
