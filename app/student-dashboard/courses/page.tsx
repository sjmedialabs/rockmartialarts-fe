"use client"

import { useState, useEffect } from "react"
import { useRazorpay } from "@/hooks/use-razorpay"
import { useRouter } from "next/navigation"
import StudentDashboardLayout from "@/components/student-dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  BookOpen,
  Calendar,
  MapPin,
  Clock,
  Award,
  TrendingUp,
  AlertCircle,
  Plus,
  RefreshCw,
  Star,
  Users,
  CreditCard,
  CheckCircle,
  XCircle
} from "lucide-react"
import { studentProfileAPI } from "@/lib/studentProfileAPI"
import { courseAPI } from "@/lib/courseAPI"
import { branchAPI } from "@/lib/branchAPI"

interface EnrolledCourse {
  enrollment_id: string
  course_id: string
  course_name: string
  branch_id: string
  branch_name: string
  start_date: string
  end_date: string
  enrollment_date: string
  is_active: boolean
  payment_status: string
  progress?: number
}

interface AvailableCourse {
  id: string
  title: string
  description: string
  difficulty_level: string
  category_id: string
  branch_id?: string
  branch_name?: string
  pricing: {
    amount: number
    currency: string
  }
}

interface Branch {
  id: string
  name: string
  address: string
  code?: string
}

