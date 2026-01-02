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
  updateDoc,
  doc,
} from "firebase/firestore"

type OrderItem = { name: string; quantity: number }
type OrderDoc = {
  id: string
  name: string
  email: string
  address: string
  phone?: string
  items: OrderItem[]
  status?: string
  createdAt?: Timestamp | null
  timestamp?: string
}

export default function OrdersPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<OrderDoc[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  const isAdmin =
    (user?.email || "").toLowerCase() === "vazirpirov15@gmail.com"

  // must be signed in
  useEffect(() => {
    if (isLoading) return
    if (!user) router.push("/login")
  }, [user, isLoading, router])

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) {
        setLoadingOrders(false)
        return
      }

      try {
        const colRef = collection(db, "orders")
        let docs: any[] = []

        if (isAdmin) {
          try {
            const snap = await getDocs(
              query(colRef, orderBy("createdAt", "desc"))
            )
            docs = snap.docs
          } catch {
            const snap = await getDocs(colRef)
            docs = snap.docs
          }
        } else {
          let snap
          try {
            snap = await getDocs(
              query(
                colRef,
                where("userId", "==", user.uid),
                orderBy("createdAt", "desc")
              )
            )
          } catch {
            snap = await getDocs(
              query(colRef, where("userId", "==", user.uid))
            )
          }

          if (!snap.empty) {
            docs = snap.docs
          } else {
            const byEmail = await getDocs(
              query(colRef, where("email", "==", user.email))
            )
            docs = !byEmail.empty ? byEmail.docs : []
          }
        }

        const list: OrderDoc[] = docs
          .map((d) => {
            const data = d.data() as any
            return {
              id: d.id,
              name: String(data?.name ?? ""),
              email: String(data?.email ?? ""),
              address: String(data?.address ?? ""),
              phone: data?.phone ? String(data.phone) : undefined,
              items: Array.isArray(data?.items) ? data.items : [],
              status: String(data?.status ?? "pending"),
              createdAt: data?.createdAt ?? null,
              timestamp: data?.timestamp ?? null,
            }
          })
          .sort((a, b) => {
            const aMs =
              a.createdAt && typeof (a.createdAt as any).toMillis === "function"
                ? (a.createdAt as any).toMillis()
                : a.timestamp
                ? new Date(a.timestamp).getTime()
                : 0

            const bMs =
              b.createdAt && typeof (b.createdAt as any).toMillis === "function"
                ? (b.createdAt as any).toMillis()
                : b.timestamp
                ? new Date(b.timestamp).getTime()
                : 0

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
  }, [user?.uid, user?.email, isAdmin])

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status })
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status } : o
        )
      )
    } catch {
      alert("Failed to update status")
    }
  }

  const fmtDate = (o: OrderDoc) => {
    if (o.createdAt && typeof (o.createdAt as any).toDate === "function")
      return o.createdAt.toDate().toLocaleString()
    if (o.timestamp) return new Date(o.timestamp).toLocaleString()
    return ""
  }

  if (isLoading || !user) return null

  return (
    <div className="min-h-screen bg-pink-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 text-pink-600 hover:underline flex items-center"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-center text-pink-600 mb-8">
          Orders
        </h1>

        {loadingOrders ? (
          <p className="text-center text-gray-700">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-700">No orders yet.</p>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-pink-100 rounded-lg shadow-md p-5 text-gray-800"
              >
                <p className="mb-1">
                  <span className="font-semibold text-gray-900">Name:</span>{" "}
                  {order.name}
                </p>
                <p className="mb-1">
                  <span className="font-semibold text-gray-900">Email:</span>{" "}
                  {order.email}
                </p>
                <p className="mb-1">
                  <span className="font-semibold text-gray-900">Address:</span>{" "}
                  {order.address}
                </p>

                <p className="mb-2">
                  <span className="font-semibold text-gray-900">Phone:</span>{" "}
                  {order.phone ?? "—"}
                </p>

                <p className="mb-2">
                  <span className="font-semibold text-gray-900">Status:</span>{" "}
                  <span
                    className={
                      order.status === "delivered"
                        ? "text-green-600 font-semibold"
                        : order.status === "shipped"
                        ? "text-blue-600 font-semibold"
                        : order.status === "cancelled"
                        ? "text-red-600 font-semibold"
                        : "text-orange-600 font-semibold"
                    }
                  >
                    {order.status}
                  </span>
                </p>

                {isAdmin && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-1">
                      Change status
                    </label>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateStatus(order.id, e.target.value)
                      }
                      className="border rounded px-2 py-1 text-gray-900"
                    >
                      <option value="pending">pending</option>
                      <option value="shipped">shipped</option>
                      <option value="delivered">delivered</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </div>
                )}

                <p className="text-sm text-gray-700 mt-3 mb-2">
                  <span className="font-medium">Date:</span>{" "}
                  {fmtDate(order)}
                </p>

                <div>
                  <p className="font-semibold text-gray-900 mb-1">Items:</p>
                  <ul className="list-disc list-inside text-gray-800">
                    {order.items.map((item, i) => (
                      <li key={i}>
                        {item.name} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
