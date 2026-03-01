"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface SideCardProps {
  title: string
  /** Optional "Filter by" label + select - same style as Super Admin (w-20 bg-[#F1F1F1]) */
  filterLabel?: string
  filterSelect?: React.ReactNode
  children: React.ReactNode
  /** Optional footer action (e.g. View All) */
  actionLabel?: string
  onActionClick?: () => void
}

export default function SideCard({ title, filterLabel, filterSelect, children, actionLabel, onActionClick }: SideCardProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-[#4F5077]">{title}</CardTitle>
          {(filterLabel || filterSelect) && (
            <div className="flex items-center space-x-2">
              {filterLabel && <span className="text-sm text-black">{filterLabel}</span>}
              {filterSelect}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {children}
          {actionLabel && (
            <div>
              <Button variant="outline" size="sm" className="w-full" onClick={onActionClick}>
                {actionLabel}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
