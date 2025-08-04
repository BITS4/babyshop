"use client"
import { useCart } from "../context/CartContext"

export default function CartPreview() {
  const { cart } = useCart()

  return (
    <div className="bg-white shadow p-4 rounded max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4 text-pink-600">🛒 Cart Preview</h2>
      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty</p>
      ) : (
        <ul className="space-y-2">
          {cart.map(item => (
            <li key={item.id} className="flex justify-between">
              <span>{item.name} × {item.quantity}</span>
              <span className="text-pink-600 font-semibold">{item.price}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
