"use client"

import { type DashboardRole } from "@/lib/dashboard-config"
import Navbar from "@/components/layout/Navbar"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: DashboardRole
}

/**
 * Shared layout for all dashboards (Super Admin, Branch Admin, Student).
 * Same UI: light gray background, fixed navbar, main content area.
 */
export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar role={role} />
      <main className="w-full mt-5 p-4 sm:p-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
