/**
 * Turn FastAPI / Next error JSON into a single user-visible string.
 */
export function formatApiErrorPayload(data: unknown): string {
  if (!data || typeof data !== "object") {
    return "Something went wrong. Please try again."
  }
  const o = data as Record<string, unknown>
  const detail = o.detail

  if (typeof detail === "string" && detail.trim()) {
    return detail.trim()
  }

  if (Array.isArray(detail)) {
    const parts = detail.map((item) => {
      if (item && typeof item === "object") {
        const row = item as { msg?: unknown; loc?: unknown }
        const msg = typeof row.msg === "string" ? row.msg : ""
        const loc = Array.isArray(row.loc)
          ? row.loc
              .filter((x) => x !== "body" && typeof x === "string")
              .join(".")
          : ""
        if (loc && msg) return `${loc}: ${msg}`
        if (msg) return msg
      }
      return String(item)
    }).filter((s) => s && s !== "undefined")
    if (parts.length) return parts.join(" ")
  }

  if (typeof o.error === "string" && o.error.trim()) return o.error.trim()
  if (typeof o.message === "string" && o.message.trim()) return o.message.trim()

  return "Please check your details and try again."
}
