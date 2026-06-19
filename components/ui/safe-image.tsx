"use client"

import { useEffect, useState } from "react"
import { resolvePublicAssetUrl } from "@/lib/resolvePublicAssetUrl"
import { cn } from "@/lib/utils"

export const DEFAULT_IMAGE_PLACEHOLDER = "/assets/img/courses/kung-fu-trainer.png"

export type SafeImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  /** Shown when src is missing or fails to load */
  fallbackSrc?: string
  /** Run stored upload paths through resolvePublicAssetUrl (default true) */
  resolveUrl?: boolean
}

/**
 * Image that falls back to a placeholder instead of showing a broken icon.
 */
export function SafeImage({
  src,
  fallbackSrc = DEFAULT_IMAGE_PLACEHOLDER,
  resolveUrl = true,
  onError,
  className,
  alt = "",
  ...props
}: SafeImageProps) {
  const raw = src == null || src === "" ? "" : String(src).trim()
  const resolved = raw ? (resolveUrl ? resolvePublicAssetUrl(raw) : raw) : ""
  const initial = resolved || fallbackSrc

  const [displaySrc, setDisplaySrc] = useState(initial)
  const [useFallback, setUseFallback] = useState(!resolved)

  useEffect(() => {
    const next = resolved || fallbackSrc
    setDisplaySrc(next)
    setUseFallback(!resolved)
  }, [resolved, fallbackSrc, raw])

  return (
    <img
      {...props}
      src={displaySrc}
      alt={alt}
      className={cn(className, useFallback && "object-contain bg-gray-100")}
      onError={(e) => {
        if (!useFallback && fallbackSrc) {
          setUseFallback(true)
          setDisplaySrc(fallbackSrc)
        }
        onError?.(e)
      }}
    />
  )
}
