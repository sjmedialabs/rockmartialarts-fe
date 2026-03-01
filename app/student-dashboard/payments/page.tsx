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
  ArrowRight
} from "lucide-react"
import { studentPaymentAPI, type PaymentRecord } from "@/lib/studentPaymentAPI"
import { studentProfileAPI, type StudentEnrollment } from "@/lib/studentProfileAPI"

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

  const handlePayment = (enrollment: StudentEnrollment, isRenewal: boolean = false) => {
    // In a real implementation, integrate with payment gateway
    const message = isRenewal 
      ? `Renew subscription for ${enrollment.course_name}\n\nThis will extend your access for the next billing period starting from ${formatDate(enrollment.end_date)}.`
      : `Make payment for ${enrollment.course_name}\n\nCurrent status: ${enrollment.payment_status}`
    
    alert(`Payment Gateway Integration\n\n${message}\n\nPayment gateway (Razorpay/Stripe) will be integrated here.`)
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
                              onClick={() => handlePayment(enrollment, false)}
                            >
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Renew Now
                            </Button>
                          ) : enrollment.payment_status !== 'paid' ? (
                            <Button 
                              className="bg-yellow-600 hover:bg-yellow-700 w-full sm:w-auto"
                              onClick={() => handlePayment(enrollment, false)}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Pay Now
                            </Button>
                          ) : (
                            <>
                              <Button 
                                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                                onClick={() => handlePayment(enrollment, true)}
                              >
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Renew for Next Period
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
