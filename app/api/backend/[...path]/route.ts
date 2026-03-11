import { NextRequest, NextResponse } from "next/server";

/* Allow up to 120 MB bodies (video uploads) */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://127.0.0.1:8003";

/**
 * Proxy to the backend so the browser only talks to the same origin (avoids
 * "Cannot reach the server" when the backend is on another port or host).
 * Request to /api/backend/auth/login -> BACKEND_URL/api/auth/login
 */
async function proxy(request: NextRequest, pathSegments: string[]) {
  const path = pathSegments.join("/");
  const search = request.nextUrl.search; // preserve query string (?key=val&…)
  const url = `${BACKEND_URL.replace(/\/$/, "")}/api/${path}${search}`;
  const method = request.method;

  try {
    const headers: HeadersInit = {};
    request.headers.forEach((value, key) => {
      if (
        key.toLowerCase() !== "host" &&
        key.toLowerCase() !== "connection" &&
        key.toLowerCase() !== "content-length"
      ) {
        headers[key] = value;
      }
    });

    let body: BodyInit | undefined = undefined;
    if (method !== "GET" && method !== "HEAD") {
      const contentType = request.headers.get("content-type") || "";
      if (
        contentType.includes("multipart/form-data") ||
        contentType.includes("application/octet-stream")
      ) {
        // Binary upload — forward raw bytes
        body = Buffer.from(await request.arrayBuffer());
      } else {
        // JSON / text
        body = await request.text();
      }
    }

    const res = await fetch(url, {
      method,
      headers,
      body,
    });

    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const text = await res.text();
      let data: unknown = text;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          // keep as text
        }
      }

      if (res.status >= 500) {
        console.error("[backend proxy] Backend returned", res.status, "for", method, url);
        console.error("[backend proxy] Response:", typeof data === "object" ? JSON.stringify(data) : data);
      }

      return NextResponse.json(data, {
        status: res.status,
        statusText: res.statusText,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Non-JSON response (binary, HTML, etc.) — stream it through
    const resBody = await res.arrayBuffer();
    return new NextResponse(resBody, {
      status: res.status,
      statusText: res.statusText,
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (err) {
    const isLocalhost =
      !BACKEND_URL || /^https?:\/\/127\.0\.0\.1|^https?:\/\/localhost/i.test(BACKEND_URL);
    const isProduction = process.env.NODE_ENV === "production";
    console.error("[backend proxy] fetch failed:", err);
    let detail: string;
    if (isProduction && isLocalhost) {
      detail =
        "Backend URL not configured. Set NEXT_PUBLIC_API_BASE_URL or API_BASE_URL to your API server URL in the deployment environment (e.g. Vercel Environment Variables).";
    } else if (isProduction) {
      detail = "Service temporarily unavailable. Please try again later.";
    } else {
      detail =
        "Cannot reach the backend at " +
        BACKEND_URL +
        ". Is it running? Error: " +
        (err instanceof Error ? err.message : String(err));
    }
    return NextResponse.json({ detail }, { status: 502 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(request, path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(request, path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(request, path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(request, path);
}
