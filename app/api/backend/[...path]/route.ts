import { NextRequest, NextResponse } from "next/server";

/* Allow up to 120 MB bodies (video uploads) */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function trimBase(v: string | undefined): string {
  return (v ?? "").trim().replace(/\/$/, "");
}

function isLocalhostUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

/**
 * Base URL for server-side `/api/backend/*` proxy only.
 * - Set `NEXT_SERVER_BACKEND_URL` to force any host (e.g. staging) for both dev and prod.
 * - In **development**, defaults to `http://127.0.0.1:8003` when env points at a remote
 *   host (common cause of `ConnectTimeoutError` to :8003 on a domain that is firewalled).
 * - In **production**, uses API_BASE_URL → NEXT_PUBLIC_API_BASE_URL → NEXT_PUBLIC_BACKEND_URL.
 */
function getBackendProxyBaseUrl(): string {
  const serverOnly = trimBase(process.env.NEXT_SERVER_BACKEND_URL);
  if (serverOnly) return serverOnly;

  const apiBase = trimBase(process.env.API_BASE_URL);
  const pubApi = trimBase(process.env.NEXT_PUBLIC_API_BASE_URL);
  const pubBackend = trimBase(process.env.NEXT_PUBLIC_BACKEND_URL);
  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    if (apiBase && isLocalhostUrl(apiBase)) return apiBase;
    if (pubBackend && isLocalhostUrl(pubBackend)) return pubBackend;
    if (pubApi && isLocalhostUrl(pubApi)) return pubApi;
    return "http://127.0.0.1:8003";
  }

  return (
    apiBase ||
    pubApi ||
    pubBackend ||
    "http://127.0.0.1:8003"
  );
}

const BACKEND_URL = getBackendProxyBaseUrl();

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
  const isCmsPublic = path === "cms/public";

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

      if (res.status >= 500 || res.status === 405) {
        console.error("[backend proxy] Backend returned", res.status, "for", method, url);
        console.error("[backend proxy] Response:", typeof data === "object" ? JSON.stringify(data) : data);
        if (res.status === 405) {
          console.error("[backend proxy] 405 Method Not Allowed: ensure the backend at", BACKEND_URL, "has the route", method, "/api/" + path);
        }
      }

      return NextResponse.json(data, {
        status: res.status,
        statusText: res.statusText,
        headers: {
          "Content-Type": "application/json",
          ...(isCmsPublic
            ? {
                // CMS must reflect changes immediately; prevent any caching layers.
                "Cache-Control": "no-store, max-age=0",
                Pragma: "no-cache",
              }
            : {}),
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
        ...(isCmsPublic
          ? {
              "Cache-Control": "no-store, max-age=0",
              Pragma: "no-cache",
            }
          : {}),
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
