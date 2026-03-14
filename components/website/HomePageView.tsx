"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { ScrollZoomContinuous } from "@/components/ScrollZoomContinuous"
import {
  AnimatedSection,
  AnimatedCard,
  AnimatedStaggerGrid,
  FloatingShapes,
  HeroAnimation,
} from "@/components/animations"

/* ---------- Types (mirror server data shape; no API change) ---------- */

export interface HomePageViewProps {
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  heroVideo: string
  heroImage: string
  ctaTitle: string
  ctaSubtitle: string
  aboutTitle: string
  aboutSubtitle: string
  coursesTitle: string
  coursesSubtitle: string
  testimonialsTitle: string
  testimonialsSubtitle: string
  classCards: { id?: string; name: string; img: string; href: string }[]
  physicalBenefits: string[]
  mentalBenefits: string[]
  trainers: { name: string; role: string; img: string }[]
  testimonials: { name: string; role: string; quote?: string; image?: string }[]
  defaultTestimonialQuote: string
}

/* ---------- Homepage with Cult.fit-style animations ---------- */

export default function HomePageView({
  heroTitle,
  heroSubtitle,
  heroDescription,
  heroVideo,
  heroImage,
  ctaTitle,
  ctaSubtitle,
  aboutTitle,
  aboutSubtitle,
  coursesTitle,
  coursesSubtitle,
  testimonialsTitle,
  testimonialsSubtitle,
  classCards,
  physicalBenefits,
  mentalBenefits,
  trainers,
  testimonials,
  defaultTestimonialQuote,
}: HomePageViewProps) {
  const shouldReduceMotion = useReducedMotion()

  // Hero CTAs: scale slightly on hover (Cult.fit-style)
  const heroActions = !shouldReduceMotion ? (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.3, ease: "easeOut" }}>
        <Link
          href="#courses"
          className="inline-block rounded-lg bg-[#FFB70F] px-6 py-3.5 text-base font-semibold text-black hover:bg-[#F73322] hover:text-white transition-colors duration-300"
        >
          Explore Courses
        </Link>
      </motion.div>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.3, ease: "easeOut" }}>
        <Link
          href="/register"
          className="inline-block rounded-lg border-2 border-white px-6 py-3.5 text-base font-semibold text-white hover:bg-white hover:text-black transition-colors duration-300"
        >
          Join the Academy
        </Link>
      </motion.div>
    </div>
  ) : (
    <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
      <Link href="#courses" className="inline-block rounded-lg bg-[#FFB70F] px-6 py-3.5 text-base font-semibold text-black">
        Explore Courses
      </Link>
      <Link href="/register" className="inline-block rounded-lg border-2 border-white px-6 py-3.5 text-base font-semibold text-white">
        Join the Academy
      </Link>
    </div>
  )

  return (
    <main className="min-h-screen bg-[#171A26] relative">
      {/* Floating background shapes — slow floating motion */}
      <FloatingShapes className="z-0" />

      {/* Hero: staggered text, media slide-in, CTAs with hover scale */}
      <HeroAnimation
        title={heroTitle}
        subtitle={heroSubtitle || undefined}
        description={heroDescription || undefined}
        actions={heroActions}
        media={
          heroImage && !heroVideo ? (
            <img
              src={heroImage}
              alt="Hero"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              poster={heroImage || undefined}
            >
              <source src={heroVideo} type="video/mp4" />
            </video>
          )
        }
      />

      {/* Tagline - scroll reveal */}
      <AnimatedSection variant="fadeSlideUp" className="py-16 md:py-20 bg-[#171A26] relative z-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-center text-white text-xl md:text-2xl lg:text-3xl font-medium">
            {ctaTitle}
          </h1>
          {ctaSubtitle && (
            <p className="text-center text-gray-400 text-lg mt-4">{ctaSubtitle}</p>
          )}
        </div>
      </AnimatedSection>

      {/* Our Classes - Section 3: each card zooms individually (in view = scale 1, scroll past = scale 0) */}
      <section
        id="courses"
        className="py-16 md:py-20 bg-[#171A26] scroll-mt-24 relative z-10"
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <AnimatedSection className="text-center mb-12" variant="fadeSlideUp">
            <div className="w-16 h-1 bg-[#FFB70F] mx-auto mb-4" />
            <p className="text-[#FFB70F] uppercase tracking-widest text-sm mb-2">
              {coursesSubtitle}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#FFB70F]">{coursesTitle}</h2>
          </AnimatedSection>
          <AnimatedStaggerGrid
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            staggerDelay={0.12}
            childClassName="text-center group"
          >
            {classCards.map((c) => (
              <ScrollZoomContinuous key={c.id ?? c.name}>
                <AnimatedCard scrollReveal={false} className="h-full">
                  <div className="mb-4 overflow-hidden rounded-lg aspect-[4/3] bg-gray-800">
                    <img
                      src={c.img}
                      alt={c.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-[#FFB70F] mb-4">{c.name}</h3>
                  <Link
                    href={c.href}
                    className="inline-block rounded-lg bg-white px-5 py-3.5 text-base font-medium text-black hover:bg-[#F73322] hover:text-white transition-colors duration-300 hover:scale-105"
                  >
                    Explore More
                  </Link>
                </AnimatedCard>
              </ScrollZoomContinuous>
            ))}
          </AnimatedStaggerGrid>
        </div>
      </section>

      {/* Discover - Advantages (Section 4): left and right columns zoom individually (in view = scale 1, scroll past = scale 0) */}
      <AnimatedSection
        variant="fadeSlideUp"
        className="py-16 md:py-20 bg-[#171A26] relative z-10"
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollZoomContinuous>
              <div className="overflow-hidden rounded-lg">
                <img
                  src="/assets/img/courses/tr_yourself.png"
                  alt="Train yourself"
                  className="w-full h-auto"
                />
              </div>
            </ScrollZoomContinuous>
            <ScrollZoomContinuous>
              <div>
                <p className="text-[#FFB70F] uppercase tracking-widest text-sm mb-2">Discover</p>
                <h2 className="text-3xl md:text-4xl font-bold text-[#FFB70F] mb-8">{aboutTitle}</h2>
                {aboutSubtitle && <p className="text-gray-300 mb-6">{aboutSubtitle}</p>}
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <img
                      src="/assets/img/courses/icon1.png"
                      alt=""
                      className="w-12 h-12 flex-shrink-0"
                    />
                    <ul className="list-disc list-inside text-gray-300 space-y-2">
                      {physicalBenefits.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-4 items-center">
                    <img
                      src="/assets/img/courses/icon2.png"
                      alt=""
                      className="w-12 h-12 flex-shrink-0"
                    />
                    <h3 className="text-2xl font-bold text-[#FFB70F]">Mental Benefits</h3>
                  </div>
                  <ul className="list-disc list-inside text-gray-300 space-y-2 ml-16">
                    {mentalBenefits.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </ScrollZoomContinuous>
          </div>
        </div>
      </AnimatedSection>

      {/* Our Expert Masters - staggered cards */}
      <section className="py-16 md:py-20 bg-[#171A26] relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <AnimatedSection className="text-center mb-12" variant="fadeSlideUp">
            <div className="w-16 h-1 bg-[#FFB70F] mx-auto mb-4" />
            <p className="text-[#FFB70F] uppercase tracking-widest text-sm mb-2">Our Members</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#FFB70F]">Our Expert Masters</h2>
          </AnimatedSection>
          <AnimatedStaggerGrid
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            staggerDelay={0.15}
            childClassName="flex flex-col sm:flex-row gap-6"
          >
            {trainers.map((t) => (
              <AnimatedCard key={t.name} scrollReveal={false}>
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 h-full flex flex-col sm:flex-row gap-6">
                  <img
                    src={t.img}
                    alt={t.name}
                    className="w-full sm:w-48 h-64 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-1">{t.name}</h3>
                    <p className="text-[#FFB70F] font-semibold mb-3">{t.role}</p>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Quuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro
                      quisquam est, qui dolorem ipsum quiaolor sit amet, consectetur, adipisci
                      velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore
                      magnam.
                    </p>
                    <img
                      src="/assets/img/courses/stars.png"
                      alt="Rating"
                      className="mt-2 w-24 h-auto"
                    />
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </AnimatedStaggerGrid>
        </div>
      </section>

      {/* Testimonials - max 4 cards with round image on top; More button to /testimonials */}
      <section className="py-16 md:py-20 bg-[#171A26] relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <AnimatedSection className="text-center mb-12" variant="fadeSlideUp">
            <div className="w-16 h-1 bg-[#FFB70F] mx-auto mb-4" />
            <p className="text-[#FFB70F] uppercase tracking-widest text-sm mb-2">
              {testimonialsSubtitle}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#FFB70F]">{testimonialsTitle}</h2>
          </AnimatedSection>
          <AnimatedStaggerGrid
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            staggerDelay={0.1}
          >
            {testimonials.slice(0, 4).map((t, i) => (
              <AnimatedCard key={i} scrollReveal={false}>
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 h-full flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#FFB70F]/50 mb-4 flex-shrink-0">
                    {t.image ? (
                      <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center text-2xl text-gray-400">👤</div>
                    )}
                  </div>
                  <img
                    src="/assets/img/courses/quote.png"
                    alt=""
                    className="w-8 h-8 mb-2 opacity-80"
                  />
                  <p className="text-gray-300 text-sm leading-relaxed mb-4 flex-1">
                    {t.quote || defaultTestimonialQuote}
                  </p>
                  <h3 className="text-[#FFB70F] font-semibold">{t.name}</h3>
                  <p className="text-white/80 text-sm">{t.role}</p>
                </div>
              </AnimatedCard>
            ))}
          </AnimatedStaggerGrid>
          {testimonials.length > 0 && (
            <AnimatedSection className="text-center mt-10" variant="fadeSlideUp">
              <Link
                href="/testimonials"
                className="inline-block rounded-lg bg-[#FFB70F] px-6 py-3 text-base font-semibold text-black hover:bg-[#F73322] hover:text-white transition-colors duration-300"
              >
                More testimonials
              </Link>
            </AnimatedSection>
          )}
        </div>
      </section>

      {/* CTA section — scroll reveal, single prominent CTA */}
      <AnimatedSection variant="fadeSlideUp" className="py-16 md:py-24 bg-[#171A26] relative z-10">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Start your martial arts journey today
          </h2>
          <p className="text-gray-400 mb-8">
            Join Rock Martial Arts Academy and train with expert masters in a supportive community.
          </p>
          {!shouldReduceMotion ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Link
                href="/register"
                className="inline-block rounded-lg bg-[#FFB70F] px-8 py-4 text-lg font-semibold text-black hover:bg-[#F73322] hover:text-white transition-colors duration-300"
              >
                Get Started
              </Link>
            </motion.div>
          ) : (
            <Link
              href="/register"
              className="inline-block rounded-lg bg-[#FFB70F] px-8 py-4 text-lg font-semibold text-black"
            >
              Get Started
            </Link>
          )}
        </div>
      </AnimatedSection>
    </main>
  )
}
