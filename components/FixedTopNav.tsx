"use client"

import { useCMS } from "@/contexts/CMSContext"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LogIn, Loader2, ChevronDown, BookOpen } from "lucide-react"
import { BranchesNavDropdown } from "@/components/BranchesNavDropdown"
import { toCourseSlug } from "@/lib/course-slug"

const navLinks = [
  { label: "Store", href: "/store" },
]

type CourseNavItem = {
  id: string
  title?: string
  name?: string
  code?: string
}

function CoursesNavDropdown({ variant = "desktop", onNavigate }: { variant?: "desktop" | "mobile"; onNavigate?: () => void }) {
  const [courses, setCourses] = useState<CourseNavItem[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isMobile = variant === "mobile"

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!open || courses.length > 0) return
    setLoading(true)
    fetch("/api/backend/courses/public/all", { headers: { "Content-Type": "application/json" } })
      .then((res) => (res.ok ? res.json() : Promise.resolve({ courses: [] })))
      .then((data) => {
        const list = data.courses ?? data ?? []
        setCourses(Array.isArray(list) ? list : [])
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false))
  }, [open, courses.length])

  const displayName = (c: CourseNavItem) => c.title || c.name || c.code || "Course"

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
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          className={
            isMobile
              ? "mt-2 w-full rounded-lg border border-gray-700 bg-[#171A26] py-2 shadow-xl z-50"
              : "absolute left-0 top-full mt-1 min-w-[260px] rounded-lg border border-gray-700 bg-[#171A26] py-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          }
          onMouseLeave={isMobile ? undefined : () => setOpen(false)}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-4 py-4 text-gray-400 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading courses...</span>
            </div>
          ) : courses.length === 0 ? (
            <div className="px-4 py-3 text-center text-gray-400 text-sm">No courses available</div>
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
                    <BookOpen className="h-4 w-4 text-[#FFB70F] mt-0.5 flex-shrink-0" />
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

export function FixedTopNav() {
  const { cms } = useCMS()
  const navbarLogo = cms?.branding?.navbar_logo || "/logo.png"

  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(typeof window !== "undefined" ? window.scrollY > 8 : false)
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 transition-[background-color,backdrop-filter] duration-300 ${
        scrolled ? "bg-[#171A26]/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex-shrink-0">
          <img
            src={navbarLogo}
            alt="Rock Martial Arts Academy"
            className="w-[100px] h-[100px] object-contain"
          />
        </Link>

        <ul className="hidden items-center gap-6 lg:flex">
          <li>
            <CoursesNavDropdown />
          </li>
          {navLinks.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-sm font-medium uppercase tracking-wide text-white hover:text-[#FFB70F]"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li>
            <BranchesNavDropdown />
          </li>
          <li>
            <Link
              href="/contact"
              className="text-sm font-medium uppercase tracking-wide text-white hover:text-[#FFB70F]"
            >
              Contact
            </Link>
          </li>
          <li>
            <Link
              href="/register"
              className="inline-block rounded-[10px] bg-white px-5 py-3.5 text-base font-medium text-black transition-colors hover:bg-[#F73322] hover:text-white"
            >
              Register now
            </Link>
          </li>
          <li>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-[10px] bg-[#FFB70F] px-5 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#F73322] hover:text-black"
            >
              <LogIn className="h-5 w-5" />
              Login
            </Link>
          </li>
        </ul>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-white/10 hover:text-white"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] border-[#766E6E] bg-[#171A26] px-6 py-6">
            <ul className="mt-4 flex flex-col gap-6">
              <li>
                <CoursesNavDropdown variant="mobile" onNavigate={() => setMobileOpen(false)} />
              </li>
              {navLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block text-lg font-medium uppercase tracking-wide text-white hover:text-[#FFB70F]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <BranchesNavDropdown variant="mobile" onNavigate={() => setMobileOpen(false)} />
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-lg font-medium uppercase tracking-wide text-white hover:text-[#FFB70F]"
                  onClick={() => setMobileOpen(false)}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="block w-full rounded-[10px] bg-white px-5 py-3.5 text-base font-medium text-black text-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Register now
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#FFB70F] px-5 py-3.5 text-base font-medium text-white mt-1"
                  onClick={() => setMobileOpen(false)}
                >
                  <LogIn className="h-5 w-5" />
                  Login
                </Link>
              </li>
            </ul>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
