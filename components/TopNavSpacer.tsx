"use client"

import { usePathname } from "next/navigation"

const DASHBOARD_PREFIXES = [
  "/student-dashboard",
  "/coach-dashboard",
  "/branch-manager-dashboard",
  "/super-admin",
  "/branch-admin",
]

export function TopNavSpacer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = pathname != null && DASHBOARD_PREFIXES.some((p) => pathname.startsWith(p))
  const spacerClass = isDashboard ? "pt-20 lg:pt-24" : undefined
  return <div className={spacerClass}>{children}</div>
}
