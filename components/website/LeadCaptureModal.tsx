"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { formatApiErrorPayload } from "@/lib/formatApiError"

interface BranchOption {
  id: string
  name: string
}

const STORAGE_KEY = "rock_lead_captured"

export function LeadCaptureModal() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [branchId, setBranchId] = useState("")
  const [branches, setBranches] = useState<BranchOption[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const alreadyCaptured = window.localStorage.getItem(STORAGE_KEY)
    if (!alreadyCaptured) {
      setOpen(true)
      fetchBranches()
    }
  }, [])

  async function fetchBranches() {
    try {
      const res = await fetch("/api/branches/public", {
        headers: { "Content-Type": "application/json" },
      })
      if (!res.ok) return
      const data = await res.json()
      const list = Array.isArray(data.branches) ? data.branches : []
      const options: BranchOption[] = list.map((b: any) => ({
        id: b.id ?? b._id ?? "",
        name: b.branch?.name ?? b.name ?? b.branch?.code ?? "Branch",
      })).filter((b) => b.id && b.name)
      setBranches(options)
    } catch {
      // ignore, modal will still render without branches
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim() || !branchId) {
      setSubmitError("Please enter your name, phone, and choose a branch.")
      toast({
        title: "Missing information",
        description: "Please enter your name, phone, and choose a branch.",
        variant: "destructive",
      })
      return
    }
    const branchName = branches.find((b) => b.id === branchId)?.name ?? ""
    try {
      setSubmitting(true)
      setSubmitError(null)
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          branch_id: branchId,
          branch_name: branchName || undefined,
          source: "website_popup",
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = formatApiErrorPayload(data)
        setSubmitError(msg)
        toast({
          title: "Could not submit",
          description: msg,
          variant: "destructive",
        })
        return
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, "1")
      }
      toast({
        title: "Thank you!",
        description: "We've received your details. Our team will contact you soon.",
      })
      setOpen(false)
      setName("")
      setPhone("")
      setBranchId("")
    } catch {
      const msg = "Please try again in a moment."
      setSubmitError(msg)
      toast({
        title: "Network error",
        description: msg,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  function handleSkip() {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1")
    }
    setOpen(false)
  }

  if (!open) return null

  return (
    <Dialog open={open}>
      <DialogContent className="bg-[#171A26] border-gray-800 text-white max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Get a call from our team</DialogTitle>
          <DialogDescription className="text-gray-300">
            Share your details and preferred branch. Our team will contact you with course options and fees.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {submitError ? (
            <div
              role="alert"
              className="rounded-md border border-red-500/60 bg-red-950/80 px-3 py-2 text-sm text-red-100"
            >
              {submitError}
            </div>
          ) : null}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-200">Name</label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setSubmitError(null)
              }}
              placeholder="Your full name"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-200">Phone number</label>
            <Input
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                setSubmitError(null)
              }}
              placeholder="10-digit mobile number"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-200">Select branch</label>
            <Select
              value={branchId}
              onValueChange={(v) => {
                setBranchId(v)
                setSubmitError(null)
              }}
            >
              <SelectTrigger className="bg-[#11131C] border-gray-700 text-white">
                <SelectValue placeholder="Choose a branch" />
              </SelectTrigger>
              <SelectContent className="bg-[#11131C] border-gray-700 text-white">
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="submit"
            className="w-full bg-[#FFB70F] text-[#171A26] hover:bg-[#FFB70F]/90"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
        <button
          type="button"
          onClick={handleSkip}
          className="mt-3 w-full text-sm text-gray-400 hover:text-white transition-colors"
        >
          Skip for now
        </button>
      </DialogContent>
    </Dialog>
  )
}

