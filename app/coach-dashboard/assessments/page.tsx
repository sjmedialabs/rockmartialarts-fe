"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ClipboardList,
  Users, 
  Star,
  Plus,
  Edit,
  Eye,
  Search,
  Filter,
  Loader2,
  Award,
  TrendingUp,
  Calendar
} from "lucide-react"
import CoachDashboardHeader from "@/components/coach-dashboard-header"
import { checkCoachAuth, getCoachAuthHeaders } from "@/lib/coachAuth"

interface Assessment {
  id: string
  student_name: string
  student_id: string
  course_name: string
  course_id: string
  assessment_type: "skill" | "technique" | "progress" | "belt_test"
  title: string
  description: string
  score: number
  max_score: number
  grade: string
  date: string
  status: "completed" | "pending" | "in_progress"
  notes?: string
  skills_assessed: string[]
}

interface AssessmentStats {
  total_assessments: number
  completed_assessments: number
  pending_assessments: number
  average_score: number
  students_assessed: number
}

export default function CoachAssessmentsPage() {
  const router = useRouter()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [filteredAssessments, setFilteredAssessments] = useState<Assessment[]>([])
  const [assessmentStats, setAssessmentStats] = useState<AssessmentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [coachData, setCoachData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // New assessment form state
  const [newAssessment, setNewAssessment] = useState({
    student_id: "",
    course_id: "",
    assessment_type: "",
    title: "",
    description: "",
    max_score: 100
  })

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
      fetchAssessmentData(authResult.token, authResult.coach.id)
    } else {
      setError("Coach information not found")
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    // Filter assessments based on search term and filter type
    let filtered = assessments

    if (searchTerm) {
      filtered = filtered.filter(assessment =>
        assessment.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterType !== "all") {
      filtered = filtered.filter(assessment => assessment.assessment_type === filterType)
    }

    if (activeTab !== "all") {
      filtered = filtered.filter(assessment => assessment.status === activeTab)
    }

    setFilteredAssessments(filtered)
  }, [searchTerm, filterType, activeTab, assessments])

  const fetchAssessmentData = async (token: string, coachId: string) => {
    try {
      setLoading(true)
      setError(null)

      // For now, we'll use mock data since the specific coach assessments endpoint may not be implemented
      // In a real implementation, this would call: `/api/coaches/${coachId}/assessments`
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock data for demonstration
      const mockAssessments: Assessment[] = [
        {
          id: "1",
          student_name: "John Smith",
          student_id: "STU001",
          course_name: "Karate Basics",
          course_id: "COURSE001",
          assessment_type: "skill",
          title: "Basic Kata Assessment",
          description: "Assessment of fundamental kata techniques",
          score: 85,
          max_score: 100,
          grade: "B+",
          date: "2024-01-15",
          status: "completed",
          notes: "Good form, needs work on timing",
          skills_assessed: ["Kata", "Balance", "Technique"]
        },
        {
          id: "2",
          student_name: "Sarah Johnson",
          student_id: "STU002",
          course_name: "Advanced Taekwondo",
          course_id: "COURSE002",
          assessment_type: "belt_test",
          title: "Blue Belt Test",
          description: "Comprehensive blue belt examination",
          score: 92,
          max_score: 100,
          grade: "A-",
          date: "2024-01-14",
          status: "completed",
          notes: "Excellent performance, ready for next level",
          skills_assessed: ["Forms", "Sparring", "Breaking", "Theory"]
        },
        {
          id: "3",
          student_name: "Mike Chen",
          student_id: "STU003",
          course_name: "Kung Fu Fundamentals",
          course_id: "COURSE003",
          assessment_type: "progress",
          title: "Monthly Progress Review",
          description: "Regular progress assessment",
          score: 0,
          max_score: 100,
          grade: "Pending",
          date: "2024-01-20",
          status: "pending",
          notes: "Scheduled for next week",
          skills_assessed: ["Stances", "Hand Techniques", "Flexibility"]
        }
      ]

      const mockStats: AssessmentStats = {
        total_assessments: 25,
        completed_assessments: 20,
        pending_assessments: 5,
        average_score: 87.5,
        students_assessed: 15
      }

      setAssessments(mockAssessments)
      setFilteredAssessments(mockAssessments)
      setAssessmentStats(mockStats)
    } catch (error) {
      console.error("Error fetching assessment data:", error)
      setError("Failed to load assessment data")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getGradeBadge = (grade: string, score: number) => {
    if (grade === "Pending") {
      return <Badge variant="outline">Pending</Badge>
    }
    
    const color = score >= 90 ? "bg-green-100 text-green-800" :
                  score >= 80 ? "bg-blue-100 text-blue-800" :
                  score >= 70 ? "bg-yellow-100 text-yellow-800" :
                  "bg-red-100 text-red-800"
    
    return <Badge className={color}>{grade}</Badge>
  }

  const handleCreateAssessment = () => {
    // Implement create assessment functionality
    console.log("Creating assessment:", newAssessment)
    setIsCreateDialogOpen(false)
    // Reset form
    setNewAssessment({
      student_id: "",
      course_id: "",
      assessment_type: "",
      title: "",
      description: "",
      max_score: 100
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CoachDashboardHeader 
          currentPage="Assessments"
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

  if (error || !assessmentStats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CoachDashboardHeader 
          currentPage="Assessments"
          coachName={coachData?.full_name || "Coach"}
        />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mt-[100px]">
          <div className="px-4 py-6 sm:px-0">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-red-600">
                  <p className="font-medium">Error loading assessments</p>
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
        currentPage="Assessments"
        coachName={coachData?.full_name || "Coach"}
      />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mt-[100px]">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Assessments</h1>
              <p className="text-gray-600">Evaluate and track student progress</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-yellow-600 hover:bg-yellow-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Assessment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Assessment</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="title">Assessment Title</label>
                    <Input
                      id="title"
                      value={newAssessment.title}
                      onChange={(e) => setNewAssessment({...newAssessment, title: e.target.value})}
                      placeholder="Enter assessment title"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="type">Assessment Type</label>
                    <Select value={newAssessment.assessment_type} onValueChange={(value) => setNewAssessment({...newAssessment, assessment_type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="skill">Skill Assessment</SelectItem>
                        <SelectItem value="technique">Technique Assessment</SelectItem>
                        <SelectItem value="progress">Progress Review</SelectItem>
                        <SelectItem value="belt_test">Belt Test</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="description">Description</label>
                    <Textarea
                      id="description"
                      value={newAssessment.description}
                      onChange={(e) => setNewAssessment({...newAssessment, description: e.target.value})}
                      placeholder="Enter assessment description"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="max_score">Maximum Score</label>
                    <Input
                      id="max_score"
                      type="number"
                      value={newAssessment.max_score}
                      onChange={(e) => setNewAssessment({...newAssessment, max_score: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAssessment}>
                    Create Assessment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <ClipboardList className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Assessments</p>
                    <p className="text-2xl font-bold text-gray-900">{assessmentStats.total_assessments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{assessmentStats.completed_assessments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{assessmentStats.pending_assessments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold text-gray-900">{assessmentStats.average_score}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Students Assessed</p>
                    <p className="text-2xl font-bold text-gray-900">{assessmentStats.students_assessed}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search assessments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="skill">Skill Assessment</SelectItem>
                  <SelectItem value="technique">Technique Assessment</SelectItem>
                  <SelectItem value="progress">Progress Review</SelectItem>
                  <SelectItem value="belt_test">Belt Test</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Assessments</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {filteredAssessments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <ClipboardList className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No assessments found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchTerm || filterType !== "all" ? "No assessments match your search criteria." : "No assessments have been created yet."}
                        </p>
                      </div>
                    ) : (
                      filteredAssessments.map((assessment) => (
                        <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900">{assessment.title}</h3>
                                <p className="text-sm text-gray-600">{assessment.student_name} - {assessment.course_name}</p>
                                <p className="text-sm text-gray-500 mt-1">{assessment.description}</p>
                                <div className="flex items-center space-x-4 mt-2">
                                  <span className="text-xs text-gray-500">
                                    {new Date(assessment.date).toLocaleDateString()}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {assessment.assessment_type.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                  {assessment.skills_assessed.length > 0 && (
                                    <span className="text-xs text-gray-500">
                                      Skills: {assessment.skills_assessed.join(', ')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-4 ml-4">
                                {assessment.status === "completed" && (
                                  <div className="text-center">
                                    <p className="text-sm font-medium">{assessment.score}/{assessment.max_score}</p>
                                    {getGradeBadge(assessment.grade, assessment.score)}
                                  </div>
                                )}
                                {getStatusBadge(assessment.status)}
                                <div className="flex space-x-1">
                                  <Button size="sm" variant="ghost">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
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
