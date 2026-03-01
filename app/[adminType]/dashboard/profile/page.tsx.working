"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import StudentDashboardLayout from "@/components/student-dashboard-layout"
import { Edit, Mail, Phone, MapPin, Calendar, Award, Clock, User, Heart, AlertCircle } from "lucide-react"
import { studentProfileAPI, type StudentProfile } from "@/lib/studentProfileAPI"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function StudentProfilePage() {
  const router = useRouter()
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Check if user is logged in
        const token = localStorage.getItem("token")
        const user = localStorage.getItem("user")

        if (!token) {
          router.push("/login")
          return
        }

        // Check user role from localStorage first
        if (user) {
          try {
            const userData = JSON.parse(user)

            // Check if user is actually a student
            if (userData.role !== "student") {
              if (userData.role === "coach") {
                router.push("/coach-dashboard")
              } else {
                router.push("/dashboard")
              }
              return
            }
          } catch (error) {
            console.error("Error parsing user data:", error)
          }
        }

        // Fetch profile data from API
        const response = await studentProfileAPI.getProfile(token)
        setStudentProfile(response.profile)
        setError(null)
      } catch (error: any) {
        console.error("Error loading profile:", error)
        setError(error.message || "Failed to load profile data")

        // If API fails, try to use localStorage data as fallback
        const user = localStorage.getItem("user")
        if (user) {
          try {
            const userData = JSON.parse(user)
            const fallbackProfile: StudentProfile = {
              id: userData.id || "unknown",
              email: userData.email || "student@example.com",
              phone: userData.phone || "+91 98765 43210",
              first_name: userData.first_name || "Student",
              last_name: userData.last_name || "",
              full_name: userData.full_name || `${userData.first_name || "Student"} ${userData.last_name || ""}`.trim(),
              date_of_birth: userData.date_of_birth,
              gender: userData.gender,
              address: userData.address,
              emergency_contact: userData.emergency_contact,
              medical_info: userData.medical_info,
              is_active: userData.is_active !== false,
              created_at: userData.created_at || new Date().toISOString(),
              updated_at: userData.updated_at || new Date().toISOString(),
              enrollments: []
            }
            setStudentProfile(fallbackProfile)
          } catch (parseError) {
            console.error("Error parsing fallback user data:", parseError)
          }
        }
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  const handleEditProfile = () => {
    router.push("/student-dashboard/profile/edit")
  }

  if (loading) {
    return (
      <StudentDashboardLayout
        studentName="Loading..."
        onLogout={handleLogout}
        pageTitle="Profile"
        pageDescription="Loading your profile information..."
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
        </div>
      </StudentDashboardLayout>
    )
  }

  if (!studentProfile) {
    return (
      <StudentDashboardLayout
        studentName="Student"
        onLogout={handleLogout}
        pageTitle="Profile"
        pageDescription="Unable to load profile information"
      >
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-500">Unable to load profile data. Please try again later.</p>
              <div className="flex justify-center mt-4">
                <Button onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </StudentDashboardLayout>
    )
  }

  // Calculate profile stats from actual data
  const profileStats = {
    coursesEnrolled: studentProfile.enrollments?.length || 0,
    totalHours: studentProfile.enrollments?.length * 45 || 0, // Estimate based on enrollments
    attendanceRate: 85, // This would come from attendance data
    currentBelt: "Yellow Belt" // This would come from progress data
  }

  return (
    <StudentDashboardLayout
      studentName={studentProfile.full_name}
      onLogout={handleLogout}
      pageTitle="My Profile"
      pageDescription="View and manage your personal information"
      headerActions={
        <Button
          onClick={handleEditProfile}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      }
    >
      <div className="space-y-8">
        {error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Some data may be outdated. {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-white text-2xl font-bold">
                    {studentProfile.first_name?.charAt(0)?.toUpperCase() || "S"}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">{studentProfile.full_name}</CardTitle>
                  <CardDescription>Student ID: {studentProfile.id.slice(-8)}</CardDescription>
                  <Badge className="bg-yellow-100 text-yellow-800 mt-2">
                    {profileStats.currentBelt}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{studentProfile.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{studentProfile.phone}</span>
                  </div>
                  {studentProfile.address && (
                    <div className="flex items-center space-x-3 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {[
                          studentProfile.address.street,
                          studentProfile.address.city,
                          studentProfile.address.state,
                          studentProfile.address.postal_code
                        ].filter(Boolean).join(", ") || "Address not provided"}
                      </span>
                    </div>
                  )}
                  {studentProfile.date_of_birth && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        Born: {new Date(studentProfile.date_of_birth).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      Joined: {new Date(studentProfile.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {studentProfile.gender && (
                    <div className="flex items-center space-x-3 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Gender: {studentProfile.gender}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Courses Enrolled</span>
                    <span className="font-semibold">{profileStats.coursesEnrolled}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Hours</span>
                    <span className="font-semibold">{profileStats.totalHours}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Attendance Rate</span>
                    <span className="font-semibold">{profileStats.attendanceRate}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enrolled Courses */}
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Courses</CardTitle>
                <CardDescription>Your current training programs</CardDescription>
              </CardHeader>
              <CardContent>
                {studentProfile.enrollments && studentProfile.enrollments.length > 0 ? (
                  <div className="space-y-4">
                    {studentProfile.enrollments.map((enrollment, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className="font-semibold text-gray-900">{enrollment.course_name}</h4>
                          <p className="text-sm text-gray-600">Branch: {enrollment.branch_name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {enrollment.payment_status}
                            </Badge>
                            {enrollment.is_active && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                Active
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Enrolled</p>
                          <p className="text-sm font-semibold text-blue-600">
                            {enrollment.enrollment_date ?
                              new Date(enrollment.enrollment_date).toLocaleDateString() :
                              'N/A'
                            }
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No active enrollments found</p>
                )}
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            {studentProfile.emergency_contact && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    <span>Emergency Contact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {studentProfile.emergency_contact.name && (
                    <div className="flex items-center space-x-3 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{studentProfile.emergency_contact.name}</span>
                    </div>
                  )}
                  {studentProfile.emergency_contact.phone && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{studentProfile.emergency_contact.phone}</span>
                    </div>
                  )}
                  {studentProfile.emergency_contact.relationship && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Heart className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Relationship: {studentProfile.emergency_contact.relationship}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Medical Information */}
            {studentProfile.medical_info && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-blue-500" />
                    <span>Medical Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {studentProfile.medical_info.allergies && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Allergies:</p>
                      <p className="text-sm text-gray-600">{studentProfile.medical_info.allergies}</p>
                    </div>
                  )}
                  {studentProfile.medical_info.medications && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Medications:</p>
                      <p className="text-sm text-gray-600">{studentProfile.medical_info.medications}</p>
                    </div>
                  )}
                  {studentProfile.medical_info.conditions && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Medical Conditions:</p>
                      <p className="text-sm text-gray-600">{studentProfile.medical_info.conditions}</p>
                    </div>
                  )}
                  {studentProfile.medical_info.blood_type && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Blood Type:</p>
                      <p className="text-sm text-gray-600">{studentProfile.medical_info.blood_type}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </StudentDashboardLayout>
  )
}
