import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/branches-with-courses
 *
 * Retrieves all branches and their associated courses based on filtering criteria.
 *
 * Query Parameters:
 * - branch_id (optional): Filter by specific branch ID, or "all" for all branches
 * - status (optional): Filter by branch status ("active" or "inactive")
 * - include_inactive (optional): Include inactive branches when no status filter is applied (default: false)
 *
 * Authentication: Requires Bearer token
 *
 * Response Format:
 * {
 *   "message": "Branches with courses retrieved successfully",
 *   "branches": [...], // Array of branches with nested courses
 *   "total": 2,
 *   "summary": {
 *     "total_branches": 2,
 *     "total_courses": 5,
 *     "total_students": 123,
 *     "total_coaches": 7
 *   },
 *   "filters_applied": {
 *     "branch_id": "all",
 *     "status": "active",
 *     "include_inactive": false
 *   }
 * }
 *
 * Error Responses:
 * - 401: Missing or invalid authorization header
 * - 404: Specific branch ID not found
 * - 500: Internal server error
 */

// Branch with courses interface
interface BranchWithCourses {
  id: string
  branch: {
    name: string
    code: string
    email: string
    phone: string
    address: {
      line1: string
      area: string
      city: string
      state: string
      pincode: string
      country: string
    }
  }
  manager_id: string
  is_active: boolean
  operational_details: {
    courses_offered: string[]
    timings: Array<{
      day: string
      open: string
      close: string
    }>
    holidays: string[]
  }
  assignments: {
    accessories_available: boolean
    courses: string[]
    branch_admins: string[]
  }
  bank_details: {
    bank_name: string
    account_number: string
    upi_id: string
  }
  statistics?: {
    coach_count: number
    student_count: number
    course_count: number
    active_courses: number
  }
  courses: Array<{
    id: string
    title: string
    name: string
    code: string
    description: string
    difficulty_level: string
    pricing: {
      currency: string
      amount: number
      branch_specific_pricing: boolean
    }
    student_requirements: {
      max_students: number
      min_age: number
      max_age: number
      prerequisites: string[]
    }
    settings: {
      active: boolean
      offers_certification: boolean
    }
    created_at: string
    updated_at: string
  }>
  created_at: string
  updated_at: string
}

// Mock data for branches with courses
const mockBranchesWithCourses: BranchWithCourses[] = [
  {
    id: "branch-1",
    branch: {
      name: "Rock martial arts",
      code: "RMA01",
      email: "rma@email.com",
      phone: "+13455672356",
      address: {
        line1: "928#123",
        area: "Madhapur",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500089",
        country: "India"
      }
    },
    manager_id: "manager-uuid-1234",
    is_active: true,
    operational_details: {
      courses_offered: ["Rock martial arts", "Karate Beginner"],
      timings: [
        { day: "Monday", open: "07:00", close: "19:00" },
        { day: "Tuesday", open: "07:00", close: "19:00" },
        { day: "Wednesday", open: "07:00", close: "19:00" },
        { day: "Thursday", open: "07:00", close: "19:00" },
        { day: "Friday", open: "07:00", close: "19:00" }
      ],
      holidays: ["2025-10-02", "2025-12-25"]
    },
    assignments: {
      accessories_available: true,
      courses: ["course-uuid-1", "course-uuid-2"],
      branch_admins: ["coach-uuid-1", "coach-uuid-2"]
    },
    bank_details: {
      bank_name: "State Bank of India",
      account_number: "XXXXXXXXXXXX",
      upi_id: "name@ybl"
    },
    statistics: {
      coach_count: 3,
      student_count: 45,
      course_count: 2,
      active_courses: 2
    },
    courses: [
      {
        id: "course-123456",
        title: "Advanced Kung Fu Training",
        name: "Advanced Kung Fu Training",
        code: "KF-ADV-001",
        description: "A comprehensive course covering advanced Kung Fu techniques.",
        difficulty_level: "Advanced",
        pricing: {
          currency: "INR",
          amount: 8500,
          branch_specific_pricing: false
        },
        student_requirements: {
          max_students: 20,
          min_age: 16,
          max_age: 50,
          prerequisites: ["Basic Kung Fu"]
        },
        settings: {
          active: true,
          offers_certification: true
        },
        created_at: "2025-09-14T20:05:32.791Z",
        updated_at: "2025-09-14T20:05:32.791Z"
      },
      {
        id: "course-789012",
        title: "Beginner Karate",
        name: "Beginner Karate",
        code: "KR-BEG-001",
        description: "Introduction to Karate fundamentals and basic techniques.",
        difficulty_level: "Beginner",
        pricing: {
          currency: "INR",
          amount: 5500,
          branch_specific_pricing: false
        },
        student_requirements: {
          max_students: 25,
          min_age: 8,
          max_age: 60,
          prerequisites: []
        },
        settings: {
          active: true,
          offers_certification: true
        },
        created_at: "2025-09-14T20:05:32.791Z",
        updated_at: "2025-09-14T20:05:32.791Z"
      }
    ],
    created_at: "2025-09-14T20:05:32.791Z",
    updated_at: "2025-09-14T20:05:32.791Z"
  },
  {
    id: "branch-2",
    branch: {
      name: "Elite Combat Academy",
      code: "ECA01",
      email: "elite@combat.com",
      phone: "+19876543210",
      address: {
        line1: "456 Fighter Street",
        area: "Combat Zone",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        country: "India"
      }
    },
    manager_id: "manager-uuid-5678",
    is_active: true,
    operational_details: {
      courses_offered: ["Karate", "Boxing", "Mixed Martial Arts"],
      timings: [
        { day: "Monday", open: "06:00", close: "20:00" },
        { day: "Wednesday", open: "06:00", close: "20:00" },
        { day: "Friday", open: "06:00", close: "20:00" }
      ],
      holidays: ["2025-08-15", "2025-10-02"]
    },
    assignments: {
      accessories_available: false,
      courses: ["course-uuid-3", "course-uuid-4", "course-uuid-5"],
      branch_admins: ["coach-uuid-3"]
    },
    bank_details: {
      bank_name: "HDFC Bank",
      account_number: "YYYYYYYYYYYY",
      upi_id: "elite@paytm"
    },
    statistics: {
      coach_count: 4,
      student_count: 78,
      course_count: 3,
      active_courses: 3
    },
    courses: [
      {
        id: "course-345678",
        title: "Mixed Martial Arts",
        name: "Mixed Martial Arts",
        code: "MMA-INT-001",
        description: "Intermediate level mixed martial arts training combining multiple disciplines.",
        difficulty_level: "Intermediate",
        pricing: {
          currency: "INR",
          amount: 12000,
          branch_specific_pricing: true
        },
        student_requirements: {
          max_students: 15,
          min_age: 18,
          max_age: 45,
          prerequisites: ["Basic Martial Arts", "Physical Fitness"]
        },
        settings: {
          active: true,
          offers_certification: true
        },
        created_at: "2025-09-14T20:05:32.791Z",
        updated_at: "2025-09-14T20:05:32.791Z"
      },
      {
        id: "course-456789",
        title: "Professional Boxing",
        name: "Professional Boxing",
        code: "BOX-PRO-001",
        description: "Professional boxing training for competitive athletes.",
        difficulty_level: "Advanced",
        pricing: {
          currency: "INR",
          amount: 15000,
          branch_specific_pricing: true
        },
        student_requirements: {
          max_students: 12,
          min_age: 18,
          max_age: 35,
          prerequisites: ["Basic Boxing", "Physical Fitness Assessment"]
        },
        settings: {
          active: true,
          offers_certification: true
        },
        created_at: "2025-09-14T20:05:32.791Z",
        updated_at: "2025-09-14T20:05:32.791Z"
      },
      {
        id: "course-567890",
        title: "Traditional Karate",
        name: "Traditional Karate",
        code: "KAR-TRAD-001",
        description: "Traditional Karate forms and techniques.",
        difficulty_level: "Intermediate",
        pricing: {
          currency: "INR",
          amount: 7500,
          branch_specific_pricing: false
        },
        student_requirements: {
          max_students: 20,
          min_age: 12,
          max_age: 55,
          prerequisites: ["Basic Karate"]
        },
        settings: {
          active: true,
          offers_certification: true
        },
        created_at: "2025-09-14T20:05:32.791Z",
        updated_at: "2025-09-14T20:05:32.791Z"
      }
    ],
    created_at: "2025-09-14T20:05:32.791Z",
    updated_at: "2025-09-14T20:05:32.791Z"
  }
]

