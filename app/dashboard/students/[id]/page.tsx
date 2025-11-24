"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  BookOpen, 
  TrendingUp,
  CreditCard,
  Clock,
  Award,
  Edit,
  UserCheck,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"
import { TokenManager } from "@/lib/tokenManager"

interface StudentDetails {
  id: string
  student_id?: string
  full_name: string
  email: string
  phone: string
  date_of_birth?: string
  gender?: string
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
  is_active: boolean
  role: string
  created_at: string
  updated_at: string
  // Course enrollment data
  courses?: Array<{
    course_id: string
    course_name: string
    level: string
    duration: string
    enrollment_date: string
    completion_date?: string
    progress?: number
    status: 'active' | 'completed' | 'paused' | 'cancelled'
  }>
  // Additional computed data
  total_courses?: number
  completed_courses?: number
  attendance_percentage?: number
  outstanding_balance?: number
}

interface EnrollmentHistory {
  id: string
  course_name: string
  enrollment_date: string
  completion_date?: string
  status: string
  progress: number
  grade?: string
}

interface PaymentRecord {
  id: string
  amount: number
  payment_date: string
  payment_method: string
  status: 'completed' | 'pending' | 'failed'
  description: string
}

interface AttendanceRecord {
  date: string
  course_name: string
  status: 'present' | 'absent' | 'late'
  duration_minutes?: number
}

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const [student, setStudent] = useState<StudentDetails | null>(null)
  const [enrollmentHistory, setEnrollmentHistory] = useState<EnrollmentHistory[]>([])
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true)
  const [paymentsLoading, setPaymentsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStudentDetails()
  }, [studentId])

  const fetchStudentDetails = async () => {
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
          setError("Authentication required. Please login again.")
          return
        }
      }

      // Fetch student details
      const studentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!studentResponse.ok) {
        if (studentResponse.status === 404) {
          setError("Student not found")
          return
        }
        throw new Error(`Failed to fetch student: ${studentResponse.status}`)
      }

      const studentData = await studentResponse.json()
      setStudent(studentData.user || studentData)

      // Fetch related data in parallel
      await Promise.all([
        fetchEnrollmentHistory(token),
        fetchPaymentHistory(token),
        fetchAttendanceRecords(token)
      ])

    } catch (err: any) {
      console.error('Error fetching student details:', err)
      setError(err.message || 'Failed to load student details')
    } finally {
      setLoading(false)
    }
  }

  const fetchEnrollmentHistory = async (token: string) => {
    try {
      setEnrollmentsLoading(true)
      const enrollmentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${studentId}/enrollments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (enrollmentResponse.ok) {
        const enrollmentData = await enrollmentResponse.json()
        const enrollments = enrollmentData.enrollments || []

        // Transform API response to match frontend interface
        const history: EnrollmentHistory[] = enrollments.map((enrollment: any) => ({
          id: enrollment.id || `enrollment-${Date.now()}`,
          course_name: enrollment.course_name || 'Unknown Course',
          enrollment_date: enrollment.enrollment_date || enrollment.created_at || new Date().toISOString(),
          completion_date: enrollment.completion_date,
          status: enrollment.status || 'active',
          progress: enrollment.progress || 0,
          grade: enrollment.grade
        }))

        setEnrollmentHistory(history)
      } else {
        console.error('Failed to fetch enrollment history:', enrollmentResponse.status, enrollmentResponse.statusText)
        setError('Failed to load enrollment history')
      }
    } catch (err) {
      console.error('Error fetching enrollment history:', err)
      setError('Error loading enrollment history')
    } finally {
      setEnrollmentsLoading(false)
    }
  }

  const fetchPaymentHistory = async (token: string) => {
    try {
      setPaymentsLoading(true)
      const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${studentId}/payments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json()
        const payments = paymentData.payments || []

        // Transform API response to match frontend interface
        const history: PaymentRecord[] = payments.map((payment: any) => ({
          id: payment.id || `payment-${Date.now()}`,
          amount: payment.amount || 0,
          payment_date: payment.payment_date || payment.created_at || new Date().toISOString(),
          payment_method: payment.payment_method || 'Unknown',
          status: payment.payment_status === 'paid' ? 'completed' as const :
                  payment.payment_status === 'pending' ? 'pending' as const : 'failed' as const,
          description: payment.description || `${payment.course_name || 'Course'} - ${payment.payment_type || 'Payment'}`
        }))

        setPaymentHistory(history)
      } else {
        console.error('Failed to fetch payment history:', paymentResponse.status, paymentResponse.statusText)
        setError('Failed to load payment history')
      }
    } catch (err) {
      console.error('Error fetching payment history:', err)
      setError('Error loading payment history')
    } finally {
      setPaymentsLoading(false)
    }
  }

  const fetchAttendanceRecords = async (token: string) => {
    try {
      // Mock attendance data - in real app, this would be an API call
      const mockAttendance: AttendanceRecord[] = [
        {
          date: '2024-01-20',
          course_name: 'Karate Basics',
          status: 'present',
          duration_minutes: 60
        },
        {
          date: '2024-01-22',
          course_name: 'Karate Basics',
          status: 'present',
          duration_minutes: 60
        },
        {
          date: '2024-01-24',
          course_name: 'Karate Basics',
          status: 'absent'
        }
      ]
      setAttendanceRecords(mockAttendance)
    } catch (err) {
      console.error('Error fetching attendance records:', err)
    }
  }

  const handleEdit = () => {
    router.push(`/dashboard/students/edit/${studentId}`)
  }

  const handleBack = () => {
    router.push('/dashboard/students')
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'active':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'paused':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 " />
    }
  }

  const getAttendanceIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'late':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case 'absent':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 " />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold  mb-2">Student Not Found</h2>
            <p className=" mb-6">{error}</p>
            <div className="space-x-4">
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Students
              </Button>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!student) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <div className="xl:px-12 px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-row gap-6 text-[#4F5077]">
              <div className="flex items-center space-x-4 border-r border-gray-200 pr-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className=" hover:"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Students
                </Button>
              </div>
              <div className="flex items-center space-x-4 ml-4">
                <h1 className="text-3xl font-bold uppercase">
                  {student.full_name}
                </h1>
                <Badge 
                  variant={student.is_active ? "default" : "secondary"}
                  className={student.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                >
                  {student.is_active ? "Active" : "Inactive"}
                </Badge>
                {student.student_id && (
                  <Badge variant="outline">
                    ID: {student.student_id}
                  </Badge>
                )}
              </div>
            </div>
            
            <Button onClick={handleEdit} className="bg-yellow-400 hover:bg-yellow-500 text-white">
              <Edit className="w-4 h-4 mr-2" />
              Edit Student
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-[#4D5077] font-bold">
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-[#7F8592]">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium  mb-2 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </h3>
                    <p className="text-sm ">{student.email}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium  mb-2 flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      Phone
                    </h3>
                    <p className="text-sm ">{student.phone || 'Not provided'}</p>
                  </div>

                  {student.date_of_birth && (
                    <div>
                      <h3 className="text-sm font-medium  mb-2 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Date of Birth
                      </h3>
                      <p className="text-sm ">
                        {new Date(student.date_of_birth).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        {calculateAge(student.date_of_birth) && (
                          <span className="ml-2 text-gray-500">
                            (Age: {calculateAge(student.date_of_birth)})
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {student.gender && (
                    <div>
                      <h3 className="text-sm font-medium  mb-1">Gender</h3>
                      <p className="text-sm  capitalize">{student.gender}</p>
                    </div>
                  )}
                </div>

                {/* Address */}
                {student.address && (
                  <div>
                    <h3 className="text-sm font-medium  mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Address
                    </h3>
                    <div className="text-sm ">
                      {student.address.street && <p>{student.address.street}</p>}
                      {(student.address.city || student.address.state || student.address.postal_code) && (
                        <p>
                          {[student.address.city, student.address.state, student.address.postal_code]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      )}
                      {student.address.country && <p>{student.address.country}</p>}
                    </div>
                  </div>
                )}

                {/* Emergency Contact */}
                {student.emergency_contact && (
                  <div>
                    <h3 className="text-sm font-medium  mb-2 flex items-center">
                      <UserCheck className="w-4 h-4 mr-2" />
                      Emergency Contact
                    </h3>
                    <div className="text-sm ">
                      <p><strong>{student.emergency_contact.name}</strong></p>
                      {student.emergency_contact.phone && <p>Phone: {student.emergency_contact.phone}</p>}
                      {student.emergency_contact.relationship && (
                        <p>Relationship: {student.emergency_contact.relationship}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                  <div>
                    <h3 className="text-sm font-medium  mb-1">Enrolled</h3>
                    <p className="text-sm ">
                      {new Date(student.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium  mb-1">Last Updated</h3>
                    <p className="text-sm ">
                      {new Date(student.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Enrollment History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center font-bold text-[#4D5077]">
                  Course Enrollment History ({enrollmentsLoading ? '...' : enrollmentHistory.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="text-[#7F8592]">
                {enrollmentsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-lg">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                      </div>
                    ))}
                  </div>
                ) : enrollmentHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No course enrollment history available</p>
                    <p className="text-sm mt-2">Course enrollments will appear here once the student enrolls in courses.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enrollmentHistory.map((enrollment) => (
                      <div key={enrollment.id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-l-green-500">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-5 h-5 " />
                            <h4 className="font-semibold ">{enrollment.course_name}</h4>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(enrollment.status)}
                            <Badge
                              variant="secondary"
                              className={`text-xs ${
                                enrollment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                enrollment.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                enrollment.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm  mb-3">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">Enrolled:</span>
                            <span>{new Date(enrollment.enrollment_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}</span>
                          </div>
                          {enrollment.completion_date && (
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="font-medium">Completed:</span>
                              <span>{new Date(enrollment.completion_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}</span>
                            </div>
                          )}
                          {enrollment.grade && (
                            <div className="flex items-center space-x-1">
                              <Award className="w-4 h-4 text-yellow-600" />
                              <span className="font-medium">Grade:</span>
                              <span className="font-semibold">{enrollment.grade}</span>
                            </div>
                          )}
                        </div>

                        {enrollment.progress >= 0 && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className=" flex items-center">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                Course Progress
                              </span>
                              <span className="font-semibold text-blue-600">{enrollment.progress}%</span>
                            </div>
                            <Progress value={enrollment.progress} className="h-3" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Attendance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center font-bold text-[#4D5077]">
                  <Clock className="w-5 h-5 mr-2" />
                  Recent Attendance
                </CardTitle>
              </CardHeader>
              <CardContent className="text-[#7F8592]">
                {attendanceRecords.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No attendance records available</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {attendanceRecords.slice(0, 10).map((record, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            {getAttendanceIcon(record.status)}
                            <span className="font-medium ">{record.course_name}</span>
                          </div>
                          <div className="text-sm ">
                            {new Date(record.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                            {record.duration_minutes && (
                              <span className="ml-2">• {record.duration_minutes} min</span>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            record.status === 'present' ? 'bg-green-100 text-green-800' :
                            record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          {record.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-[#4D5077] font-bold">
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-[#7F8592]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span className="text-sm ">Total Courses</span>
                  </div>
                  <span className="font-semibold">{student.total_courses || student.courses?.length || 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="w-4 h-4 mr-2" />
                    <span className="text-sm ">Completed</span>
                  </div>
                  <span className="font-semibold">
                    {student.completed_courses || student.courses?.filter(c => c.status === 'completed').length || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm ">Attendance Rate</span>
                  </div>
                  <span className="font-semibold">
                    {student.attendance_percentage ||
                     Math.round((attendanceRecords.filter(r => r.status === 'present').length /
                                Math.max(attendanceRecords.length, 1)) * 100) || 0}%
                  </span>
                </div>

                {student.outstanding_balance !== undefined && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-2 text-red-600" />
                      <span className="text-sm ">Outstanding</span>
                    </div>
                    <span className={`font-semibold ${student.outstanding_balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₹{student.outstanding_balance.toLocaleString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center font-bold text-[#4D5077]">
                  Payment History ({paymentsLoading ? '...' : paymentHistory.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="text-[#7F8592]">
                {paymentsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : paymentHistory.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No payment history available</p>
                    <p className="text-xs mt-1">Payment transactions will appear here once payments are made.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paymentHistory.slice(0, 10).map((payment) => (
                      <div key={payment.id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-l-blue-500">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold ">₹{payment.amount.toLocaleString()}</span>
                          </div>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}
                          >
                            {payment.status}
                          </Badge>
                        </div>
                        <div className="text-sm  space-y-1">
                          <p className="font-medium">{payment.description}</p>
                          <div className="flex items-center justify-between">
                            <span>
                              📅 {new Date(payment.payment_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <span>💳 {payment.payment_method}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {paymentHistory.length > 10 && (
                      <div className="text-center pt-2">
                        <p className="text-sm text-gray-500">
                          ... and {paymentHistory.length - 10} more payments
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => router.push(`/dashboard/payments?student_id=${studentId}`)}
                        >
                          View All Payments
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Student Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center font-bold text-[#4D5077]">Student Status</CardTitle>
              </CardHeader>
              <CardContent className="text-[#7F8592]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm ">Status</span>
                    <Badge
                      variant={student.is_active ? "default" : "secondary"}
                      className={student.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                    >
                      {student.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm ">Student ID</span>
                    <span className="text-sm font-mono ">
                      {student.student_id || student.id}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm ">Role</span>
                    <Badge variant="outline" className="text-xs">
                      {student.role}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center font-bold text-[#4D5077]">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-[#7F8592]">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/dashboard/students/edit/${studentId}`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Student Details
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/dashboard/enrollments?student_id=${studentId}`)}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Manage Enrollments
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/dashboard/payments?student_id=${studentId}`)}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  View Payment History
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push(`/dashboard/attendance?student_id=${studentId}`)}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  View Attendance Records
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
