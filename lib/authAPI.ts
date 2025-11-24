// API utility functions for authentication
import { BaseAPI } from './baseAPI'

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
  role: string
}

export interface AuthResponse {
  message: string
  token: string
  user: {
    id: string
    email: string
    role: string
    first_name: string
    last_name: string
  }
}

export interface PasswordResetData {
  email: string
}

export interface PasswordUpdateData {
  token: string
  new_password: string
}

class AuthAPI extends BaseAPI {
  async login(data: LoginData): Promise<AuthResponse> {
    return await this.makeRequest('/api/auth/login', {
      method: 'POST',
      body: data
    })
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return await this.makeRequest('/api/auth/register', {
      method: 'POST',
      body: data
    })
  }

  async forgotPassword(data: PasswordResetData): Promise<any> {
    return await this.makeRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: data
    })
  }

  async resetPassword(data: PasswordUpdateData): Promise<any> {
    return await this.makeRequest('/api/auth/reset-password', {
      method: 'POST',
      body: data
    })
  }

  async verifyToken(token: string): Promise<any> {
    return await this.makeRequest('/api/auth/verify', {
      method: 'POST',
      token
    })
  }

  async refreshToken(token: string): Promise<AuthResponse> {
    return await this.makeRequest('/api/auth/refresh', {
      method: 'POST',
      token
    })
  }

  async logout(token: string): Promise<any> {
    return await this.makeRequest('/api/auth/logout', {
      method: 'POST',
      token
    })
  }

  async getProfile(token: string): Promise<any> {
    return await this.makeRequest('/api/auth/profile', {
      method: 'GET',
      token
    })
  }

  async updateProfile(data: Partial<RegisterData>, token: string): Promise<any> {
    return await this.makeRequest('/api/auth/profile', {
      method: 'PUT',
      body: data,
      token
    })
  }
}

export const authAPI = new AuthAPI()
