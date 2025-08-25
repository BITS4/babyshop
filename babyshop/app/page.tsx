"use client"

import { useMemo, useState } from "react"
import Navbar from "@/components/Navbar"
import HeroSection from "@/components/HeroSection"
import ProductCard from "@/components/ProductCard"
import FloatingCart from "@/components/FloatingCart"
import { useProducts } from "@/context/ProductContext"
// If you want strict types, uncomment the next line (make sure ProductCard exports the type):
// import type { Product } from "@/components/ProductCard"

export default function Home() {
  const { products } = useProducts()
  const [searchTerm, setSearchTerm] = useState("")

  // 1) Guard against null/undefined or malformed entries
  const safeProducts = useMemo(
    () =>
      (products ?? []).filter((p: any) => {
        const ok =
          p &&
          typeof p === "object" &&
          typeof p.name === "string" &&
          // image can be missing; ProductCard handles that, but keep it defined if present
          (typeof p.image === "string" || typeof p.image === "undefined") &&
          (typeof p.price === "number" || typeof p.price === "string")
        if (!ok) {
          // Optional: log once to help you find and clean bad entries in localStorage
          // console.warn("Dropping invalid product:", p)
        }
        return ok
      }),
    [products]
  )

  // 2) Search over the SAFE list only
  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return safeProducts
    return safeProducts.filter((product: any) => {
      const name = String(product.name ?? "").toLowerCase()
      const desc = String(product.description ?? "").toLowerCase()
      return name.includes(q) || desc.includes(q)
    })
  }, [safeProducts, searchTerm])

  return (
    // prevent page-level horizontal scroll
    <main className="min-h-screen bg-pink-50 overflow-x-hidden">
      <Navbar />
      <HeroSection />

      {/* Floating cart is fixed; visible anywhere on this page */}
      <FloatingCart />

      <section className="py-10 px-6">
        <h2 className="text-2xl font-bold text-pink-600 mb-6 text-center">
          Featured Products
        </h2>

        <div className="max-w-md mx-auto mb-6">
          <input
            type="text"
            placeholder="🔍 Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-black placeholder:text-gray-300 w-full px-4 py-2 rounded border border-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        {filteredProducts.length === 0 ? (
          <p className="text-center text-black">No products match your search.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product: any, idx: number) => (
              <ProductCard key={product.id ?? idx} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
