"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { ChartContainer } from "@/components/ui/chart"

interface PieChartProps {
  data: Array<{
    _id: string
    total: number
    count?: number
  }>
  title?: string
  height?: number
  showLegend?: boolean
  colors?: string[]
  formatValue?: (value: number) => string
}

const DEFAULT_COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'
]

const chartConfig = {
  value: {
    label: "Value",
  },
}

export function CustomPieChart({ 
  data, 
  title = "Pie Chart", 
  height = 300, 
  showLegend = true,
  colors = DEFAULT_COLORS,
  formatValue
}: PieChartProps) {
  // Transform data for chart
  const chartData = data.map((item, index) => ({
    name: item._id,
    value: item.total,
    count: item.count || 0,
    color: colors[index % colors.length]
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p style={{ color: data.color }}>
            Value: {formatValue ? formatValue(data.value) : data.value}
          </p>
          {data.count > 0 && (
            <p className="text-sm text-gray-600">
              Count: {data.count}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // Don't show labels for slices less than 5%
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export function DonutChart({ 
  data, 
  title = "Donut Chart", 
  height = 300, 
  showLegend = true,
  colors = DEFAULT_COLORS,
  formatValue
}: PieChartProps) {
  // Transform data for chart
  const chartData = data.map((item, index) => ({
    name: item._id,
    value: item.total,
    count: item.count || 0,
    color: colors[index % colors.length]
  }))

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.value / total) * 100).toFixed(1)
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p style={{ color: data.color }}>
            Value: {formatValue ? formatValue(data.value) : data.value}
          </p>
          <p className="text-sm text-gray-600">
            Percentage: {percentage}%
          </p>
          {data.count > 0 && (
            <p className="text-sm text-gray-600">
              Count: {data.count}
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null // Don't show labels for slices less than 5%
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            innerRadius={40}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && <Legend />}
          {/* Center text showing total */}
          <text 
            x="50%" 
            y="50%" 
            textAnchor="middle" 
            dominantBaseline="middle" 
            className="fill-foreground text-lg font-bold"
          >
            {formatValue ? formatValue(total) : total}
          </text>
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export function SimplePieChart({ 
  data, 
  dataKey = "total",
  nameKey = "_id",
  title = "Pie Chart", 
  height = 300,
  colors = DEFAULT_COLORS,
  formatValue
}: {
  data: any[]
  dataKey?: string
  nameKey?: string
  title?: string
  height?: number
  colors?: string[]
  formatValue?: (value: number) => string
}) {
  const chartData = data.map((item, index) => ({
    name: item[nameKey],
    value: item[dataKey],
    color: colors[index % colors.length]
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p style={{ color: data.color }}>
            {formatValue ? formatValue(data.value) : data.value}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
