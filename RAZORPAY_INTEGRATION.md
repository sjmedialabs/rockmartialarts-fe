# Razorpay Payment Integration

## Overview
Complete Razorpay payment gateway integration for course enrollments with receipt generation and social sharing.

## Features
1. **Razorpay Checkout**: Secure payment gateway integration
2. **Payment Receipt**: Professional receipt with all payment details
3. **Download as PDF**: Print/save receipt as PDF
4. **Social Sharing**: Share enrollment success on Facebook, Twitter, LinkedIn, WhatsApp
5. **Native Share API**: Support for mobile native sharing

## Implementation

### API Endpoints
- `POST /api/payments/create-order` - Creates Razorpay order
- `POST /api/payments/verify` - Verifies payment signature and creates enrollment

### Frontend Components
- `hooks/use-razorpay.ts` - Razorpay payment hook
- `components/payment-receipt.tsx` - Receipt component with sharing
- `app/student-dashboard/payment-success/page.tsx` - Success page

### Payment Flow
1. Student selects course, branch, and duration
2. Clicks "Proceed to Payment"
3. System creates Razorpay order via API
4. Razorpay checkout modal opens
5. Student completes payment
6. Payment is verified on backend
7. Student redirected to success page with receipt
8. Receipt can be downloaded or shared on social media

## Environment Variables
Add to `.env.local`:
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## Production Setup
1. Replace mock order creation with actual Razorpay SDK:
   ```typescript
   const Razorpay = require('razorpay')
   const razorpay = new Razorpay({
     key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
     key_secret: process.env.RAZORPAY_KEY_SECRET
   })
   ```

2. Implement signature verification in `/api/payments/verify`:
   ```typescript
   const crypto = require('crypto')
   const generated_signature = crypto
     .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
     .update(razorpay_order_id + "|" + razorpay_payment_id)
     .digest('hex')
   
   if (generated_signature === razorpay_signature) {
     // Payment verified
   }
   ```

3. Connect to actual database for enrollment creation

## Social Sharing
- **Facebook**: Share page URL
- **Twitter**: Share with custom message
- **LinkedIn**: Professional sharing
- **WhatsApp**: Direct message sharing
- **Native**: Use device's native share menu (mobile)

## Testing
Currently using mock data. Test the flow:
1. Navigate to `/student-dashboard/courses`
2. Click "Enroll Now" on available course
3. Select branch and duration
4. Click "Proceed to Payment"
5. Razorpay checkout opens (mock mode)
6. Complete payment
7. View receipt and test download/share features

## Notes
- Payment receipt is print-friendly
- Social share opens in popup window
- Mobile devices use native share API when available
- Receipt includes all transaction details
