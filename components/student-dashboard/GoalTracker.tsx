"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { PerformanceGoal } from "@/lib/student-performance-types"
import { Target } from "lucide-react"

export function GoalTracker({ goal }: { goal: PerformanceGoal }) {
  const p = goal.progress_percentage == null ? null : Math.min(100, Math.max(0, Number(goal.progress_percentage)))
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
          <Target className="h-5 w-5 text-rose-600" />
          Current goal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-slate-800 font-medium">{goal.current_goal?.trim() || "—"}</p>
        {goal.target_belt ? (
          <p className="text-xs text-slate-500">
            Target: <span className="text-slate-800 font-medium">{goal.target_belt}</span>
          </p>
        ) : null}
        {p != null ? (
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Progress</span>
              <span>{Math.round(p)}%</span>
            </div>
            <Progress value={p} className="h-2" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
