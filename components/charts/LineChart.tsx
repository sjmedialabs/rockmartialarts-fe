"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { ChartContainer } from "@/components/ui/chart"

interface LineChartProps {
  data: Array<{
    _id: string
    total: number
    count?: number
  }>
  title?: string
  height?: number
  showLegend?: boolean
  color?: string
  formatValue?: (value: number) => string
}

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--chart-1))",
  },
  count: {
    label: "Count",
    color: "hsl(var(--chart-2))",
  },
}

export function CustomLineChart({ 
  data, 
  title = "Line Chart", 
  height = 300, 
  showLegend = true,
  color = "#8884d8",
  formatValue
}: LineChartProps) {
  // Transform data for chart
  const chartData = data.map(item => ({
    name: item._id,
    value: item.total,
    count: item.count || 0
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === 'value' 
                ? `Value: ${formatValue ? formatValue(entry.value) : entry.value}`
                : `Count: ${entry.value}`
              }
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <ChartContainer config={chartConfig} className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="name" 
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 12 }}
            tickFormatter={formatValue}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export function DualLineChart({ 
  data, 
  title = "Dual Line Chart", 
  height = 200,
  formatValue
}: LineChartProps) {
  // Transform data for chart
  const chartData = data.map(item => ({
    name: item._id,
    value: item.total,
    count: item.count || 0
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === 'value' 
                ? `Value: ${formatValue ? formatValue(entry.value) : entry.value}`
                : `Count: ${entry.value}`
              }
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <ChartContainer config={chartConfig} className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="name" 
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId="left"
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 12 }}
            tickFormatter={formatValue}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {/* Gray line */}
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="value" 
            stroke="#4B5563" // Tailwind gray-600
            strokeWidth={2}
            dot={{ fill: "#4B5563", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
          {/* Yellow line */}
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="count" 
            stroke="#EAB308" // Tailwind yellow-500
            strokeWidth={2}
            dot={{ fill: "#EAB308", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}


export function AreaLineChart({ 
  data, 
  title = "Area Chart", 
  height = 300, 
  showLegend = true,
  color = "#8884d8",
  formatValue
}: LineChartProps) {
  // Transform data for chart
  const chartData = data.map(item => ({
    name: item._id,
    value: item.total,
    count: item.count || 0
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === 'value' 
                ? `Value: ${formatValue ? formatValue(entry.value) : entry.value}`
                : `Count: ${entry.value}`
              }
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <ChartContainer config={chartConfig} className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="name" 
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            className="text-xs fill-muted-foreground"
            tick={{ fontSize: 12 }}
            tickFormatter={formatValue}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color}
            fill={color}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export function SimpleLineChart({ 
  data, 
  dataKey = "total",
  nameKey = "_id",
  title = "Line Chart", 
  height = 300,
  color = "#8884d8",
  formatValue
}: {
  data: any[]
  dataKey?: string
  nameKey?: string
  title?: string
  height?: number
  color?: string
  formatValue?: (value: number) => string
}) {
  const chartData = data.map(item => ({
    name: item[nameKey],
    value: item[dataKey]
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          <p style={{ color: payload[0].color }}>
            {formatValue ? formatValue(value) : value}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="name" 
          className="text-xs fill-muted-foreground"
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          className="text-xs fill-muted-foreground"
          tick={{ fontSize: 12 }}
          tickFormatter={formatValue}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
