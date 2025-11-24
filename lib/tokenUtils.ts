/**
 * Token utilities for password reset and other token operations
 * Browser-compatible implementation using Web Crypto API
 */

export interface PasswordResetToken {
  token: string
  email: string
  expirationTime: number
}

/**
 * Generate secure random bytes using Web Crypto API
 */
function generateRandomBytes(length: number): Uint8Array {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    return window.crypto.getRandomValues(new Uint8Array(length))
  }
  // Fallback for older browsers or server-side
  const array = new Uint8Array(length)
  for (let i = 0; i < length; i++) {
    array[i] = Math.floor(Math.random() * 256)
  }
  return array
}

/**
 * Convert Uint8Array to hex string
 */
function uint8ArrayToHex(array: Uint8Array): string {
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Create a SHA-256 hash using Web Crypto API
 */
async function hashString(input: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
    const hashArray = new Uint8Array(hashBuffer)
    return uint8ArrayToHex(hashArray)
  }
  
  // Fallback simple hash for older browsers
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}

/**
 * Create a password reset token for the given email
 * @param email - User's email address
 * @param expirationMinutes - Token expiration time in minutes (default: 15)
 * @returns Promise<string> - The generated reset token
 */
export async function createPasswordResetToken(
  email: string, 
  expirationMinutes: number = 15
): Promise<string> {
  // Generate a secure random token
  const randomBytes = generateRandomBytes(32)
  const randomToken = uint8ArrayToHex(randomBytes)
  
  // Create a hash of email + timestamp for additional security
  const timestamp = Date.now()
  const emailHash = (await hashString(email.toLowerCase())).substring(0, 8)
  
  // Combine components to create the final token
  const resetToken = `${randomToken}${emailHash}${timestamp.toString(36)}`
  
  // Calculate expiration time
  const expirationTime = timestamp + (expirationMinutes * 60 * 1000)
  
  // Store the token data in localStorage for client-side validation
  // Note: In a production app, this should be stored on the server
  const tokenData: PasswordResetToken = {
    token: resetToken,
    email: email.toLowerCase(),
    expirationTime
  }
  
  // Store in localStorage with a key based on the token
  if (typeof window !== 'undefined') {
    localStorage.setItem(`reset_token_${resetToken}`, JSON.stringify(tokenData))
    
    // Clean up expired tokens while we're here
    cleanupExpiredTokens()
  }
  
  console.log('✅ Password reset token created:', {
    email: email.toLowerCase(),
    tokenPreview: resetToken.substring(0, 10) + '...',
    expiresAt: new Date(expirationTime).toISOString(),
    expiresInMinutes: expirationMinutes
  })
  
  return resetToken
}

/**
 * Validate a password reset token
 * @param token - The reset token to validate
 * @returns Promise<PasswordResetToken | null> - Token data if valid, null if invalid/expired
 */
export async function validatePasswordResetToken(token: string): Promise<PasswordResetToken | null> {
  if (typeof window === 'undefined') return null
  
  try {
    const tokenDataStr = localStorage.getItem(`reset_token_${token}`)
    if (!tokenDataStr) {
      console.warn('⚠️ Reset token not found:', token.substring(0, 10) + '...')
      return null
    }
    
    const tokenData: PasswordResetToken = JSON.parse(tokenDataStr)
    
    // Check if token is expired
    if (Date.now() > tokenData.expirationTime) {
      console.warn('⚠️ Reset token expired:', token.substring(0, 10) + '...')
      // Clean up expired token
      localStorage.removeItem(`reset_token_${token}`)
      return null
    }
    
    console.log('✅ Reset token validated:', {
      email: tokenData.email,
      tokenPreview: token.substring(0, 10) + '...',
      expiresAt: new Date(tokenData.expirationTime).toISOString()
    })
    
    return tokenData
  } catch (error) {
    console.error('❌ Error validating reset token:', error)
    return null
  }
}

/**
 * Consume (delete) a password reset token after use
 * @param token - The reset token to consume
 */
export function consumePasswordResetToken(token: string): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(`reset_token_${token}`)
  console.log('🗑️ Reset token consumed:', token.substring(0, 10) + '...')
}

/**
 * Clean up expired password reset tokens from localStorage
 */
export function cleanupExpiredTokens(): void {
  if (typeof window === 'undefined') return
  
  const now = Date.now()
  let cleanedCount = 0
  
  // Iterate through all localStorage keys
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (key && key.startsWith('reset_token_')) {
      try {
        const tokenDataStr = localStorage.getItem(key)
        if (tokenDataStr) {
          const tokenData: PasswordResetToken = JSON.parse(tokenDataStr)
          if (now > tokenData.expirationTime) {
            localStorage.removeItem(key)
            cleanedCount++
          }
        }
      } catch (error) {
        // If we can't parse the token data, remove it
        localStorage.removeItem(key)
        cleanedCount++
      }
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`🧹 Cleaned up ${cleanedCount} expired reset tokens`)
  }
}

/**
 * Generate a secure random string for various token needs
 * @param length - Length of the random string (default: 32)
 * @returns string - Random hex string
 */
export function generateSecureToken(length: number = 32): string {
  const bytes = generateRandomBytes(Math.ceil(length / 2))
  return uint8ArrayToHex(bytes).substring(0, length)
}

/**
 * Create a time-limited verification token for email verification
 * @param email - User's email address
 * @param purpose - Purpose of the token (e.g., 'email_verification', 'account_activation')
 * @param expirationHours - Token expiration time in hours (default: 24)
 * @returns Promise<string> - The generated verification token
 */
export async function createVerificationToken(
  email: string,
  purpose: string = 'verification',
  expirationHours: number = 24
): Promise<string> {
  const randomToken = generateSecureToken(24)
  const timestamp = Date.now()
  const purposeHash = (await hashString(purpose)).substring(0, 6)
  const emailHash = (await hashString(email.toLowerCase())).substring(0, 6)
  
  const verificationToken = `${purposeHash}${randomToken}${emailHash}${timestamp.toString(36)}`
  
  // Store verification token data
  if (typeof window !== 'undefined') {
    const tokenData = {
      token: verificationToken,
      email: email.toLowerCase(),
      purpose,
      expirationTime: timestamp + (expirationHours * 60 * 60 * 1000)
    }
    
    localStorage.setItem(`verify_token_${verificationToken}`, JSON.stringify(tokenData))
  }
  
  console.log('✅ Verification token created:', {
    email: email.toLowerCase(),
    purpose,
    tokenPreview: verificationToken.substring(0, 10) + '...',
    expiresInHours: expirationHours
  })
  
  return verificationToken
}