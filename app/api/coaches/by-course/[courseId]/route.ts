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

    // Get the authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Forward request to backend
    const response = await fetch(`${BACKEND_URL}/api/coaches/by-course/${courseId}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
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
    console.error('Error in coaches by course API:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to retrieve coaches for course'
      },
      { status: 500 }
    )
  }
}
