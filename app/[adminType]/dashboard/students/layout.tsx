/**
 * Avoid serving a stale static shell for the student list (must pick up UI/API changes after deploy).
 */
export const dynamic = "force-dynamic"

export default function StudentsSectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
