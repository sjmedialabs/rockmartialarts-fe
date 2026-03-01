import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://127.0.0.1:8003";

/**
 * Proxy to the backend so the browser only talks to the same origin (avoids
 * "Cannot reach the server" when the backend is on another port or host).
 * Request to /api/backend/auth/login -> BACKEND_URL/api/auth/login
 */
async function proxy(request: NextRequest, pathSegments: string[]) {
  const path = pathSegments.join("/");
  const url = `${BACKEND_URL.replace(/\/$/, "")}/api/${path}`;
  const method = request.method;

  try {
    const headers: HeadersInit = {};
    request.headers.forEach((value, key) => {
      if (
        key.toLowerCase() !== "host" &&
        key.toLowerCase() !== "connection"
      ) {
        headers[key] = value;
      }
    });

    const body =
      method !== "GET" && method !== "HEAD"
        ? await request.text()
        : undefined;

    const res = await fetch(url, {
      method,
      headers,
      body: body || undefined,
    });

    const text = await res.text();
    let data: unknown = text;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json") && text) {
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
        "Content-Type": res.headers.get("content-type") || "application/json",
      },
    });
  } catch (err) {
    console.error("[backend proxy] fetch failed:", err);
    return NextResponse.json(
      {
        detail:
          "Cannot reach the backend at " +
          BACKEND_URL +
          ". Is it running? Error: " +
          (err instanceof Error ? err.message : String(err)),
      },
      { status: 502 }
    );
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
