"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  BookOpen,
  TrendingUp,
  Loader2,
  UserCheck
} from "lucide-react"
import CoachDashboardHeader from "@/components/coach-dashboard-header"
import { checkCoachAuth } from "@/lib/coachAuth"

interface StudentDetails {
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
  address?: {
    street?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  }
  emergency_contact?: {
    name?: string
    phone?: string
    relationship?: string
  }
}

export default function StudentDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string
  
  const [student, setStudent] = useState<StudentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [coachData, setCoachData] = useState<any>(null)

  useEffect(() => {
    // Use the robust coach authentication check
    const authResult = checkCoachAuth()

    if (!authResult.isAuthenticated) {
      console.log("Coach not authenticated:", authResult.error)
      router.push("/coach/login")
      return
    }

    if (authResult.coach && authResult.token) {
      setCoachData(authResult.coach)
      fetchStudentDetails(authResult.token, authResult.coach.id)
    } else {
      setError("Coach information not found")
      setLoading(false)
    }
  }, [router, studentId])

  const fetchStudentDetails = async (token: string, coachId: string) => {
    try {
      setLoading(true)
      setError(null)

      // Fetch students from coach students endpoint
      const studentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coaches/${coachId}/students`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!studentsResponse.ok) {
        if (studentsResponse.status === 401) {
          localStorage.clear()
          router.push("/coach/login")
          return
        }
        throw new Error(`Failed to fetch student details: ${studentsResponse.status}`)
      }

      const studentsData = await studentsResponse.json()
      const students = studentsData.students || studentsData.enrolled_students || []
      const studentDetail = students.find((s: any) => s.id === studentId)
      
      if (!studentDetail) {
        setError("Student not found or not enrolled in your courses")
        setLoading(false)
        return
      }

      setStudent(studentDetail)

    } catch (err: any) {
      console.error('Error fetching student details:', err)
      setError(err.message || 'Failed to load student details')
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
      return age > 0 ? `${age} years old` : 'N/A'
    } catch {
      return 'N/A'
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'N/A'
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
          currentPage="Student Details"
          coachName={coachData?.full_name || coachData?.name}
        />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mt-[100px]">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
              <span className="ml-2 text-gray-600">Loading student details...</span>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CoachDashboardHeader 
          currentPage="Student Details"
          coachName={coachData?.full_name || coachData?.name}
        />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mt-[100px]">
          <div className="px-4 py-6 sm:px-0">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-red-600 font-medium mb-2">Error loading student</p>
                  <p className="text-sm text-gray-600 mb-4">{error}</p>
                  <Button 
                    onClick={() => router.push("/coach-dashboard/students")}
                    variant="outline"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Students
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CoachDashboardHeader 
        currentPage="Student Details"
        coachName={coachData?.full_name || coachData?.name}
      />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mt-[100px]">
        <div className="px-4 py-6 sm:px-0">
          {/* Back Button */}
          <Button 
            onClick={() => router.push("/coach-dashboard/students")}
            variant="outline"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Students
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student Profile Overview */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Student Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src="" alt={student.student_name || student.full_name || 'Student'} />
                    <AvatarFallback className="text-2xl bg-yellow-100 text-yellow-800">
                      {(() => {
                        const name = student.student_name || student.full_name
                        return name
                          ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                          : 'S'
                      })()}
                    </AvatarFallback>
                  </Avatar>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {student.student_name || student.full_name || 'Unknown Student'}
                  </h3>
                  
                  {student.student_id && (
                    <p className="text-sm text-gray-500 mb-3">ID: {student.student_id}</p>
                  )}
                  
                  <div className="space-y-2">
                    <Badge className={getStatusColor(student.status || (student.is_active ? 'active' : 'inactive'))}>
                      <UserCheck className="w-3 h-3 mr-1" />
                      {student.status || (student.is_active ? 'Active' : 'Inactive')}
                    </Badge>
                    
                    {student.course_name && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-800">
                        <BookOpen className="w-3 h-3 mr-1" />
                        {student.course_name}
                      </Badge>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-6 pt-6 border-t space-y-3">
                    {student.progress !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Progress</span>
                        <span className="font-medium text-blue-600">{student.progress}%</span>
                      </div>
                    )}
                    
                    {student.attendance_percentage !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Attendance</span>
                        <span className="font-medium text-green-600">{student.attendance_percentage}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Information */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="personal" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="academic">Academic Info</TabsTrigger>
                  <TabsTrigger value="contact">Contact & Emergency</TabsTrigger>
                </TabsList>

                <TabsContent value="personal">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Full Name</label>
                          <p className="text-gray-900">{student.student_name || student.full_name || 'Unknown Student'}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Gender</label>
                          <p className="text-gray-900 capitalize">{student.gender || 'N/A'}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                          <p className="text-gray-900">
                            {student.date_of_birth ? formatDate(student.date_of_birth) : 'N/A'}
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Age</label>
                          <p className="text-gray-900">
                            {student.date_of_birth ? calculateAge(student.date_of_birth) : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Address Information */}
                      {student.address && (
                        <div className="mt-6 pt-6 border-t">
                          <h4 className="text-sm font-medium text-gray-500 mb-3">Address</h4>
                          <div className="flex items-start space-x-3">
                            <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                              <div className="space-y-1">
                                {student.address.street && (
                                  <p className="text-gray-900">{student.address.street}</p>
                                )}
                                <p className="text-gray-900">
                                  {[
                                    student.address.city,
                                    student.address.state,
                                    student.address.postal_code
                                  ].filter(Boolean).join(', ')}
                                </p>
                                {student.address.country && (
                                  <p className="text-gray-900">{student.address.country}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="academic">
                  <Card>
                    <CardHeader>
                      <CardTitle>Academic Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Course</label>
                            <p className="text-gray-900">{student.course_name || 'N/A'}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-500">Branch</label>
                            <p className="text-gray-900">{student.branch_name || 'N/A'}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-500">Enrollment Date</label>
                            <p className="text-gray-900">
                              {student.enrollment_date ? formatDate(student.enrollment_date) : 'N/A'}
                            </p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-500">Status</label>
                            <Badge className={getStatusColor(student.status || (student.is_active ? 'active' : 'inactive'))}>
                              {student.status || (student.is_active ? 'Active' : 'Inactive')}
                            </Badge>
                          </div>
                        </div>

                        {/* Progress and Performance */}
                        <div className="pt-4 border-t">
                          <h4 className="text-sm font-medium text-gray-500 mb-3">Performance Metrics</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {student.progress !== undefined && (
                              <div className="flex items-center space-x-3">
                                <TrendingUp className="w-5 h-5 text-blue-500" />
                                <div>
                                  <p className="text-sm text-gray-500">Course Progress</p>
                                  <p className="text-lg font-semibold text-blue-600">{student.progress}%</p>
                                </div>
                              </div>
                            )}
                            
                            {student.attendance_percentage !== undefined && (
                              <div className="flex items-center space-x-3">
                                <Calendar className="w-5 h-5 text-green-500" />
                                <div>
                                  <p className="text-sm text-gray-500">Attendance Rate</p>
                                  <p className="text-lg font-semibold text-green-600">{student.attendance_percentage}%</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="contact">
                  <Card>
                    <CardHeader>
                      <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <div>
                            <label className="text-sm font-medium text-gray-500">Email</label>
                            <p className="text-gray-900">{student.email}</p>
                          </div>
                        </div>
                        
                        {student.phone && (
                          <div className="flex items-center space-x-3">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <div>
                              <label className="text-sm font-medium text-gray-500">Phone</label>
                              <p className="text-gray-900">{student.phone}</p>
                            </div>
                          </div>
                        )}

                        {/* Emergency Contact */}
                        {student.emergency_contact && (
                          <div className="pt-4 border-t">
                            <h4 className="text-sm font-medium text-gray-500 mb-3">Emergency Contact</h4>
                            <div className="space-y-2">
                              <div>
                                <label className="text-sm font-medium text-gray-500">Name</label>
                                <p className="text-gray-900">{student.emergency_contact.name || 'N/A'}</p>
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium text-gray-500">Relationship</label>
                                <p className="text-gray-900">{student.emergency_contact.relationship || 'N/A'}</p>
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium text-gray-500">Phone</label>
                                <p className="text-gray-900">{student.emergency_contact.phone || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
