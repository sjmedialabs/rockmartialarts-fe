import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { loadRazorpayScript } from '@/lib/razorpay'

interface RazorpayOptions {
  /** @deprecated Amount is derived from the enrollment on the server when creating the Razorpay order. */
  amount?: number
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
  const { access_token } = useAuth()
  // Prefer context token; fallback to localStorage (e.g. student login stores "token")
  const token = access_token ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null)

  const initiatePayment = useCallback(async (options: RazorpayOptions) => {
    setLoading(true)
    
    try {
      const loaded = await loadRazorpayScript()
      if (!loaded || typeof window === 'undefined' || !window.Razorpay) {
        throw new Error('Failed to load Razorpay. Please refresh and try again.')
      }

      const enrollmentId = options.enrollmentData?.enrollment_id
      if (!enrollmentId) {
        throw new Error('Missing enrollment. Complete checkout preparation first.')
      }

      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ enrollment_id: enrollmentId }),
      })

      if (!orderResponse.ok) {
        const err = await orderResponse.json().catch(() => ({}))
        const msg = err?.error || err?.detail || 'Failed to create order'
        console.error('[useRazorpay] create-order failed', orderResponse.status, err)
        throw new Error(typeof msg === 'string' ? msg : 'Payment failed, please try again')
      }

      const { order, key } = await orderResponse.json()

      if (!order?.id || typeof order.amount !== 'number' || order.amount < 100) {
        console.error('[useRazorpay] invalid order payload', { order, key: !!key })
        throw new Error('Payment failed, please try again')
      }

      // Open Razorpay checkout
      const razorpayOptions = {
        key,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Rock Martial Arts',
        description: `Enrollment: ${options.enrollmentData.course_name}`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            if (!token) throw new Error('Not logged in. Please log in and try again.')
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
          ondismiss: function () {
            setLoading(false)
            options.onFailure({ message: 'Payment cancelled' })
          },
        },
      }

      const razorpay = new window.Razorpay(razorpayOptions)
      razorpay.on('payment.failed', function (response: { error?: { description?: string; code?: string } }) {
        console.error('[useRazorpay] payment.failed', response)
        setLoading(false)
        const desc = response?.error?.description || response?.error?.code || 'Payment failed, please try again'
        options.onFailure(new Error(desc))
      })
      razorpay.open()
      setLoading(false)

    } catch (error) {
      setLoading(false)
      const friendly =
        error instanceof Error && error.message
          ? error.message
          : 'Payment failed, please try again'
      options.onFailure(error instanceof Error ? error : new Error(friendly))
    }
  }, [token])

  return { initiatePayment, loading }
}
