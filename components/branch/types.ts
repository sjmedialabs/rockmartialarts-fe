/**
 * Branch data shape returned by API (from backend branch model).
 */

export interface BranchAddress {
  line1?: string
  area?: string
  city?: string
  state?: string
  pincode?: string
  country?: string
}

export interface BranchInfo {
  name?: string
  code?: string
  email?: string
  phone?: string
  address?: BranchAddress
}

export interface OperationalTiming {
  day: string
  open: string
  close: string
}

export interface OperationalDetails {
  timings?: OperationalTiming[]
  holidays?: string[]
  courses_offered?: string[]
}

export interface BranchAssignments {
  accessories_available?: boolean
  courses?: string[]
  branch_admins?: string[]
}

export interface BranchData {
  id: string
  branch?: BranchInfo
  location_id?: string
  manager_id?: string
  operational_details?: OperationalDetails
  assignments?: BranchAssignments
  is_active?: boolean
  /** Optional: if backend adds later */
  description?: string
  gallery_images?: string[]
  map_link?: string
  coordinates?: { lat: number; lng: number }
  facilities?: string[]
}

export function getBranchName(b: BranchData): string {
  return b.branch?.name || b.branch?.code || "Branch"
}

export function getBranchEmail(b: BranchData): string | undefined {
  return b.branch?.email
}

export function getBranchPhone(b: BranchData): string | undefined {
  return b.branch?.phone
}

export function getBranchAddress(b: BranchData): BranchAddress | undefined {
  return b.branch?.address
}

export function formatAddress(addr: BranchAddress | undefined): string {
  if (!addr) return ""
  const parts = [addr.line1, addr.area, addr.city, addr.state, addr.pincode, addr.country].filter(Boolean)
  return parts.join(", ")
}

export function formatLocation(addr: BranchAddress | undefined): string {
  if (!addr) return ""
  return [addr.city, addr.state].filter(Boolean).join(", ")
}
