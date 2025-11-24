"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Calendar,
  Award,
  BarChart3,
  PieChart,
  Download,
  Loader2,
  FileText
} from "lucide-react"
import CoachDashboardHeader from "@/components/coach-dashboard-header"
import { checkCoachAuth, getCoachAuthHeaders } from "@/lib/coachAuth"

interface CoachReportData {
  performance_metrics: {
    total_students: number
    active_courses: number
    average_rating: number
    total_sessions: number
    attendance_rate: number
  }
  student_progress: Array<{
    student_name: string
    course_name: string
    progress_percentage: number
    last_session: string
    attendance_rate: number
  }>
  course_analytics: Array<{
    course_name: string
    total_students: number
    completion_rate: number
    average_rating: number
    revenue_generated: number
  }>
  monthly_stats: Array<{
    month: string
    sessions_conducted: number
    new_students: number
    revenue: number
  }>
}

export default function CoachReportsPage() {
  const router = useRouter()
  const [reportData, setReportData] = useState<CoachReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [coachData, setCoachData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    // Use the robust coach authentication check
    const authResult = checkCoachAuth()

    if (!authResult.isAuthenticated) {
      console.log("Coach not authenticated:", authResult.error)
      router.push("/coach/login")
      return
    }

    if (authResult.coach && authResult.token) {
      setCoachData(authResult.coach)
      fetchReportData(authResult.token, authResult.coach.id)
    } else {
      setError("Coach information not found")
      setLoading(false)
    }
  }, [router])

  const fetchReportData = async (token: string, coachId: string) => {
    try {
      setLoading(true)
      setError(null)

      // For now, we'll use mock data since the specific coach reports endpoint may not be implemented
      // In a real implementation, this would call: `/api/coaches/${coachId}/reports`
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock data for demonstration
      const mockData: CoachReportData = {
        performance_metrics: {
          total_students: 45,
          active_courses: 3,
          average_rating: 4.7,
          total_sessions: 128,
          attendance_rate: 92.5
        },
        student_progress: [
          {
            student_name: "John Smith",
            course_name: "Karate Basics",
            progress_percentage: 85,
            last_session: "2024-01-15",
            attendance_rate: 95
          },
          {
            student_name: "Sarah Johnson",
            course_name: "Advanced Taekwondo",
            progress_percentage: 72,
            last_session: "2024-01-14",
            attendance_rate: 88
          },
          {
            student_name: "Mike Chen",
            course_name: "Kung Fu Fundamentals",
            progress_percentage: 91,
            last_session: "2024-01-16",
            attendance_rate: 97
          }
        ],
        course_analytics: [
          {
            course_name: "Karate Basics",
            total_students: 20,
            completion_rate: 78,
            average_rating: 4.8,
            revenue_generated: 15000
          },
          {
            course_name: "Advanced Taekwondo",
            total_students: 15,
            completion_rate: 82,
            average_rating: 4.6,
            revenue_generated: 18000
          },
          {
            course_name: "Kung Fu Fundamentals",
            total_students: 10,
            completion_rate: 90,
            average_rating: 4.9,
            revenue_generated: 12000
          }
        ],
        monthly_stats: [
          { month: "Dec 2023", sessions_conducted: 32, new_students: 8, revenue: 12000 },
          { month: "Jan 2024", sessions_conducted: 35, new_students: 12, revenue: 15000 },
          { month: "Feb 2024", sessions_conducted: 28, new_students: 6, revenue: 10500 }
        ]
      }

      setReportData(mockData)
    } catch (error) {
      console.error("Error fetching report data:", error)
      setError("Failed to load report data")
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = () => {
    // Implement export functionality
    console.log("Exporting report...")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CoachDashboardHeader 
          currentPage="Reports"
          coachName={coachData?.full_name || "Coach"}
        />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mt-[100px]">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-600" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CoachDashboardHeader 
          currentPage="Reports"
          coachName={coachData?.full_name || "Coach"}
        />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mt-[100px]">
          <div className="px-4 py-6 sm:px-0">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-red-600">
                  <p className="font-medium">Error loading reports</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CoachDashboardHeader 
        currentPage="Reports"
        coachName={coachData?.full_name || "Coach"}
      />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mt-[100px]">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Performance Reports</h1>
              <p className="text-gray-600">Track your coaching performance and student progress</p>
            </div>
            <Button onClick={handleExportReport} className="bg-yellow-600 hover:bg-yellow-700">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="students">Student Progress</TabsTrigger>
              <TabsTrigger value="courses">Course Analytics</TabsTrigger>
              <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Students</p>
                        <p className="text-2xl font-bold text-gray-900">{reportData.performance_metrics.total_students}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <BookOpen className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Active Courses</p>
                        <p className="text-2xl font-bold text-gray-900">{reportData.performance_metrics.active_courses}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Award className="h-8 w-8 text-yellow-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Average Rating</p>
                        <p className="text-2xl font-bold text-gray-900">{reportData.performance_metrics.average_rating}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Calendar className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                        <p className="text-2xl font-bold text-gray-900">{reportData.performance_metrics.total_sessions}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <TrendingUp className="h-8 w-8 text-red-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                        <p className="text-2xl font-bold text-gray-900">{reportData.performance_metrics.attendance_rate}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="students" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Student Progress Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.student_progress.map((student, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{student.student_name}</h3>
                          <p className="text-sm text-gray-600">{student.course_name}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Progress</p>
                            <Badge variant="outline">{student.progress_percentage}%</Badge>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Attendance</p>
                            <Badge variant="outline">{student.attendance_rate}%</Badge>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Last Session</p>
                            <p className="text-sm">{new Date(student.last_session).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="courses" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.course_analytics.map((course, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium">{course.course_name}</h3>
                          <Badge variant="outline">₹{course.revenue_generated.toLocaleString()}</Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Students</p>
                            <p className="font-medium">{course.total_students}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Completion Rate</p>
                            <p className="font-medium">{course.completion_rate}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Rating</p>
                            <p className="font-medium">{course.average_rating}/5</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Revenue</p>
                            <p className="font-medium">₹{course.revenue_generated.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.monthly_stats.map((stat, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="font-medium">{stat.month}</div>
                        <div className="flex space-x-8 text-sm">
                          <div className="text-center">
                            <p className="text-gray-600">Sessions</p>
                            <p className="font-medium">{stat.sessions_conducted}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-600">New Students</p>
                            <p className="font-medium">{stat.new_students}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-600">Revenue</p>
                            <p className="font-medium">₹{stat.revenue.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
