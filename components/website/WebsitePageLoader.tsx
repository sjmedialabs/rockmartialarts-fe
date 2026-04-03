"use client"

import { useCMS } from "@/contexts/CMSContext"
import { resolvePublicAssetUrl } from "@/lib/resolvePublicAssetUrl"
import { useEffect, useMemo, useState } from "react"

/** Built-in default when CMS has no loader — timer never waits on CMS/API */
const BUILTIN_LOADER = "/assets/img/site-loader.png"
const FADE_MS = 320

function buildLoaderSrcChain(cmsUrl: string): string[] {
  const resolved = cmsUrl.trim()
  return [resolved, BUILTIN_LOADER, "/assets/img/loader-rock.png", "/logo.png"].filter(
    (u, i, arr) => u.length > 0 && arr.indexOf(u) === i
  )
}

/**
 * Full-screen loader on every visit: visible from the first paint (~3–4s), independent of load/API.
 * Opacity starts at 1 so SSR/hydration still shows the overlay; then fade out.
 */
export function WebsitePageLoader() {
  const { cms } = useCMS()
  const cmsLoaderUrl = resolvePublicAssetUrl(cms?.branding?.site_loader_image)
  const srcChain = useMemo(() => buildLoaderSrcChain(cmsLoaderUrl || ""), [cmsLoaderUrl])

  const [done, setDone] = useState(false)
  const [opacity, setOpacity] = useState(1)
  const [srcIndex, setSrcIndex] = useState(0)

  const imgSrc = srcChain[Math.min(srcIndex, srcChain.length - 1)] || "/logo.png"

  useEffect(() => {
    setSrcIndex(0)
  }, [srcChain])

  useEffect(() => {
    const root = document.documentElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    root.classList.add("website-loader-active")

    const delayMs = 3000 + Math.floor(Math.random() * 1001)
    const hideTimer = window.setTimeout(() => setOpacity(0), delayMs)
    const finishTimer = window.setTimeout(() => {
      setDone(true)
      document.body.style.overflow = prevOverflow
      root.classList.remove("website-loader-active")
    }, delayMs + FADE_MS)

    return () => {
      window.clearTimeout(hideTimer)
      window.clearTimeout(finishTimer)
      document.body.style.overflow = prevOverflow
      root.classList.remove("website-loader-active")
    }
    // Only once per full page load — CMS updates must not reset the fixed delay / scroll lock
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (done) return null

  return (
    <div
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black motion-reduce:transition-none transition-opacity duration-300 ease-out"
      style={{ opacity }}
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading site"
    >
      <img
        src={imgSrc}
        alt=""
        width={140}
        height={140}
        className="w-[140px] max-w-[140px] h-auto max-h-[140px] object-contain select-none"
        decoding="async"
        fetchPriority="high"
        onError={() =>
          setSrcIndex((i) => {
            const max = Math.max(srcChain.length - 1, 0)
            return i < max ? i + 1 : i
          })
        }
      />
      <span className="sr-only">Loading…</span>
    </div>
  )
}
