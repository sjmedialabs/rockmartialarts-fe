"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Award, 
  Building, 
  Edit,
  Loader2,
  UserCheck
} from "lucide-react"
import CoachDashboardHeader from "@/components/coach-dashboard-header"
import { checkCoachAuth } from "@/lib/coachAuth"

interface CoachProfile {
  id: string
  full_name: string
  personal_info?: {
    first_name: string
    last_name: string
    gender?: string
    date_of_birth?: string
  }
  contact_info?: {
    email: string
    phone?: string
    country_code?: string
  }
  address_info?: {
    street?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
  }
  professional_info?: {
    specialization?: string
    years_of_experience?: string
    certifications?: string[]
    bio?: string
  }
  areas_of_expertise?: string[]
  branch_id?: string
  branch_name?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function CoachProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<CoachProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Use the robust coach authentication check
    const authResult = checkCoachAuth()

    if (!authResult.isAuthenticated) {
      console.log("Coach not authenticated:", authResult.error)
      router.push("/coach/login")
      return
    }

    if (authResult.coach) {
      setProfile(authResult.coach)
      setLoading(false)
    } else {
      setError("Profile information not found")
      setLoading(false)
    }
  }, [router])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'N/A'
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    try {
      const birthDate = new Date(dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age > 0 ? `${age} years old` : 'N/A'
    } catch {
      return 'N/A'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CoachDashboardHeader 
          currentPage="Profile"
          coachName={profile?.full_name}
        />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
              <span className="ml-2 text-gray-600">Loading profile...</span>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CoachDashboardHeader 
          currentPage="Profile"
          coachName="Coach"
        />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-red-600">
                  <p className="font-medium">Error loading profile</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CoachDashboardHeader 
        currentPage="Profile"
        coachName={profile.full_name}
      />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h1>
              <p className="text-gray-600">View and manage your profile information</p>
            </div>
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={() => router.push("/coach-dashboard/profile/edit")}
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Overview Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Profile Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src="" alt={profile.full_name} />
                    <AvatarFallback className="text-2xl bg-yellow-100 text-yellow-800">
                      {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {profile.full_name}
                  </h3>
                  
                  <div className="space-y-2">
                    <Badge className={profile.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      <UserCheck className="w-3 h-3 mr-1" />
                      {profile.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    
                    {profile.professional_info?.specialization && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                        <Award className="w-3 h-3 mr-1" />
                        {profile.professional_info.specialization}
                      </Badge>
                    )}
                  </div>

                  {profile.professional_info?.bio && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600 text-left">
                        {profile.professional_info.bio}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Detailed Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">First Name</label>
                      <p className="text-gray-900">{profile.personal_info?.first_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Name</label>
                      <p className="text-gray-900">{profile.personal_info?.last_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Gender</label>
                      <p className="text-gray-900 capitalize">{profile.personal_info?.gender || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Age</label>
                      <p className="text-gray-900">
                        {profile.personal_info?.date_of_birth 
                          ? calculateAge(profile.personal_info.date_of_birth)
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        <p className="text-gray-900">{profile.contact_info?.email || 'N/A'}</p>
                      </div>
                    </div>
                    
                    {profile.contact_info?.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <label className="text-sm font-medium text-gray-500">Phone</label>
                          <p className="text-gray-900">
                            {profile.contact_info.country_code} {profile.contact_info.phone}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              {profile.address_info && (
                <Card>
                  <CardHeader>
                    <CardTitle>Address Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <div className="space-y-1">
                          {profile.address_info.street && (
                            <p className="text-gray-900">{profile.address_info.street}</p>
                          )}
                          <p className="text-gray-900">
                            {[
                              profile.address_info.city,
                              profile.address_info.state,
                              profile.address_info.postal_code
                            ].filter(Boolean).join(', ')}
                          </p>
                          {profile.address_info.country && (
                            <p className="text-gray-900">{profile.address_info.country}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Professional Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Specialization</label>
                        <p className="text-gray-900">{profile.professional_info?.specialization || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Experience</label>
                        <p className="text-gray-900">{profile.professional_info?.years_of_experience || 'N/A'}</p>
                      </div>
                    </div>

                    {profile.areas_of_expertise && profile.areas_of_expertise.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 block">Areas of Expertise</label>
                        <div className="flex flex-wrap gap-2">
                          {profile.areas_of_expertise.map((area, index) => (
                            <Badge key={index} variant="outline" className="bg-blue-50 text-blue-800">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {profile.branch_name && (
                      <div className="flex items-center space-x-3">
                        <Building className="w-5 h-5 text-gray-400" />
                        <div>
                          <label className="text-sm font-medium text-gray-500">Branch</label>
                          <p className="text-gray-900">{profile.branch_name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <label className="text-sm font-medium text-gray-500">Member Since</label>
                        <p className="text-gray-900">{formatDate(profile.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <label className="text-sm font-medium text-gray-500">Last Updated</label>
                        <p className="text-gray-900">{formatDate(profile.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
