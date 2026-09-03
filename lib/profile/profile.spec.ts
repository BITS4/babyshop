import { describe, expect, it } from "vitest"
import { normalizeStoredProfile, validateProfile } from "./profile"

describe("profile validation", () => {
  it("normalizes optional persisted values and strips phone formatting", () => {
    expect(normalizeStoredProfile({ name: "Ada", phone: "+1 (555) 123-4567" }, "fallback")).toEqual(
      {
        name: "Ada",
        address: "",
        phone: "15551234567",
        photoURL: "fallback",
      }
    )
  })

  it("accepts a complete profile and trims user-entered text", () => {
    const result = validateProfile({
      name: "  Ada Lovelace ",
      address: "  12 Computing Lane  ",
      phone: "+1 (555) 123-4567",
      photoURL: "",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe("Ada Lovelace")
      expect(result.data.phone).toBe("15551234567")
    }
  })

  it.each(["", "1234567", "1234567890123456"])("rejects invalid phone %j", (phone) => {
    expect(
      validateProfile({ name: "Ada", address: "12 Computing Lane", phone, photoURL: "" }).success
    ).toBe(false)
  })

  it("rejects an incomplete shipping address", () => {
    expect(
      validateProfile({ name: "Ada", address: "x", phone: "12345678", photoURL: "" }).success
    ).toBe(false)
  })
})
