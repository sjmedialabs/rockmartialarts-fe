"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CoachMessagesPage() {
  const router = useRouter()

  useEffect(() => {
    // Messages is not available for coaches - redirect to dashboard
    router.replace("/coach-dashboard")
  }, [router])

  return null
}
