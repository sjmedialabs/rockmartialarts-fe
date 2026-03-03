"use client"

import { type DashboardRole } from "@/lib/dashboard-config"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar role={role} />
      <main className="w-full mt-20 p-4 sm:p-6 lg:px-8 flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
