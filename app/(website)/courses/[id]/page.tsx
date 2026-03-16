"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import {
  ArrowLeft,
  Loader2,
  Play,
  MapPin,
  Clock,
  IndianRupee,
  Calendar,
  Download,
  ChevronLeft,
  ChevronRight,
  Quote,
  Users,
  Trophy,
  Star,
} from "lucide-react"
import { stripUuidFromPriceDisplay } from "@/lib/priceDisplay"

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type AboutContentBlock = {
  title?: string
  description?: string
  bullet_points?: string[]
  image?: string
}

/** Dynamic course info section: 60% text + 40% image or 40% image + 60% text */
type CourseInfoSection = {
  layout: "text_left" | "image_left"
  title?: string
  content?: string
  bullet_points?: string[]
  image?: string
}

type PageContent = {
  hero_section?: { title?: string; subtitle?: string; description?: string; bullet_points?: string[]; hero_image?: string; cta_text?: string; cta_link?: string }
  course_info?: { location?: string; duration?: string; price?: string; training_time?: string }
  about_section?: { title?: string; description?: string; secondary_description?: string; image1?: string; image2?: string; content_blocks?: AboutContentBlock[] }
  course_info_sections?: CourseInfoSection[]
  benefits?: { title: string; description: string; icon?: string }[]
  learning_section?: { title?: string; description?: string; video_url?: string; thumbnail?: string }
  gallery_images?: string[]
  instructors?: { name: string; designation: string; bio?: string; photo?: string }[]
  testimonials?: { name: string; designation: string; text: string; photo?: string }[]
  pdf_attachments?: { title: string; file_url: string }[]
}

type CourseStatistics = {
  enrolled_count?: number
  branches_count?: number
  instructors_count?: number
}

type EnrolledStudent = {
  id: string
  first_name?: string
  last_name?: string
  full_name?: string
  photo?: string
}

type StudentAchievement = {
  id: string
  student_id: string
  student_name?: string
  title: string
  description?: string
  images?: string[]
  documents?: string[]
}

