"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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

type BranchRevenueRow = {
  branch_id: string
  branch_name: string
  total_revenue: number
  transactions: number
}

export default function PaymentTrackingPage() {
  const params = useParams<{ adminType: string }>()
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
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPayments, setTotalPayments] = useState(0)
  const pageSize = 20
  const [periodStart, setPeriodStart] = useState<string>("")
  const [periodEnd, setPeriodEnd] = useState<string>("")
  const [periodRevenue, setPeriodRevenue] = useState<number | null>(null)
  const [branchRevenue, setBranchRevenue] = useState<BranchRevenueRow[]>([])
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [viewBy, setViewBy] = useState<"weekly" | "monthly" | "yearly" | "custom">("monthly")
  const [studentSearch, setStudentSearch] = useState<string>("")

  const isSuperAdmin = String(params?.adminType || "").toLowerCase() === "super-admin"

  useEffect(() => {
    ;(async () => {
      if (isSuperAdmin) {
        try {
          setSyncing(true)
          const token = localStorage.getItem("token") || undefined
          await paymentAPI.syncRazorpayPayments(token)
        } catch (e) {
          // Non-blocking: still show whatever is in DB.
          console.error("Razorpay sync failed:", e)
        } finally {
          setSyncing(false)
        }
      }
      await fetchPayments()
      await fetchStats()
      await fetchAnalytics()
    })()
  }, [])

  useEffect(() => {
    void fetchPayments()
  }, [page])

  useEffect(() => {
    // Reset to first page when branch filter changes (keeps UX predictable).
    setPage(1)
    void fetchAnalytics()
    void fetchStats()
  }, [branchFilter])

  useEffect(() => {
    // When the date range changes, refresh everything (table + stats + cards).
    setPage(1)
    void fetchPayments()
    void fetchStats()
    void fetchAnalytics()
  }, [periodStart, periodEnd])

  useEffect(() => {
    // Student search should be server-side so it works across all pages.
    setPage(1)
    void fetchPayments()
  }, [studentSearch])

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
      const token = localStorage.getItem("token") || undefined
      const data = await paymentAPI.getPayments(
        {
          skip: (page - 1) * pageSize,
          limit: pageSize,
          ...(periodStart ? { start_date: periodStart } : {}),
          ...(periodEnd ? { end_date: periodEnd } : {}),
          ...(studentSearch.trim() ? { search: studentSearch.trim() } : {}),
        },
        token
      )
      setPayments(data.payments || [])
      setTotalPayments(Number(data.total) || 0)
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const qs = new URLSearchParams()
      if (periodStart) qs.set("start_date", periodStart)
      if (periodEnd) qs.set("end_date", periodEnd)
      qs.set("_ts", String(Date.now()))
      const response = await fetch(getBackendApiUrl(`payments/stats?${qs.toString()}`), {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
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

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true)
      const token = localStorage.getItem("token") || ""

      // Period revenue: reuse payments/stats which already accepts start_date/end_date
      if (periodStart && periodEnd) {
        const statsRes = await fetch(
          getBackendApiUrl(`payments/stats?start_date=${encodeURIComponent(periodStart)}&end_date=${encodeURIComponent(periodEnd)}&_ts=${Date.now()}`),
          {
            cache: "no-store",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          }
        )
        if (statsRes.ok) {
          const s = await statsRes.json()
          // When start/end are provided, backend returns the period total under this_month_collection
          const v = Number(s?.this_month_collection)
          setPeriodRevenue(Number.isFinite(v) ? v : 0)
        } else {
          setPeriodRevenue(null)
        }
      } else {
        setPeriodRevenue(null)
      }

      // Branch-wise revenue: backend aggregates paid/completed by branch (optional date range)
      const q = new URLSearchParams()
      if (periodStart) q.set("start_date", periodStart)
      if (periodEnd) q.set("end_date", periodEnd)
      const revRes = await fetch(getBackendApiUrl(`payments/revenue/by-branch?${q.toString()}&_ts=${Date.now()}`), {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })
      if (revRes.ok) {
        const js = await revRes.json().catch(() => ({}))
        const rows: BranchRevenueRow[] = Array.isArray(js?.branches) ? js.branches : []
        setBranchRevenue(rows)
      } else {
        setBranchRevenue([])
      }
    } catch (e) {
      console.error("analytics fetch failed", e)
      setBranchRevenue([])
      setPeriodRevenue(null)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    const v = Number(amount)
    if (!Number.isFinite(v)) return "₹0"
    return `₹${Math.round(v).toLocaleString("en-IN")}`
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

  const applyViewBy = (next: "weekly" | "monthly" | "yearly" | "custom") => {
    setViewBy(next)
    const now = new Date()
    const toYMD = (d: Date) => d.toISOString().slice(0, 10)
    if (next === "custom") return
    if (next === "weekly") {
      const day = now.getDay() // 0..6 (Sun..Sat)
      const diffToMon = (day + 6) % 7
      const start = new Date(now)
      start.setDate(now.getDate() - diffToMon)
      const end = new Date(start)
      end.setDate(start.getDate() + 6)
      setPeriodStart(toYMD(start))
      setPeriodEnd(toYMD(end))
      return
    }
    if (next === "monthly") {
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
      const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0))
      setPeriodStart(toYMD(start))
      setPeriodEnd(toYMD(end))
      return
    }
    // yearly
    const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1))
    const end = new Date(Date.UTC(now.getUTCFullYear(), 11, 31))
    setPeriodStart(toYMD(start))
    setPeriodEnd(toYMD(end))
  }

  // Server-side pagination (20 per page). UI branch filter is applied on the current page only.
  const totalPages = Math.max(1, Math.ceil((totalPayments || 0) / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const startIdx = (safePage - 1) * pageSize
  const endIdx = startIdx + filteredPayments.length
  const pagedPayments = filteredPayments

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

  const handleCancelPayment = async (payment: Payment) => {
    if (cancellingId || !payment.id) return
    const status = String(payment.payment_status || "").toLowerCase()
    if (status === "paid" || status === "completed") {
      toast({
        title: "Cannot cancel paid transaction",
        description: "Only pending/failed/mistaken attempts can be cancelled.",
        variant: "destructive",
      })
      return
    }

    try {
      setCancellingId(payment.id)
      await paymentAPI.cancelPayment(payment.id)
      toast({
        title: "Transaction cancelled",
        description: "The payment attempt was cancelled and removed from student pending dues.",
      })
      await fetchPayments()
      await fetchStats()
    } catch (error) {
      toast({
        title: "Cancellation failed",
        description: error instanceof Error ? error.message : "Could not cancel this payment attempt",
        variant: "destructive",
      })
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="w-full p-4 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment Tracking</h1>

        {/* Live revenue cards (Super Admin only) */}
        {isSuperAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium text-gray-700">Total Revenue (All time)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.total_collected)}</div>
                <div className="text-xs text-gray-500 mt-1">Paid / completed payments</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium text-gray-700">Custom Duration Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-end gap-2">
                  <div className="flex-1 min-w-[140px]">
                    <div className="text-xs text-gray-500 mb-1">Start</div>
                    <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <div className="text-xs text-gray-500 mb-1">End</div>
                    <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
                  </div>
                  <Button
                    onClick={() => void fetchAnalytics()}
                    disabled={analyticsLoading || !periodStart || !periodEnd}
                    className="h-9"
                  >
                    Apply
                  </Button>
                </div>
                <div className="text-2xl font-semibold text-gray-900 mt-3">
                  {periodRevenue == null ? "—" : formatCurrency(periodRevenue)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium text-gray-700">Branch-wise Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[120px] overflow-auto pr-1">
                  {branchRevenue.length === 0 ? (
                    <div className="text-sm text-gray-500">{analyticsLoading ? "Loading…" : "No data"}</div>
                  ) : (
                    branchRevenue.slice(0, 8).map((r) => (
                      <div key={r.branch_id} className="flex items-center justify-between gap-3">
                        <div className="text-sm text-gray-700 truncate">{r.branch_name}</div>
                        <div className="text-sm font-medium text-gray-900 whitespace-nowrap">
                          {formatCurrency(r.total_revenue)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">View by:</span>
            <Select value={viewBy} onValueChange={(v) => applyViewBy(v as any)}>
              <SelectTrigger className="w-32 bg-gray-100 border-0 text-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Filter by:</span>
            <Input
              type="date"
              value={periodStart}
              onChange={(e) => {
                setViewBy("custom")
                setPeriodStart(e.target.value)
              }}
              className="w-[150px] bg-gray-100 border-0 text-gray-600"
            />
            <Input
              type="date"
              value={periodEnd}
              onChange={(e) => {
                setViewBy("custom")
                setPeriodEnd(e.target.value)
              }}
              className="w-[150px] bg-gray-100 border-0 text-gray-600"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Student:</span>
            <Input
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Search name / phone / email"
              className="w-[220px] bg-gray-100 border-0 text-gray-600"
            />
          </div>

          <Button
            onClick={handleExport}
            disabled={exporting}
            className="bg-transparent border border-gray-300 text-[#5A6ACF] text-[10px] w-[120px] hover:bg-gray-100 px-6 py-2 rounded-md flex items-center gap-1"
          >
            {exporting ? "Exporting..." : "Export CSV"}
          </Button>

          {isSuperAdmin && (
            <Button
              onClick={async () => {
                if (syncing) return
                try {
                  setSyncing(true)
                  const token = localStorage.getItem("token") || undefined
                  await paymentAPI.syncRazorpayPayments(token)
                  toast({
                    title: "Razorpay sync completed",
                    description: "Payment statuses have been reconciled.",
                  })
                  await fetchPayments()
                  await fetchStats()
                } catch (e) {
                  toast({
                    title: "Razorpay sync failed",
                    description: e instanceof Error ? e.message : "Could not sync payments right now.",
                    variant: "destructive",
                  })
                } finally {
                  setSyncing(false)
                }
              }}
              disabled={syncing}
              className="bg-transparent border border-gray-300 text-gray-700 text-[10px] w-[140px] hover:bg-gray-100 px-6 py-2 rounded-md flex items-center gap-1"
            >
              {syncing ? "Syncing..." : "Sync Razorpay"}
            </Button>
          )}

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
                  Payment date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#000] uppercase tracking-wider">
                  Payment source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#000] uppercase tracking-wider">
                  Status
                </th>
                {isSuperAdmin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#000] uppercase tracking-wider">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 8 : 7} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                      <span className="ml-2 text-gray-500">Loading payments...</span>
                    </div>
                  </td>
                </tr>
              ) : pagedPayments.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 8 : 7} className="px-6 py-8 text-center text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                pagedPayments.map((payment) => {
                  const paymentStatus = String(payment.payment_status || "").toLowerCase()
                  return (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(payment.payment_date || payment.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">{describePayment(payment)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={
                          paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : paymentStatus === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : paymentStatus === "cancelled" || paymentStatus === "canceled"
                                ? "bg-gray-100 text-gray-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {paymentStatus === "paid"
                          ? "Paid"
                          : paymentStatus === "pending"
                            ? "Pending"
                            : paymentStatus === "cancelled" || paymentStatus === "canceled"
                              ? "Cancelled"
                              : "Failed"}
                      </Badge>
                    </td>
                    {isSuperAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handleCancelPayment(payment)}
                          disabled={
                            cancellingId === payment.id ||
                            ["paid", "completed", "cancelled", "canceled"].includes(paymentStatus)
                          }
                          className="text-red-700 border-red-200 hover:bg-red-50 hover:text-red-800"
                        >
                          {cancellingId === payment.id ? "Cancelling..." : "Cancel"}
                        </Button>
                      </td>
                    )}
                  </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPayments > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">{startIdx + 1}</span>-
              <span className="font-medium">{startIdx + pagedPayments.length}</span> of{" "}
              <span className="font-medium">{totalPayments}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <div className="text-sm text-gray-700">
                Page <span className="font-medium">{safePage}</span> /{" "}
                <span className="font-medium">{totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
