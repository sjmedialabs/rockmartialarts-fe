"use client"

import { type DashboardRole } from "@/lib/dashboard-config"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { ResponsiveContainer } from "@/components/layout/responsive"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: DashboardRole
}

/**
 * Shared layout for all dashboards (Super Admin, Branch Admin, Student).
 * Mobile-first: responsive padding, no horizontal scroll, touch-friendly.
 */
export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col min-w-0">
      <Navbar role={role} />
      <main className="w-full flex-1 mt-16 sm:mt-20 min-w-0">
        <ResponsiveContainer className="py-4 sm:py-5 md:py-6">
          {children}
        </ResponsiveContainer>
      </main>
      <Footer />
    </div>
  )
}
