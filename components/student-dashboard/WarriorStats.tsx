"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { PerformanceWarrior } from "@/lib/student-performance-types"
import { Flame } from "lucide-react"

export function WarriorStats({ warrior }: { warrior: PerformanceWarrior }) {
  const nl = warrior.next_level_progress == null ? null : Math.min(100, Math.max(0, Number(warrior.next_level_progress)))
  return (
    <Card className="border-amber-300/40 shadow-md bg-gradient-to-br from-slate-900 via-slate-900 to-amber-900/40 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-amber-100">
          <Flame className="h-5 w-5 text-amber-400" />
          Warrior stats
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-amber-100/70 uppercase tracking-wide">Training streak</p>
            <p className="text-2xl font-bold">{warrior.training_streak ?? 0} days</p>
          </div>
          <div>
            <p className="text-xs text-amber-100/70 uppercase tracking-wide">Rank</p>
            <p className="text-lg font-semibold">{warrior.rank?.trim() || "—"}</p>
          </div>
        </div>
        {nl != null ? (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-amber-100/80">
              <span>Next level progress</span>
              <span>{Math.round(nl)}%</span>
            </div>
            <Progress value={nl} className="h-2 bg-white/10" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
