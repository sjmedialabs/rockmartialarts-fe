"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Search, ChevronDown, MoreHorizontal, Calendar, Clock, Plus, Trash2, ArrowLeft } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, AlertCircle } from "lucide-react"

interface BranchFormData {
  branch: {
    name: string;
    code: string;
    email: string;
    phone: string;
    address: {
      line1: string;
      area: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
  };
  manager_id: string;
  operational_details: {
    courses_offered: string[];
    timings: Array<{
      day: string;
      open: string;
      close: string;
    }>;
    holidays: string[];
  };
  assignments: {
    accessories_available: boolean;
    courses: string[];
    branch_admins: string[];
  };
  bank_details: {
    bank_name: string;
    account_number: string;
    upi_id: string;
  };
}

export default function CreateBranch() {
  const router = useRouter()
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [showErrorPopup, setShowErrorPopup] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState<BranchFormData>({
    branch: {
      name: '',
      code: '',
      email: '',
      phone: '',
      address: {
        line1: '',
        area: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India'
      }
    },
    manager_id: '',
    operational_details: {
      courses_offered: [],
      timings: [
        { day: 'Monday', open: '07:00', close: '19:00' }
      ],
      holidays: []
    },
    assignments: {
      accessories_available: true,
      courses: [],
      branch_admins: []
    },
    bank_details: {
      bank_name: '',
      account_number: '',
      upi_id: ''
    }
  })

  const [phoneCountryCode, setPhoneCountryCode] = useState('+91')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [newHoliday, setNewHoliday] = useState('')

  // Available options (these would typically come from APIs)
  const availableManagers = [
    { id: 'manager-uuid-1', name: 'Ravi Kumar', designation: 'Manager' },
    { id: 'manager-uuid-2', name: 'Priya Sharma', designation: 'Senior Instructor' },
    { id: 'manager-uuid-3', name: 'Amit Singh', designation: 'Branch Head' },
    { id: 'manager-uuid-4', name: 'Neha Patel', designation: 'Operations Manager' },
    { id: 'manager-uuid-5', name: 'Rajesh Kumar', designation: 'Assistant Manager' },
    { id: 'manager-uuid-6', name: 'Sunita Reddy', designation: 'Lead Instructor' },
  ]

  const availableCourses = [
    { id: 'course-uuid-1', name: 'Taekwondo' },
    { id: 'course-uuid-2', name: 'Karate' },
    { id: 'course-uuid-3', name: 'Kung Fu' },
    { id: 'course-uuid-4', name: 'Mixed Martial Arts' },
    { id: 'course-uuid-5', name: 'Zumba Dance' },
    { id: 'course-uuid-6', name: 'Bharath Natyam' },
  ]

  const availableCoaches = [
    { id: 'coach-uuid-1', name: 'Coach-1' },
    { id: 'coach-uuid-2', name: 'Coach-2' },
    { id: 'coach-uuid-3', name: 'Coach-3' },
    { id: 'coach-uuid-4', name: 'Coach-4' },
    { id: 'coach-uuid-5', name: 'Coach-5' },
    { id: 'coach-uuid-6', name: 'Coach-6' },
  ]

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ]

  const banks = [
    'State Bank of India',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank',
    'Punjab National Bank',
    'Bank of Baroda'
  ]

  // Handle form submission
  const handleCreateBranch = async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      // Validate required fields
      if (!formData.branch.name || !formData.branch.code || !formData.branch.email || !formData.manager_id) {
        throw new Error('Please fill in all required fields')
      }

      // Prepare the phone number
      const fullPhoneNumber = phoneCountryCode + phoneNumber

      // Prepare the API payload
      const apiPayload = {
        ...formData,
        branch: {
          ...formData.branch,
          phone: fullPhoneNumber
        }
      }

