"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { db } from "@/app/firebase"
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore"

type OrderItem = { name: string; quantity: number }
type OrderDoc = {
  id: string
  name: string
  email: string
  address: string
  phone?: string
  items: OrderItem[]
  createdAt?: Timestamp | null
  timestamp?: string
}

export default function OrdersPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<OrderDoc[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  // redirect if not signed in
  useEffect(() => {
    if (!isLoading && !user) router.push("/login")
  }, [user, isLoading, router])

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) { setLoadingOrders(false); return }

      try {
        const colRef = collection(db, "orders")
        const isAdmin = (user.email || "").toLowerCase() === "admin@admin.com"

        let docs: any[] = []

        if (isAdmin) {
          // admin: prefer createdAt desc, fallback to unordered if index missing
          try {
            const snap = await getDocs(query(colRef, orderBy("createdAt", "desc")))
            docs = snap.docs
          } catch {
            const snap = await getDocs(colRef)
            docs = snap.docs
          }
        } else {
          // user: by userId then by email then filter all
          let snap
          try {
            snap = await getDocs(query(colRef, where("userId", "==", user.uid), orderBy("createdAt", "desc")))
          } catch {
            snap = await getDocs(query(colRef, where("userId", "==", user.uid)))
          }

          if (!snap.empty) {
            docs = snap.docs
          } else {
            const byEmail = await getDocs(query(colRef, where("email", "==", user.email)))
            if (!byEmail.empty) {
              docs = byEmail.docs
            } else {
              const all = await getDocs(colRef)
              docs = all.docs.filter(d => {
                const data = d.data() as any
                return (data.email || "").toLowerCase() === (user.email || "").toLowerCase()
              })
            }
          }
        }

        const list: OrderDoc[] = docs
          .map(d => {
            const data = d.data() as any
            return {
              id: d.id,
              name: (data?.name ?? "").toString(),
              email: (data?.email ?? "").toString(),
              address: (data?.address ?? "").toString(),
              phone: data?.phone ? String(data.phone) : undefined,
              items: Array.isArray(data?.items) ? data.items : [],
              createdAt: data?.createdAt ?? null,
              timestamp: data?.timestamp ?? null,
            }
          })
          .sort((a, b) => {
            const aMs =
              (a.createdAt && typeof (a.createdAt as any).toMillis === "function"
                ? (a.createdAt as any).toMillis()
                : a.timestamp ? new Date(a.timestamp).getTime() : 0)
            const bMs =
              (b.createdAt && typeof (b.createdAt as any).toMillis === "function"
                ? (b.createdAt as any).toMillis()
                : b.timestamp ? new Date(b.timestamp).getTime() : 0)
            return bMs - aMs
          })

        setOrders(list)
      } catch (e) {
        console.error("Failed to load orders:", e)
        setOrders([])
      } finally {
        setLoadingOrders(false)
      }
    }

    load()
  }, [user?.uid, user?.email])

  const fmtDate = (o: OrderDoc) => {
    const ts: any = o.createdAt
    if (ts && typeof ts.toDate === "function") return ts.toDate().toLocaleString()
    if (o.timestamp) return new Date(o.timestamp).toLocaleString()
    return ""
  }

  if (isLoading || !user) return null

  return (
    <div className="min-h-screen bg-pink-50 py-10 px-4">
      <div className="w-full max-w-sm">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 text-pink-600 hover:underline flex items-center"
        >
          ← Back
        </button>
      </div>

      <h1 className="text-3xl font-bold text-center text-pink-600 mb-6">Orders</h1>

      {loadingOrders ? (
        <p className="text-center text-gray-600">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-600">No orders yet.</p>
      ) : (
        <div className="max-w-3xl mx-auto space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white p-4 rounded shadow">
              <p><strong>Name:</strong> {order.name}</p>
              <p><strong>Email:</strong> {order.email}</p>
              <p><strong>Address:</strong> {order.address}</p>
              {/* Phone */}
              {order.phone ? (
                <p><strong>Phone:</strong> {order.phone}</p>
              ) : (
                <p className="text-sm text-gray-500"><strong>Phone:</strong> —</p>
              )}
              <p className="text-sm text-gray-500 mb-1">
                <strong>Date:</strong> {fmtDate(order)}
              </p>
              <div className="mt-2">
                <strong>Items:</strong>
                <ul className="list-disc list-inside">
                  {(order.items || []).map((item, i) => (
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
