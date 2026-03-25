"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ChevronDown, GraduationCap, Loader2 } from "lucide-react"

export type CourseItem = {
  id: string
  title?: string
  name?: string
  code?: string
}

function toCourseSlug(c: CourseItem): string {
  const raw = (c.code ?? c.title ?? c.name ?? c.id ?? "").toString().trim()
  return raw.toLowerCase().replace(/\s+/g, "-").replace(/_/g, "-").replace(/[^a-z0-9-]/g, "") || "course"
}

type CoursesNavDropdownProps = {
  variant?: "desktop" | "mobile"
  onNavigate?: () => void
}

export function CoursesNavDropdown({ variant = "desktop", onNavigate }: CoursesNavDropdownProps) {
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const isMobile = variant === "mobile"

  const fetchCourses = async () => {
    if (courses.length > 0) return
    setLoading(true)
    try {
      const res = await fetch("/api/backend/courses/public/all", { headers: { "Content-Type": "application/json" } })
      const data = await res.json().catch(() => ({}))
      const list = data.courses ?? data ?? []
      setCourses(Array.isArray(list) ? list : [])
    } catch {
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) fetchCourses()
  }, [open])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const displayName = (c: CourseItem) => c.title || c.name || c.code || "Course"

  return (
    <div ref={ref} className={isMobile ? "w-full" : "relative"}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={isMobile ? undefined : () => setOpen(true)}
        className={
          isMobile
            ? "flex w-full items-center justify-between text-lg font-medium uppercase tracking-wide text-white py-2 hover:text-[#FFB70F] transition-colors"
            : "flex items-center gap-1 text-sm font-medium uppercase tracking-wide text-white hover:text-[#FFB70F] transition-colors"
        }
        aria-expanded={open}
        aria-haspopup="true"
      >
        Courses
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className={
            isMobile
              ? "mt-2 w-full rounded-lg border border-gray-700 bg-[#171A26] py-2 shadow-xl z-50"
              : "absolute left-0 top-full mt-1 min-w-[240px] rounded-lg border border-gray-700 bg-[#171A26] py-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          }
          onMouseLeave={isMobile ? undefined : () => setOpen(false)}
        >
          <Link
            href="/courses"
            onClick={() => {
              setOpen(false)
              onNavigate?.()
            }}
            className="flex items-center gap-2 px-4 py-3 hover:bg-white/10 transition-colors text-left border-b border-gray-700"
          >
            <GraduationCap className="h-4 w-4 text-[#FFB70F] flex-shrink-0" />
            <span className="font-medium text-white">View all courses</span>
          </Link>
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading courses...</span>
            </div>
          ) : courses.length === 0 ? (
            <div className="px-4 py-4 text-center text-gray-400 text-sm">
              No courses available
            </div>
          ) : (
            <ul className="max-h-[70vh] overflow-y-auto">
              {courses.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/courses/${toCourseSlug(c)}`}
                    onClick={() => {
                      setOpen(false)
                      onNavigate?.()
                    }}
                    className="flex items-start gap-2 px-4 py-3 hover:bg-white/10 transition-colors text-left"
                  >
                    <GraduationCap className="h-4 w-4 text-[#FFB70F] mt-0.5 flex-shrink-0" />
                    <span className="block font-medium text-white truncate">
                      {displayName(c)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
