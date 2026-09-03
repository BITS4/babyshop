import { describe, expect, it } from "vitest"
import { validateCheckoutCustomer } from "./customer"

const valid = {
  name: "Ava Parent",
  address: "21 Main Street",
  phone: "+1 (555) 123-4567",
  paymentMethod: "card",
}

describe("checkout customer validation", () => {
  it("trims text and normalizes telephone digits", () => {
    const result = validateCheckoutCustomer({ ...valid, name: "  Ava Parent " })
    expect(result.success && result.data).toEqual({
      ...valid,
      name: "Ava Parent",
      phone: "15551234567",
    })
  })

  it.each([
    ["name", ""],
    ["address", "short"],
    ["phone", "123"],
    ["paymentMethod", "bank"],
  ])("rejects an invalid %s", (field, value) => {
    expect(validateCheckoutCustomer({ ...valid, [field]: value }).success).toBe(false)
  })

  it("rejects unexpected fields", () => {
    expect(validateCheckoutCustomer({ ...valid, role: "admin" }).success).toBe(false)
  })
})
