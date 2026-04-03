import { NextRequest, NextResponse } from "next/server"
import { getBackendProxyBaseUrl } from "@/lib/serverBackendUrl"

export async function GET(request: NextRequest) {
  const BACKEND_URL = getBackendProxyBaseUrl().replace(/\/$/, "")
  try {
    const limit = request.nextUrl.searchParams.get("limit") || "8"
    const response = await fetch(`${BACKEND_URL}/api/coaches/public/homepage?limit=${encodeURIComponent(limit)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in public homepage coaches API:", error)
    return NextResponse.json(
      { error: "Internal server error", message: "Failed to retrieve coaches" },
      { status: 500 }
    )
  }
}
