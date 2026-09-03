import { z } from "zod"

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Enter your full name.").max(80),
  address: z.string().trim().min(5, "Enter a complete shipping address.").max(500),
  phone: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .pipe(z.string().regex(/^\d{8,15}$/, "Phone must contain 8 to 15 digits.")),
  photoURL: z.string().max(50_000).default(""),
})

export type Profile = z.infer<typeof profileSchema>

const storedProfileSchema = profileSchema.partial().catch({})

export function normalizeStoredProfile(value: unknown, fallbackPhotoURL = ""): Profile {
  const parsed = storedProfileSchema.parse(value)
  const hasStoredPhoto = typeof value === "object" && value !== null && "photoURL" in value
  return {
    name: parsed.name ?? "",
    address: parsed.address ?? "",
    phone: parsed.phone?.replace(/\D/g, "") ?? "",
    photoURL: hasStoredPhoto ? (parsed.photoURL ?? "") : fallbackPhotoURL,
  }
}

export function validateProfile(value: unknown) {
  return profileSchema.safeParse(value)
}
