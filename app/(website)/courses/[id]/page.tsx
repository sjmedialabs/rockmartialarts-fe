"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  ArrowLeft,
  Loader2,
  Play,
  FileText,
  Image as ImageIcon,
  Video,
  Users,
  Target,
  Clock,
  IndianRupee,
  BookOpen,
  Shield,
} from "lucide-react"

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
function isUuid(s: string): boolean {
  return UUID_REGEX.test(s)
}

type DurationOption = { id: string; name: string; duration_months?: number; display_order?: number }

type CourseModule = {
  id?: string
  title?: string
  description?: string
  duration?: number
  duration_minutes?: number
  order?: number
  status?: string
  resourceUrl?: string
}

type CourseData = {
  id: string
  title?: string
  course_name?: string
  code?: string
  description?: string
  category_id?: string
  category?: string
  category_name?: string
  sub_category?: string
  sub_category_name?: string
  difficulty_level?: string
  duration?: string
  duration_name?: string
  max_students?: number
  min_age?: number
  max_age?: number
  prerequisites?: string[]
  syllabus?: string
  equipment_required?: string
  imageUrl?: string
  media_resources?: { course_image_url?: string; promo_video_url?: string }
  videoUrl?: string
  fee_per_duration?: Record<string, number | string>
  pricing?: { currency?: string; branch_specific_pricing?: boolean }
  branch_specific_pricing?: boolean
  curriculum?: CourseModule[]
  modules?: CourseModule[]
  durations?: DurationOption[]
  available_durations?: DurationOption[]
}

function getTitle(c: CourseData) {
  return c.title || c.course_name || "Course"
}

function getImageUrl(c: CourseData) {
  return c.imageUrl || c.media_resources?.course_image_url || ""
}

function getVideoUrl(c: CourseData) {
  return c.videoUrl || c.media_resources?.promo_video_url || ""
}

function formatFees(feePerDuration: Record<string, number | string> | undefined, durations?: DurationOption[]): { label: string; value: string }[] {
  if (!feePerDuration || Object.keys(feePerDuration).length === 0) return []
  const entries = Object.entries(feePerDuration).filter(([, v]) => v != null && String(v).trim() !== "")
  return entries.map(([key, value], index) => {
    const duration = durations?.find((d) => d.id === key)
    let label: string
    if (duration) {
      if (duration.duration_months != null) {
        label = duration.duration_months === 1 ? "1 Month" : `${duration.duration_months} Months`
      } else {
        label = duration.name
      }
    } else {
      label = isUuid(key) ? `Option ${index + 1}` : key
    }
    return { label, value: `₹${value}` }
  })
}

/** Resolve duration for display: never show raw UUID. Prefer tenure (e.g. "3 Months"), then name, else "—". */
function getDurationLabel(course: CourseData): string {
  const raw = course.duration_name || course.duration
  const opts = course.durations ?? course.available_durations ?? []
  if (!raw) return "—"
  if (isUuid(raw) && opts.length) {
    const d = opts.find((x) => x.id === raw)
    if (d) {
      if (d.duration_months != null) return d.duration_months === 1 ? "1 Month" : `${d.duration_months} Months`
      return d.name
    }
    return "—"
  }
  if (isUuid(raw)) return "—"
  return raw
}

