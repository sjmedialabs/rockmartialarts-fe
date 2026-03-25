import { NextRequest, NextResponse } from "next/server"
import { getBackendProxyBaseUrl } from "@/lib/serverBackendUrl"

const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)

function slugifySegment(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/_/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

function toSlug(c: { code?: string; title?: string; name?: string; id?: string }): string {
  const raw = (c.code ?? c.title ?? c.name ?? c.id ?? "").toString().trim()
  return slugifySegment(raw) || "course"
}

/** Slug from course title/name only (ignores code) — matches public URLs like /courses/kick-boxing */
function slugFromTitle(c: { title?: string; name?: string }): string {
  const raw = (c.title ?? c.name ?? "").toString().trim()
  return slugifySegment(raw)
}

function slugFromCode(code: unknown): string {
  if (typeof code !== "string" || !code.trim()) return ""
  return slugifySegment(code)
}

function matchSlug(c: { id?: string; code?: string; title?: string; name?: string }, slug: string): boolean {
  const s = slug.toLowerCase()
  if (c.id && c.id.toLowerCase() === s) return true
  if (slugFromTitle(c) === s) return true
  if (slugFromCode(c.code) === s) return true
  return toSlug(c) === s
}

/**
 * When several courses match (e.g. code slug collides with another course’s title slug),
 * prefer the one whose title slug equals the URL — fixes wrong page_content on detail pages.
 */
function pickCourseFromList(
  courses: Record<string, unknown>[],
  slugOrId: string
): Record<string, unknown> | undefined {
  const s = slugOrId.toLowerCase()
  const candidates = courses.filter((c) => {
    if (!c || typeof c !== "object") return false
    const rec = c as { id?: string; code?: string; title?: string; name?: string }
    return rec.id === slugOrId || matchSlug(rec, slugOrId)
  })
  if (candidates.length === 0) return undefined
  if (candidates.length === 1) return candidates[0]

  const byTitle = candidates.find((c) => slugFromTitle(c as { title?: string; name?: string }) === s)
  if (byTitle) return byTitle
  const byCode = candidates.find((c) => slugFromCode((c as { code?: string }).code) === s)
  if (byCode) return byCode
  const byId = candidates.find((c) => (c as { id?: string }).id?.toLowerCase() === s)
  return byId ?? candidates[0]
}

/** Canonical course document from DB (page_content, etc.), merged with list-only fields like branch_assignments */
async function mergeWithPublicDetail(
  base: string,
  summary: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const id = typeof summary.id === "string" ? summary.id : ""
  if (!id) return summary
  const detailRes = await fetchJson(`${base}/api/courses/public/detail/${encodeURIComponent(id)}`)
  if (!detailRes.ok || typeof detailRes.data !== "object" || detailRes.data === null) return summary
  const payload = detailRes.data as { course?: Record<string, unknown> }
  const doc = payload.course
  if (!doc || typeof doc !== "object") return summary
  const listBranches = summary.branch_assignments
  const merged: Record<string, unknown> = { ...summary, ...doc }
  if (Array.isArray(listBranches) && listBranches.length > 0) {
    merged.branch_assignments = listBranches
  }
  return merged
}

async function fetchJson(url: string, options?: RequestInit): Promise<{ ok: boolean; status: number; data: unknown }> {
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    ...options,
  })
  const text = await res.text()
  let data: unknown = text
  if (res.headers.get("content-type")?.includes("application/json") && text) {
    try {
      data = JSON.parse(text)
    } catch {
      // keep as text
    }
  }
  return { ok: res.ok, status: res.status, data }
}

/**
 * Public course detail: expose flat about fields and omit generic `description` (use aboutDescription + page_content only).
 */
function preparePublicCourseDetail(course: Record<string, unknown>): Record<string, unknown> {
  const pageContent =
    (course.page_content as Record<string, unknown> | null | undefined) || {}
  const raw = pageContent.about_section
  const about =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {}
  const aboutTitle = String(about.title ?? about.aboutTitle ?? "").trim()
  const aboutDescription = String(about.description ?? about.aboutDescription ?? "").trim()
  const { description: _omitGenericCourseDescription, ...rest } = course
  return {
    ...rest,
    aboutTitle,
    aboutDescription,
  }
}

/**
 * Public course by ID or slug. Tries backend GET /api/courses/:id first when param is UUID.
 * On 401/403/404 or when param is a slug, falls back to public list and finds by id or slug.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const slugOrId = (await params).id
  if (!slugOrId) {
    return NextResponse.json({ error: "Course ID or slug required" }, { status: 400 })
  }

  const base = getBackendProxyBaseUrl().replace(/\/$/, "")

  // 1) If it looks like a UUID, try to get course by id from backend (may 401 if auth required)
  if (isUuid(slugOrId)) {
    const { ok, status, data } = await fetchJson(`${base}/api/courses/${slugOrId}`)
    if (ok) {
      const merged = await mergeWithPublicDetail(base, data as Record<string, unknown>)
      const enriched = await enrichCourseWithDurations(base, merged)
      return NextResponse.json(enriched)
    }
    // 401/403/404: fall through to list fallback
    if (status !== 401 && status !== 403 && status !== 404) {
      return NextResponse.json(
        typeof data === "object" && data !== null ? data : { error: "Failed to load course" },
        { status }
      )
    }
  }

  // 2) Fallback: fetch public list and find by id or slug
  const listRes = await fetchJson(`${base}/api/courses/public/all`)
  if (!listRes.ok) {
    return NextResponse.json(
      { error: "Course not found" },
      { status: 404 }
    )
  }

  const listPayload = listRes.data as { courses?: unknown[] }
  const rawList = Array.isArray(listPayload?.courses) ? listPayload.courses : Array.isArray(listPayload) ? listPayload : []
  const courses = rawList.filter((c): c is Record<string, unknown> => c !== null && typeof c === "object")
  const course = pickCourseFromList(courses, slugOrId)

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 })
  }

  const merged = await mergeWithPublicDetail(base, course)
  const enriched = await enrichCourseWithDurations(base, merged)
  return NextResponse.json(enriched)
}

async function enrichCourseWithDurations(
  base: string,
  course: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const c = { ...course }
  const hasFees =
    c.fee_per_duration &&
    typeof c.fee_per_duration === "object" &&
    Object.keys(c.fee_per_duration as object).length > 0
  const hasDurations = Array.isArray(c.durations) && (c.durations as unknown[]).length > 0
  const hasAvailableDurations =
    Array.isArray(c.available_durations) && (c.available_durations as unknown[]).length > 0

  if (hasFees && !hasDurations && !hasAvailableDurations) {
    const durRes = await fetchJson(`${base}/api/durations/public/all`)
    if (durRes.ok && typeof durRes.data === "object" && durRes.data !== null) {
      const payload = durRes.data as { durations?: { id: string; name: string; duration_months?: number }[] }
      const list = Array.isArray(payload.durations) ? payload.durations : []
      c.available_durations = list.map((d) => ({
        id: d.id,
        name: d.name,
        duration_months: d.duration_months,
      }))
    }
  }

  return preparePublicCourseDetail(c)
}
