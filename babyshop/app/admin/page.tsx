/* eslint-disable @next/next/no-img-element */
"use client"

import { useEffect, useRef, useState, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { useProducts } from "../../context/ProductContext"
import { useAuth } from "../../context/AuthContext"
import type { Product } from "@/components/ProductCard"

export default function AdminPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { addProduct, products, deleteProduct, updateProduct } = useProducts()

  const [name, setName] = useState("")
  const [price, setPrice] = useState<number | "">("")
  const [image, setImage] = useState("") // https:// or data:image/...
  const [description, setDescription] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)

  const [processingImage, setProcessingImage] = useState(false)
  const [processMsg, setProcessMsg] = useState<string>("")
  const fileRef = useRef<HTMLInputElement>(null)

  const isAdmin = (user?.email || "").toLowerCase() === "vazirpirov15@gmail.com"

  useEffect(() => {
    if (isLoading) return
    if (!user) { router.push("/login"); return }
    if (!isAdmin) { router.push("/"); return }
  }, [user, isLoading, isAdmin, router])

  if (isLoading || !user || !isAdmin) return null

  const softCheckImageUrl = async (url: string) => {
    try {
      if (url.startsWith("data:") || url.startsWith("/")) return
      await fetch(url, { method: "GET", mode: "no-cors" })
    } catch {}
  }

  const fileToDataUrl = (file: File, maxDim = 1024, quality = 0.85): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = document.createElement("img")
      img.onload = () => {
        const srcW = img.naturalWidth || img.width
        const srcH = img.naturalHeight || img.height
        if (!srcW || !srcH) return reject(new Error("Could not read image size"))
        const scale = Math.min(1, maxDim / Math.max(srcW, srcH))
        const w = Math.max(1, Math.round(srcW * scale))
        const h = Math.max(1, Math.round(srcH * scale))
        const canvas = document.createElement("canvas")
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext("2d")
        if (!ctx) return reject(new Error("Canvas not supported"))
        ctx.drawImage(img, 0, 0, w, h)
        const mime = file.type.startsWith("image/png") ? "image/png" : "image/jpeg"
        const dataUrl = canvas.toDataURL(mime, mime === "image/png" ? undefined : quality)
        resolve(dataUrl)
        URL.revokeObjectURL(img.src)
      }
      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = URL.createObjectURL(file)
    })

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { alert("Please choose an image file."); e.target.value = ""; return }
    try {
      setProcessingImage(true)
      setProcessMsg("Optimizing image…")
      const dataUrl = await fileToDataUrl(file, 1024, 0.85)
      const bytesApprox = Math.ceil((dataUrl.length * 3) / 4)
      setProcessMsg(bytesApprox > 500 * 1024 ? "Image is large (>500KB). Consider a smaller one." : "Ready ✓")
      setImage(dataUrl)
    } catch (err: any) {
      alert(err?.message || "Failed to process image.")
      setProcessMsg("Failed to process image.")
    } finally {
      setProcessingImage(false)
      e.target.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || price === "" || !image.trim() || !description.trim()) { alert("❌ Please fill in all fields."); return }
    const numericPrice = typeof price === "number" ? price : parseFloat(price as unknown as string)
    if (Number.isNaN(numericPrice) || numericPrice < 0) { alert("❌ Price must be a valid non-negative number."); return }

    await softCheckImageUrl(image.trim())

    if (isEditing && editId !== null) {
      await updateProduct({
        id: editId,
        name: name.trim(),
        description: description.trim(),
        price: numericPrice,
        image: image.trim(),
      })
      alert("✅ Product updated.")
    } else {
      await addProduct({
        name: name.trim(),
        description: description.trim(),
        price: numericPrice,
        image: image.trim(),
      })
      alert("✅ Product added.")
    }

    setName(""); setPrice(""); setImage(""); setDescription(""); setEditId(null); setIsEditing(false); setProcessMsg("")
  }

  const handleEditClick = (product: Product) => {
    setIsEditing(true)
    setEditId(product.id)
    setName(product.name)
    setPrice(product.price)
    setImage(product.image)
    setDescription(product.description)
  }

  return (
    <div className="min-h-screen bg-pink-50 py-10 px-4">
      <div className="w-full max-w-sm">
        <button type="button" onClick={() => router.back()} className="mb-4 text-pink-600 hover:underline flex items-center">
          ← Back
        </button>
      </div>

      <div className="text-center mb-6">
        <a href="/admin/orders" className="text-pink-600 underline hover:text-pink-800">View Orders</a>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md mx-auto space-y-4 mb-10">
        <h1 className="text-2xl font-bold text-pink-600 text-center">Admin – Add Product</h1>

        <input type="text" placeholder="Product name" value={name} onChange={e => setName(e.target.value)} className="w-full border px-3 py-2 rounded" required />
        <input type="number" placeholder="Price (e.g. 19.99)" value={price} onChange={e => setPrice(e.target.value === "" ? "" : parseFloat(e.target.value))} className="w-full border px-3 py-2 rounded" step="0.01" min="0" required />
        <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full border px-3 py-2 rounded" required />

        <div className="space-y-3">
          <input type="text" placeholder="Image URL (https://… or /images/… or data:image/…)" value={image} onChange={e => setImage(e.target.value)} className="w-full border px-3 py-2 rounded" required />

          <div className="flex items-center gap-3">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
            <button type="button" onClick={() => fileRef.current?.click()} className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50" disabled={processingImage}>
              {processingImage ? "Processing…" : "Choose image file"}
            </button>
            {image && !processingImage && (
              <span className="text-xs text-gray-500 truncate max-w-[240px]" title={image}>Image set ✓</span>
            )}
          </div>

          {(processingImage || processMsg) && <p className="text-xs text-gray-600">{processMsg || "Processing…"}</p>}

          {image && (
            <div className="mt-2 w-24 aspect-square overflow-hidden rounded border border-gray-200 bg-white">
              <img src={image} alt="preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <button type="submit" className="w-full bg-pink-500 text-white py-2 rounded hover:bg-pink-600">
          {isEditing ? "Update Product" : "Add Product"}
        </button>
      </form>

      <div className="max-w-4xl mx-auto space-y-4">
        <h2 className="text-xl font-bold text-center text-pink-600 mb-4">Product List</h2>
        {products.length === 0 ? (
          <p className="text-center text-gray-500">No products yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white p-4 rounded shadow text-center relative">
                <div className="w-40 aspect-square overflow-hidden rounded mx-auto bg-gray-50">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="mt-2 font-semibold text-lg text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.description}</p>
                <p className="font-bold text-pink-600 mt-1">${product.price.toFixed(2)}</p>

                <button onClick={() => handleEditClick(product)} className="mt-2 text-sm text-blue-500 underline hover:text-blue-700">Edit</button>
                <button onClick={() => { if (confirm(`Are you sure you want to delete "${product.name}"?`)) deleteProduct(product.id) }} className="absolute top-2 right-2 text-red-500 text-sm hover:underline">Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
