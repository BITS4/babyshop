"use client"

import { ProductForm } from "@/components/admin/ProductForm"
import { ProductList } from "@/components/admin/ProductList"
import { useAuth } from "@/context/AuthContext"
import { useProducts } from "@/context/ProductContext"
import type { Product } from "@/lib/catalog/product"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AdminPage() {
  const router = useRouter()
  const { user, isLoading, isAdmin, isClaimsLoading } = useAuth()
  const { addProduct, products, deleteProduct, updateProduct } = useProducts()
  const [editing, setEditing] = useState<Product | undefined>()

  useEffect(() => {
    if (isLoading || isClaimsLoading) return
    if (!user) router.replace("/login")
    else if (!isAdmin) router.replace("/")
  }, [isAdmin, isClaimsLoading, isLoading, router, user])

  if (isLoading || isClaimsLoading || !user || !isAdmin) return null

  const saveProduct = async (product: Omit<Product, "id">, id?: number) => {
    if (id === undefined) await addProduct(product)
    else await updateProduct({ ...product, id })
    setEditing(undefined)
  }

  return (
    <main className="min-h-screen bg-pink-50 px-4 py-10 text-gray-900">
      <nav className="mx-auto mb-6 flex max-w-4xl justify-between">
        <button type="button" onClick={() => router.back()} className="text-pink-600">
          ← Back
        </button>
        <a href="/admin/orders" className="text-pink-600 underline">
          View orders
        </a>
      </nav>
      <ProductForm
        key={editing?.id ?? "new"}
        {...(editing ? { product: editing } : {})}
        onSave={saveProduct}
        onCancel={() => setEditing(undefined)}
      />
      <h1 className="mb-4 text-center text-xl font-bold text-pink-600">Product list</h1>
      <ProductList products={products} onEdit={setEditing} onDelete={deleteProduct} />
    </main>
  )
}
