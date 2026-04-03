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

export type ScheduleBatchCard = {
  title: string
  daysLine: string
  timeLine: string
  trainer?: string
  feeLabel: string
  /** Heuristic: batch name/label contains "popular". */
  isPopular?: boolean
}

function _batchFeeFromRaw(raw: Record<string, unknown>): number | null {
  const keys = ["batch_fee", "batchFee", "fee", "price"] as const
  for (const k of keys) {
    const v = raw[k]
    if (v == null) continue
    const n =
      typeof v === "number"
        ? v
        : parseFloat(String(v).replace(/[^\d.-]/g, ""))
    if (!Number.isNaN(n)) return n
  }
  return null
}

/**
 * Structured batch rows for branch course popup / cards (from assignments.course_schedule).
 */
export function courseScheduleBatchCards(
  courseSchedule: PublicCourseScheduleEntry[] | undefined | null,
  courseId: string
): ScheduleBatchCard[] {
  if (!courseSchedule?.length || !courseId) return []
  const entry = courseSchedule.find((c) => {
    const id = String(c.course_id ?? c.courseId ?? "").trim()
    return id === courseId
  })
  const batches = entry?.batches
  if (!Array.isArray(batches) || batches.length === 0) return []

  const padStartTime = (t?: string) => {
    const s = (t || "").trim()
    if (!s) return "99:99"
    const [h, m] = s.split(":")
    return `${(h || "99").padStart(2, "0")}:${(m || "99").padStart(2, "0")}`
  }
  const sortedRaw = [...batches].sort((a, b) => {
    if (!a || typeof a !== "object") return 1
    if (!b || typeof b !== "object") return -1
    const ra = a as Record<string, unknown>
    const rb = b as Record<string, unknown>
    const sta = String(ra.start_time ?? ra.startTime ?? "").trim()
    const stb = String(rb.start_time ?? rb.startTime ?? "").trim()
    return padStartTime(sta).localeCompare(padStartTime(stb))
  })

  const cards: ScheduleBatchCard[] = []
  for (const raw of sortedRaw) {
    if (!raw || typeof raw !== "object") continue
    const b = raw as Record<string, unknown>
    const days = Array.isArray(b.days) ? b.days.map((d) => String(d)) : []
    const st = String(
      b.start_time ?? (b.startTime as string | undefined) ?? ""
    ).trim()
    const en = String(
      b.end_time ?? (b.endTime as string | undefined) ?? ""
    ).trim()
    const dayPart = formatWeekdayRanges(days)
    const timePart = st && en ? `${st}–${en}` : st || en
    const bname = String(
      b.batch_name ?? b.name ?? ""
    ).trim()
    const title = bname || "Batch"
    const trainer = String(b.trainer_name ?? "").trim() || undefined
    const feeN = _batchFeeFromRaw(b)
    const feeLabel =
      feeN != null
        ? `₹${feeN.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
        : "Fee on enrollment"
    const popular =
      title.toLowerCase().includes("popular") ||
      bname.toLowerCase().includes("popular")
    cards.push({
      title,
      daysLine: dayPart || "Days TBA",
      timeLine: timePart || "Time TBA",
      trainer,
      feeLabel,
      isPopular: popular,
    })
  }
  return cards
}
