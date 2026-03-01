/**
 * Role-based dashboard config: menu items and header actions.
 * Super Admin UI is the master; Branch Admin and Student use same UI, different menu + data.
 */

export type DashboardRole = "super_admin" | "branch_admin" | "student"

export interface NavItem {
  label: string
  path: string
  children?: { label: string; path: string }[]
}

export interface HeaderAction {
  label: string
  shortLabel?: string
  path: string
  icon?: string
}

const SUPER_ADMIN_BASE = "/super-admin/dashboard"
const BRANCH_ADMIN_BASE = "/branch-admin/dashboard"

const SUPER_ADMIN_MENU: NavItem[] = [
  { label: "Dashboard", path: SUPER_ADMIN_BASE },
  { label: "Branches", path: `${SUPER_ADMIN_BASE}/branches` },
  { label: "Coachs", path: `${SUPER_ADMIN_BASE}/coaches` },
  { label: "Students", path: `${SUPER_ADMIN_BASE}/students` },
  { label: "Messages", path: `${SUPER_ADMIN_BASE}/messages` },
  { label: "Courses", path: `${SUPER_ADMIN_BASE}/courses` },
  {
    label: "Attendance",
    path: `${SUPER_ADMIN_BASE}/attendance`,
    children: [
      { label: "Overview", path: `${SUPER_ADMIN_BASE}/attendance` },
      { label: "Student Attendance", path: `${SUPER_ADMIN_BASE}/attendance/students` },
      { label: "Coach Attendance", path: `${SUPER_ADMIN_BASE}/attendance/coaches` },
    ],
  },
  { label: "Reports", path: `${SUPER_ADMIN_BASE}/reports` },
]

// Branch admin: no Branches menu, no Add Branch Manager / Add New Branch
const BRANCH_ADMIN_MENU: NavItem[] = [
  { label: "Dashboard", path: BRANCH_ADMIN_BASE },
  { label: "Coachs", path: `${BRANCH_ADMIN_BASE}/coaches` },
  { label: "Students", path: `${BRANCH_ADMIN_BASE}/students` },
  { label: "Messages", path: `${BRANCH_ADMIN_BASE}/messages` },
  { label: "Courses", path: `${BRANCH_ADMIN_BASE}/courses` },
  {
    label: "Attendance",
    path: `${BRANCH_ADMIN_BASE}/attendance`,
    children: [
      { label: "Overview", path: `${BRANCH_ADMIN_BASE}/attendance` },
      { label: "Student Attendance", path: `${BRANCH_ADMIN_BASE}/attendance/students` },
      { label: "Coach Attendance", path: `${BRANCH_ADMIN_BASE}/attendance/coaches` },
    ],
  },
  { label: "Reports", path: `${BRANCH_ADMIN_BASE}/reports` },
]

const STUDENT_MENU: NavItem[] = [
  { label: "Dashboard", path: "/student-dashboard" },
  { label: "Courses", path: "/student-dashboard/courses" },
  { label: "Attendance", path: "/student-dashboard/attendance" },
  { label: "Payments", path: "/student-dashboard/payments" },
  { label: "Profile", path: "/student-dashboard/profile" },
]

export function getMenuForRole(role: DashboardRole): NavItem[] {
  switch (role) {
    case "super_admin":
      return SUPER_ADMIN_MENU
    case "branch_admin":
      return BRANCH_ADMIN_MENU
    case "student":
      return STUDENT_MENU
    default:
      return SUPER_ADMIN_MENU
  }
}

/** Header action buttons (Add Course, Add Coach, etc.) - super_admin only gets Add Branch Manager / Add New Branch */
export function getHeaderActionsForRole(role: DashboardRole): HeaderAction[] {
  const base = role === "super_admin" ? SUPER_ADMIN_BASE : role === "branch_admin" ? BRANCH_ADMIN_BASE : ""
  switch (role) {
    case "super_admin":
      return [
        { label: "Add Course", shortLabel: "Course", path: `${base}/create-course` },
        { label: "Add Coach", shortLabel: "Coach", path: `${base}/add-coach` },
        { label: "Add Branch Manager", shortLabel: "Manager", path: `${base}/branch-managers/create` },
        { label: "Add New Branch", shortLabel: "Branch", path: `${base}/create-branch` },
      ]
    case "branch_admin":
      // Branch admin: no Add Branch Manager, no Add New Branch
      return [
        { label: "Add Course", shortLabel: "Course", path: `${base}/create-course` },
        { label: "Add Coach", shortLabel: "Coach", path: `${base}/add-coach` },
      ]
    case "student":
      return []
    default:
      return []
  }
}

export function getRoleLabel(role: DashboardRole): string {
  switch (role) {
    case "super_admin":
      return "Super admin"
    case "branch_admin":
      return "Branch Admin"
    case "student":
      return "Student"
    default:
      return "User"
  }
}

/** Base path for each role (for redirects and links) */
export function getBasePath(role: DashboardRole): string {
  switch (role) {
    case "super_admin":
      return SUPER_ADMIN_BASE
    case "branch_admin":
      return BRANCH_ADMIN_BASE
    case "student":
      return "/student-dashboard"
    default:
      return SUPER_ADMIN_BASE
  }
}
