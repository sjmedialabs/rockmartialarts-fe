// Environment configuration
export interface APIConfig {
  baseURL: string
  timeout: number
  retryAttempts: number
  isDevelopment: boolean
}

export const getAPIConfig = (): APIConfig => {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://31.97.224.169:8003'
  const timeout = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10)
  const retryAttempts = parseInt(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS || '3', 10)
  const isDevelopment = baseURL.includes('localhost') || baseURL.includes('127.0.0.1')

  return {
    baseURL,
    timeout,
    retryAttempts,
    isDevelopment
  }
}

// Environment-specific configurations
export const environments = {
  development: {
    baseURL: 'http://31.97.224.169:8003',
    timeout: 30000,
    retryAttempts: 3,
    isDevelopment: true
  },
  staging: {
    baseURL: 'https://staging-api.your-domain.com',
    timeout: 30000,
    retryAttempts: 3,
    isDevelopment: false
  },
  production: {
    baseURL: 'https://api.your-domain.com',
    timeout: 30000,
    retryAttempts: 2,
    isDevelopment: false
  }
}

// Get current environment
export const getCurrentEnvironment = (): keyof typeof environments => {
  if (process.env.NODE_ENV === 'production') {
    return 'production'
  }
  
  if (process.env.NEXT_PUBLIC_API_BASE_URL?.includes('staging')) {
    return 'staging'
  }
  
  return 'development'
}

// Export current config
export const apiConfig = getAPIConfig()
