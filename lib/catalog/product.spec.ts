import { describe, expect, it } from "vitest"
import { normalizeProductInput, parseProductDocument, productSchema } from "./product"

const valid = {
  name: "Cotton onesie",
  description: "Soft organic cotton",
  price: 19.95,
  image: "/images/onesie.jpeg",
  category: "onesie",
}

describe("product schemas", () => {
  it("normalizes safe product input", () => {
    expect(normalizeProductInput({ ...valid, name: "  Cotton onesie  ", price: "19.95" })).toEqual(
      valid
    )
  })

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY, 100_001])(
    "rejects unsafe prices: %s",
    (price) => {
      expect(() => normalizeProductInput({ ...valid, price })).toThrow()
    }
  )

  it.each(["javascript:alert(1)", "", "ftp://example.com/a.png"])(
    'rejects image source "%s"',
    (image) => {
      expect(() => normalizeProductInput({ ...valid, image })).toThrow()
    }
  )

  it("maps a Firestore document into the domain model", () => {
    expect(parseProductDocument({ ...valid, localId: "123" })).toEqual({ ...valid, id: 123 })
  })

  it("uses a stable fallback category for old documents", () => {
    const { category: _category, ...legacy } = valid
    expect(parseProductDocument({ ...legacy, localId: 123 })?.category).toBe("uncategorized")
  })

  it("returns null for malformed database records", () => {
    expect(parseProductDocument({ localId: 1, name: "broken" })).toBeNull()
    expect(productSchema.safeParse({ ...valid, id: 0 }).success).toBe(false)
  })
})
