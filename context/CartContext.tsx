"use client"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useAuth } from "@/context/AuthContext"
import type { Product } from "@/lib/catalog/product"
import { addCartItem, type CartItem } from "@/lib/cart/cart"
import { parseStoredCart, serializeCart } from "@/lib/cart/storage"

type CartContextType = {
  cart: CartItem[]
  addToCart: (product: Product) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() =>
    typeof window === "undefined" ? [] : parseStoredCart(localStorage.getItem("cart"))
  )
  const { user, isLoading } = useAuth()

  useEffect(() => {
    localStorage.setItem("cart", serializeCart(cart))
  }, [cart])

  useEffect(() => {
    if (!isLoading && !user) {
      queueMicrotask(() => setCart([]))
      localStorage.removeItem("cart")
    }
  }, [user, isLoading])

  const addToCart = (product: Product) => {
    setCart((previous) => addCartItem(previous, product))
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, clearCart: () => setCart([]) }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within CartProvider")
  return context
}
