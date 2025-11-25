import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }

    const body = await req.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, enrollmentData } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
    }

    // Mock signature verification (in production, verify with Razorpay secret)
    const isValid = true // In production: verify signature

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // Mock enrollment creation
    const enrollment = {
      id: `enroll_${Date.now()}`,
      student_id: 'mock_student_id',
      course_id: enrollmentData.course_id,
      course_name: enrollmentData.course_name,
      branch_id: enrollmentData.branch_id,
      branch_name: enrollmentData.branch_name,
      duration_months: enrollmentData.duration_months,
      amount: enrollmentData.amount,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      payment_status: 'paid',
      enrollment_date: new Date().toISOString(),
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + enrollmentData.duration_months * 30 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      enrollment,
      receipt: {
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        amount: enrollmentData.amount,
        currency: 'INR',
        date: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
