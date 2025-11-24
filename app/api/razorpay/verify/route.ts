import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body

    if (!razorpay_payment_id) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    // If signature verification is needed (when using order_id)
    if (razorpay_order_id && razorpay_signature) {
      const secret = process.env.RAZORPAY_KEY_SECRET

      if (!secret) {
        console.error('Razorpay secret not configured')
        return NextResponse.json(
          { error: 'Payment verification failed - configuration error' },
          { status: 500 }
        )
      }

      // Create signature
      const body_string = razorpay_order_id + '|' + razorpay_payment_id
      const generated_signature = crypto
        .createHmac('sha256', secret)
        .update(body_string)
        .digest('hex')

      // Verify signature
      if (generated_signature !== razorpay_signature) {
        return NextResponse.json(
          { error: 'Payment verification failed - invalid signature', verified: false },
          { status: 400 }
        )
      }
    }

    // Payment is verified
    return NextResponse.json({
      verified: true,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      message: 'Payment verified successfully'
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Payment verification failed', verified: false },
      { status: 500 }
    )
  }
}
