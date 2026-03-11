"use client"

import { motion, useReducedMotion } from "framer-motion"

interface FloatingShapesProps {
  /** Optional class for the container (e.g. for positioning) */
  className?: string
}

/**
 * Floating background shapes (blobs, gradient circles) — slow floating motion, infinite loop.
 * Uses transform + opacity; disabled when prefers-reduced-motion. No scroll/parallax to keep lightweight.
 */
export function FloatingShapes({ className = "" }: FloatingShapesProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) return null

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* Blob 1 - top right */}
      <motion.div
        className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#FFB70F]/10 blur-3xl"
        animate={{
          x: [0, 15, 0],
          y: [0, -10, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Blob 2 - bottom left */}
      <motion.div
        className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[#F73322]/10 blur-3xl"
        animate={{
          x: [0, -12, 0],
          y: [0, 12, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Center subtle gradient circle */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFB70F]/5 blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}
