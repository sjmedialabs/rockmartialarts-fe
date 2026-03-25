import { NextRequest, NextResponse } from "next/server"
import { getBackendProxyBaseUrl } from "@/lib/serverBackendUrl"

/**
 * Proxies GET /api/courses/public/all to the real backend.
 * Never returns mock data — failures surface as errors so the UI matches the database.
 */
export async function GET(_request: NextRequest) {
  const base = getBackendProxyBaseUrl().replace(/\/$/, "")
  const url = `${base}/api/courses/public/all`

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })

    const text = await res.text()
    let data: unknown = text
    if (res.headers.get("content-type")?.includes("application/json") && text) {
      try {
        data = JSON.parse(text)
      } catch {
        console.error("[courses/public/all] Backend returned invalid JSON from", url)
        return NextResponse.json(
          {
            message: "Invalid response from course service",
            courses: [],
            total: 0,
            detail: "Response was not valid JSON",
          },
          { status: 502 }
        )
      }
    }

    if (!res.ok) {
      console.error("[courses/public/all] Backend error", res.status, url, typeof data === "string" ? data.slice(0, 200) : data)
      const detail =
        typeof data === "object" && data !== null && "detail" in data
          ? (data as { detail: unknown }).detail
          : typeof data === "string"
            ? data
            : "Upstream request failed"
      return NextResponse.json(
        {
          message: "Failed to load courses from server",
          courses: [],
          total: 0,
          detail,
        },
        { status: res.status >= 400 && res.status < 600 ? res.status : 502 }
      )
    }

    if (typeof data !== "object" || data === null || !("courses" in data)) {
      console.error("[courses/public/all] Unexpected shape from", url, data)
      return NextResponse.json(
        {
          message: "Unexpected course list format from server",
          courses: [],
          total: 0,
          detail: "Missing courses array in response",
        },
        { status: 502 }
      )
    }

    const payload = data as { courses?: unknown[]; total?: number; message?: string; skip?: number; limit?: number }
    const courses = Array.isArray(payload.courses) ? payload.courses : []
    const total = typeof payload.total === "number" ? payload.total : courses.length

    return NextResponse.json({
      message: payload.message ?? "Courses retrieved successfully",
      courses,
      total,
      ...(payload.skip !== undefined ? { skip: payload.skip } : {}),
      ...(payload.limit !== undefined ? { limit: payload.limit } : {}),
    })
  } catch (e) {
    console.error("[courses/public/all] Fetch failed:", url, e)
    return NextResponse.json(
      {
        message: "Could not reach course service",
        courses: [],
        total: 0,
        detail: e instanceof Error ? e.message : "Network error",
      },
      { status: 502 }
    )
  }
}
