"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Edit, Trash2, RefreshCw, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import DashboardHeader from "@/components/dashboard-header"
import { TokenManager } from "@/lib/tokenManager"

interface Student {
  id: string
  student_id?: string
  full_name: string
  student_name?: string
  email: string
  phone: string
  role: string
  branch_id?: string
  date_of_birth?: string
  is_active: boolean
  created_at?: string
  gender?: string
  age?: number | null
  courses?: Array<{
    course_id: string
    course_name: string
    level?: string
    duration?: string
    branch_name?: string
  }>
  course_info?: {
    category_id: string
    course_id: string
    duration: string
  } | null
  branch_info?: {
    location_id: string
    branch_id: string
  } | null
  address?: {
    line1: string
    area: string
    city: string
    state: string
    pincode: string
    country: string
  }
}

export default function StudentList() {
  const router = useRouter()
  const [showAssignPopup, setShowAssignPopup] = useState(false)
  const [showDeletePopup, setShowDeletePopup] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("")
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [assignmentLoading, setAssignmentLoading] = useState(false)
  const [assignmentError, setAssignmentError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
// Pagination state
const [currentPage, setCurrentPage] = useState(1)
const itemsPerPage = 5
  // Fetch students from API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        setError(null)

        let token = TokenManager.getToken()

        // For development: if no token found, try to get one from the backend
        if (!token) {
          console.log("No token found, attempting to get development token...")
          try {
            const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email: 'admin@marshalats.com',
                password: 'admin123'
              })
            })

            if (loginResponse.ok) {
              const loginData = await loginResponse.json()
              token = loginData.data.token
              console.log("✅ Development token obtained")

              // Store the token for future use
              TokenManager.storeAuthData({
                access_token: token,
                token_type: 'bearer',
                expires_in: loginData.data.expires_in,
                user: {
                  id: loginData.data.id,
                  full_name: loginData.data.full_name,
                  email: loginData.data.email,
                  role: 'superadmin'
                }
              })
            } else {
              throw new Error("Failed to get development token")
            }
          } catch (devTokenError) {
            console.error("Failed to get development token:", devTokenError)
            throw new Error("Authentication token not found. Please login again.")
          }
        }

        // Try enhanced API first, fallback to basic API
        let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/students/details`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        // If enhanced API fails, try basic users API
        if (!response.ok) {
          console.log("Enhanced API failed, trying basic users API...")
          response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users?role=student`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        }

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || errorData.message || `Failed to fetch students (${response.status})`)
        }

        const data = await response.json()
        console.log("Students fetched successfully:", data)

        // Handle different API response formats
        let studentsData = data.students || data.users || data || []

        // Ensure studentsData is always an array and transform data structure
        const studentsArray = Array.isArray(studentsData) ? studentsData.map(student => ({
          id: student.student_id || student.id,
          student_id: student.student_id || student.id,
          full_name: student.student_name || student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim(),
          student_name: student.student_name || student.full_name,
          email: student.email,
          phone: student.phone,
          role: student.role || 'student',
          gender: student.gender,
          age: student.age || (student.date_of_birth ?
            new Date().getFullYear() - new Date(student.date_of_birth).getFullYear() : null),
          courses: student.courses || [],
          is_active: student.is_active !== undefined ? student.is_active : true,
          date_of_birth: student.date_of_birth,
          created_at: student.created_at,
          // Add fallback course info from user model if available
          course_info: student.course || null,
          branch_info: student.branch || null
        })) : []

        setStudents(studentsArray)

      } catch (error) {
        console.error("Error fetching students:", error)
        setError(error instanceof Error ? error.message : 'Failed to fetch students')
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  // Fetch branches and courses for the assignment modal
  const fetchBranchesAndCourses = async () => {
    try {
      const token = TokenManager.getToken()
      if (!token) return

      // Fetch branches
      const branchesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/branches`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (branchesResponse.ok) {
        const branchesData = await branchesResponse.json()
        setBranches(branchesData.branches || branchesData || [])
      }

      // Fetch courses
      const coursesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json()
        setCourses(coursesData.courses || coursesData || [])
      }
    } catch (error) {
      console.error("Error fetching branches and courses:", error)
    }
  }

  const handleAssignClick = () => {
    fetchBranchesAndCourses()
    setShowAssignPopup(true)
  }

  const handleAssignConfirm = async () => {
    if (!selectedStudent || !selectedBranch || selectedCourses.length === 0) {
      setAssignmentError("Please select a student, branch, and at least one course")
      return
    }

    try {
      setAssignmentLoading(true)
      setAssignmentError(null)

      const token = TokenManager.getToken()
      if (!token) {
        throw new Error("Authentication token not found. Please login again.")
      }

      // Update student with branch and course assignments
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${selectedStudent}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          branch: {
            location_id: "hyderabad", // Default location
            branch_id: selectedBranch
          },
          course: selectedCourses.length > 0 ? {
            category_id: "martial-arts", // Default category
            course_id: selectedCourses[0], // Use first selected course
            duration: "3-months" // Default duration
          } : undefined
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || errorData.message || `Failed to assign student (${response.status})`)
      }

      // Update local state to reflect changes
      setStudents(prevStudents =>
        prevStudents.map(student =>
          student.id === selectedStudent
            ? {
                ...student,
                branch_info: { location_id: "hyderabad", branch_id: selectedBranch },
                course_info: selectedCourses.length > 0 ? {
                  category_id: "martial-arts",
                  course_id: selectedCourses[0],
                  duration: "3-months"
                } : student.course_info
              }
            : student
        )
      )

      alert("Student assigned successfully!")
      setShowAssignPopup(false)
      setSelectedStudent("")
      setSelectedBranch("")
      setSelectedCourses([])

    } catch (error) {
      setAssignmentError(error instanceof Error ? error.message : 'Failed to assign student')
    } finally {
      setAssignmentLoading(false)
    }
  }

  const handleDeleteClick = (studentId: string) => {
    setStudentToDelete(studentId)
    setShowDeletePopup(true)
  }

  const handleDeleteConfirm = async () => {
    if (studentToDelete !== null) {
      try {
        // Enhanced authentication debugging
        console.log("🔍 Starting delete operation for student:", studentToDelete)

        const token = TokenManager.getToken()
        const user = TokenManager.getUser()
        const isAuth = TokenManager.isAuthenticated()

        console.log("Authentication status:", {
          hasToken: !!token,
          tokenPreview: token ? token.substring(0, 20) + "..." : "null",
          isAuthenticated: isAuth,
          user: user,
          userRole: user?.role
        })

        if (!token) {
          throw new Error("Authentication token not found. Please login again.")
        }

        if (!isAuth) {
          throw new Error("Authentication token has expired. Please login again.")
        }

        // Check user role - handle both superadmin and super_admin role names
        const allowedRoles = ['super_admin', 'coach_admin', 'superadmin']
        if (!user || !allowedRoles.includes(user.role)) {
          throw new Error(`Insufficient permissions. Only Super Admin and Coach Admin can delete students. Current role: ${user?.role || 'none'}`)
        }

        console.log("🚀 Making DELETE request to:", `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${studentToDelete}`)

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${studentToDelete}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        console.log("📡 Response received:", {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("❌ Delete request failed:", errorData)

          if (response.status === 401) {
            throw new Error("Invalid authentication credentials. Please login again.")
          } else if (response.status === 403) {
            throw new Error("Insufficient permissions to delete students.")
          } else {
            throw new Error(errorData.detail || errorData.message || `Failed to delete student (${response.status})`)
          }
        }

        // Get the response message
        const responseData = await response.json().catch(() => ({ message: 'Student deleted successfully' }))
        console.log("✅ Delete successful:", responseData)

        // Remove student from local state
        setStudents((Array.isArray(students) ? students : []).filter(student => student.id !== studentToDelete))
        setStudentToDelete(null)
        setShowDeletePopup(false)

        // Show success message
        alert(responseData.message || 'Student deleted successfully')

      } catch (error) {
        console.error("❌ Error deleting student:", error)
        alert(`Error deleting student: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  const handleDeleteCancel = () => {
    setStudentToDelete(null)
    setShowDeletePopup(false)
  }

  const handleViewClick = (studentId: string) => {
    router.push(`/dashboard/students/${studentId}`)
  }

  const handleEditClick = (studentId: string) => {
    router.push(`/dashboard/students/edit/${studentId}`)
  }

  const handleToggleStudent = async (studentId: string) => {
    try {
      const token = TokenManager.getToken()
      if (!token) {
        throw new Error("Authentication token not found. Please login again.")
      }

      const student = (Array.isArray(students) ? students : []).find(s => s.id === studentId)
      if (!student) return

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${studentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_active: !student.is_active
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || errorData.message || `Failed to update student status (${response.status})`)
      }

      // Update local state
      setStudents((Array.isArray(students) ? students : []).map(s =>
        s.id === studentId ? { ...s, is_active: !s.is_active } : s
      ))

    } catch (error) {
      console.error("Error updating student status:", error)
      alert(`Error updating student status: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }



  const handleCourseToggle = (course: string) => {
    setSelectedCourses((prev) => (prev.includes(course) ? prev.filter((c) => c !== course) : [...prev, course]))
  }

  // Enhanced search functionality - filter students based on search term
  const filteredStudents = Array.isArray(students) ? students.filter((student) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return (
      student.full_name?.toLowerCase().includes(searchLower) ||
      student.student_name?.toLowerCase().includes(searchLower) ||
      student.id?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower) ||
      student.phone?.toLowerCase().includes(searchLower) ||
      student.gender?.toLowerCase().includes(searchLower) ||
      student.branch_info?.branch_name?.toLowerCase().includes(searchLower) ||
      student.courses?.some(course =>
        course.course_name?.toLowerCase().includes(searchLower) ||
        course.course_id?.toLowerCase().includes(searchLower)
      ) ||
      student.course_info?.course_id?.toLowerCase().includes(searchLower)
    )
  }) : []

  const availableCourses = ["Taekwondo", "Karate", "Kung Fu", "Mixed Martial Arts", "Zumba Dance", "Bharath Natyam"]

  // Calculate total pages
const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)

// Slice students for current page
const paginatedStudents = filteredStudents.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
)

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader currentPage="Students" />

      {/* Main Content */}
      <main className="w-full mt-[100px] p-4 lg:p-6 xl:px-12">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-[#4F5077]">Student list</h1>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
              disabled={loading || refreshing}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 text-[#4F5077] ${loading || refreshing ? 'animate-spin' : ''}`} />
              <span className="text-[#4F5077]">Refresh</span>
            </Button>
          </div>
          <div className="flex space-x-3">
            {/* <Button
              onClick={() => router.push("/dashboard/create-student")}
              className="bg-yellow-400 hover:bg-yellow-500 text-white px-6 py-2 rounded-lg font-medium"
            >
              + Add Student
            </Button> */}
            <Button
              onClick={handleAssignClick}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6"
            >
              Assign to Branch
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-center">
                <p className="text-sm text-[#4F5077] mb-1">
                  {searchTerm ? `Filtered Students (${filteredStudents.length}/${students.length})` : 'Total Students'}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {searchTerm ? filteredStudents.length : students.length}
                </p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-center">
                <p className="text-sm text-[#4F5077] mb-1">Active Students</p>
                <p className="text-2xl font-bold text-green-600">
                  {students.filter(s => s.is_active).length}
                </p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-center">
                <p className="text-sm text-[#4F5077] mb-1">With Courses</p>
                <p className="text-2xl font-bold text-purple-600">
                  {students.filter(s => (s.courses && s.courses.length > 0) || s.course_info).length}
                </p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-center">
                <p className="text-sm text-[#4F5077] mb-1">Male/Female</p>
                <p className="text-2xl font-bold text-orange-600">
                  {students.filter(s => s.gender === 'male').length}/
                  {students.filter(s => s.gender === 'female').length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-4 h-4" />
            <Input
              placeholder="Search by name, ID, location"
              className="pl-10 text-[#6B7A99]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left py-4 px-4 text-sm font-medium text-[#6B7A99]">Student Name</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-[#6B7A99]">Gender</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-[#6B7A99]">Age</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-[#6B7A99]">Courses (Expertise)</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-[#6B7A99]">Level</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-[#6B7A99]">Duration</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-[#6B7A99]">Email Id</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-[#6B7A99]">Phone Number</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-[#6B7A99]">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-8 px-6 text-center text-gray-500">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                        <span>Loading students...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={9} className="py-8 px-6 text-center">
                      <div className="text-red-500 mb-2">
                        <strong>Error loading students:</strong>
                      </div>
                      <div className="text-sm text-gray-600 mb-4">{error}</div>
                      <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        Retry
                      </Button>
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 px-6 text-center text-gray-500">
                      <div className="mb-2">
                        {searchTerm ? `No students found matching "${searchTerm}"` : 'No students found'}
                      </div>
                      {!searchTerm && (
                        <Button
                          onClick={() => router.push("/dashboard/create-student")}
                          className="bg-yellow-400 hover:bg-yellow-500 text-black"
                          size="sm"
                        >
                          Add First Student
                        </Button>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-gray-50 text-[#6B7A99] text-sm">
                      <td className="py-4 px-6">{student.full_name || student.student_name || 'N/A'}</td>
                      <td className="py-4 px-6 capitalize">{student.gender || 'N/A'}</td>
                      <td className="py-4 px-6">
                        {(() => {
                          if (student.age && student.age > 0) return student.age;
                          if (student.date_of_birth) {
                            try {
                              const birthDate = new Date(student.date_of_birth);
                              const today = new Date();
                              let age = today.getFullYear() - birthDate.getFullYear();
                              const monthDiff = today.getMonth() - birthDate.getMonth();
                              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                                age--;
                              }
                              return age > 0 ? age : 'N/A';
                            } catch {
                              return 'N/A';
                            }
                          }
                          return 'N/A';
                        })()}
                      </td>
                      <td className="py-4 px-6">
                        {student.courses && student.courses.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {student.courses.map((course, index) => (
                              <Badge key={index} variant="secondary" className="bg-[#D9D9D9] text-[#7D8592] rounded text-xs">
                                {course.course_name || course.course_id}
                              </Badge>
                            ))}
                          </div>
                        ) : student.course_info ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                            Course ID: {student.course_info.course_id}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                            No Courses
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {student.courses && student.courses.length > 0 && student.courses[0].level ?
                          student.courses[0].level :
                          student.role === 'student' ? 'Beginner' : 'N/A'
                        }
                      </td>
                      <td className="py-4 px-6">
                        {student.courses && student.courses.length > 0 && student.courses[0].duration ?
                          student.courses[0].duration :
                          student.course_info?.duration || 'N/A'
                        }
                      </td>
                      <td className="py-4 px-6">{student.email || 'N/A'}</td>
                      <td className="py-4 px-6">{student.phone || 'N/A'}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewClick(student.id)}
                            className="p-1 h-8 w-8"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(student.id)}
                            className="p-1 h-8 w-8"
                            title="Edit Student"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(student.id)}
                            className="p-1 h-8 w-8"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4 text-gray-600" />
                          </Button>
                          <Switch
                            checked={student.is_active}
                            onCheckedChange={() => handleToggleStudent(student.id)}
                            className="data-[state=checked]:bg-yellow-400"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

         {/* Pagination */}
<div className="flex justify-center items-center space-x-2 py-4 border-t">
  {/* Previous Button */}
  <Button
    variant="outline"
    size="sm"
    disabled={currentPage === 1}
    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
  >
    Previous
  </Button>

  {/* Page Numbers */}
  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
    <Button
      key={page}
      onClick={() => setCurrentPage(page)}
      className={`${
        currentPage === page
          ? "bg-yellow-400 hover:bg-yellow-500 text-black"
          : "bg-transparent"
      }`}
      variant={currentPage === page ? "default" : "outline"}
      size="sm"
    >
      {page}
    </Button>
  ))}

  {/* Next Button */}
  <Button
    variant="outline"
    size="sm"
    disabled={currentPage === totalPages}
    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
  >
    Next
  </Button>
</div>

        </div>
      </main>

      {/* Assign Popup */}
      {showAssignPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Assign Student to Branch & Course</h3>
              <Button variant="ghost" size="sm" onClick={() => {
                setShowAssignPopup(false)
                setAssignmentError(null)
                setSelectedStudent("")
                setSelectedBranch("")
                setSelectedCourses([])
              }} className="p-1">
                ×
              </Button>
            </div>

            {assignmentError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{assignmentError}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Student Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Student</label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a student..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name || student.student_name} ({student.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Branch Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Branch</label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a branch..." />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => {
                      const branchName = branch.branch?.name || branch.name
                      const address = branch.branch?.address || branch.address
                      const addressText = address ? `${address.area}, ${address.city}` : 'No address'

                      return (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branchName} - {addressText}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Courses</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose courses..." />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2 space-y-2">
                      {courses.map((course) => (
                        <div key={course.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={course.id}
                            checked={selectedCourses.includes(course.id)}
                            onChange={() => handleCourseToggle(course.id)}
                            className="rounded"
                          />
                          <label htmlFor={course.id} className="text-sm">
                            {course.title} - {course.difficulty_level}
                          </label>
                        </div>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
                {selectedCourses.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    Selected: {selectedCourses.length} course(s)
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleAssignConfirm}
              disabled={assignmentLoading}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {assignmentLoading ? "Assigning..." : "Assign Now"}
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Student</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this student? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <Button onClick={handleDeleteCancel} variant="outline" className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button onClick={handleDeleteConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
