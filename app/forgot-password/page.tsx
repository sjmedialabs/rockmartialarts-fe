"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import * as tokenUtils from "@/lib/tokenUtils"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!email.trim()) {
      setError("Email is required")
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      return
    }

    setError("")
    setLoading(true)

    try {
      // Check if user exists in the backend first
      let userExists = false
      let userName = 'User'

      try {
        const userCheckResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/check-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: email.trim() })
        })

        if (userCheckResponse.ok) {
          const userData = await userCheckResponse.json()
          userExists = userData.exists
          userName = userData.name || 'User'
          console.log('✅ User check successful:', { exists: userExists, name: userName })
        } else {
          console.log('⚠️ User check endpoint not available, assuming user exists for security')
          // Assume user exists for security (prevents user enumeration)
          userExists = true
          userName = 'User'
        }
      } catch (error) {
        console.log('⚠️ User check failed, assuming user exists for security:', error)
        // Assume user exists for security (prevents user enumeration)
        userExists = true
        userName = 'User'
      }

      // Generate password reset token
      const resetToken = await tokenUtils.createPasswordResetToken(email.trim(), 15)

      // Prepare email content based on user existence
      let emailPayload

      if (userExists) {
        // Password reset email for existing user
        const resetLink = `${window.location.origin}/reset-password?token=${resetToken}`

        const subject = 'Password Reset Request - Martial Arts Academy'

        const textMessage = `
Hello ${userName},

We received a request to reset your password for your Martial Arts Academy account.

To reset your password, please click the link below:
${resetLink}

This link will expire in 15 minutes for security reasons.

If you did not request this password reset, please ignore this email and your password will remain unchanged.

Best regards,
Martial Arts Academy Team

This is an automated message. Please do not reply to this email.
        `.trim()

        const htmlMessage = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #ffffff; padding: 30px; border: 1px solid #e9ecef; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6c757d; }
        .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .button:hover { background-color: #0056b3; }
        .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Password Reset Request</h1>
    </div>

    <div class="content">
        <p>Hello <strong>${userName}</strong>,</p>

        <p>We received a request to reset your password for your Martial Arts Academy account.</p>

        <p>To reset your password, please click the button below:</p>

        <div style="text-align: center;">
            <a href="${resetLink}" class="button">Reset My Password</a>
        </div>

        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 4px;">
            ${resetLink}
        </p>

        <div class="warning">
            <strong>⚠️ Important:</strong> This link will expire in 15 minutes for security reasons.
        </div>

        <p>If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>
    </div>

    <div class="footer">
        <p>Best regards,<br>Martial Arts Academy Team</p>
        <p>This is an automated message. Please do not reply to this email.</p>
    </div>
</body>
</html>
        `.trim()

        emailPayload = {
          to_email: email.trim(),
          subject,
          message: textMessage,
          html_message: htmlMessage
        }

        console.log('✅ Prepared password reset email for existing user:', email.trim())
      } else {
        // Security notification for non-existent user
        const subject = 'Security Alert - Password Reset Attempt'

        const textMessage = `
Security Alert

Someone attempted to reset the password for an account associated with this email address (${email.trim()}) on our Martial Arts Academy platform.

If this was you, please note that no account exists with this email address. You may want to:
- Check if you used a different email address to register
- Create a new account if you haven't registered yet

If this wasn't you, you can safely ignore this email. No account or personal information has been compromised.

For security reasons, we send this notification to all email addresses that are used in password reset attempts.

Best regards,
Martial Arts Academy Security Team

This is an automated security message. Please do not reply to this email.
        `.trim()

        const htmlMessage = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Alert - Password Reset Attempt</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #fff3cd; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; border: 1px solid #ffeaa7; }
        .content { background-color: #ffffff; padding: 30px; border: 1px solid #e9ecef; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6c757d; }
        .alert { background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .info { background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔒 Security Alert</h1>
    </div>

    <div class="content">
        <div class="alert">
            <strong>⚠️ Password Reset Attempt Detected</strong>
        </div>

        <p>Someone attempted to reset the password for an account associated with this email address (<strong>${email.trim()}</strong>) on our Martial Arts Academy platform.</p>

        <div class="info">
            <p><strong>What happened?</strong></p>
            <p>A password reset was requested for this email address, but no account exists with this email in our system.</p>
        </div>

        <p><strong>If this was you:</strong></p>
        <ul>
            <li>Check if you used a different email address to register</li>
            <li>Create a new account if you haven't registered yet</li>
            <li>Contact our support team if you need assistance</li>
        </ul>

        <p><strong>If this wasn't you:</strong></p>
        <ul>
            <li>You can safely ignore this email</li>
            <li>No account or personal information has been compromised</li>
            <li>This is just a security notification</li>
        </ul>

        <div class="info">
            <p><strong>Why did I receive this?</strong></p>
            <p>For security reasons, we send notifications to all email addresses used in password reset attempts, regardless of whether an account exists.</p>
        </div>
    </div>

    <div class="footer">
        <p>Best regards,<br>Martial Arts Academy Security Team</p>
        <p>This is an automated security message. Please do not reply to this email.</p>
    </div>
</body>
</html>
        `.trim()

        emailPayload = {
          to_email: email.trim(),
          subject,
          message: textMessage,
          html_message: htmlMessage
        }

        console.log('✅ Prepared security notification for non-existent user:', email.trim())
      }

      // Send email using backend API
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/email/send-webhook-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      })

      if (emailResponse.ok) {
        const emailResult = await emailResponse.json()
        console.log('✅ Email sent successfully via backend API:', emailResult[0]?.messageId)

        // Always show success message (security best practice)
        setSuccess(true)
        toast({
          title: "Reset Link Sent",
          description: "If an account with that email exists, a password reset link has been sent.",
          variant: "default"
        })
      } else {
        const errorData = await emailResponse.json()
        throw new Error(errorData.detail || 'Failed to send email via backend API')
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      setError(error instanceof Error ? error.message : 'Failed to send reset link. Please try again.')
      toast({
        title: "Error",
        description: "Failed to send reset link. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#E0E0E0] items-center justify-center relative overflow-hidden">
        <div
          className="w-[550px] h-[550px] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/forgot-password-left.png')",
          }}
        />
      </div>

      {/* Right Side - Forgot Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
        

        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            {/* Back to login link */}
         
          <Link href="/login" className="text-sm text-[#000] mb-[20px] hover:text-gray-600 flex items-center justify-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to login</span>
          </Link>
        
            <h1 className="text-2xl font-bold text-black">FORGOT PASSWORD</h1>
            <p className="text-gray-500 text-sm">
              {success
                ? "Check your email for reset instructions"
                : "No worries, we will send you reset instructions"
              }
            </p>
          </div>

          {success ? (
            /* Success Message */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-900">Email Sent!</h2>
                <p className="text-gray-600 text-sm">
                  We've sent password reset instructions to <strong>{email}</strong>
                </p>
                <p className="text-gray-500 text-xs">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    setSuccess(false)
                    setEmail("")
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Try Different Email
                </Button>
                <Link href="/login">
                  <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Reset Form */
            <form onSubmit={handleResetRequest} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your registered email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError("")
                  }}
                  className={`pl-5 py-4 text-[8px] bg-[#F9F8FF] border-0 rounded-xl h-14 data-[placeholder]:text-black ${
                    error ? 'border-red-300 focus:border-red-500' : ''
                  }`}
                  disabled={loading}
                />
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
              </div>

              {/* Reset Button */}
              <Button
                type="submit"
                disabled={loading}
               className="w-full bg-yellow-400 hover:bg-yellow-500 text-[#ffffff] font-bold py-4 px-6 rounded-xl text-[12px] h-14 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
