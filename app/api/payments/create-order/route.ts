import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }

    const body = await req.json()
    const { amount, currency = 'INR', enrollmentData } = body

    if (!amount || !enrollmentData) {
      return NextResponse.json({ error: 'Amount and enrollment data required' }, { status: 400 })
    }

    // Mock Razorpay order creation
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const order = {
      id: orderId,
      entity: 'order',
      amount: amount * 100,
      amount_paid: 0,
      amount_due: amount * 100,
      currency,
      receipt: `receipt_${Date.now()}`,
      status: 'created',
      attempts: 0,
      notes: {
        course_id: enrollmentData.course_id,
        branch_id: enrollmentData.branch_id,
        duration_months: enrollmentData.duration_months
      },
      created_at: Math.floor(Date.now() / 1000)
    }

    return NextResponse.json({
      success: true,
      order,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock_key'
    })

  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
