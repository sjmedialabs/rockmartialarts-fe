"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ReactNode } from "react"

interface AnimatedCardProps {
  children: ReactNode
  /** Optional delay for scroll-in (when used alone, not inside stagger grid) */
  delay?: number
  /** When false, only hover animation; use inside AnimatedStaggerGrid to avoid double animation */
  scrollReveal?: boolean
  className?: string
}

// Cult.fit-style: hover scale 1.05, shadow increase, 0.3s easeOut (performant: transform + opacity only for reveal)
const defaultShadow = "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
const hoverShadow =
  "0 20px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.1)"

/**
 * Card with hover scale + shadow transition (Cult.fit-style).
 * Uses transform and opacity for performance; no layout shift.
 */
export function AnimatedCard({
  children,
  delay = 0,
  scrollReveal = true,
  className = "",
}: AnimatedCardProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={scrollReveal ? { opacity: 0, y: 16 } : false}
      whileInView={scrollReveal ? { opacity: 1, y: 0 } : false}
      viewport={scrollReveal ? { once: true, margin: "0px 0px -40% 0px" } : undefined}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay,
      }}
      whileHover={{
        scale: 1.05,
        boxShadow: hoverShadow,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      className={className}
      style={{ boxShadow: defaultShadow }}
    >
      {children}
    </motion.div>
  )
}
