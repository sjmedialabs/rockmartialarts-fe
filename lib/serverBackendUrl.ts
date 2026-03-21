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
