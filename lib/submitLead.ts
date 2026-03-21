/**
 * Public lead capture (POST /api/leads via same-origin backend proxy).
 * Failures are logged; callers can still continue the registration flow.
 */
export async function submitLead(payload: {
  name: string
  email: string
  phone: string
  course?: string
  source?: string
}): Promise<boolean> {
  try {
    const res = await fetch("/api/backend/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        phone: payload.phone.trim(),
        course: (payload.course ?? "").trim(),
        source: payload.source?.trim() || undefined,
      }),
      cache: "no-store",
    })
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      console.error("[submitLead] API error", res.status, text)
      return false
    }
    return true
  } catch (e) {
    console.error("[submitLead] Network error", e)
    return false
  }
}
