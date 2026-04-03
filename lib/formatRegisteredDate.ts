/**
 * All academy timestamps are shown in Indian Standard Time (IST, Asia/Kolkata).
 * Server stores UTC ISO / naive UTC; we convert here for display only.
 */
const envTz =
  typeof process !== "undefined" ? process.env.NEXT_PUBLIC_APP_TIMEZONE?.trim() : ""
export const DISPLAY_TZ_IST = envTz || "Asia/Kolkata"

export function formatRegisteredDateTime(iso: string | null | undefined): string {
  if (iso == null || iso === "") return "-"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "-"
  const formatted = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: DISPLAY_TZ_IST,
  }).format(d)
  return formatted.replace(/\b(am|pm)\b/g, (m) => m.toUpperCase())
}

/** Calendar date only in IST */
export function formatRegisteredDateOnly(iso: string | null | undefined): string {
  if (iso == null || iso === "") return "-"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "-"
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: DISPLAY_TZ_IST,
  }).format(d)
}

/** Time only (e.g. check-in) in IST — pass ISO string or Date */
export function formatTimeIST(iso: string | Date | null | undefined): string {
  if (iso == null || iso === "") return "-"
  const d = typeof iso === "string" ? new Date(iso) : iso
  if (Number.isNaN(d.getTime())) return "-"
  const formatted = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: DISPLAY_TZ_IST,
  }).format(d)
  return formatted.replace(/\b(am|pm)\b/g, (m) => m.toUpperCase())
}

/** Plain YYYY-MM-DD session date → display label in IST (for date-only fields from API) */
export function formatSessionDateLabelYmd(ymd: string | null | undefined): string {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd || "-"
  return formatRegisteredDateOnly(`${ymd}T00:00:00+05:30`)
}
