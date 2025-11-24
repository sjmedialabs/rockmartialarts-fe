"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CoachDashboardHeader from "@/components/coach-dashboard-header"
import { Send, Search, MessageCircle, Plus, Reply, Archive, Trash2, Loader2, Mail, MailOpen, Clock, User } from "lucide-react"
import { format } from "date-fns"
import messageAPI, { Conversation, Message, MessageRecipient, MessageStats } from "@/lib/messageAPI"
import { checkCoachAuth } from "@/lib/coachAuth"

export default function CoachMessagesPage() {
  const router = useRouter()
  const [coachData, setCoachData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Message state
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [threadMessages, setThreadMessages] = useState<Message[]>([])
  const [messageStats, setMessageStats] = useState<MessageStats | null>(null)
  const [recipients, setRecipients] = useState<MessageRecipient[]>([])

  // UI state
  const [activeTab, setActiveTab] = useState("inbox")
  const [searchTerm, setSearchTerm] = useState("")
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isLoadingThread, setIsLoadingThread] = useState(false)

  // Compose message state
  const [composeRecipient, setComposeRecipient] = useState("")
  const [composeSubject, setComposeSubject] = useState("")
  const [composeContent, setComposeContent] = useState("")
  const [composePriority, setComposePriority] = useState<"low" | "normal" | "high" | "urgent">("normal")
  const [isSending, setIsSending] = useState(false)

  // Reply state
  const [replyContent, setReplyContent] = useState("")
  const [isReplying, setIsReplying] = useState(false)

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Check coach authentication
        console.log('🔍 DEBUG: Initializing coach messages page...')
        const authResult = checkCoachAuth()
        console.log('🔍 DEBUG: Coach auth result:', {
          isAuthenticated: authResult.isAuthenticated,
          hasCoach: !!authResult.coach,
          hasToken: !!authResult.token,
          coachId: authResult.coach?.id,
          tokenPreview: authResult.token?.substring(0, 20) + '...'
        })

        if (!authResult.isAuthenticated || !authResult.coach) {
          console.log('🔍 DEBUG: Coach not authenticated, redirecting to login')
          router.push("/coach/login")
          return
        }

        setCoachData(authResult.coach)

        // Load initial data
        console.log('🔍 DEBUG: Loading initial message data...')
        await Promise.all([
          loadConversations(),
          loadMessageStats(),
          loadRecipients()
        ])

      } catch (error) {
        console.error("Error initializing coach messages:", error)
        setError("Failed to load messages. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [router])

  // Data loading functions
  const loadConversations = async () => {
    try {
      setIsLoadingMessages(true)
      setError(null) // Clear previous errors
      console.log("🔍 DEBUG: Loading conversations for coach...")

      const response = await messageAPI.getConversations(0, 50)
      console.log("🔍 DEBUG: Conversations response:", response)

      setConversations(response.conversations || [])
    } catch (error) {
      console.error("Error loading conversations:", error)

      // Provide more specific error messages based on error type
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          setError("Authentication failed. Please log out and log back in.")
          console.log("🔍 DEBUG: Authentication error - redirecting to login")
          setTimeout(() => router.push("/coach/login"), 2000)
          return
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          setError("You don't have permission to access messages. Please contact your administrator.")
        } else if (error.message.includes('404')) {
          console.log("🔍 DEBUG: 404 error detected, loading sample data")
          loadSampleData()
          return
        } else if (error.message.includes('500')) {
          setError("Server error occurred. Please try again later or contact support.")
        } else if (error.message.includes('Network')) {
          setError("Network connection error. Please check your internet connection and try again.")
        } else {
          // For other errors, provide a generic message but still try sample data
          console.log("🔍 DEBUG: API error detected, loading sample data as fallback")
          setError("Unable to connect to messaging service. Showing demo data.")
          loadSampleData()
          return
        }
      } else {
        setError("An unexpected error occurred while loading messages.")
      }
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const loadMessageStats = async () => {
    try {
      console.log("🔍 DEBUG: Loading message stats for coach...")
      const response = await messageAPI.getMessageStats()
      console.log("🔍 DEBUG: Message stats response:", response)
      setMessageStats(response.stats)
    } catch (error) {
      console.error("Error loading message stats:", error)
      // Set default stats if API is not available
      setMessageStats({
        total_messages: 0,
        unread_messages: 0,
        sent_messages: 0,
        received_messages: 0,
        archived_messages: 0
      })
    }
  }

  const loadRecipients = async () => {
    try {
      console.log("🔍 DEBUG: Loading recipients for coach...")
      console.log("🔍 DEBUG: Coach data:", coachData)

      // Also check what's in localStorage for debugging
      const token = localStorage.getItem("access_token") || localStorage.getItem("token")
      if (token) {
        try {
          const parts = token.split('.')
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1] + '='.repeat((4 - parts[1].length % 4) % 4)))
            console.log("🔍 DEBUG: JWT token payload:", payload)
          }
        } catch (e) {
          console.warn("Could not decode JWT token:", e)
        }
      }

      const response = await messageAPI.getAvailableRecipients()
      console.log("🔍 DEBUG: Recipients response:", response)
      console.log("🔍 DEBUG: Total recipients:", response.recipients?.length || 0)

      // Log recipients by type
      const byType: Record<string, any[]> = {}
      response.recipients?.forEach(recipient => {
        const type = recipient.type
        if (!byType[type]) byType[type] = []
        byType[type].push(recipient)
      })

      console.log("🔍 DEBUG: Recipients by type:", byType)

      // Specifically check for students
      const students = response.recipients?.filter(r => r.type === "student") || []
      console.log("🔍 DEBUG: Students found:", students.length)
      students.forEach(student => {
        console.log(`🔍 DEBUG: Student: ${student.name} (ID: ${student.id}, Branch: ${student.branch_id || 'None'})`)
      })

      // Specifically check for branch managers
      const branchManagers = response.recipients?.filter(r => r.type === "branch_manager") || []
      console.log("🔍 DEBUG: Branch managers found:", branchManagers.length)
      branchManagers.forEach(bm => {
        console.log(`🔍 DEBUG: Branch Manager: ${bm.name} (ID: ${bm.id}, Branch: ${bm.branch_id || 'None'})`)
      })

      // Check for superadmins
      const superadmins = response.recipients?.filter(r => r.type === "superadmin") || []
      console.log("🔍 DEBUG: Superadmins found:", superadmins.length)

      // Check coach's branch assignment
      if (coachData?.branch_id) {
        console.log(`🔍 DEBUG: Coach branch ID: ${coachData.branch_id}`)
        const studentsInBranch = students.filter(s => s.branch_id === coachData.branch_id)
        console.log(`🔍 DEBUG: Students in coach's branch: ${studentsInBranch.length}`)
      } else {
        console.log("⚠️ DEBUG: Coach has no branch_id assigned")
        console.log("🔍 DEBUG: Checking all coach data fields:", Object.keys(coachData || {}))
      }

      setRecipients(response.recipients || [])
    } catch (error) {
      console.error("Error loading recipients:", error)
      // Set empty recipients array if API is not available
      setRecipients([])
    }
  }

  // Load sample data for demo when API is not available
  const loadSampleData = () => {
    console.log("🔍 DEBUG: Loading sample message data for coach demo")

    // Sample conversations
    const sampleConversations: Conversation[] = [
      {
        thread_id: "thread-1",
        subject: "Welcome to Karate Class",
        participants: [
          {
            user_id: "student-1",
            user_type: "student",
            user_name: "Rahul Kumar",
            user_email: "rahul@example.com",
            branch_id: coachData?.branch_id
          },
          {
            user_id: coachData?.id || "coach-1",
            user_type: "coach",
            user_name: coachData?.full_name || "Coach",
            user_email: coachData?.email || "coach@example.com",
            branch_id: coachData?.branch_id
          }
        ],
        message_count: 3,
        last_message: {
          id: "msg-1",
          sender_name: "Rahul Kumar",
          sender_type: "student",
          recipient_name: coachData?.full_name || "Coach",
          recipient_type: "coach",
          subject: "Welcome to Karate Class",
          content: "Thank you for the warm welcome! I'm excited to start learning karate.",
          priority: "normal",
          status: "delivered",
          is_read: false,
          is_archived: false,
          is_reply: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        last_message_at: new Date().toISOString()
      },
      {
        thread_id: "thread-2",
        subject: "Schedule Change Request",
        participants: [
          {
            user_id: "student-2",
            user_type: "student",
            user_name: "Priya Sharma",
            user_email: "priya@example.com",
            branch_id: coachData?.branch_id
          },
          {
            user_id: coachData?.id || "coach-1",
            user_type: "coach",
            user_name: coachData?.full_name || "Coach",
            user_email: coachData?.email || "coach@example.com",
            branch_id: coachData?.branch_id
          }
        ],
        message_count: 2,
        last_message: {
          id: "msg-2",
          sender_name: "Priya Sharma",
          sender_type: "student",
          recipient_name: coachData?.full_name || "Coach",
          recipient_type: "coach",
          subject: "Schedule Change Request",
          content: "Hi Coach, I need to change my class timing from morning to evening. Is that possible?",
          priority: "normal",
          status: "delivered",
          is_read: false,
          is_archived: false,
          is_reply: false,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        last_message_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ]

    // Sample recipients
    const sampleRecipients: MessageRecipient[] = [
      {
        id: "student-1",
        name: "Rahul Kumar",
        email: "rahul@example.com",
        type: "student",
        branch_id: coachData?.branch_id,
        is_active: true
      },
      {
        id: "student-2",
        name: "Priya Sharma",
        email: "priya@example.com",
        type: "student",
        branch_id: coachData?.branch_id,
        is_active: true
      },
      {
        id: "student-3",
        name: "Amit Patel",
        email: "amit@example.com",
        type: "student",
        branch_id: coachData?.branch_id,
        is_active: true
      },
      {
        id: "bm-1",
        name: "Branch Manager",
        email: "manager@example.com",
        type: "branch_manager",
        branch_id: coachData?.branch_id,
        is_active: true
      },
      {
        id: "admin-1",
        name: "Super Admin",
        email: "admin@example.com",
        type: "superadmin",
        is_active: true
      }
    ]

    setConversations(sampleConversations)
    setRecipients(sampleRecipients)
    setMessageStats({
      total_messages: 5,
      unread_messages: 2,
      sent_messages: 3,
      received_messages: 2,
      archived_messages: 0
    })

    // Show demo notice
    setError("Demo Mode: Message system is being configured. You're viewing sample data to see how the messaging interface will work once the backend is fully deployed.")
  }

  const loadThreadMessages = async (threadId: string) => {
    try {
      setIsLoadingThread(true)
      const response = await messageAPI.getThreadMessages(threadId, 0, 50)
      setThreadMessages(response.messages)
    } catch (error) {
      console.error("Error loading thread messages:", error)
      setError("Failed to load messages")
    } finally {
      setIsLoadingThread(false)
    }
  }

  // Event handlers
  const handleConversationSelect = async (conversation: Conversation) => {
    setSelectedConversation(conversation)
    await loadThreadMessages(conversation.thread_id)
  }

  const handleSendMessage = async () => {
    if (!composeRecipient || !composeSubject || !composeContent) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setIsSending(true)
      setError(null)

      const recipient = recipients.find(r => r.id === composeRecipient)
      if (!recipient) {
        setError("Invalid recipient selected")
        return
      }

      console.log("🔍 DEBUG: Sending message to:", recipient)
      console.log("🔍 DEBUG: Message details:", { subject: composeSubject, recipient_type: recipient.type })

      // Check if there's an existing conversation with this recipient and subject
      const existingConversation = conversations.find(conv => {
        const hasRecipient = conv.participants.some(p => p.user_id === composeRecipient)
        const sameSubject = conv.subject === composeSubject || conv.subject === `Re: ${composeSubject}`
        return hasRecipient && sameSubject && !conv.is_archived
      })

      if (existingConversation) {
        console.log("🔍 DEBUG: Found existing conversation:", existingConversation.thread_id)
      }

      const messageData = {
        recipient_id: composeRecipient,
        recipient_type: recipient.type,
        subject: composeSubject,
        content: composeContent,
        priority: composePriority,
        thread_id: existingConversation?.thread_id  // Use existing thread if found
      }

      console.log("🔍 DEBUG: Sending message with data:", messageData)
      const result = await messageAPI.sendMessage(messageData)
      console.log("🔍 DEBUG: Message sent successfully:", result)

      // Reset form
      setComposeRecipient("")
      setComposeSubject("")
      setComposeContent("")
      setComposePriority("normal")
      setIsComposeDialogOpen(false)

      // Show success message
      setError(null)

      // Reload conversations
      await loadConversations()
      await loadMessageStats()

    } catch (error) {
      console.error("Error sending message:", error)

      // Provide specific error messages based on error type
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          setError("Authentication failed. Please log out and log back in to send messages.")
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          setError("You don't have permission to send messages to this recipient.")
        } else if (error.message.includes('400') || error.message.includes('Bad Request')) {
          setError("Invalid message data. Please check all fields and try again.")
        } else if (error.message.includes('500')) {
          setError("Server error occurred while sending message. Please try again later.")
        } else if (error.message.includes('Network')) {
          setError("Network connection error. Please check your internet connection and try again.")
        } else {
          setError(`Failed to send message: ${error.message}`)
        }
      } else {
        setError("Failed to send message. Please try again.")
      }
    } finally {
      setIsSending(false)
    }
  }

  const handleSendReply = async () => {
    if (!replyContent || !selectedConversation) return

    try {
      setIsReplying(true)
      setError(null)

      // Find the last message to reply to
      const lastMessage = threadMessages[threadMessages.length - 1]
      if (!lastMessage) return

      // Determine recipient - find the other participant in the conversation
      const currentUserId = coachData?.id
      const currentUserName = coachData?.full_name

      console.log("🔍 DEBUG: Reply - Current user ID:", currentUserId)
      console.log("🔍 DEBUG: Reply - Conversation participants:", selectedConversation.participants)

      // Find the other participant in the conversation
      const otherParticipant = selectedConversation.participants.find(
        p => p.user_id !== currentUserId
      )

      if (!otherParticipant) {
        console.error("❌ DEBUG: Cannot find other participant in conversation")
        setError("Cannot determine message recipient")
        return
      }

      console.log("🔍 DEBUG: Reply - Other participant:", otherParticipant)

      // Find the recipient in the recipients list
      let recipient = recipients.find(r => r.id === otherParticipant.user_id)

      // If recipient not found in current recipients list, create a temporary recipient object
      // This can happen when replying to existing conversations where the participant
      // might not be in the current filtered recipients list
      if (!recipient) {
        console.warn("⚠️ DEBUG: Recipient not found in current recipients list, creating temporary recipient")
        console.log("🔍 DEBUG: Available recipients:", recipients.map(r => ({ id: r.id, name: r.name, type: r.type })))

        // Create a temporary recipient object from the conversation participant data
        recipient = {
          id: otherParticipant.user_id,
          name: otherParticipant.user_name,
          email: otherParticipant.user_email,
          type: otherParticipant.user_type,
          branch_id: otherParticipant.branch_id
        }

        console.log("🔍 DEBUG: Created temporary recipient:", recipient)
      }

      console.log("🔍 DEBUG: Reply - Using recipient:", recipient)

      // Normalize subject - remove "Re:" prefix if it exists to avoid "Re: Re:" chains
      let replySubject = selectedConversation.subject
      if (!replySubject.startsWith("Re: ")) {
        replySubject = `Re: ${replySubject}`
      }

      await messageAPI.sendMessage({
        recipient_id: recipient.id,
        recipient_type: recipient.type,
        subject: replySubject,
        content: replyContent,
        priority: "normal",
        reply_to_message_id: lastMessage.id,
        thread_id: selectedConversation.thread_id  // Pass the existing thread_id
      })

      setReplyContent("")

      // Reload thread messages
      await loadThreadMessages(selectedConversation.thread_id)
      await loadConversations()
      await loadMessageStats()

    } catch (error) {
      console.error("Error sending reply:", error)

      // Provide specific error messages for replies
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          setError("Authentication failed. Please log out and log back in to send replies.")
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          setError("You don't have permission to reply to this message.")
        } else if (error.message.includes('400') || error.message.includes('Bad Request')) {
          setError("Invalid reply data. Please check your message and try again.")
        } else if (error.message.includes('500')) {
          setError("Server error occurred while sending reply. Please try again later.")
        } else if (error.message.includes('Network')) {
          setError("Network connection error. Please check your internet connection and try again.")
        } else {
          setError(`Failed to send reply: ${error.message}`)
        }
      } else {
        setError("Failed to send reply. Please try again.")
      }
    } finally {
      setIsReplying(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("coachToken")
    localStorage.removeItem("coachData")
    router.push("/coach/login")
  }

  // Filter conversations based on active tab and search
  const filteredConversations = conversations.filter(conv => {
    // Filter by tab
    if (activeTab === "unread" && conv.unread_count === 0) return false
    if (activeTab === "archived" && !conv.is_archived) return false
    if (activeTab === "inbox" && conv.is_archived) return false

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        conv.subject.toLowerCase().includes(searchLower) ||
        conv.participants.some(p => p.user_name.toLowerCase().includes(searchLower)) ||
        conv.last_message?.content.toLowerCase().includes(searchLower)
      )
    }

    return true
  })

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case "student":
        return "bg-blue-100 text-blue-800"
      case "branch_manager":
        return "bg-green-100 text-green-800"
      case "superadmin":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case "student":
        return "Student"
      case "branch_manager":
        return "Branch Manager"
      case "superadmin":
        return "Admin"
      default:
        return "User"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CoachDashboardHeader
          currentPage="Messages"
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

  // Only show error screen if there's an error AND no conversations (including sample data)
  if (error && !conversations.length && !error.includes("Demo Mode")) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CoachDashboardHeader
          currentPage="Messages"
          coachName={coachData?.full_name || "Coach"}
        />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mt-[100px]">
          <div className="px-4 py-6 sm:px-0">
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="text-red-500 mb-4">⚠️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Message System Unavailable</h3>
                  <p className="text-gray-500 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
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
        currentPage="Messages"
        coachName={coachData?.full_name || "Coach"}
      />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mt-[100px]">
        <div className="px-4 py-6 sm:px-0">
          {/* Demo Mode Notice */}
          {error && error.includes("Demo Mode") && (
            <div className="mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Demo Mode Active</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
              <p className="text-gray-600">Communication with students and administration</p>
            </div>
            <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-yellow-600 hover:bg-yellow-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Compose Message
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Compose New Message</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="recipient" className="text-sm font-medium">
                      To
                    </label>
                    <Select value={composeRecipient} onValueChange={setComposeRecipient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipient" />
                      </SelectTrigger>
                      <SelectContent>
                        {recipients.map((recipient) => (
                          <SelectItem key={recipient.id} value={recipient.id}>
                            <div className="flex items-center space-x-2">
                              <span>{recipient.name}</span>
                              <Badge variant="outline" className={`text-xs ${getUserTypeColor(recipient.type)}`}>
                                {getUserTypeLabel(recipient.type)}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      value={composeSubject}
                      onChange={(e) => setComposeSubject(e.target.value)}
                      placeholder="Enter message subject"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="priority" className="text-sm font-medium">
                      Priority
                    </label>
                    <Select value={composePriority} onValueChange={(value: any) => setComposePriority(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="content" className="text-sm font-medium">
                      Message
                    </label>
                    <Textarea
                      id="content"
                      value={composeContent}
                      onChange={(e) => setComposeContent(e.target.value)}
                      placeholder="Type your message here..."
                      className="min-h-[120px]"
                    />
                  </div>
                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {error}
                    </div>
                  )}
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsComposeDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSendMessage} disabled={isSending}>
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Message Stats */}
          {messageStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Messages</p>
                      <p className="text-2xl font-bold text-gray-900">{messageStats.total_messages}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <MailOpen className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Unread</p>
                      <p className="text-2xl font-bold text-gray-900">{messageStats.unread_messages}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Send className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Sent</p>
                      <p className="text-2xl font-bold text-gray-900">{messageStats.sent_messages}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Conversations</p>
                      <p className="text-2xl font-bold text-gray-900">{messageStats.active_conversations}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="inbox">Inbox</TabsTrigger>
                      <TabsTrigger value="unread">
                        Unread
                        {messageStats && messageStats.unread_messages > 0 && (
                          <Badge variant="secondary" className="ml-1 text-xs">
                            {messageStats.unread_messages}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="archived">Archived</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search conversations..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="text-center p-8">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No conversations found</p>
                    </div>
                  ) : (
                    <div className="space-y-0">
                      {filteredConversations.map((conversation) => {
                        const otherParticipant = conversation.participants.find(p => p.user_id !== coachData?.id)
                        return (
                          <div
                            key={conversation.thread_id}
                            onClick={() => handleConversationSelect(conversation)}
                            className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                              conversation.unread_count > 0 ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                            } ${selectedConversation?.thread_id === conversation.thread_id ? "bg-yellow-50" : ""}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-2">
                                {/* Role-specific icon */}
                                {otherParticipant?.user_type === 'student' && (
                                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold text-blue-600">S</span>
                                  </div>
                                )}
                                {otherParticipant?.user_type === 'coach' && (
                                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold text-yellow-600">C</span>
                                  </div>
                                )}
                                {otherParticipant?.user_type === 'branch_manager' && (
                                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold text-green-600">M</span>
                                  </div>
                                )}
                                {otherParticipant?.user_type === 'superadmin' && (
                                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-bold text-purple-600">A</span>
                                  </div>
                                )}
                                {!otherParticipant?.user_type && (
                                  <User className="w-4 h-4 text-gray-400" />
                                )}
                                <div>
                                  <p className="font-semibold text-sm text-gray-900">
                                    {otherParticipant?.user_name || "Unknown"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {getUserTypeLabel(otherParticipant?.user_type || "")}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {conversation.unread_count > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {conversation.unread_count}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="font-medium text-sm text-gray-800 mb-1 truncate">{conversation.subject}</p>
                            {conversation.last_message && (
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                {conversation.last_message.content}
                              </p>
                            )}
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-gray-500">
                                {conversation.last_message_at ?
                                  format(new Date(conversation.last_message_at), "MMM d, yyyy") :
                                  format(new Date(conversation.created_at), "MMM d, yyyy")
                                }
                              </p>
                              <p className="text-xs text-gray-500">
                                {conversation.message_count} message{conversation.message_count !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Message Thread Detail */}
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{selectedConversation.subject}</CardTitle>
                        <CardDescription>
                          Conversation with {selectedConversation.participants.find(p => p.user_id !== coachData?.id)?.user_name}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {selectedConversation.message_count} message{selectedConversation.message_count !== 1 ? 's' : ''}
                        </Badge>
                        {selectedConversation.unread_count > 0 && (
                          <Badge variant="secondary">
                            {selectedConversation.unread_count} unread
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingThread ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Messages Thread */}
                        <div className="max-h-96 overflow-y-auto space-y-4 border rounded-lg p-4">
                          {threadMessages.map((message, index) => {
                            // More reliable way to determine if message is from current user
                            // Check if sender is a coach and name matches current coach
                            const isFromCurrentUser = message.sender_type === 'coach' &&
                              message.sender_name === coachData?.full_name

                            // Debug logging for message identification
                            if (index === 0) { // Only log for first message to avoid spam
                              console.log("🔍 DEBUG: Message sender identification:", {
                                messageSenderName: message.sender_name,
                                messageSenderType: message.sender_type,
                                coachName: coachData?.full_name,
                                isFromCurrentUser: isFromCurrentUser
                              })
                            }

                            // Determine sender role styling
                            const getSenderRoleColor = (senderType: string) => {
                              switch (senderType) {
                                case 'student':
                                  return 'bg-blue-500 text-white'
                                case 'coach':
                                  return 'bg-yellow-600 text-white'
                                case 'branch_manager':
                                  return 'bg-green-600 text-white'
                                case 'superadmin':
                                  return 'bg-purple-600 text-white'
                                default:
                                  return 'bg-gray-500 text-white'
                              }
                            }

                            const getSenderRoleLabel = (senderType: string) => {
                              switch (senderType) {
                                case 'student':
                                  return 'Student'
                                case 'coach':
                                  return 'Coach'
                                case 'branch_manager':
                                  return 'Branch Manager'
                                case 'superadmin':
                                  return 'Admin'
                                default:
                                  return 'User'
                              }
                            }

                            return (
                              <div
                                key={message.id}
                                className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className={`max-w-[70%] rounded-lg p-3 ${
                                  isFromCurrentUser
                                    ? 'bg-yellow-600 text-white shadow-md'
                                    : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                                }`}>
                                  {/* Sender Info Header */}
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <p className={`text-xs font-semibold ${
                                        isFromCurrentUser ? 'text-yellow-100' : 'text-gray-800'
                                      }`}>
                                        {message.sender_name}
                                      </p>
                                      <Badge
                                        variant="outline"
                                        className={`text-xs px-2 py-0.5 ${
                                          isFromCurrentUser
                                            ? 'border-yellow-300 text-yellow-100 bg-yellow-700'
                                            : getSenderRoleColor(message.sender_type)
                                        }`}
                                      >
                                        {getSenderRoleLabel(message.sender_type)}
                                      </Badge>
                                    </div>
                                    <p className={`text-xs ${
                                      isFromCurrentUser ? 'text-yellow-100' : 'text-gray-500'
                                    }`}>
                                      {format(new Date(message.created_at), "MMM d, h:mm a")}
                                    </p>
                                  </div>

                                  {/* Message Content */}
                                  <p className="text-sm leading-relaxed">{message.content}</p>

                                  {/* Priority Badge */}
                                  {message.priority !== 'normal' && (
                                    <div className="mt-2">
                                      <Badge
                                        variant="outline"
                                        className={`text-xs ${
                                          message.priority === 'high' || message.priority === 'urgent'
                                            ? isFromCurrentUser
                                              ? 'border-red-300 text-red-100 bg-red-700'
                                              : 'border-red-300 text-red-600 bg-red-50'
                                            : isFromCurrentUser
                                              ? 'border-yellow-300 text-yellow-100'
                                              : 'border-gray-300 text-gray-600'
                                        }`}
                                      >
                                        {message.priority.toUpperCase()}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Reply Section */}
                        <div className="border-t pt-4 mt-6">
                          <h4 className="font-semibold text-gray-900 mb-3">Reply</h4>
                          <div className="space-y-3">
                            <Textarea
                              placeholder="Type your reply here..."
                              className="min-h-[100px]"
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                            />
                            {error && (
                              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                {error}
                              </div>
                            )}
                            <div className="flex justify-end">
                              <Button
                                onClick={handleSendReply}
                                disabled={isReplying || !replyContent.trim()}
                                className="bg-yellow-600 hover:bg-yellow-700"
                              >
                                {isReplying ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Reply className="w-4 h-4 mr-2" />
                                    Send Reply
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                      <p className="text-gray-500">Choose a conversation from the list to view messages</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common message actions and contacts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recipients.filter(r => r.type === 'superadmin').length > 0 && (
                    <Button
                      variant="outline"
                      className="flex items-center space-x-2"
                      onClick={() => {
                        const admin = recipients.find(r => r.type === 'superadmin')
                        if (admin) {
                          setComposeRecipient(admin.id)
                          setComposeSubject("Coach Inquiry")
                          setIsComposeDialogOpen(true)
                        }
                      }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Contact Admin</span>
                    </Button>
                  )}
                  {recipients.filter(r => r.type === 'student').length > 0 && (
                    <Button
                      variant="outline"
                      className="flex items-center space-x-2"
                      onClick={() => {
                        const student = recipients.find(r => r.type === 'student')
                        if (student) {
                          setComposeRecipient(student.id)
                          setComposeSubject("Training Update")
                          setIsComposeDialogOpen(true)
                        }
                      }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Student Chat</span>
                    </Button>
                  )}
                  {recipients.filter(r => r.type === 'branch_manager').length > 0 && (
                    <Button
                      variant="outline"
                      className="flex items-center space-x-2"
                      onClick={() => {
                        const manager = recipients.find(r => r.type === 'branch_manager')
                        if (manager) {
                          setComposeRecipient(manager.id)
                          setComposeSubject("Branch Update")
                          setIsComposeDialogOpen(true)
                        }
                      }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Branch Manager Chat</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
