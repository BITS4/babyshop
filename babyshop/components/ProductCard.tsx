"use client"
import { useCart } from "../context/CartContext"
import { useEffect, useRef, useState } from "react"

export type Product = {
  id: number
  name: string
  description: string
  price: number
  image: string
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const [imageError, setImageError] = useState(false)

  // toast state
  const [added, setAdded] = useState(false)
  const hideTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current)
    }
  }, [])

  const handleAdd = () => {
    addToCart(product)
    setAdded(true)
    if (hideTimer.current) window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center relative">
      {!imageError ? (
        <div className="w-40 aspect-square overflow-hidden rounded bg-gray-50">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div className="w-40 aspect-square flex items-center justify-center bg-gray-100 text-gray-500 text-sm rounded">
          Invalid image URL
        </div>
      )}

      <h3 className="mt-2 font-semibold text-lg text-gray-800 text-center">{product.name}</h3>
      <p className="text-pink-600 font-bold">${product.price.toFixed(2)}</p>

      <button
        className="mt-3 bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition"
        onClick={handleAdd}
      >
        Add to Cart
      </button>

      {/* Toast – appears for ~1.5s */}
      <div
        aria-live="polite"
        className={`
          pointer-events-none fixed left-1/2 -translate-x-1/2 bottom-4 z-50
          transition-all duration-200
          ${added ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
        `}
      >
        <div className="bg-green-600 text-white px-4 py-2 rounded shadow">
          ✔️ Product added
        </div>
      </div>
    </div>
  )
}