      console.log('Creating branch with payload:', apiPayload)

      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Authentication token not found. Please login again.')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/branches`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create branch')
      }

      console.log('Branch created successfully:', data)
      setShowSuccessPopup(true)
    } catch (error: any) {
      console.error('Error creating branch:', error)
      setErrorMessage(error.message || 'An unexpected error occurred')
      setShowErrorPopup(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePopupClose = () => {
    setShowSuccessPopup(false)
    router.push("/dashboard/branches")
  }

  const handleErrorClose = () => {
    setShowErrorPopup(false)
    setErrorMessage('')
  }

  // Update form data helpers
  const updateBranchField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      branch: {
        ...prev.branch,
        [field]: value
      }
    }))
  }

  const updateAddressField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      branch: {
        ...prev.branch,
        address: {
          ...prev.branch.address,
          [field]: value
        }
      }
    }))
  }

  const updateBankField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      bank_details: {
        ...prev.bank_details,
        [field]: value
      }
    }))
  }

  const addTiming = () => {
    setFormData(prev => ({
      ...prev,
      operational_details: {
        ...prev.operational_details,
        timings: [
          ...prev.operational_details.timings,
          { day: 'Monday', open: '07:00', close: '19:00' }
        ]
      }
    }))
  }

  const removeTiming = (index: number) => {
    setFormData(prev => ({
      ...prev,
      operational_details: {
        ...prev.operational_details,
        timings: prev.operational_details.timings.filter((_, i) => i !== index)
      }
    }))
  }

  const updateTiming = (index: number, field: 'day' | 'open' | 'close', value: string) => {
    setFormData(prev => ({
      ...prev,
      operational_details: {
        ...prev.operational_details,
        timings: prev.operational_details.timings.map((timing, i) => 
          i === index ? { ...timing, [field]: value } : timing
        )
      }
    }))
  }

  const addHoliday = () => {
    if (newHoliday && !formData.operational_details.holidays.includes(newHoliday)) {
      setFormData(prev => ({
        ...prev,
        operational_details: {
          ...prev.operational_details,
          holidays: [...prev.operational_details.holidays, newHoliday]
        }
      }))
      setNewHoliday('')
    }
  }

  const removeHoliday = (date: string) => {
    setFormData(prev => ({
      ...prev,
      operational_details: {
        ...prev.operational_details,
        holidays: prev.operational_details.holidays.filter(h => h !== date)
      }
    }))
  }

  const toggleCourseSelection = (courseId: string, courseName: string) => {
    setFormData(prev => {
      const isSelected = prev.assignments.courses.includes(courseId)
      return {
        ...prev,
        assignments: {
          ...prev.assignments,
          courses: isSelected 
            ? prev.assignments.courses.filter(id => id !== courseId)
            : [...prev.assignments.courses, courseId]
        },
        operational_details: {
          ...prev.operational_details,
          courses_offered: isSelected
            ? prev.operational_details.courses_offered.filter(name => name !== courseName)
            : [...prev.operational_details.courses_offered, courseName]
        }
      }
    })
  }

  const toggleCoachSelection = (coachId: string) => {
    setFormData(prev => ({
      ...prev,
      assignments: {
        ...prev.assignments,
        branch_admins: prev.assignments.branch_admins.includes(coachId)
          ? prev.assignments.branch_admins.filter(id => id !== coachId)
          : [...prev.assignments.branch_admins, coachId]
      }
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header with Back Button */}
      <header className="bg-white shadow-sm border-b">
        <div className="w-full px-4 lg:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/dashboard/branches")}
                className="flex items-center space-x-2 hover:bg-gray-100"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Branches</span>
              </Button>
              <div className="w-px h-6 bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">Create New Branch</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
              </div>
              
              <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-lg">ROCK</span>
              </div>
            </div>
          </div>
        </div>
      </header>
                <a href="#" className="text-gray-600 hover:text-gray-900 pb-4 text-sm whitespace-nowrap">
                  Students
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900 pb-4 text-sm whitespace-nowrap">
                  Member ship
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900 pb-4 text-sm whitespace-nowrap">
                  Revenue
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900 pb-4 text-sm whitespace-nowrap">
                  Attendance
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900 pb-4 text-sm whitespace-nowrap">
                  Reports
                </a>
                <MoreHorizontal className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>
        </div>
      </header>

      <main className="w-full p-6 lg:p-8 overflow-x-hidden">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Branch</h1>
            <p className="text-gray-600">Fill in the details below to create a new branch</p>
          </div>
          <Button variant="outline" className="flex items-center space-x-2 bg-transparent border-gray-300 hover:bg-gray-50">
            <Plus className="w-4 h-4" />
            <span>Quick Actions</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Branch Information */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800">Branch Information</CardTitle>
                <p className="text-sm text-gray-500">Basic details about the branch</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="branchName" className="text-sm font-medium text-gray-700 mb-2 block">
                      Branch Name *
                    </Label>
                    <Input 
                      id="branchName" 
                      placeholder="e.g. Rock martial arts" 
                      className="h-11"
                      value={formData.branch.name}
                      onChange={(e) => updateBranchField('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="branchCode" className="text-sm font-medium text-gray-700 mb-2 block">
                      Branch Code *
                    </Label>
                    <Input 
                      id="branchCode" 
                      placeholder="e.g. RMA01" 
                      className="h-11"
                      value={formData.branch.code}
                      onChange={(e) => updateBranchField('code', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="branchEmail" className="text-sm font-medium text-gray-700 mb-2 block">
                      Branch Email ID *
                    </Label>
                    <Input 
                      id="branchEmail" 
                      type="email"
                      placeholder="yourname@email.com" 
                      className="h-11"
                      value={formData.branch.email}
                      onChange={(e) => updateBranchField('email', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Branch Contact Number *
                    </Label>
                    <div className="flex gap-2">
                      <Select value={phoneCountryCode} onValueChange={setPhoneCountryCode}>
                        <SelectTrigger className="w-24 h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+1">+1</SelectItem>
                          <SelectItem value="+91">+91</SelectItem>
                          <SelectItem value="+44">+44</SelectItem>
                          <SelectItem value="+61">+61</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input 
                        placeholder="3455672356" 
                        className="flex-1 h-11"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800">Address Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-2 block">
                        Address Line 1 *
                      </Label>
                      <Input 
                        id="address" 
                        placeholder="928#123" 
                        className="h-11"
                        value={formData.branch.address.line1}
                        onChange={(e) => updateAddressField('line1', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="area" className="text-sm font-medium text-gray-700 mb-2 block">
                        Area *
                      </Label>
                      <Input 
                        id="area" 
                        placeholder="Madhapur" 
                        className="h-11"
                        value={formData.branch.address.area}
                        onChange={(e) => updateAddressField('area', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="city" className="text-sm font-medium text-gray-700 mb-2 block">
                        City *
                      </Label>
                      <Input 
                        id="city" 
                        placeholder="Hyderabad" 
                        className="h-11"
                        value={formData.branch.address.city}
                        onChange={(e) => updateAddressField('city', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-sm font-medium text-gray-700 mb-2 block">
                        State *
                      </Label>
                      <Input 
                        id="state" 
                        placeholder="Telangana" 
                        className="h-11"
                        value={formData.branch.address.state}
                        onChange={(e) => updateAddressField('state', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700 mb-2 block">
                        Pin Code *
                      </Label>
                      <Input 
                        id="zipCode" 
                        placeholder="500089" 
                        className="h-11"
                        value={formData.branch.address.pincode}
                        onChange={(e) => updateAddressField('pincode', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-sm font-medium text-gray-700 mb-2 block">
                        Country *
                      </Label>
                      <Select value={formData.branch.address.country} onValueChange={(value) => updateAddressField('country', value)}>
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="India">India</SelectItem>
                          <SelectItem value="USA">USA</SelectItem>
                          <SelectItem value="UK">UK</SelectItem>
                          <SelectItem value="Australia">Australia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Assign to Branch */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800">Branch Assignments</CardTitle>
                <p className="text-sm text-gray-500">Configure courses and administrators</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Accessories Available at this branch?</Label>
                  <RadioGroup 
                    value={formData.assignments.accessories_available.toString()} 
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      assignments: { ...prev.assignments, accessories_available: value === 'true' }
                    }))}
                    className="flex space-x-8"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="yes" />
                      <Label htmlFor="yes" className="text-sm">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="no" />
                      <Label htmlFor="no" className="text-sm">No</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">Select Courses *</Label>
                    <div className="border rounded-lg p-4 max-h-48 overflow-y-auto bg-gray-50">
                      <div className="space-y-3">
                        {availableCourses.map((course) => (
                          <div key={course.id} className="flex items-center space-x-3">
                            <Checkbox 
                              id={course.id}
                              checked={formData.assignments.courses.includes(course.id)}
                              onCheckedChange={() => toggleCourseSelection(course.id, course.name)}
                            />
                            <Label htmlFor={course.id} className="text-sm font-medium">
                              {course.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">Branch Admins</Label>
                    <div className="border rounded-lg p-4 max-h-48 overflow-y-auto bg-gray-50">
                      <div className="space-y-3">
                        {availableCoaches.map((coach) => (
                          <div key={coach.id} className="flex items-center space-x-3">
                            <Checkbox 
                              id={coach.id}
                              checked={formData.assignments.branch_admins.includes(coach.id)}
                              onCheckedChange={() => toggleCoachSelection(coach.id)}
                            />
                            <Label htmlFor={coach.id} className="text-sm font-medium">
                              {coach.name}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Branch Manager */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800">Branch Manager</CardTitle>
                <p className="text-sm text-gray-500">Assign a manager to oversee this branch</p>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="branchManager" className="text-sm font-medium text-gray-700 mb-2 block">
                    Select Branch Manager *
                  </Label>
                  <Select value={formData.manager_id} onValueChange={(value) => setFormData(prev => ({ ...prev, manager_id: value }))}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Choose a manager from the list" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableManagers.map((manager) => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.name} - {manager.designation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Operational Details */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800">Operational Details</CardTitle>
                <p className="text-sm text-gray-500">Configure branch timings and holidays</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Branch Timings */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-sm font-medium text-gray-700">Branch Timings</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addTiming}
                      className="h-8 px-3"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Timing
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {formData.operational_details.timings.map((timing, index) => (
                      <div key={index} className="flex gap-2 items-center p-3 border rounded-lg bg-gray-50">
                        <Select value={timing.day} onValueChange={(value) => updateTiming(index, 'day', value)}>
                          <SelectTrigger className="flex-1 h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {daysOfWeek.map((day) => (
                              <SelectItem key={day} value={day}>{day}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="time"
                            value={timing.open}
                            onChange={(e) => updateTiming(index, 'open', e.target.value)}
                            className="w-24 h-10"
                          />
                          <span className="text-gray-500">to</span>
                          <Input 
                            type="time"
                            value={timing.close}
                            onChange={(e) => updateTiming(index, 'close', e.target.value)}
                            className="w-24 h-10"
                          />
                        </div>
                        {formData.operational_details.timings.length > 1 && (
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm"
                            onClick={() => removeTiming(index)}
                            className="h-10 w-10 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Holiday Calendar */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">Holiday Calendar</Label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input 
                        type="date"
                        value={newHoliday}
                        onChange={(e) => setNewHoliday(e.target.value)}
                        className="flex-1 h-11"
                        placeholder="Select holiday date"
                      />
                      <Button 
                        type="button"
                        onClick={addHoliday}
                        variant="outline"
                        className="h-11 px-4"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                    {formData.operational_details.holidays.length > 0 && (
                      <div className="border rounded-lg p-3 bg-gray-50 max-h-32 overflow-y-auto">
                        <div className="space-y-2">
                          {formData.operational_details.holidays.map((date) => (
                            <div key={date} className="flex items-center justify-between py-1">
                              <span className="text-sm">{new Date(date).toLocaleDateString()}</span>
                              <Button 
                                type="button"
                                variant="ghost" 
                                size="sm"
                                onClick={() => removeHoliday(date)}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bank Details */}
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-800">Bank Details</CardTitle>
                <p className="text-sm text-gray-500">Payment and banking information</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="bankName" className="text-sm font-medium text-gray-700 mb-2 block">
                    Bank Name *
                  </Label>
                  <Select value={formData.bank_details.bank_name} onValueChange={(value) => updateBankField('bank_name', value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {banks.map((bank) => (
                        <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="accountNumber" className="text-sm font-medium text-gray-700 mb-2 block">
                    Account Number *
                  </Label>
                  <Input 
                    id="accountNumber" 
                    placeholder="Enter account number" 
                    className="h-11"
                    value={formData.bank_details.account_number}
                    onChange={(e) => updateBankField('account_number', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="upiId" className="text-sm font-medium text-gray-700 mb-2 block">
                    UPI ID *
                  </Label>
                  <Input 
                    id="upiId" 
                    placeholder="name@ybl" 
                    className="h-11"
                    value={formData.bank_details.upi_id}
                    onChange={(e) => updateBankField('upi_id', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Create Branch Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard/branches')}
                className="flex-1 h-12 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateBranch} 
                disabled={isLoading}
                className="flex-1 h-12 bg-yellow-400 hover:bg-yellow-500 text-black font-medium disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </div>
                ) : (
                  'Create Branch'
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Success Dialog */}
      <Dialog open={showSuccessPopup} onOpenChange={setShowSuccessPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span>Success!</span>
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-gray-600 mb-6">Branch has been created successfully!</p>
            <Button onClick={handlePopupClose} className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 h-11">
              Continue to Branches
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={showErrorPopup} onOpenChange={setShowErrorPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center space-x-2">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <span>Error</span>
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleErrorClose} className="px-6 h-11">
                Cancel
              </Button>
              <Button onClick={handleErrorClose} className="bg-red-500 hover:bg-red-600 text-white px-6 h-11">
                Try Again
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
