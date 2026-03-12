import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://127.0.0.1:8003"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const base = BACKEND_URL.replace(/\/$/, "")
    const res = await fetch(`${base}/api/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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

    if (!res.ok) {
      return NextResponse.json(
        typeof data === "object" && data !== null ? data : { error: "Failed to create lead" },
        { status: res.status }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[leads] error creating lead:", error)
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    )
  }
}

