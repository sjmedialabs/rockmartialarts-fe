// Debug script to investigate authentication issues
// Run this in the browser console on the students dashboard page

console.log("🔍 Starting Authentication Debug Investigation");
console.log("=" * 60);

// 1. Check TokenManager state
console.log("\n1. 📋 TokenManager Investigation:");
console.log("================================");

// Check if TokenManager is available
if (typeof TokenManager !== 'undefined') {
    console.log("✅ TokenManager is available");
    
    // Get token
    const token = TokenManager.getToken();
    console.log("Token exists:", !!token);
    console.log("Token preview:", token ? token.substring(0, 30) + "..." : "null");
    
    // Get user data
    const user = TokenManager.getUser();
    console.log("User data:", user);
    
    // Check authentication status
    const isAuth = TokenManager.isAuthenticated();
    console.log("Is authenticated:", isAuth);
    
    // Get auth headers
    const headers = TokenManager.getAuthHeaders();
    console.log("Auth headers:", headers);
    
} else {
    console.log("❌ TokenManager not available - checking localStorage directly");
    
    // Check localStorage directly
    const keys = ['access_token', 'token', 'auth_data', 'user'];
    keys.forEach(key => {
        const value = localStorage.getItem(key);
        console.log(`${key}:`, value ? (value.length > 100 ? value.substring(0, 100) + "..." : value) : "null");
    });
}

// 2. Check current page authentication
console.log("\n2. 🌐 Current Page Authentication:");
console.log("==================================");

// Check if we're on the right page
console.log("Current URL:", window.location.href);
console.log("Expected page: students dashboard");

// 3. Test API connectivity
console.log("\n3. 🔗 API Connectivity Test:");
console.log("=============================");

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://31.97.224.169:8003';
console.log("API Base URL:", API_BASE_URL);

// Test basic connectivity
fetch(`${API_BASE_URL}/health`)
    .then(response => {
        console.log("✅ API Health Check - Status:", response.status);
        return response.json();
    })
    .then(data => {
        console.log("✅ API Health Check - Response:", data);
    })
    .catch(error => {
        console.log("❌ API Health Check Failed:", error.message);
    });

// 4. Test authentication endpoint
console.log("\n4. 🔐 Authentication Test:");
console.log("==========================");

// Get token from localStorage
const token = localStorage.getItem('access_token') || localStorage.getItem('token');
if (token) {
    console.log("Token found, testing authentication...");
    
    // Test with users endpoint (GET request first)
    fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log("✅ GET /users - Status:", response.status);
        if (response.status === 401) {
            console.log("❌ Authentication failed - Invalid token");
            return response.json().then(data => {
                console.log("Error details:", data);
            });
        } else if (response.status === 403) {
            console.log("❌ Authorization failed - Insufficient permissions");
            return response.json().then(data => {
                console.log("Error details:", data);
            });
        } else if (response.ok) {
            console.log("✅ Authentication successful");
            return response.json().then(data => {
                console.log("Users data preview:", data.length ? `${data.length} users found` : data);
            });
        }
    })
    .catch(error => {
        console.log("❌ Authentication test failed:", error.message);
    });
} else {
    console.log("❌ No token found in localStorage");
}

// 5. Simulate delete request
console.log("\n5. 🗑️ Delete Request Simulation:");
console.log("=================================");

// Function to test delete request
window.testDeleteRequest = function(studentId = 'test-student-id') {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    
    if (!token) {
        console.log("❌ No token available for delete test");
        return;
    }
    
    console.log(`Testing DELETE request for student: ${studentId}`);
    console.log(`Token: ${token.substring(0, 30)}...`);
    
    fetch(`${API_BASE_URL}/users/${studentId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log("Delete request status:", response.status);
        console.log("Delete request headers:", response.headers);
        
        if (response.status === 401) {
            console.log("❌ DELETE failed - Authentication error");
        } else if (response.status === 403) {
            console.log("❌ DELETE failed - Permission denied");
        } else if (response.status === 404) {
            console.log("⚠️ DELETE failed - Student not found (expected for test)");
        } else if (response.ok) {
            console.log("✅ DELETE would succeed");
        }
        
        return response.json().catch(() => ({}));
    })
    .then(data => {
        console.log("Delete response data:", data);
    })
    .catch(error => {
        console.log("❌ Delete request failed:", error.message);
    });
};

console.log("\n6. 🛠️ Debug Commands Available:");
console.log("===============================");
console.log("- testDeleteRequest('student-id') - Test delete request");
console.log("- TokenManager.getToken() - Get current token");
console.log("- TokenManager.getUser() - Get current user");
console.log("- TokenManager.isAuthenticated() - Check auth status");

console.log("\n🎯 Debug investigation complete!");
console.log("Check the console output above for authentication issues.");
