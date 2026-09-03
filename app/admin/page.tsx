"use client"

import { useEffect, useRef, useState, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { useProducts } from "../../context/ProductContext"
import { useAuth } from "../../context/AuthContext"
import { DriveImage } from "@/components/DriveImage"
import { imageCandidates } from "@/lib/catalog/image-source"
import type { Product } from "@/lib/catalog/product"
import { errorMessage } from "@/lib/security/errors"
import { validateImageUpload } from "@/lib/security/image-upload"

const CATEGORIES = ["t-shirt", "socks", "onesie", "bodysuit", "pajamas", "hats", "shoes", "toys"]
const DEFAULT_CATEGORY = "t-shirt"

export default function AdminPage() {
  const router = useRouter()
  const { user, isLoading, isAdmin, isClaimsLoading } = useAuth()
  const { addProduct, products, deleteProduct, updateProduct } = useProducts()

  const [name, setName] = useState("")
  const [price, setPrice] = useState<number | "">("")
  const [image, setImage] = useState("") // accepts https://, data:image/..., Google Drive links
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<string>(DEFAULT_CATEGORY)
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)

  const [processingImage, setProcessingImage] = useState(false)
  const [processMsg, setProcessMsg] = useState<string>("")
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isLoading || isClaimsLoading) return
    if (!user) {
      router.push("/login")
      return
    }
    if (!isAdmin) {
      router.push("/")
      return
    }
  }, [user, isLoading, isAdmin, isClaimsLoading, router])

  if (isLoading || isClaimsLoading || !user || !isAdmin) return null

  const normalizeForSave = (url: string): string => imageCandidates(url)[0] ?? url

  const softCheckImageUrl = async (url: string) => {
    try {
      const u = normalizeForSave(url)
      if (u.startsWith("data:") || u.startsWith("/")) return
      await fetch(u, { method: "GET", mode: "no-cors" })
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
    const validation = validateImageUpload(file, 8 * 1024 * 1024)
    if (!validation.valid) {
      alert(validation.message)
      e.target.value = ""
      return
    }
    try {
      setProcessingImage(true)
      setProcessMsg("Optimizing image…")
      const dataUrl = await fileToDataUrl(file, 1024, 0.85)
      const bytesApprox = Math.ceil((dataUrl.length * 3) / 4)
      setProcessMsg(
        bytesApprox > 500 * 1024 ? "Image is large (>500KB). Consider a smaller one." : "Ready ✓"
      )
      setImage(dataUrl)
    } catch (error: unknown) {
      alert(errorMessage(error, "Failed to process image."))
      setProcessMsg("Failed to process image.")
    } finally {
      setProcessingImage(false)
      e.target.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || price === "" || !image.trim() || !description.trim() || !category) {
      alert("❌ Please fill in all fields.")
      return
    }
    const numericPrice = typeof price === "number" ? price : parseFloat(price as unknown as string)
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      alert("❌ Price must be a valid non-negative number.")
      return
    }

    const finalImage = normalizeForSave(image.trim())
    await softCheckImageUrl(finalImage)

    if (isEditing && editId !== null) {
      await updateProduct({
        id: editId,
        name: name.trim(),
        description: description.trim(),
        price: numericPrice,
        image: finalImage,
        category,
      })
      alert("✅ Product updated.")
    } else {
      await addProduct({
        name: name.trim(),
        description: description.trim(),
        price: numericPrice,
        image: finalImage,
        category,
      })
      alert("✅ Product added.")
    }

    setName("")
    setPrice("")
    setImage("")
    setDescription("")
    setEditId(null)
    setIsEditing(false)
    setProcessMsg("")
    setCategory(DEFAULT_CATEGORY)
  }

  const handleEditClick = (product: Product) => {
    setIsEditing(true)
    setEditId(product.id)
    setName(product.name)
    setPrice(product.price)
    setImage(product.image)
    setDescription(product.description)
    setCategory(product.category || DEFAULT_CATEGORY)
  }

  // --- UI ---------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-pink-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 flex items-center text-pink-600 hover:underline"
        >
          ← Back
        </button>
      </div>

      <div className="mb-6 text-center">
        <a href="/admin/orders" className="text-pink-600 underline hover:text-pink-800">
          View Orders
        </a>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto mb-10 w-full max-w-md space-y-4 rounded bg-white p-6 shadow-md"
      >
        <h1 className="text-center text-2xl font-bold text-pink-600">Admin – Add Product</h1>

        <input
          type="text"
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        />
        <input
          type="number"
          placeholder="Price (e.g. 19.99)"
          value={price}
          onChange={(e) => setPrice(e.target.value === "" ? "" : parseFloat(e.target.value))}
          className="w-full rounded border px-3 py-2"
          step="0.01"
          min="0"
          required
        />

        {/* Category select */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded border bg-white px-3 py-2"
          required
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        />

        <div className="space-y-2">
          <input
            type="text"
            placeholder="Image URL (supports Google Drive links)"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full rounded border px-3 py-2"
            required
          />
          <p className="text-xs text-gray-500">
            Tip: Paste a Drive link like{" "}
            <code className="rounded bg-gray-100 px-1">
              https://drive.google.com/file/d/FILE_ID/view?...
            </code>{" "}
            and set sharing to <strong>Anyone with the link – Viewer</strong>.
          </p>

          <div className="mt-2 flex items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPick}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              disabled={processingImage}
            >
              {processingImage ? "Processing…" : "Choose image file"}
            </button>
            {image && !processingImage && (
              <span className="max-w-[240px] truncate text-xs text-gray-500">Image set ✓</span>
            )}
          </div>

          {(processingImage || processMsg) && (
            <p className="text-xs text-gray-600">{processMsg || "Processing…"}</p>
          )}

          {image && (
            <div className="mt-2 aspect-square w-24 overflow-hidden rounded border border-gray-200 bg-white">
              <DriveImage url={image} alt="preview" className="h-full w-full object-cover" />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full rounded bg-pink-500 py-2 text-white hover:bg-pink-600"
        >
          {isEditing ? "Update Product" : "Add Product"}
        </button>
      </form>

      <div className="mx-auto max-w-4xl space-y-4">
        <h2 className="mb-4 text-center text-xl font-bold text-pink-600">Product List</h2>
        {products.length === 0 ? (
          <p className="text-center text-gray-500">No products yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="relative rounded bg-white p-4 text-center shadow">
                {product.category && (
                  <span className="absolute top-2 left-2 rounded-full bg-pink-100 px-2 py-0.5 text-[11px] text-pink-700">
                    {product.category}
                  </span>
                )}
                <div className="mx-auto aspect-square w-40 overflow-hidden rounded bg-gray-50">
                  <DriveImage
                    url={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="mt-2 text-lg font-semibold text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.description}</p>
                <p className="mt-1 font-bold text-pink-600">${product.price.toFixed(2)}</p>

                <button
                  onClick={() => handleEditClick(product)}
                  className="mt-2 text-sm text-blue-500 underline hover:text-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${product.name}"?`))
                      deleteProduct(product.id)
                  }}
                  className="absolute top-2 right-2 text-sm text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
