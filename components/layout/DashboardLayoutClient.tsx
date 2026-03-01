"use client"

import { type DashboardRole } from "@/lib/dashboard-config"
import DashboardLayout from "./DashboardLayout"

interface Props {
  role: DashboardRole
  children: React.ReactNode
}

export default function DashboardLayoutClient({ role, children }: Props) {
  return <DashboardLayout role={role}>{children}</DashboardLayout>
}
