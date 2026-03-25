import { NextRequest, NextResponse } from "next/server"
import { getBackendProxyBaseUrl } from "@/lib/serverBackendUrl"

/** Proxies to FastAPI POST /api/reg-checkout/create-order (Razorpay order + payment row). */
export async function POST(req: NextRequest) {
  const base = getBackendProxyBaseUrl().replace(/\/$/, "")
  const body = await req.text()
  const res = await fetch(`${base}/api/reg-checkout/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    cache: "no-store",
  })
  const text = await res.text()
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") || "application/json",
    },
  })
}
