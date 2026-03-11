import { NextResponse } from "next/server"

const BACKEND_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://rockmartialartsacademy.com:8003"

// Same rules as lib/branch-slug.ts
function branchNameToSlug(name: unknown): string {
  if (!name || typeof name !== "string") return ""
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "branch"
  )
}

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug

    if (!slug) {
      return NextResponse.json(
        { error: "Branch not found" },
        { status: 404 }
      )
    }

    const base = BACKEND_BASE.replace(/\/$/, "")
    const backendUrl = `${base}/api/branches/public/all`

    console.log("[branch-by-slug] Fetching all branches:", backendUrl)

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Cache list for 60s in production while still allowing fresh data in dev
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("[branch-by-slug] backend list error:", response.status, text)
      return NextResponse.json(
        { error: "Failed to fetch branches" },
        { status: 502 }
      )
    }

    const data = await response.json()
    // Support both { branches: [...] } and raw arrays or { data: [...] }
    const branches: any[] =
      (data?.branches as any[]) ??
      (data?.data as any[]) ??
      (Array.isArray(data) ? data : [])

    const branch = Array.isArray(branches)
      ? branches.find((b) => {
          if (!b) return false
          const candidates = [
            b.slug,
            b.branch_slug,
            b.branch?.slug,
            b.branch?.branch_slug,
            b.name,
            b.branch?.name,
          ]
          return candidates
            .filter(Boolean)
            .some((value) => branchNameToSlug(value) === slug)
        })
      : null

    if (!branch) {
      return NextResponse.json(
        { error: "Branch not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(branch)
  } catch (error) {
    console.error("[branch-by-slug] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch branch" },
      { status: 500 }
    )
  }
}
