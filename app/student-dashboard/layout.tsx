import StudentRouteGuard from "@/components/student-route-guard"
import { StudentDashboardSonner } from "@/components/student-dashboard-sonner"

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StudentRouteGuard>
      <StudentDashboardSonner />
      {children}
    </StudentRouteGuard>
  )
}
