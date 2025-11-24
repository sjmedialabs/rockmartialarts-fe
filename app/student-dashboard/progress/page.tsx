"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import StudentDashboardHeader from "@/components/student-dashboard-header"

export default function StudentProgressPage() {
  const router = useRouter()
  const [studentData, setStudentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
      } catch (error) {
        console.error("Error parsing user data:", error)
        setStudentData({
          name: "Student",
          email: "student@example.com",
        })
      }
    } else {
      setStudentData({
        name: "Student",
        email: "student@example.com",
      })
    }
    
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    )
  }

  // Mock progress data - replace with actual API call
  const progressData = [
    {
      id: 1,
      course: "Shaolin Kung Fu",
      currentLevel: "Yellow Belt",
      nextLevel: "Orange Belt",
      progress: 75,
      skillsLearned: 12,
      totalSkills: 16,
      timeSpent: "45 hours",
      achievements: ["Basic Forms", "Stance Coachy", "First Sparring"]
    },
    {
      id: 2,
      course: "Taekwondo",
      currentLevel: "White Belt",
      nextLevel: "Yellow Belt",
      progress: 45,
      skillsLearned: 8,
      totalSkills: 18,
      timeSpent: "28 hours",
      achievements: ["Basic Kicks", "Poomsae 1"]
    },
    {
      id: 3,
      course: "Kick Boxing",
      currentLevel: "Beginner",
      nextLevel: "Intermediate",
      progress: 90,
      skillsLearned: 18,
      totalSkills: 20,
      timeSpent: "62 hours",
      achievements: ["Combo Coachy", "Sparring Ready", "Conditioning Complete"]
    }
  ]

  const overallStats = {
    totalHours: 135,
    coursesActive: 3,
    achievementsUnlocked: 8,
    averageProgress: 70
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentDashboardHeader 
        studentName={studentData?.name || "Student"}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Training Progress</h1>
            <p className="text-gray-600">Track your martial arts journey and achievements</p>
          </div>

          {/* Overall Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{overallStats.totalHours}</p>
                  <p className="text-sm text-gray-500 mt-1">Total Hours</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{overallStats.coursesActive}</p>
                  <p className="text-sm text-gray-500 mt-1">Active Courses</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{overallStats.achievementsUnlocked}</p>
                  <p className="text-sm text-gray-500 mt-1">Achievements</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{overallStats.averageProgress}%</p>
                  <p className="text-sm text-gray-500 mt-1">Avg Progress</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Progress Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {progressData.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {course.course}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-500 mt-1">
                        Current: {course.currentLevel} → Next: {course.nextLevel}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      {course.currentLevel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress to Next Level</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-3" />
                    </div>

                    {/* Skills Progress */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Skills Learned</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {course.skillsLearned}/{course.totalSkills}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Time Spent</p>
                        <p className="text-lg font-semibold text-gray-900">{course.timeSpent}</p>
                      </div>
                    </div>

                    {/* Achievements */}
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Recent Achievements</p>
                      <div className="flex flex-wrap gap-2">
                        {course.achievements.map((achievement, index) => (
                          <Badge 
                            key={index}
                            variant="outline"
                            className="text-xs bg-green-50 text-green-700 border-green-200"
                          >
                            🏆 {achievement}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Overall Progress Chart Placeholder */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Progress Over Time</CardTitle>
              <CardDescription>Your training progress across all courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">Progress chart will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
