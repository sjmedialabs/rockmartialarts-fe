function trimBase(v: string | undefined): string {
  return (v ?? "").trim().replace(/\/$/, "")
}

/**
 * Base URL for `/api/backend/*` server proxy — **same in dev and prod**.
 *
 * Order: `NEXT_SERVER_BACKEND_URL` → `API_BASE_URL` → `NEXT_PUBLIC_API_BASE_URL` →
 * `NEXT_PUBLIC_BACKEND_URL` → `http://127.0.0.1:8003` if nothing is set.
 *
 * Set `NEXT_SERVER_BACKEND_URL` (or the public URLs) to your **production** API so
 * local `npm run dev` uses the live backend and database.
 *
 * **Important:** Your *marketing* domain may be a Next.js app. If `https://yoursite.com/api/auth/login`
 * returns an HTML page, that host is not your FastAPI server — use the real API origin (e.g.
 * `http://127.0.0.1:8003` in dev, or the host/port where `uvicorn` is bound).
 */
export function getBackendProxyBaseUrl(): string {
  const serverOnly = trimBase(process.env.NEXT_SERVER_BACKEND_URL)
  if (serverOnly) return serverOnly
  return (
    trimBase(process.env.API_BASE_URL) ||
    trimBase(process.env.NEXT_PUBLIC_API_BASE_URL) ||
    trimBase(process.env.NEXT_PUBLIC_BACKEND_URL) ||
    "http://127.0.0.1:8003"
  )
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
    return explicit.replace(/\/$/, "")
  }
  if (process.env.NODE_ENV === "development") {
    return "http://127.0.0.1:8003"
  }
  return (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8003").replace(/\/$/, "")
}

/** @deprecated Use getWebsiteBackendBaseUrl — same behavior */
export const getServerBackendBaseUrl = getWebsiteBackendBaseUrl
