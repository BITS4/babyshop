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
    if (!user) return
    const raw = localStorage.getItem("orders")
    if (!raw) { setOrders([]); return }

    try {
      const parsed = JSON.parse(raw)
      const allOrders: any[] = Array.isArray(parsed) ? parsed : Object.values(parsed ?? {})

      const pickEmail = (o: any) =>
        typeof o?.email === "string" ? o.email
        : (typeof o?.email === "object" && typeof o?.email?.email === "string" ? o.email.email
        : (o?.userEmail ?? o?.contact?.email ?? ""))

      const userEmail = String(user?.email || "").toLowerCase()

      const visible = userEmail === "admin@admin.com"
        ? allOrders
        : allOrders.filter(o => String(pickEmail(o)).toLowerCase() === userEmail)

      const normalized = visible.map(o => ({
        ...o,
        email: pickEmail(o),
        timestamp: o.timestamp ?? o.createdAt ?? Date.now(),
        items: Array.isArray(o.items) ? o.items : []
      }))

      setOrders(normalized)
    } catch (e) {
      console.error("Failed to parse orders from localStorage", e)
      setOrders([])
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
