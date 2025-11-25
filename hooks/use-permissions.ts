import { useEffect, useState } from 'react'

interface Permission {
  id: string
  name: string
  description: string
  enabled: boolean
}

interface RolePermissions {
  role: string
  displayName: string
  icon: any
  permissions: Permission[]
}

export function usePermissions(userRole?: string) {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get user role from localStorage if not provided
    const role = userRole || getUserRole()
    
    // Load permissions from localStorage
    const saved = localStorage.getItem('role_permissions')
    
    if (saved && role) {
      try {
        const allPermissions: RolePermissions[] = JSON.parse(saved)
        const rolePerms = allPermissions.find(r => r.role === role)
        
        if (rolePerms) {
          setPermissions(rolePerms.permissions)
        } else {
          // If role not found, load default permissions
          setPermissions(getDefaultPermissions(role))
        }
      } catch (error) {
        console.error('Error loading permissions:', error)
        setPermissions(getDefaultPermissions(role))
      }
    } else if (role) {
      // No saved permissions, use defaults
      setPermissions(getDefaultPermissions(role))
    }
    
    setLoading(false)
  }, [userRole])

  const hasPermission = (permissionId: string): boolean => {
    const permission = permissions.find(p => p.id === permissionId)
    return permission?.enabled ?? false
  }

  return { permissions, hasPermission, loading }
}

function getUserRole(): string {
  // Get user data from localStorage
  const user = localStorage.getItem('user')
  if (user) {
    try {
      const userData = JSON.parse(user)
      return userData.role || userData.user_role || 'student'
    } catch {
      return 'student'
    }
  }
  return 'student'
}

function getDefaultPermissions(role: string): Permission[] {
  const defaults: Record<string, Permission[]> = {
    coach: [
      { id: "dashboard", name: "Dashboard", description: "View dashboard home", enabled: true },
      { id: "students", name: "Students", description: "View and manage students", enabled: true },
      { id: "attendance", name: "Attendance", description: "Mark and view attendance", enabled: true },
      { id: "messages", name: "Messages", description: "Send and receive messages", enabled: true },
      { id: "courses", name: "Courses", description: "View assigned courses", enabled: true },
      { id: "reports", name: "Reports", description: "View performance reports", enabled: false },
      { id: "profile", name: "Profile", description: "View and edit own profile", enabled: true },
      { id: "settings", name: "Settings", description: "Access personal settings", enabled: true },
      { id: "payments", name: "Payments", description: "View payment information", enabled: false },
      { id: "branches", name: "Branches", description: "View branch information", enabled: false },
    ],
    branch_admin: [
      { id: "dashboard", name: "Dashboard", description: "View dashboard home", enabled: true },
      { id: "students", name: "Students", description: "View and manage students", enabled: true },
      { id: "coaches", name: "Coaches", description: "View coaches in branch", enabled: true },
      { id: "attendance", name: "Attendance", description: "View all attendance", enabled: true },
      { id: "messages", name: "Messages", description: "Send and receive messages", enabled: true },
      { id: "courses", name: "Courses", description: "Manage branch courses", enabled: true },
      { id: "reports", name: "Reports", description: "View branch reports", enabled: true },
      { id: "profile", name: "Profile", description: "View and edit own profile", enabled: true },
      { id: "settings", name: "Settings", description: "Access branch settings", enabled: true },
      { id: "payments", name: "Payments", description: "Manage payments", enabled: true },
      { id: "branches", name: "Branches", description: "View own branch details", enabled: true },
      { id: "categories", name: "Categories", description: "Manage categories", enabled: false },
    ],
    student: [
      { id: "dashboard", name: "Dashboard", description: "View dashboard home", enabled: true },
      { id: "courses", name: "My Courses", description: "View enrolled courses", enabled: true },
      { id: "attendance", name: "Attendance", description: "View own attendance", enabled: true },
      { id: "messages", name: "Messages", description: "Receive messages", enabled: true },
      { id: "profile", name: "Profile", description: "View and edit own profile", enabled: true },
      { id: "settings", name: "Settings", description: "Access personal settings", enabled: true },
      { id: "payments", name: "Payments", description: "View payment history", enabled: true },
      { id: "reports", name: "Reports", description: "View performance reports", enabled: false },
      { id: "coaches", name: "Coaches", description: "View assigned coaches", enabled: true },
      { id: "branches", name: "Branches", description: "View branch information", enabled: false },
    ]
  }

  return defaults[role] || defaults.student
}
