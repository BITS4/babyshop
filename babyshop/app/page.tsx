"use client"

import { useMemo, useState } from "react"
import Navbar from "@/components/Navbar"
import HeroSection from "@/components/HeroSection"
import ProductCard from "@/components/ProductCard"
import FloatingCart from "@/components/FloatingCart"
import { useProducts } from "@/context/ProductContext"

type SortKey =
  | "relevance"
  | "price_asc"
  | "price_desc"
  | "name_asc"
  | "name_desc"
  | "newest"
  | "oldest"

export default function Home() {
  const { products } = useProducts()
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState<string>("all")
  const [sort, setSort] = useState<SortKey>("relevance")

  // 1) Guard against malformed entries
  const safeProducts = useMemo(
    () =>
      (products ?? []).filter((p: any) => {
        const ok =
          p &&
          typeof p === "object" &&
          typeof p.name === "string" &&
          (typeof p.image === "string" || typeof p.image === "undefined") &&
          (typeof p.price === "number" || typeof p.price === "string")
        return ok
      }),
    [products]
  )

  // 2) Build category options
  const categories = useMemo(() => {
    const set = new Set<string>()
    safeProducts.forEach((p: any) => {
      const c = (p?.category || "").toString().trim()
      if (c) set.add(c)
    })
    return ["all", ...Array.from(set).sort()]
  }, [safeProducts])

  // 3) Text + category filter
  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    return safeProducts.filter((product: any) => {
      const name = String(product.name ?? "").toLowerCase()
      const desc = String(product.description ?? "").toLowerCase()
      const matchesText = !q || name.includes(q) || desc.includes(q)
      const matchesCat =
        category === "all" ||
        (product.category || "").toLowerCase() === category.toLowerCase()
      return matchesText && matchesCat
    })
  }, [safeProducts, searchTerm, category])

  // 4) Sorting
  const sortedProducts = useMemo(() => {
    const arr = [...filteredProducts]
    const price = (p: any) => Number(p.price ?? 0)
    const name = (p: any) => String(p.name ?? "")
    const createdHint = (p: any) => Number(p.id ?? 0) // localId = Date.now() at create; works for newest/oldest

    switch (sort) {
      case "price_asc":
        arr.sort((a, b) => price(a) - price(b))
        break
      case "price_desc":
        arr.sort((a, b) => price(b) - price(a))
        break
      case "name_asc":
        arr.sort((a, b) => name(a).localeCompare(name(b)))
        break
      case "name_desc":
        arr.sort((a, b) => name(b).localeCompare(name(a)))
        break
      case "newest":
        arr.sort((a, b) => createdHint(b) - createdHint(a))
        break
      case "oldest":
        arr.sort((a, b) => createdHint(a) - createdHint(b))
        break
      case "relevance":
      default:
        // keep Firestore (newest-first) order for relevance
        break
    }
    return arr
  }, [filteredProducts, sort])

  return (
    <main className="min-h-screen bg-pink-50 overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <FloatingCart />

      <section className="py-10 px-6">
        <h2 className="text-2xl font-bold text-pink-600 mb-6 text-center">
          Featured Products
        </h2>

        {/* Controls row */}
        <div className="max-w-3xl mx-auto mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search (2 cols on sm+) */}
          <div className="sm:col-span-2">
            <input
              type="text"
              placeholder="🔍 Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-black placeholder:text-gray-300 w-full px-4 py-2 rounded border border-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          {/* Category */}
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white text-black px-3 py-2 rounded border border-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-300"
              title="Filter by category"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "All categories" : c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="w-full bg-white text-black px-3 py-2 rounded border border-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-300"
              title="Sort products"
            >
              <option value="relevance">Sort: relevance</option>
              <option value="price_asc">Price: low → high</option>
              <option value="price_desc">Price: high → low</option>
              <option value="name_asc">Name: A → Z</option>
              <option value="name_desc">Name: Z → A</option>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>

        {sortedProducts.length === 0 ? (
          <p className="text-center text-black">No products match your search.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedProducts.map((product: any, idx: number) => (
              <ProductCard key={product.id ?? idx} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
