import { NextRequest, NextResponse } from 'next/server'

// Interfaces for the API payload structure
interface Address {
  line1: string
  area: string
  city: string
  state: string
  pincode: string
  country: string
}

interface BranchInfo {
  name: string
  code: string
  email: string
  phone: string
  address: Address
}

interface Timing {
  day: string
  open: string
  close: string
}

interface OperationalDetails {
  courses_offered: string[]
  timings: Timing[]
  holidays: string[]
}

interface Assignments {
  accessories_available: boolean
  courses: string[]
  branch_admins: string[]
}

interface BankDetails {
  bank_name: string
  account_number: string
  upi_id: string
}

interface CreateBranchPayload {
  branch: BranchInfo
  manager_id: string
  operational_details: OperationalDetails
  assignments: Assignments
  bank_details: BankDetails
}

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // In a real application, you would validate the JWT token here
    // and check if the user has Super Admin privileges
    
    const body: CreateBranchPayload = await request.json()
    
    // Validate required fields
    const { branch, manager_id, operational_details, assignments, bank_details } = body
    
    if (!branch?.name || !branch?.code || !branch?.email || !branch?.phone) {
      return NextResponse.json(
        { error: 'Missing required branch information' },
        { status: 400 }
      )
    }

    if (!branch.address?.line1 || !branch.address?.city || !branch.address?.state || !branch.address?.pincode) {
      return NextResponse.json(
        { error: 'Missing required address information' },
        { status: 400 }
      )
    }

    // Validate operational details
    if (!operational_details?.courses_offered?.length || !operational_details?.timings?.length) {
      return NextResponse.json(
        { error: 'Missing required operational details' },
        { status: 400 }
      )
    }

    // Log the received payload for debugging
    console.log('Branch creation payload:', JSON.stringify(body, null, 2))

    // In a real application, you would:
    // 1. Validate the JWT token and user permissions
    // 2. Save the branch data to your database
    // 3. Handle relationships with managers, courses, and coaches
    // 4. Generate unique IDs for the branch
    
    // Simulate successful creation with a delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock successful response
    const mockResponse = {
      success: true,
      message: 'Branch created successfully',
      data: {
        branch_id: `branch-${Date.now()}`,
        branch: {
          ...branch,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'active'
        },
        manager_id,
        operational_details: {
          ...operational_details,
          created_at: new Date().toISOString()
        },
        assignments: {
          ...assignments,
          assigned_at: new Date().toISOString()
        },
        bank_details: {
          ...bank_details,
          verified: false,
          created_at: new Date().toISOString()
        }
      }
    }

    return NextResponse.json(mockResponse, { status: 201 })

  } catch (error) {
    console.error('Error creating branch:', error)
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Mock response for getting branches
    const mockBranches = [
      {
        id: 'branch-1',
        branch: {
          name: 'Rock martial arts',
          code: 'RMA01',
          email: 'rma@email.com',
          phone: '+13455672356',
          address: {
            line1: '928#123',
            area: 'Madhapur',
            city: 'Hyderabad',
            state: 'Telangana',
            pincode: '500089',
            country: 'India'
          }
        },
        manager_id: 'manager-uuid-1234',
        operational_details: {
          courses_offered: ['Rock martial arts'],
          timings: [
            { day: 'Monday', open: '07:00', close: '19:00' },
            { day: 'Tuesday', open: '07:00', close: '19:00' }
          ],
          holidays: ['2025-10-02', '2025-12-25']
        },
        assignments: {
          accessories_available: true,
          courses: ['course-uuid-1', 'course-uuid-2'],
          branch_admins: ['coach-uuid-1', 'coach-uuid-2']
        },
        bank_details: {
          bank_name: 'State Bank of India',
          account_number: 'XXXXXXXXXXXX',
          upi_id: 'name@ybl'
        },
        is_active: true
      },
      {
        id: 'branch-2',
        branch: {
          name: 'Elite Combat Academy',
          code: 'ECA01',
          email: 'elite@combat.com',
          phone: '+19876543210',
          address: {
            line1: '456 Fighter Street',
            area: 'Combat Zone',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            country: 'India'
          }
        },
        manager_id: 'manager-uuid-5678',
        operational_details: {
          courses_offered: ['Karate', 'Boxing'],
          timings: [
            { day: 'Monday', open: '06:00', close: '20:00' },
            { day: 'Wednesday', open: '06:00', close: '20:00' },
            { day: 'Friday', open: '06:00', close: '20:00' }
          ],
          holidays: ['2025-08-15', '2025-10-02']
        },
        assignments: {
          accessories_available: false,
          courses: ['course-uuid-3', 'course-uuid-4'],
          branch_admins: ['coach-uuid-3']
        },
        bank_details: {
          bank_name: 'HDFC Bank',
          account_number: 'YYYYYYYYYYYY',
          upi_id: 'elite@paytm'
        },
        is_active: true
      }
    ]

    return NextResponse.json({
      branches: mockBranches
    })

  } catch (error) {
    console.error('Error fetching branches:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
