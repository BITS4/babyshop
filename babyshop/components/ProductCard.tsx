"use client"
import Image from "next/image"
import { useCart } from "../context/CartContext"

type Product = {
  id: number
  name: string
  price: string
  image: string
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart()

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
      <Image
        src={product.image}
        alt={product.name}
        width={150}
        height={150}
        className="rounded object-cover"
      />
      <h3 className="mt-2 font-semibold text-lg text-gray-800">{product.name}</h3>
      <p className="text-pink-600 font-bold">{product.price}</p>
      <button
        className="mt-3 bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition"
        onClick={() => addToCart(product)}
      >
        Add to Cart
      </button>
    </div>
  )
}
