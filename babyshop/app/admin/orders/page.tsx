"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

export default function OrdersPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading])

  useEffect(() => {
    const storedOrders = localStorage.getItem("orders")
    if (storedOrders) {
      const allOrders = JSON.parse(storedOrders)

      if (user?.email === "admin@admin.com") {
        // Admin sees all orders
        setOrders(allOrders)
      } else {
        // Regular user sees only their orders
        const userOrders = allOrders.filter((order: any) => order.email === user?.email)
        setOrders(userOrders)
      }
    }
  }, [user])

  if (isLoading || !user) return null

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
      <h1 className="text-3xl font-bold text-center text-pink-600 mb-6">Orders</h1>
      {orders.length === 0 ? (
        <p className="text-center text-gray-600">No orders yet.</p>
      ) : (
        <div className="max-w-3xl mx-auto space-y-4">
          {orders.map((order, index) => (
            <div key={index} className="bg-white p-4 rounded shadow">
              <p><strong>Name:</strong> {order.name}</p>
              <p><strong>Email:</strong> {order.email}</p>
              <p><strong>Address:</strong> {order.address}</p>
              <p className="text-sm text-gray-500 mb-1">
                <strong>Date:</strong> {new Date(order.timestamp).toLocaleString()}
              </p>
              <div className="mt-2">
                <strong>Items:</strong>
                <ul className="list-disc list-inside">
                  {order.items.map((item: any, i: number) => (
                    <li key={i}>{item.name} × {item.quantity}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
