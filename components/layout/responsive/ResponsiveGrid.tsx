"use client"

import { cn } from "@/lib/utils"

/**
 * Mobile-first responsive grid.
 * Single column on mobile, scales up at breakpoints.
 */
interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  /** Columns at sm (default 1), md, lg, xl */
  cols?: 1 | 2 | 3 | 4
  /** Gap: default gap-4 md:gap-6 */
  gap?: "sm" | "md" | "lg"
}

const gapClass = {
  sm: "gap-3 sm:gap-4",
  md: "gap-4 md:gap-6",
  lg: "gap-4 md:gap-6 lg:gap-8",
}

export function ResponsiveGrid({
  children,
  className,
  cols = 1,
  gap = "md",
}: ResponsiveGridProps) {
  const gridCols =
    cols === 1
      ? "grid-cols-1"
      : cols === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : cols === 3
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"

  return (
    <div className={cn("grid", gridCols, gapClass[gap], className)}>
      {children}
    </div>
  )
}
