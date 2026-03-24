/** Checkbox order (Sunday first). Values stored are full English names. */
export const WEEKDAY_CHECKLIST_ORDER = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const

/** Monday-first index for grouping consecutive ranges (e.g. Monday to Friday). */
const MON_FIRST = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const

function dayToMonFirstIndex(day: string): number {
  const n = day.trim().toLowerCase()
  return MON_FIRST.findIndex((d) => d.toLowerCase() === n)
}

/**
 * Collapse selected weekdays into readable ranges, e.g. Mon–Fri → "Monday to Friday".
 */
export function formatWeekdayRanges(selectedDays: string[]): string {
  const indices = [
    ...new Set(
      selectedDays
        .map((d) => dayToMonFirstIndex(d))
        .filter((i): i is number => i >= 0)
    ),
  ].sort((a, b) => a - b)
  if (indices.length === 0) return ""

  const parts: string[] = []
  let runStart = indices[0]
  let runEnd = indices[0]
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] === runEnd + 1) {
      runEnd = indices[i]!
    } else {
      parts.push(
        runStart === runEnd
          ? MON_FIRST[runStart]!
          : `${MON_FIRST[runStart]!} to ${MON_FIRST[runEnd]!}`
      )
      runStart = runEnd = indices[i]!
    }
  }
  parts.push(
    runStart === runEnd
      ? MON_FIRST[runStart]!
      : `${MON_FIRST[runStart]!} to ${MON_FIRST[runEnd]!}`
  )
  return parts.join(", ")
}
