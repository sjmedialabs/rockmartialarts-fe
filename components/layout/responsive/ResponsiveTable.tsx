"use client"

import { cn } from "@/lib/utils"

/**
 * Wraps a table in a horizontal scroll container to prevent layout break on small screens.
 * Optionally on very small screens you can show a "scroll to see more" hint.
 */
interface ResponsiveTableProps {
  children: React.ReactNode
  className?: string
  /** Optional wrapper class (e.g. for rounded-lg shadow) */
  wrapperClassName?: string
}

export function ResponsiveTable({
  children,
  className,
  wrapperClassName,
}: ResponsiveTableProps) {
  return (
    <div
      className={cn(
        "overflow-x-auto -mx-4 sm:mx-0 sm:rounded-lg",
        "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100",
        "min-w-0",
        wrapperClassName
      )}
      style={{ overflowX: "auto" }}
    >
      <table className={cn("w-full min-w-[640px] border-collapse", className)}>
        {children}
      </table>
    </div>
  )
}

/**
 * Card-style row for use in stacked layout on mobile (optional pattern).
 * Use when you want table data to become cards below a breakpoint.
 */
export function ResponsiveTableCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-lg p-4 shadow-sm",
        "flex flex-col gap-2",
        className
      )}
    >
      {children}
    </div>
  )
}
