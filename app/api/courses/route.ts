import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Types for the course creation request
interface StudentRequirements {
  max_students: number
  min_age: number
  max_age: number
  prerequisites: string[]
}

interface CourseContent {
  syllabus: string
  equipment_required: string[]
}

interface MediaResources {
  course_image_url?: string
  promo_video_url?: string
}

interface Pricing {
  currency: string
  amount: number
  branch_specific_pricing: boolean
}

interface Settings {
  offers_certification: boolean
  active: boolean
}

interface CreateCourseRequest {
  title: string
  code: string
  description: string
  martial_art_style_id: string
  difficulty_level: string
  category_id: string
  instructor_id: string
  student_requirements: StudentRequirements
  course_content: CourseContent
  media_resources: MediaResources
  pricing: Pricing
  settings: Settings
}

// Mock function to verify JWT token (replace with actual JWT verification)
function verifyToken(token: string): { isValid: boolean; role?: string; userId?: string } {
  console.log('Verifying token:', token) // Debug log
  
  // This is a mock implementation
  // In a real application, you would verify the JWT token here
  if (token && token.startsWith('Bearer ')) {
    const actualToken = token.slice(7)
    console.log('Extracted token:', actualToken) // Debug log
    
    // Mock verification - replace with actual JWT verification
    if (actualToken === 'valid-super-admin-token') {
      console.log('Token verified successfully') // Debug log
      return { isValid: true, role: 'super_admin', userId: 'admin-123' }
    }
  }
  
  console.log('Token verification failed') // Debug log
  return { isValid: false }
}

// Mock function to generate UUID (replace with actual UUID generation)
function generateUUID(): string {
  return 'course-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36)
}

// Mock function to check if course code already exists
async function checkCourseCodeExists(code: string): Promise<boolean> {
  // In a real application, this would query your database
  // For now, we'll assume it doesn't exist
  return false
}

