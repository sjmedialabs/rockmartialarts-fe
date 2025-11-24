// Comprehensive verification test for branch manager dashboard fixes
const BASE_URL = 'http://localhost:3022';
const TEST_TOKEN = 'test-token';

async function testAPI(url, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function runVerificationTests() {
  console.log('🔍 Starting Comprehensive Verification Tests...\n');
  
  // Test 1: Branch GET API
  console.log('1️⃣ Testing Branch GET API...');
  const branchGet = await testAPI(`${BASE_URL}/api/branches/c9ed7bb7-c31e-4b0f-9edf-760b41de9628`);
  console.log(`   Status: ${branchGet.status} | Success: ${branchGet.success}`);
  if (branchGet.success) {
    console.log(`   ✅ Branch data loaded: ${branchGet.data.branch?.name || 'Unknown'}`);
  } else {
    console.log(`   ❌ Error: ${branchGet.error || branchGet.data?.error}`);
  }
  
  // Test 2: Branch PUT API
  console.log('\n2️⃣ Testing Branch PUT API...');
  const branchUpdate = {
    branch: {
      name: "Test Updated Branch",
      code: "TUB01",
      email: "test@updated.com",
      phone: "+1234567890"
    }
  };
  const branchPut = await testAPI(`${BASE_URL}/api/branches/c9ed7bb7-c31e-4b0f-9edf-760b41de9628`, 'PUT', branchUpdate);
  console.log(`   Status: ${branchPut.status} | Success: ${branchPut.success}`);
  if (branchPut.success) {
    console.log(`   ✅ Branch updated: ${branchPut.data.message}`);
  } else {
    console.log(`   ❌ Error: ${branchPut.error || branchPut.data?.error}`);
  }
  
  // Test 3: Profile GET API
  console.log('\n3️⃣ Testing Profile GET API...');
  const profileGet = await testAPI(`${BASE_URL}/api/branch-managers/me`);
  console.log(`   Status: ${profileGet.status} | Success: ${profileGet.success}`);
  if (profileGet.success) {
    console.log(`   ✅ Profile loaded: ${profileGet.data.branch_manager?.full_name || 'Unknown'}`);
  } else {
    console.log(`   ❌ Error: ${profileGet.error || profileGet.data?.error}`);
  }
  
  // Test 4: Profile PUT API
  console.log('\n4️⃣ Testing Profile PUT API...');
  const profileUpdate = {
    full_name: "Test Updated Manager",
    email: "test.manager@updated.com",
    phone: "+9876543210"
  };
  const profilePut = await testAPI(`${BASE_URL}/api/branch-managers/me`, 'PUT', profileUpdate);
  console.log(`   Status: ${profilePut.status} | Success: ${profilePut.success}`);
  if (profilePut.success) {
    console.log(`   ✅ Profile updated: ${profilePut.data.message}`);
    console.log(`   ✅ Updated name: ${profilePut.data.data?.full_name}`);
  } else {
    console.log(`   ❌ Error: ${profilePut.error || profilePut.data?.error}`);
  }
  
  // Test 5: Error Handling - Invalid Token
  console.log('\n5️⃣ Testing Error Handling (Invalid Token)...');
  const invalidTokenTest = await fetch(`${BASE_URL}/api/branch-managers/me`, {
    headers: { 'Authorization': 'Bearer invalid-token' }
  });
  console.log(`   Status: ${invalidTokenTest.status} | Expected: 401`);
  if (invalidTokenTest.status === 401) {
    console.log(`   ✅ Authentication error handling works`);
  } else {
    console.log(`   ❌ Authentication error handling failed`);
  }
  
  console.log('\n🎯 Verification Tests Complete!');
  console.log('\n📋 Summary:');
  console.log(`   • Branch GET API: ${branchGet.success ? '✅' : '❌'}`);
  console.log(`   • Branch PUT API: ${branchPut.success ? '✅' : '❌'}`);
  console.log(`   • Profile GET API: ${profileGet.success ? '✅' : '❌'}`);
  console.log(`   • Profile PUT API: ${profilePut.success ? '✅' : '❌'}`);
  console.log(`   • Error Handling: ${invalidTokenTest.status === 401 ? '✅' : '❌'}`);
}

// Run the tests
runVerificationTests().catch(console.error);
