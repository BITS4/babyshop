import { describe, expect, it } from "vitest"
import { validateImageUpload } from "./image-upload"

describe("image upload validation", () => {
  it.each(["image/jpeg", "image/png", "image/webp"])("accepts safe media type %s", (type) => {
    expect(validateImageUpload({ size: 1_000, type })).toEqual({ valid: true })
  })

  it.each(["image/svg+xml", "text/html", "application/javascript", ""])(
    "rejects unsafe media type %s",
    (type) => expect(validateImageUpload({ size: 1_000, type }).valid).toBe(false)
  )

  it.each([0, -1, 5 * 1024 * 1024 + 1, Number.NaN])("rejects invalid size %s", (size) => {
    expect(validateImageUpload({ size, type: "image/png" }).valid).toBe(false)
  })
})
