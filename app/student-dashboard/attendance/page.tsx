"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import StudentDashboardLayout from "@/components/student-dashboard-layout"
import { CardSkeleton, TableSkeleton } from "@/components/ui/loading-skeleton"
import { ErrorBoundary } from "@/components/error-boundary"
import { TokenManager } from "@/lib/tokenManager"
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  Target,
  RefreshCw
} from "lucide-react"

interface AttendanceRecord {
  id: string
  date: string
  course: string
  course_id: string
  branch: string
  branch_id: string
  status: "present" | "absent" | "late"
  check_in_time?: string
  check_out_time?: string
  is_present: boolean
  notes: string
}

interface AttendanceStats {
  total_classes: number
  attended: number
  absent: number
  late: number
  percentage: number
}

interface StudentInfo {
  id: string
  name: string
  email: string
}

export default function StudentAttendancePage() {
  const router = useRouter()
  const [studentData, setStudentData] = useState<StudentInfo | null>(null)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    total_classes: 0,
    attended: 0,
    absent: 0,
    late: 0,
    percentage: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!TokenManager.isAuthenticated()) {
        router.push("/login")
        return
      }

      const user = TokenManager.getUser()
      if (!user || user.role !== "student") {
        console.log("❌ User is not a student:", user?.role)
        if (user?.role === "coach") {
          router.push("/coach-dashboard")
        } else if (user?.role === "superadmin" || user?.role === "super_admin") {
          router.push("/dashboard")
        } else if (user?.role === "branch_manager") {
          router.push("/branch-manager-dashboard")
        } else {
          router.push("/login")
        }
        return
      }

      const headers = TokenManager.getAuthHeaders()
      console.log("🔄 Fetching student attendance data...")

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/attendance/student/my-attendance`, {
        method: 'GET',
        headers
      })

      if (!response.ok) {
        if (response.status === 401) {
          console.log("❌ Authentication failed, redirecting to login")
          TokenManager.clearAuthData()
          router.push("/login")
          return
        }
        throw new Error(`Failed to fetch attendance data: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Attendance data received:", data)

      setAttendanceRecords(data.attendance_records || [])
      setAttendanceStats(data.statistics || {
        total_classes: 0,
        attended: 0,
        absent: 0,
        late: 0,
        percentage: 0
      })
      setStudentData(data.student_info || {
        id: user.id,
        name: user.full_name || "Student",
        email: user.email || ""
      })

    } catch (error) {
      console.error("❌ Error fetching attendance data:", error)
      setError(error instanceof Error ? error.message : "Failed to load attendance data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendanceData()
  }, [router])

  const handleLogout = () => {
    TokenManager.clearAuthData()
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-100 text-green-800">Present</Badge>
      case "absent":
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>
      case "late":
        return <Badge className="bg-yellow-100 text-yellow-800">Late</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <StudentDashboardLayout
      pageTitle="Attendance"
      pageDescription="Track your class attendance and punctuality"
      showBreadcrumb={true}
      breadcrumbItems={[
        { label: "Dashboard", href: "/student-dashboard" },
        { label: "Attendance" }
      ]}
    >
      {/* Error Alert */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
            <Button
              onClick={fetchAttendanceData}
              variant="outline"
              size="sm"
              className="ml-2 h-6 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Attendance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{attendanceStats.total_classes}</p>
              <p className="text-sm text-gray-500 mt-1">Total Classes</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{attendanceStats.attended}</p>
              <p className="text-sm text-gray-500 mt-1">Attended</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{attendanceStats.absent}</p>
              <p className="text-sm text-gray-500 mt-1">Absent</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</p>
              <p className="text-sm text-gray-500 mt-1">Late</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{attendanceStats.percentage}%</p>
              <p className="text-sm text-gray-500 mt-1">Attendance Rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Records */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Attendance</CardTitle>
            <CardDescription>Your attendance history for the past classes</CardDescription>
          </div>
          <Button
            onClick={fetchAttendanceData}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {attendanceRecords.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No attendance records found</p>
              <p className="text-gray-400 text-sm">Your attendance records will appear here once you start attending classes.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Course</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Branch</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Check In</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Check Out</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-900">{record.course}</td>
                      <td className="py-3 px-4 text-gray-600">{record.branch}</td>
                      <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                      <td className="py-3 px-4 text-gray-600">{record.check_in_time || "-"}</td>
                      <td className="py-3 px-4 text-gray-600">{record.check_out_time || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </StudentDashboardLayout>
  )
}
