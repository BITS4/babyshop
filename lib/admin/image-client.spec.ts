import { afterEach, describe, expect, it, vi } from "vitest"
import { imageFileToDataUrl } from "./image-client"

describe("imageFileToDataUrl", () => {
  const originalCreateElement = document.createElement.bind(document)

  afterEach(() => vi.unstubAllGlobals())

  function mockBrowserImage(
    options: {
      width?: number
      height?: number
      context?: boolean
      fail?: boolean
      dataUrl?: string
    } = {}
  ) {
    const drawImage = vi.fn()
    const revokeObjectURL = vi.fn()
    const fakeImage: Record<string, unknown> = {
      naturalWidth: options.width ?? 800,
      naturalHeight: options.height ?? 400,
      width: options.width ?? 800,
      height: options.height ?? 400,
      onload: null,
      onerror: null,
    }
    Object.defineProperty(fakeImage, "src", {
      set: () =>
        queueMicrotask(() => {
          const callback = fakeImage[options.fail ? "onerror" : "onload"] as (() => void) | null
          callback?.()
        }),
    })
    const fakeCanvas = {
      width: 0,
      height: 0,
      getContext: () => (options.context === false ? null : { drawImage }),
      toDataURL: () => options.dataUrl ?? "data:image/jpeg;base64,result",
    }
    vi.spyOn(document, "createElement").mockImplementation(((tag: string) => {
      if (tag === "img") return fakeImage
      if (tag === "canvas") return fakeCanvas
      return originalCreateElement(tag)
    }) as typeof document.createElement)
    vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:image"), revokeObjectURL })
    return { drawImage, fakeCanvas, revokeObjectURL }
  }

  it("rejects non-image content before using browser image APIs", async () => {
    const file = new File(["plain text"], "notes.txt", { type: "text/plain" })
    await expect(imageFileToDataUrl(file)).rejects.toThrow(/JPEG, PNG, or WebP/)
  })

  it("rejects oversized files before decoding", async () => {
    const file = new File([new Uint8Array(9 * 1024 * 1024)], "large.png", { type: "image/png" })
    await expect(imageFileToDataUrl(file)).rejects.toThrow(/smaller/)
  })

  it("resizes and encodes a valid image", async () => {
    const browser = mockBrowserImage({ width: 2048, height: 1024 })
    const result = await imageFileToDataUrl(
      new File(["image"], "photo.jpg", { type: "image/jpeg" })
    )
    expect(result).toBe("data:image/jpeg;base64,result")
    expect(browser.fakeCanvas.width).toBe(1024)
    expect(browser.fakeCanvas.height).toBe(512)
    expect(browser.drawImage).toHaveBeenCalledOnce()
    expect(browser.revokeObjectURL).toHaveBeenCalledWith("blob:image")
  })

  it("rejects images without readable dimensions", async () => {
    mockBrowserImage({ width: 0, height: 0 })
    await expect(
      imageFileToDataUrl(new File(["image"], "photo.png", { type: "image/png" }))
    ).rejects.toThrow("dimensions")
  })

  it("rejects when the canvas API is unavailable", async () => {
    mockBrowserImage({ context: false })
    await expect(
      imageFileToDataUrl(new File(["image"], "photo.webp", { type: "image/webp" }))
    ).rejects.toThrow("unavailable")
  })

  it("rejects corrupt images", async () => {
    mockBrowserImage({ fail: true })
    await expect(
      imageFileToDataUrl(new File(["image"], "photo.png", { type: "image/png" }))
    ).rejects.toThrow("decoded")
  })
})
