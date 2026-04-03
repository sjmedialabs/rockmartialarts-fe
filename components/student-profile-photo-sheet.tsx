"use client"

import { useRef, useState, useCallback } from "react"
import { Camera, ImageUp, Loader2 } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { studentProfileAPI } from "@/lib/studentProfileAPI"
import { cn } from "@/lib/utils"

const MAX_BYTES = 2 * 1024 * 1024

function validateImageFile(file: File): string | null {
  const okType = file.type === "image/jpeg" || file.type === "image/png"
  if (!okType) return "Please choose a JPG or PNG image."
  if (file.size > MAX_BYTES) return "Image must be 2 MB or smaller."
  return null
}

export function StudentProfilePhotoSheet(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentImageSrc: string
  fallbackLetter: string
  token: string
  onSaved: (profileImageUrl: string) => void
}) {
  const { open, onOpenChange, currentImageSrc, fallbackLetter, token, onSaved } = props
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const resetPreview = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev)
      return null
    })
    setPendingFile(null)
    setError(null)
    if (galleryInputRef.current) galleryInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }, [])

  const handleFileChosen = (file: File | null) => {
    setError(null)
    if (!file) return
    const msg = validateImageFile(file)
    if (msg) {
      setError(msg)
      return
    }
    setPendingFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) resetPreview()
    onOpenChange(next)
  }

  const handleSave = async () => {
    if (!pendingFile) {
      setError("Select a photo first.")
      return
    }
    setUploading(true)
    setError(null)
    try {
      const { profile_image } = await studentProfileAPI.uploadProfilePhoto(pendingFile, token)
      onSaved(profile_image)
      handleOpenChange(false)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Upload failed. Please try again."
      setError(message)
    } finally {
      setUploading(false)
    }
  }

  const displaySrc = previewUrl || currentImageSrc

  return (
    <>
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={(e) => handleFileChosen(e.target.files?.[0] ?? null)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileChosen(e.target.files?.[0] ?? null)}
      />

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle>Profile photo</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col items-center gap-4 py-2">
            {error && (
              <Alert variant="destructive" className="w-full">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div
              className={cn(
                "relative h-40 w-40 overflow-hidden rounded-full border-4 border-muted bg-muted",
                "shadow-md"
              )}
            >
              {displaySrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={displaySrc} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-muted-foreground">
                  {fallbackLetter}
                </div>
              )}
            </div>

            <div className="grid w-full max-w-sm grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                className="h-12 justify-center gap-2"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploading}
              >
                <ImageUp className="h-5 w-5" />
                Upload from device
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-12 justify-center gap-2"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploading}
              >
                <Camera className="h-5 w-5" />
                Take photo
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground px-2">
              JPG or PNG, up to 2 MB. Preview before saving.
            </p>

            <div className="flex w-full max-w-sm flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                className="sm:flex-1"
                onClick={() => handleOpenChange(false)}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="sm:flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleSave}
                disabled={!pendingFile || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save photo"
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
