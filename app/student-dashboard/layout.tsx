import StudentRouteGuard from "@/components/student-route-guard"

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StudentRouteGuard>
      {children}
    </StudentRouteGuard>
  )
}
