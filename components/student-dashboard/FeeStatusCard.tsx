"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PerformanceFeeStatus } from "@/lib/student-performance-types"
import { CreditCard } from "lucide-react"

function fmtDue(d?: string | null) {
  if (!d) return "—"
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
  } catch {
    return String(d)
  }
}

export function FeeStatusCard({ data }: { data: PerformanceFeeStatus }) {
  const st = (data.status || "").toLowerCase()
  const variant =
    st === "paid"
      ? "bg-emerald-100 text-emerald-900"
      : st.includes("renewal") || st === "overdue"
        ? "bg-orange-100 text-orange-900"
        : st.includes("pend") || st === "processing"
          ? "bg-amber-100 text-amber-900"
          : "bg-slate-100 text-slate-800"
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
          <CreditCard className="h-5 w-5 text-slate-700" />
          Fee status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-slate-600">Status</span>
          <Badge className={variant}>{data.status || "—"}</Badge>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Next due date</p>
          <p className="font-medium text-slate-900">{fmtDue(data.next_due_date)}</p>
        </div>
      </CardContent>
    </Card>
  )
}
