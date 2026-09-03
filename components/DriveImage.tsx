"use client"
/* eslint-disable @next/next/no-img-element -- Google Drive fallbacks require native error handling */

import { useMemo, useState } from "react"
import { imageCandidates } from "@/lib/catalog/image-source"

export function DriveImage({
  url,
  alt,
  className = "",
}: {
  url: string
  alt: string
  className?: string
}) {
  const candidates = useMemo(() => imageCandidates(url), [url])
  const [index, setIndex] = useState(0)
  const source = candidates[index] ?? url

  return (
    <img
      src={source}
      alt={alt}
      className={className}
      onError={() => setIndex((current) => Math.min(current + 1, candidates.length - 1))}
    />
  )
}
