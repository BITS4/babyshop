import { describe, expect, it } from "vitest"
import { extractDriveId, imageCandidates } from "./image-source"

const id = "1AbCdEfGhIjKlMnOp"

describe("catalog image sources", () => {
  it.each([
    `https://drive.google.com/file/d/${id}/view`,
    `https://drive.google.com/open?id=${id}`,
    `https://drive.google.com/uc?export=view&id=${id}`,
    `https://drive.googleusercontent.com/image?x=1&id=${id}`,
  ])("extracts Drive IDs from %s", (url) => {
    expect(extractDriveId(url)).toBe(id)
  })

  it("keeps ordinary and local URLs unchanged", () => {
    expect(imageCandidates("https://example.com/image.jpg")).toEqual([
      "https://example.com/image.jpg",
    ])
    expect(imageCandidates("/image.jpg")).toEqual(["/image.jpg"])
  })

  it("returns ordered Drive fallbacks", () => {
    const candidates = imageCandidates(`https://drive.google.com/file/d/${id}/view`)
    expect(candidates).toHaveLength(3)
    expect(candidates[0]).toContain(`id=${id}`)
  })

  it("handles blank and invalid values safely", () => {
    expect(extractDriveId("not a link")).toBeNull()
    expect(imageCandidates(" ")).toEqual([])
    expect(imageCandidates(null)).toEqual([])
  })
})
