import { NextRequest, NextResponse } from "next/server"
import { getBackendProxyBaseUrl } from "@/lib/serverBackendUrl"
import { extractIndianMobileDigits, isValidIndianMobileNational } from "@/lib/indianMobile"

/** 10-digit national part for student list queries */
function normalizePhone(phone: string): string {
  const d = extractIndianMobileDigits(phone)
  return isValidIndianMobileNational(d) ? d : ""
}

/**
 * Check if a student with this phone number already exists (for registration validation).
 * POST body: { phone: string }
 * Returns: { exists: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const raw = typeof body.phone === "string" ? body.phone.trim() : ""
    const phone = normalizePhone(raw)

    if (!phone) {
      return NextResponse.json({ exists: false })
    }

    const base = getBackendProxyBaseUrl().replace(/\/$/, "")

    const checkRes = await fetch(`${base}/api/auth/check-phone`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: raw }),
      cache: "no-store",
    })

    if (checkRes.ok) {
      const data = await checkRes.json().catch(() => ({}))
      return NextResponse.json({ exists: !!data.exists })
    }

    for (const param of ["phone", "mobile"]) {
      const listRes = await fetch(
        `${base}/api/students?${param}=${encodeURIComponent(phone)}&limit=1`,
        { cache: "no-store" }
      )
      if (listRes.ok) {
        const list = await listRes.json().catch(() => ({}))
        const students = list.students ?? list.data ?? list ?? []
        const exists = Array.isArray(students) && students.length > 0
        return NextResponse.json({ exists })
      }
    }

    return NextResponse.json({ exists: false })
  } catch {
    return NextResponse.json({ exists: false })
  }
}
