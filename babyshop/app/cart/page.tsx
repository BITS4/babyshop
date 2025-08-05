"use client"
import { useCart } from "../../context/CartContext"
import Link from "next/link"

export default function CartPage() {
  const { cart } = useCart()

  const getTotal = () =>
    cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)

  return (
    <div className="min-h-screen bg-pink-50 py-10 px-4">
      <h1 className="text-3xl font-bold text-center text-pink-600 mb-6">Your Cart</h1>
      {cart.length === 0 ? (
        <p className="text-center text-gray-600">
          Your cart is empty. <Link href="/" className="text-pink-500 underline">Continue Shopping</Link>
        </p>
      ) : (
        <div className="max-w-2xl mx-auto space-y-4">
          {cart.map(item => (
            <div key={item.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
              <div>
                <h2 className="font-semibold">{item.name}</h2>
                <p className="text-sm text-gray-500">
                  {item.quantity} × ${item.price.toFixed(2)}
                </p>
              </div>
              <p className="font-bold text-pink-600">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}

          <div className="text-right pt-4 border-t mt-6">
            <p className="text-lg font-bold">Total: ${getTotal()}</p>
            <Link href="/checkout">
              <button className="mt-3 bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600 transition">
                Checkout
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
