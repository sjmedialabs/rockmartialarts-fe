"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getBackendApiUrl } from "@/lib/config"
import { TokenManager } from "@/lib/tokenManager"
import { X, Loader2 } from "lucide-react"

export interface AchievementFormData {
  title: string
  description: string
  images: string[]
  documents: string[]
}

interface AchievementFormProps {
  initialData?: Partial<AchievementFormData>
  onSubmit: (data: AchievementFormData) => Promise<void>
  onCancel: () => void
}

const ACCEPT_IMAGES = "image/jpeg,image/png,image/webp"
const ACCEPT_DOCS = "application/pdf"

export function AchievementForm({ initialData, onSubmit, onCancel }: AchievementFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "")
  const [description, setDescription] = useState(initialData?.description ?? "")
  const [images, setImages] = useState<string[]>(initialData?.images ?? [])
  const [documents, setDocuments] = useState<string[]>(initialData?.documents ?? [])
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)

  const handleFileUpload = async (
    file: File,
    type: "image" | "document",
    setUrls: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const token = TokenManager.getToken()
    if (!token) return
    setUploading(type)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch(getBackendApiUrl("uploads"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json()
      const url = data.file_url || data.url || ""
      if (url) setUrls((prev) => [...prev, url])
    } finally {
      setUploading(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), images, documents })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="achievement-title">Achievement Title *</Label>
        <Input
          id="achievement-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Gold medal in tournament"
          className="mt-1"
          required
        />
      </div>
      <div>
        <Label htmlFor="achievement-desc">Description</Label>
        <Textarea
          id="achievement-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the achievement"
          rows={3}
          className="mt-1"
        />
      </div>
      <div>
        <Label>Images (jpg, png, webp)</Label>
        <div className="mt-1 flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative inline-block">
              <img src={url.startsWith("/") ? url : url} alt="" className="h-20 w-20 object-cover rounded border" />
              <button
                type="button"
                onClick={() => setImages((p) => p.filter((_, j) => j !== i))}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <label className="flex items-center justify-center h-20 w-20 rounded border border-dashed cursor-pointer hover:bg-gray-50">
            <input
              type="file"
              accept={ACCEPT_IMAGES}
              className="hidden"
              disabled={!!uploading}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFileUpload(f, "image", setImages)
                e.target.value = ""
              }}
            />
            {uploading === "image" ? <Loader2 className="w-6 h-6 animate-spin" /> : "+"}
          </label>
        </div>
      </div>
      <div>
        <Label>Certificates / Documents (PDF)</Label>
        <div className="mt-1 flex flex-wrap gap-2 items-center">
          {documents.map((url, i) => (
            <span key={i} className="text-sm text-gray-600 flex items-center gap-1">
              <a href={url.startsWith("/") ? url : url} target="_blank" rel="noopener noreferrer" className="underline">
                Doc {i + 1}
              </a>
              <button
                type="button"
                onClick={() => setDocuments((p) => p.filter((_, j) => j !== i))}
                className="text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
          <label className="inline-flex items-center gap-2 px-3 py-2 border border-dashed rounded cursor-pointer hover:bg-gray-50 text-sm">
            <input
              type="file"
              accept={ACCEPT_DOCS}
              className="hidden"
              disabled={!!uploading}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFileUpload(f, "document", setDocuments)
                e.target.value = ""
              }}
            />
            {uploading === "document" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload PDF"}
          </label>
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={submitting || !title.trim()}>
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
