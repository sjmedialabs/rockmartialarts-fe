import { toCourseSlug } from "@/lib/course-slug"
import HomePageView from "@/components/website/HomePageView"

export const metadata = {
  title: "Rock Martial Arts Academy | Fitness & Dance",
  description: "Strengthen, discipline, and empower with martial arts. Shaolin Kung Fu, Taekwondo, Kick Boxing, Kuchipudi and more.",
}

/** Always fetch courses from API at request time (no static/cache fallback to mock). */
export const dynamic = "force-dynamic"
export const revalidate = 0

/* ---------- static fallback only when API fails (e.g. backend down) ---------- */
const staticClassesFallback = [
  { name: "Shaolin Kung Fu", img: "/assets/img/courses/choose_img1.png", href: "/courses" },
  { name: "Taekwondo", img: "/assets/img/courses/choose_img2.png", href: "/courses" },
  { name: "Kick Boxing", img: "/assets/img/courses/choose_img3.png", href: "/courses" },
  { name: "Kuchipudi", img: "/assets/img/courses/choose_img4.png", href: "/courses" },
]

const physicalBenefits = [
  "Improved Physical Fitness",
  "Cardiovascular Health",
  "Weight Management",
  "Self-Defense Skills",
]

const mentalBenefits = [
  "Enhanced Focus and Concentration",
  "Increased Self-Confidence",
  "Stress Reduction",
  "Improved Discipline and Self-Control",
]

const defaultTestimonialQuote =
  "Kungfu at ROCK has improved my physical and mental strength, stamina, and speed. Self-defense skills have given me confidence to travel alone fearlessly. It's a life skill that I highly recommend for discipline, self-esteem, and fitness. Thank you ROCK team for the support."


/* ---------- fetch CMS content at build / request time ---------- */

async function getCMSContent() {
  try {
    const siteOrigin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")

    // Prefer same-origin proxy when we can form an absolute URL (server-side fetch).
    if (siteOrigin) {
      const res = await fetch(`${siteOrigin.replace(/\/$/, "")}/api/backend/cms/public`, {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      })
      if (res.ok) return await res.json()
    }

    // Fallback: fetch backend public CMS directly.
    const backendUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://127.0.0.1:8003"
    const res = await fetch(`${backendUrl.replace(/\/$/, "")}/api/cms/public`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

/* ---------- fetch courses at build / request time ---------- */

async function getCourses(): Promise<{ courses: any[]; fromApi: boolean }> {
  try {
    const backendUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8003"
    const res = await fetch(`${backendUrl}/api/courses/public/all`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    })
    if (!res.ok) return { courses: [], fromApi: true }
    const data = await res.json()
    const list = data.courses ?? data ?? []
    const arr = Array.isArray(list) ? list : []
    return { courses: arr, fromApi: true }
  } catch {
    return { courses: [], fromApi: false }
  }
}

function getCourseImage(c: any): string | null {
  return c?.media_resources?.course_image_url || (c?.page_content?.hero_section?.hero_image) || null
}

function resolveUploadUrl(url?: string | null): string {
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) return url
  return `/api/backend/uploads/${encodeURIComponent(url)}`
}

const coachImageFallback = "/assets/img/courses/kung-fu-trainer.png"

async function getHomepageAboutFromApi(): Promise<{
  title?: string
  subtitle?: string
  content?: string
  image?: string
}> {
  try {
    const siteOrigin =
      process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")
    if (siteOrigin) {
      const res = await fetch(`${siteOrigin.replace(/\/$/, "")}/api/backend/homepage/public`, {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      })
      if (res.ok) {
        const data = await res.json()
        return data.about || {}
      }
    }
    const backendUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://127.0.0.1:8003"
    const res = await fetch(`${backendUrl.replace(/\/$/, "")}/api/homepage/public`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    })
    if (!res.ok) return {}
    const data = await res.json()
    return data.about || {}
  } catch {
    return {}
  }
}

async function getShowcaseTestimonialsFromApi(): Promise<
  {
    id?: string
    student_name?: string
    student_photo?: string
    testimonial_text?: string
    rating?: number
  }[]
> {
  try {
    const siteOrigin =
      process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")
    const qs = `is_global=true&limit=6`
    if (siteOrigin) {
      const res = await fetch(`${siteOrigin.replace(/\/$/, "")}/api/backend/testimonials?${qs}`, {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      })
      if (res.ok) {
        const data = await res.json()
        return Array.isArray(data.testimonials) ? data.testimonials : []
      }
    }
    const backendUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://127.0.0.1:8003"
    const res = await fetch(`${backendUrl.replace(/\/$/, "")}/api/testimonials?${qs}`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data.testimonials) ? data.testimonials : []
  } catch {
    return []
  }
}

async function getShowcaseAchievementsFromApi(): Promise<
  {
    id?: string
    student_name?: string
    student_photo?: string
    achievement_title?: string
    description?: string
    image?: string
  }[]
> {
  try {
    const siteOrigin =
      process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")
    const qs = `is_global=true&limit=12`
    if (siteOrigin) {
      const res = await fetch(`${siteOrigin.replace(/\/$/, "")}/api/backend/showcase-achievements?${qs}`, {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      })
      if (res.ok) {
        const data = await res.json()
        return Array.isArray(data.achievements) ? data.achievements : []
      }
    }
    const backendUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://127.0.0.1:8003"
    const res = await fetch(`${backendUrl.replace(/\/$/, "")}/api/showcase-achievements?${qs}`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data.achievements) ? data.achievements : []
  } catch {
    return []
  }
}

