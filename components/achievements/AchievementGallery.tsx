"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface AchievementGalleryProps {
  images: string[]
}

export function AchievementGallery({ images }: AchievementGalleryProps) {
  const [index, setIndex] = useState(0)
  if (!images.length) return null

  const src = images[index]
  const isAbsolute = src.startsWith("http") || src.startsWith("/")

  return (
    <div className="relative rounded-lg overflow-hidden bg-gray-800 aspect-video">
      {isAbsolute ? (
        <img
          src={src}
          alt="Achievement"
          className="w-full h-full object-cover"
        />
      ) : (
        <Image
          src={src}
          alt="Achievement"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      )}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === index ? "bg-[#FFB70F]" : "bg-white/50"
                }`}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
