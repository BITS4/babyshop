import type { Product } from "./product"

export function listCategories(products: readonly Product[]): string[] {
  const categories = new Set(
    products.map((product) => product.category.trim()).filter((category) => category.length > 0)
  )

  return ["all", ...Array.from(categories).sort((a, b) => a.localeCompare(b))]
}

export function filterProducts(
  products: readonly Product[],
  searchTerm: string,
  category = "all"
): Product[] {
  const query = searchTerm.trim().toLocaleLowerCase()
  const normalizedCategory = category.trim().toLocaleLowerCase()

  return products.filter((product) => {
    const matchesText =
      query.length === 0 ||
      product.name.toLocaleLowerCase().includes(query) ||
      product.description.toLocaleLowerCase().includes(query)
    const matchesCategory =
      normalizedCategory === "all" || product.category.toLocaleLowerCase() === normalizedCategory

    return matchesText && matchesCategory
  })
}
