"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Calendar as CalendarIcon,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Download,
  Loader2,
  Save
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import BranchManagerDashboardHeader from "@/components/branch-manager-dashboard-header"
import { checkBranchManagerAuth, getBranchManagerAuthHeaders } from "@/lib/branchManagerAuth"

interface AttendanceRecord {
  id: string
  student_name: string
  student_id: string
  course_name: string
  course_id: string
  branch_name: string
  branch_id: string
  date: string
  status: "present" | "absent" | "late" | "not_marked"
  check_in_time?: string
  check_out_time?: string
  notes?: string
  email?: string
  phone?: string
}

interface AttendanceStats {
  total_students: number
  present_today: number
  absent_today: number
  late_today: number
  attendance_rate: number
}

export default function BranchManagerStudentAttendancePage() {
  const router = useRouter()
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([])
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [branchManagerData, setBranchManagerData] = useState<any>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{[key: string]: 'saving' | 'success' | 'error'}>({})
  const [bulkSaving, setBulkSaving] = useState(false)

  // Fetch attendance data for selected date
  const fetchAttendanceData = async (branchManagerId: string) => {
    try {
      setLoading(true)
      setError(null)

      const authResult = checkBranchManagerAuth()
      if (!authResult.isAuthenticated || !authResult.user) {
        setError("Authentication required")
        return
      }

      const headers = getBranchManagerAuthHeaders()
      const dateStr = format(selectedDate, 'yyyy-MM-dd')

      console.log(`🔄 Fetching attendance data for date: ${dateStr}`)

      // Use the unified attendance endpoint
      const response = await fetch(`http://31.97.224.169:8003/api/attendance/students?date=${dateStr}`, {
        method: 'GET',
        headers
      })

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Attendance data received:", data)

        const records: AttendanceRecord[] = (data.students || []).map((student: any) => ({
          id: `${student.student_id}-${student.course_id}`,
          student_id: student.student_id,
          student_name: student.student_name,
          course_id: student.course_id,
          course_name: student.course_name,
          branch_id: student.branch_id,
          branch_name: student.branch_name,
          email: student.email,
          phone: student.phone,
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
        }))

        setAttendanceRecords(records)
        setFilteredRecords(records)

        // Calculate stats
        const stats: AttendanceStats = {
          total_students: records.length,
          present_today: records.filter(r => r.status === "present").length,
          absent_today: records.filter(r => r.status === "absent").length,
          late_today: records.filter(r => r.status === "late").length,
          attendance_rate: records.length > 0 ?
            (records.filter(r => r.status === "present" || r.status === "late").length / records.length) * 100 : 0
        }
        setAttendanceStats(stats)

      } else {
        const errorText = await response.text()
        console.error("❌ Failed to fetch attendance data:", errorText)
        setError(`Failed to load attendance data: ${response.status}`)
      }

    } catch (error) {
      console.error("❌ Error fetching attendance data:", error)
      setError(`Failed to load attendance data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Initialize component
  useEffect(() => {
    const authResult = checkBranchManagerAuth()
    if (!authResult.isAuthenticated) {
      console.log("Branch manager not authenticated")
      router.push("/branch-manager/login")
      return
    }

    if (authResult.user) {
      setBranchManagerData(authResult.user)
      fetchAttendanceData(authResult.user.id)
    } else {
      setError("Branch manager information not found")
      setLoading(false)
    }
  }, [router, selectedDate])

  // Handle attendance marking
  const handleMarkAttendance = async (recordId: string, status: "present" | "absent" | "late") => {
    try {
      setSaveStatus(prev => ({ ...prev, [recordId]: 'saving' }))

      console.log("🔄 Marking attendance for record:", recordId, "status:", status)

      const authResult = checkBranchManagerAuth()
      if (!authResult.isAuthenticated || !authResult.user) {
        setSaveStatus(prev => ({ ...prev, [recordId]: 'error' }))
        setError("Authentication required")
        return
      }

      const record = attendanceRecords.find(r => r.id === recordId)
      if (!record) {
        setSaveStatus(prev => ({ ...prev, [recordId]: 'error' }))
        setError("Attendance record not found")
        return
      }

      // Update local state immediately for better UX
      setAttendanceRecords(prev =>
        prev.map(r =>
          r.id === recordId
            ? {
                ...r,
                status,
                check_in_time: status !== "absent" ? new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                }) : undefined
              }
            : r
        )
      )

      setFilteredRecords(prev =>
        prev.map(r =>
          r.id === recordId
            ? {
                ...r,
                status,
                check_in_time: status !== "absent" ? new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                }) : undefined
              }
            : r
        )
      )

      // Update attendance stats
      const updatedRecords = attendanceRecords.map(r =>
        r.id === recordId ? { ...r, status } : r
      )

      const stats: AttendanceStats = {
        total_students: updatedRecords.length,
        present_today: updatedRecords.filter(r => r.status === "present").length,
        absent_today: updatedRecords.filter(r => r.status === "absent").length,
        late_today: updatedRecords.filter(r => r.status === "late").length,
        attendance_rate: updatedRecords.length > 0 ?
          (updatedRecords.filter(r => r.status === "present" || r.status === "late").length / updatedRecords.length) * 100 : 0
      }
      setAttendanceStats(stats)

      // Mark as having unsaved changes
      setHasUnsavedChanges(true)
      setSaveStatus(prev => ({ ...prev, [recordId]: 'success' }))
      console.log("📝 Attendance status updated locally - marked as unsaved for bulk save")

      // Clear save status after 3 seconds
      setTimeout(() => {
        setSaveStatus(prev => {
          const newStatus = { ...prev }
          delete newStatus[recordId]
          return newStatus
        })
      }, 3000)

    } catch (error) {
      console.error("❌ Error marking attendance:", error)
      setSaveStatus(prev => ({ ...prev, [recordId]: 'error' }))
      setError(`Failed to mark attendance: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Handle search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredRecords(attendanceRecords)
    } else {
      const filtered = attendanceRecords.filter(record =>
        record.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.branch_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredRecords(filtered)
    }
  }, [searchTerm, attendanceRecords])

  // Bulk save all changes
  const handleBulkSave = async () => {
    if (!hasUnsavedChanges) return

    try {
      setBulkSaving(true)
      setError(null)

      const authResult = checkBranchManagerAuth()
      if (!authResult.isAuthenticated || !authResult.user) {
        setError("Authentication required")
        return
      }

      const headers = getBranchManagerAuthHeaders()
      let successCount = 0
      let errorCount = 0

      console.log("💾 Starting bulk save of attendance records...")

      for (const record of attendanceRecords) {
        if (record.status === "not_marked") continue

        const attendanceData = {
          user_id: record.student_id,
          user_type: "student",
          course_id: record.course_id,
          branch_id: record.branch_id,
          attendance_date: `${format(selectedDate, 'yyyy-MM-dd')}T${new Date().toTimeString().split(' ')[0]}`,
          status: record.status,
          check_in_time: record.status !== "absent" ? new Date().toISOString() : null,
          check_out_time: null,
          notes: `Marked by branch manager: ${authResult.user.full_name || authResult.user.email}`
        }

        console.log(`💾 Saving attendance for ${record.student_name} with status: ${record.status}`)

        const response = await fetch(`http://31.97.224.169:8003/api/attendance/mark`, {
          method: 'POST',
          headers,
          body: JSON.stringify(attendanceData)
        })

        if (response.ok) {
          successCount++
          console.log(`✅ Successfully saved attendance for ${record.student_name}`)
        } else {
          errorCount++
          const errorText = await response.text()
          console.warn(`❌ Failed to save attendance for ${record.student_name}: ${response.status} ${errorText}`)
        }
      }

      if (successCount > 0) {
        setSuccessMessage(`Successfully saved ${successCount} attendance records`)
        setHasUnsavedChanges(false)
      }

      if (errorCount > 0) {
        setError(`Failed to save ${errorCount} attendance records`)
      }

      console.log(`📊 Bulk save completed: ${successCount} success, ${errorCount} errors`)

    } catch (error) {
      console.error("❌ Error during bulk save:", error)
      setError(`Failed to save attendance records: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setBulkSaving(false)
    }
  }

  // Export attendance data to CSV
  const handleExportAttendance = () => {
    try {
      const csvHeaders = [
        'Student Name',
        'Email',
        'Course',
        'Branch',
        'Date',
        'Status',
        'Check-in Time',
        'Notes'
      ]

      const csvData = filteredRecords.map(record => [
        record.student_name,
        record.email || '',
        record.course_name,
        record.branch_name,
        format(selectedDate, 'yyyy-MM-dd'),
        record.status === 'not_marked' ? 'Not Marked' : record.status.charAt(0).toUpperCase() + record.status.slice(1),
        record.check_in_time || '',
        record.notes || ''
      ])

      const csvContent = [
        csvHeaders.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `student_attendance_${format(selectedDate, 'yyyy-MM-dd')}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      console.log("Student attendance data exported successfully")
    } catch (error) {
      console.error("Error exporting attendance:", error)
      setError("Failed to export attendance data")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BranchManagerDashboardHeader />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Attendance</h1>
          <p className="text-gray-600">Manage student attendance for your branches</p>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Date Picker */}
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date)
                      setDatePickerOpen(false)
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-[300px]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleExportAttendance}
              variant="outline"
              className="border-gray-300"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            {hasUnsavedChanges && (
              <Button
                onClick={handleBulkSave}
                disabled={bulkSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {bulkSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save All Changes
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        {attendanceStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">{attendanceStats.total_students}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Present Today</p>
                    <p className="text-2xl font-bold text-green-600">{attendanceStats.present_today}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Absent Today</p>
                    <p className="text-2xl font-bold text-red-600">{attendanceStats.absent_today}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Late Today</p>
                    <p className="text-2xl font-bold text-yellow-600">{attendanceStats.late_today}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Attendance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Student Attendance - {format(selectedDate, "MMMM d, yyyy")}</span>
              {hasUnsavedChanges && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Unsaved Changes
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading attendance data...</span>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No students found for the selected date</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Course</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Branch</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Check-in Time</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{record.student_name}</p>
                            <p className="text-sm text-gray-500">{record.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-900">{record.course_name}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-900">{record.branch_name}</p>
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            variant={
                              record.status === "present" ? "default" :
                              record.status === "absent" ? "destructive" :
                              record.status === "late" ? "secondary" : "outline"
                            }
                            className={
                              record.status === "present" ? "bg-green-100 text-green-800 hover:bg-green-200" :
                              record.status === "absent" ? "bg-red-100 text-red-800 hover:bg-red-200" :
                              record.status === "late" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" :
                              "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }
                          >
                            {record.status === "not_marked" ? "Not Marked" : record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-900">{record.check_in_time || "-"}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={record.status === "present" ? "default" : "outline"}
                              onClick={() => handleMarkAttendance(record.id, "present")}
                              disabled={saveStatus[record.id] === 'saving'}
                              className={record.status === "present" ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              {saveStatus[record.id] === 'saving' && record.status === "present" ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant={record.status === "absent" ? "destructive" : "outline"}
                              onClick={() => handleMarkAttendance(record.id, "absent")}
                              disabled={saveStatus[record.id] === 'saving'}
                            >
                              {saveStatus[record.id] === 'saving' && record.status === "absent" ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <XCircle className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant={record.status === "late" ? "secondary" : "outline"}
                              onClick={() => handleMarkAttendance(record.id, "late")}
                              disabled={saveStatus[record.id] === 'saving'}
                              className={record.status === "late" ? "bg-yellow-600 hover:bg-yellow-700 text-white" : ""}
                            >
                              {saveStatus[record.id] === 'saving' && record.status === "late" ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
