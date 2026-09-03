"use client"
import { useCart } from "../context/CartContext"

export default function CartPreview() {
  const { cart } = useCart()

  return (
    <div className="mx-auto mt-10 max-w-md rounded bg-white p-4 shadow">
      <h2 className="mb-4 text-xl font-bold text-pink-600">🛒 Cart Preview</h2>
      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty</p>
      ) : (
        <ul className="space-y-2">
          {cart.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="font-semibold text-pink-600">{item.price}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
