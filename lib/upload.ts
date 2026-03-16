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
    // Try to surface the backend error message clearly (JSON or plain text)
    let message = `Upload failed (${res.status})`
    try {
      const data = await res.json()
      if (data && typeof data === "object") {
        message = (data.detail as string) || (data.message as string) || message
      }
    } catch {
      try {
        const text = await res.text()
        if (text) message = text
      } catch {
        // ignore, keep default message
      }
    }
    throw new Error(message)
  }

  const data = await res.json()
  return {
    file_url: data.file_url,
    filename: data.filename,
    content_type: data.content_type,
    size: data.size,
  }
}