async function getHomepageCoaches(): Promise<
  { name: string; role: string; img: string; about?: string; rating?: number | null }[]
> {
  try {
    const siteOrigin =
      process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")

    if (siteOrigin) {
      const res = await fetch(`${siteOrigin.replace(/\/$/, "")}/api/coaches/public/homepage?limit=8`, {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      })
      if (res.ok) {
        const data = await res.json()
        const list = data.coaches ?? []
        if (!Array.isArray(list)) return []
        return list.map((c: any) => ({
          name: c.full_name || "Coach",
          role: c.designation || "",
          img: resolveUploadUrl(c.profile_image_url) || coachImageFallback,
          about: (c.about_short || "").trim(),
          rating: typeof c.rating === "number" ? c.rating : null,
        }))
      }
    }

    const backendUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://127.0.0.1:8003"
    const res = await fetch(`${backendUrl.replace(/\/$/, "")}/api/coaches/public/homepage?limit=8`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    })
    if (!res.ok) return []
    const data = await res.json()
    const list = data.coaches ?? []
    if (!Array.isArray(list)) return []
    return list.map((c: any) => ({
      name: c.full_name || "Coach",
      role: c.designation || "",
      img: resolveUploadUrl(c.profile_image_url) || coachImageFallback,
      about: (c.about_short || "").trim(),
      rating: typeof c.rating === "number" ? c.rating : null,
    }))
  } catch {
    return []
  }
}

/* ---------- component ---------- */

export default async function HomePage() {
  const [coursesResult, cms, trainers, showcaseTestimonials, showcaseAchievements, homepageAbout] =
    await Promise.all([
      getCourses(),
      getCMSContent(),
      getHomepageCoaches(),
      getShowcaseTestimonialsFromApi(),
      getShowcaseAchievementsFromApi(),
      getHomepageAboutFromApi(),
    ])
  const { courses: apiCourses, fromApi } = coursesResult

  const homepage = cms?.homepage || {}
  const footer = cms?.footer || {}

  /* Real courses from API when available; mock only when API request failed (backend down) */
  const activeCourses = apiCourses.filter((c: any) => c.settings?.active !== false).slice(0, 8)
  const classCards =
    activeCourses.length > 0
      ? activeCourses.map((c: any) => ({
          id: c.id,
          name: c.title || c.name || c.code || "Course",
          img: getCourseImage(c) || "/assets/img/courses/choose_img1.png",
          href: `/courses/${toCourseSlug(c)}`,
        }))
      : fromApi
        ? [{ id: "explore", name: "Explore our courses", img: "/assets/img/courses/choose_img1.png", href: "/courses" }]
        : staticClassesFallback.map((c, i) => ({ ...c, id: `fallback-${i}` }))

  /* Hero content from CMS */
  const heroTitle = homepage.hero_title || "IT'S NOT FITNESS. IT'S LIFE."
  const heroSubtitle = homepage.hero_subtitle || ""
  const heroDescription = homepage.hero_description || ""
  const heroVideo = homepage.hero_video || "/assets/img/slider.mp4"
  const heroImage = homepage.hero_image || ""

  /* About: homepage_content API first, then legacy CMS fields */
  const aboutTitle = homepageAbout.title?.trim() || homepage.about_title || "Advantages of Rock Martial Arts"
  const aboutSubtitle = homepageAbout.subtitle?.trim() || homepage.about_subtitle || ""
  const aboutContentHtml = homepageAbout.content?.trim() || ""
  const aboutImage = homepageAbout.image?.trim() || ""
  const coursesTitle = homepage.courses_title || "Our Classes"
  const coursesSubtitle = homepage.courses_subtitle || "Choose"
  const testimonialsTitle = homepage.testimonials_title || "Success stories"
  const testimonialsSubtitle = homepage.testimonials_subtitle || "Testimonials"
  const testimonials: { name: string; role: string; quote?: string; image?: string; achievement?: string }[] = []

  const ctaTitle = homepage.cta_title || "Learn martial arts with discipline energy enhance your physical and mental well-being with our holistic tai-chi training."
  const ctaSubtitle = homepage.cta_subtitle || ""
  const bottomCtaTitle = homepage.bottom_cta_title || ""
  const bottomCtaSubtitle = homepage.bottom_cta_subtitle || ""

  return (
    <HomePageView
      heroTitle={heroTitle}
      heroSubtitle={heroSubtitle}
      heroDescription={heroDescription}
      heroVideo={heroVideo}
      heroImage={heroImage}
      ctaTitle={ctaTitle}
      ctaSubtitle={ctaSubtitle}
      bottomCtaTitle={bottomCtaTitle}
      bottomCtaSubtitle={bottomCtaSubtitle}
      aboutTitle={aboutTitle}
      aboutSubtitle={aboutSubtitle}
      aboutContentHtml={aboutContentHtml}
      aboutImage={aboutImage}
      coursesTitle={coursesTitle}
      coursesSubtitle={coursesSubtitle}
      testimonialsTitle={testimonialsTitle}
      testimonialsSubtitle={testimonialsSubtitle}
      classCards={classCards}
      physicalBenefits={physicalBenefits}
      mentalBenefits={mentalBenefits}
      trainers={trainers}
      testimonials={testimonials}
      defaultTestimonialQuote={defaultTestimonialQuote}
      showcaseTestimonials={showcaseTestimonials}
      showcaseAchievements={showcaseAchievements}
    />
  )
}
