"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState(["", "", "", ""])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple characters

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace to go to previous input
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join("")
    console.log("OTP Code:", otpCode)
    window.location.href = "/success"
  }

  const handleResendOTP = () => {
    console.log("Resending OTP...")
    // Handle resend OTP logic here
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-200 items-center justify-center relative overflow-hidden">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/otp-left.png')",
          }}
        />
      </div>

      {/* Right Side - OTP Verification Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative">
        {/* Back to Login Link */}
        <Link
          href="/login"
          className="absolute top-8 right-8 text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
        >
          <span>←</span> Back to login
        </Link>

        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-black">OTP CODE VERIFICATION</h1>
            <p className="text-gray-600 text-sm">We sent a OTP to register mobile number xxxxxxx346</p>
          </div>

          {/* OTP Form */}
          <form onSubmit={handleVerifyOTP} className="space-y-8">
            {/* Code from SMS Label */}
            <div className="text-center">
              <p className="text-gray-500 text-sm mb-4">Code from SMS</p>
            </div>

            {/* OTP Input Fields */}
            <div className="flex justify-center gap-4">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-16 h-16 text-center text-2xl font-bold bg-gray-50 border-gray-200 rounded-lg focus:border-yellow-400 focus:ring-yellow-400"
                  placeholder={String(index + 1)}
                />
              ))}
            </div>

            {/* Verify Button */}
            <Button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg text-lg"
            >
              Verify Now
            </Button>

            {/* Resend Link */}
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Don't Receive the email?{" "}
                <button type="button" onClick={handleResendOTP} className="text-red-500 hover:text-red-600 font-medium">
                  Click to Resend
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
