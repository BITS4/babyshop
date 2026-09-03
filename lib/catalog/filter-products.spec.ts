import { describe, expect, it } from "vitest"
import type { Product } from "./product"
import { filterProducts, listCategories } from "./filter-products"

const products: Product[] = [
  {
    id: 1,
    name: "Blue Socks",
    description: "Warm feet",
    price: 5,
    image: "/socks.jpg",
    category: "Socks",
  },
  {
    id: 2,
    name: "Pink Hat",
    description: "Sunny days",
    price: 8,
    image: "/hat.jpg",
    category: "Hats",
  },
  {
    id: 3,
    name: "Sleep Suit",
    description: "Warm nights",
    price: 15,
    image: "/suit.jpg",
    category: "Socks",
  },
]

describe("catalog filters", () => {
  it("returns sorted unique categories", () => {
    expect(listCategories(products)).toEqual(["all", "Hats", "Socks"])
  })

  it("searches names and descriptions without case sensitivity", () => {
    expect(filterProducts(products, "WARM", "all").map(({ id }) => id)).toEqual([1, 3])
  })

  it("combines search and category filters", () => {
    expect(filterProducts(products, "pink", "hats").map(({ id }) => id)).toEqual([2])
    expect(filterProducts(products, "pink", "socks")).toEqual([])
  })

  it("does not mutate the input", () => {
    const snapshot = [...products]
    filterProducts(products, "", "all")
    expect(products).toEqual(snapshot)
  })
})
