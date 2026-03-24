"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { stripUuidFromPriceDisplay } from "@/lib/priceDisplay"

export type CourseInfoModalCourse = {
  id: string
  title?: string
  name?: string
  code?: string
  description?: string
  difficulty_level?: string
}

type BranchInfoPayload = {
  branch_id?: string
  branch_name?: string
  duration?: string
  price_display?: string
  timings?: string
  fee_per_duration?: Record<string, number | string> | null
}

type DurationRow = { id: string; name?: string; code?: string }

function courseTitle(c: CourseInfoModalCourse | null): string {
  if (!c) return "Course"
  return (c.title ?? c.name ?? c.code ?? "Course").trim() || "Course"
}

function toNum(v: unknown): number | null {
  if (v == null) return null
  if (typeof v === "number" && !Number.isNaN(v)) return v
  if (typeof v === "string") {
    const n = parseFloat(String(v).replace(/[^\d.-]/g, ""))
    return Number.isNaN(n) ? null : n
  }
  return null
}

export function CourseInfoModal({
  open,
  onOpenChange,
  course,
  branchId,
  branchDisplayName,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: CourseInfoModalCourse | null
  branchId: string
  branchDisplayName: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [branchInfo, setBranchInfo] = useState<BranchInfoPayload | null>(null)
  const [durations, setDurations] = useState<DurationRow[]>([])

  const courseId = course?.id ?? ""

  useEffect(() => {
    if (!open || !courseId || !branchId) {
      setBranchInfo(null)
      setError(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    setBranchInfo(null)

    const infoUrl = `/api/backend/courses/public/detail/${encodeURIComponent(courseId)}/branch-info?branch_id=${encodeURIComponent(branchId)}`
    const durUrl = `/api/backend/durations/public/all`

    Promise.all([
      fetch(infoUrl, { headers: { "Content-Type": "application/json" }, cache: "no-store" }),
      fetch(durUrl, { headers: { "Content-Type": "application/json" }, cache: "no-store" }),
    ])
      .then(async ([infoRes, durRes]) => {
        const durJson = durRes.ok ? await durRes.json().catch(() => ({})) : {}
        const durList = Array.isArray(durJson.durations) ? durJson.durations : []
        if (!cancelled) {
          setDurations(
            durList.map((d: { id?: string; name?: string; code?: string }) => ({
              id: d.id ?? "",
              name: d.name,
              code: d.code,
            }))
          )
        }

        const data = await infoRes.json().catch(() => ({}))
        if (!infoRes.ok) {
          const msg =
            typeof data?.detail === "string"
              ? data.detail
              : "Could not load details for this course at this branch."
          if (!cancelled) {
            setError(msg)
            setBranchInfo(null)
          }
          return
        }
        if (!cancelled) setBranchInfo(data as BranchInfoPayload)
      })
      .catch(() => {
        if (!cancelled) {
          setError("Something went wrong. Please try again.")
          setBranchInfo(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, courseId, branchId])

  const durationLabelMap = useMemo(() => {
    const m = new Map<string, string>()
    for (const d of durations) {
      if (!d.id) continue
      const label = (d.name || d.code || d.id).trim()
      m.set(d.id, label)
      if (d.code) m.set(d.code, label)
    }
    return m
  }, [durations])

  const feeRows = useMemo(() => {
    const raw = branchInfo?.fee_per_duration
    if (!raw || typeof raw !== "object") return [] as { label: string; amount: string }[]
    const rows: { label: string; amount: string }[] = []
    let anon = 0
    for (const [key, val] of Object.entries(raw)) {
      const n = toNum(val)
      if (n == null) continue
      const mapped = durationLabelMap.get(key)
      anon += 1
      const label = mapped || `Tenure option ${anon}`
      rows.push({
        label,
        amount: `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
      })
    }
    return rows
  }, [branchInfo?.fee_per_duration, durationLabelMap])

  const timingsText = (branchInfo?.timings ?? "").trim()
  const showTimingsPlaceholder =
    !loading && !error && (!timingsText || timingsText === "—")

  const priceMain = branchInfo?.price_display?.trim() ?? ""
  const hasPriceMain = Boolean(priceMain && priceMain !== "—")

  const branchNameResolved =
    (branchInfo?.branch_name?.trim() || branchDisplayName || "This branch").trim()
  const durationLine = (branchInfo?.duration ?? "").trim()
  const showDuration = durationLine && durationLine !== "—"

  const enrollHref = "/register"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-h-[min(90vh,640px)] overflow-y-auto border-gray-800 bg-[#171A26] p-6 text-gray-200 sm:max-w-lg data-[state=open]:duration-200"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-1 pr-8 text-left">
          <DialogTitle className="text-xl font-bold text-white">
            {courseTitle(course)}
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-sm">
            {branchNameResolved}
          </DialogDescription>
        </DialogHeader>

        {course?.description ? (
          <p className="text-sm text-gray-400 line-clamp-4">{course.description}</p>
        ) : null}

        {course?.difficulty_level ? (
          <p className="text-xs uppercase tracking-wide text-[#FFB70F]">
            Level: {course.difficulty_level}
          </p>
        ) : null}

        <div className="space-y-4 border-t border-gray-800 pt-4">
          {loading && (
            <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
              <Loader2 className="h-5 w-5 animate-spin text-[#FFB70F]" />
              <span>Loading branch details…</span>
            </div>
          )}

          {error && !loading && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-900/60 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {!loading && !error && (
            <>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Branch
                </h4>
                <p className="text-sm text-white">{branchNameResolved}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Timings
                </h4>
                {showTimingsPlaceholder ? (
                  <p className="text-sm text-gray-400">Timings will be updated soon.</p>
                ) : (
                  <p className="text-sm text-gray-200 whitespace-pre-wrap">{timingsText}</p>
                )}
              </div>

              {showDuration && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                    Duration
                  </h4>
                  <p className="text-sm text-gray-200">{durationLine}</p>
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Fees
                </h4>
                {feeRows.length > 0 ? (
                  <ul className="space-y-1.5 text-sm text-gray-300">
                    {feeRows.map((row, i) => (
                      <li
                        key={i}
                        className="flex justify-between gap-4 border-b border-gray-800/80 pb-1.5 last:border-0"
                      >
                        <span className="text-gray-400">{row.label}</span>
                        <span className="font-medium text-white tabular-nums">{row.amount}</span>
                      </li>
                    ))}
                  </ul>
                ) : hasPriceMain ? (
                  <p className="text-lg font-semibold text-[#FFB70F]">
                    {stripUuidFromPriceDisplay(priceMain)}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">Contact us for fee details.</p>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col border-t border-gray-800 pt-4">
          <Button
            asChild
            className="w-full bg-[#FFB70F] text-[#171A26] hover:bg-[#FFB70F]/90 font-semibold"
          >
            <Link href={enrollHref} onClick={() => onOpenChange(false)}>
              Enroll Now
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full text-gray-400 hover:text-white hover:bg-gray-800"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
