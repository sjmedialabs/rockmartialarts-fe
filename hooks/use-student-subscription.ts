import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBackendApiUrl } from '@/lib/config'

export interface SubscriptionStatus {
  isActive: boolean
  hasActiveEnrollment: boolean
  expiryDate?: string
  paymentStatus?: string
  loading: boolean
}

/**
 * Hook to check student subscription status
 * Returns subscription status and handles redirects for inactive students
 */
export function useStudentSubscription() {
  const router = useRouter()
  const [status, setStatus] = useState<SubscriptionStatus>({
    isActive: true, // Default to true to avoid flash
    hasActiveEnrollment: true,
    loading: true
  })

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const token = localStorage.getItem('token')
        const user = localStorage.getItem('user')

        if (!token || !user) {
          setStatus({
            isActive: false,
            hasActiveEnrollment: false,
            loading: false
          })
          return
        }

        const userData = JSON.parse(user)

        // Only check for students
        if (userData.role !== 'student') {
          setStatus({
            isActive: true,
            hasActiveEnrollment: true,
            loading: false
          })
          return
        }

        // Fetch profile (use proxy in browser so URL is correct and consistent)
        const response = await fetch(getBackendApiUrl('auth/profile'), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const result = await response.json()
          const profile = result.profile

          // Check if profile is active
          const isProfileActive = profile.is_active !== false

          // Check if there's at least one active enrollment
          const hasActiveEnrollment = profile.enrollments?.some(
            (enrollment: any) => 
              enrollment.is_active && 
              enrollment.payment_status !== 'expired' &&
              enrollment.payment_status !== 'cancelled'
          ) || false

          // Expiry date: use latest end_date (or completion_date) from any enrollment for display
          const withDate = (profile.enrollments || []).filter(
            (e: any) => e?.end_date || e?.completion_date
          )
          const sortedByEnd = [...withDate].sort(
            (a: any, b: any) =>
              new Date(b.end_date || b.completion_date || 0).getTime() -
              new Date(a.end_date || a.completion_date || 0).getTime()
          )
          const latestEnrollment = sortedByEnd[0] || profile.enrollments?.[0]
          const expiryDate = latestEnrollment?.end_date || latestEnrollment?.completion_date

          setStatus({
            isActive: isProfileActive && hasActiveEnrollment,
            hasActiveEnrollment,
            expiryDate,
            paymentStatus: latestEnrollment?.payment_status,
            loading: false
          })
        } else {
          // If API call fails, default to inactive for safety
          setStatus({
            isActive: false,
            hasActiveEnrollment: false,
            loading: false
          })
        }
      } catch (error) {
        console.error('Error checking subscription status:', error)
        // On error, default to inactive for safety
        setStatus({
          isActive: false,
          hasActiveEnrollment: false,
          loading: false
        })
      }
    }

    checkSubscriptionStatus()
  }, [router])

  return status
}
