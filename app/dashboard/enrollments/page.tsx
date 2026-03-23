import { Suspense } from "react"
import ManageEnrollmentsPage from "@/components/dashboard/ManageEnrollmentsPage"

export default function DashboardEnrollmentsPage() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] flex items-center justify-center text-gray-600">Loading…</div>}>
      <ManageEnrollmentsPage />
    </Suspense>
  )
}
