function trimBase(v: string | undefined): string {
  return (v ?? "").trim().replace(/\/$/, "")
}

/**
 * FastAPI on the VPS listens on 127.0.0.1:8003 (not on the public hostname).
 * If env mistakenly uses `https://yoursite.com:8003` or `http://PUBLIC_IP:8003`, Node's
 * fetch to the proxy gets ECONNREFUSED — fix by always using loopback for co-located uvicorn.
 */
function normalizeFastapiLoopback(base: string): string {
  const t = trimBase(base)
  if (!t) return t
  try {
    const u = new URL(t)
    const port = u.port || (u.protocol === "https:" ? "443" : "80")
    const isLocalHost =
      u.hostname === "localhost" || u.hostname === "127.0.0.1" || u.hostname === "::1"
    if (port === "8003" && !isLocalHost) {
      console.warn(
        "[serverBackendUrl] Backend URL must be loopback for same-server FastAPI (uvicorn binds 127.0.0.1:8003). " +
          `Rewriting ${t} → http://127.0.0.1:8003`
      )
      return "http://127.0.0.1:8003"
    }
  } catch {
    /* ignore invalid URL */
  }
  return t
}

/**
 * Base URL for `/api/backend/*` server proxy — **same in dev and prod**.
 *
 * Order: `NEXT_SERVER_BACKEND_URL` → `API_BASE_URL` → `NEXT_PUBLIC_API_BASE_URL` →
 * `NEXT_PUBLIC_BACKEND_URL` → `http://127.0.0.1:8003` if nothing is set.
 *
 * **Production (Next + FastAPI on same VPS):** set `NEXT_SERVER_BACKEND_URL=http://127.0.0.1:8003`.
 * Do **not** use `https://yourdomain.com:8003` — port 8003 is not exposed on nginx; only loopback works.
 *
 * **Important:** Your *marketing* domain may be a Next.js app. If `https://yoursite.com/api/auth/login`
 * returns an HTML page, that host is not your FastAPI server — use the real API origin (e.g.
 * `http://127.0.0.1:8003` where `uvicorn` is bound).
 */
export function getBackendProxyBaseUrl(): string {
  const serverOnly = trimBase(process.env.NEXT_SERVER_BACKEND_URL)
  if (serverOnly) return normalizeFastapiLoopback(serverOnly)
  const resolved =
    trimBase(process.env.API_BASE_URL) ||
    trimBase(process.env.NEXT_PUBLIC_API_BASE_URL) ||
    trimBase(process.env.NEXT_PUBLIC_BACKEND_URL) ||
    "http://127.0.0.1:8003"
  return normalizeFastapiLoopback(resolved)
}

/**
 * Base URL for **public website** Next.js API routes (`/api/branches/public`, `/api/leads`).
 *
 * - Set `WEBSITE_BACKEND_URL`, `API_BASE_URL`, or `NEXT_PUBLIC_BACKEND_URL` to force a host.
 * - In **development**, if none of those are set, we default to `http://127.0.0.1:8003` so
 *   lead capture does not POST to production (old schema → 422) when only
 *   `NEXT_PUBLIC_API_BASE_URL` is set for the rest of the app.
 * - In **production**, uses `NEXT_PUBLIC_API_BASE_URL` (or localhost fallback).
 */
export function getWebsiteBackendBaseUrl(): string {
  const explicit =
    process.env.WEBSITE_BACKEND_URL?.trim() ||
    process.env.API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_BACKEND_URL?.trim()
  if (explicit) {
    return normalizeFastapiLoopback(explicit.replace(/\/$/, ""))
  }
  if (process.env.NODE_ENV === "development") {
    return "http://127.0.0.1:8003"
  }
  return normalizeFastapiLoopback(
    (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8003").replace(/\/$/, "")
  )
}

/** @deprecated Use getWebsiteBackendBaseUrl — same behavior */
export const getServerBackendBaseUrl = getWebsiteBackendBaseUrl
