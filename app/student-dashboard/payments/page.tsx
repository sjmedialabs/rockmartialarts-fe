"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import StudentDashboardLayout from "@/components/student-dashboard-layout"
import { CardSkeleton, TableSkeleton } from "@/components/ui/loading-skeleton"
import { ErrorBoundary } from "@/components/error-boundary"
import studentPaymentAPI, { PaymentRecord, PaymentStats, EnrollmentWithPayments } from "@/lib/studentPaymentAPI"
import {
  CreditCard,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  Receipt,
  TrendingUp,
  Download,
  RefreshCw
} from "lucide-react"

export default function StudentPaymentsPage() {
  const router = useRouter()
  const [studentData, setStudentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([])
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null)
  const [enrollments, setEnrollments] = useState<EnrollmentWithPayments[]>([])
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")
    
    if (!token) {
      router.push("/login")
      return
    }

    // Try to get user data from localStorage
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
        
        setStudentData({
          name: userData.full_name || `${userData.first_name} ${userData.last_name}` || userData.name || "Student",
          email: userData.email || "student@example.com",
        })

        // Load payment data
        loadPaymentData(token)
      } catch (error) {
        console.error("Error parsing user data:", error)
        setStudentData({
          name: "Student",
          email: "student@example.com",
        })
        setError("Error loading user data")
      }
    } else {
      setStudentData({
        name: "Student",
        email: "student@example.com",
      })
      setError("No user data found")
    }
  }, [router])

  const loadPaymentData = async (token: string, showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      console.log("🔄 Loading payment data with token:", token?.substring(0, 20) + "...")

      // Load payment history first (this is working according to our tests)
      console.log("📊 Fetching payment history...")
      const historyData = await studentPaymentAPI.getPaymentHistory(token)
      console.log("✅ Payment history loaded:", historyData?.length, "records")
      setPaymentHistory(historyData)

      // Load payment stats
      console.log("📈 Fetching payment stats...")
      const statsData = await studentPaymentAPI.getPaymentStats(token)
      console.log("✅ Payment stats loaded:", statsData)
      setPaymentStats(statsData)

      // Load enrollments (this might fail, so handle separately)
      console.log("🎓 Fetching enrollments...")
      try {
        const enrollmentsData = await studentPaymentAPI.getEnrollmentsWithPayments(token)
        console.log("✅ Enrollments loaded:", enrollmentsData?.length, "records")
        setEnrollments(enrollmentsData)
      } catch (enrollmentError) {
        console.warn("⚠️ Enrollment loading failed (non-critical):", enrollmentError)
        setEnrollments([]) // Set empty array so UI doesn't break
      }

      console.log("🎉 Payment data loading completed successfully")
    } catch (error) {
      console.error("❌ Error loading payment data:", error)
      setError(`Failed to load payment data: ${error.message}. Please try again.`)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    const token = localStorage.getItem("token")
    if (token) {
      loadPaymentData(token, true)
    }
  }

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    localStorage.removeItem("access_token")
    localStorage.removeItem("token_type")
    localStorage.removeItem("expires_in")
    localStorage.removeItem("token_expiration")
    localStorage.removeItem("auth_data")

    // Redirect to login page
    router.push("/login")
  }

  if (loading) {
    return (
      <StudentDashboardLayout
        pageTitle="Payments"
        pageDescription="Manage your payments and billing information"
        showBreadcrumb={true}
        breadcrumbItems={[
          { label: "Dashboard", href: "/student-dashboard" },
          { label: "Payments" }
        ]}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <TableSkeleton />
        </div>
      </StudentDashboardLayout>
    )
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusInfo = studentPaymentAPI.formatPaymentStatus(status)
    return (
      <Badge className={`${statusInfo.bgColor} ${statusInfo.color} border-0`}>
        {statusInfo.label}
      </Badge>
    )
  }

  return (
    <ErrorBoundary>
      <StudentDashboardLayout
        studentName={studentData?.name || "Student"}
        onLogout={handleLogout}
        pageTitle="Payments"
        pageDescription="Manage your payments and billing information"
        showBreadcrumb={true}
        breadcrumbItems={[
          { label: "Dashboard", href: "/student-dashboard" },
          { label: "Payments" }
        ]}
        headerActions={
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        }
      >
        {/* Error State */}
        {error && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button
                onClick={handleRefresh}
                variant="link"
                className="ml-2 p-0 h-auto"
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Debug Info:</strong> Payment History: {paymentHistory?.length || 0} records,
              Stats: {paymentStats ? 'loaded' : 'not loaded'},
              Enrollments: {enrollments?.length || 0} records
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-700">
                    {paymentStats ? formatCurrency(paymentStats.total_paid) : '₹0'}
                  </p>
                  <p className="text-sm text-green-600 mt-1">Total Paid</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-yellow-700">
                    {paymentStats ? formatCurrency(paymentStats.total_pending) : '₹0'}
                  </p>
                  <p className="text-sm text-yellow-600 mt-1">Pending</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-700">
                    {paymentStats ? formatCurrency(paymentStats.total_overdue) : '₹0'}
                  </p>
                  <p className="text-sm text-red-600 mt-1">Overdue</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-blue-700">
                    {paymentStats?.next_due_date ? formatDate(paymentStats.next_due_date) : 'No due date'}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">Next Due Date</p>
                  {paymentStats?.next_due_amount && (
                    <p className="text-xs text-blue-500 mt-1">
                      {formatCurrency(paymentStats.next_due_amount)}
                    </p>
                  )}
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Outstanding Payments */}
        {paymentHistory.filter(payment => payment.payment_status === "overdue" || payment.payment_status === "pending").length > 0 && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-red-700 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Outstanding Payments
                  </CardTitle>
                  <CardDescription>Payments that require immediate attention</CardDescription>
                </div>
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  <CreditCard className="h-4 w-4 mr-2" />
                  PAY NOW
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory
                  .filter(payment => payment.payment_status === "overdue" || payment.payment_status === "pending")
                  .map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center p-4 bg-white rounded-lg border border-red-200 shadow-sm">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {studentPaymentAPI.formatPaymentType(payment.payment_type)}
                          {payment.course_details && ` - ${payment.course_details.course_name}`}
                        </p>
                        <p className="text-sm text-gray-600">Due: {formatDate(payment.due_date)}</p>
                        {payment.notes && (
                          <p className="text-xs text-gray-500 mt-1">{payment.notes}</p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-lg text-red-600">{formatCurrency(payment.amount)}</p>
                        {getStatusBadge(payment.payment_status)}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment History */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center">
                  <Receipt className="h-5 w-5 mr-2" />
                  Payment History
                </CardTitle>
                <CardDescription>Your complete payment transaction history</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {paymentHistory.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No payment history found</p>
                <p className="text-sm text-gray-400 mt-1">Your payment transactions will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Transaction ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Course</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Method</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((payment) => (
                      <tr key={payment.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-gray-900 font-medium">
                          {payment.transaction_id || payment.id.slice(0, 8)}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {payment.payment_date ? formatDate(payment.payment_date) : formatDate(payment.created_at)}
                        </td>
                        <td className="py-3 px-4 text-gray-900">
                          {studentPaymentAPI.formatPaymentType(payment.payment_type)}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {payment.course_details?.course_name || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-gray-900 font-semibold">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="py-3 px-4 text-gray-600 capitalize">
                          {payment.payment_method.replace('_', ' ')}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(payment.payment_status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Enrollments Summary */}
        {enrollments.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Course Enrollments Summary
                </CardTitle>
                <CardDescription>Overview of your enrolled courses and payment status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{enrollment.course_name}</h4>
                          <p className="text-sm text-gray-600">{enrollment.branch_name}</p>
                          <p className="text-xs text-gray-500">
                            Enrolled: {formatDate(enrollment.enrollment_date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            {formatCurrency(enrollment.fee_amount + enrollment.admission_fee)}
                          </p>
                          <p className="text-sm text-gray-600">Total Fee</p>
                          {enrollment.outstanding_balance > 0 && (
                            <p className="text-sm text-red-600 font-medium">
                              Outstanding: {formatCurrency(enrollment.outstanding_balance)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Payment Summary (without duplicating individual payments) */}
                      {enrollment.payments.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">
                              Payment Status: {enrollment.payments.length} payment{enrollment.payments.length !== 1 ? 's' : ''} made
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                Total Paid: {formatCurrency(
                                  enrollment.payments
                                    .filter(p => p.payment_status === 'paid')
                                    .reduce((sum, p) => sum + p.amount, 0)
                                )}
                              </span>
                              {enrollment.outstanding_balance === 0 ? (
                                <Badge className="bg-green-100 text-green-800">Fully Paid</Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            See detailed payment history in the table above
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Available Payment Methods */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Available Payment Methods
              </CardTitle>
              <CardDescription>Choose from various payment options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studentPaymentAPI.getAvailablePaymentMethods().map((method) => (
                  <div key={method.value} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-2xl mr-3">{method.icon}</span>
                    <span className="font-medium">{method.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </StudentDashboardLayout>
    </ErrorBoundary>
  )
}
