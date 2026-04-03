"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import paymentAPI from "@/lib/paymentAPI"
import { getBackendApiUrl } from "@/lib/config"

interface Payment {
  id: string
  student_id?: string
  student_name?: string | null
  amount?: number | null
  payment_type?: string
  payment_method?: string | null
  gateway_payment_label?: string | null
  payment_status: string
  transaction_id?: string | null
  payment_date?: string | null
  course_name?: string | null
  branch_name?: string | null
  branch_id?: string | null
  created_at?: string | null
}

interface PaymentStats {
  total_collected: number
  pending_payments: number
  total_students: number
  this_month_collection: number
}

interface BranchOption {
  id: string
  name: string
}

export default function PaymentTrackingPage() {
  const { toast } = useToast()
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<PaymentStats>({
    total_collected: 0,
    pending_payments: 0,
    total_students: 0,
    this_month_collection: 0
  })
  const [loading, setLoading] = useState(true)
  const [branchesLoading, setBranchesLoading] = useState(true)
  const [branchOptions, setBranchOptions] = useState<BranchOption[]>([])
  const [branchFilter, setBranchFilter] = useState<string>("all")
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchPayments()
    fetchStats()
  }, [])

  useEffect(() => {
    const loadBranches = async () => {
      try {
        setBranchesLoading(true)
        const token = localStorage.getItem("token")
        const res = await fetch(getBackendApiUrl("branches?skip=0&limit=100"), {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        if (!res.ok) return
        const data = await res.json()
        const raw = data.branches || []
        const opts: BranchOption[] = raw.map((b: { id: string; branch?: { name?: string }; name?: string }) => ({
          id: b.id,
          name: b.branch?.name || b.name || "Branch",
        }))
        setBranchOptions(opts)
      } catch (e) {
        console.error("Error fetching branches:", e)
      } finally {
        setBranchesLoading(false)
      }
    }
    loadBranches()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(getBackendApiUrl("payments?skip=0&limit=100"), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments || [])
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(getBackendApiUrl("payments/stats"), {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching payment stats:", error)
    }
  }

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesBranch =
        branchFilter === "all" ||
        (payment.branch_id && payment.branch_id === branchFilter) ||
        (!payment.branch_id && branchFilter === "unassigned")

      return matchesBranch
    })
  }, [payments, branchFilter])

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return "Invalid Date"
    }
  }

  const describePayment = (payment: Payment) => {
    const source = paymentAPI.formatPaymentSource(payment)
    const tid = payment.transaction_id || "N/A"
    return `${source} · ${tid}`
  }

  const handleExport = async () => {
    if (exporting) return

    setExporting(true)
    try {
      toast({
        title: "Exporting payments...",
        description: "Your payment report is being generated.",
      })

      await paymentAPI.exportPayments({
        format: "csv",
        ...(branchFilter && branchFilter !== "all" && branchFilter !== "unassigned"
          ? { branch_id: branchFilter }
          : {}),
      })

      toast({
        title: "Export successful",
        description: "Payment report has been downloaded.",
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Failed to export payment report",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="w-full p-4 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment Tracking</h1>

        <div className="flex flex-wrap items-center justify-between gap-4 border-1 shadow overflow-x-auto p-6 mb-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Select Branch:</span>
            <Select value={branchFilter} onValueChange={setBranchFilter} disabled={branchesLoading}>
              <SelectTrigger className="w-48 bg-gray-100 text-gray-600 border-0">
                <SelectValue placeholder={branchesLoading ? "Loading…" : "Choose branch"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All branches</SelectItem>
                <SelectItem value="unassigned">No branch on record</SelectItem>
                {branchOptions.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleExport}
            disabled={exporting}
            className="bg-transparent border border-gray-300 text-[#5A6ACF] text-[10px] w-[120px] hover:bg-gray-100 px-6 py-2 rounded-md flex items-center gap-1"
          >
            {exporting ? "Exporting..." : "Export CSV"}
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">View by:</span>
            <Select defaultValue="weekly">
              <SelectTrigger className="w-28 bg-gray-100 border-0 text-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
            <Select defaultValue="jan-2025">
              <SelectTrigger className="w-32 bg-gray-100 border-0 text-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jan-2025">Jan 2025</SelectItem>
                <SelectItem value="feb-2025">Feb 2025</SelectItem>
                <SelectItem value="mar-2025">Mar 2025</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="april-2025">
              <SelectTrigger className="w-32 bg-gray-100 border-0 text-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="april-2025">April 2025</SelectItem>
                <SelectItem value="may-2025">May 2025</SelectItem>
                <SelectItem value="june-2025">June 2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white rounded-b-xl shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#000] uppercase tracking-wider">
                  Student Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#000] uppercase tracking-wider">
                  Course enrolled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#000] uppercase tracking-wider">
                  Invoice Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#000] uppercase tracking-wider">
                  Paid Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#000] uppercase tracking-wider">
                  Due Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#000] uppercase tracking-wider">
                  Payment date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#000] uppercase tracking-wider">
                  Payment source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#000] uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                      <span className="ml-2 text-gray-500">Loading payments...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.student_name || "Unknown Student"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.course_name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{payment.amount?.toLocaleString() || "0"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{payment.amount?.toLocaleString() || "0"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹0</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.payment_date || payment.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">{describePayment(payment)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={
                          payment.payment_status === "paid"
                            ? "bg-green-100 text-green-800"
                            : payment.payment_status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {payment.payment_status === "paid"
                          ? "Paid"
                          : payment.payment_status === "pending"
                            ? "Pending"
                            : "Failed"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
