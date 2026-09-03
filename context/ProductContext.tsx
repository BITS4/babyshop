"use client"

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore"
import { db } from "@/app/firebase"
import { normalizeProductInput, parseProductDocument, type Product } from "@/lib/catalog/product"
import { reportClientError } from "@/lib/observability/client"
import { errorMessage } from "@/lib/security/errors"

type ProductContextType = {
  products: Product[]
  addProduct: (product: Omit<Product, "id">) => Promise<void>
  updateProduct: (product: Product) => Promise<void>
  deleteProduct: (id: number) => Promise<void>
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const idToDocument = useRef<Record<number, string>>({})

  useEffect(() => {
    const productQuery = query(collection(db, "products"), orderBy("createdAt", "desc"))
    return onSnapshot(
      productQuery,
      (snapshot) => {
        const list: Product[] = []
        const documentMap: Record<number, string> = {}
        snapshot.forEach((document) => {
          const product = parseProductDocument(document.data())
          if (!product) return
          list.push(product)
          documentMap[product.id] = document.id
        })
        idToDocument.current = documentMap
        setProducts(list)
      },
      (error) => {
        reportClientError(error, { operation: "products_snapshot" })
        setProducts([])
      }
    )
  }, [])

  const addProduct = async (product: Omit<Product, "id">) => {
    try {
      await addDoc(collection(db, "products"), {
        localId: Date.now(),
        ...normalizeProductInput(product),
        createdAt: serverTimestamp(),
      })
    } catch (error: unknown) {
      reportClientError(error, { operation: "add_product" })
      alert(errorMessage(error, "Failed to add product"))
      throw error
    }
  }

  const findDocumentId = async (id: number) => {
    const cached = idToDocument.current[id]
    if (cached) return cached
    const snapshot = await getDocs(query(collection(db, "products"), where("localId", "==", id)))
    return snapshot.docs[0]?.id
  }

  const updateProduct = async (product: Product) => {
    const documentId = await findDocumentId(product.id)
    if (!documentId) throw new Error("Product not found")
    await updateDoc(doc(db, "products", documentId), normalizeProductInput(product))
  }

  const deleteProduct = async (id: number) => {
    const documentId = await findDocumentId(id)
    if (documentId) await deleteDoc(doc(db, "products", documentId))
  }

  return (
    <ProductContext.Provider
      value={{ products, addProduct, updateProduct, deleteProduct, setProducts }}
    >
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (!context) throw new Error("useProducts must be used inside ProductProvider")
  return context
}
