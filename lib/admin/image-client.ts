import { validateImageUpload } from "@/lib/security/image-upload"

export async function imageFileToDataUrl(
  file: File,
  maxDimension = 1024,
  quality = 0.85
): Promise<string> {
  const validation = validateImageUpload(file, 8 * 1024 * 1024)
  if (!validation.valid) throw new Error(validation.message)

  return new Promise((resolve, reject) => {
    const image = document.createElement("img")
    const objectUrl = URL.createObjectURL(file)
    image.onload = () => {
      const sourceWidth = image.naturalWidth || image.width
      const sourceHeight = image.naturalHeight || image.height
      if (!sourceWidth || !sourceHeight) {
        URL.revokeObjectURL(objectUrl)
        reject(new Error("Could not read image dimensions."))
        return
      }
      const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight))
      const canvas = document.createElement("canvas")
      canvas.width = Math.max(1, Math.round(sourceWidth * scale))
      canvas.height = Math.max(1, Math.round(sourceHeight * scale))
      const context = canvas.getContext("2d")
      if (!context) {
        URL.revokeObjectURL(objectUrl)
        reject(new Error("Image processing is unavailable in this browser."))
        return
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      const mime = file.type === "image/png" ? "image/png" : "image/jpeg"
      const dataUrl = canvas.toDataURL(mime, mime === "image/png" ? undefined : quality)
      URL.revokeObjectURL(objectUrl)
      resolve(dataUrl)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("The selected image could not be decoded."))
    }
    image.src = objectUrl
  })
}
