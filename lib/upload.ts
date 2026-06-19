import { TokenManager } from "@/lib/tokenManager"

export interface UploadResult {
  file_url: string
  filename: string
  content_type: string
  size: number
}

/**
 * Upload a file to the backend and return the public URL.
 * Uses the /api/backend/uploads proxy so the browser stays on the same origin.
 */
export async function uploadFile(file: File): Promise<UploadResult> {
  const token = TokenManager.getToken()
  const formData = new FormData()
  formData.append("file", file)

  const res = await fetch("/api/backend/uploads", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }))
    throw new Error(err.detail || err.message || `Upload failed (${res.status})`)
  }

  const data = await res.json()
  const file_url =
    data.file_url ??
    data.url ??
    data.image_url ??
    (typeof data.data === "object" && data.data !== null
      ? (data.data as Record<string, unknown>).file_url ??
        (data.data as Record<string, unknown>).url
      : undefined)

  if (typeof file_url !== "string" || !file_url.trim()) {
    throw new Error("Upload succeeded but no file URL was returned")
  }

  return {
    file_url: file_url.trim(),
    filename: data.filename ?? "",
    content_type: data.content_type ?? file.type,
    size: data.size ?? file.size,
  }
}

/** Normalize upload API JSON to a stored public path (e.g. /uploads/images/...) */
export function extractUploadUrl(data: Record<string, unknown>): string {
  const url = data.file_url ?? data.url ?? data.image_url
  return typeof url === "string" ? url.trim() : ""
}
