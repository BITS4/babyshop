import { describe, expect, it } from "vitest"
import type { Product } from "./product"
import { sortProducts, type ProductSort } from "./sort-products"

const products: Product[] = [
  { id: 20, name: "Zebra", description: "Z", price: 5, image: "/z", category: "toys" },
  { id: 10, name: "Apple", description: "A", price: 15, image: "/a", category: "toys" },
]

describe("catalog sorting", () => {
  it.each<[ProductSort, number[]]>([
    ["relevance", [20, 10]],
    ["price_asc", [20, 10]],
    ["price_desc", [10, 20]],
    ["name_asc", [10, 20]],
    ["name_desc", [20, 10]],
    ["newest", [20, 10]],
    ["oldest", [10, 20]],
  ])("sorts by %s", (sort, expectedIds) => {
    expect(sortProducts(products, sort).map(({ id }) => id)).toEqual(expectedIds)
  })

  it("never mutates the Firestore ordering", () => {
    sortProducts(products, "oldest")
    expect(products.map(({ id }) => id)).toEqual([20, 10])
  })
})
