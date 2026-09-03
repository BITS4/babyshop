const DRIVE_PATTERNS = [
  /https?:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{10,})/i,
  /https?:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]{10,})/i,
  /https?:\/\/drive\.google\.com\/uc\?(?:export=[^&]+&)?id=([a-zA-Z0-9_-]{10,})/i,
  /https?:\/\/drive\.googleusercontent\.com\/.*?[?&]id=([a-zA-Z0-9_-]{10,})/i,
]

export function extractDriveId(value: string): string | null {
  const url = value.trim()
  for (const pattern of DRIVE_PATTERNS) {
    const match = url.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}

export function imageCandidates(value?: string | null): string[] {
  const url = value?.trim() ?? ""
  if (!url) return []
  if (url.startsWith("data:image/") || url.startsWith("/")) return [url]

  const id = extractDriveId(url)
  if (!id) return [url]

  return [
    `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
    `https://drive.google.com/uc?export=view&id=${id}`,
    `https://drive.google.com/uc?export=download&id=${id}`,
  ]
}
