"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useEffect, useState } from "react"
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
} from "lucide-react"
import { stripUuidFromPriceDisplay } from "@/lib/priceDisplay"

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type PageContent = {
  hero_section?: { title?: string; subtitle?: string; description?: string; hero_image?: string; cta_text?: string; cta_link?: string }
  course_info?: { location?: string; duration?: string; price?: string; training_time?: string }
  about_section?: { title?: string; description?: string; secondary_description?: string; image1?: string; image2?: string }
  benefits?: { title: string; description: string; icon?: string }[]
  learning_section?: { title?: string; description?: string; video_url?: string; thumbnail?: string }
  gallery_images?: string[]
  instructors?: { name: string; designation: string; bio?: string; photo?: string }[]
  testimonials?: { name: string; designation: string; text: string; photo?: string }[]
  pdf_attachments?: { title: string; file_url: string }[]
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
  const router = useRouter()
  const slug = params.id as string
  const [course, setCourse] = useState<CourseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testimonialIdx, setTestimonialIdx] = useState(0)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    fetch(`/api/courses/public/${slug}`, { headers: { "Content-Type": "application/json" } })
      .then((res) => { if (!res.ok) throw new Error(res.status === 404 ? "Course not found" : "Failed to load"); return res.json() })
      .then(setCourse)
      .catch((e) => { setError(e.message); setCourse(null) })
      .finally(() => setLoading(false))
  }, [slug])

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
  const benefits = pc.benefits || []
  const learning = pc.learning_section || {}
  const gallery = pc.gallery_images || []
  const instructors = pc.instructors || []
  const testimonials = pc.testimonials || []
  const attachments = pc.pdf_attachments || []

  const courseTitle = hero.title || course.title || course.course_name || "Course"
  const heroImg = hero.hero_image || course.media_resources?.course_image_url || "/assets/img/banner.jpg"

  return (
    <main className="min-h-screen bg-[#171A26] text-gray-300">
      {/* ============ 1. HERO ============ */}
      <section className="relative min-h-[70vh] flex items-end overflow-hidden" style={{ backgroundImage: `url(${heroImg})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        <div className="container relative z-10 mx-auto px-4 max-w-7xl pb-16 pt-32">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white uppercase leading-tight mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>
            {courseTitle}
          </h1>
          {hero.subtitle && <p className="text-lg md:text-xl text-gray-200 max-w-2xl mb-3">{hero.subtitle}</p>}
          {hero.description && <p className="text-gray-300 max-w-2xl mb-6">{hero.description}</p>}
          {hero.cta_text && (
            <Link href={hero.cta_link || "/register"} className="inline-block rounded-lg bg-[#F73322] px-8 py-3.5 text-base font-bold text-white hover:bg-[#FFB70F] hover:text-black transition-colors">
              {hero.cta_text}
            </Link>
          )}
        </div>
      </section>

      {/* ============ 2. INFO BAR ============ */}
      {(info.location || info.duration || info.price || info.training_time) && (
        <section className="bg-[#F73322]">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/20">
              {info.location && (
                <div className="flex items-center gap-3 py-5 px-4 text-white">
                  <MapPin className="w-7 h-7 flex-shrink-0 opacity-90" />
                  <div><p className="text-[11px] uppercase tracking-wider text-white/80">Select Location</p><p className="font-bold text-lg">{info.location}</p></div>
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
              {info.training_time && (
                <div className="flex items-center gap-3 py-5 px-4 text-white">
                  <Clock className="w-7 h-7 flex-shrink-0 opacity-90" />
                  <div><p className="text-[11px] uppercase tracking-wider text-white/80">Timings</p><p className="font-bold text-lg">{info.training_time}</p></div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============ 3. ABOUT ============ */}
      {(about.title || about.description || course.description) && (
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              <div>
                <p className="text-[#F73322] uppercase tracking-[0.2em] text-sm font-semibold mb-2">About {courseTitle}</p>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white uppercase mb-6" style={{ fontFamily: "'Oswald', sans-serif" }}>
                  {about.title || "Start Today and Change Your Life"}
                </h2>
                <div className="space-y-4 text-gray-400 leading-relaxed">
                  <p>{about.description || course.description}</p>
                  {about.secondary_description && <p>{about.secondary_description}</p>}
                </div>
                <Link href={hero.cta_link || "/register"} className="inline-block mt-8 rounded border-2 border-[#FFB70F] px-8 py-3 text-[#FFB70F] font-semibold hover:bg-[#FFB70F] hover:text-black transition-colors">
                  Read More
                </Link>
              </div>
              {(about.image1 || about.image2) && (
                <div className="grid grid-cols-2 gap-4">
                  {about.image1 && <img src={about.image1} alt="" className="rounded-lg w-full h-64 object-cover" />}
                  {about.image2 && <img src={about.image2} alt="" className="rounded-lg w-full h-64 object-cover mt-8" />}
                </div>
              )}
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
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ 8. TESTIMONIALS ============ */}
      {testimonials.length > 0 && (
        <section className="py-16 md:py-20 bg-[#1E2130]">
          <div className="container mx-auto px-4 max-w-7xl">
            <SectionLabel sub="Testimonials" title="Success Stories" />
            <div className="max-w-4xl mx-auto">
              {/* Active testimonial */}
              <div className="bg-[#171A26] border border-gray-800 rounded-xl p-8 md:p-10 text-center relative">
                <Quote className="w-10 h-10 text-[#FFB70F] mx-auto mb-4 opacity-50" />
                <p className="text-gray-300 text-lg leading-relaxed mb-6 italic">&ldquo;{testimonials[testimonialIdx]?.text}&rdquo;</p>
                <p className="text-[#FFB70F] font-bold uppercase">{testimonials[testimonialIdx]?.name}</p>
                <p className="text-gray-500 text-sm">{testimonials[testimonialIdx]?.designation}</p>
              </div>
              {/* Carousel nav */}
              {testimonials.length > 1 && (
                <div className="flex items-center justify-center gap-6 mt-6">
                  <button onClick={() => setTestimonialIdx((p) => (p - 1 + testimonials.length) % testimonials.length)} className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:border-[#FFB70F] hover:text-[#FFB70F] transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex gap-2">
                    {testimonials.map((_, i) => (
                      <button key={i} onClick={() => setTestimonialIdx(i)} className={`w-3 h-3 rounded-full transition-colors ${i === testimonialIdx ? "bg-[#FFB70F]" : "bg-gray-700"}`} />
                    ))}
                  </div>
                  <button onClick={() => setTestimonialIdx((p) => (p + 1) % testimonials.length)} className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:border-[#FFB70F] hover:text-[#FFB70F] transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
              {/* Thumbnail row */}
              {testimonials.length > 1 && (
                <div className="flex justify-center gap-4 mt-6">
                  {testimonials.map((t, i) => (
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

      {/* ============ CTA ============ */}
      <section className="py-12 bg-[#F73322]">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white uppercase mb-4" style={{ fontFamily: "'Oswald', sans-serif" }}>
            Ready to Start Your Journey?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href={hero.cta_link || "/register"} className="inline-flex items-center justify-center rounded-lg bg-[#FFB70F] px-10 py-4 text-base font-bold text-black hover:bg-white transition-colors shadow-lg">
              Register Now
            </Link>
            <Link href="/courses" className="inline-flex items-center gap-2 text-white font-semibold hover:text-[#FFB70F] transition-colors">
              <ArrowLeft className="w-4 h-4" /> View All Courses
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
