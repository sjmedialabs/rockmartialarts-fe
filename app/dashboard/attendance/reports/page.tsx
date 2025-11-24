"use client"

import { useState, useEffect } from "react"
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts"
import { 
  Calendar, 
  CalendarIcon, 
  Download, 
  Search, 
  Filter, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  RefreshCw,
  FileText,
  TrendingUp,
  MapPin,
  BookOpen,
  User,
  Award,
  ArrowRight,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Percent
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DashboardHeader from "@/components/dashboard-header"
import { SuperAdminAuth } from "@/lib/auth"

interface ReportData {
  daily_attendance: Array<{
    date: string
    student_present: number
    student_absent: number
    student_late: number
    coach_present: number
    coach_absent: number
    coach_late: number
    total_students: number
    total_coaches: number
  }>
  branch_performance: Array<{
    branch_id: string
    branch_name: string
    avg_student_attendance: number
    avg_coach_attendance: number
    total_students: number
    total_coaches: number
    best_day: string
    worst_day: string
  }>
  monthly_trends: Array<{
    month: string
    student_attendance_rate: number
    coach_attendance_rate: number
    total_sessions: number
  }>
  top_performers: {
    students: Array<{
      id: string
      name: string
      attendance_rate: number
      total_sessions: number
      branch_name: string
    }>
    coaches: Array<{
      id: string
      name: string
      attendance_rate: number
      total_sessions: number
      branch_name: string
    }>
  }
}

export default function AttendanceReportsPage() {
  // State management
  const [reportData, setReportData] = useState<ReportData>({
    daily_attendance: [],
    branch_performance: [],
    monthly_trends: [],
    top_performers: { students: [], coaches: [] }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<{from: Date, to: Date}>({
    from: subDays(new Date(), 30),
    to: new Date()
  })
  const [selectedBranch, setSelectedBranch] = useState<string>("all")
  const [reportType, setReportType] = useState<string>("overview")
  const [branches, setBranches] = useState<Array<{id: string, name: string}>>([])

  // Clear error after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Fetch branches
  const fetchBranches = async () => {
    try {
      if (!SuperAdminAuth.isAuthenticated()) return

      const headers = SuperAdminAuth.getAuthHeaders()
      const response = await fetch('http://31.97.224.169:8003/api/branches', {
        method: 'GET',
        headers
      })

      if (response.ok) {
        const data = await response.json()
        setBranches(data.branches || [])
      }
    } catch (error) {
      console.error("Error fetching branches:", error)
    }
  }

  // Fetch report data
  const fetchReportData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!SuperAdminAuth.isAuthenticated()) {
        setError("Authentication required")
        return
      }

      const headers = SuperAdminAuth.getAuthHeaders()
      const fromDate = format(dateRange.from, 'yyyy-MM-dd')
      const toDate = format(dateRange.to, 'yyyy-MM-dd')

      console.log(`🔄 Fetching attendance reports from ${fromDate} to ${toDate}`)

      // Generate mock report data for demonstration
      const mockReportData: ReportData = {
        daily_attendance: generateDailyAttendanceData(dateRange.from, dateRange.to),
        branch_performance: generateBranchPerformanceData(),
        monthly_trends: generateMonthlyTrendsData(),
        top_performers: generateTopPerformersData()
      }

      setReportData(mockReportData)
      console.log("✅ Report data loaded successfully")

    } catch (error) {
      console.error("❌ Error fetching report data:", error)
      setError("Failed to load report data. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  // Generate mock data functions
  const generateDailyAttendanceData = (from: Date, to: Date) => {
    const data = []
    const currentDate = new Date(from)
    
    while (currentDate <= to) {
      data.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        student_present: Math.floor(Math.random() * 50) + 30,
        student_absent: Math.floor(Math.random() * 15) + 5,
        student_late: Math.floor(Math.random() * 10) + 2,
        coach_present: Math.floor(Math.random() * 8) + 5,
        coach_absent: Math.floor(Math.random() * 3) + 1,
        coach_late: Math.floor(Math.random() * 2) + 1,
        total_students: 85,
        total_coaches: 12
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return data
  }

  const generateBranchPerformanceData = () => [
    {
      branch_id: "1",
      branch_name: "Madhapur Branch",
      avg_student_attendance: 87.5,
      avg_coach_attendance: 92.3,
      total_students: 45,
      total_coaches: 6,
      best_day: "Monday",
      worst_day: "Friday"
    },
    {
      branch_id: "2", 
      branch_name: "Hitech City Branch",
      avg_student_attendance: 82.1,
      avg_coach_attendance: 89.7,
      total_students: 38,
      total_coaches: 5,
      best_day: "Tuesday",
      worst_day: "Saturday"
    },
    {
      branch_id: "3",
      branch_name: "Gachibowli Branch", 
      avg_student_attendance: 91.2,
      avg_coach_attendance: 95.1,
      total_students: 52,
      total_coaches: 7,
      best_day: "Wednesday",
      worst_day: "Sunday"
    }
  ]

  const generateMonthlyTrendsData = () => [
    { month: "Jan 2025", student_attendance_rate: 85.2, coach_attendance_rate: 91.5, total_sessions: 120 },
    { month: "Feb 2025", student_attendance_rate: 87.8, coach_attendance_rate: 93.2, total_sessions: 115 },
    { month: "Mar 2025", student_attendance_rate: 83.4, coach_attendance_rate: 89.7, total_sessions: 125 },
    { month: "Apr 2025", student_attendance_rate: 89.1, coach_attendance_rate: 94.8, total_sessions: 118 },
    { month: "May 2025", student_attendance_rate: 86.7, coach_attendance_rate: 92.1, total_sessions: 122 }
  ]

  const generateTopPerformersData = () => ({
    students: [
      { id: "1", name: "Krishna Kumar", attendance_rate: 98.5, total_sessions: 45, branch_name: "Madhapur" },
      { id: "2", name: "Priya Sharma", attendance_rate: 96.2, total_sessions: 42, branch_name: "Hitech City" },
      { id: "3", name: "Raj Patel", attendance_rate: 94.8, total_sessions: 48, branch_name: "Gachibowli" },
      { id: "4", name: "Sneha Reddy", attendance_rate: 93.1, total_sessions: 41, branch_name: "Madhapur" },
      { id: "5", name: "Arun Kumar", attendance_rate: 91.7, total_sessions: 44, branch_name: "Hitech City" }
    ],
    coaches: [
      { id: "1", name: "Sunil Kumar", attendance_rate: 100.0, total_sessions: 50, branch_name: "Madhapur" },
      { id: "2", name: "Abhi Ram", attendance_rate: 98.5, total_sessions: 48, branch_name: "Gachibowli" },
      { id: "3", name: "Sarah Coach", attendance_rate: 96.8, total_sessions: 47, branch_name: "Hitech City" },
      { id: "4", name: "Mike Johnson", attendance_rate: 95.2, total_sessions: 45, branch_name: "Madhapur" },
      { id: "5", name: "Lisa Wong", attendance_rate: 93.9, total_sessions: 46, branch_name: "Gachibowli" }
    ]
  })

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchBranches()
  }, [])

  useEffect(() => {
    fetchReportData()
  }, [dateRange, selectedBranch])

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const exportDailyReport = () => exportToCSV(reportData.daily_attendance, 'daily_attendance_report')
  const exportBranchReport = () => exportToCSV(reportData.branch_performance, 'branch_performance_report')
  const exportTopPerformers = () => exportToCSV([
    ...reportData.top_performers.students.map(s => ({...s, type: 'student'})),
    ...reportData.top_performers.coaches.map(c => ({...c, type: 'coach'}))
  ], 'top_performers_report')

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive attendance insights and performance metrics</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters and Controls */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date Range</label>
                <Select 
                  value={reportType} 
                  onValueChange={(value) => {
                    setReportType(value)
                    const today = new Date()
                    switch(value) {
                      case 'week':
                        setDateRange({from: startOfWeek(today), to: endOfWeek(today)})
                        break
                      case 'month':
                        setDateRange({from: startOfMonth(today), to: endOfMonth(today)})
                        break
                      case 'quarter':
                        setDateRange({from: subDays(today, 90), to: today})
                        break
                      default:
                        setDateRange({from: subDays(today, 30), to: today})
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">Last 3 Months</SelectItem>
                    <SelectItem value="overview">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Branch Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Branch</label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Actions</label>
                <div className="flex gap-2">
                  <Button
                    onClick={fetchReportData}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Export Options */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Export</label>
                <div className="flex gap-2">
                  <Button
                    onClick={exportDailyReport}
                    variant="outline"
                    size="sm"
                    disabled={loading || reportData.daily_attendance.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="branches">Branches</TabsTrigger>
            <TabsTrigger value="performers">Top Performers</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Activity className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Avg Daily Attendance</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {reportData.daily_attendance.length > 0
                          ? (reportData.daily_attendance.reduce((acc, day) =>
                              acc + ((day.student_present + day.coach_present) / (day.total_students + day.total_coaches)) * 100, 0
                            ) / reportData.daily_attendance.length).toFixed(1)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Target className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Best Performing Branch</p>
                      <p className="text-lg font-bold text-gray-900">
                        {reportData.branch_performance.length > 0
                          ? reportData.branch_performance.reduce((prev, current) =>
                              (prev.avg_student_attendance > current.avg_student_attendance) ? prev : current
                            ).branch_name
                          : 'N/A'}
                      </p>
                      <p className="text-sm text-green-600">
                        {reportData.branch_performance.length > 0
                          ? reportData.branch_performance.reduce((prev, current) =>
                              (prev.avg_student_attendance > current.avg_student_attendance) ? prev : current
                            ).avg_student_attendance.toFixed(1) + '%'
                          : '0%'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {reportData.monthly_trends.reduce((acc, month) => acc + month.total_sessions, 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Percent className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Overall Trend</p>
                      <p className="text-2xl font-bold text-green-600">+2.3%</p>
                      <p className="text-sm text-gray-500">vs last period</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daily Attendance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Daily Attendance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={reportData.daily_attendance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(value) => format(new Date(value), 'PPP')}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="student_present"
                          stackId="1"
                          stroke="#3B82F6"
                          fill="#3B82F6"
                          name="Students Present"
                        />
                        <Area
                          type="monotone"
                          dataKey="coach_present"
                          stackId="1"
                          stroke="#10B981"
                          fill="#10B981"
                          name="Coaches Present"
                        />
                        <Area
                          type="monotone"
                          dataKey="student_late"
                          stackId="2"
                          stroke="#F59E0B"
                          fill="#F59E0B"
                          name="Students Late"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Monthly Attendance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={reportData.monthly_trends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="student_attendance_rate"
                          stroke="#3B82F6"
                          strokeWidth={3}
                          name="Student Attendance %"
                        />
                        <Line
                          type="monotone"
                          dataKey="coach_attendance_rate"
                          stroke="#10B981"
                          strokeWidth={3}
                          name="Coach Attendance %"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Attendance Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChartIcon className="h-5 w-5 mr-2" />
                    Attendance Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: 'Present',
                              value: reportData.daily_attendance.reduce((acc, day) => acc + day.student_present + day.coach_present, 0),
                              fill: '#10B981'
                            },
                            {
                              name: 'Absent',
                              value: reportData.daily_attendance.reduce((acc, day) => acc + day.student_absent + day.coach_absent, 0),
                              fill: '#EF4444'
                            },
                            {
                              name: 'Late',
                              value: reportData.daily_attendance.reduce((acc, day) => acc + day.student_late + day.coach_late, 0),
                              fill: '#F59E0B'
                            }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {[0, 1, 2].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Branches Tab */}
          <TabsContent value="branches" className="space-y-6">
            {/* Branch Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Branch Performance Comparison
                  </span>
                  <Button onClick={exportBranchReport} size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.branch_performance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="branch_name"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="avg_student_attendance"
                        fill="#3B82F6"
                        name="Student Attendance %"
                      />
                      <Bar
                        dataKey="avg_coach_attendance"
                        fill="#10B981"
                        name="Coach Attendance %"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Branch Details Table */}
            <Card>
              <CardHeader>
                <CardTitle>Branch Performance Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Branch
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Students
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Coaches
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Attendance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Coach Attendance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Best Day
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Worst Day
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.branch_performance.map((branch) => (
                        <tr key={branch.branch_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-900">
                                {branch.branch_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {branch.total_students}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {branch.total_coaches}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2 w-16">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${branch.avg_student_attendance}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {branch.avg_student_attendance.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2 w-16">
                                <div
                                  className="bg-green-600 h-2 rounded-full"
                                  style={{ width: `${branch.avg_coach_attendance}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {branch.avg_coach_attendance.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className="bg-green-100 text-green-800">
                              {branch.best_day}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className="bg-red-100 text-red-800">
                              {branch.worst_day}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Performers Tab */}
          <TabsContent value="performers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Students */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Top Performing Students
                    </span>
                    <Button onClick={exportTopPerformers} size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.top_performers.students.map((student, index) => (
                      <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                            <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{student.name}</h4>
                            <p className="text-sm text-gray-500">{student.branch_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {student.attendance_rate.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.total_sessions} sessions
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Coaches */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Top Performing Coaches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.top_performers.coaches.map((coach, index) => (
                      <div key={coach.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                            <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{coach.name}</h4>
                            <p className="text-sm text-gray-500">{coach.branch_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {coach.attendance_rate.toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-500">
                            {coach.total_sessions} sessions
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Comparison Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Top Performers Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        ...reportData.top_performers.students.slice(0, 5).map(s => ({
                          name: s.name,
                          attendance_rate: s.attendance_rate,
                          type: 'Student',
                          fill: '#3B82F6'
                        })),
                        ...reportData.top_performers.coaches.slice(0, 5).map(c => ({
                          name: c.name,
                          attendance_rate: c.attendance_rate,
                          type: 'Coach',
                          fill: '#10B981'
                        }))
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="attendance_rate" name="Attendance Rate %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recognition Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Award className="h-8 w-8" />
                    <div className="ml-4">
                      <p className="text-sm font-medium opacity-90">Perfect Attendance</p>
                      <p className="text-2xl font-bold">
                        {reportData.top_performers.students.filter(s => s.attendance_rate === 100).length +
                         reportData.top_performers.coaches.filter(c => c.attendance_rate === 100).length}
                      </p>
                      <p className="text-sm opacity-75">Students & Coaches</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-400 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <TrendingUp className="h-8 w-8" />
                    <div className="ml-4">
                      <p className="text-sm font-medium opacity-90">Above 95%</p>
                      <p className="text-2xl font-bold">
                        {reportData.top_performers.students.filter(s => s.attendance_rate >= 95).length +
                         reportData.top_performers.coaches.filter(c => c.attendance_rate >= 95).length}
                      </p>
                      <p className="text-sm opacity-75">High Performers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8" />
                    <div className="ml-4">
                      <p className="text-sm font-medium opacity-90">Above 90%</p>
                      <p className="text-2xl font-bold">
                        {reportData.top_performers.students.filter(s => s.attendance_rate >= 90).length +
                         reportData.top_performers.coaches.filter(c => c.attendance_rate >= 90).length}
                      </p>
                      <p className="text-sm opacity-75">Good Performers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
