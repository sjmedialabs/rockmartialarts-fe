"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PerformanceAchievements } from "@/lib/student-performance-types"
import { Award } from "lucide-react"

const items: { key: keyof PerformanceAchievements; label: string; tone: string }[] = [
  { key: "gold_medals", label: "Gold", tone: "text-amber-600" },
  { key: "silver_medals", label: "Silver", tone: "text-slate-500" },
  { key: "bronze_medals", label: "Bronze", tone: "text-amber-800/80" },
  { key: "competitions_participated", label: "Competitions", tone: "text-slate-700" },
  { key: "certificates_earned", label: "Certificates", tone: "text-slate-700" },
]

export function AchievementCard({ data }: { data: PerformanceAchievements }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
          <Award className="h-5 w-5 text-amber-500" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {items.map(({ key, label, tone }) => (
            <div key={key} className="rounded-lg bg-slate-50/80 border border-slate-100 p-3 text-center">
              <p className={`text-2xl font-bold ${tone}`}>{Number(data[key] ?? 0)}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
