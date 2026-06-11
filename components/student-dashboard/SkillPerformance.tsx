"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { PerformanceSkills } from "@/lib/student-performance-types"
import { Gauge } from "lucide-react"

function Row({ label, value }: { label: string; value: number | null | undefined }) {
  const v = value == null || Number.isNaN(Number(value)) ? 0 : Math.min(100, Math.max(0, Number(value)))
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-600">
        <span>{label}</span>
        <span className="font-semibold text-slate-800">{value == null ? "—" : `${Math.round(v)}%`}</span>
      </div>
      <Progress value={v} className="h-2" />
    </div>
  )
}

export function SkillPerformance({ skills }: { skills: PerformanceSkills }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
          <Gauge className="h-5 w-5 text-amber-600" />
          Skill performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Row label="Strength" value={skills.strength ?? null} />
        <Row label="Speed" value={skills.speed ?? null} />
        <Row label="Flexibility" value={skills.flexibility ?? null} />
        <Row label="Technique" value={skills.technique ?? null} />
      </CardContent>
    </Card>
  )
}
