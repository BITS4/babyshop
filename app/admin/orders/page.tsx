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
  updateDoc,
  doc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore"
import { parseOrderDocument, sortOrdersNewestFirst, type Order } from "@/lib/orders/order"
import { reportClientError } from "@/lib/observability/client"

export default function OrdersPage() {
  const { user, isLoading, isAdmin, isClaimsLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  // must be signed in
  useEffect(() => {
    if (isLoading || isClaimsLoading) return
    if (!user) router.push("/login")
  }, [user, isLoading, isClaimsLoading, router])

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) {
        setLoadingOrders(false)
        return
      }

      try {
        const colRef = collection(db, "orders")
        let documents: QueryDocumentSnapshot<DocumentData>[] = []

        if (isAdmin) {
          try {
            const snap = await getDocs(query(colRef, orderBy("createdAt", "desc")))
            documents = snap.docs
          } catch {
            const snap = await getDocs(colRef)
            documents = snap.docs
          }
        } else {
          let snap
          try {
            snap = await getDocs(
              query(colRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"))
            )
          } catch {
            snap = await getDocs(query(colRef, where("userId", "==", user.uid)))
          }

          if (!snap.empty) {
            documents = snap.docs
          } else {
            const byEmail = await getDocs(query(colRef, where("email", "==", user.email)))
            documents = !byEmail.empty ? byEmail.docs : []
          }
        }

        const list = sortOrdersNewestFirst(
          documents
            .map((document) => parseOrderDocument(document.id, document.data()))
            .filter((order): order is Order => order !== null)
        )

        setOrders(list)
      } catch (error: unknown) {
        reportClientError(error, { operation: "load_orders" })
        setOrders([])
      } finally {
        setLoadingOrders(false)
      }
    }

    load()
  }, [user?.uid, user?.email, isAdmin])

  const updateStatus = async (orderId: string, status: Order["status"]) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status })
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
    } catch {
      alert("Failed to update status")
    }
  }

  const fmtDate = (o: Order) => {
    if (o.createdAt) return o.createdAt.toDate().toLocaleString()
    if (o.timestamp) return new Date(o.timestamp).toLocaleString()
    return ""
  }

  if (isLoading || isClaimsLoading || !user) return null

  return (
    <div className="min-h-screen bg-pink-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 flex items-center text-pink-600 hover:underline"
        >
          ← Back
        </button>

        <h1 className="mb-8 text-center text-3xl font-bold text-pink-600">Orders</h1>

        {loadingOrders ? (
          <p className="text-center text-gray-700">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-700">No orders yet.</p>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-lg border border-pink-100 bg-white p-5 text-gray-800 shadow-md"
              >
                <p className="mb-1">
                  <span className="font-semibold text-gray-900">Name:</span> {order.name}
                </p>
                <p className="mb-1">
                  <span className="font-semibold text-gray-900">Email:</span> {order.email}
                </p>
                <p className="mb-1">
                  <span className="font-semibold text-gray-900">Address:</span> {order.address}
                </p>

                <p className="mb-2">
                  <span className="font-semibold text-gray-900">Phone:</span> {order.phone ?? "—"}
                </p>

                <p className="mb-2">
                  <span className="font-semibold text-gray-900">Status:</span>{" "}
                  <span
                    className={
                      order.status === "delivered"
                        ? "font-semibold text-green-600"
                        : order.status === "shipped"
                          ? "font-semibold text-blue-600"
                          : order.status === "cancelled"
                            ? "font-semibold text-red-600"
                            : "font-semibold text-orange-600"
                    }
                  >
                    {order.status}
                  </span>
                </p>

                {isAdmin && (
                  <div className="mt-3">
                    <label className="mb-1 block text-sm font-medium">Change status</label>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value as Order["status"])}
                      className="rounded border px-2 py-1 text-gray-900"
                    >
                      <option value="pending">pending</option>
                      <option value="shipped">shipped</option>
                      <option value="delivered">delivered</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </div>
                )}

                <p className="mt-3 mb-2 text-sm text-gray-700">
                  <span className="font-medium">Date:</span> {fmtDate(order)}
                </p>

                <div>
                  <p className="mb-1 font-semibold text-gray-900">Items:</p>
                  <ul className="list-inside list-disc text-gray-800">
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
