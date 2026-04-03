"use client"

import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useCallback } from "react"

type CarouselProps = {
  children: React.ReactNode[]
  className?: string
  /** Extra vertical padding for shadow / scale */
  slideClassName?: string
}

/**
 * Simple responsive slider (Embla). Use for testimonial strips on home.
 */
export function Carousel({ children, className = "", slideClassName = "" }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: children.length > 1,
    skipSnaps: false,
    dragFree: false,
  })

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  if (children.length === 0) return null

  return (
    <div className={`relative ${className}`}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {children.map((child, i) => (
            <div
              key={i}
              className={`min-w-0 shrink-0 grow-0 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] pr-4 box-border ${slideClassName}`}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
      {children.length > 1 ? (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 border border-gray-700 flex items-center justify-center text-white hover:border-[#FFB70F] hover:text-[#FFB70F] -ml-2 md:ml-0"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/60 border border-gray-700 flex items-center justify-center text-white hover:border-[#FFB70F] hover:text-[#FFB70F] -mr-2 md:mr-0"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      ) : null}
    </div>
  )
}
