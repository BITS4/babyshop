import { z } from "zod"
import { PayloadTooLargeError } from "./errors"

const tokenSchema = z
  .string()
  .min(20)
  .max(8_192)
  .regex(/^[A-Za-z0-9._~+\/-]+={0,2}$/)

export function getBearerToken(authorization: string | null): string | null {
  if (!authorization) return null
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  if (!match?.[1]) return null
  const result = tokenSchema.safeParse(match[1].trim())
  return result.success ? result.data : null
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown"
}

export async function readJsonBody(request: Request, maxBytes = 65_536): Promise<unknown> {
  const declaredLength = Number(request.headers.get("content-length") ?? "0")
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new PayloadTooLargeError()
  }

  const body = await request.text()
  if (new TextEncoder().encode(body).byteLength > maxBytes) {
    throw new PayloadTooLargeError()
  }
  return JSON.parse(body) as unknown
}
