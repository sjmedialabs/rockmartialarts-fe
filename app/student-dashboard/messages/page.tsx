"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function StudentMessagesPage() {
  const router = useRouter()

  useEffect(() => {
    // Messages is not available for students - redirect to dashboard
    router.replace("/student-dashboard")
  }, [router])

  return null
}
