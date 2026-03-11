import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8003"

/**
 * Public endpoint – returns all active branches (no auth required).
 * Tries backend /api/branches/public/all first, then /api/branches as fallback.
 */
export async function GET(_request: NextRequest) {
  const base = BACKEND_URL.replace(/\/$/, "")

  try {
    // Try public endpoint first
    let res = await fetch(`${base}/api/branches/public/all`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })

    // Fallback to regular branches endpoint
    if (!res.ok) {
      res = await fetch(`${base}/api/branches`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })
    }

    if (!res.ok) {
      return NextResponse.json({ branches: [] }, { status: 200 })
    }

    const data = await res.json()
    const branches = data.branches ?? data ?? []

    return NextResponse.json({
      branches: Array.isArray(branches) ? branches : [],
    })
  } catch (err) {
    console.error("[branches/public] fetch failed:", err)
    return NextResponse.json({ branches: [] }, { status: 200 })
  }
}
