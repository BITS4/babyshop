"use client"

import { useCart } from "../../context/CartContext"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const { cart } = useCart()
  const router = useRouter()

  const getTotal = () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)

  return (
    <div className="min-h-screen bg-pink-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 flex items-center text-pink-600 hover:underline"
        >
          ← Back
        </button>

        <h1 className="mb-6 text-center text-3xl font-bold text-pink-600">Your Cart</h1>

        {cart.length === 0 ? (
          <p className="text-center text-gray-700">
            Your cart is empty.{" "}
            <Link href="/" className="text-pink-600 underline">
              Continue Shopping
            </Link>
          </p>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-pink-100 bg-white/100 p-4 text-gray-900 shadow-md"
              >
                <div>
                  <h2 className="font-semibold text-gray-900">{item.name}</h2>
                  <p className="text-sm text-gray-700">
                    {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                </div>

                <p className="font-bold text-pink-600">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}

            <div className="mt-6 border-t border-pink-100 pt-4 text-right">
              <p className="text-lg font-bold text-gray-900">Total: ${getTotal()}</p>

              <Link href="/checkout">
                <button className="mt-3 rounded bg-pink-500 px-6 py-2 text-white transition hover:bg-pink-600">
                  Checkout
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
