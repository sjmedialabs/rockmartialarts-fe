"use client"

import type React from "react"
import { getBackendApiUrl } from "@/lib/config"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRegistration } from "@/contexts/RegistrationContext"
import { useCMS } from "@/contexts/CMSContext"
import { toast } from "@/components/ui/use-toast"

interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  difficulty_level: string;
  category_id?: string;
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
}

interface DurationOption {
  id: string;
  name: string;
  duration_months: number;
  pricing_multiplier: number;
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
  const { cms } = useCMS()
  const branchId = registrationData.branch_id

  const [formData, setFormData] = useState({
    category_id: registrationData.category_id || "",
    course_id: registrationData.course_id || "",
    duration: registrationData.duration || "",
  })
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [branchCourses, setBranchCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [masterDurations, setMasterDurations] = useState<DurationOption[] | null>(null)
  const [isLoadingDurations, setIsLoadingDurations] = useState(false)

  // Require branch to be selected first
  useEffect(() => {
    if (!branchId) {
      router.replace("/register/select-branch")
      return
    }
  }, [branchId, router])

  // Fetch categories and courses for the selected branch
  useEffect(() => {
    if (!branchId) return

    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const [catRes, coursesRes] = await Promise.all([
          fetch(getBackendApiUrl("categories/public/details?active_only=true")),
          fetch(`/api/courses/by-branch/${encodeURIComponent(branchId)}`),
        ])

        if (!catRes.ok) throw new Error("Failed to load categories")
        const catData = await catRes.json()
        const categoriesList = catData.categories || []
        setAllCategories(categoriesList)

        if (!coursesRes.ok) throw new Error("Failed to load courses for this branch")
        const coursesData = await coursesRes.json()
        const coursesList = coursesData.courses || []
        setBranchCourses(coursesList)
      } catch (err) {
        console.error("Error loading data:", err)
        setError("Failed to load courses. Please try again later.")
        toast({
          title: "Error",
          description: "Failed to load courses for this branch.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [branchId])

  // If courses don't include available_durations, fetch master durations as fallback for tenure options
  useEffect(() => {
    if (!branchId) return
    if (branchCourses.length === 0) return

    const coursesHaveDurations = branchCourses.some(
      (c) => Array.isArray(c.available_durations) && c.available_durations.length > 0
    )
    if (coursesHaveDurations || masterDurations) return

    const loadDurations = async () => {
      try {
        setIsLoadingDurations(true)
        const res = await fetch(getBackendApiUrl("durations/public/all"))
        if (!res.ok) return
        const data = await res.json()
        const list = Array.isArray(data.durations) ? data.durations : []
        const mapped: DurationOption[] = list.map((d: any) => ({
          id: d.id,
          name: d.name || d.code || "",
          duration_months: d.duration_months ?? 1,
          pricing_multiplier: d.pricing_multiplier ?? 1.0,
        }))
        if (mapped.length > 0) {
          setMasterDurations(mapped)
        }
      } catch {
        // ignore, we'll just show "No tenure options available"
      } finally {
        setIsLoadingDurations(false)
      }
    }

    loadDurations()
  }, [branchId, branchCourses, masterDurations])

  // Categories that have at least one course at this branch (don't show 0-course categories).
  // If no category mapping exists but we have courses, fall back to a single "All Courses" option.
  const categoryIdsWithCourses = Array.from(
    new Set(branchCourses.map((c) => c.category_id).filter(Boolean))
  ) as string[]
  const categoriesWithBranchCourses = allCategories.filter((cat) =>
    categoryIdsWithCourses.includes(cat.id)
  )
  const hasRealCategories = categoriesWithBranchCourses.length > 0
  const effectiveCategories: Category[] =
    hasRealCategories || branchCourses.length === 0
      ? categoriesWithBranchCourses
      : [
          {
            id: "all",
            name: "All Courses",
            code: "all",
            description: "All courses available at this branch",
            icon_url: null,
            color_code: "#000000",
            course_count: branchCourses.length,
            subcategories: [],
          },
        ]

  // For each category, count of courses at this branch
  const courseCountByCategoryId: Record<string, number> = {}
  branchCourses.forEach((c) => {
    if (c.category_id) {
      courseCountByCategoryId[c.category_id] = (courseCountByCategoryId[c.category_id] || 0) + 1
    }
  })

  // Courses for the selected category (filter from branch courses, no extra fetch)
  const courses =
    !formData.category_id || formData.category_id === "all"
      ? branchCourses
      : branchCourses.filter((c) => c.category_id === formData.category_id)

  const selectedCategory = effectiveCategories.find((cat) => cat.id === formData.category_id)
  const selectedCourse = courses.find((course) => course.id === formData.course_id)
  const durationOptions: DurationOption[] =
    (selectedCourse?.available_durations as DurationOption[] | undefined)?.length
      ? (selectedCourse.available_durations as unknown as DurationOption[])
      : masterDurations || []

  // If we have courses but no category selected, default to "all" so user can pick a course.
  useEffect(() => {
    if (!branchId) return
    if (branchCourses.length > 0 && !formData.category_id && effectiveCategories.length > 0) {
      const first = effectiveCategories[0]
      setFormData((prev) => ({ ...prev, category_id: first.id }))
    }
  }, [branchId, branchCourses, effectiveCategories, formData.category_id])

  // If selected course is not in branch courses (e.g. navigated back), clear course and duration
  useEffect(() => {
    if (!formData.course_id || branchCourses.length === 0) return
    const branchCourseIds = new Set(branchCourses.map((c) => c.id))
    if (!branchCourseIds.has(formData.course_id)) {
      setFormData((prev) => ({ ...prev, course_id: "", duration: "" }))
    }
  }, [branchCourses, formData.course_id])

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    // Category is optional when we only have \"All Courses\"
    if (!formData.category_id && effectiveCategories.length > 0) {
      newErrors.category_id = "Please select a category"
    }
    if (!formData.course_id) {
      newErrors.course_id = "Please select a course"
    }
    if (!formData.duration) {
      newErrors.duration = "Please select a tenure"
    }
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors)
      return
    }
    setFieldErrors({})
    
    // Get selected duration details
    const selectedDuration = durationOptions.find(d => d.id === formData.duration)

    // Update registration context with course data including pricing
    updateRegistrationData({
      category_id: formData.category_id,
      course_id: formData.course_id,
      duration: formData.duration,
      duration_name: selectedDuration?.name || "",
      duration_months: selectedDuration?.duration_months || 1,
      course_name: selectedCourse?.title || "",
      category_name: selectedCategory?.name || "",
      course_price: selectedCourse?.pricing?.amount || 0,
      course_currency: selectedCourse?.pricing?.currency || "INR",
    })
    router.push("/register/payment")
  }

  const handleSelectChange = (field: string, value: string) => {
    // Clear error for this field
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
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

  const registrationMediaUrl = cms?.homepage?.registration_media_url
  const registrationMediaType = cms?.homepage?.registration_media_type || "auto"

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-200 items-center justify-center relative overflow-hidden">
        <div className="w-[550px] h-[550px] bg-cover bg-center bg-no-repeat overflow-hidden rounded-xl">
          {registrationMediaUrl ? (
            registrationMediaType === "video" || /\.(mp4|webm)$/i.test(registrationMediaUrl) ? (
              <video
                src={registrationMediaUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={registrationMediaUrl}
                alt="Registration"
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: "url('/images/select-course-left.png')" }}
            />
          )}
        </div>
      </div>

      {/* Right Side - Course Selection Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
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
            {/* Select Category - only categories that have courses at this branch (or All Courses fallback) */}
            <div>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleSelectChange("category_id", value)}
                disabled={isLoading || effectiveCategories.length === 0}
              >
                <SelectTrigger className={`w-full !h-[60px] pl-6 pr-10 bg-[#F9F8FF] rounded-xl border-0 py-6 text-[16px] data-[placeholder]:text-black ${fieldErrors.category_id ? '!border !border-red-500' : ''}`}>
                  <SelectValue
                    placeholder={
                      isLoading
                        ? "Loading..."
                        : effectiveCategories.length === 0
                          ? "No courses available at this branch"
                          : "Select a category"
                    }
                    className="!placeholder:text-[#000]"
                  />
                </SelectTrigger>
                <SelectContent>
                  {effectiveCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} (
                      {category.id === "all"
                        ? branchCourses.length
                        : courseCountByCategoryId[category.id] ?? 0}{" "}
                      course
                      {(category.id === "all"
                        ? branchCourses.length
                        : courseCountByCategoryId[category.id] ?? 0) !== 1
                        ? "s"
                        : ""}
                      )
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.category_id && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.category_id}</p>}
            </div>