function SectionHeader({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <div className="text-center mb-10">
      <div className="w-16 h-1 bg-[#FFB70F] mx-auto mb-4" />
      <p className="text-[#FFB70F] uppercase tracking-widest text-sm mb-2">{subtitle}</p>
      <h2 className="text-2xl md:text-3xl font-bold text-[#FFB70F]">{title}</h2>
    </div>
  )
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [course, setCourse] = useState<CourseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    fetch(`/api/courses/public/${id}`, { headers: { "Content-Type": "application/json" } })
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? "Course not found" : "Failed to load course")
        return res.json()
      })
      .then((data) => {
        setCourse(data)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load course")
        setCourse(null)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#171A26] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-white">
          <Loader2 className="w-10 h-10 animate-spin text-[#FFB70F]" />
          <p className="text-gray-400">Loading course...</p>
        </div>
      </main>
    )
  }

  if (error || !course) {
    return (
      <main className="min-h-screen bg-[#171A26] flex items-center justify-center px-4">
        <div className="text-center text-white max-w-md">
          <p className="text-red-300 mb-6 text-lg">{error || "Course not found."}</p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 rounded-lg bg-[#FFB70F] px-6 py-3 text-black font-semibold hover:bg-[#F73322] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </Link>
        </div>
      </main>
    )
  }

  const title = getTitle(course)
  const imageUrl = getImageUrl(course)
  const videoUrl = getVideoUrl(course)
  const modules = course.curriculum ?? course.modules ?? []
  const durationOptions = course.durations ?? course.available_durations ?? []
  const feeEntries = formatFees(course.fee_per_duration, durationOptions)
  const branchSpecific = course.pricing?.branch_specific_pricing ?? course.branch_specific_pricing ?? false
  const durationLabel = getDurationLabel(course)

  return (
    <main className="min-h-screen bg-[#171A26] text-gray-300">
      {/* Hero with back */}
      <section className="relative pt-6 pb-4 border-b border-gray-800">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{title}</h1>
            <button
              type="button"
              onClick={() => router.push("/courses")}
              className="inline-flex items-center gap-2 text-[#FFB70F] hover:text-white font-medium transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Courses
            </button>
          </div>
        </div>
      </section>

      {/* Info strip - like home/courses page */}
      <section className="bg-[#F73322] py-6 border-y border-[#F73322]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
            <div className="flex items-center gap-3 text-white">
              <Clock className="w-8 h-8 flex-shrink-0 opacity-90" />
              <div>
                <p className="text-white/90 text-xs uppercase">Course Duration</p>
                <p className="font-semibold text-lg">{durationLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white">
              <Target className="w-8 h-8 flex-shrink-0 opacity-90" />
              <div>
                <p className="text-white/90 text-xs uppercase">Difficulty</p>
                <p className="font-semibold text-lg">{course.difficulty_level || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white">
              <Users className="w-8 h-8 flex-shrink-0 opacity-90" />
              <div>
                <p className="text-white/90 text-xs uppercase">Age Range</p>
                <p className="font-semibold text-lg">
                  {course.min_age != null || course.max_age != null
                    ? `${course.min_age ?? "—"} – ${course.max_age ?? "—"} years`
                    : "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white">
              <IndianRupee className="w-8 h-8 flex-shrink-0 opacity-90" />
              <div>
                <p className="text-white/90 text-xs uppercase">Pricing</p>
                <p className="font-semibold text-lg">
                  {feeEntries.length > 0 ? feeEntries.map((f) => `${f.label} ${f.value}`).join(" · ") : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl space-y-16">
        {/* Media & Resources */}
        <section>
          <SectionHeader subtitle="Media & Resources" title="Course visuals" />
          <div className="rounded-xl overflow-hidden border border-gray-800 bg-gray-900/50">
            {imageUrl ? (
              <div className="relative aspect-video bg-gray-900 group">
                <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                {videoUrl && (
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black/50 group-hover:bg-black/40 transition-colors"
                  >
                    <span className="w-20 h-20 rounded-full bg-[#FFB70F] flex items-center justify-center text-black shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 ml-1" />
                    </span>
                  </a>
                )}
              </div>
            ) : videoUrl ? (
              <div className="aspect-video bg-gray-900 flex items-center justify-center p-8">
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 rounded-xl bg-[#FFB70F] px-8 py-4 text-black font-semibold hover:bg-[#F73322] hover:text-white transition-colors"
                >
                  <Video className="w-6 h-6" /> Watch promotional video
                </a>
              </div>
            ) : (
              <div className="aspect-video bg-gray-900 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <ImageIcon className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>No media added yet</p>
                </div>
              </div>
            )}
            <div className="p-4 md:p-6 flex flex-wrap gap-4 border-t border-gray-800">
              {imageUrl && (
                <span className="inline-flex items-center gap-2 text-sm text-gray-400">
                  <ImageIcon className="w-4 h-4 text-[#FFB70F]" /> Course image
                </span>
              )}
              {videoUrl && (
                <span className="inline-flex items-center gap-2 text-sm text-gray-400">
                  <Video className="w-4 h-4 text-[#FFB70F]" /> Promo video available
                </span>
              )}
            </div>
          </div>
        </section>

        {/* At a glance: Difficulty, Duration, Student requirements, Pricing */}
        <section>
          <SectionHeader subtitle="At a glance" title="Key details" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-6 h-6 text-[#FFB70F]" />
                <h3 className="text-lg font-bold text-[#FFB70F]">Difficulty level</h3>
              </div>
              <p className="text-white font-medium">{course.difficulty_level || "—"}</p>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-6 h-6 text-[#FFB70F]" />
                <h3 className="text-lg font-bold text-[#FFB70F]">Course duration</h3>
              </div>
              <p className="text-white font-medium">{durationLabel}</p>
            </div>
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-6 h-6 text-[#FFB70F]" />
                <h3 className="text-lg font-bold text-[#FFB70F]">Student requirements</h3>
              </div>
              <ul className="space-y-1 text-gray-300">
                <li>Max students: <span className="text-white">{course.max_students ?? "—"}</span></li>
                <li>Age: <span className="text-white">{course.min_age ?? "—"} – {course.max_age ?? "—"} years</span></li>
                {course.prerequisites && course.prerequisites.length > 0 && (
                  <li>Prerequisites: {course.prerequisites.length} item(s)</li>
                )}
              </ul>
            </div>
          </div>
        </section>

        {/* Pricing & Availability */}
        <section>
          <SectionHeader subtitle="Pricing & availability" title="Fees and options" />
          <div className="bg-gray-900/50 rounded-xl p-6 md:p-8 border border-gray-800">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <IndianRupee className="w-8 h-8 text-[#FFB70F]" />
              <h3 className="text-xl font-bold text-[#FFB70F]">Course fees (INR)</h3>
            </div>
            {feeEntries.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {feeEntries.map((f, i) => (
                  <div key={`fee-${i}`} className="bg-[#171A26] rounded-lg px-4 py-3 border border-gray-700">
                    <p className="text-gray-400 text-sm">{f.label}</p>
                    <p className="text-xl font-bold text-white">{f.value}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">Fees to be announced.</p>
            )}
            <p className="mt-4 text-sm text-gray-400">
              Branch-specific pricing: <span className="text-white font-medium">{branchSpecific ? "Yes" : "No"}</span>
            </p>
          </div>
        </section>

        {/* Course Content: Description, Syllabus, Equipment */}
        <section>
          <SectionHeader subtitle="Course content" title="What you&apos;ll learn" />
          <div className="space-y-6">
            {course.description && (
              <div className="bg-gray-900/50 rounded-xl p-6 md:p-8 border border-gray-800">
                <h3 className="text-lg font-bold text-[#FFB70F] mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" /> Description
                </h3>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{course.description}</p>
              </div>
            )}
            {course.syllabus && (
              <div className="bg-gray-900/50 rounded-xl p-6 md:p-8 border border-gray-800">
                <h3 className="text-lg font-bold text-[#FFB70F] mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Course syllabus
                </h3>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{course.syllabus}</p>
              </div>
            )}
            {course.equipment_required && (
              <div className="bg-gray-900/50 rounded-xl p-6 md:p-8 border border-gray-800">
                <h3 className="text-lg font-bold text-[#FFB70F] mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" /> Equipment required
                </h3>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{course.equipment_required}</p>
              </div>
            )}
          </div>
        </section>

        {/* Student requirements (detailed) */}
        {(course.max_students != null || course.min_age != null || course.max_age != null || (course.prerequisites && course.prerequisites.length > 0)) && (
          <section>
            <SectionHeader subtitle="Requirements" title="Student requirements" />
            <div className="bg-gray-900/50 rounded-xl p-6 md:p-8 border border-gray-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {course.max_students != null && (
                  <div>
                    <p className="text-[#FFB70F] text-sm font-semibold uppercase tracking-wide mb-1">Maximum students</p>
                    <p className="text-white text-lg font-medium">{course.max_students}</p>
                  </div>
                )}
                {(course.min_age != null || course.max_age != null) && (
                  <div>
                    <p className="text-[#FFB70F] text-sm font-semibold uppercase tracking-wide mb-1">Age range</p>
                    <p className="text-white text-lg font-medium">{course.min_age ?? "—"} – {course.max_age ?? "—"} years</p>
                  </div>
                )}
              </div>
              {course.prerequisites && course.prerequisites.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <p className="text-[#FFB70F] text-sm font-semibold uppercase tracking-wide mb-3">Prerequisites</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    {course.prerequisites.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Course curriculum / modules */}
        {modules.length > 0 && (
          <section>
            <SectionHeader subtitle="Curriculum" title={`Course modules (${modules.length})`} />
            <div className="space-y-4">
              {modules.map((mod, i) => (
                <div
                  key={mod.id ?? i}
                  className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 flex flex-col sm:flex-row sm:items-start gap-4"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#FFB70F]/20 flex items-center justify-center text-[#FFB70F] font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white">{mod.title || `Module ${i + 1}`}</h3>
                    {(mod.duration != null || mod.duration_minutes != null) && (
                      <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {mod.duration_minutes ?? mod.duration} min
                      </p>
                    )}
                    {mod.description && (
                      <p className="text-gray-400 mt-2 leading-relaxed">{mod.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="pt-8">
          <div className="text-center">
            <div className="w-16 h-1 bg-[#FFB70F] mx-auto mb-6" />
            <p className="text-gray-400 mb-6">Ready to join? Register and start your journey.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl bg-[#FFB70F] px-10 py-4 text-base font-bold text-black hover:bg-[#F73322] hover:text-white transition-colors shadow-lg"
              >
                Register for this course
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 text-[#FFB70F] hover:text-white font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> View all courses
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
