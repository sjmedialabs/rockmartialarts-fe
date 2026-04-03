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
  XCircle,
  Loader2,
  ArrowRight
} from "lucide-react"
import { studentProfileAPI } from "@/lib/studentProfileAPI"
import { courseAPI } from "@/lib/courseAPI"
import { branchAPI } from "@/lib/branchAPI"
import { getBackendApiUrl } from "@/lib/config"

/** Load branch + duration accurate total from payment-info (backend applies batch/branch fees). */
async function enrichAvailableCoursePricing(
  courses: AvailableCourse[],
  branchIds: string[],
  token: string
): Promise<AvailableCourse[]> {
  return Promise.all(
    courses.map(async (c) => {
      const branchId = c.branch_id || branchIds[0]
      if (!branchId) return c
      try {
        const durRes = await fetch(
          getBackendApiUrl(`durations/public/by-course/${c.id}?active_only=true`),
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const durData = await durRes.json().catch(() => ({}))
        const durations: unknown[] = Array.isArray((durData as { durations?: unknown }).durations)
          ? ((durData as { durations: unknown[] }).durations)
          : []
        const first = durations[0] as { code?: string; id?: string } | undefined
        const durKey = first ? String(first.code || first.id) : "1-month"
        const qs = new URLSearchParams({
          branch_id: branchId,
          duration: durKey,
        })
        const piRes = await fetch(
          getBackendApiUrl(`courses/${c.id}/payment-info?${qs.toString()}`),
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (piRes.ok) {
          const pi = await piRes.json().catch(() => ({}))
          const p = pi?.pricing
          const total =
            typeof p?.total_amount === "number"
              ? p.total_amount
              : typeof p?.course_fee === "number"
                ? p.course_fee + (typeof p?.admission_fee === "number" ? p.admission_fee : 0)
                : null
          if (typeof total === "number" && total > 0 && !Number.isNaN(total)) {
            return { ...c, pricing: { amount: total, currency: "INR" } }
          }
        }
      } catch {
        /* keep fallback pricing */
      }
      return c
    })
  )
}

/** Stable id for Select when the same course exists at multiple branches. */
function courseRowKey(c: Pick<AvailableCourse, "id" | "branch_id">) {
  return `${c.id}::${c.branch_id ?? ""}`
}

function parseCourseRowKey(v: string): { id: string; branch_id: string } {
  const i = v.indexOf("::")
  if (i < 0) return { id: v, branch_id: "" }
  return { id: v.slice(0, i), branch_id: v.slice(i + 2) }
}

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
  /** True if the student already has an enrollment for this course (at any of their branches). */
  is_enrolled?: boolean
  /** Matching enrollment when enrolled (for renew / context). */
  enrollment?: EnrolledCourse | null
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
  const [durationOptions, setDurationOptions] = useState<
    { id: string; label: string; months: number; code: string }[]
  >([])
  const [selectedDurationKey, setSelectedDurationKey] = useState("")
  const [enrollAmount, setEnrollAmount] = useState<number | null>(null)
  const [enrollPricingLoading, setEnrollPricingLoading] = useState(false)
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
        // Progress should come from backend once available; keep stable (0) instead of random.
        progress: typeof e.progress === "number" ? Math.round(e.progress) : 0
      }))
      
      console.log("✅ Loaded enrolled courses:", enrolledData.length)
      setEnrolledCourses(enrolledData)

      // Get student's branch IDs
      const studentBranchIds = Array.from(new Set(enrolledData.map(e => e.branch_id)))
      console.log("📍 Student branches:", studentBranchIds)

      // Load available courses
      try {
        let availableCoursesList: any[] = []

        if (studentBranchIds.length > 0) {
          // Load courses for each of student's branches
          for (const branchId of studentBranchIds) {
            try {
              const branchCoursesResponse = await fetch(
                getBackendApiUrl(`branches/${branchId}/courses`),
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
                
                // Add branch info and normalize fields for each course
                const coursesWithBranch = branchCourses.map((c: any) => ({
                  ...c,
                  id: c.id,
                  title: c.title || c.name || c.course_name || 'Untitled Course',
                  description: c.description || '',
                  difficulty_level: c.difficulty_level || c.level || 'Beginner',
                  category_id: c.category_id || '',
                  branch_id: branchId,
                  branch_name: enrolledData.find(e => e.branch_id === branchId)?.branch_name,
                  pricing: {
                    amount: c.pricing?.amount || c.price || c.fee || 0,
                    currency: c.pricing?.currency || 'INR'
                  }
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
          const rawCourses = allCoursesResponse.courses || []
          availableCoursesList = rawCourses.map((c: any) => ({
            ...c,
            title: c.title || c.name || c.course_name || 'Untitled Course',
            description: c.description || '',
            difficulty_level: c.difficulty_level || c.level || 'Beginner',
            category_id: c.category_id || '',
            pricing: {
              amount: c.pricing?.amount || c.price || c.fee || 0,
              currency: c.pricing?.currency || 'INR'
            }
          }))
        }

        // Keep inactive filter; include enrolled courses so we can show "Already enrolled" + Renew
        const filteredCourses = availableCoursesList.filter(
          (c: any) => c.settings?.active !== false
        )

        // One row per (course, branch) so branch-specific fees and enrollments stay correct
        const uniqueCourses = Array.from(
          new Map(
            filteredCourses.map((c: any) => [`${c.id}::${c.branch_id || ""}`, c])
          ).values()
        )

        const withEnrollment: AvailableCourse[] = uniqueCourses.map((c: any) => {
          const enrollment =
            enrolledData.find(
              (e) => e.course_id === c.id && e.branch_id === c.branch_id
            ) ?? null
          return {
            ...c,
            is_enrolled: !!enrollment,
            enrollment: enrollment ?? null,
          }
        })

        console.log("✅ Branch courses (including enrolled):", withEnrollment.length)
        const priced = await enrichAvailableCoursePricing(withEnrollment, studentBranchIds, token)
        setAvailableCourses(priced)
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
    if (course.is_enrolled) {
      router.push("/student-dashboard/payments")
      return
    }
    console.log("📋 Opening enrollment dialog. Branches available:", branches.length, branches)
    setSelectedCourse(course)
    setSelectedBranch(course.branch_id || branches[0]?.id || "")
    setDurationOptions([])
    setSelectedDurationKey("")
    setEnrollAmount(null)
    setShowEnrollDialog(true)
  }

  const openBrowseNewEnrollment = () => {
    const next = availableCourses.find((c) => !c.is_enrolled)
    if (next) handleEnrollClick(next)
    else router.push("/student-dashboard/payments")
  }

  // Load duration catalog when enrollment dialog opens / course or branch changes
  useEffect(() => {
    if (!showEnrollDialog || !selectedCourse || !selectedBranch) {
      setDurationOptions([])
      setSelectedDurationKey("")
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(
          getBackendApiUrl(`durations/public/by-course/${selectedCourse.id}?active_only=true&include_pricing=true`)
        )
        const data = await res.json().catch(() => ({}))
        const durations: any[] = Array.isArray(data.durations) ? data.durations : []
        const opts = durations
          .map((d: any) => ({
            id: String(d.id),
            label: String(d.name || d.code || ""),
            months: typeof d.duration_months === "number" ? d.duration_months : parseInt(String(d.duration_months), 10) || 0,
            code: String(d.code || d.id),
          }))
          .filter((o: { id: string; label: string; months: number }) => o.id && o.label && o.months > 0)
        if (!cancelled) {
          setDurationOptions(opts)
          setSelectedDurationKey(opts[0]?.id || opts[0]?.code || "")
        }
      } catch {
        if (!cancelled) {
          setDurationOptions([])
          setSelectedDurationKey("")
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [showEnrollDialog, selectedCourse?.id, selectedBranch])

  // Total from payment-info (must run after durations exist; matches prepare-student-checkout)
  useEffect(() => {
    if (!showEnrollDialog || !selectedCourse || !selectedBranch || !selectedDurationKey) {
      setEnrollAmount(null)
      setEnrollPricingLoading(false)
      return
    }
    if (durationOptions.length === 0) {
      setEnrollAmount(null)
      return
    }
    const token = localStorage.getItem("token")
    if (!token) {
      setEnrollPricingLoading(false)
      return
    }
    let cancelled = false
    setEnrollPricingLoading(true)
    ;(async () => {
      try {
        const opt = durationOptions.find(
          (o) => o.id === selectedDurationKey || o.code === selectedDurationKey
        )
        const durParam = opt?.code || opt?.id || selectedDurationKey
        const qs = new URLSearchParams({
          branch_id: selectedBranch,
          duration: durParam,
        })
        const url = getBackendApiUrl(`courses/${selectedCourse.id}/payment-info?${qs.toString()}`)
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        if (!res.ok || cancelled) {
          if (!cancelled) setEnrollAmount(null)
          return
        }
        const data = await res.json().catch(() => ({}))
        const p = data?.pricing
        const total =
          typeof p?.total_amount === "number"
            ? p.total_amount
            : typeof p?.course_fee === "number"
              ? p.course_fee + (typeof p?.admission_fee === "number" ? p.admission_fee : 0)
              : null
        if (!cancelled && typeof total === "number" && total > 0 && !Number.isNaN(total)) {
          setEnrollAmount(total)
        } else if (!cancelled) setEnrollAmount(null)
      } catch {
        if (!cancelled) setEnrollAmount(null)
      } finally {
        if (!cancelled) setEnrollPricingLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [
    showEnrollDialog,
    selectedCourse?.id,
    selectedBranch,
    selectedDurationKey,
    durationOptions,
  ])

  const handleEnrollSubmit = async () => {
    if (!selectedCourse || !selectedBranch || !selectedDurationKey) {
      alert("Please select course, branch, and duration")
      return
    }
    if (enrollAmount == null || enrollAmount <= 0) {
      alert("Price could not be loaded for this selection. Please try again or contact support.")
      return
    }

    setEnrolling(true)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setEnrolling(false)
        return
      }

      // Get student profile for prefill data
      const profileResponse = await studentProfileAPI.getProfile(token)
      const profile = profileResponse.profile

      // Find selected branch details
      const selectedBranchData = branches.find(b => b.id === selectedBranch)

      const opt = durationOptions.find(
        (o) => o.id === selectedDurationKey || o.code === selectedDurationKey
      )
      const durationForApi = opt?.code || opt?.id || selectedDurationKey

      const prepRes = await fetch(getBackendApiUrl("payments/prepare-student-checkout"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_id: selectedCourse.id,
          branch_id: selectedBranch,
          duration: durationForApi,
        }),
      })
      const prepJson = await prepRes.json().catch(() => ({}))
      if (!prepRes.ok) {
        const msg =
          typeof prepJson?.detail === "string"
            ? prepJson.detail
            : prepJson?.detail?.[0]?.msg || prepJson?.message || "Could not start checkout"
        throw new Error(msg)
      }

      const prepAmount = typeof prepJson.amount === "number" ? prepJson.amount : enrollAmount
      const enrollmentData = {
        enrollment_id: prepJson.enrollment_id as string,
        course_id: selectedCourse.id,
        course_name: (prepJson.course_name as string) || selectedCourse.title,
        branch_id: selectedBranch,
        branch_name: (prepJson.branch_name as string) || selectedBranchData?.name || "Unknown Branch",
        amount: prepAmount,
        student_name: profile.full_name || `${profile.first_name} ${profile.last_name}`,
        student_email: profile.email,
        student_phone: profile.phone,
      }

      // Initiate Razorpay payment
      await initiatePayment({
        amount: prepAmount,
        currency: 'INR',
        enrollmentData,
        onSuccess: (result: any) => {
          console.log('Payment successful:', result)
          setShowEnrollDialog(false)
          setEnrolling(false)
          const pid = result?.payment_id ?? result?.receipt?.payment_id ?? ""
          router.push(
            `/student-dashboard/payment-success?payment_id=${encodeURIComponent(String(pid))}&amount=${encodeURIComponent(String(prepAmount))}&course_name=${encodeURIComponent(enrollmentData.course_name)}&branch_name=${encodeURIComponent(enrollmentData.branch_name)}`
          )
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

      // Submit branch transfer request (existing backend endpoint: /api/requests/transfer)
      const response = await fetch(
        getBackendApiUrl('requests/transfer'),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            enrollment_id: changingEnrollment.enrollment_id,
            current_branch_id: changingEnrollment.branch_id,
            new_branch_id: newBranchId,
            reason: "Student requested branch change"
          })
        }
      )

      if (response.ok) {
        const data = await response.json().catch(() => ({}))
        alert(
          data.message ||
            "Branch change request submitted successfully! Your request will be sent to the super admin for approval. Once approved, your branch will be updated."
        )
        setShowBranchChangeDialog(false)
        setChangingEnrollment(null)
        setNewBranchId("")
        handleRefresh()
      } else {
        const errorData = await response.json().catch(() => ({}))
        const message = errorData.detail || errorData.error || errorData.message || "Request failed"
        throw new Error(Array.isArray(message) ? message[0] : message)
      }
    } catch (error: any) {
      alert(error?.message || "Request failed. Please try again.")
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
            {availableCourses.some((c) => !c.is_enrolled) && (
              <Button
                size="sm"
                onClick={openBrowseNewEnrollment}
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
                {availableCourses.some((c) => !c.is_enrolled) && (
                  <Button 
                    onClick={openBrowseNewEnrollment}
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
                  ? "Courses at your branches. Already enrolled courses show Renew; new courses show Enroll."
                  : "Browse and enroll in available courses."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableCourses.map((course) => (
                  <Card
                    key={course.branch_id ? `${course.id}-${course.branch_id}` : course.id}
                    className={`border-2 ${course.is_enrolled ? "border-emerald-200/80 bg-emerald-50/40" : ""}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        {course.is_enrolled && (
                          <Badge className="shrink-0 bg-emerald-100 text-emerald-900 border-emerald-200">
                            Already enrolled
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <Badge variant="secondary">{course.difficulty_level}</Badge>
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
                        {course.is_enrolled && course.enrollment?.end_date && (
                          <p className="text-xs text-muted-foreground">
                            Current period ends {formatDate(course.enrollment.end_date)}
                          </p>
                        )}
                        {course.is_enrolled ? (
                          <Button
                            className="w-full bg-emerald-700 hover:bg-emerald-800"
                            onClick={() => router.push("/student-dashboard/payments")}
                          >
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Renew
                          </Button>
                        ) : (
                          <Button className="w-full" onClick={() => handleEnrollClick(course)}>
                            Enroll Now
                          </Button>
                        )}
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
      <Dialog
        open={showEnrollDialog}
        onOpenChange={(open) => {
          setShowEnrollDialog(open)
          if (!open) {
            setDurationOptions([])
            setSelectedDurationKey("")
            setEnrollAmount(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedCourse ? `Enroll in ${selectedCourse.title}` : "Enroll in a course"}
            </DialogTitle>
            <DialogDescription>
              Choose course, branch, and duration. Pricing comes from your branch and admin fee settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="course">Select course</Label>
              <Select
                value={selectedCourse ? courseRowKey(selectedCourse) : ""}
                onValueChange={(v) => {
                  const { id, branch_id } = parseCourseRowKey(v)
                  const c = availableCourses.find(
                    (x) => x.id === id && (x.branch_id || "") === branch_id
                  )
                  if (c) {
                    setSelectedCourse(c)
                    setSelectedBranch(c.branch_id || branches[0]?.id || "")
                  }
                }}
              >
                <SelectTrigger className="text-gray-900 dark:text-gray-100">
                  <SelectValue placeholder="Choose a course" />
                </SelectTrigger>
                <SelectContent>
                  {availableCourses
                    .filter((c) => !c.is_enrolled)
                    .map((course) => (
                      <SelectItem
                        key={courseRowKey(course)}
                        value={courseRowKey(course)}
                      >
                        {course.branch_name
                          ? `${course.title} (${course.branch_name})`
                          : course.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

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
              <Label htmlFor="duration">Course duration</Label>
              {durationOptions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No durations configured for this course. Please contact support.
                </p>
              ) : (
                <Select value={selectedDurationKey} onValueChange={setSelectedDurationKey}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedCourse && (
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Total amount</span>
                  <span className="text-xl font-bold flex items-center gap-2">
                    {enrollPricingLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                    {!enrollPricingLoading &&
                      (enrollAmount != null && enrollAmount > 0
                        ? formatCurrency(enrollAmount)
                        : "—")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You will complete payment securely via Razorpay after continuing.
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
              disabled={
                enrolling ||
                !selectedCourse ||
                !selectedBranch ||
                branches.length === 0 ||
                enrollPricingLoading ||
                enrollAmount == null ||
                enrollAmount <= 0 ||
                !selectedDurationKey ||
                durationOptions.length === 0
              }
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
                Your request will be sent to the super admin for approval. Once approved, your enrollment branch
                will be updated.
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
