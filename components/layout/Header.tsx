"use client"

import { Button } from "@/components/ui/button"
import { getHeaderActionsForRole, type DashboardRole } from "@/lib/dashboard-config"
import add_icon from "@/public/images/add_icon.png"
import { useRouter } from "next/navigation"

interface HeaderProps {
  title: string
  role: DashboardRole
  children?: React.ReactNode
}

export default function Header({ title, role, children }: HeaderProps) {
  const router = useRouter()
  const actions = getHeaderActionsForRole(role)

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start py-8 mb-4 lg:items-center gap-4">
      <h1 className="text-2xl font-medium text-[var(--brand-dark)]">{title}</h1>
      <div className="flex flex-wrap items-center gap-2 lg:gap-3 text-[var(--brand-muted)] roboto">
        {actions.map((action) => (
          <Button
            key={action.path}
            variant="outline"
            className="flex items-center space-x-1 bg-transparent text-sm"
            onClick={() => router.push(action.path)}
          >
            <img src={add_icon.src} alt="" className="w-8 h-8" />
            <span className="hidden sm:inline">{action.label}</span>
            <span className="sm:hidden">{action.shortLabel || action.label}</span>
          </Button>
        ))}
        {children}
      </div>
    </div>
  )
}
