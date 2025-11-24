'use client'

import { useState, useEffect } from 'react'

export default function TestAPIPage() {
  const [coursesData, setCoursesData] = useState<any>(null)
  const [studentsData, setStudentsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testAPIs = async () => {
      try {
        setLoading(true)
        setError(null)

        // Test courses API
        console.log('Testing courses API...')
        const coursesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/courses/public/all`)
        if (coursesResponse.ok) {
          const courses = await coursesResponse.json()
          setCoursesData(courses)
          console.log('✅ Courses API working:', courses)
        } else {
          console.error('❌ Courses API failed:', coursesResponse.status)
        }

        // Test students API with auto-login
        console.log('Testing students API...')
        try {
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
          
          if (loginResponse.ok) {
            const loginData = await loginResponse.json()
            const token = loginData.data.token
            console.log('✅ Login successful')
            
            const studentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/students/details`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            
            if (studentsResponse.ok) {
              const students = await studentsResponse.json()
              setStudentsData(students)
              console.log('✅ Students API working:', students)
            } else {
              console.error('❌ Students API failed:', studentsResponse.status)
            }
          }
        } catch (authError) {
          console.error('❌ Authentication failed:', authError)
        }

      } catch (err) {
        console.error('❌ API test failed:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    testAPIs()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Testing API Endpoints...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">API Test Results</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Courses API Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Courses API</h2>
          {coursesData ? (
            <div>
              <div className="text-green-600 font-medium mb-2">✅ Working</div>
              <p className="text-sm text-gray-600 mb-2">
                Found {coursesData.courses?.length || 0} courses
              </p>
              <div className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                <pre>{JSON.stringify(coursesData, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <div className="text-red-600 font-medium">❌ Failed</div>
          )}
        </div>

        {/* Students API Test */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Students API</h2>
          {studentsData ? (
            <div>
              <div className="text-green-600 font-medium mb-2">✅ Working</div>
              <p className="text-sm text-gray-600 mb-2">
                Found {studentsData.students?.length || 0} students
              </p>
              <div className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                <pre>{JSON.stringify(studentsData, null, 2)}</pre>
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
            href="/dashboard/create-student" 
            className="block text-blue-600 hover:underline"
          >
            → Test Create Student Page (Course Dropdown)
          </a>
          <a 
            href="/dashboard/students" 
            className="block text-blue-600 hover:underline"
          >
            → Test Students List Page
          </a>
        </div>
      </div>
    </div>
  )
}
