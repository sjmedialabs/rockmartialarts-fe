"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PerformanceAttendance } from "@/lib/student-performance-types"
import { CalendarCheck2 } from "lucide-react"

export function AttendanceCard({ data }: { data: PerformanceAttendance }) {
  const pct = data.attendance_percent == null ? "—" : `${data.attendance_percent}%`
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
          <CalendarCheck2 className="h-5 w-5 text-emerald-600" />
          Training record
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 text-sm">
        <div className="rounded-lg bg-emerald-50/60 border border-emerald-100 p-3">
          <p className="text-xs text-emerald-800/80 uppercase tracking-wide">Classes attended</p>
          <p className="text-2xl font-bold text-emerald-900">{data.classes_attended}</p>
        </div>
        <div className="rounded-lg bg-rose-50/60 border border-rose-100 p-3">
          <p className="text-xs text-rose-800/80 uppercase tracking-wide">Classes missed</p>
          <p className="text-2xl font-bold text-rose-900">{data.classes_missed}</p>
        </div>
        <div className="col-span-2 rounded-lg bg-slate-50 border border-slate-100 p-3 flex items-center justify-between">
          <span className="text-slate-600">Attendance</span>
          <span className="text-xl font-bold text-slate-900">{pct}</span>
        </div>
      </CardContent>
    </Card>
  )
}