type CourseData = {
  id: string
  title?: string
  course_name?: string
  code?: string
  description?: string
  difficulty_level?: string
  page_content?: PageContent
  media_resources?: { course_image_url?: string; promo_video_url?: string }
  statistics?: CourseStatistics
  curriculum?: string[]
  enrolled_students?: EnrolledStudent[]
  student_reviews?: { name: string; designation?: string; text: string; photo?: string }[]
  student_achievements?: StudentAchievement[]
  branches_offering?: { id: string; name: string }[]
  [key: string]: any
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function SectionLabel({ sub, title }: { sub: string; title: string }) {
  return (
    <div className="text-center mb-10">
      <div className="w-16 h-1 bg-[#FFB70F] mx-auto mb-4" />
      <p className="text-[#F73322] uppercase tracking-[0.25em] text-sm font-semibold mb-2">{sub}</p>
      <h2 className="text-3xl md:text-4xl font-extrabold text-white uppercase" style={{ fontFamily: "'Oswald', sans-serif" }}>{title}</h2>
    </div>
  )
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?#]+)/)
  return m ? m[1] : null
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function CourseDetailPage() {
  const params = useParams()
  const slug = params.id as string
  const [course, setCourse] = useState<CourseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testimonialIdx, setTestimonialIdx] = useState(0)
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [branchInfo, setBranchInfo] = useState<{ duration: string; price_display: string; timings: string } | null>(null)
  const [branchInfoLoading, setBranchInfoLoading] = useState(false)

  const fetchBranchInfo = useCallback(async (courseId: string, branchId: string) => {
    setBranchInfoLoading(true)
    try {
      const res = await fetch(`/api/courses/public/${courseId}/branch-info?branch_id=${encodeURIComponent(branchId)}`)
      const data = await res.json().catch(() => ({}))
      if (data.duration != null || data.price_display != null || data.timings != null) {
        setBranchInfo({
          duration: data.duration ?? "—",
          price_display: data.price_display ?? "—",
          timings: data.timings ?? "—",
        })
      } else {
        setBranchInfo(null)
      }
    } catch {
      setBranchInfo(null)
    } finally {
      setBranchInfoLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    fetch(`/api/courses/public/${slug}`, { headers: { "Content-Type": "application/json" } })
      .then((res) => { if (!res.ok) throw new Error(res.status === 404 ? "Course not found" : "Failed to load"); return res.json() })
      .then(setCourse)
      .catch((e) => { setError(e.message); setCourse(null) })
      .finally(() => setLoading(false))
  }, [slug])

  useEffect(() => {
    if (!course?.id || !selectedBranchId) {
      if (!selectedBranchId) setBranchInfo(null)
      return
    }
    fetchBranchInfo(course.id, selectedBranchId)
  }, [course?.id, selectedBranchId, fetchBranchInfo])

  useEffect(() => {
    if (course?.branches_offering?.length && selectedBranchId === null) {
      setSelectedBranchId(course.branches_offering[0].id)
    }
  }, [course?.branches_offering, selectedBranchId])

  /* Loading / Error */
  if (loading) return <main className="min-h-screen bg-[#171A26] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#FFB70F]" /></main>
  if (error || !course) return (
    <main className="min-h-screen bg-[#171A26] flex items-center justify-center px-4">
      <div className="text-center text-white"><p className="text-red-300 mb-6 text-lg">{error || "Course not found."}</p>
        <Link href="/courses" className="inline-flex items-center gap-2 rounded-lg bg-[#FFB70F] px-6 py-3 text-black font-semibold hover:bg-[#F73322] hover:text-white transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Courses</Link>
      </div>
    </main>
  )

  const pc = course.page_content || {}
  const hero = pc.hero_section || {}
  const info = pc.course_info || {}
  const about = pc.about_section || {}
  const courseInfoSections = pc.course_info_sections || []
  const benefits = pc.benefits || []
  const learning = pc.learning_section || {}
  const gallery = pc.gallery_images || []
  const instructors = pc.instructors || []
  const testimonialsFromPage = pc.testimonials || []
  const reviews = course.student_reviews && course.student_reviews.length > 0 ? course.student_reviews : testimonialsFromPage
  const attachments = pc.pdf_attachments || []

  const courseTitle = hero.title || course.title || course.course_name || "Course"
  const heroImg = hero.hero_image || course.media_resources?.course_image_url || "/assets/img/banner.jpg"
  const branchesOffering = course.branches_offering || []
  const hasRedBar = branchesOffering.length > 0

  return (
    <main className="min-h-screen bg-[#171A26] text-gray-300">
      {/* ============ 1. HERO – show all admin-configured content (title, subtitle, description, bullets, image, CTA) ============ */}
      <section className="relative min-h-[70vh] flex items-end overflow-hidden" style={{ backgroundImage: `url(${heroImg})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        <div className="container relative z-10 mx-auto px-4 max-w-7xl pb-16 pt-32">
          {(hero.title || course.title || course.course_name) && (
            <h1 className="text-4xl md:text-6xl font-extrabold text-white uppercase leading-tight mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>
              {hero.title || course.title || course.course_name || "Course"}
            </h1>
          )}
          {hero.subtitle && <p className="text-lg md:text-xl text-gray-200 max-w-2xl mb-3">{hero.subtitle}</p>}
          {hero.description && <p className="text-gray-300 max-w-2xl mb-4">{hero.description}</p>}
          {hero.bullet_points && hero.bullet_points.length > 0 && (
            <ul className="text-gray-300 max-w-2xl mb-6 space-y-1 list-none">
              {hero.bullet_points.filter(Boolean).map((bp, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#FFB70F] font-bold shrink-0">&gt;&gt;</span>
                  <span>{bp}</span>
                </li>
              ))}
            </ul>
          )}
          {hero.cta_text && (
            <Link href={hero.cta_link || "/register"} className="inline-block rounded-lg bg-[#F73322] px-8 py-3.5 text-base font-bold text-white hover:bg-[#FFB70F] hover:text-black transition-colors">
              {hero.cta_text}
            </Link>
          )}
        </div>
      </section>

      {/* ============ 2. INFO BAR – dynamic (branch) when branches exist, else static course_info from admin ============
          NOTE: Timings are intentionally not displayed on the frontend (only duration & price). */}
      {hasRedBar && (
        <section className="bg-[#F73322]">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/20">
              <div className="flex items-center gap-3 py-5 px-4 text-white">
                <MapPin className="w-7 h-7 flex-shrink-0 opacity-90" />
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-white/80">Available in</p>
                  <select
                    value={selectedBranchId || ""}
                    onChange={(e) => setSelectedBranchId(e.target.value || null)}
                    className="w-full mt-0.5 bg-transparent border-none text-white font-bold text-lg cursor-pointer focus:ring-0 p-0"
                  >
                    {branchesOffering.map((b) => (
                      <option key={b.id} value={b.id} className="text-[#171A26]">{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 py-5 px-4 text-white">
                <Calendar className="w-7 h-7 flex-shrink-0 opacity-90" />
                <div><p className="text-[11px] uppercase tracking-wider text-white/80">Course Duration</p><p className="font-bold text-lg">{branchInfoLoading ? "..." : (branchInfo?.duration ?? "—")}</p></div>
              </div>
              <div className="flex items-center gap-3 py-5 px-4 text-white">
                <IndianRupee className="w-7 h-7 flex-shrink-0 opacity-90" />
                <div><p className="text-[11px] uppercase tracking-wider text-white/80">Price Details</p><p className="font-bold text-lg">{branchInfoLoading ? "..." : (branchInfo?.price_display ?? "—")}</p></div>
              </div>
              {/* Timings field is intentionally hidden from the public site */}
            </div>
          </div>
        </section>
      )}
      {/* Static course info bar (from admin Course Info Bar) when no branches or as fallback */}
      {!hasRedBar && (info.location || info.duration || info.price || info.training_time) && (
        <section className="bg-[#F73322]">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/20">
              {info.location && (
                <div className="flex items-center gap-3 py-5 px-4 text-white">
                  <MapPin className="w-7 h-7 flex-shrink-0 opacity-90" />
                  <div><p className="text-[11px] uppercase tracking-wider text-white/80">Available in</p><p className="font-bold text-lg">{info.location}</p></div>
                </div>
              )}
              {info.duration && (
                <div className="flex items-center gap-3 py-5 px-4 text-white">
                  <Calendar className="w-7 h-7 flex-shrink-0 opacity-90" />
                  <div><p className="text-[11px] uppercase tracking-wider text-white/80">Course Duration</p><p className="font-bold text-lg">{info.duration}</p></div>
                </div>
              )}
              {info.price && (
                <div className="flex items-center gap-3 py-5 px-4 text-white">
                  <IndianRupee className="w-7 h-7 flex-shrink-0 opacity-90" />
                  <div><p className="text-[11px] uppercase tracking-wider text-white/80">Price Details</p><p className="font-bold text-lg">{stripUuidFromPriceDisplay(info.price)}</p></div>
                </div>
              )}
              {/* Training time (timings) is intentionally hidden from the public site */}
            </div>
          </div>
        </section>
      )}

      {/* ============ 3. ABOUT COURSE (immediately below branch/info strip) ============ */}
      {(about.title || about.description || course.description || (about.content_blocks && about.content_blocks.length > 0) || about.image1 || about.image2) && (
        <section className="py-16 md:py-20 bg-white text-[#171A26]">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className={`grid grid-cols-1 gap-12 items-start ${(about.image1 || about.image2 || (about.content_blocks || []).some(b => b.image)) ? "lg:grid-cols-5" : ""}`}>
              <div className={about.image1 || about.image2 ? "lg:col-span-3" : ""}>
                <p className="text-[#F73322] uppercase tracking-[0.2em] text-sm font-semibold mb-2">About {courseTitle}</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[#171A26] uppercase mb-6" style={{ fontFamily: "'Oswald', sans-serif" }}>
                  {about.title || "Start Today and Change Your Life"}
                </h2>
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  {(about.description || course.description) && <p>{about.description || course.description}</p>}
                  {about.secondary_description && <p>{about.secondary_description}</p>}
                </div>
                {(about.content_blocks || []).map((block, idx) => (
                  <div key={idx} className="mt-10">
                    {block.title && (
                      <h3 className="text-xl md:text-2xl font-bold text-[#171A26] mb-3" style={{ fontFamily: "'Oswald', sans-serif" }}>
                        {block.title}
                      </h3>
                    )}
                    {block.description && <p className="text-gray-700 leading-relaxed mb-3">{block.description}</p>}
                    {block.bullet_points && block.bullet_points.length > 0 && (
                      <ul className="list-none space-y-2 mb-4">
                        {block.bullet_points.filter(Boolean).map((bp, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#FFB70F] font-bold shrink-0">&gt;&gt;</span>
                            <span className="text-gray-700">{bp}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {block.image && (
                      <div className="mt-4">
                        <img src={block.image} alt={block.title || ""} className="rounded-lg w-full max-w-md object-cover" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {(about.image1 || about.image2) && (
                <div className="lg:col-span-2 space-y-4">
                  {about.image1 && <img src={about.image1} alt="" className="rounded-lg w-full object-cover" />}
                  {about.image2 && <img src={about.image2} alt="" className="rounded-lg w-full object-cover" />}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============ 3a. COURSE INFO SECTIONS (60-40 / 40-60 alternating) ============ */}
      {courseInfoSections.length > 0 && (
        <section className="py-16 md:py-20 bg-white text-[#171A26]">
          <div className="container mx-auto px-4 max-w-7xl space-y-16">
            {courseInfoSections.map((sec, idx) => {
              const textLeft = sec.layout !== "image_left"
              return (
                <div key={idx} className={`grid grid-cols-1 gap-8 md:gap-12 items-center ${textLeft ? "md:grid-cols-5" : "md:grid-cols-5"}`}>
                  <div className={textLeft ? "md:col-span-3" : "md:col-span-3 md:order-2"}>
                    {sec.title && <h2 className="text-2xl md:text-3xl font-extrabold text-[#171A26] uppercase mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>{sec.title}</h2>}
                    {sec.content && <div className="text-gray-700 leading-relaxed whitespace-pre-line mb-4">{sec.content}</div>}
                    {sec.bullet_points && sec.bullet_points.length > 0 && (
                      <ul className="list-none space-y-2">
                        {sec.bullet_points.filter(Boolean).map((bp, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-[#FFB70F] font-bold shrink-0">&gt;&gt;</span>
                            <span className="text-gray-700">{bp}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className={textLeft ? "md:col-span-2" : "md:col-span-2 md:order-1"}>
                    {sec.image ? <img src={sec.image} alt={sec.title || ""} className="rounded-lg w-full object-cover" /> : <div className="w-full h-48 bg-gray-200 rounded-lg" />}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ============ CTA (Ready to Start Your Journey?) ============ */}
      <section className="py-12 bg-[#F73322]">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white uppercase mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>
            Ready to Start Your Journey?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={hero.cta_link || "/register"}
              className="inline-flex items-center justify-center rounded-lg bg-[#FFB70F] px-10 py-4 text-base font-bold text-black hover:bg-white transition-colors shadow-lg"
            >
              {hero.cta_text || "Register Now"}
            </Link>
            <Link href="/courses" className="inline-flex items-center gap-2 text-white font-semibold hover:text-[#FFB70F] transition-colors">
              <ArrowLeft className="w-4 h-4" /> View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* ============ 3b. COURSE STATISTICS ============ */}
      {course.statistics && (course.statistics.enrolled_count !== undefined || course.statistics.branches_count !== undefined || course.statistics.instructors_count !== undefined) && (
        <section className="py-16 md:py-20 bg-[#1E2130]">
          <div className="container mx-auto px-4 max-w-7xl">
            <SectionLabel sub="Overview" title="Course Statistics" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {(course.statistics.enrolled_count ?? 0) >= 0 && (
                <div className="bg-[#171A26] border border-gray-800 rounded-xl p-6 text-center hover:border-[#FFB70F] transition-colors">
                  <Users className="w-10 h-10 text-[#FFB70F] mx-auto mb-3" />
                  <p className="text-3xl font-bold text-white">{course.statistics.enrolled_count ?? 0}</p>
                  <p className="text-gray-400 text-sm uppercase tracking-wider">Enrolled Students</p>
                </div>
              )}
              {(course.statistics.branches_count ?? 0) >= 0 && (
                <div className="bg-[#171A26] border border-gray-800 rounded-xl p-6 text-center hover:border-[#FFB70F] transition-colors">
                  <MapPin className="w-10 h-10 text-[#FFB70F] mx-auto mb-3" />
                  <p className="text-3xl font-bold text-white">{course.statistics.branches_count ?? 0}</p>
                  <p className="text-gray-400 text-sm uppercase tracking-wider">Branches</p>
                </div>
              )}
              {(course.statistics.instructors_count ?? 0) >= 0 && (
                <div className="bg-[#171A26] border border-gray-800 rounded-xl p-6 text-center hover:border-[#FFB70F] transition-colors">
                  <Star className="w-10 h-10 text-[#FFB70F] mx-auto mb-3" />
                  <p className="text-3xl font-bold text-white">{course.statistics.instructors_count ?? 0}</p>
                  <p className="text-gray-400 text-sm uppercase tracking-wider">Instructors</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============ 3c. COURSE CURRICULUM ============ */}
      {course.curriculum && course.curriculum.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-7xl">
            <SectionLabel sub="Syllabus" title="Course Curriculum" />
            <div className="max-w-3xl mx-auto">
              <ul className="space-y-3">
                {course.curriculum.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FFB70F] text-black flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <span className="pt-0.5">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ============ 3d. ENROLLED STUDENTS ============ */}
      {course.enrolled_students && course.enrolled_students.length > 0 && (
        <section className="py-16 md:py-20 bg-[#1E2130]">
          <div className="container mx-auto px-4 max-w-7xl">
            <SectionLabel sub="Our Community" title="Enrolled Students" />
            <div className="flex flex-wrap justify-center gap-6">
              {course.enrolled_students.map((s) => (
                <div key={s.id} className="flex flex-col items-center text-center group">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-700 group-hover:border-[#FFB70F] transition-colors bg-[#171A26]">
                    {s.photo ? (
                      <img src={s.photo} alt={s.full_name || ""} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-gray-500 font-bold uppercase">{(s.first_name?.[0] || s.last_name?.[0] || "?")}</div>
                    )}
                  </div>
                  <p className="text-sm text-gray-300 mt-2 font-medium max-w-[100px] truncate">{s.full_name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || "Student"}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ 4. BENEFITS ============ */}
      {benefits.length > 0 && (
        <section className="py-16 md:py-20 bg-[#1E2130]">
          <div className="container mx-auto px-4 max-w-7xl">
            <SectionLabel sub="Why Choose Us" title={`Benefits of ${courseTitle}`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((b, i) => (
                <div key={i} className="bg-[#171A26] border border-gray-800 rounded-xl p-6 hover:border-[#FFB70F] transition-colors text-center">
                  {b.icon && <span className="text-3xl block mb-3">{b.icon}</span>}
                  <h3 className="text-xl font-bold text-[#FFB70F] uppercase mb-2" style={{ fontFamily: "'Oswald', sans-serif" }}>{b.title}</h3>
                  <p className="text-gray-400 text-sm">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ 5. LEARNING / VIDEO ============ */}
      {(learning.title || learning.video_url || learning.description) && (
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-7xl">
            <SectionLabel sub="Our Classes" title={learning.title || `What You Will Learn`} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="text-gray-400 leading-relaxed space-y-4">
                {learning.description && learning.description.split("\n").map((p, i) => <p key={i}>{p}</p>)}
              </div>
              {learning.video_url && (
                <div className="relative rounded-xl overflow-hidden aspect-video bg-black">
                  {getYouTubeId(learning.video_url) ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeId(learning.video_url)}`}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video controls className="w-full h-full object-cover" poster={learning.thumbnail || undefined}>
                      <source src={learning.video_url} type="video/mp4" />
                    </video>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============ 6. GALLERY ============ */}
      {gallery.length > 0 && (
        <section className="py-16 md:py-20 bg-[#1E2130]">
          <div className="container mx-auto px-4 max-w-7xl">
            <SectionLabel sub="Martial Style" title="Our Gallery" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((url, i) => (
                <div key={i} className="overflow-hidden rounded-lg group">
                  <img src={url} alt="" className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ 7. INSTRUCTORS ============ */}
      {instructors.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-7xl">
            <SectionLabel sub="Our Team" title="Our Instructors" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {instructors.map((inst, i) => (
                <div key={i} className="text-center group">
                  <div className="relative w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden border-4 border-[#F73322] group-hover:border-[#FFB70F] transition-colors">
                    {inst.photo ? (
                      <img src={inst.photo} alt={inst.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center text-4xl text-gray-600">👤</div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-[#F73322] uppercase" style={{ fontFamily: "'Oswald', sans-serif" }}>{inst.name}</h3>
                  <p className="text-gray-400 text-sm">{inst.designation}</p>
                  {inst.bio && <p className="text-gray-500 text-xs mt-2 max-w-xs mx-auto">{inst.bio}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ 8. STUDENT REVIEWS ============ */}
      {reviews.length > 0 && (
        <section className="py-16 md:py-20 bg-[#1E2130]">
          <div className="container mx-auto px-4 max-w-7xl">
            <SectionLabel sub="Testimonials" title="Student Reviews" />
            <div className="max-w-4xl mx-auto">
              <div className="bg-[#171A26] border border-gray-800 rounded-xl p-8 md:p-10 text-center relative">
                <Quote className="w-10 h-10 text-[#FFB70F] mx-auto mb-4 opacity-50" />
                <p className="text-gray-300 text-lg leading-relaxed mb-6 italic">&ldquo;{reviews[testimonialIdx]?.text}&rdquo;</p>
                <p className="text-[#FFB70F] font-bold uppercase">{reviews[testimonialIdx]?.name}</p>
                <p className="text-gray-500 text-sm">{reviews[testimonialIdx]?.designation}</p>
              </div>
              {reviews.length > 1 && (
                <div className="flex items-center justify-center gap-6 mt-6">
                  <button onClick={() => setTestimonialIdx((p) => (p - 1 + reviews.length) % reviews.length)} className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:border-[#FFB70F] hover:text-[#FFB70F] transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex gap-2">
                    {reviews.map((_, i) => (
                      <button key={i} onClick={() => setTestimonialIdx(i)} className={`w-3 h-3 rounded-full transition-colors ${i === testimonialIdx ? "bg-[#FFB70F]" : "bg-gray-700"}`} />
                    ))}
                  </div>
                  <button onClick={() => setTestimonialIdx((p) => (p + 1) % reviews.length)} className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:border-[#FFB70F] hover:text-[#FFB70F] transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
              {reviews.length > 1 && (
                <div className="flex justify-center gap-4 mt-6">
                  {reviews.map((t, i) => (
                    <button key={i} onClick={() => setTestimonialIdx(i)} className={`flex flex-col items-center transition-opacity ${i === testimonialIdx ? "opacity-100" : "opacity-50 hover:opacity-80"}`}>
                      <div className={`w-14 h-14 rounded-full overflow-hidden border-2 ${i === testimonialIdx ? "border-[#FFB70F]" : "border-gray-700"}`}>
                        {t.photo ? <img src={t.photo} alt={t.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-800 flex items-center justify-center text-lg">👤</div>}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 max-w-[70px] truncate">{t.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============ 8b. STUDENT ACHIEVEMENTS ============ */}
      {course.student_achievements && course.student_achievements.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-7xl">
            <SectionLabel sub="Our Champions" title="Student Achievements" />
            <p className="text-center text-gray-400 max-w-2xl mx-auto mb-10">Achievements by students enrolled in this course.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {course.student_achievements.map((a) => (
                <div key={a.id} className="bg-[#1E2130] border border-gray-800 rounded-xl p-6 hover:border-[#FFB70F] transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <Trophy className="w-8 h-8 text-[#FFB70F] flex-shrink-0" />
                    <h3 className="text-lg font-bold text-[#FFB70F] uppercase" style={{ fontFamily: "'Oswald', sans-serif" }}>{a.title}</h3>
                  </div>
                  {a.description && <p className="text-gray-400 text-sm mb-3">{a.description}</p>}
                  <p className="text-gray-500 text-xs">— {a.student_name || "Student"}</p>
                  {a.images && a.images.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {a.images.slice(0, 3).map((url: string, i: number) => (
                        <img key={i} src={url} alt="" className="w-16 h-16 object-cover rounded-lg" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ 9. PDF ATTACHMENTS ============ */}
      {attachments.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-7xl">
            <SectionLabel sub="Resources" title="Downloads" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {attachments.map((a, i) => (
                <a key={i} href={a.file_url} target="_blank" rel="noopener noreferrer" download className="flex items-center gap-3 bg-[#1E2130] border border-gray-800 rounded-lg px-5 py-4 hover:border-[#FFB70F] transition-colors group">
                  <Download className="w-6 h-6 text-[#FFB70F] group-hover:scale-110 transition-transform" />
                  <span className="text-gray-300 font-medium">{a.title || "Download"}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

    </main>
  )
}
