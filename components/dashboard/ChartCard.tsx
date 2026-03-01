"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ChartCardProps {
  title: string
  children: React.ReactNode
  viewReportPath?: string
  /** Optional select controls (e.g. branch, monthly) - same style as Super Admin */
  sortSelects?: React.ReactNode
}

/** Same style as Super Admin revenue chart card. */
export default function ChartCard({ title, children, viewReportPath, sortSelects }: ChartCardProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-[#4F5077]">{title}</CardTitle>
          <div className="flex items-center space-x-4">
            {viewReportPath && (
              <Button variant="link" className="text-[#5A6ACF] text-xs border border-gray-200 rounded-lg">
                View Report
              </Button>
            )}
            {sortSelects && <div className="flex items-center space-x-2">{sortSelects}</div>}
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
