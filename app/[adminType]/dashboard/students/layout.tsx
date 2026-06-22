/**
 * Avoid serving a stale static shell for the student list (must pick up UI/API changes after deploy).
 */
export const dynamic = "force-dynamic"

import { Suspense } from "react"

export default function StudentsSectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Suspense fallback={<div className="p-6 text-gray-500">Loading students…</div>}>{children}</Suspense>
}
