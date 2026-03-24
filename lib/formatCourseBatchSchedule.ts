import { formatWeekdayRanges } from "@/lib/formatWeekdayRanges"

export type PublicCourseScheduleEntry = {
  course_id?: string
  courseId?: string
  batches?: Array<Record<string, unknown>>
}

/**
 * Human-readable lines for course batches at a branch (from assignments.course_schedule).
 */
export function formatCourseBatchesForModal(
  courseSchedule: PublicCourseScheduleEntry[] | undefined | null,
  courseId: string
): string {
  if (!courseSchedule?.length || !courseId) return ""
  const entry = courseSchedule.find((c) => {
    const id = String(c.course_id ?? c.courseId ?? "").trim()
    return id === courseId
  })
  const batches = entry?.batches
  if (!Array.isArray(batches) || batches.length === 0) return ""

  const lines: string[] = []
  for (const raw of batches) {
    if (!raw || typeof raw !== "object") continue
    const b = raw as Record<string, unknown>
    const days = Array.isArray(b.days)
      ? b.days.map((d) => String(d))
      : []
    const st = String(
      b.start_time ?? (b.startTime as string | undefined) ?? ""
    ).trim()
    const en = String(
      b.end_time ?? (b.endTime as string | undefined) ?? ""
    ).trim()
    const dayPart = formatWeekdayRanges(days)
    const timePart =
      st && en ? `${st} – ${en}` : st || en
    if (dayPart && timePart) lines.push(`${dayPart}\n${timePart}`)
    else if (dayPart) lines.push(dayPart)
    else if (timePart) lines.push(timePart)
  }
  return lines.join("\n\n")
}
