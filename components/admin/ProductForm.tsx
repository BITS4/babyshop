"use client"

import { DriveImage } from "@/components/DriveImage"
import { imageFileToDataUrl } from "@/lib/admin/image-client"
import { imageCandidates } from "@/lib/catalog/image-source"
import { normalizeProductInput, type Product } from "@/lib/catalog/product"
import { errorMessage } from "@/lib/security/errors"
import { useRef, useState } from "react"

const CATEGORIES = ["t-shirt", "socks", "onesie", "bodysuit", "pajamas", "hats", "shoes", "toys"]

type ProductFormProps = {
  product?: Product
  onSave: (product: Omit<Product, "id">, id?: number) => Promise<void>
  onCancel: () => void
}

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? "")
  const [price, setPrice] = useState(product ? String(product.price) : "")
  const [description, setDescription] = useState(product?.description ?? "")
  const [image, setImage] = useState(product?.image ?? "")
  const [category, setCategory] = useState(product?.category ?? CATEGORIES[0]!)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setName("")
    setPrice("")
    setDescription("")
    setImage("")
    setCategory(CATEGORIES[0]!)
    setMessage("")
  }

  const handleFile = async (file?: File) => {
    if (!file) return
    setProcessing(true)
    try {
      const dataUrl = await imageFileToDataUrl(file)
      setImage(dataUrl)
      setMessage(dataUrl.length > 680_000 ? "Large image; consider a smaller file." : "Image ready")
    } catch (error: unknown) {
      alert(errorMessage(error, "Failed to process image."))
      setMessage("Image rejected")
    } finally {
      setProcessing(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      const normalized = normalizeProductInput({
        name,
        price,
        description,
        image: imageCandidates(image.trim())[0] ?? image.trim(),
        category,
      })
      await onSave(normalized, product?.id)
      if (!product) reset()
    } catch (error: unknown) {
      alert(errorMessage(error, "Check all product fields."))
    }
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="mx-auto mb-10 w-full max-w-md space-y-4 rounded bg-white p-6 shadow-md"
    >
      <h1 className="text-center text-2xl font-bold text-pink-600">
        {product ? "Edit product" : "Add product"}
      </h1>
      <label className="block">
        Product name
        <input
          aria-label="Product name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </label>
      <label className="block">
        Price
        <input
          aria-label="Price"
          type="number"
          value={price}
          min="0"
          step="0.01"
          onChange={(event) => setPrice(event.target.value)}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </label>
      <label className="block">
        Category
        <select
          aria-label="Category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="mt-1 w-full rounded border px-3 py-2"
        >
          {CATEGORIES.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <label className="block">
        Description
        <input
          aria-label="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </label>
      <label className="block">
        Image URL
        <input
          aria-label="Image URL"
          value={image}
          onChange={(event) => setImage(event.target.value)}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </label>
      <input
        ref={fileRef}
        aria-label="Upload image file"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => void handleFile(event.target.files?.[0])}
        className="block w-full text-sm"
      />
      {message ? (
        <p role="status" className="text-xs text-gray-600">
          {message}
        </p>
      ) : null}
      {image ? (
        <div className="h-24 w-24 overflow-hidden rounded border">
          <DriveImage url={image} alt="Product preview" className="h-full w-full object-cover" />
        </div>
      ) : null}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={processing}
          className="flex-1 rounded bg-pink-500 py-2 text-white disabled:opacity-50"
        >
          {product ? "Update product" : "Add product"}
        </button>
        {product ? (
          <button type="button" onClick={onCancel} className="rounded border px-4 py-2">
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  )
}
