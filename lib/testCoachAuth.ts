/**
 * Test script for coach authentication
 * This can be used to test the coach authentication flow
 */

import { checkCoachAuth, clearCoachSession } from './coachAuth'

export function testCoachAuthentication() {
  console.log("🧪 Testing Coach Authentication System")
  
  // Test 1: Check authentication when no data exists
  console.log("\n1. Testing with no authentication data:")
  clearCoachSession()
  const result1 = checkCoachAuth()
  console.log("Result:", result1)
  
  // Test 2: Set up mock coach data and test
  console.log("\n2. Testing with mock coach data:")
  
  // Mock coach login data
  const mockCoachData = {
    id: "coach123",
    full_name: "John Coach",
    email: "john.coach@example.com",
    role: "coach",
    contact_info: {
      email: "john.coach@example.com",
      phone: "+1234567890"
    },
    professional_info: {
      specialization: "Karate",
      years_of_experience: "10 years"
    },
    is_active: true
  }
  
  const mockToken = "mock-jwt-token-12345"
  const mockExpiration = Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
  
  // Store mock data
  localStorage.setItem("access_token", mockToken)
  localStorage.setItem("token_expiration", mockExpiration.toString())
  localStorage.setItem("coach", JSON.stringify(mockCoachData))
  
  const result2 = checkCoachAuth()
  console.log("Result:", result2)
  
  // Test 3: Test with expired token
  console.log("\n3. Testing with expired token:")
  const expiredTime = Date.now() - 1000 // 1 second ago
  localStorage.setItem("token_expiration", expiredTime.toString())
  
  const result3 = checkCoachAuth()
  console.log("Result:", result3)
  
  // Test 4: Test with invalid coach data
  console.log("\n4. Testing with invalid coach data:")
  localStorage.setItem("token_expiration", mockExpiration.toString()) // Reset expiration
  localStorage.setItem("coach", "invalid-json")
  
  const result4 = checkCoachAuth()
  console.log("Result:", result4)
  
  // Clean up
  clearCoachSession()
  console.log("\n✅ Coach authentication tests completed")
  
  return {
    test1: result1,
    test2: result2,
    test3: result3,
    test4: result4
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testCoachAuth = testCoachAuthentication
}
