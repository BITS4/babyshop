const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

export type UploadCandidate = { size: number; type: string }
export type UploadValidation = { valid: true } | { valid: false; message: string }

export function validateImageUpload(
  file: UploadCandidate,
  maxBytes = 5 * 1024 * 1024
): UploadValidation {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { valid: false, message: "Choose a JPEG, PNG, or WebP image." }
  }
  if (!Number.isSafeInteger(file.size) || file.size <= 0 || file.size > maxBytes) {
    return {
      valid: false,
      message: `Image must be smaller than ${Math.floor(maxBytes / 1_048_576)}MB.`,
    }
  }
  return { valid: true }
}
