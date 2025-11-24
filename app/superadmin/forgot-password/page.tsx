"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import * as tokenUtils from "@/lib/tokenUtils"

export default function SuperadminForgotPasswordPage() {
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
      // Use the backend superadmin forgot password endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/superadmin/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        const result = await response.json()
        setSuccess(true)
        toast({
          title: "Reset Link Sent",
          description: result.message || "If a superadmin account exists with this email, you'll receive reset instructions.",
          variant: "default",
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to send reset email')
      }

    } catch (error) {
      console.error('Password reset error:', error)
      setError("Unable to process request. Please try again later.")
      toast({
        title: "Error",
        description: "Unable to send reset email. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h2>
            <p className="text-gray-600 mb-6">
              If a superadmin account exists with <strong>{email}</strong>, you'll receive password reset instructions shortly.
            </p>
            <div className="space-y-3">
              <Link href="/superadmin/login">
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  Back to Superadmin Login
                </Button>
              </Link>
              <button
                onClick={() => {
                  setSuccess(false)
                  setEmail("")
                }}
                className="w-full text-red-600 hover:text-red-800 font-medium"
              >
                Send Another Reset Link
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Superadmin Password</h1>
          <p className="text-gray-600">Enter your superadmin email to receive reset instructions</p>
        </div>

        <form onSubmit={handleResetRequest} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Superadmin Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="superadmin@example.com"
              className="w-full"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/superadmin/login" className="text-red-600 hover:text-red-800 font-medium">
            ← Back to Superadmin Login
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-600 mb-4">Need a different type of account?</p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link 
              href="/forgot-password" 
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Student Reset
            </Link>
            <span className="text-gray-300">|</span>
            <Link 
              href="/coach/forgot-password" 
              className="text-orange-600 hover:text-orange-800 font-medium transition-colors"
            >
              Coach Reset
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