export async function GET(request: NextRequest) {
  try {
    // Extract authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header missing or invalid' },
        { status: 401 }
      )
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branch_id')
    const status = searchParams.get('status')
    const includeInactive = searchParams.get('include_inactive') === 'true'

    console.log('Branches with courses API called with params:', { branchId, status, includeInactive })

    // Start with all branches
    let filteredBranches = [...mockBranchesWithCourses]

    // Apply branch_id filter
    if (branchId && branchId !== 'all') {
      filteredBranches = filteredBranches.filter(branch => branch.id === branchId)
      
      // If specific branch ID requested but not found
      if (filteredBranches.length === 0) {
        return NextResponse.json(
          { 
            error: 'Branch not found',
            message: `No branch found with ID: ${branchId}`
          },
          { status: 404 }
        )
      }
    }

    // Apply status filter (default to active only unless include_inactive is true)
    if (status) {
      const isActive = status.toLowerCase() === 'active'
      filteredBranches = filteredBranches.filter(branch => branch.is_active === isActive)
    } else if (!includeInactive) {
      // Default behavior: only show active branches unless explicitly requested
      filteredBranches = filteredBranches.filter(branch => branch.is_active === true)
    }

    // If no branches match the filters
    if (filteredBranches.length === 0) {
      return NextResponse.json(
        {
          message: status ? `No ${status} branches found` : 'No branches found matching criteria',
          branches: [],
          total: 0,
          filters_applied: { branch_id: branchId, status, include_inactive: includeInactive }
        },
        { status: 200 }
      )
    }

    // Calculate statistics
    const totalCourses = filteredBranches.reduce((sum, branch) => sum + branch.courses.length, 0)
    const totalStudents = filteredBranches.reduce((sum, branch) => sum + (branch.statistics?.student_count || 0), 0)
    const totalCoaches = filteredBranches.reduce((sum, branch) => sum + (branch.statistics?.coach_count || 0), 0)

    console.log(`Returning ${filteredBranches.length} branches with ${totalCourses} total courses`)

    return NextResponse.json({
      message: 'Branches with courses retrieved successfully',
      branches: filteredBranches,
      total: filteredBranches.length,
      summary: {
        total_branches: filteredBranches.length,
        total_courses: totalCourses,
        total_students: totalStudents,
        total_coaches: totalCoaches
      },
      filters_applied: {
        branch_id: branchId || 'all',
        status: status || (includeInactive ? 'all' : 'active'),
        include_inactive: includeInactive
      }
    })

  } catch (error) {
    console.error('Error in branches-with-courses API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to retrieve branches with courses'
      },
      { status: 500 }
    )
  }
}
