import type { Product } from "./product"

export type ProductSort =
  "relevance" | "price_asc" | "price_desc" | "name_asc" | "name_desc" | "newest" | "oldest"

export function sortProducts(products: readonly Product[], sort: ProductSort): Product[] {
  const sorted = [...products]

  switch (sort) {
    case "price_asc":
      return sorted.sort((a, b) => a.price - b.price)
    case "price_desc":
      return sorted.sort((a, b) => b.price - a.price)
    case "name_asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case "name_desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name))
    case "newest":
      return sorted.sort((a, b) => b.id - a.id)
    case "oldest":
      return sorted.sort((a, b) => a.id - b.id)
    case "relevance":
      return sorted
  }
}
