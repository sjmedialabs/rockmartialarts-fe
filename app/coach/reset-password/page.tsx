import { Suspense } from 'react'
import CoachResetPasswordForm from './CoachResetPasswordForm'

export default function CoachResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CoachResetPasswordForm />
    </Suspense>
  )
}
