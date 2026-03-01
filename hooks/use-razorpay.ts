import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface RazorpayOptions {
  amount: number
  currency?: string
  enrollmentData: any
  onSuccess: (response: any) => void
  onFailure: (error: any) => void
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export function useRazorpay() {
  const [loading, setLoading] = useState(false)
  const { token } = useAuth()

  const initiatePayment = useCallback(async (options: RazorpayOptions) => {
    setLoading(true)
    
    try {
      // Create order on backend
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: options.amount,
          currency: options.currency || 'INR',
          enrollmentData: options.enrollmentData
        })
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to create order')
      }

      const { order, key } = await orderResponse.json()

      // Open Razorpay checkout
      const razorpayOptions = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'Rock Martial Arts',
        description: `Enrollment: ${options.enrollmentData.course_name}`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // Verify payment on backend
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                enrollmentData: options.enrollmentData
              })
            })

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed')
            }

            const result = await verifyResponse.json()
            options.onSuccess(result)
          } catch (error) {
            options.onFailure(error)
          }
        },
        prefill: {
          name: options.enrollmentData.student_name || '',
          email: options.enrollmentData.student_email || '',
          contact: options.enrollmentData.student_phone || ''
        },
        theme: {
          color: '#f59e0b'
        },
        modal: {
          ondismiss: function() {
            setLoading(false)
            options.onFailure({ message: 'Payment cancelled' })
          }
        }
      }

      const razorpay = new window.Razorpay(razorpayOptions)
      razorpay.open()
      setLoading(false)

    } catch (error) {
      setLoading(false)
      options.onFailure(error)
    }
  }, [token])

  return { initiatePayment, loading }
}
