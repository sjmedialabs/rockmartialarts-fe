"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRegistration } from "@/contexts/RegistrationContext"
import { useToast } from "@/hooks/use-toast"
import { dropdownAPI } from "@/lib/dropdownAPI"

interface Branch {
  id: string
  name: string
  code: string
  address: {
    city: string
    state: string
  }
}

export default function SelectBranchPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { registrationData, updateRegistrationData } = useRegistration()

  const [selectedLocation, setSelectedLocation] = useState("")
  const [branch_id, setBranchId] = useState(registrationData.branch_id || "")
  const [allBranches, setAllBranches] = useState<Branch[]>([])
  const [filteredBranches, setFilteredBranches] = useState<Branch[]>([])
  const [locations, setLocations] = useState<{ id: string; name: string; state: string }[]>([])
  const [isLoadingBranches, setIsLoadingBranches] = useState(false)
  const [isLoadingLocations, setIsLoadingLocations] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch locations from dropdown settings master data
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoadingLocations(true)
        setError(null)

        const locationOptions = await dropdownAPI.getCategoryOptions('locations')
        
        const transformedLocations = locationOptions
          .filter(opt => opt.is_active)
          .map(opt => {
            const parts = opt.label.split(',').map(p => p.trim())
            return {
              id: opt.value,
              name: parts[0] || opt.label,
              state: parts[1] || ''
            }
          })
        
        setLocations(transformedLocations)
        console.log(`Loaded ${transformedLocations.length} locations from master data`)

      } catch (err) {
        console.error('Error fetching locations:', err)
        setError('Failed to load locations.')
        toast({
          title: "Error",
          description: "Failed to load locations.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingLocations(false)
      }
    }

    fetchLocations()
  }, [toast])

  // Fetch branches directly from backend API
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setIsLoadingBranches(true)
        setError(null)

        // Try backend API directly - get all branches
        const response = await fetch(`http://31.97.224.169:8003/api/branches/public/all`)

        if (!response.ok) {
          throw new Error('Failed to fetch branches')
        }

        const data = await response.json()
        
        // Transform backend response to our format
        const branches = (data.branches || []).map((branch: any) => ({
          id: branch.id,
          name: branch.branch?.name || branch.name,
          code: branch.branch?.code || branch.code || '',
          address: {
            city: branch.branch?.address?.city || branch.address?.city || '',
            state: branch.branch?.address?.state || branch.address?.state || ''
          }
        }))
        
        setAllBranches(branches)
        setFilteredBranches(branches)

        console.log(`Loaded ${branches.length} branches`)

      } catch (err) {
        console.error('Error fetching branches:', err)
        setError('Failed to load branches.')
        toast({
          title: "Error",
          description: "Failed to load branches.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingBranches(false)
      }
    }

    fetchBranches()
  }, [toast])

  // Filter branches when location changes
  useEffect(() => {
    if (!selectedLocation || selectedLocation === 'all') {
      setFilteredBranches(allBranches)
    } else {
      const filtered = allBranches.filter(branch => {
        const locationMatch = 
          branch.address?.city?.toLowerCase() === selectedLocation.toLowerCase() ||
          branch.name?.toLowerCase().includes(selectedLocation.toLowerCase())
        return locationMatch
      })
      setFilteredBranches(filtered)
      console.log(`Filtered to ${filtered.length} branches for location: ${selectedLocation}`)
      
      if (branch_id && !filtered.find(b => b.id === branch_id)) {
        setBranchId("")
      }
    }
  }, [selectedLocation, allBranches, branch_id])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleContinue()
  }

  const handleContinue = () => {
    if (!branch_id) {
      toast({
        title: "Branch Required",
        description: "Please select a branch to continue.",
        variant: "destructive",
      })
      return
    }

    const selectedBranch = filteredBranches.find(branch => branch.id === branch_id)

    updateRegistrationData({
      branch_id,
      selected_location: selectedLocation,
      branch_details: selectedBranch ? {
        name: selectedBranch.name,
        address: selectedBranch.address
      } : null
    })

    router.push("/register/payment")
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gray-200 items-center justify-center relative overflow-hidden">
        <div
          className="w-[300px] h-[550px] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/select-branch-left.png')",
          }}
        />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white mt-[100px]">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-black">Branch Details</h1>
            <p className="text-gray-500 text-sm">Select your preferred location and branch to continue.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Select
                value={selectedLocation}
                onValueChange={(value) => setSelectedLocation(value)}
                disabled={isLoadingLocations}
              >
                <SelectTrigger className="!w-full !h-14 !pl-6 !pr-10 !py-4 !text-[14px] bg-[#F9F8FF] !border-0 !rounded-xl data-[placeholder]:text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent !min-h-14">
                  <SelectValue placeholder={isLoadingLocations ? "Loading locations..." : "Select Location"} className="text-gray-500" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-gray-200 bg-white shadow-lg max-h-60">
                  <SelectItem value="all" className="!py-3 !pl-3 pr-8 text-base hover:bg-gray-50 rounded-lg cursor-pointer">
                    All Locations
                  </SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id} className="!py-3 !pl-3 pr-8 text-base hover:bg-gray-50 rounded-lg cursor-pointer">
                      {location.name} {location.state && `(${location.state})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Select
                value={branch_id}
                onValueChange={(value) => setBranchId(value)}
                disabled={isLoadingBranches}
              >
                <SelectTrigger className="!w-full !h-14 !pl-6 !pr-10 !py-4 !text-[14px] bg-[#F9F8FF] !border-0 !rounded-xl data-[placeholder]:text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent !min-h-14">
                  <SelectValue placeholder={
                    isLoadingBranches
                      ? "Loading branches..."
                      : filteredBranches.length === 0
                        ? "No branches available"
                        : "Select Branch"
                  } className="text-gray-500" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border border-gray-200 bg-white shadow-lg max-h-60">
                  {filteredBranches.length > 0 ? (
                    filteredBranches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id} className="!py-3 !pl-3 pr-8 text-base hover:bg-gray-50 rounded-lg cursor-pointer">
                        <div className="flex flex-col">
                          <span className="font-medium">{branch.name}</span>
                          {branch.address?.city && (
                            <span className="text-xs text-gray-500">
                              {branch.address.city}{branch.address.state && `, ${branch.address.state}`}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <p className="text-sm">
                        {isLoadingBranches
                          ? "Loading branches..."
                          : "No branches available for selected location"
                        }
                      </p>
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-[#ffffff] font-bold py-4 px-6 rounded-xl text-[12px] h-14 transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl mt-8"
            >
              NEXT STEP
            </Button>
          </form>

          <div className="text-center py-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Link href="/register" className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-green-600 transition-colors">1</Link>
              <div className="w-8 h-1 bg-green-500 rounded"></div>
              <Link href="/register/select-course" className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-green-600 transition-colors">2</Link>
              <div className="w-8 h-1 bg-green-500 rounded"></div>
              <div className="w-8 h-8 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-sm">3</div>
              <div className="w-8 h-1 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm">4</div>
              <div className="w-8 h-1 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm">5</div>
            </div>
            <span className="text-gray-500 text-sm font-medium">Step 3 of 5 - Branch Selection</span>
          </div>
        </div>
      </div>
    </div>
  )
}
