"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { type DashboardRole } from "@/lib/dashboard-config"
import { BranchManagerAuth } from "@/lib/branchManagerAuth"
import { SuperAdminAuth } from "@/lib/auth"
import DashboardLayoutClient from "./DashboardLayoutClient"

/**
 * Resolves dashboard role from the URL path (adminType: super-admin | branch-admin).
 * Validates that the logged-in user matches the path: branch admin must stay on branch-admin, super admin on super-admin.
 * Never treat token presence as super-admin (branch manager also has a token).
 */
export default function PathBasedDashboardResolver({
  adminType,
  children,
}: {
  adminType: string
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [role, setRole] = useState<DashboardRole | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const normalized = adminType?.toLowerCase().replace(/_/g, "-")
    const isSuperAdminPath = normalized === "super-admin"
    const isBranchAdminPath = normalized === "branch-admin"

    if (!isSuperAdminPath && !isBranchAdminPath) {
      router.replace("/superadmin/login")
      return
    }

    const isBranchManager = BranchManagerAuth.isAuthenticated() && BranchManagerAuth.getCurrentUser()
    const isSuperAdmin = SuperAdminAuth.isAuthenticated()

    if (isBranchAdminPath) {
      if (isBranchManager) {
        setRole("branch_admin")
        return
      }
      if (isSuperAdmin) {
        router.replace("/super-admin/dashboard")
        return
      }
      router.replace("/branch-manager/login")
      return
    }

    // super-admin path: only allow if actually superadmin; if branch manager landed here, send to branch-admin
    if (isBranchManager) {
      router.replace("/branch-admin/dashboard")
      return
    }
    if (isSuperAdmin) {
      setRole("super_admin")
      return
    }
    router.replace("/superadmin/login")
  }, [adminType, router])

  if (role === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E1BB33]" />
      </div>
    )
  }

  return <DashboardLayoutClient role={role}>{children}</DashboardLayoutClient>
}
