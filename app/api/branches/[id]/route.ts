import { NextRequest, NextResponse } from 'next/server'

// Mock data for testing - in production this would come from your database
const mockBranches = [
  {
    id: "c9ed7bb7-c31e-4b0f-9edf-760b41de9628", // Match the ID from the URL
    branch: {
      name: "Downtown Martial Arts",
      code: "DMA01",
      email: "downtown@martialarts.com",
      phone: "+1234567890",
      address: {
        line1: "123 Main Street",
        area: "Downtown",
        city: "New York",
        state: "New York",
        pincode: "10001",
        country: "USA"
      }
    },
    manager_id: "manager-uuid-1",
    operational_details: {
      courses_offered: ["Taekwondo Basics", "Advanced Karate"],
      timings: [
        { day: "Monday", open: "09:00", close: "18:00" },
        { day: "Tuesday", open: "09:00", close: "18:00" },
        { day: "Wednesday", open: "09:00", close: "18:00" }
      ],
      holidays: ["2024-12-25", "2024-01-01"]
    },
    assignments: {
      accessories_available: true,
      courses: ["course-uuid-1", "course-uuid-2"],
      branch_admins: ["coach-uuid-1", "coach-uuid-2"]
    },
    bank_details: {
      bank_name: "State Bank of India",
      account_number: "1234567890",
      upi_id: "downtown@paytm"
    },
    is_active: true,
    created_at: "2024-01-20T10:30:00Z",
    updated_at: "2024-01-20T10:30:00Z"
  },
  {
    id: "branch-uuid-2",
    branch: {
      name: "Uptown Dojo",
      code: "UD01",
      email: "uptown@dojo.com",
      phone: "+1987654321",
      address: {
        line1: "456 Oak Avenue",
        area: "Uptown",
        city: "Los Angeles",
        state: "California",
        pincode: "90210",
        country: "USA"
      }
    },
    manager_id: "manager-uuid-2",
    operational_details: {
      courses_offered: ["Kung Fu Fundamentals", "Mixed Martial Arts"],
      timings: [
        { day: "Monday", open: "08:00", close: "20:00" },
        { day: "Wednesday", open: "08:00", close: "20:00" },
        { day: "Friday", open: "08:00", close: "20:00" }
      ],
      holidays: ["2024-07-04", "2024-11-28"]
    },
    assignments: {
      accessories_available: false,
      courses: ["course-uuid-3", "course-uuid-5"],
      branch_admins: ["coach-uuid-3"]
    },
    bank_details: {
      bank_name: "HDFC Bank",
      account_number: "9876543210",
      upi_id: "uptown@ybl"
    },
    is_active: true,
    created_at: "2024-02-15T14:20:00Z",
    updated_at: "2024-02-15T14:20:00Z"
  }
]

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const branchId = params.id

    // Find the branch in mock data
    const branch = mockBranches.find(b => b.id === branchId)
    
    if (!branch) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      )
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return NextResponse.json(branch)

  } catch (error) {
    console.error('Error fetching branch:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const branchId = params.id
    const updateData = await request.json()

    // Find the branch in mock data
    const branchIndex = mockBranches.findIndex(b => b.id === branchId)
    
    if (branchIndex === -1) {
      return NextResponse.json(
        { error: 'Branch not found' },
        { status: 404 }
      )
    }

    // Update the branch data
    const updatedBranch = {
      ...mockBranches[branchIndex],
      ...updateData,
      updated_at: new Date().toISOString()
    }

    // Update in mock data
    mockBranches[branchIndex] = updatedBranch

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    console.log('Branch updated successfully:', updatedBranch)

    return NextResponse.json({
      message: 'Branch updated successfully',
      branch: updatedBranch
    })

  } catch (error) {
    console.error('Error updating branch:', error)
    
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
