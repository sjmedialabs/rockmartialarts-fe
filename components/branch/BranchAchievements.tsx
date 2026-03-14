"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { AchievementCard, type AchievementCardData } from "@/components/achievements"
import { getBackendApiUrl } from "@/lib/config"

const LIMIT = 12

interface BranchAchievementsProps {
  branchId: string
}

export function BranchAchievements({ branchId }: BranchAchievementsProps) {
  const [achievements, setAchievements] = useState<AchievementCardData[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [skip, setSkip] = useState(0)

  useEffect(() => {
    if (!branchId) return
    let cancelled = false
    setLoading(true)
    fetch(
      getBackendApiUrl(`achievements/public/branch/${encodeURIComponent(branchId)}?skip=0&limit=${LIMIT}`)
    )
      .then((res) => (res.ok ? res.json() : { achievements: [], total: 0 }))
      .then((data) => {
        if (!cancelled) {
          setAchievements(data.achievements || [])
          setTotal(data.total ?? 0)
          setSkip(LIMIT)
        }
      })
      .catch(() => {
        if (!cancelled) setAchievements([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [branchId])

  const loadMore = () => {
    fetch(
      getBackendApiUrl(
        `achievements/public/branch/${encodeURIComponent(branchId)}?skip=${skip}&limit=${LIMIT}`
      )
    )
      .then((res) => (res.ok ? res.json() : { achievements: [] }))
      .then((data) => {
        const list = data.achievements || []
        setAchievements((prev) => [...prev, ...list])
        setSkip((s) => s + list.length)
      })
  }

  const hasMore = total > achievements.length

  return (
    <section className="py-16 md:py-20 bg-[#171A26] relative z-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="w-16 h-1 bg-[#FFB70F] mx-auto mb-4" />
        <p className="text-[#FFB70F] uppercase tracking-widest text-sm mb-2 text-center">
          Accomplishments
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-[#FFB70F] mb-10 text-center">
          Student Achievements
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-[#FFB70F]" />
          </div>
        ) : achievements.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No achievements to display yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((a) => (
                <AchievementCard key={a.id} achievement={a} showStudent />
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-10">
                <button
                  type="button"
                  onClick={loadMore}
                  className="inline-block rounded-lg bg-[#FFB70F] px-6 py-3 text-base font-semibold text-black hover:bg-[#F73322] hover:text-white transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