// Mock function to validate foreign key references
async function validateReferences(data: CreateCourseRequest): Promise<{ isValid: boolean; errors: string[] }> {
  const errors: string[] = []
  
  // In a real application, you would check if these IDs exist in your database
  // For now, we'll do basic validation
  
  if (!data.martial_art_style_id || !data.martial_art_style_id.includes('style-')) {
    errors.push('Invalid martial_art_style_id')
  }
  
  if (!data.category_id || !data.category_id.includes('category-')) {
    errors.push('Invalid category_id')
  }
  
  if (!data.instructor_id || !data.instructor_id.includes('instructor-')) {
    errors.push('Invalid instructor_id')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Mock function to save course to database
async function saveCourse(data: CreateCourseRequest, courseId: string): Promise<void> {
  // In a real application, this would save to your database
  console.log('Saving course to database:', { courseId, ...data })
  
  // Simulate database save delay
  await new Promise(resolve => setTimeout(resolve, 100))
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/courses called') // Debug log
    
    // Get authorization header
    const headersList = headers()
    const authorization = headersList.get('authorization')
    
    console.log('Authorization header:', authorization) // Debug log
    
    if (!authorization) {
      console.log('No authorization header provided') // Debug log
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      )
    }
    
    // Verify token and check if user is super admin
    const tokenVerification = verifyToken(authorization)
    if (!tokenVerification.isValid || tokenVerification.role !== 'super_admin') {
      console.log('Token verification failed or insufficient role') // Debug log
      return NextResponse.json(
        { error: 'Access denied. Super Admin access required.' },
        { status: 403 }
      )
    }
    
    // Parse request body
    const body: CreateCourseRequest = await request.json()
    
    // Validate required fields
    const missingFields: string[] = []
    if (!body.title) missingFields.push('title')
    if (!body.code) missingFields.push('code')
    if (!body.description) missingFields.push('description')
    if (!body.martial_art_style_id) missingFields.push('martial_art_style_id')
    if (!body.difficulty_level) missingFields.push('difficulty_level')
    if (!body.category_id) missingFields.push('category_id')
    if (!body.instructor_id) missingFields.push('instructor_id')
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }
    
    // Validate nested required objects
    if (!body.student_requirements) {
      return NextResponse.json(
        { error: 'student_requirements object is required' },
        { status: 400 }
      )
    }
    
    if (!body.course_content) {
      return NextResponse.json(
        { error: 'course_content object is required' },
        { status: 400 }
      )
    }
    
    if (!body.pricing) {
      return NextResponse.json(
        { error: 'pricing object is required' },
        { status: 400 }
      )
    }
    
    if (!body.settings) {
      return NextResponse.json(
        { error: 'settings object is required' },
        { status: 400 }
      )
    }
    
    // Validate student requirements
    const { student_requirements } = body
    if (typeof student_requirements.max_students !== 'number' || student_requirements.max_students <= 0) {
      return NextResponse.json(
        { error: 'student_requirements.max_students must be a positive number' },
        { status: 400 }
      )
    }
    
    if (typeof student_requirements.min_age !== 'number' || student_requirements.min_age < 0) {
      return NextResponse.json(
        { error: 'student_requirements.min_age must be a non-negative number' },
        { status: 400 }
      )
    }
    
    if (typeof student_requirements.max_age !== 'number' || student_requirements.max_age <= student_requirements.min_age) {
      return NextResponse.json(
        { error: 'student_requirements.max_age must be greater than min_age' },
        { status: 400 }
      )
    }
    
    if (!Array.isArray(student_requirements.prerequisites)) {
      return NextResponse.json(
        { error: 'student_requirements.prerequisites must be an array' },
        { status: 400 }
      )
    }
    
    // Validate course content
    const { course_content } = body
    if (!course_content.syllabus || typeof course_content.syllabus !== 'string') {
      return NextResponse.json(
        { error: 'course_content.syllabus is required and must be a string' },
        { status: 400 }
      )
    }
    
    if (!Array.isArray(course_content.equipment_required)) {
      return NextResponse.json(
        { error: 'course_content.equipment_required must be an array' },
        { status: 400 }
      )
    }
    
    // Validate pricing
    const { pricing } = body
    if (!pricing.currency || typeof pricing.currency !== 'string') {
      return NextResponse.json(
        { error: 'pricing.currency is required' },
        { status: 400 }
      )
    }
    
    if (typeof pricing.amount !== 'number' || pricing.amount <= 0) {
      return NextResponse.json(
        { error: 'pricing.amount must be a positive number' },
        { status: 400 }
      )
    }
    
    if (typeof pricing.branch_specific_pricing !== 'boolean') {
      return NextResponse.json(
        { error: 'pricing.branch_specific_pricing must be a boolean' },
        { status: 400 }
      )
    }
    
    // Validate settings
    const { settings } = body
    if (typeof settings.offers_certification !== 'boolean') {
      return NextResponse.json(
        { error: 'settings.offers_certification must be a boolean' },
        { status: 400 }
      )
    }
    
    if (typeof settings.active !== 'boolean') {
      return NextResponse.json(
        { error: 'settings.active must be a boolean' },
        { status: 400 }
      )
    }
    
    // Validate difficulty level
    const validDifficultyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    if (!validDifficultyLevels.includes(body.difficulty_level)) {
      return NextResponse.json(
        { error: `difficulty_level must be one of: ${validDifficultyLevels.join(', ')}` },
        { status: 400 }
      )
    }
    
    // Check if course code already exists
    const codeExists = await checkCourseCodeExists(body.code)
    if (codeExists) {
      return NextResponse.json(
        { error: `Course code '${body.code}' already exists` },
        { status: 409 }
      )
    }
    
    // Validate foreign key references
    const referenceValidation = await validateReferences(body)
    if (!referenceValidation.isValid) {
      return NextResponse.json(
        { error: 'Invalid references', details: referenceValidation.errors },
        { status: 400 }
      )
    }
    
    // Generate course ID
    const courseId = generateUUID()
    
    // Save course to database
    await saveCourse(body, courseId)
    
    // Return success response
    return NextResponse.json(
      {
        message: 'Course created successfully',
        course_id: courseId
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Error creating course:', error)
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET method to retrieve courses (optional)
export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const headersList = headers()
    const authorization = headersList.get('authorization')
    
    if (!authorization) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      )
    }
    
    // Verify token
    const tokenVerification = verifyToken(authorization)
    if (!tokenVerification.isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    
    // Mock courses data
    const courses = [
      {
        id: 'course-123456',
        title: 'Advanced Kung Fu Training',
        code: 'KF-ADV-001',
        description: 'A comprehensive course covering advanced Kung Fu techniques.',
        difficulty_level: 'Advanced',
        pricing: {
          currency: 'INR',
          amount: 8500
        },
        settings: {
          active: true,
          offers_certification: true
        },
        created_at: new Date().toISOString()
      }
    ]
    
    return NextResponse.json(
      {
        message: 'Courses retrieved successfully',
        courses,
        total: courses.length
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Error retrieving courses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
