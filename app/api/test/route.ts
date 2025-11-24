import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Simple test to verify the API is working
    console.log('Test API received data:', body)
    
    return NextResponse.json(
      {
        message: 'Test API working',
        received_data: body,
        timestamp: new Date().toISOString(),
        port: process.env.PORT || 'default'
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Test API error', details: error },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Course API Test Endpoint',
      status: 'working',
      timestamp: new Date().toISOString(),
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'not set',
      environment: process.env.NODE_ENV || 'not set'
    },
    { status: 200 }
  )
}
