"use client"
import { DualLineChart } from "@/components/charts/LineChart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Users, BookOpen, Loader2, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardHeader from "@/components/dashboard-header"
import add_icon from "@/public/images/add_icon.png"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { dashboardAPI, DashboardStats, Coach } from "@/lib/api"
import { paymentAPI, PaymentStats, Payment } from "@/lib/paymentAPI"
import { TokenManager } from "@/lib/tokenManager"


const chartData = [
  { _id: "01 Jan", total: 2000, count: 1000 },
  { _id: "01 Feb", total: 5000, count: 3000 },
  { _id: "01 Mar", total: 12000, count: 8000 },
  { _id: "01 Apr", total: 7000, count: 6000 },
  { _id: "01 May", total: 10000, count: 9000 },
  { _id: "01 Jun", total: 11000, count: 9500 },
  { _id: "01 Jul", total: 9000, count: 7000 },
]
const formatValue = (value: number) => {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`
  }
  return value.toString()
}

interface Attendance {
  date: string
  studentName: string
  gender: string
  expertise: string
  email: string
  joinDate: string
  checkIn: string
  checkOut: string
  attendance: string
}

const studentData: Attendance[] = [
  {
    date: "28/04/2025",
    studentName: "Abhi ram",
    gender: "Male",
    expertise: "Martial Arts",
    email: "Abhi@gmail.com",
    joinDate: "20/04/2025",
    checkIn: "06:30 AM",
    checkOut: "09:00 AM",
    attendance: "90%",
  },
  // 👆 Add more student records here
]

const coachData: Attendance[] = [
  {
    date: "28/04/2025",
    studentName: "Coach Rohan",
    gender: "Male",
    expertise: "Yoga",
    email: "rohan@gmail.com",
    joinDate: "15/04/2025",
    checkIn: "07:00 AM",
    checkOut: "10:00 AM",
    attendance: "95%",
  },
  // 👆 Add more coach records here
]

export default function SuperAdminDashboard() {
  const router = useRouter();
    const [activeTab, setActiveTab] = useState<"student" | "coach">("student")
  const [month, setMonth] = useState("april")
  const [sort, setSort] = useState("today")
  const [page, setPage] = useState(1)
  const rowsPerPage = 5

  const data = activeTab === "student" ? studentData : coachData

  const paginatedData = data.slice((page - 1) * rowsPerPage, page * rowsPerPage)
  const totalPages = Math.ceil(data.length / rowsPerPage)
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
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader currentPage="Dashboard" />

      <main className="w-full mt-[100px] p-4 lg:py-4 px-19 mt-[100px]">
        {/* Dashboard Header with Action Buttons */}
        <div className="flex flex-col lg:flex-row justify-between items-start py-8 mb-4 lg:items-center  gap-4">
          <h1 className="text-2xl font-medium text-gray-600">Dashboard</h1>
          <div className="flex flex-wrap gap-2 lg:gap-3 text-[#6B7A99] roboto">
            <Button
              variant="outline"
              className="flex items-center space-x-1 bg-transparent text-sm"
              onClick={() => router.push("/dashboard/create-course")}
            >
              <img src={add_icon.src} alt="" className="w-8 h-8" />
              <span className="hidden sm:inline">Add Course</span>
              <span className="sm:hidden">Course</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center space-x-1 bg-transparent text-sm"
              onClick={() => router.push("/dashboard/add-coach")}
            >
              <img src={add_icon.src} alt="" className="w-8 h-8" />
              <span className="hidden sm:inline">Add Coach</span>
              <span className="sm:hidden">Coach</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center space-x-1 bg-transparent text-sm"
              onClick={() => router.push("/dashboard/branch-managers/create")}
            >
              <img src={add_icon.src} alt="" className="w-8 h-8" />
              <span className="hidden sm:inline">Add Branch Manager</span>
              <span className="sm:hidden">Manager</span>
            </Button>
            <Button
              variant="outline"
              className="flex items-center space-x-1 bg-transparent text-sm"
              onClick={() => router.push("/dashboard/create-branch")}
            >
              <img src={add_icon.src} alt="" className="w-8 h-8" />
              <span className="hidden sm:inline">Add New Branch</span>
              <span className="sm:hidden">Branch</span>
            </Button>
          </div>
        </div>


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
              <Card className="h-48 shadow-md">
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

               <Card className="h-48 shadow-md">
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

              <Card className="h-48 shadow-md">
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

                <Card className="h-48 shadow-md">
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
          <Card className="shadow-md">
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
              {/* <div className="h-64">
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
              </div> */}

        <DualLineChart 
          data={chartData} 
          height={400} 
          formatValue={formatValue} 
        />
  
 
            </CardContent>
          </Card>
          </div>
          {/* List of Coaches */}
          <Card className="shadow-md">
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
                          <AvatarImage src="/placeholder.svg" />
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
                      onClick={() => router.push("/dashboard/coaches")}
                    >
                      View All Coaches
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Attendance and Recent Payments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Attendance */}
         <Card className="lg:col-span-2 shadow-md rounded-2xl">
      <CardHeader>
        <div className="flex space-x-4">
          <Button
            className={`rounded-md px-4 ${
              activeTab === "student"
                ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setActiveTab("student")}
          >
            Student Attendance
          </Button>
          <Button
            className={`rounded-md px-4 ${
              activeTab === "coach"
                ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                : "bg-gray-100 text-gray-700"
            }`}
            onClick={() => setActiveTab("coach")}
          >
            Coach Attendance
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-4 flex justify-between items-center">
          <h3 className="font-semibold text-lg text-[#4F5077]">Attendance</h3>
          <div className="flex items-center space-x-4">
            {/* Month Filter */}
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-40 bg-[#f1f1f1] text-[#9593A8]">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent className="">
                <SelectItem value="march">March</SelectItem>
                <SelectItem value="april">April</SelectItem>
                <SelectItem value="may">May</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Filter */}
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-32 bg-[#f1f1f1] text-[#9593A8]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="border-b text-[#6B7A99] text-xs">
                <th className="text-left py-3 px-1">Name</th>
                <th className="text-left py-3 px-1">Student Name</th>
                <th className="text-left py-3 px-1">Gender</th>
                <th className="text-left py-3 px-1">Expertise</th>
                <th className="text-left py-3 px-1">Email Id</th>
                <th className="text-left py-3 px-1">Date of Join</th>
                <th className="text-left py-3 px-1">Check In</th>
                <th className="text-left py-3 px-1">Check Out</th>
                <th className="text-left py-3 px-1">Attendance</th>
                <th className="text-left py-3 px-1"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 text-[10px]">
                  <td className="py-3 px-2">{item.date}</td>
                  <td className="py-3 px-2">{item.studentName}</td>
                  <td className="py-3 px-2">{item.gender}</td>
                  <td className="py-3 px-2">{item.expertise}</td>
                  <td className="py-3 px-2">{item.email}</td>
                  <td className="py-3 px-2">{item.joinDate}</td>
                  <td className="py-3 px-2">{item.checkIn}</td>
                  <td className="py-3 px-2">{item.checkOut}</td>
                  <td className="py-3 px-2">{item.attendance}</td>
                  <td className="py-3 px-2">
                    <Button className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded-md text-xs">
                      View more
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end items-center space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>

          {Array.from({ length: totalPages }).map((_, i) => (
            <Button
              key={i}
              variant={page === i + 1 ? "default" : "outline"}
              size="sm"
              className={page === i + 1 ? "bg-yellow-400 text-black" : ""}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}

          <Button
            className="bg-yellow-400 hover:bg-yellow-500 text-black"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>

          {/* Recent Payments */}
          <Card className="shadow-md">
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
      </main>
    </div>
  )
}
