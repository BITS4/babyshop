"use client"
import { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react"
import type { Product } from "../components/ProductCard"

// Firestore
import { db } from "@/app/firebase"
import {
  addDoc, collection, deleteDoc, doc, onSnapshot,
  query, where, getDocs, updateDoc, serverTimestamp, orderBy
} from "firebase/firestore"

type ProductContextType = {
  products: Product[]
  addProduct: (product: Omit<Product, "id">) => Promise<void>
  updateProduct: (product: Product) => Promise<void>
  deleteProduct: (id: number) => Promise<void>
  setProducts: React.Dispatch<React.SetStateAction<Product[]>> // kept for compatibility
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  // map local numeric id -> Firestore doc id
  const idToDoc = useRef<Record<number, string>>({})

  // realtime subscription
  useEffect(() => {
    const col = collection(db, "products")
    const q = query(col, orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, (snap) => {
      const list: Product[] = []
      const map: Record<number, string> = {}
      snap.forEach(d => {
        const data = d.data() as any
        const localId = Number(data?.localId)
        if (!localId) return
        list.push({
          id: localId,
          name: String(data?.name ?? ""),
          description: String(data?.description ?? ""),
          price: Number(data?.price ?? 0),
          image: String(data?.image ?? ""),
        })
        map[localId] = d.id
      })
      idToDoc.current = map
      setProducts(list)
    }, (err) => {
      console.error("products snapshot error:", err)
      setProducts([])
    })
    return () => unsub()
  }, [])
  const addProduct = async (product: Omit<Product, "id">) => {
    try {
      const localId = Date.now()
      await addDoc(collection(db, "products"), {
        localId,
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        createdAt: serverTimestamp(),
      })
    } catch (e: any) {
      console.error("addProduct error:", e)
      alert(e?.code ?? e?.message ?? "Failed to add product")
      throw e
    }
  }

  const updateProduct = async (product: Product) => {
    const docId = idToDoc.current[product.id]
    let target = docId
    if (!target) {
      // fallback lookup
      const q = query(collection(db, "products"), where("localId", "==", product.id))
      const snap = await getDocs(q)
      target = snap.docs[0]?.id
    }
    if (!target) throw new Error("Product not found")
    await updateDoc(doc(db, "products", target), {
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
    })
  }

  const deleteProduct = async (id: number) => {
    let docId = idToDoc.current[id]
    if (!docId) {
      const q = query(collection(db, "products"), where("localId", "==", id))
      const snap = await getDocs(q)
      docId = snap.docs[0]?.id
    }
    if (!docId) return
    await deleteDoc(doc(db, "products", docId))
  }

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, setProducts }}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (!context) throw new Error("useProducts must be used inside ProductProvider")
  return context
}
