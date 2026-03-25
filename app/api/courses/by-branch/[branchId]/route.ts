import { NextResponse } from "next/server"
import { getBackendProxyBaseUrl } from "@/lib/serverBackendUrl"

export async function GET(
  _req: Request,
  { params }: { params: { branchId: string } }
) {
  try {
    const branchId = params.branchId
    if (!branchId) {
      return NextResponse.json(
        { error: "Branch ID required" },
        { status: 400 }
      )
    }
    const base = getBackendProxyBaseUrl().replace(/\/$/, "")
    const url = `${base}/api/courses/public/by-branch/${branchId}`
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 60 },
    })
    if (!response.ok) {
      const text = await response.text()
      console.error("[courses-by-branch] backend error:", response.status, text)
      return NextResponse.json(
        { error: "Failed to fetch courses" },
        { status: response.status === 404 ? 404 : 502 }
      )
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[courses-by-branch] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    )
  }
}
