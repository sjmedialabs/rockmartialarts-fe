import DashboardLayoutClient from "@/components/layout/DashboardLayoutClient"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutClient role="branch_admin">{children}</DashboardLayoutClient>
}
