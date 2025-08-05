"use client"

import Navbar from "@/components/Navbar"
import HeroSection from "../components/HeroSection"
import ProductCard from "../components/ProductCard"
import CartPreview from "../components/CartPreview"
import { useProducts } from "../context/ProductContext"
import { useState } from "react"

export default function Home() {
  const { products } = useProducts()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-pink-50">
      <Navbar />
      <HeroSection />

      <section className="py-10 px-6">
        <h2 className="text-2xl font-bold text-pink-600 mb-6 text-center">Featured Products</h2>

        <div className="max-w-md mx-auto mb-6">
          <input
            type="text"
            placeholder="🔍 Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="text-black placeholder:text-gray-300 w-full px-4 py-2 rounded border border-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        {filteredProducts.length === 0 ? (
          <p className="text-center text-black">No products match your search.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <CartPreview />
    </main>
  )
}
