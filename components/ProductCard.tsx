"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useCart } from "@/context/CartContext"
import { imageCandidates } from "@/lib/catalog/image-source"
import type { Product } from "@/lib/catalog/product"

export type { Product } from "@/lib/catalog/product"

export default function ProductCard({ product }: { product?: Partial<Product> | null }) {
  const safeProduct = product && typeof product === "object" ? product : {}
  const safeImage = typeof safeProduct.image === "string" ? safeProduct.image : ""
  const price =
    typeof safeProduct.price === "number" ? safeProduct.price : Number(safeProduct.price ?? 0)
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)
  const hideTimer = useRef<number | null>(null)
  const variants = useMemo(() => imageCandidates(safeImage), [safeImage])
  const [sourceIndex, setSourceIndex] = useState(0)
  const [imageError, setImageError] = useState(false)
  const currentSource = variants[sourceIndex]

  useEffect(
    () => () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current)
    },
    []
  )

  const onImageError = () => {
    if (sourceIndex + 1 < variants.length) setSourceIndex(sourceIndex + 1)
    else setImageError(true)
  }

  const handleAdd = () => {
    addToCart({
      id: typeof safeProduct.id === "number" ? safeProduct.id : Date.now(),
      name: String(safeProduct.name ?? "Untitled"),
      description: String(safeProduct.description ?? "Product description unavailable"),
      price: Number.isFinite(price) && price >= 0 ? price : 0,
      image: safeImage || "/images/onesie.jpeg",
      category: typeof safeProduct.category === "string" ? safeProduct.category : "uncategorized",
    })
    setAdded(true)
    if (hideTimer.current) window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setAdded(false), 1_500)
  }

  return (
    <article className="relative flex flex-col items-center rounded-lg bg-white p-4 shadow">
      {safeProduct.category && (
        <span className="absolute top-2 left-2 rounded-full bg-pink-100 px-2 py-0.5 text-[11px] text-pink-700">
          {safeProduct.category}
        </span>
      )}

      {!imageError && currentSource ? (
        <div className="aspect-square w-40 overflow-hidden rounded bg-gray-50">
          {/* Google Drive fallbacks cannot be optimized reliably by next/image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentSource}
            alt={String(safeProduct.name ?? "Product")}
            className="h-full w-full object-cover"
            onError={onImageError}
          />
        </div>
      ) : (
        <div className="flex aspect-square w-40 items-center justify-center rounded bg-gray-100 px-2 text-center text-sm text-gray-500">
          No image
        </div>
      )}

      <h3 className="mt-2 text-center text-lg font-semibold text-gray-800">
        {safeProduct.name ?? "Untitled"}
      </h3>
      <p className="font-bold text-pink-600">
        {Number.isFinite(price) ? `$${price.toFixed(2)}` : "$0.00"}
      </p>
      <button
        className="mt-3 rounded bg-pink-500 px-4 py-2 text-white transition hover:bg-pink-600"
        onClick={handleAdd}
      >
        Add to Cart
      </button>

      <div
        aria-live="polite"
        className={`pointer-events-none fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transition-all duration-200 ${
          added ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <div className="rounded bg-green-600 px-4 py-2 text-white shadow">Product added</div>
      </div>
    </article>
  )
}
