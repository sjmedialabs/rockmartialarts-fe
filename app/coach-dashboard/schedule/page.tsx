"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns"
import CoachDashboardHeader from "@/components/coach-dashboard-header"
import { checkCoachAuth, getCoachAuthHeaders } from "@/lib/coachAuth"

interface ScheduleEvent {
  id: string
  title: string
  course_name: string
  course_id: string
  start_time: string
  end_time: string
  date: string
  location: string
  students_count: number
  max_capacity: number
  status: "scheduled" | "completed" | "cancelled"
  notes?: string
}

interface WeeklySchedule {
  [key: string]: ScheduleEvent[]
}

export default function CoachSchedulePage() {
  const router = useRouter()
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([])
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [coachData, setCoachData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("week")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date())

  useEffect(() => {
    // Use the robust coach authentication check
    const authResult = checkCoachAuth()

    if (!authResult.isAuthenticated) {
      console.log("Coach not authenticated:", authResult.error)
      router.push("/coach/login")
      return
    }

    if (authResult.coach && authResult.token) {
      setCoachData(authResult.coach)
      fetchScheduleData(authResult.token, authResult.coach.id)
    } else {
      setError("Coach information not found")
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    // Organize events by week
    organizeWeeklySchedule()
  }, [scheduleEvents, currentWeek])

  const fetchScheduleData = async (token: string, coachId: string) => {
    try {
      setLoading(true)
      setError(null)

      // For now, we'll use mock data since the specific coach schedule endpoint may not be implemented
      // In a real implementation, this would call: `/api/coaches/${coachId}/schedule`
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock data for demonstration
      const mockEvents: ScheduleEvent[] = [
        {
          id: "1",
          title: "Morning Karate Class",
          course_name: "Karate Basics",
          course_id: "COURSE001",
          start_time: "09:00",
          end_time: "10:30",
          date: format(new Date(), "yyyy-MM-dd"),
          location: "Dojo A",
          students_count: 15,
          max_capacity: 20,
          status: "scheduled",
          notes: "Focus on basic forms"
        },
        {
          id: "2",
          title: "Advanced Taekwondo",
          course_name: "Advanced Taekwondo",
          course_id: "COURSE002",
          start_time: "11:00",
          end_time: "12:30",
          date: format(new Date(), "yyyy-MM-dd"),
          location: "Dojo B",
          students_count: 12,
          max_capacity: 15,
          status: "scheduled",
          notes: "Sparring practice"
        },
        {
          id: "3",
          title: "Evening Kung Fu",
          course_name: "Kung Fu Fundamentals",
          course_id: "COURSE003",
          start_time: "18:00",
          end_time: "19:30",
          date: format(addDays(new Date(), 1), "yyyy-MM-dd"),
          location: "Dojo A",
          students_count: 8,
          max_capacity: 12,
          status: "scheduled",
          notes: "Weapon forms introduction"
        },
        {
          id: "4",
          title: "Kids Karate",
          course_name: "Kids Karate",
          course_id: "COURSE004",
          start_time: "16:00",
          end_time: "17:00",
          date: format(addDays(new Date(), 2), "yyyy-MM-dd"),
          location: "Dojo C",
          students_count: 20,
          max_capacity: 25,
          status: "scheduled",
          notes: "Fun activities and basic techniques"
        }
      ]

      setScheduleEvents(mockEvents)
    } catch (error) {
      console.error("Error fetching schedule data:", error)
      setError("Failed to load schedule data")
    } finally {
      setLoading(false)
    }
  }

  const organizeWeeklySchedule = () => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Monday start
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 })
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

    const organized: WeeklySchedule = {}
    
    weekDays.forEach(day => {
      const dayKey = format(day, "yyyy-MM-dd")
      organized[dayKey] = scheduleEvents.filter(event => event.date === dayKey)
    })

    setWeeklySchedule(organized)
  }

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = direction === "prev" 
      ? addDays(currentWeek, -7)
      : addDays(currentWeek, 7)
    setCurrentWeek(newWeek)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getTodaysEvents = () => {
    const today = format(new Date(), "yyyy-MM-dd")
    return scheduleEvents.filter(event => event.date === today)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CoachDashboardHeader 
          currentPage="Schedule"
          coachName={coachData?.full_name || "Coach"}
        />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mt-[100px]">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-600" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CoachDashboardHeader 
          currentPage="Schedule"
          coachName={coachData?.full_name || "Coach"}
        />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mt-[100px]">
          <div className="px-4 py-6 sm:px-0">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-red-600">
                  <p className="font-medium">Error loading schedule</p>
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
        currentPage="Schedule"
        coachName={coachData?.full_name || "Coach"}
      />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mt-[100px]">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Class Schedule</h1>
              <p className="text-gray-600">Manage your teaching schedule and classes</p>
            </div>
            <Button className="bg-yellow-600 hover:bg-yellow-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Class
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">Week View</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Today's Classes - {format(new Date(), "EEEE, MMMM d, yyyy")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getTodaysEvents().length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No classes today</h3>
                        <p className="mt-1 text-sm text-gray-500">You have no scheduled classes for today.</p>
                      </div>
                    ) : (
                      getTodaysEvents().map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                  <Clock className="w-6 h-6 text-yellow-600" />
                                </div>
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">{event.title}</h3>
                                <p className="text-sm text-gray-600">{event.course_name}</p>
                                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                  <span className="flex items-center">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {event.start_time} - {event.end_time}
                                  </span>
                                  <span className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {event.location}
                                  </span>
                                  <span className="flex items-center">
                                    <Users className="w-4 h-4 mr-1" />
                                    {event.students_count}/{event.max_capacity}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            {getStatusBadge(event.status)}
                            <div className="flex space-x-1">
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="week" className="space-y-6">
              {/* Week Navigation */}
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={() => navigateWeek("prev")}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous Week
                </Button>
                <h2 className="text-lg font-semibold">
                  {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), "MMM d")} - {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), "MMM d, yyyy")}
                </h2>
                <Button variant="outline" onClick={() => navigateWeek("next")}>
                  Next Week
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Week Grid */}
              <div className="grid grid-cols-7 gap-4">
                {Object.entries(weeklySchedule).map(([date, events]) => {
                  const dayDate = new Date(date)
                  const isToday = isSameDay(dayDate, new Date())
                  
                  return (
                    <Card key={date} className={`${isToday ? 'ring-2 ring-yellow-400' : ''}`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-center">
                          <div className={`${isToday ? 'text-yellow-600' : 'text-gray-900'}`}>
                            {format(dayDate, "EEE")}
                          </div>
                          <div className={`text-lg ${isToday ? 'text-yellow-600' : 'text-gray-900'}`}>
                            {format(dayDate, "d")}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {events.map((event) => (
                            <div key={event.id} className="p-2 bg-yellow-50 rounded text-xs">
                              <div className="font-medium text-gray-900 truncate">{event.title}</div>
                              <div className="text-gray-600">{event.start_time}</div>
                              <div className="text-gray-500 truncate">{event.location}</div>
                            </div>
                          ))}
                          {events.length === 0 && (
                            <div className="text-xs text-gray-400 text-center py-2">No classes</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Calendar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => setSelectedDate(date || new Date())}
                      className="rounded-md border"
                    />
                  </CardContent>
                </Card>
                
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>
                      Classes for {format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {scheduleEvents
                        .filter(event => event.date === format(selectedDate, "yyyy-MM-dd"))
                        .map((event) => (
                          <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h3 className="font-medium">{event.title}</h3>
                              <p className="text-sm text-gray-600">{event.course_name}</p>
                              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                <span>{event.start_time} - {event.end_time}</span>
                                <span>{event.location}</span>
                                <span>{event.students_count}/{event.max_capacity} students</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {getStatusBadge(event.status)}
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      {scheduleEvents.filter(event => event.date === format(selectedDate, "yyyy-MM-dd")).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No classes scheduled</h3>
                          <p className="mt-1 text-sm text-gray-500">No classes are scheduled for this date.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
