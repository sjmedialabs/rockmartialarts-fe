"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
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
  ResponsiveContainer,
} from "recharts"
import {
  CalendarIcon,
  Download,
  Search,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  MapPin,
  BookOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import DashboardHeader from "@/components/dashboard-header"
import { SuperAdminAuth } from "@/lib/auth"

interface Student {
  id: string
  full_name: string
  email: string
  phone?: string
  courses?: Array<{
    id: string
    name: string
    course_id?: string
    course_name?: string
  }>
  branch_id?: string
  branch_name?: string
  attendance?: {
    status: "present" | "absent" | "late" | "not_marked"
    check_in_time?: string
    check_out_time?: string
    notes?: string
    marked_by?: string
  }
}

interface AttendanceRecord {
  id: string
  student_id: string
  student_name: string
  course_id: string
  course_name: string
  branch_id: string
  branch_name: string
  email: string
  phone?: string
  status: "present" | "absent" | "late" | "not_marked"
  check_in_time?: string
  check_out_time?: string
  notes?: string
  date: string
}

interface AttendanceStats {
  total_students: number
  present_today: number
  absent_today: number
  late_today: number
  not_marked_today: number
  attendance_rate: number
}

interface Branch {
  id: string
  name: string
  branch?: {
    name: string
  }
}

interface Course {
  id: string
  name: string
  title?: string
}

export default function SuperAdminStudentAttendancePage() {
  const router = useRouter()

  // Enhanced state management
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    total_students: 0,
    present_today: 0,
    absent_today: 0,
    late_today: 0,
    not_marked_today: 0,
    attendance_rate: 0
  })
  const [branches, setBranches] = useState<Branch[]>([])
  const [courses, setCourses] = useState<Course[]>([])

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedBranch, setSelectedBranch] = useState("all")
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  // View state
  const [viewMode, setViewMode] = useState<"today" | "range">("today")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined
  })

  // Saving state for individual records
  const [saveStatus, setSaveStatus] = useState<Record<string, 'idle' | 'saving' | 'success' | 'error'>>({})
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Filter attendance records based on search and filters
  const filteredRecords = attendanceRecords.filter(record => {
    const matchesSearch = record.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.branch_name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesBranch = selectedBranch === "all" || record.branch_id === selectedBranch
    const matchesCourse = selectedCourse === "all" || record.course_id === selectedCourse
    const matchesStatus = selectedStatus === "all" || record.status === selectedStatus

    return matchesSearch && matchesBranch && matchesCourse && matchesStatus
  })

  // Clear messages after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000)
      return () => clearTimeout(timer)
    }
  }, [error])

  // Fetch branches for filtering
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
        const branchList = (data.branches || []).map((branch: any) => ({
          id: branch.id,
          name: branch.branch?.name || branch.name || 'Unknown Branch'
        }))
        setBranches(branchList)
      }
    } catch (error) {
      console.error("Error fetching branches:", error)
    }
  }

  // Fetch courses for filtering
  const fetchCourses = async () => {
    try {
      if (!SuperAdminAuth.isAuthenticated()) return

      const headers = SuperAdminAuth.getAuthHeaders()
      const response = await fetch('http://31.97.224.169:8003/api/courses', {
        method: 'GET',
        headers
      })

      if (response.ok) {
        const data = await response.json()
        const courseList = (data.courses || []).map((course: any) => ({
          id: course.id,
          name: course.title || course.name || 'Unknown Course'
        }))
        setCourses(courseList)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    }
  }

  // Fetch attendance data for selected date
  const fetchAttendanceData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!SuperAdminAuth.isAuthenticated()) {
        setError("Authentication required")
        return
      }

      const headers = SuperAdminAuth.getAuthHeaders()
      const dateStr = format(selectedDate, 'yyyy-MM-dd')

      console.log(`🔄 Superadmin fetching attendance data for date: ${dateStr}`)

      // Use the unified attendance endpoint
      const response = await fetch(`http://31.97.224.169:8003/api/attendance/students?date=${dateStr}`, {
        method: 'GET',
        headers
      })

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Superadmin attendance data received:", data)

        const records: AttendanceRecord[] = (data.students || []).map((student: any) => {
          // Handle multiple courses per student
          const courses = student.courses || []
          const primaryCourse = courses[0] || {}

          return {
            id: `${student.id}_${primaryCourse.id || 'no-course'}_${dateStr}`,
            student_id: student.id,
            student_name: student.full_name || 'Unknown Student',
            course_id: primaryCourse.id || primaryCourse.course_id || '',
            course_name: primaryCourse.name || primaryCourse.course_name || 'No Course',
            branch_id: student.branch_id || '',
            branch_name: branches.find(b => b.id === student.branch_id)?.name || 'Unknown Branch',
            email: student.email || '',
            phone: student.phone || '',
            status: student.attendance?.status || "not_marked",
            check_in_time: student.attendance?.check_in_time ?
              new Date(student.attendance.check_in_time).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }) : undefined,
            check_out_time: student.attendance?.check_out_time ?
              new Date(student.attendance.check_out_time).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }) : undefined,
            notes: student.attendance?.notes || "",
            date: dateStr
          }
        })

        setAttendanceRecords(records)

        // Calculate statistics
        const stats = {
          total_students: records.length,
          present_today: records.filter(r => r.status === "present").length,
          absent_today: records.filter(r => r.status === "absent").length,
          late_today: records.filter(r => r.status === "late").length,
          not_marked_today: records.filter(r => r.status === "not_marked").length,
          attendance_rate: records.length > 0 ?
            (records.filter(r => r.status === "present" || r.status === "late").length / records.length) * 100 : 0
        }

        setAttendanceStats(stats)
        console.log("📊 Calculated stats:", stats)

      } else {
        const errorText = await response.text()
        console.error("❌ Failed to fetch attendance data:", response.status, errorText)
        setError(`Failed to fetch attendance data: ${response.status}`)
      }

    } catch (error) {
      console.error("❌ Error fetching attendance data:", error)
      setError("Failed to load attendance data. Please check your connection and try again.")
      setAttendanceRecords([])
      setAttendanceStats({
        total_students: 0,
        present_today: 0,
        absent_today: 0,
        late_today: 0,
        not_marked_today: 0,
        attendance_rate: 0
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle attendance marking with improved error handling and user feedback
  const handleMarkAttendance = async (recordId: string, status: "present" | "absent" | "late") => {
    try {
      setSaveStatus(prev => ({ ...prev, [recordId]: 'saving' }))
      setError(null) // Clear any previous errors

      console.log("🔄 Superadmin marking attendance for record:", recordId, "status:", status)

      if (!SuperAdminAuth.isAuthenticated()) {
        setSaveStatus(prev => ({ ...prev, [recordId]: 'error' }))
        setError("Authentication required. Please log in again.")
        return
      }

      const record = attendanceRecords.find(r => r.id === recordId)
      if (!record) {
        setSaveStatus(prev => ({ ...prev, [recordId]: 'error' }))
        setError("Attendance record not found. Please refresh the page.")
        return
      }

      // Validate required fields
      if (!record.course_id || !record.branch_id) {
        setSaveStatus(prev => ({ ...prev, [recordId]: 'error' }))
        setError("Missing course or branch information. Please contact support.")
        return
      }

      const headers = SuperAdminAuth.getAuthHeaders()

      const attendanceData = {
        user_id: record.student_id,
        user_type: "student",
        course_id: record.course_id,
        branch_id: record.branch_id,
        attendance_date: `${record.date}T10:00:00Z`,
        status: status,
        check_in_time: status !== "absent" ? new Date().toISOString() : null,
        notes: `Marked by superadmin on ${format(new Date(), 'PPP')}`
      }

      console.log(`💾 Saving attendance for ${record.student_name} with status: ${status}`)
      console.log("📤 Attendance data:", attendanceData)

      const response = await fetch(`http://31.97.224.169:8003/api/attendance/mark`, {
        method: 'POST',
        headers,
        body: JSON.stringify(attendanceData)
      })

      console.log(`📥 Response status: ${response.status}`)

      if (response.ok) {
        const result = await response.json()
        console.log(`✅ Successfully saved attendance for ${record.student_name}:`, result)

        setSaveStatus(prev => ({ ...prev, [recordId]: 'success' }))
        setSuccessMessage(`✅ Attendance marked as ${status.toUpperCase()} for ${record.student_name}`)

        // Update local state immediately for better UX
        setAttendanceRecords(prev =>
          prev.map(r =>
            r.id === recordId
              ? {
                  ...r,
                  status: status,
                  check_in_time: status !== "absent" ? new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  }) : undefined,
                  notes: attendanceData.notes
                }
              : r
          )
        )

        // Update statistics with the new data
        setAttendanceStats(prevStats => {
          const updatedRecords = attendanceRecords.map(r =>
            r.id === recordId ? { ...r, status } : r
          )

          const newStats = {
            total_students: updatedRecords.length,
            present_today: updatedRecords.filter(r => r.status === "present").length,
            absent_today: updatedRecords.filter(r => r.status === "absent").length,
            late_today: updatedRecords.filter(r => r.status === "late").length,
            not_marked_today: updatedRecords.filter(r => r.status === "not_marked").length,
            attendance_rate: updatedRecords.length > 0 ?
              (updatedRecords.filter(r => r.status === "present" || r.status === "late").length / updatedRecords.length) * 100 : 0
          }

          console.log("📊 Updated stats:", newStats)
          return newStats
        })

        // Clear success status after delay
        setTimeout(() => {
          setSaveStatus(prev => ({ ...prev, [recordId]: 'idle' }))
        }, 3000)

        // Refresh data to ensure consistency
        setTimeout(() => {
          fetchAttendanceData()
        }, 1000)

      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to save attendance for ${record.student_name}: ${response.status} ${errorText}`)

        let errorMessage = "Failed to save attendance"
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.detail || errorJson.message || errorMessage
        } catch {
          errorMessage = `${errorMessage}: ${response.status}`
        }

        setSaveStatus(prev => ({ ...prev, [recordId]: 'error' }))
        setError(`❌ ${errorMessage}`)
      }

    } catch (error) {
      console.error("❌ Error marking attendance:", error)
      setSaveStatus(prev => ({ ...prev, [recordId]: 'error' }))
      setError(`❌ Network error: ${error instanceof Error ? error.message : 'Please check your connection and try again.'}`)
    }
  }

  // Load initial data
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchBranches(),
        fetchCourses()
      ])
    }
    initializeData()
  }, [])

  // Fetch attendance data when date changes
  useEffect(() => {
    if (branches.length > 0) {
      fetchAttendanceData()
    }
  }, [selectedDate, branches])

  // Utility functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Present</Badge>
      case "absent":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Absent</Badge>
      case "late":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Late</Badge>
      default:
        return <Badge variant="outline" className="text-gray-600">Not Marked</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "absent":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "late":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getSaveStatusIcon = (recordId: string) => {
    const status = saveStatus[recordId] || 'idle'
    switch (status) {
      case 'saving':
        return <RefreshCw className="h-3 w-3 animate-spin text-blue-600" />
      case 'success':
        return <CheckCircle className="h-3 w-3 text-green-600" />
      case 'error':
        return <XCircle className="h-3 w-3 text-red-600" />
      default:
        return null
    }
  }

  // Export functionality
  const handleExportData = () => {
    const csvContent = [
      ['Student Name', 'Email', 'Course', 'Branch', 'Status', 'Check In Time', 'Notes', 'Date'].join(','),
      ...filteredRecords.map(record => [
        record.student_name,
        record.email,
        record.course_name,
        record.branch_name,
        record.status,
        record.check_in_time || '',
        record.notes || '',
        record.date
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `student_attendance_${format(selectedDate, 'yyyy-MM-dd')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  // Chart data for analytics
  const getChartData = () => {
    const statusCounts = {
      present: attendanceStats.present_today,
      absent: attendanceStats.absent_today,
      late: attendanceStats.late_today,
      not_marked: attendanceStats.not_marked_today
    }

    return [
      { name: 'Present', value: statusCounts.present, fill: '#10B981' },
      { name: 'Absent', value: statusCounts.absent, fill: '#EF4444' },
      { name: 'Late', value: statusCounts.late, fill: '#F59E0B' },
      { name: 'Not Marked', value: statusCounts.not_marked, fill: '#6B7280' }
    ]
  }

  const getBranchWiseData = () => {
    const branchStats = branches.map(branch => {
      const branchRecords = filteredRecords.filter(r => r.branch_id === branch.id)
      return {
        name: branch.name,
        present: branchRecords.filter(r => r.status === 'present').length,
        absent: branchRecords.filter(r => r.status === 'absent').length,
        late: branchRecords.filter(r => r.status === 'late').length,
        total: branchRecords.length
      }
    }).filter(branch => branch.total > 0)

    return branchStats
  }

  // Render main content
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Attendance Management</h1>
          <p className="text-gray-600">Manage attendance across all branches and courses</p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{attendanceStats.total_students}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Present</p>
                  <p className="text-2xl font-bold text-green-600">{attendanceStats.present_today}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Absent</p>
                  <p className="text-2xl font-bold text-red-600">{attendanceStats.absent_today}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Late</p>
                  <p className="text-2xl font-bold text-yellow-600">{attendanceStats.late_today}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                  <p className="text-2xl font-bold text-purple-600">{attendanceStats.attendance_rate.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Date Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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

              {/* Course Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Course</label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Courses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="not_marked">Not Marked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Actions</label>
                <div className="flex gap-2">
                  <Button
                    onClick={fetchAttendanceData}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button
                    onClick={handleExportData}
                    variant="outline"
                    size="sm"
                    disabled={filteredRecords.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Attendance Table */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-900">Student Attendance</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {filteredRecords.length} students • {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={fetchAttendanceData}
                      variant="outline"
                      size="sm"
                      disabled={loading}
                      className="text-xs"
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <Button
                      onClick={handleExportData}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <RefreshCw className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Loading attendance data...</h3>
                      <p className="text-gray-600">Please wait while we fetch the latest information</p>
                    </div>
                  </div>
                ) : filteredRecords.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <Users className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                    <p className="text-gray-600 mb-4">
                      {attendanceRecords.length === 0
                        ? "No students enrolled for the selected date."
                        : "No students match your current filters."}
                    </p>
                    <Button onClick={() => {
                      setSearchTerm("")
                      setSelectedBranch("all")
                      setSelectedCourse("all")
                      setSelectedStatus("all")
                    }} variant="outline" size="sm">
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Course
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Branch
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Check In
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {filteredRecords.map((record, index) => (
                          <tr
                            key={record.id}
                            className={`hover:bg-blue-50 transition-colors duration-150 ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12">
                                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md">
                                    <span className="text-white font-semibold text-sm">
                                      {record.student_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-semibold text-gray-900">
                                    {record.student_name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {record.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                                  <BookOpen className="h-4 w-4 text-indigo-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{record.course_name}</div>
                                  <div className="text-xs text-gray-500">Course</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="bg-green-100 p-2 rounded-lg mr-3">
                                  <MapPin className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{record.branch_name}</div>
                                  <div className="text-xs text-gray-500">Branch</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getStatusIcon(record.status)}
                                <span className="ml-2">{getStatusBadge(record.status)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 font-medium">
                                {record.check_in_time || (
                                  <span className="text-gray-400 italic">Not recorded</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <Button
                                  onClick={() => handleMarkAttendance(record.id, "present")}
                                  size="sm"
                                  variant={record.status === "present" ? "default" : "outline"}
                                  className={`text-xs font-medium transition-all duration-200 ${
                                    record.status === "present"
                                      ? "bg-green-600 hover:bg-green-700 text-white shadow-md"
                                      : "hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                                  }`}
                                  disabled={saveStatus[record.id] === 'saving'}
                                >
                                  {saveStatus[record.id] === 'saving' ? (
                                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                                  ) : (
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                  )}
                                  Present
                                </Button>
                                <Button
                                  onClick={() => handleMarkAttendance(record.id, "late")}
                                  size="sm"
                                  variant={record.status === "late" ? "default" : "outline"}
                                  className={`text-xs font-medium transition-all duration-200 ${
                                    record.status === "late"
                                      ? "bg-yellow-600 hover:bg-yellow-700 text-white shadow-md"
                                      : "hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-700"
                                  }`}
                                  disabled={saveStatus[record.id] === 'saving'}
                                >
                                  {saveStatus[record.id] === 'saving' ? (
                                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                                  ) : (
                                    <Clock className="h-3 w-3 mr-1" />
                                  )}
                                  Late
                                </Button>
                                <Button
                                  onClick={() => handleMarkAttendance(record.id, "absent")}
                                  size="sm"
                                  variant={record.status === "absent" ? "default" : "outline"}
                                  className={`text-xs font-medium transition-all duration-200 ${
                                    record.status === "absent"
                                      ? "bg-red-600 hover:bg-red-700 text-white shadow-md"
                                      : "hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                                  }`}
                                  disabled={saveStatus[record.id] === 'saving'}
                                >
                                  {saveStatus[record.id] === 'saving' ? (
                                    <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                                  ) : (
                                    <XCircle className="h-3 w-3 mr-1" />
                                  )}
                                  Absent
                                </Button>
                                <div className="ml-2">
                                  {getSaveStatusIcon(record.id)}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Analytics Sidebar */}
          <div className="space-y-6">
            {/* Attendance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Attendance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getChartData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Branch-wise Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Branch-wise Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getBranchWiseData()}>
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
                      <Bar dataKey="present" fill="#10B981" name="Present" />
                      <Bar dataKey="late" fill="#F59E0B" name="Late" />
                      <Bar dataKey="absent" fill="#EF4444" name="Absent" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Branches</span>
                  <span className="font-semibold">{branches.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Courses</span>
                  <span className="font-semibold">{courses.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Filtered Results</span>
                  <span className="font-semibold">{filteredRecords.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Attendance Rate</span>
                  <span className="font-semibold text-green-600">
                    {attendanceStats.attendance_rate.toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
