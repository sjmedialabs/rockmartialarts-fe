'use client'

import { useState, useEffect } from 'react'

export default function TestDetailPagesPage() {
  const [courseData, setCourseData] = useState<any>(null)
  const [studentData, setStudentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const courseId = 'd3cb7042-cb18-4379-b948-3b3efc54f9e9'
  const studentId = 'f6b313ba-27d2-4587-9384-23016239131b'

  useEffect(() => {
    const testDetailAPIs = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get authentication token
        console.log('Getting authentication token...')
        const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'admin@marshalats.com',
            password: 'admin123'
          })
        })
        
        if (!loginResponse.ok) {
          throw new Error('Failed to get authentication token')
        }

        const loginData = await loginResponse.json()
        const token = loginData.data.token
        console.log('✅ Authentication successful')

        // Test course detail API
        console.log('Testing course detail API...')
        const courseResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/courses/${courseId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (courseResponse.ok) {
          const course = await courseResponse.json()
          setCourseData(course)
          console.log('✅ Course detail API working:', course)
        } else {
          console.error('❌ Course detail API failed:', courseResponse.status)
        }

        // Test student detail API
        console.log('Testing student detail API...')
        const studentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/${studentId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (studentResponse.ok) {
          const student = await studentResponse.json()
          setStudentData(student)
          console.log('✅ Student detail API working:', student)
        } else {
          console.error('❌ Student detail API failed:', studentResponse.status)
        }

      } catch (err) {
        console.error('❌ API test failed:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    testDetailAPIs()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Testing Detail Page APIs...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Detail Pages API Test Results</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Course Detail API Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Course Detail API</h2>
          <p className="text-sm text-gray-600 mb-2">Course ID: {courseId}</p>
          {courseData ? (
            <div>
              <div className="text-green-600 font-medium mb-2">✅ Working</div>
              <p className="text-sm text-gray-600 mb-2">
                Course: {courseData.title || courseData.name}
              </p>
              <div className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                <pre>{JSON.stringify(courseData, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <div className="text-red-600 font-medium">❌ Failed</div>
          )}
        </div>

        {/* Student Detail API Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Student Detail API</h2>
          <p className="text-sm text-gray-600 mb-2">Student ID: {studentId}</p>
          {studentData ? (
            <div>
              <div className="text-green-600 font-medium mb-2">✅ Working</div>
              <p className="text-sm text-gray-600 mb-2">
                Student: {studentData.user?.full_name || studentData.full_name}
              </p>
              <div className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                <pre>{JSON.stringify(studentData, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <div className="text-red-600 font-medium">❌ Failed</div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Test Links</h2>
        <div className="space-y-2">
          <a 
            href={`/dashboard/courses/${courseId}`}
            className="block text-blue-600 hover:underline"
          >
            → Test Course Detail Page
          </a>
          <a 
            href={`/dashboard/students/${studentId}`}
            className="block text-blue-600 hover:underline"
          >
            → Test Student Detail Page
          </a>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">API Endpoints Tested:</h3>
        <ul className="text-sm space-y-1">
          <li>• <code>GET /api/courses/{courseId}</code> - Course details</li>
          <li>• <code>GET /api/users/{studentId}</code> - Student details</li>
          <li>• <code>POST /api/superadmin/login</code> - Authentication</li>
        </ul>
      </div>
    </div>
  )
}
