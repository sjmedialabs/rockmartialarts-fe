"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Users, BookOpen, Loader2, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Header from "@/components/layout/Header"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useDashboardBasePath, useDashboardRole } from "@/lib/useDashboardBasePath"
import { dashboardAPI, DashboardStats, Coach } from "@/lib/api"
import { paymentAPI, PaymentStats, Payment } from "@/lib/paymentAPI"
import { TokenManager } from "@/lib/tokenManager"


export default function SuperAdminDashboard() {
  const router = useRouter()
  const basePath = useDashboardBasePath()
  // State management
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [coachesLoading, setCoachesLoading] = useState(true)
  const [coachesError, setCoachesError] = useState<string | null>(null)

  // Payment data state
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null)
  const [recentPayments, setRecentPayments] = useState<Payment[]>([])
  const [paymentsLoading, setPaymentsLoading] = useState(true)
  const [paymentsError, setPaymentsError] = useState<string | null>(null)

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = TokenManager.getToken()
        if (!token) {
          setError("Authentication required. Please login again.")
          return
        }

        const response = await dashboardAPI.getDashboardStats(token)
        setDashboardStats(response.dashboard_stats)
      } catch (err: any) {
        console.error("Error fetching dashboard stats:", err)
        setError(err.message || "Failed to fetch dashboard statistics")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  // Fetch coaches list
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        setCoachesLoading(true)
        setCoachesError(null)

        const token = TokenManager.getToken()
        if (!token) {
          setCoachesError("Authentication required. Please login again.")
          return
        }

        const response = await dashboardAPI.getCoaches(token, {
          limit: 5,
          active_only: true
        })
        setCoaches(response.coaches || [])
      } catch (err: any) {
        console.error("Error fetching coaches:", err)
        setCoachesError(err.message || "Failed to fetch coaches")
      } finally {
        setCoachesLoading(false)
      }
    }

    fetchCoaches()
    fetchPaymentData()
  }, [])

  // Fetch payment data
  const fetchPaymentData = async () => {
    try {
      setPaymentsLoading(true)
      setPaymentsError(null)

      const token = TokenManager.getToken()
      if (!token) {
        setPaymentsError("Authentication required. Please login again.")
        return
      }

      // Fetch payment stats and recent payments in parallel
      const [statsResponse, paymentsResponse] = await Promise.all([
        paymentAPI.getPaymentStats(token),
        paymentAPI.getRecentPayments(5, token)
      ])

      setPaymentStats(statsResponse)
      setRecentPayments(paymentsResponse)
    } catch (err: any) {
      console.error("Error fetching payment data:", err)
      setPaymentsError(err.message || "Failed to fetch payment data")
    } finally {
      setPaymentsLoading(false)
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  return (
    <>
      <Header title="Dashboard" role={useDashboardRole()} />

        {/* Revenue Chart and Coaches List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="flex flex-col lg:col-span-2">

             {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 xl:gap-6 gap-2 mb-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            // Error state
            <Card className="md:col-span-4">
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Data loaded successfully
            <>
              <Card className="h-48 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all">
                <CardContent className="px-4">
                  <div className="">
                    <div className="flex justify-between flex-col gap-10">
                      <div className="flex flex-col xl:flex-row justify-between mt-4">
                      <p className="text-xs font-base text-[#9593A8]">Total Revenue</p>
                       <Badge variant="secondary" className="bg-gray-100">
                      Monthly
                    </Badge>
                    </div>
                    <div className="">
                      <p className="text-2xl font-bold text-[#403C6B]">
                        {paymentStats ? paymentAPI.formatCurrency(paymentStats.this_month_collection || 0) : '₹0'}
                      </p>
                      <p className="text-xs text-[#9593A8]">Earning this month</p>
                      </div>
                    </div>
                   
                  </div>
                </CardContent>
              </Card>

               <Card className="h-48 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all">
                <CardContent className="px-4">
                  <div className="">
                    <div className="flex justify-between flex-col gap-10">
                      <div className="flex flex-col xl:flex-row justify-between mt-4">
                      <p className="text-xs font-base text-[#9593A8]">Active Students</p>
                       <Badge variant="secondary" className="bg-gray-100">
                      Monthly
                    </Badge>
                    </div>
                    <div className="">
                      <p className="text-2xl font-bold text-[#403C6B]">
                         {dashboardStats ? dashboardStats.active_students : 0}
                      </p>
                      <p className="text-xs text-[#9593A8]">Active users this month</p>
                      </div>
                    </div>
                   
                  </div>
                </CardContent>
              </Card>

              <Card className="h-48 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all">
                <CardContent className="px-4">
                  <div className="">
                    <div className="flex justify-between flex-col gap-10">
                      <div className="flex flex-col xl:flex-row justify-between mt-4">
                      <p className="text-xs font-base text-[#9593A8]">Active Courses</p>
                       <Badge variant="secondary" className="bg-gray-100">
                      Monthly
                    </Badge>
                    </div>
                    <div className="">
                      <p className="text-2xl font-bold text-[#403C6B]">
                        {dashboardStats ? dashboardStats.active_courses : 0}
                      </p>
                      <p className="text-xs text-[#9593A8]">Active courses in all branches</p>
                      </div>
                    </div>
                   
                  </div>
                </CardContent>
              </Card>

                <Card className="h-48 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all">
                <CardContent className="px-4">
                  <div className="">
                    <div className="flex justify-between flex-col gap-10">
                      <div className="flex flex-col xl:flex-row justify-between mt-4">
                      <p className="text-xs font-base text-[#9593A8]">Total Number of users</p>
                       <Badge variant="secondary" className="bg-gray-100">
                      Active
                    </Badge>
                    </div>
                    <div className="">
                      <p className="text-2xl font-bold text-[#403C6B]">
                       {dashboardStats ? formatNumber(dashboardStats.total_users) : 0}
                      </p>
                      <p className="text-xs text-[#9593A8]">All active users</p>
                      </div>
                    </div>
                   
                  </div>
                </CardContent>
              </Card>

            </>
          )}
        </div>
          {/* Revenue Chart */}
          <Card className="rounded-xl border bg-white shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-[#4F5077]">Revenue</CardTitle>
                <div className="flex items-center space-x-4">
                  <Button variant="link" className="text-[#5A6ACF] text-xs border border-gray-200 rounded-lg">
                    View Report
                  </Button>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <Select defaultValue="all-branches" >
                      <SelectTrigger className="bg-[#F1F1F1] text-[#9593A8]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-branches">All Branches</SelectItem>
                        <SelectItem value="branch-1">Branch 1</SelectItem>
                        <SelectItem value="branch-2">Branch 2</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="monthly">
                      <SelectTrigger className="bg-[#F1F1F1] text-[#9593A8]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {paymentsLoading ? (
                  <div className="h-full flex items-center justify-center bg-gray-50 rounded">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                      <p className="text-gray-500 text-sm">Loading revenue data...</p>
                    </div>
                  </div>
                ) : paymentsError ? (
                  <div className="h-full flex items-center justify-center bg-gray-50 rounded">
                    <div className="text-center text-red-600">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Failed to load revenue data</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-50 rounded">
                    <div className="text-center">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
                        <p className="text-sm text-gray-600">Monthly Performance</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-2xl font-bold text-green-600">
                            {paymentStats ? paymentAPI.formatCurrency(paymentStats.this_month_collection || 0) : '₹0'}
                          </p>
                          <p className="text-xs text-gray-500">This Month</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-2xl font-bold text-blue-600">
                            {paymentStats ? paymentAPI.formatCurrency(paymentStats.total_collected || 0) : '₹0'}
                          </p>
                          <p className="text-xs text-gray-500">Total Revenue</p>
                        </div>
                      </div>
                      <div className="mt-4 text-sm text-gray-500">
                        <p>Payments: {recentPayments?.length || 0} transactions</p>
                        <p>Students: {paymentStats?.total_students || 0} enrolled</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
  
 
            </CardContent>
          </Card>
          </div>
          {/* List of Coaches */}
          <Card className="rounded-xl border bg-white shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-[#4F5077]">List of coaches</CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-black">Filter by:</span>
                  <Select defaultValue="branch">
                    <SelectTrigger className="w-20 bg-[#F1F1F1]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="branch">BRANCH</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {coachesLoading ? (
                  // Loading state for coaches
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="space-y-1">
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : coachesError ? (
                  // Error state for coaches
                  <div className="flex items-center justify-center space-x-2 text-red-600 py-4">
                    <AlertCircle className="w-5 h-5" />
                    <span>{coachesError}</span>
                  </div>
                ) : coaches.length === 0 ? (
                  // No coaches found
                  <div className="text-center py-4 text-gray-500">
                    No coaches found
                  </div>
                ) : (
                  // Display coaches
                  coaches.map((coach) => (
                    <div key={coach.id} className="">
                      <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src="" />
                          <AvatarFallback>
                            {coach.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{coach.full_name}</p>
                          <p className="text-xs text-gray-500">
                            {coach.areas_of_expertise.length > 0
                              ? coach.areas_of_expertise[0]
                              : "General Training"}
                          </p>
                        </div>
                      </div>
                      <div className="flex">
                        {/* Default 5-star rating for now - can be enhanced later */}
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < 5 ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      </div>
                      <hr  className="mt-2 mb-2"/>
                    </div>
                  ))
                )}
                {coaches.length > 0 && (
                  <div className="">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => router.push(`${basePath}/coaches`)}
                    >
                      View All Coaches
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Summary and Recent Payments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance Summary */}
          <Card className="lg:col-span-2 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-[#4F5077] flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Attendance Overview
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`${basePath}/attendance`)}
                >
                  View Details
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12 text-gray-500">
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium text-gray-700 mb-1">Attendance Tracking</p>
                  <p className="text-sm text-gray-500">View detailed student and coach attendance from the Attendance page.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card className="rounded-xl border bg-white shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-[#4F5077]">Recent payments</CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-black">Select:</span>
                  <Select defaultValue="branch">
                    <SelectTrigger className="w-20 bg-[#f1f1f1] text-[#9593A8]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="">
                      <SelectItem value="branch">Branch</SelectItem>
                      <SelectItem value="amount">Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentsLoading ? (
                  // Loading state for payments
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-5 w-12 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))
                ) : paymentsError ? (
                  // Error state for payments
                  <div className="flex items-center justify-center space-x-2 text-red-600 py-4">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">{paymentsError}</span>
                  </div>
                ) : recentPayments.length === 0 ? (
                  // No payments found
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No recent payments found</p>
                  </div>
                ) : (
                  // Display real payments
                  recentPayments.map((payment) => (
                    <div key={payment.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{payment.transaction_id || payment.id.slice(0, 10)}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(payment.payment_date || payment.created_at).toLocaleDateString()}
                        </p>
                        {payment.student_name && (
                          <p className="text-xs text-gray-400">{payment.student_name}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{paymentAPI.formatCurrency(payment.amount)}</p>
                        <Badge
                          variant={payment.payment_method === "cash" ? "secondary" : "default"}
                          className={payment.payment_method === "cash" ? "bg-gray-100 text-[#2E85E8]" : "bg-blue-100 text-[#2E85E8]"}
                        >
                          {paymentAPI.formatPaymentMethod(payment.payment_method)}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
    </>
  )
}
