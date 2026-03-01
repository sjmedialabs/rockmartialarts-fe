import DashboardRoleResolver from "@/components/layout/DashboardRoleResolver"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardRoleResolver>{children}</DashboardRoleResolver>
}
