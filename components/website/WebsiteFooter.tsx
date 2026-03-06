"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { toCourseSlug } from "@/lib/course-slug"

const quickLinks = [
  { label: "Courses", href: "/courses" },
  { label: "Store", href: "/store" },
]

const socialLinks = [
  { href: "#", img: "/assets/img/fb.png", alt: "facebook" },
  { href: "#", img: "/assets/img/x.png", alt: "twitter" },
  { href: "#", img: "/assets/img/ln.png", alt: "linkedin" },
  { href: "#", img: "/assets/img/insta.png", alt: "instagram" },
  { href: "#", img: "/assets/img/yt.png", alt: "youtube" },
]

type CourseItem = { id: string; title: string; name?: string }

export function WebsiteFooter() {
  const [courses, setCourses] = useState<CourseItem[]>([])

  useEffect(() => {
    let cancelled = false
    fetch("/api/backend/courses/public/all", { headers: { "Content-Type": "application/json" } })
      .then((res) => (res.ok ? res.json() : Promise.resolve({ courses: [] })))
      .then((data) => {
        if (cancelled) return
        const list = data.courses ?? data ?? []
        setCourses(Array.isArray(list) ? list : [])
      })
      .catch(() => {
        if (!cancelled) setCourses([])
      })
    return () => { cancelled = true }
  }, [])

  return (
    <footer className="bg-black text-gray-300 pt-12 pb-0">
      <div className="container mx-auto px-4 pt-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 text-left">
          <div className="lg:col-span-3">
            <img
              src="/logo.png"
              alt="Rock Martial Arts Academy"
              className="mb-4 w-[150px] h-auto"
              width={150}
              height={60}
            />
            <p className="text-sm leading-relaxed">
              Kungfu @ ROCK has improved my physical and mental strength, stamina, and focus. Self-defense
              skills have given me confidence to travel alone fearlessly. It&apos;s a life skill that I highly recommend
              for discipline, self-esteem, and fitness. Thank you ROCK team for the support.
            </p>
          </div>

          <div className="lg:col-span-3">
            <h6 className="text-[#FFB70F] font-semibold uppercase tracking-wide mb-4">Quick Links</h6>
            <ul className="list-none space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-gray-300 hover:text-[#FFB70F] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h6 className="text-[#FFB70F] font-semibold uppercase tracking-wide mb-4">Our Service</h6>
            <ul className="list-none space-y-2">
              {courses.length > 0
                ? courses.map((c) => (
                    <li key={c.id}>
                      <Link href={`/courses/${toCourseSlug(c)}`} className="text-gray-300 hover:text-[#FFB70F] transition-colors">
                        {c.title || c.name || c.id}
                      </Link>
                    </li>
                  ))
                : <li className="text-gray-500 text-sm">No courses yet</li>
              }
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h6 className="text-[#FFB70F] font-semibold uppercase tracking-wide mb-4">Contact</h6>
            <p className="text-sm mb-2">
              KJS Plaza, 4-39, Balaji Nagar Main Rd, Santoshi Nagar,<br />
              Secunderabad, Telangana 500087
            </p>
            <p className="flex items-center gap-2 mb-1 text-sm">
              <img src="/assets/img/phone_icon.png" alt="" className="w-4 h-4" />
              +91 8179041226, +91 8977933876
            </p>
            <p className="flex items-center gap-2 mb-4 text-sm">
              <img src="/assets/img/mail-icon.png" alt="" className="w-4 h-4" />
              info@rockmartialarts.com
            </p>
            <h6 className="text-[#FFB70F] font-semibold uppercase tracking-wide mb-3">Connect us on</h6>
            <div className="flex gap-3">
              {socialLinks.map((s) => (
                <Link key={s.alt} href={s.href} aria-label={s.alt}>
                  <img src={s.img} alt={s.alt} className="w-6 h-6 object-contain" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="text-center text-gray-500 mt-10 py-4 bg-gray-900/50">
        © Copyright 2025 | ROCK | All Rights Reserved.
      </div>
    </footer>
  )
}