            {/* Choose Course - only courses at this branch for selected category */}
            <div>
              <Select
                value={formData.course_id}
                onValueChange={(value) => handleSelectChange("course_id", value)}
                disabled={branchCourses.length === 0}
              >
                <SelectTrigger className={`w-full !h-[60px] pl-6 pr-10 bg-[#F9F8FF] rounded-xl border-0 py-6 text-[10px] data-[placeholder]:text-black data-[placeholder]:text-[16px] ${fieldErrors.course_id ? '!border !border-red-500' : ''}`}>
                  <SelectValue
                    placeholder={
                      branchCourses.length === 0
                        ? "No courses available"
                        : "Select a course"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {courses.length === 0 && formData.category_id ? (
                    <div className="p-4 text-center text-gray-500">
                      <p>No courses available for this category at this branch</p>
                    </div>
                  ) : (
                    courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{course.title}</span>
                          <span className="text-xs text-gray-500">{course.code} • {course.difficulty_level}</span>
                          <span className="text-[14px] font-semibold mt-1">
                            {course.pricing?.currency ?? "INR"} {course.pricing?.amount ?? 0}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {fieldErrors.course_id && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.course_id}</p>}
            </div>

            {/* Select Tenure */}
            <div>
              <Select
                value={formData.duration}
                onValueChange={(value) => handleSelectChange("duration", value)}
                disabled={!formData.course_id || durationOptions.length === 0}
              >
                <SelectTrigger className={`w-full !h-[60px] pl-6 pr-10 bg-[#F9F8FF] rounded-xl border-0 py-6 text-[16px] data-[placeholder]:text-black ${fieldErrors.duration ? '!border !border-red-500' : ''}`}>
                  <SelectValue 
                    placeholder={!formData.course_id ? "Select a course first" : durationOptions.length === 0 ? "No tenure options available" : "Select tenure"} 
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
              {fieldErrors.duration && <p className="text-red-500 text-xs mt-1 ml-1">{fieldErrors.duration}</p>}
            </div>

            {/* Next Step Button */}
            <Button 
              type="submit" 
             className="w-full bg-yellow-400 hover:bg-yellow-500 text-[#ffffff] font-bold py-4 px-6 rounded-xl text-[12px] h-14 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl mt-8"
              disabled={!formData.category_id || !formData.course_id || !formData.duration}
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
              <Link href="/register/select-branch" className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-green-600 transition-colors">2</Link>
              <div className="w-8 h-1 bg-green-500 rounded"></div>
              <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-sm">3</div>
              <div className="w-8 h-1 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm">4</div>
              <div className="w-8 h-1 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm">5</div>
            </div>
            <span className="text-gray-500 text-sm font-medium">Step 3 of 5 - Course Selection</span>
          </div>

      </div>
        </div>
    </div>
  )
}
