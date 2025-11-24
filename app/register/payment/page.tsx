"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRegistration } from "@/contexts/RegistrationContext"
import { openRazorpayCheckout, type RazorpayPaymentResponse } from "@/lib/razorpay"

interface PaymentCalculation {
  course_fee: number
  admission_fee: number
  total_amount: number
  currency: string
  duration_multiplier: number
}

interface CoursePaymentInfo {
  course_id: string
  course_name: string
  category_name: string
  branch_name: string
  duration: string
  pricing: PaymentCalculation
}

export default function PaymentPage() {
  const router = useRouter()
  const { registrationData, updateRegistrationData } = useRegistration()

  const [paymentInfo, setPaymentInfo] = useState<CoursePaymentInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")

  // Fetch payment information when component mounts
  useEffect(() => {
    const fetchPaymentInfo = async () => {
      console.log('=== PAYMENT PAGE DEBUG ===')
      console.log('Course ID:', registrationData.course_id)
      console.log('Branch ID:', registrationData.branch_id)
      console.log('Registration data:', registrationData)
      
      try {
        // Fetch course details to get actual price
        const courseResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/courses/${registrationData.course_id}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        )

        let coursePrice = 1000
        let courseName = "Selected Course"
        
        if (courseResponse.ok) {
          const courseData = await courseResponse.json()
          courseName = courseData.name || courseName
          
          if (courseData.pricing) {
            if (typeof courseData.pricing === 'object' && courseData.pricing.amount) {
              coursePrice = courseData.pricing.amount
            } else if (typeof courseData.pricing === 'number') {
              coursePrice = courseData.pricing
            }
          } else if (courseData.price) {
            coursePrice = courseData.price
          } else if (courseData.fee) {
            coursePrice = courseData.fee
          }
        }

        // Always use 1 month duration
        const oneMonthDuration = "1-month"
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/courses/${registrationData.course_id}/payment-info?` +
          `branch_id=${registrationData.branch_id}&duration=${oneMonthDuration}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        )

        if (response.ok) {
          const data = await response.json()
          data.duration = "1 month"
          setPaymentInfo(data)
        } else {
          const courseFeeOneMonth = coursePrice
          const admissionFee = 500
          
          setPaymentInfo({
            course_id: registrationData.course_id || "unknown",
            course_name: courseName,
            category_name: "Martial Arts",
            branch_name: "Selected Branch",
            duration: "1 month",
            pricing: {
              course_fee: courseFeeOneMonth,
              admission_fee: admissionFee,
              total_amount: courseFeeOneMonth + admissionFee,
              currency: "INR",
              duration_multiplier: 1.0
            }
          })
        }
      } catch (error) {
        console.error('Error fetching payment info:', error)
        setPaymentInfo({
          course_id: registrationData.course_id || "unknown",
          course_name: "Selected Course",
          category_name: "Martial Arts",
          branch_name: "Selected Branch",
          duration: "1 month",
          pricing: {
            course_fee: 1000,
            admission_fee: 500,
            total_amount: 1500,
            currency: "INR",
            duration_multiplier: 1.0
          }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentInfo()
  }, [registrationData.course_id, registrationData.branch_id])

  const handlePayment = async () => {
    if (!paymentInfo) {
      setError("Payment information not loaded")
      return
    }

    setProcessing(true)
    setError("")

    try {
      await openRazorpayCheckout({
        amount: paymentInfo.pricing.total_amount,
        currency: paymentInfo.pricing.currency,
        name: "Marshalats Academy",
        description: `${paymentInfo.course_name} - ${paymentInfo.duration}`,
        customerName: registrationData.fullName || registrationData.name,
        customerEmail: registrationData.email,
        customerContact: registrationData.phone,
        onSuccess: async (response: RazorpayPaymentResponse) => {
          console.log('Payment successful:', response)
          
          // Save payment details to registration context
          updateRegistrationData({
            paymentId: response.razorpay_payment_id,
            paymentStatus: 'completed',
            paymentMethod: 'razorpay',
            amount: paymentInfo.pricing.total_amount
          })

          // Navigate to confirmation page
          router.push('/register/payment-confirmation')
        },
        onDismiss: () => {
          setProcessing(false)
          setError("Payment cancelled by user")
        }
      })
    } catch (err) {
      console.error('Payment error:', err)
      setError(err instanceof Error ? err.message : "Failed to initialize payment")
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-200 items-center justify-center relative overflow-hidden">
        <div
          className="w-[512px] h-[748px] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/payment-left.png')" }}
        />
      </div>

      {/* Right Side - Payment Details */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white mt-[100px]">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-black">Payment Details</h1>
            <p className="text-gray-500 text-sm">Review your order and proceed with payment.</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Payment Summary Card */}
          {paymentInfo && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-6">
              {/* Course Information */}
              <div className="text-center border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-black mb-1">{paymentInfo.course_name}</h3>
                <p className="text-sm text-gray-600">{paymentInfo.category_name} • {paymentInfo.branch_name}</p>
                <p className="text-sm text-gray-500">Payment Duration: {paymentInfo.duration}</p>
              </div>

              {/* Total Amount */}
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-2">Total Payable Amount (1 Month)</p>
                <p className="text-4xl font-bold text-black">₹{paymentInfo.pricing.total_amount.toLocaleString()}</p>
              </div>

              {/* Fee Breakdown */}
              <div className="space-y-4">
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-black mb-3">Fee Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-gray-700 font-medium">Admission Fee</span>
                      </div>
                      <span className="text-gray-900 font-semibold">₹{paymentInfo.pricing.admission_fee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-white rounded-lg border border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <span className="text-gray-700 font-medium">Course Fee (1 month)</span>
                      </div>
                      <span className="text-gray-900 font-semibold">₹{paymentInfo.pricing.course_fee.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Powered by Razorpay</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Secure Payment</h4>
                <p className="text-xs text-blue-700">Your payment is processed securely through Razorpay. We accept UPI, Credit/Debit Cards, Net Banking, and Wallets.</p>
              </div>
            </div>
          </div>

          {/* Pay Now Button */}
          <Button
            onClick={handlePayment}
            disabled={processing || !paymentInfo}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-4 px-6 rounded-xl text-sm h-14 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>PAY NOW - ₹{paymentInfo?.pricing.total_amount.toLocaleString()}</span>
              </div>
            )}
          </Button>

          {/* Step Indicator */}
          <div className="text-center py-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Link href="/register" className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-green-600 transition-colors">1</Link>
              <div className="w-8 h-1 bg-green-500 rounded"></div>
              <Link href="/register/select-course" className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-green-600 transition-colors">2</Link>
              <div className="w-8 h-1 bg-green-500 rounded"></div>
              <Link href="/register/select-branch" className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-green-600 transition-colors">3</Link>
              <div className="w-8 h-1 bg-green-500 rounded"></div>
              <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-sm">4</div>
              <div className="w-8 h-1 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm">5</div>
            </div>
            <span className="text-gray-500 text-sm font-medium">Step 4 of 5 - Payment</span>
          </div>
        </div>
      </div>
    </div>
  )
}
