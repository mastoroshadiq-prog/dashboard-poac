/**
 * TEST LOGIN ENDPOINT
 * 
 * RBAC FASE 3: Test Authentication
 * Usage: node test-login.js
 */

require('dotenv').config();
const http = require('http');

const BASE_URL = 'localhost';
const PORT = 3000;

// Test users (hardcoded untuk development)
const testUsers = [
  { username: 'admin', password: 'admin123', expectedRole: 'ADMIN' },
  { username: 'asisten001', password: 'asisten123', expectedRole: 'ASISTEN' },
  { username: 'mandor001', password: 'mandor123', expectedRole: 'MANDOR' },
  { username: 'pelaksana001', password: 'pelaksana123', expectedRole: 'PELAKSANA' }
];

function makeRequest(username, password) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      username: username,
      password: password
    });

    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: jsonData });
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('='.repeat(80));
  console.log('🧪 TESTING LOGIN ENDPOINT (RBAC FASE 3)');
  console.log('='.repeat(80));
  console.log(`📡 Server: http://${BASE_URL}:${PORT}`);
  console.log(`🎯 Endpoint: POST /api/v1/auth/login`);
  console.log('');

  let passed = 0;
  let failed = 0;

  // Test 1: Invalid credentials (should fail)
  console.log('📝 Test 1: Invalid credentials (should return 401)');
  try {
    const result = await makeRequest('invalid_user', 'wrong_password');
    if (result.statusCode === 401) {
      console.log('   ✅ PASS - Got 401 Unauthorized');
      console.log('   Response:', result.data.message);
      passed++;
    } else {
      console.log(`   ❌ FAIL - Expected 401, got ${result.statusCode}`);
      failed++;
    }
  } catch (error) {
    console.log('   ❌ FAIL - Error:', error.message);
    failed++;
  }
  console.log('');

  // Test 2: Missing fields (should fail)
  console.log('📝 Test 2: Missing password field (should return 400)');
  try {
    const result = await makeRequest('admin', '');
    if (result.statusCode === 400) {
      console.log('   ✅ PASS - Got 400 Bad Request');
      console.log('   Response:', result.data.message);
      passed++;
    } else {
      console.log(`   ❌ FAIL - Expected 400, got ${result.statusCode}`);
      failed++;
    }
  } catch (error) {
    console.log('   ❌ FAIL - Error:', error.message);
    failed++;
  }
  console.log('');

  // Test 3-6: Valid credentials for each role
  for (const testUser of testUsers) {
    console.log(`📝 Test: Login as ${testUser.username} (${testUser.expectedRole})`);
    try {
      const result = await makeRequest(testUser.username, testUser.password);
      
      if (result.statusCode === 200) {
        const { token, user, expires_in } = result.data.data;
        
        if (user.role === testUser.expectedRole && token && expires_in) {
          console.log('   ✅ PASS - Login successful');
          console.log(`   User: ${user.nama_pihak} (${user.role})`);
          console.log(`   Token: ${token.substring(0, 50)}...`);
          console.log(`   Expires: ${expires_in}`);
          passed++;
        } else {
          console.log('   ❌ FAIL - Unexpected response structure');
          console.log('   Response:', JSON.stringify(result.data, null, 2));
          failed++;
        }
      } else {
        console.log(`   ❌ FAIL - Expected 200, got ${result.statusCode}`);
        console.log('   Response:', result.data.message);
        failed++;
      }
    } catch (error) {
      console.log('   ❌ FAIL - Error:', error.message);
      failed++;
    }
    console.log('');
  }

  // Summary
  console.log('='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total:  ${passed + failed}`);
  
  if (failed === 0) {
    console.log('');
    console.log('🎉 ALL TESTS PASSED! Login endpoint is working correctly.');
  } else {
    console.log('');
    console.log('⚠️  SOME TESTS FAILED. Please check the server logs.');
  }
  
  console.log('='.repeat(80));
}

// Run tests
runTests().catch(error => {
  console.error('❌ Test suite error:', error);
  process.exit(1);
});
