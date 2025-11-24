// Main API exports - centralized API access point
export * from '../baseAPI'
export * from '../courseAPI'
export * from '../branchAPI'
export * from '../studentAPI'
export * from '../authAPI'
export * from '../searchAPI'
export * from '../dashboardAPI'
export * from '../paymentAPI'

// Re-export commonly used API instances
export { courseAPI } from '../courseAPI'
export { branchAPI } from '../branchAPI'
export { studentAPI } from '../studentAPI'
export { authAPI } from '../authAPI'
export { baseAPI } from '../baseAPI'
export { searchAPI } from '../searchAPI'
export { dashboardAPI } from '../dashboardAPI'
export { paymentAPI } from '../paymentAPI'

// API configuration utilities
export const getAPIBaseURL = (): string => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://31.97.224.169:8003'
}

// Helper function to check if API is in development mode
export const isDevelopmentAPI = (): boolean => {
  const baseURL = getAPIBaseURL()
  return baseURL.includes('localhost') || baseURL.includes('127.0.0.1')
}

// Helper function to get full API endpoint URL
export const getFullAPIURL = (endpoint: string): string => {
  const baseURL = getAPIBaseURL()
  return `${baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
}
