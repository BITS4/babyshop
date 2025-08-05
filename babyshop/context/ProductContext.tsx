"use client"
import { createContext, useContext, useState, ReactNode, useEffect } from "react"

export type Product = {
  id: number
  name: string
  price: string
  image: string
}

type ProductContextType = {
  products: Product[]
  addProduct: (product: Omit<Product, "id">) => void
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])


  useEffect(() => {
    const saved = localStorage.getItem("products")
    if (saved) {
      setProducts(JSON.parse(saved))
    } else {
      setProducts([
        {
          id: 1,
          name: "Fluffy Onesie",
          price: "$29.99",
          image: "/images/onesie.jpeg"
        },
        {
          id: 2,
          name: "Tiny Socks Pack",
          price: "$9.99",
          image: "/images/socks.jpeg"
        }
      ])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products))
  }, [products])

  const addProduct = (product: Omit<Product, "id">) => {
    setProducts(prev => [...prev, { ...product, id: Date.now() }])
  }

  return (
    <ProductContext.Provider value={{ products, addProduct }}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (!context) throw new Error("useProducts must be used inside ProductProvider")
  return context
}
