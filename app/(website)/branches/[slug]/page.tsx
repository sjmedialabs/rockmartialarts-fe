"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Loader2, ArrowLeft } from "lucide-react"
import AOS from "aos"
import {
  BranchHero,
  BranchInfoCards,
  BranchMap,
  BranchContact,
  BranchFacilities,
  BranchCourses,
} from "@/components/branch"
import type { BranchData } from "@/components/branch"

export default function BranchDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [branch, setBranch] = useState<BranchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: "ease-out-cubic",
      once: true,
      offset: 120,
    })
  }, [])

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(`/api/branches/${encodeURIComponent(slug)}`, {
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (res.status === 404) return null
        if (!res.ok) throw new Error("Failed to load branch")
        return res.json()
      })
      .then((data) => {
        if (!cancelled) {
          setBranch(data ?? null)
          if (!data) setError("Branch not found")
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load branch")
          setBranch(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  useEffect(() => {
    AOS.refresh()
  }, [branch])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#171A26] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <Loader2 className="w-12 h-12 animate-spin text-[#FFB70F]" />
          <p>Loading branch...</p>
        </div>
      </main>
    )
  }

  if (error || !branch) {
    return (
      <main className="min-h-screen bg-[#171A26] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Branch not found</h1>
          <p className="text-gray-400 mb-6">{error || "This branch may no longer exist."}</p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-[#FFB70F] hover:text-white font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to branches page
          </Link>
        </div>
      </main>
    )
  }

  const coverImage =
    (branch as BranchData & { gallery_images?: string[] }).gallery_images?.[0] ?? null

  return (
    <main className="min-h-screen bg-[#171A26]">
      <BranchHero branch={branch} coverImageUrl={coverImage} />
      <BranchCourses branch={branch} />
      <BranchFacilities branch={branch} />
      <BranchInfoCards branch={branch} />
      <BranchMap branch={branch} />
      <BranchContact branch={branch} />
    </main>
  )
}
