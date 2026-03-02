"use client"

import type React from "react"

import { getBackendApiUrl } from "@/lib/config"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, Plus, X, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import DashboardHeader from "@/components/dashboard-header"
import { TokenManager } from "@/lib/tokenManager"

export default function EditCoursePage() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const { toast } = useToast()
  const { user } = useAuth()
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // State
  const [categories, setCategories] = useState<any[]>([])
  const [allCategories, setAllCategories] = useState<any[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [prerequisites, setPrerequisites] = useState<string[]>([])
  const [newPrerequisite, setNewPrerequisite] = useState("")
  const [subCategories, setSubCategories] = useState<any[]>([])
  const [modules, setModules] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [difficultyLevels, setDifficultyLevels] = useState<any[]>([])
  const [courseDurations, setCourseDurations] = useState<any[]>([])
  const [loadingBranches, setLoadingBranches] = useState(false)
  const [branchPrices, setBranchPrices] = useState<any[]>([])
  const [addedTenures, setAddedTenures] = useState<string[]>([])
  const [addedBranchTenures, setAddedBranchTenures] = useState<Record<number, string[]>>({})
  /** Master durations from API: id, name, code, duration_months, display_order */
  type MasterDuration = { id: string; name: string; code: string; duration_months: number; display_order: number }
  const [masterDurations, setMasterDurations] = useState<MasterDuration[]>([])
  /** Fee amount per duration id (used when tenures are duration ids from master data) */
  const [feeByDurationId, setFeeByDurationId] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    courseTitle: "",
    courseCode: "",
    description: "",
    category: "",
    subCategory: "",
    difficultyLevel: "",
    duration: "",
    maxStudents: "",
    minAge: "",
    maxAge: "",
    price: "",
    currency: "INR",
    fee_1_month: "",
    fee_3_months: "",
    fee_6_months: "",
    fee_1_year: "",
    branchSpecificPricing: false,
    equipmentRequired: "",
    syllabus: "",
    imageUrl: "",
    videoUrl: "",
    tags: [] as string[]
  })

  /** Selected course duration (from master data); used to limit add-tenure options to <= this duration. */
  const selectedCourseDuration = masterDurations.find((d) => d.id === formData.duration)
  /** Tenure options = same as course duration master data. Allowed = those with duration_months <= selected course duration. */
  const allowedTenureOptions = masterDurations
    .filter((d) => selectedCourseDuration && d.duration_months <= selectedCourseDuration.duration_months)
    .sort((a, b) => a.display_order - b.display_order)
  const allowedTenureIds = new Set(allowedTenureOptions.map((d) => d.id))

  // Fetch categories on mount
  // Fetch categories on mount
  useEffect(() => {
    // Fetch existing course data
    const fetchCourseData = async () => {
      try {
        const token = TokenManager.getToken()
        if (!token) {
          toast({
            title: "Authentication Error",
            description: "Please login to continue",
            variant: "destructive",
          })
          router.push('/login')
          return
        }

        const response = await fetch(getBackendApiUrl(`courses/${courseId}`), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch course data')
        }

        const course = await response.json()
        const feePerDuration = course.fee_per_duration || {}
        const pricing = course.pricing || {}
        const branchPricingRaw = course.branch_pricing || {}
        const branchPricesList: { branch_id: string; fee_per_duration: Record<string, string> }[] = []
        const branchTenures: Record<number, string[]> = {}
        Object.keys(branchPricingRaw).forEach((branchId, idx) => {
          const val = branchPricingRaw[branchId]
          if (typeof val === "object" && val !== null) {
            const feePerDur: Record<string, string> = {}
            Object.keys(val).forEach((k) => { if (val[k] != null) feePerDur[k] = String(val[k]) })
            const keys = Object.keys(feePerDur)
            branchTenures[idx] = keys
            branchPricesList.push({ branch_id: branchId, fee_per_duration: feePerDur })
          } else if (typeof val === "number") {
            branchTenures[idx] = []
            branchPricesList.push({ branch_id: branchId, fee_per_duration: {} })
          }
        })
        setBranchPrices(branchPricesList)
        setAddedBranchTenures(branchTenures)
        const defaultAdded = Object.keys(feePerDuration).filter((k) => feePerDuration[k] != null)
        const feeByDur: Record<string, string> = {}
        defaultAdded.forEach((k) => { feeByDur[k] = String(feePerDuration[k]) })
        if (defaultAdded.length === 0 && (pricing?.amount != null || course.base_fee != null)) {
          const firstKey = Object.keys(feePerDuration)[0] || "1-month"
          defaultAdded.push(firstKey)
          if (feePerDuration[firstKey] != null) feeByDur[firstKey] = String(feePerDuration[firstKey])
        }
        setAddedTenures(defaultAdded)
        setFeeByDurationId(feeByDur)
        const durationRaw = course.duration?.toString() || ""
        setFormData({
          courseTitle: course.title || course.course_name || "",
          courseCode: course.code || "",
          description: course.description || "",
          category: course.category_id || course.category || "",
          subCategory: course.sub_category || "",
          difficultyLevel: course.difficulty_level || course.difficultyLevel || "",
          duration: durationRaw,
          maxStudents: course.max_students?.toString() || course.student_requirements?.max_students?.toString() || "",
          minAge: course.min_age?.toString() || course.student_requirements?.min_age?.toString() || "",
          maxAge: course.max_age?.toString() || course.student_requirements?.max_age?.toString() || "",
          price: pricing.amount?.toString() || course.base_fee?.toString() || feePerDuration["1-month"]?.toString() || Object.values(feePerDuration)[0]?.toString() || "",
          currency: pricing.currency || "INR",
          fee_1_month: "",
          fee_3_months: "",
          fee_6_months: "",
          fee_1_year: "",
          branchSpecificPricing: pricing.branch_specific_pricing ?? false,
          equipmentRequired: course.equipment_required || course.course_content?.equipment_required?.join?.(', ') || "",
          syllabus: course.syllabus || course.course_content?.syllabus || "",
          imageUrl: course.imageUrl || course.media_resources?.course_image_url || "",
          videoUrl: course.videoUrl || course.media_resources?.promo_video_url || "",
          tags: course.tags || [],
        })
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching course:', error)
        toast({
          title: "Error",
          description: "Failed to load course data",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchCourseData()

    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true)
        const token = TokenManager.getToken()
        const response = await fetch(getBackendApiUrl('categories?active_only=true'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }

        const data = await response.json()
        const validCategories = (data.categories || []).filter((category: any) =>
          category && category.id && category.id.trim() !== ''
        )
        
        // Store all categories for subcategory filtering
        setAllCategories(validCategories)
        
        // Store only parent categories for the dropdown
        const parentCategories = validCategories.filter((cat: any) => !cat.parent_category_id)
        const uniqueParents = Array.from(new Map(parentCategories.map((cat: any) => [cat.id, cat])).values())
        setCategories(uniqueParents)
      } catch (error) {
        console.error('Error fetching categories:', error)
        const defaults = [
          { id: 'default-category-1', name: 'General Martial Arts', course_count: 0 },
          { id: 'default-category-2', name: 'Self Defense', course_count: 0 },
          { id: 'default-category-3', name: 'Fitness & Training', course_count: 0 }
        ]
        setCategories(defaults)
        setAllCategories(defaults)
        toast({
          title: "Warning",
          description: "Failed to load categories. Using default options.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [toast])

  // Fetch difficulty levels from master data
  useEffect(() => {
    const fetchDifficultyLevels = async () => {
      try {
        const token = TokenManager.getToken()
        const response = await fetch(getBackendApiUrl('dropdown-settings/difficulty_levels'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          // data is an array of {value, label, is_active, order}
          const activeLevels = data.filter((level: any) => level.is_active)
          setDifficultyLevels(activeLevels)
        } else {
          // Fallback to default difficulty levels
          setDifficultyLevels([
            { value: 'Beginner', label: 'Beginner', is_active: true },
            { value: 'Intermediate', label: 'Intermediate', is_active: true },
            { value: 'Advanced', label: 'Advanced', is_active: true },
            { value: 'Expert', label: 'Expert', is_active: true }
          ])
        }
      } catch (error) {
        console.error('Error fetching difficulty levels:', error)
        // Fallback to default difficulty levels
        setDifficultyLevels([
          { value: 'Beginner', label: 'Beginner', is_active: true },
          { value: 'Intermediate', label: 'Intermediate', is_active: true },
          { value: 'Advanced', label: 'Advanced', is_active: true },
          { value: 'Expert', label: 'Expert', is_active: true }
        ])
      }
    }

    fetchDifficultyLevels()
  }, [toast])

  const FALLBACK_DURATIONS: MasterDuration[] = [
    { id: '1m', name: '1 month', code: '1M', duration_months: 1, display_order: 1 },
    { id: '2m', name: '2 months', code: '2M', duration_months: 2, display_order: 2 },
    { id: '3m', name: '3 months', code: '3M', duration_months: 3, display_order: 3 },
    { id: '6m', name: '6 months', code: '6M', duration_months: 6, display_order: 4 },
    { id: '1y', name: '1 year', code: '1Y', duration_months: 12, display_order: 5 },
    { id: '2y', name: '2 years', code: '2Y', duration_months: 24, display_order: 6 }
  ]

  // Fetch course durations from master data (same source as Super Admin Master Data)
  useEffect(() => {
    const fetchDurations = async () => {
      try {
        const token = TokenManager.getToken()
        const response = await fetch(getBackendApiUrl('durations'), {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        let list: MasterDuration[] = []
        if (response.ok) {
          const data = await response.json()
          const raw = (data.durations || []).filter((d: any) => d.is_active !== false)
          list = raw.map((d: any) => ({
            id: String(d.id),
            name: String(d.name || d.label || ''),
            code: String(d.code || ''),
            duration_months: typeof d.duration_months === 'number' ? d.duration_months : parseInt(String(d.duration_months), 10) || 1,
            display_order: typeof d.display_order === 'number' ? d.display_order : parseInt(String(d.display_order), 10) || 0
          })).filter((d: MasterDuration) => d.id && d.name)
        }
        if (list.length === 0) list = FALLBACK_DURATIONS
        setMasterDurations(list)
        setCourseDurations(list.map((d) => ({ value: d.id, label: d.name })))
      } catch (error) {
        console.error('Error fetching durations:', error)
        setMasterDurations(FALLBACK_DURATIONS)
        setCourseDurations(FALLBACK_DURATIONS.map((d) => ({ value: d.id, label: d.name })))
      }
    }
    fetchDurations()
  }, [])
  // Fetch subcategories when category changes
  useEffect(() => {
    if (!formData.category) {
      setSubCategories([])
      return
    }

    // Filter from allCategories instead of making another API call
    const subs = allCategories.filter((cat: any) => 
      cat.parent_category_id === formData.category
    )
    setSubCategories(subs)
  }, [formData.category, allCategories])


  // Auto-generate course code from title
  useEffect(() => {
    if (formData.courseTitle) {
      const generatedCode = formData.courseTitle
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, "")
        .replace(/\s+/g, "_")
      setFormData(prev => ({ ...prev, courseCode: generatedCode }))
    }
  }, [formData.courseTitle])

  // When course duration changes, restrict added tenures to those allowed (duration_months <= selected) and clear removed fee values
  useEffect(() => {
    if (allowedTenureIds.size === 0) return
    setAddedTenures((prev) => {
      const next = prev.filter((id) => allowedTenureIds.has(id))
      return next.length === prev.length ? prev : next
    })
    setFeeByDurationId((prev) => {
      const next = { ...prev }
      let changed = false
      Object.keys(next).forEach((id) => {
        if (!allowedTenureIds.has(id)) {
          delete next[id]
          changed = true
        }
      })
      return changed ? next : prev
    })
    setAddedBranchTenures((prev) => {
      let changed = false
      const next = { ...prev }
      Object.keys(next).forEach((idx) => {
        const i = parseInt(idx, 10)
        const filtered = next[i].filter((id) => allowedTenureIds.has(id))
        if (filtered.length !== next[i].length) {
          next[i] = filtered
          changed = true
        }
      })
      return changed ? next : prev
    })
    setBranchPrices((prev) =>
      prev.map((bp) => {
        const copy = { ...(bp as any), fee_per_duration: { ...(bp as any).fee_per_duration } }
        if (copy.fee_per_duration)
          Object.keys(copy.fee_per_duration).forEach((id) => {
            if (!allowedTenureIds.has(id)) delete copy.fee_per_duration[id]
          })
        return copy
      })
    )
  }, [formData.duration, allowedTenureIds.size])

  // When master durations load: resolve duration by name to id, and migrate legacy tenure keys to duration ids
  useEffect(() => {
    if (masterDurations.length === 0) return
    const legacyToMonths: Record<string, number> = { "1-month": 1, "2-months": 2, "3-months": 3, "6-months": 6, "1-year": 12, "2-years": 24 }
    const isLegacyKey = (k: string) => legacyToMonths.hasOwnProperty(k)
    const legacyToId = (k: string): string | null => {
      const months = legacyToMonths[k]
      if (months == null) return null
      const d = masterDurations.find((m) => m.duration_months === months)
      return d?.id ?? null
    }
    setFormData((prev) => {
      if (!prev.duration) return prev
      if (masterDurations.some((d) => d.id === prev.duration)) return prev
      const byName = masterDurations.find((d) => d.name?.toLowerCase() === prev.duration?.toLowerCase())
      if (byName) return { ...prev, duration: byName.id }
      const asMonths = parseInt(prev.duration, 10)
      if (!Number.isNaN(asMonths)) {
        const byMonths = masterDurations.find((d) => d.duration_months === asMonths)
        if (byMonths) return { ...prev, duration: byMonths.id }
      }
      return prev
    })
    setFeeByDurationId((prev) => {
      const legacyKeys = Object.keys(prev).filter(isLegacyKey)
      if (legacyKeys.length === 0) return prev
      const next = { ...prev }
      legacyKeys.forEach((k) => {
        const id = legacyToId(k)
        if (id) { next[id] = next[k]; delete next[k] }
      })
      return next
    })
    setAddedTenures((prev) => {
      const migrated = prev.map((k) => (isLegacyKey(k) ? legacyToId(k) ?? k : k))
      return migrated.some((v, i) => v !== prev[i]) ? migrated : prev
    })
    setAddedBranchTenures((prev) => {
      let changed = false
      const next = { ...prev }
      Object.keys(next).forEach((idx) => {
        const i = parseInt(idx, 10)
        const migrated = next[i].map((k) => (isLegacyKey(k) ? legacyToId(k) ?? k : k))
        if (migrated.some((v, j) => v !== next[i][j])) { next[i] = migrated; changed = true }
      })
      return changed ? next : prev
    })
    setBranchPrices((prev) =>
      prev.map((bp) => {
        const fd = (bp as any).fee_per_duration || {}
        const legacyKeys = Object.keys(fd).filter(isLegacyKey)
        if (legacyKeys.length === 0) return bp
        const nextFd = { ...fd }
        legacyKeys.forEach((k) => {
          const id = legacyToId(k)
          if (id) { nextFd[id] = nextFd[k]; delete nextFd[k] }
        })
        return { ...(bp as any), fee_per_duration: nextFd }
      })
    )
  }, [masterDurations.length, formData.duration])

  // Fetch branches on mount
  useEffect(() => {
    const fetchBranches = async () => {
      setLoadingBranches(true)
      try {
        const token = TokenManager.getToken()
        const res = await fetch(getBackendApiUrl('branches?active_only=true'), {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (res.ok) {
          const data = await res.json()
          console.log("Branches API response:", data)
          
          // Handle different response structures
          let branchList = []
          if (Array.isArray(data)) {
            branchList = data
          } else if (data.branches && Array.isArray(data.branches)) {
            branchList = data.branches
          } else if (data.data && Array.isArray(data.data)) {
            branchList = data.data
          }
          
          // Filter only active branches
          const activeBranches = branchList.filter(branch => branch.is_active !== false)
          console.log("Active branches:", activeBranches)
          setBranches(activeBranches)
        }
      } catch (err) {
        console.error("Failed to fetch branches:", err)
      } finally {
        setLoadingBranches(false)
      }
    }

    fetchBranches()
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
      if (!formData.courseTitle || !formData.courseCode || !formData.description) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        })
        setIsSubmitting(false)
        return
      }

      const hasAnyFee = addedTenures.some((id) => {
        const v = feeByDurationId[id]
        return v !== "" && v !== undefined && parseFloat(String(v)) > 0
      })
      if (!hasAnyFee || addedTenures.length === 0) {
        toast({
          title: "Validation Error",
          description: "Add at least one tenure and enter its fee (e.g. Monthly).",
          variant: "destructive"
        })
        setIsSubmitting(false)
        return
      }

      const feePerDurationPayload: Record<string, number> = {}
      addedTenures.forEach((id) => {
        const v = feeByDurationId[id]
        if (v !== "" && v !== undefined) {
          const n = parseFloat(String(v))
          if (!Number.isNaN(n)) feePerDurationPayload[id] = n
        }
      })
      const firstAmount = addedTenures.length > 0 && feeByDurationId[addedTenures[0]] ? parseFloat(String(feeByDurationId[addedTenures[0]])) : 0

      const apiData = {
        title: formData.courseTitle,
        code: formData.courseCode,
        description: formData.description,
        difficulty_level: formData.difficultyLevel,
        duration: formData.duration || undefined,
        // Store parent category and sub-category separately so both persist
        category_id: formData.category,
        sub_category: formData.subCategory || undefined,
        martial_art_style_id: 'style-default',
        instructor_id: user?.id && user.id.includes('instructor-') ? user.id : 'instructor-default',
        student_requirements: {
          max_students: parseInt(formData.maxStudents) || 20,
          min_age: parseInt(formData.minAge) || 6,
          max_age: parseInt(formData.maxAge) || 99,
          prerequisites: prerequisites
        },
        course_content: {
          syllabus: formData.syllabus || "",
          equipment_required: formData.equipmentRequired ? formData.equipmentRequired.split(',').map(item => item.trim()) : []
        },
        media_resources: {
          course_image_url: (formData as any).courseImageUrl || "",
          promo_video_url: (formData as any).promoVideoUrl || ""
        },
        pricing: {
          currency: "INR",
          amount: firstAmount,
          branch_specific_pricing: formData.branchSpecificPricing,
          fee_per_duration: Object.keys(feePerDurationPayload).length > 0 ? feePerDurationPayload : undefined,
          branch_prices: branchPrices
            .map((bp, idx) => ((bp as any).branch_id ? { bp, idx } : null))
            .filter((x): x is { bp: any; idx: number } => x != null)
            .map(({ bp, idx }) => {
              const tenures = addedBranchTenures[idx] || []
              const fd = (bp as any).fee_per_duration || {}
              const entry: any = { branch_id: (bp as any).branch_id, currency: "INR" }
              const feePerDur: Record<string, number> = {}
              tenures.forEach((id) => {
                const v = fd[id]
                if (v !== "" && v !== undefined) {
                  const n = parseFloat(String(v))
                  if (!Number.isNaN(n)) feePerDur[id] = n
                }
              })
              if (Object.keys(feePerDur).length > 0) entry.fee_per_duration = feePerDur
              return entry
            }),
        },
        settings: {
          offers_certification: (formData as any).offersCertification || true,
          active: true
        }
      }
      
      // Add curriculum if modules exist (may be handled separately by API)
      if (modules.length > 0) {
        (apiData as any).curriculum = {
          modules: modules.map(m => ({
            title: m.title,
            description: m.description,
            duration: parseFloat(m.duration) || 0,
            status: m.status,
            resource_url: m.resourceUrl,
            resource_type: m.resourceType
          }))
        }
      }

      const token = TokenManager.getToken()

      if (!token) {
        toast({
          title: "Authentication Error",
          description: "No authentication token available. Please login again.",
          variant: "destructive"
        })
        return
      }

      const response = await fetch(getBackendApiUrl(`courses/${courseId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(apiData)
      })

      const result = await response.json()

      if (!response.ok) {
        // Handle validation errors with detailed messages
        let errorMessage = `Failed to create course (${response.status})`
        
        if (result.detail) {
          if (Array.isArray(result.detail)) {
            // FastAPI validation errors format
            errorMessage = result.detail.map((err: any) => 
              `${err.loc ? err.loc.join('.') : 'Field'}: ${err.msg}`
            ).join(', ')
          } else if (typeof result.detail === 'string') {
            errorMessage = result.detail
          } else if (typeof result.detail === 'object') {
            errorMessage = JSON.stringify(result.detail)
          }
        } else if (result.message) {
          errorMessage = result.message
        }
        
        throw new Error(errorMessage)
      }

      toast({ title: "Success!", description: "Course updated successfully." })

      setShowSuccessPopup(true)

    } catch (error) {
      console.error('Error updating course:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update course. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // File upload handler for module resources
  const handleModuleResourceUpload = async (index: number, file: File) => {
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const token = TokenManager.getToken()
      const response = await fetch(getBackendApiUrl('upload'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      const uploadedUrl = data.file_url || data.url

      // Update module with uploaded URL
      const newModules = [...modules]
      newModules[index].resourceUrl = uploadedUrl
      
      // Auto-detect resource type from file
      if (file.type.startsWith('image/')) {
        newModules[index].resourceType = 'image'
      } else if (file.type === 'application/pdf') {
        newModules[index].resourceType = 'pdf'
      } else if (file.type.startsWith('video/')) {
        newModules[index].resourceType = 'video'
      }
      
      setModules(newModules)

      toast({
        title: "Success",
        description: "File uploaded successfully",
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleSuccessOk = () => {
    setShowSuccessPopup(false)
    router.push("/dashboard/courses")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader currentPage="Edit Course" />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader currentPage="Edit Course" />

      <main className="w-full py-4 px-4 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#4F5077]">Edit Course</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/courses")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[#4F5077]">Back to Courses</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span className="text-[#4F5077]">Course Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-[#7D8592]">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="courseTitle">Course Title *</Label>
                        <Input
                          id="courseTitle"
                          value={formData.courseTitle}
                          onChange={(e) => setFormData({ ...formData, courseTitle: e.target.value })}
                          placeholder="Enter course title"
                          className="placeholder:text-muted-foreground"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="courseCode">Course Code *</Label>
                        <Input
                          id="courseCode"
                          value={formData.courseCode}
                          readOnly
                          className="bg-gray-100"
                          placeholder="Enter course code"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Course Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Enter course description"
                        className="placeholder:text-muted-foreground"
                        rows={4}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => {
                            setFormData({ ...formData, category: value, subCategory: "" })
                            setSubCategories([])
                          }}
                        >
                          <SelectTrigger className="h-10 px-3 w-full">
                            <SelectValue placeholder="Enter category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subCategory">Sub Category</Label>
                        <Select
                          value={formData.subCategory}
                          onValueChange={(value) => setFormData({ ...formData, subCategory: value })}
                          disabled={!formData.category || subCategories.length === 0}
                        >
                          <SelectTrigger className="h-10 px-3 w-full">
                            <SelectValue placeholder="Enter subcategory" />
                          </SelectTrigger>
                          <SelectContent>
                            {subCategories.map((subCat) => (
                              <SelectItem key={subCat.id} value={subCat.id}>{subCat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="difficultyLevel">Difficulty Level *</Label>
                        <Select
                          value={formData.difficultyLevel}
                          onValueChange={(value) => setFormData({ ...formData, difficultyLevel: value })}
                        >
                          <SelectTrigger className="h-10 px-3 w-full">
                            <SelectValue placeholder="Enter difficulty level" />
                          </SelectTrigger>
                          <SelectContent>
                            {difficultyLevels.length > 0 ? (
                              difficultyLevels.map((level) => (
                                <SelectItem key={level.value} value={level.value}>
                                  {level.label}
                                </SelectItem>
                              ))
                            ) : (
                              <>
                                <SelectItem value="Beginner">Beginner</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                <SelectItem value="Advanced">Advanced</SelectItem>
                                <SelectItem value="Expert">Expert</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="duration">Course Duration *</Label>
                        <Select
                          value={formData.duration}
                          onValueChange={(value) => setFormData({ ...formData, duration: value })}
                        >
                          <SelectTrigger className="h-10 px-3 w-full">
                            <SelectValue placeholder="Enter course duration" />
                          </SelectTrigger>
                          <SelectContent>
                            {courseDurations.length > 0 ? (
                              courseDurations.map((duration) => (
                                <SelectItem key={duration.value} value={duration.value}>
                                  {duration.label}
                                </SelectItem>
                              ))
                            ) : (
                              <>
                                <SelectItem value="1_month">1 Month</SelectItem>
                                <SelectItem value="3_months">3 Months</SelectItem>
                                <SelectItem value="6_months">6 Months</SelectItem>
                                <SelectItem value="1_year">1 Year</SelectItem>
                                <SelectItem value="2_years">2 Years</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                    </div>
                  </div>

                  <div className="space-y-4 text-[#7d8592]">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <span className="text-[#4F5077]">Student Requirements</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[#7D8592]">
                      <div className="space-y-2">
                        <Label htmlFor="maxStudents">Maximum Students</Label>
                        <Input
                          id="maxStudents"
                          type="number"
                          value={formData.maxStudents}
                          onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                          placeholder="Enter maximum students"
                          className="placeholder:text-muted-foreground"
                          min="1"
                          max="100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="minAge">Minimum Age</Label>
                        <Input
                          id="minAge"
                          type="number"
                          value={formData.minAge}
                          onChange={(e) => setFormData({ ...formData, minAge: e.target.value })}
                          placeholder="Enter minimum age"
                          className="placeholder:text-muted-foreground"
                          min="3"
                          max="100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="maxAge">Maximum Age</Label>
                        <Input
                          id="maxAge"
                          type="number"
                          value={formData.maxAge}
                          onChange={(e) => setFormData({ ...formData, maxAge: e.target.value })}
                          placeholder="Enter maximum age"
                          className="placeholder:text-muted-foreground"
                          min="3"
                          max="100"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#4F5077]">Prerequisites</Label>
                      <div className="flex space-x-2 text-[#7D8592]">
                        <Input
                          value={newPrerequisite}
                          onChange={(e) => setNewPrerequisite(e.target.value)}
                          placeholder="Enter prerequisite"
                          className="placeholder:text-muted-foreground"
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPrerequisite())}
                        />
                        <Button type="button" onClick={addPrerequisite} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2 text-[#7d8592]">
                        {prerequisites.map((prereq, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                            <span>{prereq}</span>
                            <button
                              type="button"
                              onClick={() => removePrerequisite(index)}
                              className="ml-1 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#4F5077]">Course Content</h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2 text-[#7d8592]">
                        <Label htmlFor="syllabus">Course Syllabus</Label>
                        <Textarea
                          id="syllabus"
                          value={formData.syllabus}
                          onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
                          placeholder="Enter syllabus"
                        className="placeholder:text-muted-foreground"
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="equipmentRequired">Equipment Required</Label>
                        <Textarea
                          id="equipmentRequired"
                          value={formData.equipmentRequired}
                          onChange={(e) => setFormData({ ...formData, equipmentRequired: e.target.value })}
                          placeholder="Enter equipment required"
                        className="placeholder:text-muted-foreground"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#4F5077]">Media & Resources</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="imageUrl">Course Image URL</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="imageUrl"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            placeholder="Enter course image URL"
                            className="placeholder:text-muted-foreground"
                          />
                          <Button type="button" variant="outline" size="sm">
                            <Upload className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="videoUrl">Promotional Video URL</Label>
                        <Input
                          id="videoUrl"
                          value={formData.videoUrl}
                          onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                          placeholder="Enter video URL"
                          className="placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Course Curriculum Section */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-[#4F5077]">Course Curriculum</h3>
                    
                    {modules.map((module, index) => (
                      <Card key={index} className="border-2 border-gray-200">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-md text-[#4F5077]">Module {index + 1}</CardTitle>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newModules = modules.filter((_, i) => i !== index)
                                setModules(newModules)
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor={`module-title-${index}`}>Module Title</Label>
                            <Input
                              id={`module-title-${index}`}
                              value={module.title || ""}
                              onChange={(e) => {
                                const newModules = [...modules]
                                newModules[index].title = e.target.value
                                setModules(newModules)
                              }}
                              placeholder="Enter module title"
                              className="placeholder:text-muted-foreground"
                              className="h-10 px-3"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`module-description-${index}`}>Module Description</Label>
                            <Textarea
                              id={`module-description-${index}`}
                              value={module.description || ""}
                              onChange={(e) => {
                                const newModules = [...modules]
                                newModules[index].description = e.target.value
                                setModules(newModules)
                              }}
                              placeholder="Enter module description"
                              className="placeholder:text-muted-foreground"
                              className="min-h-[80px] resize-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor={`module-duration-${index}`}>Duration (hours)</Label>
                              <Input
                                id={`module-duration-${index}`}
                                type="number"
                                value={module.duration || ""}
                                onChange={(e) => {
                                  const newModules = [...modules]
                                  newModules[index].duration = e.target.value
                                  setModules(newModules)
                                }}
                                placeholder="Enter duration"
                                className="placeholder:text-muted-foreground"
                                className="h-10 px-3"
                                min="0"
                                step="0.5"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`module-status-${index}`}>Status</Label>
                              <Select
                                value={module.status || "in_progress"}
                                onValueChange={(value) => {
                                  const newModules = [...modules]
                                  newModules[index].status = value
                                  setModules(newModules)
                                }}
                              >
                                <SelectTrigger className="h-10 px-3">
                                  <SelectValue placeholder="Enter status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`module-resource-${index}`}>Resource Upload</Label>
                            <div className="flex gap-2">
                              <Input
                                id={`module-resource-${index}`}
                                value={module.resourceUrl || ""}
                                onChange={(e) => {
                                  const newModules = [...modules]
                                  newModules[index].resourceUrl = e.target.value
                                  setModules(newModules)
                                }}
                                placeholder="Enter resource URL"
                                className="placeholder:text-muted-foreground"
                                className="h-10 px-3 flex-1"
                              />
                              <input
                                type="file"
                                id={`module-file-${index}`}
                                accept="image/*,application/pdf,video/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    handleModuleResourceUpload(index, file)
                                  }
                                }}
                                className="hidden"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-10 px-4"
                                onClick={() => {
                                  document.getElementById(`module-file-${index}`)?.click()
                                }}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500">
                              Supported formats: Images (JPG, PNG), PDF, Video (MP4, WebM)
                            </p>
                          </div>

                          {module.resourceUrl && (
                            <div className="space-y-1">
                              <Label className="text-xs text-gray-600">Resource Type</Label>
                              <Select
                                value={module.resourceType || "image"}
                                onValueChange={(value) => {
                                  const newModules = [...modules]
                                  newModules[index].resourceType = value
                                  setModules(newModules)
                                }}
                              >
                                <SelectTrigger className="h-9 px-3">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="image">Image</SelectItem>
                                  <SelectItem value="pdf">PDF</SelectItem>
                                  <SelectItem value="video">Video</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setModules([
                          ...modules,
                          {
                            title: "",
                            description: "",
                            duration: "",
                            status: "in_progress",
                            resourceUrl: "",
                            resourceType: "image"
                          }
                        ])
                      }}
                      className="w-full border-dashed border-2 h-12"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Module
                    </Button>
                  </div>

                  <div className="pt-6 border-t">
                    <div className="flex space-x-4">
                      <Button 
                        type="submit" 
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-8"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save'
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => router.push("/dashboard/courses")}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#4F5077]">Pricing & Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-[#7D8592]">
                <div className="space-y-3">
                  <Label className="font-medium">Course fees by tenure (India – INR)</Label>
                  <p className="text-xs text-muted-foreground">Tenure options are based on the course duration selected above. Add fees for the tenures you offer.</p>
                  {!formData.duration ? (
                    <p className="text-sm text-muted-foreground py-2">Select course duration above to set fees.</p>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-2">
                        <Label className="sr-only">Add tenure</Label>
                        <Select
                          value=""
                          onValueChange={(value) => {
                            if (value && !addedTenures.includes(value) && allowedTenureIds.has(value))
                              setAddedTenures([...addedTenures, value])
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Add tenure" />
                          </SelectTrigger>
                          <SelectContent>
                            {allowedTenureOptions.filter((d) => !addedTenures.includes(d.id)).map((d) => (
                              <SelectItem key={d.id} value={d.id}>
                                {d.name}
                              </SelectItem>
                            ))}
                            {allowedTenureOptions.length > 0 && allowedTenureOptions.every((d) => addedTenures.includes(d.id)) && (
                              <SelectItem value="_none" disabled>
                                All tenures added
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        {addedTenures.filter((id) => allowedTenureIds.has(id)).map((id) => {
                          const d = masterDurations.find((x) => x.id === id) || allowedTenureOptions.find((x) => x.id === id)
                          const value = feeByDurationId[id] ?? ""
                          return (
                            <div key={id} className="flex items-center gap-2">
                              <Label className="w-24 shrink-0">{d?.name ?? id}</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Enter amount"
                                className="max-w-[160px] placeholder:text-muted-foreground"
                                value={value}
                                onChange={(e) => setFeeByDurationId((prev) => ({ ...prev, [id]: e.target.value }))}
                              />
                              <span className="text-muted-foreground text-sm">INR</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => {
                                  setAddedTenures(addedTenures.filter((k) => k !== id))
                                  setFeeByDurationId((prev) => { const next = { ...prev }; delete next[id]; return next })
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        })}
                        {addedTenures.filter((id) => allowedTenureIds.has(id)).length === 0 && (
                          <p className="text-sm text-muted-foreground">Add at least one tenure using the dropdown above.</p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="branchSpecificPricing">Branch-specific pricing</Label>
                  <Switch
                    id="branchSpecificPricing"
                    checked={formData.branchSpecificPricing}
                    onCheckedChange={(checked) => setFormData({ ...formData, branchSpecificPricing: checked })}
                  />
                </div>

                {/* Branch-Specific Pricing Section */}
                {formData.branchSpecificPricing && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-md font-semibold">Branch-specific fees (add tenures per branch)</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newIndex = branchPrices.length
                          setBranchPrices([
                            ...branchPrices,
                            { branch_id: "", fee_per_duration: {} }
                          ])
                          setAddedBranchTenures((prev) => ({ ...prev, [newIndex]: [] }))
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Branch
                      </Button>
                    </div>

                    {branchPrices.map((branchPrice, index) => {
                      const branchTenures = addedBranchTenures[index] || []
                      return (
                        <Card key={index} className="p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Branch #{index + 1}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setBranchPrices(branchPrices.filter((_, i) => i !== index))
                                setAddedBranchTenures((prev) => {
                                  const next: Record<number, string[]> = {}
                                  Object.keys(prev).forEach((k) => {
                                    const i = parseInt(k, 10)
                                    if (i < index) next[i] = prev[i]
                                    if (i > index) next[i - 1] = prev[i]
                                  })
                                  return next
                                })
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <Label>Branch</Label>
                              <Select
                                value={(branchPrice as any).branch_id ? String((branchPrice as any).branch_id) : ""}
                                onValueChange={(value) => {
                                  const newPrices = [...branchPrices]
                                  ;(newPrices[index] as any).branch_id = value
                                  setBranchPrices(newPrices)
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Enter branch" />
                                </SelectTrigger>
                                <SelectContent>
                                  {loadingBranches ? (
                                    <SelectItem value="loading" disabled>Loading branches...</SelectItem>
                                  ) : branches.length > 0 ? (
                                    branches.map((branch) => (
                                      <SelectItem key={branch.id} value={String(branch.id)}>
                                        {branch.branch?.name || branch.name || `Branch ${branch.id}`}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="none" disabled>No branches available</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs text-muted-foreground">Tenures for this branch</Label>
                              {!formData.duration ? (
                                <p className="text-xs text-muted-foreground mt-1">Select course duration first.</p>
                              ) : (
                                <>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <Select
                                      value=""
                                      onValueChange={(value) => {
                                        if (value && !branchTenures.includes(value) && allowedTenureIds.has(value)) {
                                          setAddedBranchTenures((prev) => ({ ...prev, [index]: [...(prev[index] || []), value] }))
                                        }
                                      }}
                                    >
                                      <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Add tenure" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {allowedTenureOptions.filter((d) => !branchTenures.includes(d.id)).map((d) => (
                                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                        ))}
                                        {allowedTenureOptions.length > 0 && allowedTenureOptions.every((d) => branchTenures.includes(d.id)) && (
                                          <SelectItem value="_none" disabled>All added</SelectItem>
                                        )}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2 mt-2">
                                    {branchTenures.filter((id) => allowedTenureIds.has(id)).map((id) => {
                                      const d = masterDurations.find((x) => x.id === id) || allowedTenureOptions.find((x) => x.id === id)
                                      const fd = (branchPrice as any).fee_per_duration || {}
                                      const value = fd[id] ?? ""
                                      return (
                                        <div key={id} className="flex items-center gap-2">
                                          <Label className="w-20 shrink-0 text-xs">{d?.name ?? id}</Label>
                                          <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="Enter amount"
                                            className="max-w-[120px] h-8 placeholder:text-muted-foreground"
                                            value={value}
                                            onChange={(e) => {
                                              const newPrices = [...branchPrices]
                                              const bp = newPrices[index] as any
                                              bp.fee_per_duration = { ...(bp.fee_per_duration || {}), [id]: e.target.value }
                                              setBranchPrices(newPrices)
                                            }}
                                          />
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-red-500"
                                            onClick={() => {
                                              setAddedBranchTenures((prev) => ({
                                                ...prev,
                                                [index]: (prev[index] || []).filter((k) => k !== id)
                                              }))
                                              const newPrices = [...branchPrices]
                                              const bp = newPrices[index] as any
                                              bp.fee_per_duration = { ...(bp.fee_per_duration || {}) }
                                              delete bp.fee_per_duration[id]
                                              setBranchPrices(newPrices)
                                            }}
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </Card>
                      )
                    })}

                    {branchPrices.length === 0 && (
                      <div className="text-center py-6 text-gray-500 border-2 border-dashed rounded-lg">
                        <p className="text-sm">No branch-specific prices added yet.</p>
                        <p className="text-xs">Click &quot;Add Branch&quot; and add tenures per branch.</p>
                      </div>
                    )}
                  </div>
                )}

              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-[#4F5077]">Course Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-[#7D8592]">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Course Title:</span>
                    <span className="font-medium">{formData.courseTitle || '—'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Course Code:</span>
                    <span className="font-medium">{formData.courseCode || '—'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">
                      {categories.find(cat => cat.id === formData.category)?.name || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sub Category:</span>
                    <span className="font-medium">
                      {subCategories.find(cat => cat.id === formData.subCategory)?.name || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Difficulty Level:</span>
                    <span className="font-medium">{formData.difficultyLevel || '—'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {courseDurations.find(d => d.value === formData.duration)?.label || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Max Students:</span>
                    <span className="font-medium">{formData.maxStudents || '—'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Age Range:</span>
                    <span className="font-medium">
                      {formData.minAge || '—'} - {formData.maxAge || '—'} years
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fees (tenure):</span>
                    <span className="font-medium text-right">
                      {addedTenures.length > 0
                        ? addedTenures
                            .map((id) => {
                              const d = masterDurations.find((x) => x.id === id) || allowedTenureOptions.find((x) => x.id === id)
                              const v = feeByDurationId[id]
                              return v ? `${d?.name ?? id} ₹${v}` : null
                            })
                            .filter(Boolean)
                            .join(", ") || "—"
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Branch Specific Pricing:</span>
                    <span className="font-medium">{formData.branchSpecificPricing ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Prerequisites:</span>
                    <span className="font-medium">{prerequisites.length} items</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Modules:</span>
                    <span className="font-medium">{modules.length} modules</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Updated Successfully!</h3>
              <p className="text-gray-600 mb-6">Your course has been updated successfully.</p>
              <div className="flex space-x-3">
                <Button onClick={handleSuccessOk} className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black">
                  OK
                </Button>
                <Button onClick={handleSuccessOk} variant="outline" className="flex-1 bg-transparent">
                  Back to List
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
