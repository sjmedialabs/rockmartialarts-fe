"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PerformanceCoachFeedback } from "@/lib/student-performance-types"
import { MessageSquareQuote } from "lucide-react"

export function CoachFeedback({ data }: { data: PerformanceCoachFeedback }) {
  const text = (data.feedback || "").trim()
  return (
    <Card className="border-amber-100 shadow-sm bg-amber-50/20">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
          <MessageSquareQuote className="h-5 w-5 text-amber-700" />
          Coach feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        {text ? (
          <blockquote className="text-slate-800 text-sm leading-relaxed border-l-4 border-amber-400 pl-4 italic">
            {text}
          </blockquote>
        ) : (
          <p className="text-sm text-slate-500">No feedback yet.</p>
        )}
      </CardContent>
    </Card>
  )
}
