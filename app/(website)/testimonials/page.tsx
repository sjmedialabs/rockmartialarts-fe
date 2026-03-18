import Link from "next/link"

/* ---------- fetch CMS content ---------- */

async function getCMSContent() {
  try {
    const siteOrigin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")

    if (siteOrigin) {
      const res = await fetch(`${siteOrigin.replace(/\/$/, "")}/api/backend/cms/public`, {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
      })
      if (res.ok) return await res.json()
    }

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

const defaultTestimonials = [
  { name: "Divya Menon", role: "Yoga Instructor & Environmentalist" },
  { name: "Rosan Gupta", role: "Project Manager" },
  { name: "Yogitha Narayan", role: "Software developer" },
  { name: "Divya Menon", role: "Analyst" },
]

const defaultTestimonialQuote =
  "Kungfu at ROCK has improved my physical and mental strength, stamina, and speed. Self-defense skills have given me confidence to travel alone fearlessly. It's a life skill that I highly recommend for discipline, self-esteem, and fitness. Thank you ROCK team for the support."

export const metadata = {
  title: "Testimonials | Rock Martial Arts Academy",
  description: "Success stories and testimonials from students and parents at Rock Martial Arts Academy.",
}

export default async function TestimonialsPage() {
  const cms = await getCMSContent()
  const homepage = cms?.homepage || {}
  const testimonialsTitle = homepage.testimonials_title || "Success stories"
  const testimonialsSubtitle = homepage.testimonials_subtitle || "Testimonials"
  const testimonials =
    homepage.testimonials && homepage.testimonials.length > 0
      ? homepage.testimonials.map((t: { name?: string; role?: string; quote?: string; image?: string }) => ({
          name: t.name || "",
          role: t.role || "",
          quote: t.quote,
          image: t.image,
        }))
      : defaultTestimonials

  return (
    <main className="min-h-screen bg-[#171A26]">
      <div className="container mx-auto px-6 sm:px-8 py-16 md:py-20 lg:py-24 max-w-7xl">
        <div className="mb-12 md:mb-14">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#FFB70F] hover:text-white transition-colors text-sm mb-6"
          >
            ← Back to home
          </Link>
          <div className="w-16 h-1 bg-[#FFB70F] mb-4" />
          <p className="text-[#FFB70F] uppercase tracking-widest text-sm mb-2">{testimonialsSubtitle}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-[#FFB70F]">{testimonialsTitle}</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 pt-2">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 h-full flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#FFB70F]/50 mb-4 flex-shrink-0">
                {t.image ? (
                  <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center text-2xl text-gray-400">
                    👤
                  </div>
                )}
              </div>
              <img src="/assets/img/courses/quote.png" alt="" className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-gray-300 text-sm leading-relaxed mb-4 flex-1">
                {t.quote || defaultTestimonialQuote}
              </p>
              <h2 className="text-[#FFB70F] font-semibold">{t.name}</h2>
              <p className="text-white/80 text-sm">{t.role}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
