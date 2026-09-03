import { z } from "zod"

const imageSourceSchema = z
  .string()
  .trim()
  .min(1, "An image is required")
  .max(1_500_000, "The image is too large")
  .refine((value) => {
    if (value.startsWith("/") || value.startsWith("data:image/")) return true
    try {
      return new URL(value).protocol === "https:"
    } catch {
      return false
    }
  }, "Use an HTTPS URL, local path, or image data URL")

export const productInputSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    description: z.string().trim().min(2).max(1_000),
    price: z.coerce.number().finite().nonnegative().max(100_000),
    image: imageSourceSchema,
    category: z.string().trim().min(1).max(60).default("uncategorized"),
  })
  .strict()

export const productSchema = productInputSchema.extend({
  id: z.coerce.number().int().positive(),
})

const productDocumentSchema = productInputSchema
  .omit({ category: true })
  .extend({
    localId: z.coerce.number().int().positive(),
    category: z.string().trim().min(1).max(60).optional(),
  })
  .passthrough()

export type Product = z.infer<typeof productSchema>
export type ProductInput = z.input<typeof productInputSchema>

export function parseProductDocument(value: unknown): Product | null {
  const result = productDocumentSchema.safeParse(value)
  if (!result.success) return null

  return {
    id: result.data.localId,
    name: result.data.name,
    description: result.data.description,
    price: result.data.price,
    image: result.data.image,
    category: result.data.category ?? "uncategorized",
  }
}

export function normalizeProductInput(value: unknown): Omit<Product, "id"> {
  return productInputSchema.parse(value)
}
