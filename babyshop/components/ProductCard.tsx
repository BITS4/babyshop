"use client"
import { useCart } from "../context/CartContext"
import { useEffect, useMemo, useRef, useState } from "react"

export type Product = {
  id: number
  name: string
  description: string
  price: number
  image: string
}

// ---- helpers outside the component
const extractDriveId = (url: string): string | null => {
  const u = (url || "").trim()
  if (!u) return null
  const patterns = [
    /https?:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{10,})/i,
    /https?:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]{10,})/i,
    /https?:\/\/drive\.google\.com\/uc\?(?:export=[^&]+&)?id=([a-zA-Z0-9_-]{10,})/i,
    /https?:\/\/drive\.googleusercontent\.com\/.*?[?&]id=([a-zA-Z0-9_-]{10,})/i,
  ]
  for (const re of patterns) {
    const m = u.match(re)
    if (m?.[1]) return m[1]
  }
  return null
}

const driveCandidates = (url?: string | null): string[] => {
  const u = (url ?? "").trim()
  if (!u) return []
  if (u.startsWith("data:") || u.startsWith("/")) return [u]
  const id = extractDriveId(u)
  if (!id) return [u]
  return [
    `https://drive.google.com/uc?export=view&id=${id}`,
    `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
    `https://drive.google.com/uc?export=download&id=${id}`,
  ]
}

export default function ProductCard({ product }: { product?: Partial<Product> | null }) {
  // ⛑️ Never touch product.image directly. Normalize first.
  const p = (product && typeof product === "object") ? product : {}
  const safeImage = typeof p.image === "string" ? p.image : ""
  const priceNum = typeof p.price === "number" ? p.price : Number(p.price ?? 0)

  const { addToCart } = useCart()

  // toast
  const [added, setAdded] = useState(false)
  const hideTimer = useRef<number | null>(null)
  useEffect(() => () => { if (hideTimer.current) window.clearTimeout(hideTimer.current) }, [])

  // image fallbacks (depend ONLY on safeImage)
  const variants = useMemo(() => driveCandidates(safeImage), [safeImage])
  const [srcIdx, setSrcIdx] = useState(0)
  const [imageError, setImageError] = useState(false)
  const currentSrc = variants[srcIdx]

  const onImgError = () => {
    if (srcIdx + 1 < variants.length) setSrcIdx(srcIdx + 1)
    else setImageError(true)
  }

  const handleAdd = () => {
    const cartProduct: Product = {
      id: typeof p.id === "number" ? p.id : Date.now(),
      name: String(p.name ?? "Untitled"),
      description: String(p.description ?? ""),
      price: Number.isFinite(priceNum) ? priceNum : 0,
      image: safeImage,
    }
    addToCart(cartProduct)
    setAdded(true)
    if (hideTimer.current) window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center relative">
      {!imageError && currentSrc ? (
        <div className="w-40 aspect-square overflow-hidden rounded bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentSrc}
            alt={String(p.name ?? "product")}
            className="w-full h-full object-cover"
            onError={onImgError}
          />
        </div>
      ) : (
        <div className="w-40 aspect-square flex items-center justify-center bg-gray-100 text-gray-500 text-sm rounded text-center px-2">
          No image
        </div>
      )}

      <h3 className="mt-2 font-semibold text-lg text-gray-800 text-center">
        {p.name ?? "Untitled"}
      </h3>
      <p className="text-pink-600 font-bold">
        {Number.isFinite(priceNum) ? `$${priceNum.toFixed(2)}` : "$0.00"}
      </p>

      <button
        className="mt-3 bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition"
        onClick={handleAdd}
      >
        Add to Cart
      </button>

      {/* toast */}
      <div
        aria-live="polite"
        className={`pointer-events-none fixed left-1/2 -translate-x-1/2 bottom-4 z-50 transition-all duration-200 ${
          added ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <div className="bg-green-600 text-white px-4 py-2 rounded shadow">✔️ Product added</div>
      </div>
    </div>
  )
}
