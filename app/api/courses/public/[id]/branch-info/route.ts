import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8003"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const courseId = (await params).id
  const branchId = request.nextUrl.searchParams.get("branch_id")
  if (!courseId || !branchId) {
    return NextResponse.json(
      { error: "course id and branch_id are required" },
      { status: 400 }
    )
  }
  const base = BACKEND_URL.replace(/\/$/, "")
  const res = await fetch(
    `${base}/api/courses/public/detail/${courseId}/branch-info?branch_id=${encodeURIComponent(branchId)}`,
    { headers: { "Content-Type": "application/json" }, cache: "no-store" }
  )
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
