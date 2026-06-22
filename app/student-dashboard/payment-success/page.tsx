"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import StudentDashboardLayout from "@/components/student-dashboard-layout"
import { PaymentReceipt } from "@/components/payment-receipt"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { studentProfileAPI } from "@/lib/studentProfileAPI"
import { usePreventBackNavigation } from "@/hooks/use-prevent-back-navigation"

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [studentName, setStudentName] = useState<string>("Student")
  const [loading, setLoading] = useState(true)

  usePreventBackNavigation(true)

  const paymentId = searchParams.get("payment_id") || ""
  const orderId = searchParams.get("order_id") || paymentId
  const amount = parseFloat(searchParams.get("amount") || "0")
  const courseName = searchParams.get("course_name") || "Course Enrollment"
  const branchName = searchParams.get("branch_name") || "Main Branch"

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const response = await studentProfileAPI.getProfile(token)
        const profile = response.profile
        setStudentName(profile.full_name || `${profile.first_name} ${profile.last_name}`)
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    void fetchStudentProfile()
  }, [])

  const goToCourses = () => {
    router.replace("/student-dashboard/courses")
  }

  if (!paymentId) {
    return (
      <StudentDashboardLayout>
        <div className="container mx-auto p-6 max-w-3xl">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-red-600">Invalid Payment Information</h1>
            <p className="text-muted-foreground">No payment details found. Please try again.</p>
            <Button onClick={goToCourses}>Continue to My Courses</Button>
          </div>
        </div>
      </StudentDashboardLayout>
    )
  }

  if (loading) {
    return (
      <StudentDashboardLayout>
        <div className="container mx-auto p-6 max-w-3xl flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        </div>
      </StudentDashboardLayout>
    )
  }

  return (
    <StudentDashboardLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-green-700 mb-2">Payment successful</h1>
          <p className="text-muted-foreground">
            Your enrollment is confirmed. Continue to view your courses.
          </p>
        </div>

        <PaymentReceipt
          paymentId={paymentId}
          orderId={orderId}
          amount={amount}
          courseName={courseName}
          branchName={branchName}
          date={new Date().toISOString()}
          studentName={studentName}
          currency="INR"
        />

        <div className="mt-8 text-center">
          <Button
            onClick={goToCourses}
            size="lg"
            className="bg-amber-600 hover:bg-amber-700"
          >
            Continue to My Courses
          </Button>
        </div>
      </div>
    </StudentDashboardLayout>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <StudentDashboardLayout>
          <div className="container mx-auto p-6 max-w-3xl flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        </StudentDashboardLayout>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  )
}
