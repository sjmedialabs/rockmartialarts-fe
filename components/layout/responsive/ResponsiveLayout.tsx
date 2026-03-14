"use client"

import { cn } from "@/lib/utils"
import { ResponsiveContainer } from "./ResponsiveContainer"

/**
 * Shared responsive layout for dashboard pages.
 * Mobile-first: reduced padding on small screens, comfortable on desktop.
 * Use as the outer wrapper for page content (inside the dashboard's main area).
 */
interface ResponsiveLayoutProps {
  children: React.ReactNode
  className?: string
  /** Extra padding: default py-4 sm:py-6 */
  noPadding?: boolean
  /** Max width of content */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full"
}

export function ResponsiveLayout({
  children,
  className,
  noPadding = false,
  maxWidth = "7xl",
}: ResponsiveLayoutProps) {
  return (
    <ResponsiveContainer
      maxWidth={maxWidth}
      noPadding={noPadding}
      className={cn(
        !noPadding && "py-4 sm:py-5 md:py-6",
        "min-h-0 min-w-0",
        className
      )}
    >
      {children}
    </ResponsiveContainer>
  )
}
