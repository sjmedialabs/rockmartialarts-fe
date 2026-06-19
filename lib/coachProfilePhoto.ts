import { getBackendApiUrl } from "@/lib/config"
import { TokenManager } from "@/lib/tokenManager"

/**
 * Persist coach profile_image_url immediately (minimal PUT — does not require full form save).
 */
export async function saveCoachProfilePhoto(
  coachId: string,
  profileImageUrl: string | null
): Promise<void> {
  const token = TokenManager.getToken()
  if (!token) {
    throw new Error("Authentication required. Please log in again.")
  }

  const res = await fetch(getBackendApiUrl(`coaches/${coachId}`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ profile_image_url: profileImageUrl }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to save profile photo" }))
    const detail = err.detail
    throw new Error(
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((e: { msg?: string }) => e.msg).filter(Boolean).join("; ")
          : "Failed to save profile photo"
    )
  }
}
