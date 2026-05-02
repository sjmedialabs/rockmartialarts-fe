/**
 * Merge multiple enrollment rows for the same course+branch.
 * Never pick validity (end_date) from a cancelled row when a paid row exists — that caused
 * "paid for 1 month but expires 2028" when a stale checkout had a far-future end_date.
 */

export function parseTimeSafe(value?: string | null): number {
  if (!value) return 0
  const ts = new Date(value).getTime()
  return Number.isFinite(ts) ? ts : 0
}

/** Higher = preferred for display (dates, status, payment CTAs). */
export function enrollmentDisplayPriority(e: {
  payment_status?: string | null
  is_active?: boolean | null
  status?: string | null
}): number {
  const ps = String(e.payment_status || "").toLowerCase()
  const st = String(e.status || "").toLowerCase()
  if (ps === "cancelled" || ps === "canceled" || ps === "refunded") return 0
  if (st === "cancelled" || st === "canceled") return 0
  if (ps === "paid" && e.is_active !== false) return 100
  if (ps === "paid") return 80
  if (ps === "pending" || ps === "overdue" || ps === "processing") return 60
  if (ps === "failed") return 40
  return 20
}

export function pickPrimaryEnrollment<T extends Record<string, unknown>>(group: T[]): T {
  if (group.length === 1) return group[0]
  const ranked = [...group].sort((a, b) => {
    const pa = enrollmentDisplayPriority(a as { payment_status?: string; is_active?: boolean; status?: string })
    const pb = enrollmentDisplayPriority(b as { payment_status?: string; is_active?: boolean; status?: string })
    if (pb !== pa) return pb - pa
    const ta = parseTimeSafe(
      String((a as { start_date?: string }).start_date || (a as { enrollment_date?: string }).enrollment_date || "")
    )
    const tb = parseTimeSafe(
      String((b as { start_date?: string }).start_date || (b as { enrollment_date?: string }).enrollment_date || "")
    )
    return tb - ta
  })
  return ranked[0]
}

export function groupKey(courseId: string, branchId: string | null | undefined): string {
  return `${courseId}::${branchId || ""}`
}

export type MergeableEnrollment = {
  course_id: string
  branch_id?: string | null
  payment_status?: string | null
  is_active?: boolean | null
  status?: string | null
  end_date?: string | null
  start_date?: string | null
  enrollment_date?: string | null
  enrollment_id?: string
  id?: string
  progress?: number
  [key: string]: unknown
}

/**
 * One row per (course_id, branch_id). Dates and status come from the primary enrollment only
 * (not max(end_date), which mixed cancelled far-future rows with paid status).
 */
export function mergeEnrollmentsByCourseBranch<T extends MergeableEnrollment>(items: T[]): T[] {
  const groups = new Map<string, T[]>()
  for (const item of items) {
    const key = groupKey(String(item.course_id), item.branch_id)
    const bucket = groups.get(key)
    if (bucket) bucket.push(item)
    else groups.set(key, [item])
  }

  const merged: T[] = []
  for (const [, group] of groups) {
    if (group.length === 1) {
      merged.push(group[0])
      continue
    }

    const primary = pickPrimaryEnrollment(group)
    const idField = (primary as { enrollment_id?: string }).enrollment_id ?? (primary as { id?: string }).id

    merged.push({
      ...primary,
      enrollment_id: (primary as { enrollment_id?: string }).enrollment_id ?? (primary as { id?: string }).id,
      id: (primary as { id?: string }).id ?? idField,
      start_date: primary.start_date,
      enrollment_date: primary.enrollment_date,
      end_date: primary.end_date,
      payment_status: primary.payment_status,
      is_active: primary.is_active,
      status: (primary as { status?: string }).status,
      progress:
        typeof (primary as { progress?: number }).progress === "number"
          ? (primary as { progress?: number }).progress
          : 0,
    } as T)
  }

  return merged.sort(
    (a, b) =>
      parseTimeSafe(b.start_date || b.enrollment_date || b.end_date) -
      parseTimeSafe(a.start_date || a.enrollment_date || a.end_date)
  )
}
