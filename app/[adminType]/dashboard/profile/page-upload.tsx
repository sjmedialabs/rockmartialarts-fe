"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, Calendar, Shield, Edit, Save, X, Camera } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"
import { useToast } from "@/hooks/use-toast"
import { TokenManager } from "@/lib/tokenManager"

// Add this near the top after imports
const [profileImage, setProfileImage] = useState<string>("/placeholder.svg")
const [imageFile, setImageFile] = useState<File | null>(null)
const fileInputRef = useRef<HTMLInputElement>(null)

// Add this useEffect to load saved profile image
useEffect(() => {
  const savedImage = localStorage.getItem("profileImage")
  if (savedImage) {
    setProfileImage(savedImage)
  }
}, [])

// Add image upload handler
const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive"
      })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setProfileImage(base64String)
      localStorage.setItem("profileImage", base64String)
      
      // Trigger a custom event to update the header
      window.dispatchEvent(new Event('profileImageUpdated'))
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      })
    }
    reader.readAsDataURL(file)
    setImageFile(file)
  }
}

const triggerFileInput = () => {
  fileInputRef.current?.click()
}
