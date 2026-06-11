/** Roles that may edit student performance metrics (not fee status). */
const STAFF_EDIT_ROLES = new Set([
  "super_admin",
  "superadmin",
  "branch_manager",
  "branch_admin",
  "coach_admin",
  "coach",
])

export function canEditStudentPerformance(role?: string | null): boolean {
  const r = (role || "").trim().toLowerCase().replace(/-/g, "_")
  if (r === "superadmin") return true
  return STAFF_EDIT_ROLES.has(r)
}
