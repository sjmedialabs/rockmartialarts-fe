import { NextRequest, NextResponse } from 'next/server'
import { getBackendProxyBaseUrl } from '@/lib/serverBackendUrl'

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const BACKEND_URL = getBackendProxyBaseUrl().replace(/\/$/, '')
  try {
    const { courseId } = params

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }

    // Forward request to backend public endpoint
    const response = await fetch(`${BACKEND_URL}/api/coaches/public/by-course/${courseId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      return NextResponse.json(
        errorData,
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error in public coaches by course API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to retrieve coaches for course'
      },
      { status: 500 }
    )
  }
}
