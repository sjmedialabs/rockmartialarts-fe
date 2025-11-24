"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Users, Mail, Phone, Loader2, Eye, Plus, RefreshCw } from "lucide-react"
import CoachDashboardHeader from "@/components/coach-dashboard-header"
import { checkCoachAuth } from "@/lib/coachAuth"

interface Student {
  id: string
  student_id?: string
  full_name?: string
  student_name?: string  // Backend returns this field
  email: string
  phone?: string
  date_of_birth?: string
  gender?: string
  is_active?: boolean
  enrollment_date?: string
  course_name?: string
  course_id?: string
  branch_name?: string
  progress?: number
  attendance_percentage?: number
  status?: string
}

export default function StudentsListPage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [coachData, setCoachData] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    // Use the robust coach authentication check
    const authResult = checkCoachAuth()

    if (!authResult.isAuthenticated) {
      console.log("Coach not authenticated:", authResult.error)
      router.push("/coach/login")
      return
    }

    if (authResult.coach && authResult.token) {
      console.log("✅ Coach authenticated:", {
        id: authResult.coach.id,
        name: authResult.coach.full_name,
        branch_id: authResult.coach.branch_id
      })

      setCoachData(authResult.coach)

      // Fetch students with coach data
      fetchStudents(authResult.token, authResult.coach)
    } else {
      setError("Coach information not found")
      setLoading(false)
    }
  }, [router])

  // Filter students based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students)
    } else {
      const filtered = students.filter(student => {
        const name = student.student_name || student.full_name || ''
        return (
          name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.course_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
      setFilteredStudents(filtered)
    }
  }, [searchTerm, students])

  // Refresh function
  const handleRefresh = async () => {
    if (!coachData) return

    setRefreshing(true)
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token")
      if (token) {
        await fetchStudents(token, coachData)
      }
    } catch (error) {
      console.error('Error refreshing students:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const fetchStudents = async (token: string, coach: any) => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔑 Fetching students for coach:", coach.id)
      console.log("👤 Coach data:", coach)

      // Get the coach's branch ID for filtering
      const branchId = coach?.branch_id
      if (!branchId) {
        console.error("❌ No branch ID found for coach")
        setError("Coach is not assigned to any branch")
        setLoading(false)
        return
      }

      console.log("🏢 Filtering students by branch:", branchId)

      // Use the search students endpoint with branch filtering
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/search/students?branch_id=${branchId}&limit=100`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        // Get error details from response
        let errorDetails = null
        try {
          errorDetails = await response.json()
        } catch (e) {
          errorDetails = await response.text()
        }

        console.error("❌ API Error:", {
          status: response.status,
          statusText: response.statusText,
          errorDetails
        })

        if (response.status === 401) {
          // Token expired or invalid
          localStorage.clear()
          router.push("/coach/login")
          return
        }
        throw new Error(`Failed to fetch students: ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ STUDENTS PAGE: Fetched students for branch:", data)
      console.log("✅ STUDENTS PAGE: Number of students:", data.students?.length || 0)

      // Handle different response formats
      const studentsData = data.students || []
      console.log(`📊 Found ${studentsData.length} students in branch ${branchId}`)

      // Transform the data to match the expected format
      const transformedStudents = studentsData.map((student: any) => ({
        id: student.id,
        student_id: student.id,
        full_name: student.full_name,
        student_name: student.full_name,
        email: student.email,
        phone: student.phone,
        date_of_birth: student.date_of_birth,
        gender: student.gender,
        is_active: student.is_active,
        enrollment_date: student.courses?.[0]?.enrollment_date,
        course_name: student.courses?.[0]?.name,
        course_id: student.courses?.[0]?.id,
        branch_name: student.branches?.[0]?.name,
        status: student.is_active ? 'active' : 'inactive'
      }))

      setStudents(transformedStudents)

    } catch (err: any) {
      console.error('Error fetching students:', err)
      setError(err.message || 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    try {
      const birthDate = new Date(dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age > 0 ? age : null
    } catch {
      return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CoachDashboardHeader 
          currentPage="Students"
          coachName={coachData?.full_name || coachData?.name}
        />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mt-[100px]">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
              <span className="ml-2 text-gray-600">Loading students...</span>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CoachDashboardHeader 
        currentPage="Students"
        coachName={coachData?.full_name || coachData?.name}
      />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mt-[100px]">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">My Students</h1>
              <p className="text-gray-600">Students enrolled in your courses</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                <Users className="w-4 h-4 mr-1" />
                {filteredStudents.length} students
              </Badge>
              <Button
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                className="text-gray-600 hover:text-gray-800"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={() => router.push("/coach-dashboard/students/create")}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search students by name, email, course, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Error State */}
          {error && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="text-center text-red-600">
                  <p className="font-medium">Error loading students</p>
                  <p className="text-sm mt-1">{error}</p>
                  <Button
                    onClick={() => coachData && fetchStudents(localStorage.getItem("access_token")!, coachData)}
                    className="mt-4"
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Students Table */}
          {!error && (
            <Card>
              <CardHeader>
                <CardTitle>Students List</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredStudents.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm ? 'No students found' : 'No students assigned'}
                    </h3>
                    <p className="text-gray-500">
                      {searchTerm 
                        ? 'Try adjusting your search terms' 
                        : 'Students will appear here once they enroll in your courses'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="text-left py-4 px-6 font-medium text-gray-600">Student</th>
                          <th className="text-left py-4 px-6 font-medium text-gray-600">Course</th>
                          <th className="text-left py-4 px-6 font-medium text-gray-600">Contact</th>
                          <th className="text-left py-4 px-6 font-medium text-gray-600">Age</th>
                          <th className="text-left py-4 px-6 font-medium text-gray-600">Status</th>
                          <th className="text-left py-4 px-6 font-medium text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((student, index) => (
                          <tr key={student.id || `student-${index}`} className="border-b hover:bg-gray-50">
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src="" alt={student.student_name || student.full_name || 'Student'} />
                                  <AvatarFallback className="bg-yellow-100 text-yellow-800">
                                    {(() => {
                                      const name = student.student_name || student.full_name
                                      return name
                                        ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                                        : 'S'
                                    })()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-gray-900">{student.student_name || student.full_name || 'Unknown Student'}</p>
                                  {student.id && (
                                    <p className="text-sm text-gray-500">ID: {student.id}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div>
                                <p className="font-medium text-gray-900">{student.course_name || 'N/A'}</p>
                                {student.branch_name && (
                                  <p className="text-sm text-gray-500">{student.branch_name}</p>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-1">
                                  <Mail className="w-3 h-3 text-gray-400" />
                                  <span className="text-sm text-gray-600">{student.email}</span>
                                </div>
                                {student.phone && (
                                  <div className="flex items-center space-x-1">
                                    <Phone className="w-3 h-3 text-gray-400" />
                                    <span className="text-sm text-gray-600">{student.phone}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-sm text-gray-600">
                                {student.date_of_birth ? calculateAge(student.date_of_birth) || 'N/A' : 'N/A'}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <Badge className={getStatusColor(student.status || (student.is_active ? 'active' : 'inactive'))}>
                                {student.status || (student.is_active ? 'Active' : 'Inactive')}
                              </Badge>
                            </td>
                            <td className="py-4 px-6">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/coach-dashboard/students/${student.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
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
          )}
        </div>
      </main>
    </div>
  )
}