export default function StudentCoursesPage() {
  const router = useRouter()
  const { initiatePayment, loading: paymentLoading } = useRazorpay()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [studentData, setStudentData] = useState<any>(null)
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([])
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  
  // Enrollment dialog state
  const [showEnrollDialog, setShowEnrollDialog] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<AvailableCourse | null>(null)
  const [selectedBranch, setSelectedBranch] = useState("")
  const [selectedDuration, setSelectedDuration] = useState("1")
  const [enrolling, setEnrolling] = useState(false)

  // Branch change request dialog
  const [showBranchChangeDialog, setShowBranchChangeDialog] = useState(false)
  const [changingEnrollment, setChangingEnrollment] = useState<EnrolledCourse | null>(null)
  const [newBranchId, setNewBranchId] = useState("")
  const [requestingChange, setRequestingChange] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")

    if (!token) {
      router.push("/login")
      return
    }

    if (user) {
      const userData = JSON.parse(user)
      if (userData.role !== "student") {
        if (userData.role === "coach") {
          router.push("/coach-dashboard")
        } else {
          router.push("/dashboard")
        }
        return
      }
      setStudentData({
        id: userData.id || userData.student_id,
        name: userData.full_name || userData.name || "Student",
        email: userData.email || ""
      })
    }

    loadData(token)
  }, [router])

  const loadData = async (token: string) => {
    try {
      setLoading(true)
      setError(null)

      // Load all branches first
      try {
        const branchesResponse = await branchAPI.getBranches(token)
        console.log("🔍 Branch API Response:", branchesResponse)
        const allBranches = branchesResponse.branches || []
        
        // Transform branches to flatten nested structure
        const transformedBranches = allBranches.map((b: any) => ({
          id: b.id,
          name: b.branch?.name || b.name || 'Unknown Branch',
          code: b.branch?.code || b.code,
          email: b.branch?.email || b.email,
          phone: b.branch?.phone || b.phone,
          is_active: b.is_active
        }))
        
        console.log("✅ Transformed branches:", transformedBranches.length, transformedBranches)
        
        // Ensure branches are set even if empty
        if (Array.isArray(transformedBranches) && transformedBranches.length > 0) {
          setBranches(transformedBranches)
          console.log("✅ Branches state updated with:", transformedBranches.length, "branches")
        } else {
          console.warn("⚠️ No branches found in API response")
          setBranches([])
        }
      } catch (err) {
        console.error("❌ Error loading branches:", err)
        setBranches([])
      }
      // Load enrolled courses from profile
      const profileResponse = await studentProfileAPI.getProfile(token)
      const enrollments = profileResponse.profile.enrollments || []
      
      const enrolledData: EnrolledCourse[] = enrollments.map((e: any) => ({
        enrollment_id: e.id,
        course_id: e.course_id,
        course_name: e.course_name,
        branch_id: e.branch_id,
        branch_name: e.branch_name || "Unknown Branch",
        start_date: e.start_date,
        end_date: e.end_date,
        enrollment_date: e.enrollment_date || e.start_date,
        is_active: e.is_active,
        payment_status: e.payment_status,
        progress: Math.floor(Math.random() * 100) // TODO: Replace with actual progress from API
      }))
      
      console.log("✅ Loaded enrolled courses:", enrolledData.length)
      setEnrolledCourses(enrolledData)

      // Get student's branch IDs
      const studentBranchIds = Array.from(new Set(enrolledData.map(e => e.branch_id)))
      console.log("📍 Student branches:", studentBranchIds)

      // Load available courses
      try {
        const enrolledCourseIds = enrolledData.map(e => e.course_id)
        let availableCoursesList: any[] = []

        if (studentBranchIds.length > 0) {
          // Load courses for each of student's branches
          for (const branchId of studentBranchIds) {
            try {
              const branchCoursesResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/branches/${branchId}/courses`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                }
              )
              
              if (branchCoursesResponse.ok) {
                const branchData = await branchCoursesResponse.json()
                const branchCourses = branchData.courses || []
                console.log(`✅ Loaded ${branchCourses.length} courses for branch ${branchId}`)
                
                // Add branch info to each course
                const coursesWithBranch = branchCourses.map((c: any) => ({
                  ...c,
                  branch_id: branchId,
                  branch_name: enrolledData.find(e => e.branch_id === branchId)?.branch_name
                }))
                
                availableCoursesList.push(...coursesWithBranch)
              }
            } catch (err) {
              console.error(`Error loading courses for branch ${branchId}:`, err)
            }
          }
        }
        
        // If no branch-specific courses loaded, load all courses
        if (availableCoursesList.length === 0) {
          console.log("⚠️ No branch-specific courses found, loading all courses")
          const allCoursesResponse = await courseAPI.getCourses(token)
          availableCoursesList = allCoursesResponse.courses || []
        }

        // Filter out enrolled courses and inactive ones
        const filteredCourses = availableCoursesList.filter((c: any) => 
          !enrolledCourseIds.includes(c.id) && c.settings?.active !== false
        )

        // Remove duplicates
        const uniqueCourses = Array.from(
          new Map(filteredCourses.map((c: any) => [c.id, c])).values()
        )

        console.log("✅ Available courses after filtering:", uniqueCourses.length)
        setAvailableCourses(uniqueCourses)
      } catch (err) {
        console.error("Error loading available courses:", err)
      }

    } catch (error: any) {
      console.error("❌ Error loading course data:", error)
      setError(`Failed to load course data: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    const token = localStorage.getItem("token")
    if (token) {
      await loadData(token)
    }
    setRefreshing(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("auth_data")
    router.push("/login")
  }

  const handleEnrollClick = (course: AvailableCourse) => {
    console.log("📋 Opening enrollment dialog. Branches available:", branches.length, branches)
    setSelectedCourse(course)
    // Pre-select branch if course has one
    setSelectedBranch(course.branch_id || "")
    setSelectedDuration("1")
    setShowEnrollDialog(true)
  }

  const handleEnrollSubmit = async () => {
    if (!selectedCourse || !selectedBranch || !selectedDuration) {
      alert("Please select branch and duration")
      return
    }

    setEnrolling(true)
    const amount = (selectedCourse.pricing?.amount || 0) * parseInt(selectedDuration)
    
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      // Get student profile for prefill data
      const profileResponse = await studentProfileAPI.getProfile(token)
      const profile = profileResponse.profile

      // Find selected branch details
      const selectedBranchData = branches.find(b => b.id === selectedBranch)

      const enrollmentData = {
        course_id: selectedCourse.id,
        course_name: selectedCourse.name,
        branch_id: selectedBranch,
        branch_name: selectedBranchData?.name || 'Unknown Branch',
        duration_months: parseInt(selectedDuration),
        amount,
        student_name: profile.full_name || `${profile.first_name} ${profile.last_name}`,
        student_email: profile.email,
        student_phone: profile.phone
      }

      // Initiate Razorpay payment
      await initiatePayment({
        amount,
        currency: 'INR',
        enrollmentData,
        onSuccess: (result: any) => {
          console.log('Payment successful:', result)
          setShowEnrollDialog(false)
          setEnrolling(false)
          // Redirect to success page with receipt data
          router.push(`/student-dashboard/payment-success?payment_id=${result.receipt.payment_id}&order_id=${result.receipt.order_id}&amount=${result.receipt.amount}&course_name=${encodeURIComponent(enrollmentData.course_name)}&branch_name=${encodeURIComponent(enrollmentData.branch_name)}`)
        },
        onFailure: (error: any) => {
          console.error('Payment failed:', error)
          setEnrolling(false)
          alert(`Payment failed: ${error.message || 'Unknown error'}`)
        }
      })
    } catch (error: any) {
      console.error('Enrollment failed:', error)
      alert(`Enrollment failed: ${error.message}`)
      setEnrolling(false)
    }
  }

  const handleBranchChangeRequest = (enrollment: EnrolledCourse) => {
    setChangingEnrollment(enrollment)
    setNewBranchId("")
    setShowBranchChangeDialog(true)
  }

  const handleBranchChangeSubmit = async () => {
    if (!changingEnrollment || !newBranchId) {
      alert("Please select a new branch")
      return
    }

    setRequestingChange(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      // Submit branch change request
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/enrollments/${changingEnrollment.enrollment_id}/branch-change-request`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            new_branch_id: newBranchId,
            reason: "Student requested branch change"
          })
        }
      )

      if (response.ok) {
        alert("Branch change request submitted successfully! Waiting for admin approval.")
        setShowBranchChangeDialog(false)
        handleRefresh()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Request failed")
      }
    } catch (error: any) {
      alert(`Request failed: ${error.message}`)
    } finally {
      setRequestingChange(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (isActive: boolean, paymentStatus: string) => {
    if (!isActive || paymentStatus === 'expired') {
      return <Badge variant="destructive">Expired</Badge>
    }
    if (paymentStatus === 'pending') {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Payment</Badge>
    }
    if (paymentStatus === 'paid') {
      return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
    }
    return <Badge variant="outline">Inactive</Badge>
  }

  if (loading) {
    return (
      <StudentDashboardLayout
        studentName={studentData?.name}
        onLogout={handleLogout}
        isLoading={true}
      >
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </StudentDashboardLayout>
    )
  }

  return (
    <StudentDashboardLayout
      studentName={studentData?.name}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BookOpen className="h-8 w-8" />
              My Courses
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your enrolled courses and browse new courses
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {availableCourses.length > 0 && (
              <Button
                size="sm"
                onClick={() => {
                  const firstCourse = availableCourses[0]
                  if (firstCourse) handleEnrollClick(firstCourse)
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Browse Courses
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrolledCourses.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {enrolledCourses.filter(c => c.is_active && c.payment_status === 'paid').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {enrolledCourses.filter(c => c.payment_status === 'pending').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {enrolledCourses.length > 0
                  ? Math.round(enrolledCourses.reduce((sum, c) => sum + (c.progress || 0), 0) / enrolledCourses.length)
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enrolled Courses */}
        {enrolledCourses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No courses enrolled</h3>
              <p className="text-muted-foreground mb-6 text-center">
                You haven't enrolled in any courses yet. Start your martial arts journey today!
              </p>
              <div className="flex gap-3">
                {availableCourses.length > 0 && (
                  <Button 
                    onClick={() => handleEnrollClick(availableCourses[0])}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Browse Courses
                  </Button>
                )}
                <Button variant="outline" onClick={handleRefresh}>
                  Retry Loading
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {enrolledCourses.map((course) => (
              <Card key={course.enrollment_id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-semibold mb-1">{course.course_name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{course.branch_name}</span>
                          </div>
                        </div>
                        {getStatusBadge(course.is_active, course.payment_status)}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium">Enrolled</div>
                            <div className="text-muted-foreground">{formatDate(course.enrollment_date)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium">Expires</div>
                            <div className="text-muted-foreground">{formatDate(course.end_date)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium">Progress</div>
                            <div className="text-muted-foreground">{course.progress || 0}%</div>
                          </div>
                        </div>
                      </div>

                      {course.progress !== undefined && (
                        <div className="mb-4">
                          <Progress value={course.progress} className="h-2" />
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleBranchChangeRequest(course)}
                          disabled={!course.is_active}
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Change Branch
                        </Button>
                        {course.payment_status === 'pending' && (
                          <Button 
                            size="sm"
                            onClick={() => router.push('/student-dashboard/payments')}
                            className="bg-yellow-600 hover:bg-yellow-700"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Complete Payment
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Available Courses */}
        {availableCourses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Available Courses at Your Branch{enrolledCourses.length > 0 ? '(es)' : ''}</CardTitle>
              <CardDescription>
                {enrolledCourses.length > 0 
                  ? `Courses available at your enrolled branches`
                  : `Browse and enroll in available courses`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableCourses.slice(0, 6).map((course) => (
                  <Card key={course.id} className="border-2">
                    <CardHeader>
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge>{course.difficulty_level}</Badge>
                          <span className="font-semibold text-lg">
                            {formatCurrency(course.pricing?.amount || 0)}
                          </span>
                        </div>
                        {course.branch_name && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{course.branch_name}</span>
                          </div>
                        )}
                        <Button 
                          className="w-full"
                          onClick={() => handleEnrollClick(course)}
                        >
                          Enroll Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enrollment Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Enroll in {selectedCourse?.title}</DialogTitle>
            <DialogDescription>
              Complete the enrollment details below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="branch">Select Branch</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="text-gray-900 dark:text-gray-100">
                  <SelectValue placeholder={branches.length === 0 ? "Loading branches..." : "Choose a branch"} />
                </SelectTrigger>
                <SelectContent>
                  {branches.length === 0 ? (
                    <SelectItem value="none" disabled>No branches available</SelectItem>
                  ) : (
                    branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {branches.length === 0 && (
                <p className="text-sm text-yellow-600">
                  No branches loaded. Please refresh the page.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Course Duration</Label>
              <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Month</SelectItem>
                  <SelectItem value="3">3 Months</SelectItem>
                  <SelectItem value="6">6 Months</SelectItem>
                  <SelectItem value="12">12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedCourse && (
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-xl font-bold">
                    {formatCurrency((selectedCourse.pricing?.amount || 0) * parseInt(selectedDuration))}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You will be redirected to payment page after enrollment
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEnrollDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEnrollSubmit} 
              disabled={enrolling || !selectedBranch || branches.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {enrolling ? "Enrolling..." : "Proceed to Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Branch Change Dialog */}
      <Dialog open={showBranchChangeDialog} onOpenChange={setShowBranchChangeDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Branch Change</DialogTitle>
            <DialogDescription>
              Request to change branch for {changingEnrollment?.course_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="text-sm">
                <span className="font-medium">Current Branch: </span>
                <span>{changingEnrollment?.branch_name}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newBranch">Select New Branch</Label>
              <Select value={newBranchId} onValueChange={setNewBranchId}>
                <SelectTrigger className="text-gray-900 dark:text-gray-100">
                  <SelectValue placeholder="Choose a new branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches
                    .filter(b => b.id !== changingEnrollment?.branch_id)
                    .map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your request will be sent to the branch admin for approval. 
                You will be notified once the request is processed.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBranchChangeDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBranchChangeSubmit}
              disabled={requestingChange || !newBranchId}
            >
              {requestingChange ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StudentDashboardLayout>
  )
}
