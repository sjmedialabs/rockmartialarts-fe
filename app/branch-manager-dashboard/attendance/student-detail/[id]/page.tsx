"use client"
import BranchManagerDashboardHeader from "@/components/branch-manager-dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Search, ChevronDown, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useParams } from "next/navigation"
import { useState } from "react"

export default function BranchManagerStudentAttendanceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [currentMonth, setCurrentMonth] = useState("May - 2025")

  // Sample student data based on ID
  const studentData = {
    name: "Shaolin Xiao Hong Chuan",
    studentName: "Suman",
    age: "14 years",
    gender: "Male",
    courseName: "Kung fu",
    courseDuration: "6 months",
    coach: "Mohan Kumar",
    branchLocation: "Madhapur",
    subscription: "Monthly",
    contactNumbers: "9848123456",
    dateOfJoining: "01/05/2025",
    dueDate: "01/06/2025",
    totalDays: 75,
    totalDaysPresent: 63,
    lateComings: 12,
    attendancePercentage: 86.7,
    monthlyTotalDays: 28,
    monthlyPresent: 25,
    monthlyLateComings: 2,
    monthlyPercentage: 94,
  }

  const attendanceData = [
    {
      date: "Thurs day, 1 may 2025",
      status: "Status",
      scheduled: "9 am - 6 pm",
      shift: "9 hr Shift: A",
      checkIn: "8:30 AM",
      checkOut: "5:30 PM",
      workedHours: "9 hr 00 min",
      difference: "00",
    },
    {
      date: "Thurs day, 1 may 2025",
      status: "Status",
      scheduled: "9 am - 6 pm",
      shift: "9 hr Shift: A",
      checkIn: "8:55 AM",
      checkOut: "5:00 PM",
      workedHours: "8 hr 50 min",
      difference: "-10 min",
      isLate: true,
      isEarlyOut: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header Navigation */}
            <BranchManagerDashboardHeader currentPage="Student Attendance" />
      <main className="w-full p-4 lg:p-6 overflow-x-hidden xl:px-12">
        {/* Page Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                  <h1 className="text-2xl font-bold text-[#0A1629]">Student Attendance</h1>
                  <div className="flex flex-wrap gap-2 lg:gap-3">
                    <Button className="bg-yellow-400 hover:bg-yellow-500 text-white text-sm">Send Alerts</Button>
                    <Button variant="outline" className="text-sm bg-transparent text-[#5A6ACF]">
                      View Report
                    </Button>
                    <Button variant="outline" className="text-sm flex items-center space-x-2 bg-transparent text-[#5A6ACF]">
                      <span>📥</span>
                      <span>Download attendance sheet</span>
                    </Button>
                  </div>
                </div>


        <div className="flex flex-col gap-6 mb-6">
          {/* Student Profile Card */} {/* Attendance Overview Card */}
          <Card className="">
            <CardContent className="">
         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold text-[#0A1629]">Attendance Overview</h2>
          <div className="flex gap-2">
            <Select defaultValue="2023-2024">
              <SelectTrigger className="w-32 bg-[#F5F4F9] text-[#777777]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023-2024">2023-2024</SelectItem>
                <SelectItem value="2024-2025">2024-2025</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="annual">
              <SelectTrigger className="w-24 bg-[#F5F4F9] text-[#777777]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>           
       
          <div className="flex flex-row gap-8 justify-center">
              <div className="relative w-full">
                <img
                  src="/young-martial-arts-student-practicing.jpg"
                  alt="Student"
                  className="w-full h-76 object-cover rounded-lg"
                />
                <div className="absolute bottom-5 left-16">
                  <Badge className="bg-yellow-400 text-black font-semibold px-3 py-1">{studentData.name}</Badge>
                </div>
              </div>

                <div className="w-full">
                  <h3 className="font-semibold text-[#6B7A99] mb-4">Personal Details:</h3>
                  <div className="flex flex-col gap-4 text-sm text-[#333333]">
                    <div className="flex justify-between">
                      <span className="">Student Name</span>
                      <span>{studentData.studentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="">Age:</span>
                      <span>{studentData.age}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="">Gender</span>
                      <span>{studentData.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="">Course Name</span>
                      <span>{studentData.courseName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="">Course duration</span>
                      <span>{studentData.courseDuration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="">Coach:</span>
                      <span>{studentData.coach}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="">Branch Location:</span>
                      <span>{studentData.branchLocation}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <h3 className="font-semibold text-[#6B7A99] mb-4">Registration Details</h3>
                  <div className="flex flex-col gap-4 text-sm text-[#333333]">
                    <div className="flex justify-between">
                      <span className="">Subscription:</span>
                      <span>{studentData.subscription}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="">Contact numbers</span>
                      <span>{studentData.contactNumbers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="">Date of joining</span>
                      <span>{studentData.dateOfJoining}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="">Due Date:</span>
                      <span className="text-[#FF0000]">{studentData.dueDate}</span>
                    </div>
                  </div>
                </div>
                 <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 w-full">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{studentData.totalDays}</div>
                  <div className="text-sm text-gray-600">Total Days</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{studentData.totalDaysPresent}</div>
                  <div className="text-sm text-gray-600">Total days Present</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{studentData.lateComings}</div>
                  <div className="text-sm text-gray-600">Late Comings</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{studentData.attendancePercentage}%</div>
                  <div className="text-sm text-gray-600">Attendance Percentage</div>
                </CardContent>
              </Card>
            </div>
          </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Table */}
        <Card>
          <CardContent className="py-6">
             {/* Statistics Cards */}
          <div className="lg:col-span-2 space-y-6">
           

            {/* Monthly Navigation */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
              <div className="flex items-center space-x-4 border-r border-gray-200 w-full">
                <Button variant="ghost" size="sm" onClick={() => setCurrentMonth("April - 2025")}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="text-lg font-semibold">{currentMonth}</h3>
                <Button variant="ghost" size="sm" onClick={() => setCurrentMonth("June - 2025")}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex w-full justify-end gap-8"> 
                <Button variant="outline" size="sm" className="text-[#5A6ACF]">
                  View Report
                </Button>
                <div className="flex gap-8 items-center">
                  <span className="text-sm">Filter by:</span>
                  <Select defaultValue="jan-2025">
                      <SelectTrigger className="w-24 h-8 bg-[#F1F1F1] text-[#9593A8]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jan-2025">Jan 2025</SelectItem>
                      <SelectItem value="feb-2025">Feb 2025</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="june-2025">
                    <SelectTrigger className="w-24 h-8 bg-[#F1F1F1] text-[#9593A8]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="june-2025">June 2025</SelectItem>
                      <SelectItem value="july-2025">July 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Monthly Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-b border-gray-200 pb-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{studentData.monthlyTotalDays}</div>
                  <div className="text-sm text-gray-600">Total Days</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{studentData.monthlyPresent}</div>
                  <div className="text-sm text-gray-600">Total days Present</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{studentData.monthlyLateComings}</div>
                  <div className="text-sm text-gray-600">Late Comings</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{studentData.monthlyPercentage}%</div>
                  <div className="text-sm text-gray-600">Attendance Percentage</div>
                </CardContent>
              </Card>
            </div>
          </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-2 font-medium">Date</th>
                    <th className="text-left py-3 px-2 font-medium">Status</th>
                    <th className="text-left py-3 px-2 font-medium">Scheduled</th>
                    <th className="text-left py-3 px-2 font-medium">Check in</th>
                    <th className="text-left py-3 px-2 font-medium">Check out</th>
                    <th className="text-left py-3 px-2 font-medium">Worked hours</th>
                    <th className="text-left py-3 px-2 font-medium">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((record, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50 text-[#8D8D8D]">
                      <td className="py-3 px-2">{record.date}</td>
                      <td className="py-3 px-2">{record.status}</td>
                      <td className="py-3 px-2">
                        <div>
                          <div>{record.scheduled}</div>
                          <div className="text-xs text-gray-500">{record.shift}</div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center space-x-2">
                          <span>{record.checkIn}</span>
                          {record.isLate && <Badge className="bg-[#FF0000] text-white rounded text-xs">Late Coming</Badge>}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center space-x-2">
                          <span>{record.checkOut}</span>
                          {record.isEarlyOut && <Badge className="bg-[#FFB8C9] text-white rounded text-xs">Early Out</Badge>}
                        </div>
                      </td>
                      <td className="py-3 px-2">{record.workedHours}</td>
                      <td className="py-3 px-2">
                        <span className={record.difference.includes("-") ? "text-red-600" : "text-gray-900"}>
                          {record.difference}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
