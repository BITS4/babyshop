"use client"

import { useState } from "react"
import { useProducts } from "../../context/ProductContext"
import { useAuth } from "../../context/AuthContext"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { addProduct } = useProducts()

  const [name, setName] = useState("")
  const [price, setPrice] = useState<number | "">("")
  const [image, setImage] = useState("")

  if (!user) {
    router.push("/login")
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || price === "" || !image) return

    addProduct({
      name,
      price: typeof price === "string" ? parseFloat(price) : price,
      image,
      description: "New product" // default, since description is required in Product type
    })

    setName("")
    setPrice("")
    setImage("")
  }

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-md w-full max-w-md space-y-4"
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
          placeholder="Image path (e.g. /images/new.jpeg)"
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
    </div>
  )
}
