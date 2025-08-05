"use client"

import { useState } from "react"
import { useProducts } from "../../context/ProductContext"
import { useAuth } from "../../context/AuthContext"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { addProduct, products } = useProducts()

  const [name, setName] = useState("")
  const [price, setPrice] = useState<number | "">("")
  const [image, setImage] = useState("")
  const [description, setDescription] = useState("")

  if (!user) {
    router.push("/login")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !price || !image) return

    const numericPrice = price
    if (isNaN(numericPrice)) {
      alert("❌ Price must be a valid number.")
      return
    }

    try {
      const response = await fetch(image, { method: "HEAD" })

      if (!response.ok) {
        alert("❌ Invalid image URL. Please check the link and try again.")
        return
      }

      addProduct({
        name,
        description,
        price: numericPrice,
        image,
      })

      alert("✅ Product added successfully!")
      setName("")
      setPrice("")
      setImage("")
      setDescription("")
    } catch (err) {
      alert("❌ Error verifying image URL. Please try another one.")
    }
  }

  return (
    <div className="min-h-screen bg-pink-50 py-10 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-md mx-auto space-y-4 mb-10"
      >
        <h1 className="text-2xl font-bold text-pink-600 text-center">Admin – Add Product</h1>

        <input
          type="text"
          placeholder="Product name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="number"
          placeholder="Price (e.g. 19.99)"
          value={price}
          onChange={e => setPrice(e.target.value === "" ? "" : parseFloat(e.target.value))}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <input
          type="text"
          placeholder="Image URL (e.g. /images/new.jpeg)"
          value={image}
          onChange={e => setImage(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600"
        >
          Add Product
        </button>
      </form>

      {/* Product List */}
      <div className="max-w-4xl mx-auto space-y-4">
        <h2 className="text-xl font-bold text-center text-pink-600 mb-4">Product List</h2>
        {products.length === 0 ? (
          <p className="text-center text-gray-500">No products yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white p-4 rounded shadow text-center">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={150}
                  height={150}
                  className="mx-auto rounded object-cover"
                />
                <h3 className="mt-2 font-semibold text-lg text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.description}</p>
                <p className="font-bold text-pink-600 mt-1">${product.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
