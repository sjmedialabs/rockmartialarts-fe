import { NextRequest, NextResponse } from 'next/server'
import { getBackendProxyBaseUrl } from '@/lib/serverBackendUrl'

/**
 * Creates a real Razorpay order for a pending LMS enrollment.
 * Amount is always taken from the enrollment on the server (never trust client money fields).
 */
export async function POST(req: NextRequest) {
  const BACKEND_URL = getBackendProxyBaseUrl().replace(/\/$/, '')
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const enrollmentId =
      (typeof body.enrollment_id === 'string' && body.enrollment_id) ||
      (typeof body.enrollmentData?.enrollment_id === 'string' && body.enrollmentData.enrollment_id)

    if (!enrollmentId) {
      return NextResponse.json(
        { error: 'Missing enrollment_id (complete checkout preparation first).' },
        { status: 400 }
      )
    }

    const res = await fetch(`${BACKEND_URL}/api/payments/students/razorpay/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({ enrollment_id: enrollmentId }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const message =
        typeof data?.detail === 'string'
          ? data.detail
          : Array.isArray(data?.detail)
            ? data.detail.map((o: { msg?: string }) => o?.msg).filter(Boolean).join('; ') ||
              'Could not create payment order'
            : data?.message ?? data?.error ?? 'Could not create payment order'
      console.error('[create-order] backend error', res.status, message, { enrollmentId })
      return NextResponse.json({ error: message }, { status: res.status })
    }

    const order = data?.order
    if (!order?.id || typeof order.amount !== 'number') {
      console.error('[create-order] invalid backend payload', data)
      return NextResponse.json({ error: 'Invalid order response from server' }, { status: 502 })
    }

    const key = typeof data.key === 'string' ? data.key : ''
    if (!key) {
      console.error('[create-order] missing Razorpay key_id from backend')
      return NextResponse.json(
        { error: 'Payment gateway is not fully configured on the server.' },
        { status: 503 }
      )
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency || 'INR',
      },
      key,
    })
  } catch (e) {
    console.error('[create-order]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
