"use client"

import { useRef, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PerformanceProfile } from "@/lib/student-performance-types"
import { Camera, Loader2, User } from "lucide-react"
import { getBackendApiUrl } from "@/lib/config"
import { toast } from "sonner"

function fmtJoin(d?: string | null) {
  if (!d) return "—"
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  } catch {
    return String(d)
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token") || localStorage.getItem("access_token") || null
}

const PHOTO_STORAGE_KEY = "student_profile_photos"

function getSavedPhoto(studentId: string): string | null {
  try {
    const map = JSON.parse(localStorage.getItem(PHOTO_STORAGE_KEY) || "{}")
    return map[studentId] || null
  } catch {
    return null
  }
}

function savePhoto(studentId: string, url: string) {
  try {
    const map = JSON.parse(localStorage.getItem(PHOTO_STORAGE_KEY) || "{}")
    map[studentId] = url
    localStorage.setItem(PHOTO_STORAGE_KEY, JSON.stringify(map))
  } catch {}
}

/**
 * Upload the photo file and return the persisted image URL.
 *
 * Strategy:
 *  1. POST /api/auth/profile/photo  — works when the logged-in user IS the student.
 *  2. POST /api/uploads             — general upload (admin-level); then PATCH the
 *     student profile with the returned URL.
 */
async function uploadPhoto(
  file: File,
  token: string,
  studentId: string | null
): Promise<string> {
  const form = () => {
    const f = new FormData()
    f.append("file", file)
    return f
  }

  // Attempt 1 – student self-upload endpoint
  const selfRes = await fetch(getBackendApiUrl("auth/profile/photo"), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form(),
  })

  if (selfRes.ok) {
    const d = await selfRes.json().catch(() => ({}))
    const url = d.profile_image || d.url || d.file_url || d.path || ""
    if (url) return url
  }

  // Attempt 2 – general uploads endpoint (admin)
  const uploadRes = await fetch(getBackendApiUrl("uploads"), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form(),
  })

  if (!uploadRes.ok) {
    const d = await uploadRes.json().catch(() => ({}))
    throw new Error(d.detail || d.message || `Upload failed (${uploadRes.status})`)
  }

  const uploadData = await uploadRes.json()
  const imageUrl: string = uploadData.url || uploadData.file_url || uploadData.path || ""

  if (!imageUrl) {
    throw new Error("Upload succeeded but no URL was returned")
  }

  // Best-effort: persist url to student profile on backend
  if (studentId) {
    await fetch(getBackendApiUrl(`student/profile/${encodeURIComponent(studentId)}`), {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ profile_image: imageUrl }),
    }).catch(() => {})
  }

  return imageUrl
}

export function ProfileCard({
  profile,
  studentId,
  onPhotoUpdated,
}: {
  profile: PerformanceProfile
  studentId?: string | null
  onPhotoUpdated?: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [localImage, setLocalImage] = useState<string | null>(null)

  useEffect(() => {
    if (studentId) {
      const saved = getSavedPhoto(studentId)
      if (saved) setLocalImage(saved)
    }
  }, [studentId])

  const displayImage = localImage || profile.profile_image || null
  const initials = (profile.name || "?").charAt(0).toUpperCase()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be 2 MB or smaller."); return }
    if (file.type !== "image/jpeg" && file.type !== "image/png") { toast.error("Please choose a JPG or PNG image."); return }

    const token = getToken()
    if (!token) { toast.error("Please log in again."); return }

    setUploading(true)
    try {
      const imageUrl = await uploadPhoto(file, token, studentId ?? null)
      if (studentId) savePhoto(studentId, imageUrl)
      setLocalImage(imageUrl)
      toast.success("Profile photo updated")
      onPhotoUpdated?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  return (
    <Card className="border-amber-200/60 shadow-sm bg-gradient-to-br from-white to-amber-50/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
          <User className="h-5 w-5 text-amber-600" />
          Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="relative group shrink-0">
            <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-amber-200 bg-amber-50 flex items-center justify-center">
              {displayImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={displayImage} alt={profile.name || ""} className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-amber-600">{initials}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md hover:bg-amber-600 transition-colors disabled:opacity-50"
              title="Change photo"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFileChange} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 text-sm text-slate-700 flex-1 min-w-0">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Name</p>
              <p className="font-semibold text-base text-slate-900">{profile.name || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Level / Belt</p>
              <p className="font-medium">{profile.level_or_belt || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Branch</p>
              <p className="font-medium">{profile.branch || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Martial art</p>
              <p className="font-medium">{profile.martial_art || "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Date of joining</p>
              <p className="font-medium">{fmtJoin(profile.date_of_joining)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Coach</p>
              <p className="font-medium">{profile.coach || "—"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
