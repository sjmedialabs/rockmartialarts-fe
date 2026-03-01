"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface StatCardProps {
  label: string
  value: string | number
  subtitle: string
  badgeText?: string
}

export default function StatCard(props: StatCardProps) {
  const { label, value, subtitle, badgeText } = props
  return (
    <Card className="h-48 shadow-md">
      <CardContent className="px-4">
        <div className="flex justify-between flex-col gap-10">
          <div className="flex flex-col xl:flex-row justify-between mt-4">
            <p className="text-xs font-base text-[#9593A8]">{label}</p>
            {badgeText ? <Badge variant="secondary" className="bg-gray-100">{badgeText}</Badge> : null}
          </div>
          <div>
            <p className="text-2xl font-bold text-[#403C6B]">{value}</p>
            <p className="text-xs text-[#9593A8]">{subtitle}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
