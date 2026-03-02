"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import StudentDashboardLayout from "@/components/student-dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  CreditCard,
  AlertCircle,
  RefreshCw,
  Download,
  CheckCircle,
  Clock,
  BookOpen,
  TrendingUp,
  IndianRupee,
  ArrowRight,
  Loader2
} from "lucide-react"
import { studentPaymentAPI, type PaymentRecord } from "@/lib/studentPaymentAPI"
import { studentProfileAPI, type StudentEnrollment } from "@/lib/studentProfileAPI"
import { openRazorpayCheckout, type RazorpayPaymentResponse } from "@/lib/razorpay"
import { getBackendApiUrl } from "@/lib/config"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type TenureOption = {
  id: string
  label: string
  months: number
}

export default function StudentPaymentsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [studentData, setStudentData] = useState<any>(null)
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([])
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([])
  const [totalPaid, setTotalPaid] = useState(0)
  const [totalPending, setTotalPending] = useState(0)
  const [paymentProcessingId, setPaymentProcessingId] = useState<string | null>(null)
  const [tenureModal, setTenureModal] = useState<{
    enrollment: StudentEnrollment
    isRenewal: boolean
  } | null>(null)
  const [tenureOptions, setTenureOptions] = useState<TenureOption[]>([])
  const [tenurePrices, setTenurePrices] = useState<Record<string, number | null>>({})
  const [tenurePricesLoading, setTenurePricesLoading] = useState(false)

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
        name: userData.full_name || userData.name || "Student",
        email: userData.email || ""
      })
    }

    loadPaymentData(token)
  }, [router])

  // When tenure modal opens, fetch price for each duration
  useEffect(() => {
    if (!tenureModal) {
      setTenureOptions([])
      setTenurePrices({})
      setTenurePricesLoading(false)
      return
    }
    setTenurePricesLoading(true)
    const token = localStorage.getItem("token")
    if (!token) {
      setTenurePricesLoading(false)
      return
    }
    const { course_id, branch_id } = tenureModal.enrollment
    ;(async () => {
      try {
        // 1) Load durations for this course from master data (dynamic, admin-configured)
        const durationsRes = await fetch(
          getBackendApiUrl(`durations/public/by-course/${course_id}?active_only=true&include_pricing=true`)
        )
        const durationsData = await durationsRes.json().catch(() => ({}))
        const durations: any[] = Array.isArray(durationsData.durations) ? durationsData.durations : []

        // Map to tenure options (id + label + months)
        const options: TenureOption[] = durations.map((d) => ({
          id: String(d.id),
          label: String(d.name || d.code || ""),
          months: typeof d.duration_months === "number" ? d.duration_months : parseInt(String(d.duration_months), 10) || 0,
        })).filter((opt) => opt.id && opt.label && opt.months > 0)

        setTenureOptions(options)

        if (options.length === 0) {
          setTenurePrices({})
          return
        }

        // 2) Fetch course data directly to read admin-configured fee_per_duration
        const courseRes = await fetch(
          getBackendApiUrl(`courses/${course_id}`),
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const courseData = await courseRes.json().catch(() => ({}))
        const feePerDuration = courseData.fee_per_duration || {}
        const branchPricing = courseData.branch_pricing || {}

        // Use branch-specific pricing if available, otherwise default fees
        const branchFees = branchPricing[branch_id]
        const feeLookup = (typeof branchFees === "object" && branchFees !== null) ? branchFees : feePerDuration

        const next: Record<string, number | null> = {}
        options.forEach((opt) => {
          const raw = feeLookup[opt.id]
          const n = typeof raw === "number" ? raw : parseFloat(String(raw))
          next[opt.id] = !isNaN(n) && n > 0 ? n : null
        })
        setTenurePrices(next)
      } finally {
        setTenurePricesLoading(false)
      }
    })()
  }, [tenureModal])

  const loadPaymentData = async (token: string) => {
    try {
      setLoading(true)
      setError(null)

      // Load payment history
      const history = await studentPaymentAPI.getPaymentHistory(token)
      setPaymentHistory(history)

      // Calculate totals from payment history
      const paid = history
        .filter(p => p.payment_status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0)
      const pending = history
        .filter(p => p.payment_status === 'pending' || p.payment_status === 'overdue')
        .reduce((sum, p) => sum + p.amount, 0)
      
      setTotalPaid(paid)
      setTotalPending(pending)

      // Load enrollments with course details
      const profileResponse = await studentProfileAPI.getProfile(token)
      const enrollmentsData = profileResponse.profile.enrollments || []
      setEnrollments(enrollmentsData)

    } catch (error: any) {
      console.error("Error loading payment data:", error)
      setError(`Failed to load payment data: ${error.message}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    const token = localStorage.getItem("token")
    if (token) {
      await loadPaymentData(token)
    }
    setRefreshing(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("auth_data")
    router.push("/login")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getStatusBadge = (status: string) => {
    const variants: any = {
      paid: { variant: "default", className: "bg-green-100 text-green-800 border-green-200" },
      pending: { variant: "secondary", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      overdue: { variant: "destructive", className: "bg-red-100 text-red-800 border-red-200" },
      cancelled: { variant: "outline", className: "bg-gray-100 text-gray-800 border-gray-200" }
    }
    const config = variants[status] || variants.pending
    return (
      <Badge className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getPaymentMethodIcon = (method: string) => {
    return <CreditCard className="h-4 w-4" />
  }

  /** Fetches course fee for a duration from API only (super admin / branch admin pricing). Returns null if API fails. */
  const getCourseAmount = async (
    courseId: string,
    branchId: string,
    token: string,
    durationCode: string = "1-month"
  ): Promise<number | null> => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
    try {
      const url = getBackendApiUrl(
        `courses/${courseId}/payment-info?branch_id=${branchId}&duration=${encodeURIComponent(durationCode)}`
      )
      const res = await fetch(url, { headers })
      if (res.ok) {
        const data = await res.json()
        const total = data?.pricing?.total_amount ?? data?.pricing?.course_fee
        if (typeof total === "number" && total > 0) return total
      }
    } catch (_) {
      /* API error */
    }
    return null
  }

  const openTenureModal = (enrollment: StudentEnrollment, isRenewal: boolean) => {
    setTenureModal({ enrollment, isRenewal })
  }

  const handlePayment = async (
    enrollment: StudentEnrollment,
    isRenewal: boolean,
    tenure: { months: number; id: string },
    amountFromApi: number | null
  ) => {
    setTenureModal(null)
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")
    if (!token || !user) {
      router.push("/login")
      return
    }
    if (amountFromApi == null || amountFromApi <= 0) {
      setError("Price not available for this duration. Please contact support.")
      return
    }
    setPaymentProcessingId(enrollment.id)
    setError(null)
    try {
      const amount = amountFromApi
      const userData = JSON.parse(user)
      const enrollmentData = {
        enrollment_id: enrollment.id,
        course_id: enrollment.course_id,
        branch_id: enrollment.branch_id,
        course_name: enrollment.course_name,
        branch_name: enrollment.branch_name,
        duration_months: tenure.months,
        amount,
        student_name: userData.full_name || userData.name || "",
        student_email: userData.email || "",
        student_phone: userData.phone || "",
      }
      await openRazorpayCheckout({
        amount,
        currency: "INR",
        name: "Rock Martial Arts",
        description: isRenewal
          ? `Renew: ${enrollment.course_name} (${tenure.months} month${tenure.months > 1 ? "s" : ""})`
          : `Payment: ${enrollment.course_name} (${tenure.months} month${tenure.months > 1 ? "s" : ""})`,
        customerName: enrollmentData.student_name,
        customerEmail: enrollmentData.student_email,
        customerContact: enrollmentData.student_phone,
        onSuccess: async (response: RazorpayPaymentResponse) => {
          try {
            setError(null)
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                enrollmentData,
              }),
            })
            const data = await verifyRes.json().catch(() => ({}))
            if (!verifyRes.ok) {
              throw new Error(data?.error ?? data?.detail ?? "Verification failed")
            }
            await loadPaymentData(token)
            window.location.reload()
          } catch (e) {
            setError(e instanceof Error ? e.message : "Payment verification failed")
          } finally {
            setPaymentProcessingId(null)
          }
        },
        onDismiss: () => setPaymentProcessingId(null),
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Payment could not be started"
      if (msg.includes("Razorpay Key ID not configured")) {
        setError(
          "Razorpay is not configured. Add NEXT_PUBLIC_RAZORPAY_KEY_ID to .env.local and restart the dev server (npm run dev)."
        )
      } else {
        setError(msg)
      }
      setPaymentProcessingId(null)
    }
  }

  const handleExport = () => {
    // Simple CSV export
    const headers = ["Transaction ID", "Date", "Type", "Course", "Amount", "Method", "Status"]
    const rows = paymentHistory.map(p => [
      p.transaction_id || p.id,
      formatDate(p.payment_date || p.created_at),
      studentPaymentAPI.formatPaymentType(p.payment_type),
      p.course_details?.course_name || "N/A",
      formatCurrency(p.amount),
      p.payment_method.replace(/_/g, ' '),
      p.payment_status
    ])
    
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `payment_history_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <StudentDashboardLayout
        studentName={studentData?.name}
        onLogout={handleLogout}
        isLoading={true}
      >
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </StudentDashboardLayout>
    )
  }

  return (
    <StudentDashboardLayout
      studentName={studentData?.name}
      onLogout={handleLogout}
      isLoading={loading}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <CreditCard className="h-8 w-8" />
              Payment History
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your subscriptions and view transaction history
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={paymentHistory.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Payment Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalPaid)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All time payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(totalPending)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Due payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {enrollments.filter(e => e.is_active).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Enrolled courses
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {paymentHistory.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total records
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Course Subscriptions */}
        {enrollments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Subscriptions
              </CardTitle>
              <CardDescription>
                Manage your course enrollments and renewal dates. You can renew anytime before or after expiration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enrollments.map((enrollment) => {
                  const daysUntil = getDaysUntilDue(enrollment.end_date)
                  const isExpiringSoon = daysUntil <= 30 && daysUntil > 0
                  const isExpired = daysUntil < 0
                  const isActive = enrollment.is_active && enrollment.payment_status === 'paid' && !isExpired

                  return (
                    <div
                      key={enrollment.id}
                      className={`p-4 rounded-lg border ${
                        isExpired ? 'border-red-200 bg-red-50' : 
                        isExpiringSoon ? 'border-yellow-200 bg-yellow-50' : 
                        isActive ? 'border-green-200 bg-green-50' :
                        'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{enrollment.course_name}</h3>
                            {enrollment.is_active ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                Active
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                                Inactive
                              </Badge>
                            )}
                            {isActive && (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Paid
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>Started: {formatDate(enrollment.start_date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span className={isExpired ? 'text-red-600 font-medium' : isExpiringSoon ? 'text-yellow-600 font-medium' : ''}>
                                {isExpired ? 'Expired' : 'Expires'}: {formatDate(enrollment.end_date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <IndianRupee className="h-4 w-4" />
                              <span>Payment: {getStatusBadge(enrollment.payment_status)}</span>
                            </div>
                          </div>

                          {/* Status Messages */}
                          {isExpired && (
                            <div className="mt-3 p-2 rounded text-sm bg-red-100 text-red-800">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                <span>Subscription expired {Math.abs(daysUntil)} days ago. Renew now to regain access.</span>
                              </div>
                            </div>
                          )}
                          
                          {isExpiringSoon && (
                            <div className="mt-3 p-2 rounded text-sm bg-yellow-100 text-yellow-800">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>Subscription expires in {daysUntil} days. Renew early to avoid interruption.</span>
                              </div>
                            </div>
                          )}

                          {isActive && (
                            <div className="mt-3 p-2 rounded text-sm bg-green-100 text-green-800">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                <span>Your subscription is active. You can renew anytime to extend for upcoming months.</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                          {isExpired ? (
                            <Button 
                              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                              onClick={() => openTenureModal(enrollment, false)}
                              disabled={paymentProcessingId === enrollment.id}
                            >
                              {paymentProcessingId === enrollment.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <AlertCircle className="h-4 w-4 mr-2" />
                              )}
                              {paymentProcessingId === enrollment.id ? "Processing…" : "Renew Now"}
                            </Button>
                          ) : enrollment.payment_status !== 'paid' ? (
                            <Button 
                              className="bg-yellow-600 hover:bg-yellow-700 w-full sm:w-auto"
                              onClick={() => openTenureModal(enrollment, false)}
                              disabled={paymentProcessingId === enrollment.id}
                            >
                              {paymentProcessingId === enrollment.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <CreditCard className="h-4 w-4 mr-2" />
                              )}
                              {paymentProcessingId === enrollment.id ? "Processing…" : "Pay Now"}
                            </Button>
                          ) : (
                            <>
                              <Button 
                                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                                onClick={() => openTenureModal(enrollment, true)}
                                disabled={paymentProcessingId === enrollment.id}
                              >
                                {paymentProcessingId === enrollment.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <ArrowRight className="h-4 w-4 mr-2" />
                                )}
                                {paymentProcessingId === enrollment.id ? "Processing…" : "Renew for Next Period"}
                              </Button>
                              {isExpiringSoon && (
                                <p className="text-xs text-center text-muted-foreground">
                                  Renew before {formatDate(enrollment.end_date)}
                                </p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tenure selection modal */}
        <Dialog open={!!tenureModal} onOpenChange={(open) => !open && setTenureModal(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select tenure</DialogTitle>
              <DialogDescription>
                Choose a tenure. Only tenures configured by admin for this course are shown.
              </DialogDescription>
            </DialogHeader>
            {tenurePricesLoading ? (
              <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading prices…</span>
              </div>
            ) : (
              <div className="space-y-2 py-2">
                {(() => {
                  const available = tenureOptions.filter(
                    (option) => typeof tenurePrices[option.id] === "number" && tenurePrices[option.id]! > 0
                  )
                  if (available.length === 0) {
                    return (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No tenure configured for this course. Please contact support.
                      </p>
                    )
                  }
                  return (
                    <div className="grid grid-cols-2 gap-3">
                      {available.map((option) => {
                        const price = tenurePrices[option.id]!
                        return (
                          <Button
                            key={option.id}
                            variant="outline"
                            className="h-auto flex flex-col items-center justify-center py-4 gap-1"
                            onClick={() =>
                              tenureModal &&
                              handlePayment(
                                tenureModal.enrollment,
                                tenureModal.isRenewal,
                                { months: option.months, id: option.id },
                                price
                              )
                            }
                          >
                            <span className="font-semibold">{option.label}</span>
                            <span className="text-sm font-medium text-green-700 flex items-center gap-1">
                              <IndianRupee className="h-3.5 w-3.5" />
                              {new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(price)}
                            </span>
                          </Button>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>
            )}
            <DialogFooter>
              <Button variant="ghost" onClick={() => setTenureModal(null)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Your complete payment transaction history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentHistory.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No payment history found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Transaction ID</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Course</th>
                      <th className="pb-3 font-medium text-right">Amount</th>
                      <th className="pb-3 font-medium">Method</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((payment) => (
                      <tr key={payment.id} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="py-4 text-sm font-mono">
                          {payment.transaction_id || payment.id.substring(0, 16).toUpperCase()}
                        </td>
                        <td className="py-4 text-sm">
                          {formatDate(payment.payment_date || payment.created_at)}
                        </td>
                        <td className="py-4 text-sm">
                          {studentPaymentAPI.formatPaymentType(payment.payment_type)}
                        </td>
                        <td className="py-4 text-sm">
                          {payment.course_details?.course_name || 'N/A'}
                        </td>
                        <td className="py-4 text-sm text-right font-semibold">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="py-4 text-sm">
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(payment.payment_method)}
                            <span className="capitalize">
                              {payment.payment_method.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          {getStatusBadge(payment.payment_status)}
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
    </StudentDashboardLayout>
  )
}
