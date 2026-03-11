"use client"

import { ReactNode, useRef } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"

interface ScrollZoomContinuousProps {
  children: ReactNode
  className?: string
}

/**
 * Scroll-linked zoom wrapper. While the element is in the visible area, scale stays 1.
 * As you scroll down and the next section comes into view, this element zooms out to scale 0.
 * Scroll back up and it zooms back in. Use per section, per card, or per column.
 */
export function ScrollZoomContinuous({ children, className = "" }: ScrollZoomContinuousProps) {
  const shouldReduceMotion = useReducedMotion()
  const ref = useRef<HTMLDivElement | null>(null)

  if (shouldReduceMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    )
  }

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  // In visible area = scale 1; by the time next section enters (element leaves viewport top) = scale 0
  // progress 0 = element entering from bottom, 0.5–0.6 = in view, 1 = element left from top
  const scale = useTransform(scrollYProgress, [0, 0.55, 1], [1, 1, 0])
  const opacity = useTransform(scrollYProgress, [0, 0.55, 1], [1, 1, 0])

  return (
    <motion.div ref={ref} style={{ scale, opacity }} className={className}>
      {children}
    </motion.div>
  )
}

