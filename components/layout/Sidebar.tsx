"use client"

import { usePathname } from "next/navigation"
import { getMenuForRole, type DashboardRole } from "@/lib/dashboard-config"

interface SidebarProps {
  role: DashboardRole
  onNavigate: (path: string) => void
}

export default function Sidebar({ role, onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const menuItems = getMenuForRole(role)

  const isActivePath = (path: string) => pathname === path || pathname.startsWith(path + "/")

  const itemClass = (path: string) =>
    `w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100/80 text-sm font-medium transition-all duration-200 ${
      isActivePath(path)
        ? "bg-gradient-to-r from-yellow-50 to-yellow-100/50 text-[#E1BB33] border-l-3 border-[#E1BB33] shadow-sm"
        : "text-gray-700 hover:text-gray-900"
    }`

  const childClass = (path: string) =>
    `w-full text-left px-3 py-1 rounded-md hover:bg-gray-100 text-sm text-gray-600 ${isActivePath(path) ? "bg-yellow-50 text-[#E1BB33]" : ""}`

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200/60">
        <div className="flex items-center space-x-3">
          <img src="/footer_logo.png" alt="Logo" className="w-8 h-8" />
        </div>
      </div>
      <nav className="flex-1 p-6">
        <div className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            return item.children ? (
              <div key={item.path} className="px-3 py-2">
                <p className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.label}
                </p>
                {item.children.map((child) => {
                  const ChildIcon = child.icon
                  return (
                    <button
                      key={child.path}
                      onClick={() => onNavigate(child.path)}
                      className={childClass(child.path)}
                    >
                      <span className="flex items-center gap-2">
                        {ChildIcon && <ChildIcon className="w-3.5 h-3.5" />}
                        {child.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={itemClass(item.path)}
              >
                <span className="flex items-center gap-2">
                  {Icon && <Icon className="w-4 h-4" />}
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
