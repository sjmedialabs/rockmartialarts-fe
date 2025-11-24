"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRegistration } from "@/contexts/RegistrationContext"
import { toast } from "@/components/ui/use-toast"

interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  difficulty_level: string;
  pricing: {
    currency: string;
    amount: number;
  };
  available_durations: Array<{
    id: string;
    name: string;
    code: string;
    duration_months: number;
    pricing_multiplier: number;
  }>;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  code: string;
  description: string;
  icon_url: string | null;
  color_code: string;
  course_count: number;
  subcategories: Array<{
    id: string;
    name: string;
    code: string;
    course_count: number;
  }>;
}

export default function SelectCoursePage() {
  const router = useRouter()
  const { registrationData, updateRegistrationData } = useRegistration()
  
  const [formData, setFormData] = useState({
    category_id: registrationData.category_id || "",
    course_id: registrationData.course_id || "",
    duration: registrationData.duration || "",
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [courses, setCourses] = useState<Course[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(false)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('http://31.97.224.169:8003/api/categories/public/details?active_only=true')
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }
        
        const data = await response.json()
        setCategories(data.categories || [])
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError('Failed to load categories. Please try again later.')
        toast({
          title: "Error",
          description: "Failed to load categories. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Fetch courses when category is selected
  useEffect(() => {
    const fetchCourses = async () => {
      if (!formData.category_id) return

      try {
        setIsLoadingCourses(true)
        setError(null) // Clear any previous errors

        const response = await fetch(`http://31.97.224.169:8003/api/courses/public/by-category/${formData.category_id}?active_only=true`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        const coursesData = data.courses || []
        setCourses(coursesData)

        // Log for debugging
        console.log(`Fetched ${coursesData.length} courses for category ${formData.category_id}`)

      } catch (err) {
        console.error('Error fetching courses:', err)
        setError('Failed to load courses. Please check your connection and try again.')
        setCourses([]) // Clear courses on error
        toast({
          title: "Error",
          description: "Failed to load courses. Please check your connection and try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingCourses(false)
      }
    }

    if (formData.category_id) {
      fetchCourses()
    } else {
      setCourses([])
      setFormData(prev => ({ ...prev, course_id: '', duration: '' }))
    }
  }, [formData.category_id])

  // Get selected category and course
  const selectedCategory = categories.find(cat => cat.id === formData.category_id)
  const selectedCourse = courses.find(course => course.id === formData.course_id)
  
  // Get duration options for selected course
  const durationOptions = selectedCourse?.available_durations || []

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.category_id || !formData.course_id ) {
      toast({
        title: "Incomplete Selection",
        description: "Please select a category, course, and duration",
        variant: "destructive",
      })
      return
    }
    
    // Update registration context with course data
    updateRegistrationData({
      category_id: formData.category_id,
      course_id: formData.course_id,
      duration: formData.duration,
      course_name: selectedCourse?.title || "",
      category_name: selectedCategory?.name || "",
    })
    router.push("/register/select-branch")
  }

  const handleSelectChange = (field: string, value: string) => {
    if (field === 'category_id') {
      // Reset course and duration when category changes
      setFormData(prev => ({
        ...prev,
        category_id: value,
        course_id: "",
        duration: ""
      }))
    } else if (field === 'course_id') {
      // Reset duration when course changes
      setFormData(prev => ({
        ...prev,
        course_id: value,
        duration: ""
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-200 items-center justify-center relative overflow-hidden">
        <div
          className="w-[550px] h-[550px] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/select-course-left.png')",
          }}
        />
      </div>

      {/* Right Side - Course Selection Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white mt-[100px]">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-black">Select Course</h1>
            <p className="text-gray-500 text-sm">Please login to continue to your account.</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : (
          <form onSubmit={handleNextStep} className="space-y-4">
            {/* Select Category */}
            <div className="relative">
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleSelectChange("category_id", value)}
                disabled={isLoading || categories.length === 0}
              >
                <SelectTrigger className="w-full !h-[60px] pl-6 pr-10 bg-[#F9F8FF] rounded-xl border-0 py-6 text-[16px] data-[placeholder]:text-black">
                  <SelectValue placeholder={isLoading ? "Loading categories..." : "Select a category"} className="!placeholder:text-[#000]"  />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} ({category.course_count} courses)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Choose Course */}
            <div className="relative">
              <Select
                value={formData.course_id}
                onValueChange={(value) => handleSelectChange("course_id", value)}
                disabled={!formData.category_id || isLoadingCourses}
              >
                <SelectTrigger className="w-full !h-[60px] pl-6 pr-10 bg-[#F9F8FF] rounded-xl border-0 py-6 text-[10px] data-[placeholder]:text-black data-[placeholder]:text-[16px]">
                  <SelectValue 
                    placeholder={
                    isLoadingCourses 
                    ? "Loading courses..." 
                    : !formData.category_id 
                      ? "Select a category first" 
                      : courses.length === 0 
                        ? "No courses available" 
                        : "Select a course"
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  {courses.length === 0 && formData.category_id && !isLoadingCourses ? (
                    <div className="p-4 text-center text-gray-500">
                      <p>No courses available for this category</p>
                      <p className="text-xs mt-1">Please select a different category</p>
                    </div>
                  ) : (
                    courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{course.title}</span>
                          <span className="text-xs text-gray-500">{course.code} • {course.difficulty_level}</span>
                          <span className="text-[14px] font-semibold mt-1">
                            {course.pricing.currency} {course.pricing.amount}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Select Duration */}
            {/* TEMPORARILY HIDDEN - Duration will be pre-filled from course data
            <div className="relative">
              <Select
                value={formData.duration}
                onValueChange={(value) => handleSelectChange("duration", value)}
                disabled={!formData.course_id || durationOptions.length === 0}
              >
                <SelectTrigger className="w-full !h-[60px] pl-6 pr-10 bg-[#F9F8FF] rounded-xl border-0 py-6 text-[16px] data-[placeholder]:text-black">
                  <SelectValue 
                    placeholder={!formData.course_id ? "Select a course first" : durationOptions.length === 0 ? "No duration options available" : "Select duration"} 
                  />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((duration) => (
                    <SelectItem key={duration.id} value={duration.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{duration.name}</span>
                        <span className="text-xs text-gray-500">
                          {duration.duration_months} months • {duration.pricing_multiplier}x pricing
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            */}

            {/* Next Step Button */}
            <Button 
              type="submit" 
             className="w-full bg-yellow-400 hover:bg-yellow-500 text-[#ffffff] font-bold py-4 px-6 rounded-xl text-[12px] h-14 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl mt-8"
              disabled={!formData.category_id || !formData.course_id }
            >
              NEXT STEP
            </Button>
          </form>
          )}

          {/* Step Indicator */}
          <div className="text-center py-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Link href="/register" className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-green-600 transition-colors">1</Link>
              <div className="w-8 h-1 bg-green-500 rounded"></div>
              <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-sm">2</div>
              <div className="w-8 h-1 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm">3</div>
              <div className="w-8 h-1 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm">4</div>
              <div className="w-8 h-1 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm">5</div>
            </div>
            <span className="text-gray-500 text-sm font-medium">Step 2 of 5 - Course Selection</span>
          </div>

      </div>
        </div>
    </div>
  )
}
