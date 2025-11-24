"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Upload, Plus, X, Users, Star, Loader2, AlertCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import BranchManagerDashboardHeader from "@/components/branch-manager-dashboard-header"
import { BranchManagerAuth } from "@/lib/branchManagerAuth"

interface FormErrors {
  [key: string]: string
}

export default function BranchManagerEditCourse() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const { toast } = useToast()

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  // Categories state
  const [categories, setCategories] = useState<any[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)

  // Dynamic data states
  const [martialArtsStyles, setMartialArtsStyles] = useState<any[]>([])
  const [instructors, setInstructors] = useState<any[]>([])
  const [isLoadingStyles, setIsLoadingStyles] = useState(true)
  const [isLoadingInstructors, setIsLoadingInstructors] = useState(true)

  // Form state
  const [prerequisites, setPrerequisites] = useState<string[]>([])
  const [newPrerequisite, setNewPrerequisite] = useState("")
  const [formData, setFormData] = useState({
    courseTitle: "",
    courseCode: "",
    description: "",
    martialArtsStyle: "",
    difficultyLevel: "",
    category: "",
    maxStudents: "",
    minAge: "",
    maxAge: "",
    price: "",
    currency: "INR",
    branchSpecificPricing: false,
    instructor: "",
    equipmentRequired: "",
    syllabus: "",
    certificationOffered: false,
    isActive: true,
    imageUrl: "",
    videoUrl: "",
    tags: [] as string[]
  })

  // Fetch course data and dynamic options on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true)

        const token = BranchManagerAuth.getToken()
        if (!token) {
          throw new Error("Authentication token not found. Please login again.")
        }

        // Fetch all data in parallel
        const [courseResponse, stylesResponse, instructorsResponse] = await Promise.allSettled([
          // Fetch course data
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/courses/${courseId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          // Fetch martial arts styles (from categories or a dedicated endpoint)
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories?type=martial_arts_style&active_only=true`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          // Fetch instructors (coaches)
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/coaches?active_only=true&limit=100`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        ])

        // Handle course data
        if (courseResponse.status === 'fulfilled' && courseResponse.value.ok) {
          const courseData = await courseResponse.value.json()

          // Map API data to form structure
          setFormData({
            courseTitle: courseData.title || "",
            courseCode: courseData.code || "",
            description: courseData.description || "",
            martialArtsStyle: courseData.martial_art_style_id || "",
            difficultyLevel: courseData.difficulty_level || "",
            category: courseData.category_id || "",
            maxStudents: courseData.student_requirements?.max_students?.toString() || "",
            minAge: courseData.student_requirements?.min_age?.toString() || "",
            maxAge: courseData.student_requirements?.max_age?.toString() || "",
            price: courseData.pricing?.amount?.toString() || "",
            currency: courseData.pricing?.currency || "INR",
            branchSpecificPricing: courseData.pricing?.branch_specific_pricing || false,
            instructor: courseData.instructor_id || "",
            equipmentRequired: courseData.course_content?.equipment_required?.join('\n') || "",
            syllabus: courseData.course_content?.syllabus || "",
            certificationOffered: courseData.settings?.offers_certification || false,
            isActive: courseData.settings?.active || true,
            imageUrl: courseData.media_resources?.course_image_url || "",
            videoUrl: courseData.media_resources?.promo_video_url || "",
            tags: []
          })

          setPrerequisites(courseData.student_requirements?.prerequisites || [])
        } else {
          if (courseResponse.status === 'fulfilled' && courseResponse.value.status === 404) {
            throw new Error("Course not found")
          }
          // Use mock data for testing
          console.log("Using mock course data for testing")
          setFormData({
            courseTitle: "Advanced Kung Fu Training",
            courseCode: "KF-ADV-001",
            description: "Advanced level Kung Fu training focusing on competitive techniques, advanced forms, and sparring strategies. This course is designed for students who have coached basic and intermediate techniques.",
            martialArtsStyle: "style-kung-fu-uuid",
            difficultyLevel: "Advanced",
            category: "cat-1",
            maxStudents: "20",
            minAge: "12",
            maxAge: "50",
            price: "8500",
            currency: "INR",
            branchSpecificPricing: false,
            instructor: "instructor-john-uuid",
            equipmentRequired: "Kung Fu uniform\nProtective gear\nTraining weapons",
            syllabus: "Advanced forms and techniques, weapon training, sparring strategies, philosophy and meditation",
            certificationOffered: true,
            isActive: true,
            imageUrl: "",
            videoUrl: "",
            tags: []
          })
          setPrerequisites(["Basic Kung Fu knowledge", "Yellow belt or higher", "Physical fitness assessment"])
        }

        // Handle martial arts styles data
        if (stylesResponse.status === 'fulfilled' && stylesResponse.value.ok) {
          const stylesData = await stylesResponse.value.json()
          const styles = (stylesData.categories || []).map((style: any) => ({
            id: style.id,
            name: style.name
          }))
          setMartialArtsStyles(styles)
        } else {
          // Fallback to hardcoded styles if API fails
          setMartialArtsStyles([
            { id: "style-kung-fu-uuid", name: "Kung Fu" },
            { id: "style-karate-uuid", name: "Karate" },
            { id: "style-taekwondo-uuid", name: "Taekwondo" },
            { id: "style-boxing-uuid", name: "Boxing" },
            { id: "style-jiu-jitsu-uuid", name: "Brazilian Jiu-Jitsu" },
            { id: "style-muay-thai-uuid", name: "Muay Thai" },
            { id: "style-judo-uuid", name: "Judo" }
          ])
        }
        setIsLoadingStyles(false)

        // Handle instructors data
        if (instructorsResponse.status === 'fulfilled' && instructorsResponse.value.ok) {
          const instructorsData = await instructorsResponse.value.json()
          const instructorsList = (instructorsData.coaches || []).map((coach: any) => ({
            id: coach.id,
            name: coach.full_name || `${coach.personal_info?.first_name || ''} ${coach.personal_info?.last_name || ''}`.trim()
          }))
          setInstructors(instructorsList)
        } else {
          // Fallback to hardcoded instructors if API fails
          setInstructors([
            { id: "instructor-john-uuid", name: "Sensei John Martinez" },
            { id: "instructor-chen-uuid", name: "Coach Chen Wei" },
            { id: "instructor-sarah-uuid", name: "Coach Sarah Williams" },
            { id: "instructor-david-uuid", name: "Sifu David Thompson" }
          ])
        }
        setIsLoadingInstructors(false)

      } catch (error) {
        console.error("Error fetching data:", error)
        setErrors({ general: error instanceof Error ? error.message : 'Failed to load data' })
        setIsLoadingStyles(false)
        setIsLoadingInstructors(false)
      } finally {
        setIsLoading(false)
      }
    }

    if (courseId) {
      fetchAllData()
    }
  }, [courseId])

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories/public/details?active_only=true`)

        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }

        const data = await response.json()
        setCategories(data.categories || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
        toast({
          title: "Error",
          description: "Failed to load categories. Using default options.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  const addPrerequisite = () => {
    if (newPrerequisite.trim() && !prerequisites.includes(newPrerequisite.trim())) {
      setPrerequisites([...prerequisites, newPrerequisite.trim()])
      setNewPrerequisite("")
    }
  }

  const removePrerequisite = (index: number) => {
    setPrerequisites(prerequisites.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Map form data to backend API format
      const apiData = {
        title: formData.courseTitle,
        code: formData.courseCode,
        description: formData.description,
        martial_art_style_id: formData.martialArtsStyle || "default-style-id",
        difficulty_level: formData.difficultyLevel,
        category_id: formData.category || "default-category-id",
        instructor_id: formData.instructor,
        student_requirements: {
          max_students: parseInt(formData.maxStudents) || 20,
          min_age: parseInt(formData.minAge) || 6,
          max_age: parseInt(formData.maxAge) || 99,
          prerequisites: prerequisites
        },
        course_content: {
          syllabus: formData.syllabus || "",
          equipment_required: formData.equipmentRequired ? formData.equipmentRequired.split('\n').map(item => item.trim()).filter(item => item) : []
        },
        media_resources: {
          course_image_url: formData.imageUrl || "",
          promo_video_url: formData.videoUrl || ""
        },
        pricing: {
          currency: formData.currency,
          amount: parseFloat(formData.price),
          branch_specific_pricing: formData.branchSpecificPricing
        },
        settings: {
          offers_certification: formData.certificationOffered || true,
          active: formData.isActive
        }
      }

      const token = BranchManagerAuth.getToken()
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "No authentication token available. Please login again.",
          variant: "destructive"
        })
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/courses/${courseId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.detail || result.message || `Failed to update course (${response.status})`)
      }

      console.log("Course updated successfully:", result)
      setShowSuccessPopup(true)

      setTimeout(() => {
        setShowSuccessPopup(false)
        router.push("/branch-manager-dashboard/courses")
      }, 2000)

    } catch (error) {
      console.error("Error updating course:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update course',
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BranchManagerDashboardHeader currentPage="Edit Course" />
        <main className="w-full p-4 lg:p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading course data...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (errors.general) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BranchManagerDashboardHeader currentPage="Edit Course" />
        <main className="w-full p-4 lg:p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Course</h2>
              <p className="text-gray-600 mb-4">{errors.general}</p>
              <Button onClick={() => router.push("/branch-manager-dashboard/courses")} variant="outline">
                Back to Courses
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BranchManagerDashboardHeader currentPage="Edit Course" />

      <main className="w-full p-4 lg:p-6 xl:px-12">
        {/* Header with Back Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#4f5077]">Edit Course</h1>
            <p className="text-[#7D8592] mt-1">Update martial arts course details</p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/branch-manager-dashboard/courses")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[#7D8592]">Back to Courses</span>
          </Button>
        </div>

        {/* Edit Course Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">

                  <span className="text-[#4f5077]">Course Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="courseTitle" className="text-[#7D8592] ">Course Title *</Label>
                        <Input
                          id="courseTitle"
                          value={formData.courseTitle}
                          onChange={(e) => setFormData({ ...formData, courseTitle: e.target.value })}
                          placeholder="e.g., Advanced Kung Fu Training"
                          className="text-[#7D8592]"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="courseCode" className="text-[#7D8592]">Course Code *</Label>
                        <Input
                          id="courseCode"
                          className="text-[#7D8592]"
                          value={formData.courseCode}
                          onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                          placeholder="e.g., KF-ADV-001"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-[#7D8592]">Course Description *</Label>
                      <Textarea
                        id="description"
                        className="text-[#7D8592]"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Provide a detailed description of the course, what students will learn, and benefits..."
                        rows={4}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="martialArtsStyle" className="text-[#7D8592]">Martial Arts Style *</Label>
                        <Select
                          value={formData.martialArtsStyle}
                          onValueChange={(value) => setFormData({ ...formData, martialArtsStyle: value })}
                          disabled={isLoadingStyles}
                        >
                          <SelectTrigger className="h-10 px-3 w-full text-[#7D8592]">
                            <SelectValue placeholder={isLoadingStyles ? "Loading styles..." : "Select martial arts style"} />
                          </SelectTrigger>
                          <SelectContent>
                            {martialArtsStyles.length > 0 ? (
                              martialArtsStyles.map((style) => (
                                <SelectItem key={style.id} value={style.id} className="text-[#7D8592]">
                                  {style.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-4 text-center text-gray-500">
                                <p className="text-sm">No martial arts styles available</p>
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="difficultyLevel" className="text-[#7D8592]">Difficulty Level *</Label>
                        <Select
                          value={formData.difficultyLevel}
                          onValueChange={(value) => setFormData({ ...formData, difficultyLevel: value })}
                        >
                          <SelectTrigger className="h-10 px-3 w-full text-[#7D8592]">
                            <SelectValue placeholder="Select difficulty level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Beginner" className="text-[#7D8592]">Beginner</SelectItem>
                            <SelectItem value="Intermediate" className="text-[#7D8592]">Intermediate</SelectItem>
                            <SelectItem value="Advanced" className="text-[#7D8592]">Advanced</SelectItem>
                            <SelectItem value="Expert" className="text-[#7D8592]">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-[#7D8592]">Category *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                          disabled={isLoadingCategories}
                        >
                          <SelectTrigger className="h-10 px-3 w-full text-[#7D8592]">
                            <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select category"} />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.length > 0 ? (
                              categories.map((category) => (
                                <SelectItem key={category.id} value={category.id} className="text-[#7D8592]">
                                  {category.name} ({category.course_count} courses)
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-4 text-center text-[#7D8592]">
                                <p>No categories available</p>
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="instructor" className="text-[#7D8592]">Assigned Instructor</Label>
                        <Select
                          value={formData.instructor}
                          onValueChange={(value) => setFormData({ ...formData, instructor: value })}
                          disabled={isLoadingInstructors}
                        >
                          <SelectTrigger className="h-10 px-3 w-full text-[#7D8592]">
                            <SelectValue placeholder={isLoadingInstructors ? "Loading instructors..." : "Select instructor"} />
                          </SelectTrigger>
                          <SelectContent>
                            {instructors.length > 0 ? (
                              instructors.map((instructor) => (
                                <SelectItem key={instructor.id} value={instructor.id} className="text-[#7D8592]">
                                  {instructor.name}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-4 text-center text-[#7D8592]">
                                <p className="text-sm">No instructors available</p>
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Student Requirements */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">

                      <span className="text-[#4f5077]">Student Requirements</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxStudents" className="text-[#7D8592]">Maximum Students</Label>
                        <Input
                          id="maxStudents"
                          className="text-[#7D8592]"
                          type="number"
                          value={formData.maxStudents}
                          onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                          placeholder="e.g., 20"
                          min="1"
                          max="100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minAge" className="text-[#7D8592]">Minimum Age</Label>
                        <Input
                          id="minAge"
                          className="text-[#7D8592]"
                          type="number"
                          value={formData.minAge}
                          onChange={(e) => setFormData({ ...formData, minAge: e.target.value })}
                          placeholder="e.g., 6"
                          min="3"
                          max="99"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxAge" className="text-[#7D8592]">Maximum Age</Label>
                        <Input
                          id="maxAge"
                          className="text-[#7D8592]"
                          type="number"
                          value={formData.maxAge}
                          onChange={(e) => setFormData({ ...formData, maxAge: e.target.value })}
                          placeholder="e.g., 65"
                          min="3"
                          max="99"
                        />
                      </div>
                    </div>

                    {/* Prerequisites */}
                    <div className="space-y-2">
                      <Label className="text-[#7D8592]">Prerequisites</Label>
                      <div className="flex space-x-2">
                        <Input
                          value={newPrerequisite}
                           className="text-[#7D8592]"
                          onChange={(e) => setNewPrerequisite(e.target.value)}
                          placeholder="Add a prerequisite..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                        />
                        <Button type="button" onClick={addPrerequisite} variant="outline" size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      {prerequisites.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {prerequisites.map((prerequisite, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                              <span>{prerequisite}</span>
                              <button
                                type="button"
                                onClick={() => removePrerequisite(index)}
                                className="ml-1 hover:text-red-500 text-[#7D8592]"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#4f5077]">Course Content</h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="syllabus" className="text-[#7D8592]">Course Syllabus</Label>
                        <Textarea
                          id="syllabus"
                          value={formData.syllabus}
                          className="text-[#7D8592]"
                          onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
                          placeholder="Outline the course curriculum, modules, techniques to be taught..."
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="equipmentRequired" className="text-[#7D8592]">Equipment Required</Label>
                        <Textarea
                          id="equipmentRequired"
                          value={formData.equipmentRequired}
                          className="text-[#7D8592]"
                          onChange={(e) => setFormData({ ...formData, equipmentRequired: e.target.value })}
                          placeholder="List any equipment students need to bring or purchase..."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Media and Resources */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#4f5077]">Media & Resources</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="imageUrl" className="text-[#7D8592]">Course Image URL</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="imageUrl"
                            className="text-[#7D8592]"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            placeholder="https://example.com/course-image.jpg"
                          />
                          <Button type="button" variant="outline" size="sm">
                            <Upload className="w-4 h-4 text-[#7D8592]" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="videoUrl" className="text-[#7D8592]">Promotional Video URL</Label>
                        <Input
                          id="videoUrl"
                          className="text-[#7D8592]"
                          value={formData.videoUrl}
                          onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t">
                    <div className="flex space-x-4">
                      <Button
                        type="submit"
                        className="bg-yellow-400 hover:bg-yellow-500 text-[#fff] text-sm px-8"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Updating Course...
                          </>
                        ) : (
                          'Update Course'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="text-[#4f5077]"
                        onClick={() => router.push("/branch-manager-dashboard/courses")}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#4f5077]">Pricing & Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-[#7D8592]">Course Price *</Label>
                  <div className="flex space-x-2">
                    <Select
                      value={formData.currency}
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger className="w-20 text-[#7D8592]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR" className="text-[#7D8592]">INR</SelectItem>
                        <SelectItem value="USD" className="text-[#7D8592]">USD</SelectItem>
                        <SelectItem value="EUR" className="text-[#7D8592]">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="8500"
                      className="flex-1"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="branchSpecificPricing" className="text-[#7D8592]">Branch-specific pricing</Label>
                  <Switch
                    id="branchSpecificPricing"
                    checked={formData.branchSpecificPricing}
                    onCheckedChange={(checked) => setFormData({ ...formData, branchSpecificPricing: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="certificationOffered" className="text-[#7D8592]">Offers Certification</Label>
                  <Switch
                    id="certificationOffered"
                    checked={formData.certificationOffered}
                    onCheckedChange={(checked) => setFormData({ ...formData, certificationOffered: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive" className="text-[#7D8592]">Course Active</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Course Statistics Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#4f5077]">Course Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7D8592]">Max Students:</span>
                    <span className="font-medium text-[#7D8592]">{formData.maxStudents || '—'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7D8592]">Age Range:</span>
                    <span className="font-medium text-[#7D8592]">
                      {formData.minAge || '—'} - {formData.maxAge || '—'} years
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7D8592]">Price:</span>
                    <span className="font-medium text-[#7D8592]">
                      {formData.currency} {formData.price || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7D8592]">Prerequisites:</span>
                    <span className="font-medium text-[#7D8592]">{prerequisites.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#7D8592]">Status:</span>
                    <Badge variant={formData.isActive ? "default" : "secondary"}>
                      {formData.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Updated!</h3>
                <p className="text-gray-600 mb-4">The course has been successfully updated.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
