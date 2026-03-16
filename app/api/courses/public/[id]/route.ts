import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8003"

const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)

function toSlug(c: { code?: string; title?: string; name?: string; id?: string }): string {
  const raw = (c.code ?? c.title ?? c.name ?? c.id ?? "").toString().trim()
  return raw.toLowerCase().replace(/\s+/g, "-").replace(/_/g, "-").replace(/[^a-z0-9-]/g, "") || "course"
}

function matchSlug(c: { code?: string; title?: string; name?: string; id?: string }, slug: string): boolean {
  const s = slug.toLowerCase()
  if (c.id && c.id.toLowerCase() === s) return true
  return toSlug(c) === s
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

  const base = BACKEND_URL.replace(/\/$/, "")

  // 1) If it looks like a UUID, try public detail first (has stats, curriculum, enrolled, reviews, achievements)
  if (isUuid(slugOrId)) {
    const detailRes = await fetchJson(`${base}/api/courses/public/detail/${slugOrId}`)
    if (detailRes.ok && typeof detailRes.data === "object" && detailRes.data !== null) {
      const detail = detailRes.data as Record<string, unknown>
      const courseFromDetail = detail.course as Record<string, unknown>
      const enriched = await enrichCourseWithDurations(base, courseFromDetail || {})
      Object.assign(enriched, {
        statistics: detail.statistics,
        curriculum: detail.curriculum,
        enrolled_students: detail.enrolled_students,
        student_reviews: detail.student_reviews,
        student_achievements: detail.student_achievements,
        branches_offering: detail.branches_offering,
      })
      return NextResponse.json(enriched)
    }
    const { ok, status, data } = await fetchJson(`${base}/api/courses/${slugOrId}`)
    if (ok) {
      const enriched = await enrichCourseWithDurations(base, data as Record<string, unknown>)
      const detailRes2 = await fetchJson(`${base}/api/courses/public/detail/${slugOrId}`)
      if (detailRes2.ok && typeof detailRes2.data === "object" && detailRes2.data !== null) {
        const d = detailRes2.data as Record<string, unknown>
        Object.assign(enriched, { statistics: d.statistics, curriculum: d.curriculum, enrolled_students: d.enrolled_students, student_reviews: d.student_reviews, student_achievements: d.student_achievements, branches_offering: d.branches_offering })
      }
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
  const courses = Array.isArray(listPayload?.courses) ? listPayload.courses : Array.isArray(listPayload) ? listPayload : []
  const course = courses.find((c: { id?: string; code?: string; title?: string; name?: string }) =>
    c && (c.id === slugOrId || matchSlug(c, slugOrId))
  )

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 })
  }

  const courseObj = course as Record<string, unknown>
  const courseId = courseObj.id as string
  const enriched = await enrichCourseWithDurations(base, { ...courseObj })
  const detailRes = await fetchJson(`${base}/api/courses/public/detail/${courseId}`)
  if (detailRes.ok && typeof detailRes.data === "object" && detailRes.data !== null) {
    const detail = detailRes.data as Record<string, unknown>
    Object.assign(enriched, {
      statistics: detail.statistics,
      curriculum: detail.curriculum,
      enrolled_students: detail.enrolled_students,
      student_reviews: detail.student_reviews,
      student_achievements: detail.student_achievements,
      branches_offering: detail.branches_offering,
    })
  }
  return NextResponse.json(enriched)
}

async function enrichCourseWithDurations(
  base: string,
  course: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const hasFees = course.fee_per_duration && typeof course.fee_per_duration === "object" && Object.keys(course.fee_per_duration as object).length > 0
  const hasDurations = Array.isArray(course.durations) && (course.durations as unknown[]).length > 0
  const hasAvailableDurations = Array.isArray(course.available_durations) && (course.available_durations as unknown[]).length > 0

  if (!hasFees || hasDurations || hasAvailableDurations) return course

  const durRes = await fetchJson(`${base}/api/durations/public/all`)
  if (!durRes.ok || typeof durRes.data !== "object" || durRes.data === null) return course

  const payload = durRes.data as { durations?: { id: string; name: string; duration_months?: number }[] }
  const list = Array.isArray(payload.durations) ? payload.durations : []
  course.available_durations = list.map((d) => ({
    id: d.id,
    name: d.name,
    duration_months: d.duration_months,
  }))
  return course
}
