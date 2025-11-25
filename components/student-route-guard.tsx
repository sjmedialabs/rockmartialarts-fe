"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useStudentSubscription } from "@/hooks/use-student-subscription"
import SubscriptionExpiredModal from "@/components/subscription-expired-modal"
import { Loader2 } from "lucide-react"

interface StudentRouteGuardProps {
  children: React.ReactNode
}

/**
 * Route guard for student pages
 * Restricts access to all pages except payments when subscription is inactive
 */
export default function StudentRouteGuard({ children }: StudentRouteGuardProps) {
  const pathname = usePathname()
  const router = useRouter()
  const subscriptionStatus = useStudentSubscription()
  const [showModal, setShowModal] = useState(false)

  // Allow access to payment page regardless of subscription status
  const isPaymentPage = pathname === '/student-dashboard/payments'

  useEffect(() => {
    // Wait for loading to complete
    if (subscriptionStatus.loading) return

    const user = localStorage.getItem('user')
    if (!user) return

    const userData = JSON.parse(user)
    
    // Only apply restrictions to students
    if (userData.role !== 'student') return

    // If subscription is inactive and not on payment page
    if (!subscriptionStatus.isActive && !isPaymentPage) {
      // Show modal and redirect to payment page
      setShowModal(true)
    } else {
      setShowModal(false)
    }
  }, [subscriptionStatus, isPaymentPage, router])

  // Show loading state while checking subscription
  if (subscriptionStatus.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying subscription status...</p>
        </div>
      </div>
    )
  }

  // If subscription is inactive and not on payment page, show only the modal
  if (!subscriptionStatus.isActive && !isPaymentPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <SubscriptionExpiredModal
          isOpen={showModal}
          expiryDate={subscriptionStatus.expiryDate}
          paymentStatus={subscriptionStatus.paymentStatus}
          onClose={() => {
            // Prevent closing - user must go to payment page
          }}
        />
        <div className="text-center max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg 
                className="h-10 w-10 text-red-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Restricted
            </h2>
            <p className="text-gray-600 mb-4">
              Your subscription has expired. Please renew your subscription to continue accessing the platform.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Allow access to payment page or if subscription is active
  return <>{children}</>
}
