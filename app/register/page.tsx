"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRegistration } from "@/contexts/RegistrationContext"
import { Calendar } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const { registrationData, updateRegistrationData } = useRegistration()
  
  const [formData, setFormData] = useState({
    firstName: registrationData.firstName || "",
    lastName: registrationData.lastName || "",
    email: registrationData.email || "",
    mobile: registrationData.mobile || "",
    gender: registrationData.gender || "",
    dob: registrationData.dob || "",
    password: registrationData.password || "",
  })

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    // Update registration context with form data
    updateRegistrationData({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      mobile: formData.mobile,
      gender: formData.gender,
      dob: formData.dob,
      password: formData.password,
    })
    router.push("/register/select-course")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-200 items-center justify-center relative overflow-hidden">
        <div
          className="w-[550px] h-[550px] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/registration-left.png')",
          }}
        />
      </div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white lg:mt-[100px]">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-black">Registration</h1>
            <p className="text-gray-500 text-sm">Please login to continue to your account.</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleNextStep} className="space-y-3">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                
                <Input
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className="pl-5 py-4 text-[8px] bg-[#F9F8FF] border-0 rounded-xl h-14 placeholder:text-[#000] "
                  required
                />
              </div>
              <div className="relative">
               
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className="pl-5 py-4 text-[8px] bg-[#F9F8FF] border-0 rounded-xl h-14 placeholder:text-[#000]"
                  required
                />
              </div>
            </div>

            {/* Email and Mobile Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="pl-5 py-4 text-[8px] bg-[#F9F8FF] border-0 rounded-xl h-14 placeholder:text-[#000]"
                  required
                />
              </div>
              <div className="relative">
                
                <Input
                  type="tel"
                  placeholder="Mobile Number"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange("mobile", e.target.value)}
                  className="pl-5 py-4 text-[8px] bg-[#F9F8FF] border-0 rounded-xl h-14 placeholder:text-[#000]"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="relative">
             
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="pl-5 py-4 text-[8px] bg-[#F9F8FF] border-0 rounded-xl h-14 placeholder:text-[#000]"
                required
              />
            </div>

            {/* Gender and DOB Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
              
                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)} >
                  <SelectTrigger className="!w-full !h-14 !pl-5 !pr-4 !py-4 !text-base !bg-[#F9F8FF] !border-0 !rounded-xl focus:outline-none focus:ring-2  !min-h-14 ">
                    <SelectValue placeholder="Select Gender" className="text-gray-500 placeholder:text-[#000]" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border border-gray-200 bg-white shadow-lg max-h-60">
                    <SelectItem value="male" className="!py-3 !pl-3 pr-8 text-base hover:bg-gray-50 rounded-lg cursor-pointer">Male</SelectItem>
                    <SelectItem value="female" className="!py-3 !pl-3 pr-8 text-base hover:bg-gray-50 rounded-lg cursor-pointer">Female</SelectItem>
                    <SelectItem value="other" className="!py-3 !pl-3 pr-8 text-base hover:bg-gray-50 rounded-lg cursor-pointer">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                
                <Input
                  type="date"
                  placeholder="Date of Birth"
                  value={formData.dob}
                  onChange={(e) => handleInputChange("dob", e.target.value)}
                  className="pl-5 py-4 text-[8px] bg-[#F9F8FF] border-0 rounded-xl h-14 placeholder:text-[#000]"
                  required
                />
              </div>
            </div>

            {/* Next Step Button */}
            <Button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-[#ffffff] font-bold py-4 px-6 rounded-xl text-[12px] h-14 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl mt-8"
            >
              NEXT STEP
            </Button>
          </form>

          {/* Step Indicator */}
          <div className="text-center py-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-sm">1</div>
              <div className="w-8 h-1 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm">2</div>
              <div className="w-8 h-1 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm">3</div>
              <div className="w-8 h-1 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm">4</div>
              <div className="w-8 h-1 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm">5</div>
            </div>
            <span className="text-gray-500 text-sm font-medium">Step 1 of 5 - Personal Information</span>
          </div>

        </div>
      </div>
    </div>
  )
}
