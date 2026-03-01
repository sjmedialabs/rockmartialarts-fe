"use client"

import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TabItem {
  label: string
  value: string
  active: boolean
  onClick: () => void
}

interface TableCardProps {
  title: string
  tabs?: TabItem[]
  filters?: React.ReactNode
  children: React.ReactNode
  pagination?: React.ReactNode
}

export default function TableCard({ title, tabs, filters, children, pagination }: TableCardProps) {
  return (
    <Card className="lg:col-span-2 shadow-md rounded-2xl">
      <CardHeader>
        {tabs && tabs.length > 0 ? (
          <div className="flex space-x-4">
            {tabs.map((tab) => (
              <Button
                key={tab.value}
                className={tab.active ? "rounded-md px-4 bg-yellow-400 hover:bg-yellow-500 text-black" : "rounded-md px-4 bg-gray-100 text-gray-700"}
                onClick={tab.onClick}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg text-[#4F5077]">{title}</h3>
            {filters}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {filters && tabs && <div className="mb-4 flex justify-between items-center">{filters}</div>}
        {children}
        {pagination}
      </CardContent>
    </Card>
  )
}
