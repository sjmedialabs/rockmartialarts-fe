"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Users, BookOpen, Loader2, AlertCircle, CreditCard } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Header from "@/components/layout/Header"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback, useMemo } from "react"
import { useDashboardBasePath, useDashboardRole } from "@/lib/useDashboardBasePath"
import { dashboardAPI, DashboardStats, Coach } from "@/lib/api"
import { paymentAPI, PaymentStats, Payment } from "@/lib/paymentAPI"
import { branchAPI } from "@/lib/branchAPI"
import { TokenManager } from "@/lib/tokenManager"
import { BranchManagerAuth } from "@/lib/branchManagerAuth"


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

  // Branch filter state
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>("all-branches")

  // Time period filter
  const [timePeriod, setTimePeriod] = useState<string>("this-month")
  const role = useDashboardRole()

  // Get token from either TokenManager (superadmin) or BranchManagerAuth (branch admin)
  const getAuthToken = useCallback(() => {
    return TokenManager.getToken() || BranchManagerAuth.getToken() || null
  }, [])

  // Compute date range from time period
  const dateRange = useMemo(() => {
    const now = new Date()
    const end_date = now.toISOString().split('T')[0]
    let start: Date

    switch (timePeriod) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'this-week': {
        const day = now.getDay()
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day)
        break
      }
      case 'this-year':
        start = new Date(now.getFullYear(), 0, 1)
        break
      case 'this-month':
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }

    return {
      start_date: start.toISOString().split('T')[0],
      end_date,
      period: timePeriod
    }
  }, [timePeriod])

  // Fetch dashboard statistics — re-runs when timePeriod changes
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = getAuthToken()
        if (!token) {
          setError("Authentication required. Please login again.")
          return
        }

        const response = await dashboardAPI.getDashboardStats(token, undefined, dateRange)
        setDashboardStats(response.dashboard_stats)
      } catch (err: any) {
        console.error("Error fetching dashboard stats:", err)
        setError(err.message || "Failed to fetch dashboard statistics")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [dateRange, getAuthToken])

  // Fetch branches (only on mount)
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const token = getAuthToken()
        if (!token) return

        const response = await branchAPI.getBranches(token)
        const allBranches = (response.branches || []).map((b: any) => ({
          id: b.id,
          name: b.branch?.name || b.name || 'Unknown Branch',
        }))
        setBranches(allBranches)
      } catch (err) {
        console.error("Error fetching branches:", err)
      }
    }

    fetchBranches()
  }, [getAuthToken])

  // Fetch coaches list (only on mount, not affected by time filter)
  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        setCoachesLoading(true)
        setCoachesError(null)

        const token = getAuthToken()
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
  }, [getAuthToken])

  // Fetch payment data — re-runs when timePeriod changes
  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setPaymentsLoading(true)
        setPaymentsError(null)

        const token = getAuthToken()
        if (!token) {
          setPaymentsError("Authentication required. Please login again.")
          return
        }

        // Fetch payment stats and recent payments filtered by the selected date range
        const [statsResponse, paymentsResponse] = await Promise.all([
          paymentAPI.getPaymentStats(token, dateRange),
          paymentAPI.getPayments(
            { limit: 5, skip: 0, start_date: dateRange.start_date, end_date: dateRange.end_date },
            token
          )
        ])

        setPaymentStats(statsResponse)
        setRecentPayments(paymentsResponse.payments || [])
      } catch (err: any) {
        console.error("Error fetching payment data:", err)
        setPaymentsError(err.message || "Failed to fetch payment data")
      } finally {
        setPaymentsLoading(false)
      }
    }

    fetchPaymentData()
  }, [dateRange, getAuthToken])

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
  const formatNumber = (num: number | undefined | null) => {
    const n = num ?? 0
    if (n >= 1000) {
      return (n / 1000).toFixed(1) + 'k'
    }
    return n.toString()
  }

  const timePeriodLabel = {
    "today": "Today",
    "this-week": "This Week",
    "this-month": "This Month",
    "this-year": "This Year"
  }[timePeriod] || "This Month"

  return (
    <>
      <Header title="Dashboard" role={role}>
        {/* Time Period Filter — inline beside header action buttons */}
        <Select value={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger className="w-36 bg-white border border-gray-200 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="this-week">This Week</SelectItem>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="this-year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </Header>

        {/* Revenue Chart and Coaches List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="flex flex-col lg:col-span-2">

             {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 xl:gap-6 mb-4 sm:mb-6">
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
                  <div className="flex justify-between flex-col gap-10">
                    <div className="flex flex-col xl:flex-row justify-between mt-4">
                      <p className="text-xs font-base text-[var(--brand-muted)]">Total Revenue</p>
                      <Badge variant="secondary" className="bg-gray-100 text-xs">
                        {timePeriodLabel}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[var(--brand-dark)]">
                        {paymentStats ? paymentAPI.formatCurrency(paymentStats.this_month_collection || 0) : '₹0'}
                      </p>
                      <p className="text-xs text-[var(--brand-muted)]">Earning {timePeriodLabel.toLowerCase()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="h-48 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all">
                <CardContent className="px-4">
                  <div className="flex justify-between flex-col gap-10">
                    <div className="flex flex-col xl:flex-row justify-between mt-4">
                      <p className="text-xs font-base text-[var(--brand-muted)]">Active Students</p>
                      <Badge variant="secondary" className="bg-gray-100 text-xs">
                        {timePeriodLabel}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[var(--brand-dark)]">
                        {dashboardStats ? dashboardStats.active_students : 0}
                      </p>
                      <p className="text-xs text-[var(--brand-muted)]">Active students {timePeriodLabel.toLowerCase()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="h-48 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all">
                <CardContent className="px-4">
                  <div className="flex justify-between flex-col gap-10">
                    <div className="flex flex-col xl:flex-row justify-between mt-4">
                      <p className="text-xs font-base text-[var(--brand-muted)]">Active Courses</p>
                      <Badge variant="secondary" className="bg-gray-100 text-xs">
                        {timePeriodLabel}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[var(--brand-dark)]">
                        {dashboardStats ? dashboardStats.active_courses : 0}
                      </p>
                      <p className="text-xs text-[var(--brand-muted)]">Active courses {timePeriodLabel.toLowerCase()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="h-48 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all">
                <CardContent className="px-4">
                  <div className="flex justify-between flex-col gap-10">
                    <div className="flex flex-col xl:flex-row justify-between mt-4">
                      <p className="text-xs font-base text-[var(--brand-muted)]">Total Students</p>
                      <Badge variant="secondary" className="bg-gray-100 text-xs">
                        {timePeriodLabel}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-[var(--brand-dark)]">
                        {dashboardStats ? formatNumber(dashboardStats.total_students ?? dashboardStats.active_students) : 0}
                      </p>
                      <p className="text-xs text-[var(--brand-muted)]">All active students</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </>
          )}
        </div>
          {/* Revenue Chart */}
          <Card className="rounded-xl border bg-white shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-[var(--brand-dark)]">Revenue</CardTitle>
                {role === "super_admin" && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Sort by:</span>
                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                      <SelectTrigger className="bg-[#F1F1F1] text-[#9593A8]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-branches">All Branches</SelectItem>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
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
                )}
              </div>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">Loading revenue data...</p>
                  </div>
                </div>
              ) : paymentsError ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center text-red-600">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Failed to load revenue data</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {paymentStats ? paymentAPI.formatCurrency(paymentStats.this_month_collection || 0) : '₹0'}
                      </p>
                      <p className="text-xs text-[var(--brand-muted)] mt-1">{timePeriodLabel} Collection</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {paymentStats ? paymentAPI.formatCurrency(paymentStats.total_collected || 0) : '₹0'}
                      </p>
                      <p className="text-xs text-[var(--brand-muted)] mt-1">Total Revenue</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center text-sm text-[var(--brand-muted)]">
                    <p>Payments: {recentPayments?.length || 0} transactions</p>
                    <p>Students: {paymentStats?.total_students || 0} enrolled</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          </div>
          {/* List of Coaches */}
          <Card className="rounded-xl border bg-white shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-[var(--brand-dark)]">List of coaches</CardTitle>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Attendance Summary */}
          <Card className="lg:col-span-2 rounded-xl border bg-white shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-[var(--brand-dark)] flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Attendance Overview
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`${basePath}/attendance`)}
                >
                  Go to Attendance
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
                <CardTitle className="text-[var(--brand-dark)]">Recent payments</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`${basePath}/payment-tracking`)}
                  className="text-xs"
                >
                  <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                  View Payments
                </Button>
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
