"use client"
import { useCart } from "../context/CartContext"
import { useState } from "react"

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

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
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

      <h3 className="mt-2 font-semibold text-lg text-gray-800">{product.name}</h3>
      <p className="text-pink-600 font-bold">${product.price.toFixed(2)}</p>
      <button
        className="mt-3 bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition"
        onClick={() => addToCart(product)}
      >
        Add to Cart
      </button>
    </div>
  )
}
