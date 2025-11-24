"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Database } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"
import { DropdownSettingsManager } from "@/components/dropdown-settings-manager"

export default function DropdownSettingsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader currentPage="Master Data" />
      
      <main className="w-full mt-[100px] p-4 lg:p-6 xl:px-12">
        <div className="mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard/settings")}
                className="flex items-center space-x-2 hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-[#4F5077]">Back to Settings</span>
              </Button>
              <div className="w-px h-6 bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Database className="w-6 h-6" />
                  Master Data
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage dropdown options used throughout the application
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">About Master Data</h3>
                <p className="text-sm text-blue-700 mt-1">
                  Configure the options available in various dropdown menus across forms like Add Coach, 
                  Add Student, etc. Changes will be reflected immediately across the application.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <DropdownSettingsManager
              category="countries"
              title="Countries"
              description="Countries available for selection in address forms"
            />

            <DropdownSettingsManager
              category="banks"
              title="Banks"
              description="Bank names available for selection in branch bank details"
            />

            <DropdownSettingsManager
              category="designations"
              title="Coach Designations"
              description="Job titles and designations for coaches"
            />

            <DropdownSettingsManager
              category="specializations"
              title="Specializations"
              description="Martial arts styles and specializations offered"
            />

            <DropdownSettingsManager
              category="experience_ranges"
              title="Experience Ranges"
              description="Experience level options for coaches"
            />

            <DropdownSettingsManager
              category="genders"
              title="Gender Options"
              description="Gender options for personal information"
            />


            <DropdownSettingsManager
              category="locations"
              title="Locations"
              description="Branch location options available for selection"
            />
            <DropdownSettingsManager
              category="emergency_relations"
              title="Emergency Contact Relations"
              description="Relationship types for emergency contacts"
            />
          </div>
        </div>
      </main>
    </div>
  )
}
