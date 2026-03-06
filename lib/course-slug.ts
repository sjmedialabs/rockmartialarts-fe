const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(str: string): boolean {
  return UUID_REGEX.test(str)
}

/**
 * Generate a URL-safe slug from course code or title for use in /courses/[slug].
 */
export function toCourseSlug(course: { code?: string; title?: string; name?: string; id?: string }): string {
  const raw = (course.code ?? course.title ?? course.name ?? course.id ?? "").toString().trim()
  return raw
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/_/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    || "course"
}

/**
 * Check if a course matches the given slug (for lookup).
 */
export function courseMatchesSlug(course: { code?: string; title?: string; name?: string; id?: string }, slug: string): boolean {
  const s = slug.toLowerCase()
  if (course.id && course.id.toLowerCase() === s) return true
  return toCourseSlug(course) === s
}
