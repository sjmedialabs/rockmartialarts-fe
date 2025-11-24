import { TokenManager } from './tokenManager'
import { BranchManagerAuth } from './branchManagerAuth'

export interface PaymentNotification {
  id: string
  payment_id: string
  student_id: string
  notification_type: string
  title: string
  message: string
  amount?: number
  course_name?: string
  branch_name?: string
  is_read: boolean
  priority: string
  created_at: string
  read_at?: string
}

export interface MessageNotification {
  id: string
  message_id: string
  thread_id: string
  recipient_id: string
  recipient_type: string
  sender_id: string
  sender_name: string
  sender_type: string
  notification_type: string
  title: string
  message: string
  subject: string
  is_read: boolean
  priority: string
  created_at: string
  read_at?: string
}

export interface NotificationResponse {
  notifications: PaymentNotification[]
  total: number
  unread_count: number
}

export interface MessageNotificationResponse {
  notifications: MessageNotification[]
  total: number
  unread_count: number
}

class NotificationAPI {
  private baseURL: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://31.97.224.169:8003'
  }

  private getUserRole(): string | null {
    // Check if user is a branch manager
    const branchManagerUser = BranchManagerAuth.getCurrentUser()
    if (branchManagerUser && branchManagerUser.role === 'branch_manager') {
      return 'branch_manager'
    }

    // Check if user is superadmin or other role via TokenManager
    const token = TokenManager.getToken()
    if (token) {
      try {
        const user = TokenManager.getUser()
        return user?.role || null
      } catch (error) {
        console.error('Error getting user role:', error)
        return null
      }
    }

    return null
  }

  private getAuthToken(): string | null {
    // Check if user is a branch manager first
    const branchManagerUser = BranchManagerAuth.getCurrentUser()
    if (branchManagerUser && branchManagerUser.role === 'branch_manager') {
      return BranchManagerAuth.getToken()
    }

    // Otherwise use TokenManager
    return TokenManager.getToken()
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = this.getAuthToken()

    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(errorData.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async getNotifications(skip: number = 0, limit: number = 50): Promise<PaymentNotification[] | MessageNotification[]> {
    try {
      const userRole = this.getUserRole()

      if (userRole === 'branch_manager') {
        // Branch managers get message notifications
        const data = await this.makeRequest(`/api/messages/notifications?skip=${skip}&limit=${limit}`)
        return data.notifications || []
      } else if (userRole === 'super_admin') {
        // Superadmins get payment notifications
        const data = await this.makeRequest(`/api/payments/notifications?skip=${skip}&limit=${limit}`)
        return data || []
      } else {
        // Other roles get message notifications
        const data = await this.makeRequest(`/api/messages/notifications?skip=${skip}&limit=${limit}`)
        return data.notifications || []
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      throw error
    }
  }

  async getPaymentNotifications(skip: number = 0, limit: number = 50): Promise<PaymentNotification[]> {
    try {
      const data = await this.makeRequest(`/api/payments/notifications?skip=${skip}&limit=${limit}`)
      return data || []
    } catch (error) {
      console.error('Error fetching payment notifications:', error)
      throw error
    }
  }

  async getMessageNotifications(skip: number = 0, limit: number = 50): Promise<MessageNotificationResponse> {
    try {
      const data = await this.makeRequest(`/api/messages/notifications?skip=${skip}&limit=${limit}`)
      return data
    } catch (error) {
      console.error('Error fetching message notifications:', error)
      throw error
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const userRole = this.getUserRole()

      if (userRole === 'branch_manager') {
        // Branch managers mark message notifications as read
        await this.makeRequest(`/api/messages/notifications/${notificationId}/read`, {
          method: 'PUT'
        })
      } else if (userRole === 'super_admin') {
        // Superadmins mark payment notifications as read
        await this.makeRequest(`/api/payments/notifications/${notificationId}/read`, {
          method: 'PUT'
        })
      } else {
        // Other roles mark message notifications as read
        await this.makeRequest(`/api/messages/notifications/${notificationId}/read`, {
          method: 'PUT'
        })
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      throw error
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const userRole = this.getUserRole()

      if (userRole === 'branch_manager') {
        const data = await this.getMessageNotifications(0, 100)
        return data.unread_count || 0
      } else if (userRole === 'super_admin') {
        const notifications = await this.getPaymentNotifications(0, 100)
        return notifications.filter(n => !n.is_read).length
      } else {
        const data = await this.getMessageNotifications(0, 100)
        return data.unread_count || 0
      }
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }
}

export const notificationAPI = new NotificationAPI()
