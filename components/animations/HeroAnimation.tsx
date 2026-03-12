"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ReactNode } from "react"

interface HeroAnimationProps {
  /** Hero title (main heading) */
  title: ReactNode
  /** Optional subtitle */
  subtitle?: ReactNode
  /** Optional description line */
  description?: ReactNode
  /** Optional CTA buttons or links (scale on hover when wrapped in motion) */
  actions?: ReactNode
  /** Optional hero media (video or image) - slide-in + subtle scale on load */
  media?: ReactNode
  className?: string
}

// Cult.fit-style: stagger 0.12s, duration 0.4–0.8s, easeOut
const stagger = 0.12
const duration = 0.6
const ease = [0.25, 0.46, 0.45, 0.94] as const

/**
 * Hero section: title fades in from bottom, staggered text, animated CTA buttons, hero image/video slides in.
 * Uses transform + opacity only; respects prefers-reduced-motion.
 */
export function HeroAnimation({
  title,
  subtitle,
  description,
  actions,
  media,
  className = "",
}: HeroAnimationProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return (
      <div className={className}>
        {media}
        <div className="container relative z-10 mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold uppercase tracking-wide mb-4">
            {title}
          </h1>
          {subtitle && <h2 className="text-2xl md:text-3xl font-semibold mb-3">{subtitle}</h2>}
          {description && <h6 className="text-lg md:text-xl max-w-2xl mx-auto">{description}</h6>}
          {actions}
        </div>
      </div>
    )
  }

  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}>
      {/* Hero image/video: slide in from right + subtle scale (Cult.fit-style media motion) */}
      {media && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0.85, x: 24, scale: 1.03 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {media}
        </motion.div>
      )}
      <div className="absolute inset-0 bg-black/50" />
      <div className="container relative z-10 mx-auto px-4 text-center text-white">
        {/* Title: fade-in + upward motion from bottom */}
        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold uppercase tracking-wide mb-4"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration, ease, delay: 0.2 }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.h2
            className="text-2xl md:text-3xl font-semibold mb-3"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, ease, delay: 0.2 + stagger }}
          >
            {subtitle}
          </motion.h2>
        )}
        {description && (
          <motion.h6
            className="text-lg md:text-xl max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, ease, delay: 0.2 + stagger * 2 }}
          >
            {description}
          </motion.h6>
        )}
        {actions && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, ease, delay: 0.2 + stagger * 3 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-4"
          >
            {actions}
          </motion.div>
        )}
      </div>
    </section>
  )
}
