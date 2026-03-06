import Link from "next/link"

export const metadata = {
  title: "Rock Martial Arts Academy | Fitness & Dance",
  description: "Strengthen, discipline, and empower with martial arts. Shaolin Kung Fu, Taekwondo, Kick Boxing, Kuchipudi and more.",
}

const classes = [
  { name: "Shaolin Kung Fu", img: "/assets/img/courses/choose_img1.png", href: "/courses" },
  { name: "Taekwondo", img: "/assets/img/courses/choose_img2.png", href: "#" },
  { name: "Kick Boxing", img: "/assets/img/courses/choose_img3.png", href: "#" },
  { name: "Kuchipudi", img: "/assets/img/courses/choose_img4.png", href: "#" },
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

const trainers = [
  { name: "MANISH JADHAV", role: "Kung fu Trainers", img: "/assets/img/courses/kung-fu-trainer.png" },
  { name: "NAGAMA SHAIKH", role: "Takewondo Trainers", img: "/assets/img/courses/takewondo_trainer.png" },
  { name: "Gogineni Venkata", role: "Weapons Trainers", img: "/assets/img/courses/weapons_trainers.png" },
  { name: "Gayatri krishna", role: "Yoga Trainers", img: "/assets/img/courses/yoga_trainers.png" },
]

const testimonials = [
  { name: "Divya Menon", role: "Yoga Instructor & Environmentalist" },
  { name: "Rosan Gupta", role: "Project Manager" },
  { name: "Yogitha Narayan", role: "Software developer" },
  { name: "Divya Menon", role: "Analyst" },
]

const testimonialQuote =
  "Kungfu at UMAI has improved my physical and mental strength, stamina, and speed. Self-defense skills have given me confidence to travel alone fearlessly. It's a life skill that I highly recommend for discipline, self-esteem, and fitness. Thank you UMAI team for the support."

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#171A26]">
      {/* Hero / Slider */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/assets/img/slider.mp4" type="video/mp4" />
          <source src="/assets/img/slider.webm" type="video/webm" />
          <source src="/assets/img/slider.ogv" type="video/ogg" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
        <div className="container relative z-10 mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold uppercase tracking-wide mb-4">
            IT&apos;S NOT FITNESS.
            <br />
            IT&apos;S LIFE.
          </h1>
          <h6 className="text-lg md:text-xl max-w-2xl mx-auto">
            Strengthen, Discipline, and Empower Your child with martial arts!
          </h6>
        </div>
      </section>

      {/* Tagline */}
      <section className="py-16 md:py-20 bg-[#171A26]">
        <div className="container mx-auto px-4 max-w-5xl">
          <h1 className="text-center text-white text-xl md:text-2xl lg:text-3xl font-medium">
            Learn martial arts with discipline energy enhance your physical and mental well-being with our
            holistic tai-chi training.
          </h1>
        </div>
      </section>

      {/* Our Classes - Courses */}
      <section id="courses" className="py-16 md:py-20 bg-[#171A26] scroll-mt-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <div className="w-16 h-1 bg-[#FFB70F] mx-auto mb-4" />
            <p className="text-[#FFB70F] uppercase tracking-widest text-sm mb-2">Choose</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#FFB70F]">Our Classes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {classes.map((c) => (
              <div key={c.name} className="text-center group">
                <div className="mb-4 overflow-hidden rounded-lg">
                  <img src={c.img} alt={c.name} className="w-full h-auto object-cover group-hover:scale-105 transition-transform" />
                </div>
                <h3 className="text-xl font-bold text-[#FFB70F] mb-4">{c.name}</h3>
                <Link
                  href={c.href}
                  className="inline-block rounded-lg bg-white px-5 py-3.5 text-base font-medium text-black hover:bg-[#F73322] hover:text-white transition-colors"
                >
                  Explore More
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Discover - Advantages */}
      <section className="py-16 md:py-20 bg-[#171A26]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img src="/assets/img/courses/tr_yourself.png" alt="Train yourself" className="w-full h-auto rounded-lg" />
            </div>
            <div>
              <p className="text-[#FFB70F] uppercase tracking-widest text-sm mb-2">Discover</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#FFB70F] mb-8">
                Advantages of
                <br />
                Rock Martial Arts
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <img src="/assets/img/courses/icon1.png" alt="" className="w-12 h-12 flex-shrink-0" />
                  <ul className="list-disc list-inside text-gray-300 space-y-2">
                    {physicalBenefits.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex gap-4 items-center">
                  <img src="/assets/img/courses/icon2.png" alt="" className="w-12 h-12 flex-shrink-0" />
                  <h3 className="text-2xl font-bold text-[#FFB70F]">Mental Benefits</h3>
                </div>
                <ul className="list-disc list-inside text-gray-300 space-y-2 ml-16">
                  {mentalBenefits.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Expert Masters */}
      <section className="py-16 md:py-20 bg-[#171A26]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <div className="w-16 h-1 bg-[#FFB70F] mx-auto mb-4" />
            <p className="text-[#FFB70F] uppercase tracking-widest text-sm mb-2">Our Members</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#FFB70F]">Our Expert Masters</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {trainers.map((t) => (
              <div key={t.name} className="flex flex-col sm:flex-row gap-6 bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <img src={t.img} alt={t.name} className="w-full sm:w-48 h-64 object-cover rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-1">{t.name}</h3>
                  <p className="text-[#FFB70F] font-semibold mb-3">{t.role}</p>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Quuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quiaolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam.
                  </p>
                  <img src="/assets/img/courses/stars.png" alt="Rating" className="mt-2 w-24 h-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 bg-[#171A26]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <div className="w-16 h-1 bg-[#FFB70F] mx-auto mb-4" />
            <p className="text-[#FFB70F] uppercase tracking-widest text-sm mb-2">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#FFB70F]">Success stories</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <img src="/assets/img/courses/quote.png" alt="" className="w-10 h-10 mb-3 opacity-80" />
                <p className="text-gray-300 text-sm leading-relaxed mb-4">{testimonialQuote}</p>
                <h3 className="text-[#FFB70F] font-semibold">{t.name}</h3>
                <p className="text-white/80 text-sm">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
