import { NextRequest, NextResponse } from 'next/server'

// SuperAdmin login interface
interface SuperAdminLoginRequest {
  email: string
  password: string
  recaptchaToken?: string
}

// SuperAdmin login response interface  
interface SuperAdminLoginResponse {
  status: string
  message: string
  data?: {
    id: string
    full_name: string
    email: string
    phone: string
    token: string
    token_type: string
    expires_in: number
  }
}

// Mock SuperAdmin credentials (replace with database lookup)
const MOCK_SUPERADMIN = {
  id: "superadmin-001",
  email: "admin@marshalats.com",
  password: "admin123", // In production, use hashed passwords
  full_name: "Super Administrator",
  phone: "+1234567890"
}

// Generate a mock JWT token (replace with actual JWT generation)
function generateMockToken(): string {
  const payload = {
    id: MOCK_SUPERADMIN.id,
    email: MOCK_SUPERADMIN.email,
    role: "super_admin",
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  }
  
  // In production, use proper JWT signing with your JWT_SECRET
  return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(payload))}.mock-signature`
}

export async function POST(request: NextRequest) {
  try {
    console.log('SuperAdmin login API called')
    
    // Parse request body
    const body: SuperAdminLoginRequest = await request.json()
    console.log('Login request:', { email: body.email, hasPassword: !!body.password })
    
    // Validate required fields
    if (!body.email || !body.password) {
      console.log('Missing required fields')
      return NextResponse.json(
        {
          status: "error",
          message: "Email and password are required"
        } as SuperAdminLoginResponse,
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      console.log('Invalid email format')
      return NextResponse.json(
        {
          status: "error", 
          message: "Invalid email format"
        } as SuperAdminLoginResponse,
        { status: 400 }
      )
    }

    // Check credentials (in production, query your database)
    if (body.email !== MOCK_SUPERADMIN.email || body.password !== MOCK_SUPERADMIN.password) {
      console.log('Invalid credentials')
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid email or password"
        } as SuperAdminLoginResponse,
        { status: 401 }
      )
    }

    // Validate reCAPTCHA if provided (optional implementation)
    if (body.recaptchaToken && process.env.RECAPTCHA_SECRET_KEY) {
      try {
        const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${body.recaptchaToken}`
        })
        
        const recaptchaResult = await recaptchaResponse.json()
        if (!recaptchaResult.success) {
          console.log('reCAPTCHA validation failed')
          return NextResponse.json(
            {
              status: "error",
              message: "reCAPTCHA validation failed"
            } as SuperAdminLoginResponse,
            { status: 400 }
          )
        }
      } catch (error) {
        console.error('reCAPTCHA validation error:', error)
        // Continue without reCAPTCHA validation in case of service issues
      }
    }

    // Generate token
    const token = generateMockToken()
    const expiresIn = 24 * 60 * 60 // 24 hours in seconds

    console.log('SuperAdmin login successful')

    // Return success response
    const response: SuperAdminLoginResponse = {
      status: "success",
      message: "Login successful",
      data: {
        id: MOCK_SUPERADMIN.id,
        full_name: MOCK_SUPERADMIN.full_name,
        email: MOCK_SUPERADMIN.email,
        phone: MOCK_SUPERADMIN.phone,
        token: token,
        token_type: "bearer",
        expires_in: expiresIn
      }
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    console.error('SuperAdmin login error:', error)
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid JSON in request body"
        } as SuperAdminLoginResponse,
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      {
        status: "error",
        message: "Internal server error"
      } as SuperAdminLoginResponse,
      { status: 500 }
    )
  }
}

// GET method for testing the endpoint
export async function GET() {
  return NextResponse.json(
    {
      message: "SuperAdmin Login API",
      status: "active",
      endpoint: "/api/superadmin/login",
      method: "POST",
      required_fields: ["email", "password"],
      optional_fields: ["recaptchaToken"]
    },
    { status: 200 }
  )
}
