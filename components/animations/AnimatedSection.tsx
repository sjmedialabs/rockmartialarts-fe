"use client"

import { useInView } from "framer-motion"
import { motion, useReducedMotion } from "framer-motion"
import { useRef, ReactNode } from "react"

interface AnimatedSectionProps {
  children: ReactNode
  /** Delay before animation starts (seconds) */
  delay?: number
  /** Stagger delay for children when staggerChildren is set (seconds) */
  staggerDelay?: number
  /** Whether to stagger child animations */
  staggerChildren?: boolean
  /** Animation variant: fade-in, slide-up, or both */
  variant?: "fade" | "slideUp" | "fadeSlideUp"
  className?: string
}

// Duration 0.4–0.8s, easeOut — performant (transform + opacity only)
const defaultTransition = {
  duration: 0.6,
  ease: [0.25, 0.46, 0.45, 0.94] as const,
}

/**
 * Scroll-reveal section: fade-in + slide-up when section enters viewport (intersection observer).
 * Stagger children optional; respects prefers-reduced-motion.
 */
export function AnimatedSection({
  children,
  delay = 0,
  staggerDelay = 0.1,
  staggerChildren = false,
  variant = "fadeSlideUp",
  className = "",
}: AnimatedSectionProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "0px 0px -40% 0px", amount: 0.2 })
  const shouldReduceMotion = useReducedMotion()

  const hidden = {
    opacity: variant === "slideUp" ? 1 : 0,
    y: variant === "fade" ? 0 : 24,
  }
  const visible = {
    opacity: 1,
    y: 0,
    transition: {
      ...defaultTransition,
      delay: shouldReduceMotion ? 0 : delay,
      staggerChildren: staggerChildren && !shouldReduceMotion ? staggerDelay : 0,
      delayChildren: shouldReduceMotion ? 0 : delay,
    },
  }

  if (shouldReduceMotion) {
    return (
      <section ref={ref} className={className}>
        {children}
      </section>
    )
  }

  return (
    <motion.section
      ref={ref}
      initial={hidden}
      animate={inView ? visible : hidden}
      className={className}
    >
      {children}
    </motion.section>
  )
}
