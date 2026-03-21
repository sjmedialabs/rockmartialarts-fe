"use client"

import { useEffect, useState, useCallback } from "react"
import { getBackendApiUrl } from "@/lib/config"
import { TokenManager } from "@/lib/tokenManager"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Search } from "lucide-react"

type LeadRow = {
  id: string
  name: string
  email: string
  phone: string
  course: string
  created_at?: string
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [total, setTotal] = useState(0)
  const [skip, setSkip] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const limit = 25

  const load = useCallback(async () => {
    const token = TokenManager.getToken()
    if (!token) {
      setError("Not authenticated")
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const q = new URLSearchParams({
        skip: String(skip),
        limit: String(limit),
      })
      if (search.trim()) q.set("search", search.trim())
      const url = getBackendApiUrl(`leads?${q.toString()}`)
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        console.error("[Leads] GET failed", res.status, data)
        setError(typeof data?.detail === "string" ? data.detail : "Failed to load leads")
        setLeads([])
        return
      }
      const list = Array.isArray(data.leads) ? data.leads : []
      setLeads(list)
      setTotal(typeof data.total === "number" ? data.total : list.length)
    } catch (e) {
      console.error("[Leads] Network error", e)
      setError("Network error loading leads")
      setLeads([])
    } finally {
      setLoading(false)
    }
  }, [skip, search])

  useEffect(() => {
    load()
  }, [load])

  const fmtDate = (iso?: string) => {
    if (!iso) return "—"
    try {
      return new Date(iso).toLocaleString()
    } catch {
      return iso
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lead management</h1>
            <p className="text-gray-600 text-sm">Registration leads from the public website</p>
          </div>
          <Button type="button" variant="outline" onClick={() => load()} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Leads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form
              className="flex flex-col sm:flex-row gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                setSkip(0)
                setSearch(searchInput)
              }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search name, email, phone, course…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-white">
                Search
              </Button>
            </form>

            {error && <p className="text-sm text-red-600">{error}</p>}

            {loading ? (
              <p className="text-gray-500 text-sm py-8 text-center">Loading…</p>
            ) : leads.length === 0 ? (
              <p className="text-gray-500 text-sm py-8 text-center">No leads found.</p>
            ) : (
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Name</th>
                      <th className="px-3 py-2 font-semibold">Email</th>
                      <th className="px-3 py-2 font-semibold">Phone</th>
                      <th className="px-3 py-2 font-semibold">Course</th>
                      <th className="px-3 py-2 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((row) => (
                      <tr key={row.id} className="border-t border-gray-200 hover:bg-gray-50/80">
                        <td className="px-3 py-2">{row.name}</td>
                        <td className="px-3 py-2 break-all">{row.email}</td>
                        <td className="px-3 py-2 whitespace-nowrap">{row.phone}</td>
                        <td className="px-3 py-2">{row.course || "—"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-600">{fmtDate(row.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {total > limit && (
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Showing {skip + 1}–{Math.min(skip + limit, total)} of {total}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={skip === 0 || loading}
                    onClick={() => setSkip((s) => Math.max(0, s - limit))}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={skip + limit >= total || loading}
                    onClick={() => setSkip((s) => s + limit)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
