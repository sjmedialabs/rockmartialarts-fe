# Student Subscription Access Control

This document explains the subscription-based access control system for inactive students.

## Overview

Inactive students (those with expired subscriptions) are restricted from accessing all pages in the student dashboard **except** the payment page. When a student with an expired subscription tries to access any page, they will:

1. See a loading screen while the system verifies their subscription status
2. Be shown a modal explaining their subscription has expired
3. Be restricted to only the payment page where they can renew

## Components

### 1. **useStudentSubscription Hook** (`hooks/use-student-subscription.ts`)

A custom React hook that:
- Fetches the student's profile from the API
- Checks if the profile is active (`is_active` field)
- Verifies if there's at least one active enrollment
- Returns subscription status including expiry date and payment status

**Usage:**
```typescript
const { isActive, hasActiveEnrollment, expiryDate, paymentStatus, loading } = useStudentSubscription()
```

### 2. **SubscriptionExpiredModal** (`components/subscription-expired-modal.tsx`)

A modal dialog that:
- Displays when a subscription is expired
- Shows the expiry date and payment status
- Provides a button to navigate to the payment page
- Cannot be dismissed (prevents closing with Esc or outside clicks)

**Features:**
- Clean, user-friendly design
- Clear call-to-action button
- Displays subscription details
- Loading state during navigation

### 3. **StudentRouteGuard** (`components/student-route-guard.tsx`)

A wrapper component that:
- Checks subscription status on every page load
- Allows access to the payment page regardless of status
- Blocks access to all other pages if subscription is inactive
- Shows appropriate loading and error states

**Protected Routes:**
- All student dashboard pages except `/student-dashboard/payments`

### 4. **Student Dashboard Layout** (`app/student-dashboard/layout.tsx`)

The layout wrapper that:
- Applies the StudentRouteGuard to all student dashboard pages
- Ensures consistent access control across the entire student section

## How It Works

### Flow Diagram

```
Student Accesses Page
        ↓
Check Subscription Status
        ↓
    ┌───────┴───────┐
    │               │
Active           Inactive
    │               │
    ↓               ↓
Grant Access   Check Current Page
                    │
            ┌───────┴───────┐
            │               │
     Payment Page    Other Page
            │               │
            ↓               ↓
      Grant Access   Show Modal + Block
                            ↓
                  Redirect to Payment
```

### Subscription Status Determination

A student is considered **inactive** when:
- Profile `is_active` field is `false`, OR
- No active enrollments exist, OR
- All enrollments have `payment_status` of "expired" or "cancelled"

A student is considered **active** when:
- Profile `is_active` field is `true`, AND
- At least one enrollment has:
  - `is_active` = `true`
  - `payment_status` ≠ "expired" and ≠ "cancelled"

## Testing

### Test Case 1: Active Student
**Setup:**
```javascript
// In localStorage or API response
{
  "profile": {
    "is_active": true,
    "enrollments": [
      {
        "is_active": true,
        "payment_status": "paid",
        "end_date": "2025-12-31"
      }
    ]
  }
}
```
**Expected:** Student can access all pages normally

### Test Case 2: Expired Subscription
**Setup:**
```javascript
{
  "profile": {
    "is_active": false,
    "enrollments": [
      {
        "is_active": false,
        "payment_status": "expired",
        "end_date": "2025-10-31"
      }
    ]
  }
}
```
**Expected:** 
- Student sees modal on any page except payments
- Can only access `/student-dashboard/payments`
- Modal shows expiry date and payment status

### Test Case 3: Payment Page Access
**Setup:** Same as Test Case 2 (expired)
**Action:** Navigate to `/student-dashboard/payments`
**Expected:** Student can access the payment page freely

## API Requirements

The backend API must support:

### Endpoint: `GET /api/auth/profile`
**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response:**
```json
{
  "message": "Profile retrieved successfully",
  "profile": {
    "id": "student_id",
    "email": "student@example.com",
    "is_active": true,
    "enrollments": [
      {
        "id": "enrollment_id",
        "course_name": "Course Name",
        "is_active": true,
        "payment_status": "paid",
        "start_date": "2025-01-01",
        "end_date": "2025-12-31"
      }
    ]
  }
}
```

**Payment Status Values:**
- `"paid"` - Active subscription
- `"pending"` - Payment pending
- `"expired"` - Subscription expired
- `"cancelled"` - Subscription cancelled

## Customization

### Changing Allowed Pages

To allow inactive students to access additional pages, update `student-route-guard.tsx`:

```typescript
// Current: Only payment page allowed
const isPaymentPage = pathname === '/student-dashboard/payments'

// Modified: Allow multiple pages
const allowedPages = [
  '/student-dashboard/payments',
  '/student-dashboard/profile',  // Allow profile access
  '/student-dashboard/help'       // Allow help access
]
const isAllowedPage = allowedPages.some(page => pathname.startsWith(page))
```

### Customizing the Modal

Edit `subscription-expired-modal.tsx` to:
- Change messaging
- Add custom branding
- Include contact information
- Add multiple payment options

### Styling

All components use Tailwind CSS classes. Customize by modifying:
- Color schemes (e.g., `bg-blue-600` → `bg-purple-600`)
- Spacing
- Typography
- Animations

## Security Considerations

1. **Client-Side Check Only**: The current implementation is client-side. The backend should also enforce access control.

2. **API Validation**: Always validate subscription status on the server for sensitive operations.

3. **Token Expiry**: Ensure JWT tokens are properly validated and refreshed.

4. **Data Consistency**: Keep subscription status in sync between frontend localStorage and backend database.

## Troubleshooting

### Modal Not Showing
- Check browser console for errors
- Verify API endpoint is accessible
- Confirm `is_active` field in profile response

### Infinite Loading
- Check network requests in DevTools
- Verify API is returning expected response format
- Check for JavaScript errors in console

### Can't Access Payment Page
- Verify route path matches exactly: `/student-dashboard/payments`
- Check if layout is properly wrapped
- Ensure no other route guards are interfering

## Future Enhancements

1. **Grace Period**: Allow X days of access after expiration
2. **Partial Access**: Grant limited feature access to expired users
3. **Trial Mode**: Different restrictions for trial vs. paid users
4. **Email Notifications**: Send reminders before expiration
5. **Auto-renewal**: Implement automatic subscription renewal
6. **Proration**: Handle pro-rated payments for renewals

## Related Files

- `/hooks/use-student-subscription.ts`
- `/components/subscription-expired-modal.tsx`
- `/components/student-route-guard.tsx`
- `/app/student-dashboard/layout.tsx`
- `/lib/studentProfileAPI.ts`
