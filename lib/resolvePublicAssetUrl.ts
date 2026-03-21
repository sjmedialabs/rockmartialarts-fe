/**
 * Normalize CMS / upload URLs for `<img src>`, favicon href, etc.
 *
 * Values without a leading `/` are resolved by the browser relative to the *current path*,
 * so e.g. `logo.png` becomes `/courses/logo.png` on course detail — a different URL than on `/`.
 * This helper makes those values root-stable (or backend-absolute) everywhere.
 */
export function resolvePublicAssetUrl(url?: string | null): string {
  if (url == null) return ""
  const u = String(url).trim()
  if (!u) return ""
  if (u.startsWith("http://") || u.startsWith("https://")) return u
  if (u.startsWith("/")) return u
  // Stored as "uploads/images/..." without leading slash
  if (u.startsWith("uploads/")) return `/${u}`
  // Nested relative path (legacy / mis-saved)
  if (u.includes("/")) return `/uploads/${u.replace(/^\/+/, "")}`
  // Bare filename from upload API
  return `/api/backend/uploads/${encodeURIComponent(u)}`
}
