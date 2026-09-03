"use client"

import { useMemo, useState } from "react"
import Navbar from "@/components/Navbar"
import HeroSection from "@/components/HeroSection"
import ProductCard from "@/components/ProductCard"
import FloatingCart from "@/components/FloatingCart"
import { useProducts } from "@/context/ProductContext"
import { filterProducts, listCategories } from "@/lib/catalog/filter-products"
import { sortProducts, type ProductSort } from "@/lib/catalog/sort-products"

export default function Home() {
  const { products } = useProducts()
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState<string>("all")
  const [sort, setSort] = useState<ProductSort>("relevance")
  const categories = useMemo(() => listCategories(products), [products])
  const filteredProducts = useMemo(
    () => filterProducts(products, searchTerm, category),
    [category, products, searchTerm]
  )
  const sortedProducts = useMemo(
    () => sortProducts(filteredProducts, sort),
    [filteredProducts, sort]
  )

  return (
    <main className="min-h-screen overflow-x-hidden bg-pink-50">
      <Navbar />
      <HeroSection />
      <FloatingCart />

      <section className="px-6 py-10">
        <h2 className="mb-6 text-center text-2xl font-bold text-pink-600">Featured Products</h2>

        {/* Controls row */}
        <div className="mx-auto mb-6 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-4">
          {/* Search (2 cols on sm+) */}
          <div className="sm:col-span-2">
            <input
              type="text"
              placeholder="🔍 Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded border border-gray-500 px-4 py-2 text-black placeholder:text-gray-300 focus:ring-2 focus:ring-pink-300 focus:outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded border border-gray-500 bg-white px-3 py-2 text-black focus:ring-2 focus:ring-pink-300 focus:outline-none"
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
              onChange={(e) => setSort(e.target.value as ProductSort)}
              className="w-full rounded border border-gray-500 bg-white px-3 py-2 text-black focus:ring-2 focus:ring-pink-300 focus:outline-none"
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
