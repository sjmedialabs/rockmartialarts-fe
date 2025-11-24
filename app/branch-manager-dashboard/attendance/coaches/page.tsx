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
  RefreshCw,
  Eye
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import BranchManagerDashboardHeader from "@/components/branch-manager-dashboard-header"
import { checkBranchManagerAuth, getBranchManagerAuthHeaders } from "@/lib/branchManagerAuth"

interface CoachAttendanceRecord {
  id: string
  coach_name: string
  coach_id: string
  email: string
  phone?: string
  expertise?: string[]
  branch_id: string
  date: string
  status: "present" | "absent" | "late" | "not_marked"
  check_in_time?: string
  check_out_time?: string
  notes?: string
}

interface CoachAttendanceStats {
  total_coaches: number
  present_today: number
  absent_today: number
  late_today: number
  attendance_rate: number
}

export default function BranchManagerCoachAttendancePage() {
  const router = useRouter()
  const [attendanceRecords, setAttendanceRecords] = useState<CoachAttendanceRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<CoachAttendanceRecord[]>([])
  const [attendanceStats, setAttendanceStats] = useState<CoachAttendanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [branchManagerData, setBranchManagerData] = useState<any>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [saveStatus, setSaveStatus] = useState<{[key: string]: 'idle' | 'saving' | 'success' | 'error'}>({})
  const [refreshing, setRefreshing] = useState(false)

  // Fetch coach attendance data for selected date
  const fetchCoachAttendanceData = async () => {
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

      console.log(`🔄 Fetching coach attendance data for date: ${dateStr}`)

      // Fetch coaches in branch manager's branches using unified endpoint
      const response = await fetch(`http://31.97.224.169:8003/api/attendance/coaches?date=${dateStr}`, {
        method: 'GET',
        headers
      })

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Coach attendance data received:", data)

        const records: CoachAttendanceRecord[] = (data.coaches || []).map((coach: any) => {
          // Extract attendance information
          const attendance = coach.attendance || {}
          const status = attendance.status || "not_marked"

          // Format check-in time if available
          let checkInTime = undefined
          if (attendance.check_in_time) {
            try {
              checkInTime = new Date(attendance.check_in_time).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })
            } catch (e) {
              console.warn("Failed to parse check-in time:", attendance.check_in_time)
            }
          }

          return {
            id: `${coach.coach_id || coach.id}_${dateStr}`,
            coach_id: coach.coach_id || coach.id,
            coach_name: coach.coach_name || coach.full_name,
            email: coach.email || "",
            phone: coach.phone || "",
            expertise: coach.expertise || [],
            branch_id: coach.branch_id,
            status: status,
            check_in_time: checkInTime,
            check_out_time: attendance.check_out_time ? new Date(attendance.check_out_time).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }) : undefined,
            notes: attendance.notes || "",
            date: dateStr
          }
        })

        setAttendanceRecords(records)
        setFilteredRecords(records)

        // Calculate stats
        const stats: CoachAttendanceStats = {
          total_coaches: records.length,
          present_today: records.filter(r => r.status === "present").length,
          absent_today: records.filter(r => r.status === "absent").length,
          late_today: records.filter(r => r.status === "late").length,
          attendance_rate: records.length > 0 ?
            (records.filter(r => r.status === "present" || r.status === "late").length / records.length) * 100 : 0
        }
        setAttendanceStats(stats)

        console.log("📊 Coach attendance stats calculated:", stats)

      } else {
        const errorText = await response.text()
        console.error("❌ Failed to fetch coach attendance data:", errorText)
        setError(`Failed to load coach attendance data: ${response.status}`)
      }

    } catch (error) {
      console.error("❌ Error fetching coach attendance data:", error)
      setError(`Failed to load coach attendance data: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
      fetchCoachAttendanceData()
    } else {
      setError("Branch manager information not found")
      setLoading(false)
    }
  }, [router, selectedDate])

  // Handle attendance marking with immediate save
  const handleMarkAttendance = async (recordId: string, status: "present" | "absent" | "late") => {
    try {
      setSaveStatus(prev => ({ ...prev, [recordId]: 'saving' }))

      console.log("🔄 Marking coach attendance for record:", recordId, "status:", status)

      const authResult = checkBranchManagerAuth()
      if (!authResult.isAuthenticated || !authResult.user) {
        setSaveStatus(prev => ({ ...prev, [recordId]: 'error' }))
        setError("Authentication required")
        return
      }

      const record = attendanceRecords.find(r => r.id === recordId)
      if (!record) {
        setSaveStatus(prev => ({ ...prev, [recordId]: 'error' }))
        setError("Coach attendance record not found")
        return
      }

      const headers = getBranchManagerAuthHeaders()

      const attendanceData = {
        user_id: record.coach_id,
        user_type: "coach",
        course_id: null, // Coaches don't have specific courses for attendance
        branch_id: record.branch_id,
        attendance_date: `${format(selectedDate, 'yyyy-MM-dd')}T10:00:00Z`,
        status: status,
        check_in_time: status !== "absent" ? new Date().toISOString() : null,
        notes: `Marked by branch manager: ${authResult.user.full_name || authResult.user.email}`
      }

      console.log(`💾 Saving coach attendance for ${record.coach_name} with status: ${status}`)

      const response = await fetch(`http://31.97.224.169:8003/api/attendance/mark`, {
        method: 'POST',
        headers,
        body: JSON.stringify(attendanceData)
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`✅ Successfully saved coach attendance for ${record.coach_name}`)

        setSaveStatus(prev => ({ ...prev, [recordId]: 'success' }))
        setSuccessMessage(`Attendance marked as ${status} for coach ${record.coach_name}`)

        // Update local state with the saved data
        const newCheckInTime = status !== "absent" ? new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }) : undefined

        setAttendanceRecords(prev =>
          prev.map(r =>
            r.id === recordId
              ? {
                  ...r,
                  status,
                  check_in_time: newCheckInTime,
                  notes: attendanceData.notes
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
                  check_in_time: newCheckInTime,
                  notes: attendanceData.notes
                }
              : r
          )
        )

        // Update attendance stats
        const updatedRecords = attendanceRecords.map(r =>
          r.id === recordId ? { ...r, status } : r
        )

        const stats: CoachAttendanceStats = {
          total_coaches: updatedRecords.length,
          present_today: updatedRecords.filter(r => r.status === "present").length,
          absent_today: updatedRecords.filter(r => r.status === "absent").length,
          late_today: updatedRecords.filter(r => r.status === "late").length,
          attendance_rate: updatedRecords.length > 0 ?
            (updatedRecords.filter(r => r.status === "present" || r.status === "late").length / updatedRecords.length) * 100 : 0
        }
        setAttendanceStats(stats)

        // Clear success status after delay
        setTimeout(() => {
          setSaveStatus(prev => ({ ...prev, [recordId]: 'idle' }))
        }, 2000)

      } else {
        const errorText = await response.text()
        console.warn(`❌ Failed to save coach attendance for ${record.coach_name}: ${response.status} ${errorText}`)
        setSaveStatus(prev => ({ ...prev, [recordId]: 'error' }))
        setError(`Failed to save coach attendance: ${response.status}`)
      }

    } catch (error) {
      console.error("❌ Error marking coach attendance:", error)
      setSaveStatus(prev => ({ ...prev, [recordId]: 'error' }))
      setError(`Failed to mark coach attendance: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Handle search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredRecords(attendanceRecords)
    } else {
      const filtered = attendanceRecords.filter(record =>
        record.coach_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.expertise && record.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase())))
      )
      setFilteredRecords(filtered)
    }
  }, [searchTerm, attendanceRecords])

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

  // Refresh attendance data
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchCoachAttendanceData()
    setRefreshing(false)
  }

  // Export coach attendance data to CSV
  const handleExportAttendance = () => {
    try {
      const csvHeaders = [
        'Coach Name',
        'Email',
        'Phone',
        'Expertise',
        'Date',
        'Status',
        'Check-in Time',
        'Notes'
      ]

      const csvData = filteredRecords.map(record => [
        record.coach_name,
        record.email || '',
        record.phone || '',
        record.expertise ? record.expertise.join('; ') : '',
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
      a.download = `coach_attendance_${format(selectedDate, 'yyyy-MM-dd')}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      console.log("Coach attendance data exported successfully")
    } catch (error) {
      console.error("Error exporting coach attendance:", error)
      setError("Failed to export coach attendance data")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BranchManagerDashboardHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Coach Attendance</h1>
          <p className="text-gray-600">Manage coach attendance for your branches</p>
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
                placeholder="Search coaches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-[300px]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={refreshing}
              className="border-gray-300"
            >
              {refreshing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
            <Button
              onClick={handleExportAttendance}
              variant="outline"
              className="border-gray-300"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {attendanceStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Coaches</p>
                    <p className="text-2xl font-bold text-gray-900">{attendanceStats.total_coaches}</p>
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
              <span>Coach Attendance - {format(selectedDate, "MMMM d, yyyy")}</span>
              <div className="text-sm text-gray-500">
                {filteredRecords.length} coaches
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading coach attendance data...</span>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No coaches found for the selected date</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Coach</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Expertise</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Check-in Time</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{record.coach_name}</p>
                            <p className="text-sm text-gray-500">{record.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {record.expertise && record.expertise.length > 0 ? (
                              record.expertise.slice(0, 2).map((exp, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {exp}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-gray-500 text-sm">No expertise listed</span>
                            )}
                            {record.expertise && record.expertise.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{record.expertise.length - 2} more
                              </Badge>
                            )}
                          </div>
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
                          <div className="flex gap-2 items-center">
                            <Button
                              size="sm"
                              variant={record.status === "present" ? "default" : "outline"}
                              onClick={() => handleMarkAttendance(record.id, "present")}
                              disabled={saveStatus[record.id] === 'saving'}
                              className={record.status === "present" ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              {saveStatus[record.id] === 'saving' ? (
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
                              {saveStatus[record.id] === 'saving' ? (
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
                              {saveStatus[record.id] === 'saving' ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                            </Button>
                            {saveStatus[record.id] === 'success' && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                            {saveStatus[record.id] === 'error' && (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/branch-manager-dashboard/attendance/coach-detail/${record.coach_id}`)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
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
