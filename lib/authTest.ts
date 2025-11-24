// Authentication testing utility to verify login flows and token storage

import { TokenManager } from './tokenManager'

export interface LoginTestResult {
  success: boolean
  message: string
  data?: any
  error?: string
}

/**
 * Test authentication flows for all user types
 */
export class AuthTester {
  private static readonly BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://31.97.224.169:8003'

  /**
   * Test superadmin login flow
   */
  static async testSuperadminLogin(email: string, password: string): Promise<LoginTestResult> {
    try {
      console.log('🧪 Testing superadmin login...')
      
      const response = await fetch(`${this.BASE_URL}/superadmin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          message: 'Superadmin login failed',
          error: data.detail || data.message || `HTTP ${response.status}`
        }
      }

      // Validate response structure
      if (!data.token || !data.admin || data.admin.role !== 'superadmin') {
        return {
          success: false,
          message: 'Invalid superadmin login response',
          error: 'Missing token or admin data'
        }
      }

      // Test token storage
      const userData = TokenManager.storeAuthData({
        access_token: data.token,
        token_type: data.token_type,
        expires_in: data.expires_in,
        admin: data.admin
      })

      // Verify storage
      const storedToken = TokenManager.getToken()
      const storedUser = TokenManager.getUser()
      const isAuthenticated = TokenManager.isAuthenticated()

      if (!storedToken || !storedUser || !isAuthenticated) {
        return {
          success: false,
          message: 'Token storage failed',
          error: 'Failed to store or retrieve authentication data'
        }
      }

      return {
        success: true,
        message: 'Superadmin login successful',
        data: {
          user: userData,
          token_preview: storedToken.substring(0, 20) + '...',
          is_authenticated: isAuthenticated
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Superadmin login test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Test coach login flow
   */
  static async testCoachLogin(email: string, password: string): Promise<LoginTestResult> {
    try {
      console.log('🧪 Testing coach login...')
      
      const response = await fetch(`${this.BASE_URL}/api/coaches/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          message: 'Coach login failed',
          error: data.detail || data.message || `HTTP ${response.status}`
        }
      }

      // Validate response structure
      if (!data.access_token || !data.coach || data.coach.role !== 'coach') {
        return {
          success: false,
          message: 'Invalid coach login response',
          error: 'Missing access_token or coach data'
        }
      }

      // Test token storage
      const userData = TokenManager.storeAuthData({
        access_token: data.access_token,
        token_type: data.token_type,
        expires_in: data.expires_in,
        coach: data.coach
      })

      // Verify storage
      const storedToken = TokenManager.getToken()
      const storedUser = TokenManager.getUser()
      const isAuthenticated = TokenManager.isAuthenticated()

      if (!storedToken || !storedUser || !isAuthenticated) {
        return {
          success: false,
          message: 'Token storage failed',
          error: 'Failed to store or retrieve authentication data'
        }
      }

      return {
        success: true,
        message: 'Coach login successful',
        data: {
          user: userData,
          token_preview: storedToken.substring(0, 20) + '...',
          is_authenticated: isAuthenticated
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Coach login test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Test student login flow
   */
  static async testStudentLogin(email: string, password: string): Promise<LoginTestResult> {
    try {
      console.log('🧪 Testing student login...')
      
      const response = await fetch(`${this.BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          message: 'Student login failed',
          error: data.detail || data.message || `HTTP ${response.status}`
        }
      }

      // Validate response structure
      if (!data.access_token || !data.user || data.user.role !== 'student') {
        return {
          success: false,
          message: 'Invalid student login response',
          error: 'Missing access_token or user data'
        }
      }

      // Test token storage
      const userData = TokenManager.storeAuthData({
        access_token: data.access_token,
        token_type: data.token_type,
        expires_in: data.expires_in,
        user: data.user
      })

      // Verify storage
      const storedToken = TokenManager.getToken()
      const storedUser = TokenManager.getUser()
      const isAuthenticated = TokenManager.isAuthenticated()

      if (!storedToken || !storedUser || !isAuthenticated) {
        return {
          success: false,
          message: 'Token storage failed',
          error: 'Failed to store or retrieve authentication data'
        }
      }

      return {
        success: true,
        message: 'Student login successful',
        data: {
          user: userData,
          token_preview: storedToken.substring(0, 20) + '...',
          is_authenticated: isAuthenticated
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Student login test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Test API integration with stored token
   */
  static async testAPIIntegration(): Promise<LoginTestResult> {
    try {
      console.log('🧪 Testing API integration with stored token...')
      
      const token = TokenManager.getToken()
      const user = TokenManager.getUser()
      
      if (!token || !user) {
        return {
          success: false,
          message: 'No authentication data found',
          error: 'Please login first'
        }
      }

      // Test different endpoints based on user role
      let testEndpoint = ''
      if (user.role === 'superadmin') {
        testEndpoint = '/superadmin/me'
      } else if (user.role === 'coach') {
        testEndpoint = '/api/coaches/me'
      } else if (user.role === 'student') {
        testEndpoint = '/api/auth/me'
      } else {
        return {
          success: false,
          message: 'Unknown user role',
          error: `Unsupported role: ${user.role}`
        }
      }

      const response = await fetch(`${this.BASE_URL}${testEndpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      
      if (!response.ok) {
        return {
          success: false,
          message: 'API integration test failed',
          error: data.detail || data.message || `HTTP ${response.status}`
        }
      }

      return {
        success: true,
        message: 'API integration successful',
        data: {
          endpoint: testEndpoint,
          user_role: user.role,
          response_data: data
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'API integration test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Run comprehensive authentication tests
   */
  static async runAllTests(credentials: {
    superadmin?: { email: string; password: string }
    coach?: { email: string; password: string }
    student?: { email: string; password: string }
  }): Promise<{ [key: string]: LoginTestResult }> {
    const results: { [key: string]: LoginTestResult } = {}

    // Clear any existing auth data
    TokenManager.clearAuthData()

    if (credentials.superadmin) {
      results.superadmin = await this.testSuperadminLogin(
        credentials.superadmin.email,
        credentials.superadmin.password
      )
      if (results.superadmin.success) {
        results.superadmin_api = await this.testAPIIntegration()
      }
      TokenManager.clearAuthData()
    }

    if (credentials.coach) {
      results.coach = await this.testCoachLogin(
        credentials.coach.email,
        credentials.coach.password
      )
      if (results.coach.success) {
        results.coach_api = await this.testAPIIntegration()
      }
      TokenManager.clearAuthData()
    }

    if (credentials.student) {
      results.student = await this.testStudentLogin(
        credentials.student.email,
        credentials.student.password
      )
      if (results.student.success) {
        results.student_api = await this.testAPIIntegration()
      }
      TokenManager.clearAuthData()
    }

    return results
  }
}

// Export convenience functions
export const {
  testSuperadminLogin,
  testCoachLogin,
  testStudentLogin,
  testAPIIntegration,
  runAllTests
} = AuthTester
