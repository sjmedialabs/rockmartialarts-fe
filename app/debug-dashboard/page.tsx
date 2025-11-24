'use client'

import { useEffect, useState } from 'react'
import { BranchManagerAuth } from '@/lib/branchManagerAuth'
import { dashboardAPI } from '@/lib/dashboardAPI'

interface DashboardStats {
  total_students: number
  active_students: number
  total_coaches: number
  active_coaches: number
  total_courses: number
  active_courses: number
  total_enrollments: number
  active_enrollments: number
}

export default function DebugDashboard() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiResponse, setApiResponse] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔍 Starting debug dashboard load...')
        
        // Check authentication
        const isAuth = BranchManagerAuth.isAuthenticated()
        console.log('🔐 Is authenticated:', isAuth)
        
        if (!isAuth) {
          setError('Not authenticated')
          return
        }

        // Get token
        const token = BranchManagerAuth.getToken()
        console.log('🎫 Token exists:', !!token)
        console.log('🎫 Token length:', token?.length || 0)

        if (!token) {
          setError('No token found')
          return
        }

        // Make API call
        console.log('📡 Making API call...')
        const response = await dashboardAPI.getBranchManagerDashboardStats(token)
        console.log('📡 API Response:', response)
        setApiResponse(response)

        const stats = response.dashboard_stats
        console.log('📊 Dashboard Stats from API:', stats)

        // Map API response to expected format
        const dashboardStats: DashboardStats = {
          total_students: stats.active_students || 0,
          active_students: stats.active_students || 0,
          total_coaches: stats.total_coaches || 0,
          active_coaches: stats.active_coaches || 0,
          total_courses: stats.active_courses || 0,
          active_courses: stats.active_courses || 0,
          total_enrollments: stats.active_enrollments || 0,
          active_enrollments: stats.active_enrollments || 0,
        }

        console.log('📈 Mapped Dashboard Stats:', dashboardStats)
        setDashboardStats(dashboardStats)
        
      } catch (err) {
        console.error('❌ Error loading dashboard data:', err)
        setError(`Failed to load dashboard statistics: ${err}`)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Dashboard</h1>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Raw API Response:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(apiResponse, null, 2)}
        </pre>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Mapped Dashboard Stats:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(dashboardStats, null, 2)}
        </pre>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Total Students</h3>
          <p className="text-2xl font-bold text-blue-600">
            {dashboardStats?.total_students || 0}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Total Coaches</h3>
          <p className="text-2xl font-bold text-green-600">
            {dashboardStats?.total_coaches || 0}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Active Courses</h3>
          <p className="text-2xl font-bold text-purple-600">
            {dashboardStats?.active_courses || 0}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Active Enrollments</h3>
          <p className="text-2xl font-bold text-orange-600">
            {dashboardStats?.active_enrollments || 0}
          </p>
        </div>
      </div>
    </div>
  )
}
