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
import DashboardHeader from "@/components/dashboard-header"
import { Send, Search, MessageCircle, Plus, Reply, Archive, Trash2, Loader2, Mail, MailOpen, Clock, User } from "lucide-react"
import { format } from "date-fns"
import messageAPI, { Conversation, Message, MessageRecipient, MessageStats } from "@/lib/messageAPI"
import { TokenManager } from "@/lib/tokenManager"

export default function SuperAdminMessagesPage() {
  const router = useRouter()
  const [superAdminData, setSuperAdminData] = useState<any>(null)
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
        // Check superadmin authentication
        if (!TokenManager.isAuthenticated()) {
          router.push("/login")
          return
        }

        const user = TokenManager.getUser()
        if (!user) {
          router.push("/login")
          return
        }

        // Check if user is actually a superadmin
        if (user.role !== "superadmin") {
          if (user.role === "student") {
            router.push("/student-dashboard")
          } else if (user.role === "coach") {
            router.push("/coach-dashboard")
          } else if (user.role === "branch_manager") {
            router.push("/branch-manager-dashboard")
          } else {
            router.push("/login")
          }
          return
        }

        setSuperAdminData(user)

        // Load initial data
        await Promise.all([
          loadConversations(),
          loadMessageStats(),
          loadRecipients()
        ])

      } catch (error) {
        console.error("Error initializing superadmin messages:", error)
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
      const response = await messageAPI.getConversations(0, 50)
      setConversations(response.conversations)
    } catch (error) {
      console.error("Error loading conversations:", error)
      setError("Failed to load conversations")
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const loadMessageStats = async () => {
    try {
      const response = await messageAPI.getMessageStats()
      setMessageStats(response.stats)
    } catch (error) {
      console.error("Error loading message stats:", error)
    }
  }

  const loadRecipients = async () => {
    try {
      console.log("🔍 DEBUG: Loading recipients for superadmin...")
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

      // Specifically check for branch managers
      const branchManagers = response.recipients?.filter(r => r.type === "branch_manager") || []
      console.log("🔍 DEBUG: Branch managers found:", branchManagers.length)
      branchManagers.forEach(bm => {
        console.log(`🔍 DEBUG: Branch Manager: ${bm.name} (ID: ${bm.id}, Branch: ${bm.branch_id || 'None'})`)
      })

      setRecipients(response.recipients)
    } catch (error) {
      console.error("Error loading recipients:", error)
    }
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

      // Check if there's an existing conversation with this recipient and subject
      const existingConversation = conversations.find(conv => {
        const hasRecipient = conv.participants.some(p => p.user_id === composeRecipient)
        const sameSubject = conv.subject === composeSubject || conv.subject === `Re: ${composeSubject}`
        return hasRecipient && sameSubject && !conv.is_archived
      })

      await messageAPI.sendMessage({
        recipient_id: composeRecipient,
        recipient_type: recipient.type,
        subject: composeSubject,
        content: composeContent,
        priority: composePriority,
        thread_id: existingConversation?.thread_id  // Use existing thread if found
      })

      // Reset form
      setComposeRecipient("")
      setComposeSubject("")
      setComposeContent("")
      setComposePriority("normal")
      setIsComposeDialogOpen(false)

      // Reload conversations
      await loadConversations()
      await loadMessageStats()

    } catch (error) {
      console.error("Error sending message:", error)
      setError("Failed to send message. Please try again.")
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
      const currentUserId = superAdminData?.id
      const currentUserName = superAdminData?.full_name

      // Find the other participant in the conversation
      const otherParticipant = selectedConversation.participants.find(
        p => p.user_id !== currentUserId
      )

      if (!otherParticipant) {
        setError("Cannot determine message recipient")
        return
      }

      // Find the recipient in the recipients list
      const recipient = recipients.find(r => r.id === otherParticipant.user_id)
      if (!recipient) {
        setError("Recipient not found in available recipients")
        return
      }

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
      setError("Failed to send reply. Please try again.")
    } finally {
      setIsReplying(false)
    }
  }

  const handleLogout = () => {
    TokenManager.clearAuthData()
    router.push("/login")
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
      case "coach":
        return "bg-green-100 text-green-800"
      case "branch_manager":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case "student":
        return "Student"
      case "coach":
        return "Coach"
      case "branch_manager":
        return "Branch Manager"
      default:
        return "User"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader 
          userName={superAdminData?.full_name || "Admin"}
          onLogout={handleLogout}
        />
        <main className="max-w mt-[100px]-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error && !conversations.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader 
          userName={superAdminData?.full_name || "Admin"}
          onLogout={handleLogout}
        />
        <main className="max-w mt-[100px]-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="text-red-500 mb-4">⚠️</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Messages</h3>
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
      <DashboardHeader
        userName={superAdminData?.full_name || "Admin"}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="max-w mt-[100px]-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
              <p className="text-gray-600">System-wide communication management</p>
            </div>
            <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700">
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
                        const otherParticipant = conversation.participants.find(p => p.user_id !== superAdminData?.id)
                        return (
                          <div
                            key={conversation.thread_id}
                            onClick={() => handleConversationSelect(conversation)}
                            className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                              conversation.unread_count > 0 ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                            } ${selectedConversation?.thread_id === conversation.thread_id ? "bg-purple-50" : ""}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <p className="font-semibold text-sm text-gray-900">
                                  {otherParticipant?.user_name || "Unknown"}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {conversation.unread_count > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    {conversation.unread_count}
                                  </Badge>
                                )}
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getUserTypeColor(otherParticipant?.user_type || "")}`}
                                >
                                  {getUserTypeLabel(otherParticipant?.user_type || "")}
                                </Badge>
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
                          Conversation with {selectedConversation.participants.find(p => p.user_id !== superAdminData?.id)?.user_name}
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
                            const isFromCurrentUser = message.sender_name === superAdminData?.full_name
                            return (
                              <div
                                key={message.id}
                                className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className={`max-w-[70%] rounded-lg p-3 ${
                                  isFromCurrentUser
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                }`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <p className={`text-xs font-medium ${
                                      isFromCurrentUser ? 'text-purple-100' : 'text-gray-600'
                                    }`}>
                                      {message.sender_name}
                                    </p>
                                    <p className={`text-xs ${
                                      isFromCurrentUser ? 'text-purple-100' : 'text-gray-500'
                                    }`}>
                                      {format(new Date(message.created_at), "MMM d, h:mm a")}
                                    </p>
                                  </div>
                                  <p className="text-sm leading-relaxed">{message.content}</p>
                                  {message.priority !== 'normal' && (
                                    <Badge
                                      variant="outline"
                                      className={`mt-2 text-xs ${
                                        message.priority === 'high' || message.priority === 'urgent'
                                          ? 'border-red-300 text-red-600'
                                          : 'border-gray-300'
                                      }`}
                                    >
                                      {message.priority}
                                    </Badge>
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
                                className="bg-purple-600 hover:bg-purple-700"
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
                <CardDescription>System-wide communication tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {recipients.filter(r => r.type === 'student').length > 0 && (
                    <Button
                      variant="outline"
                      className="flex items-center space-x-2"
                      onClick={() => {
                        const student = recipients.find(r => r.type === 'student')
                        if (student) {
                          setComposeRecipient(student.id)
                          setComposeSubject("System Announcement")
                          setIsComposeDialogOpen(true)
                        }
                      }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Message Students</span>
                    </Button>
                  )}
                  {recipients.filter(r => r.type === 'coach').length > 0 && (
                    <Button
                      variant="outline"
                      className="flex items-center space-x-2"
                      onClick={() => {
                        const coach = recipients.find(r => r.type === 'coach')
                        if (coach) {
                          setComposeRecipient(coach.id)
                          setComposeSubject("Coach Communication")
                          setIsComposeDialogOpen(true)
                        }
                      }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Message Coaches</span>
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
                          setComposeSubject("Branch Management")
                          setIsComposeDialogOpen(true)
                        }
                      }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Message Branch Managers</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2"
                    onClick={() => {
                      setComposeSubject("System Broadcast")
                      setComposePriority("high")
                      setIsComposeDialogOpen(true)
                    }}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>System Broadcast</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
