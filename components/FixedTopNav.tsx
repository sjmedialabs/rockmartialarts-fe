"use client"

import { useCMS } from "@/contexts/CMSContext"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LogIn } from "lucide-react"

const navLinks = [
  { label: "Courses", href: "/courses" },
  { label: "Branches", href: "/branches" },
  { label: "Store", href: "/store" },
]

export function FixedTopNav() {
  const { cms } = useCMS()
  const navbarLogo = cms?.branding?.navbar_logo || "/logo.png"

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#766E6E] bg-[#171A26] px-4 py-2">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link href="/" className="flex-shrink-0">
          <img
            src={navbarLogo}
            alt="Rock Martial Arts Academy"
            className="w-[100px] h-[100px] object-contain"
          />
        </Link>

        <ul className="hidden items-center gap-6 lg:flex">
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

        <Sheet>
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
          <SheetContent side="right" className="w-[280px] border-[#766E6E] bg-[#171A26]">
            <ul className="mt-8 flex flex-col gap-6">
              {navLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-lg font-medium uppercase tracking-wide text-white hover:text-[#FFB70F]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/register"
                  className="inline-block rounded-[10px] bg-white px-5 py-3.5 text-base font-medium text-black"
                >
                  Register now
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-[10px] bg-[#FFB70F] px-5 py-3.5 text-base font-medium text-white"
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
