import { parseProductDocument } from "../catalog/product"
import { adminDatabase } from "./firebase-admin"

export async function loadCatalogProducts(productIds: number[]) {
  if (productIds.length === 0 || productIds.length > 25) return []
  const snapshot = await adminDatabase()
    .collection("products")
    .where("localId", "in", productIds)
    .get()

  return snapshot.docs
    .map((document) => parseProductDocument(document.data()))
    .filter((product) => product !== null)
}
