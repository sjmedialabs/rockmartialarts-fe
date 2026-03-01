import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

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

        // Fetch profile to get accurate subscription status
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/profile`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )

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

          // Get the most recent enrollment for expiry info
          const recentEnrollment = profile.enrollments?.[0]

          setStatus({
            isActive: isProfileActive && hasActiveEnrollment,
            hasActiveEnrollment,
            expiryDate: recentEnrollment?.end_date,
            paymentStatus: recentEnrollment?.payment_status,
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
