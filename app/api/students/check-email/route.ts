import { NextRequest, NextResponse } from "next/server"
import { getBackendProxyBaseUrl } from "@/lib/serverBackendUrl"

/**
 * Check if a student with this email already exists (for registration validation).
 * POST body: { email: string }
 * Returns: { exists: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = typeof body.email === "string" ? body.email.trim() : ""

    if (!email) {
      return NextResponse.json({ exists: false })
    }

    const base = getBackendProxyBaseUrl().replace(/\/$/, "")

    // Prefer backend auth check-user (returns { exists: boolean })
    const authRes = await fetch(`${base}/api/auth/check-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      cache: "no-store",
    })
    if (authRes.ok) {
      const data = await authRes.json().catch(() => ({}))
      return NextResponse.json({ exists: !!data.exists })
    }

    // Try backend students/check-email if present
    const res = await fetch(`${base}/api/students/check-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      cache: "no-store",
    })
    if (res.ok) {
      const data = await res.json().catch(() => ({}))
      return NextResponse.json({ exists: !!data.exists })
    }

    // Fallback: try listing users/students with email filter
    const listRes = await fetch(
      `${base}/api/users?email=${encodeURIComponent(email)}&limit=1`,
      { cache: "no-store" }
    )
    if (listRes.ok) {
      const list = await listRes.json().catch(() => ({}))
      const users = list.users ?? list.students ?? list.data ?? list ?? []
      const exists = Array.isArray(users) && users.length > 0
      return NextResponse.json({ exists })
    }

    return NextResponse.json({ exists: false })
  } catch {
    return NextResponse.json({ exists: false })
  }
}
