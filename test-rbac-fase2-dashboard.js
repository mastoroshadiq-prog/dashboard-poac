/**
 * RBAC FASE 2 - Dashboard Endpoints Testing
 * 
 * Testing RBAC implementation on Dashboard endpoints:
 * - GET /api/v1/dashboard/kpi-eksekutif (ASISTEN, ADMIN only)
 * - GET /api/v1/dashboard/operasional (MANDOR, ASISTEN, ADMIN)
 * - GET /api/v1/dashboard/teknis (MANDOR, ASISTEN, ADMIN)
 * 
 * Test Scenarios:
 * 1. ❌ 401 Unauthorized (no token)
 * 2. ❌ 401 Unauthorized (invalid token)
 * 3. ❌ 403 Forbidden (wrong role - PELAKSANA on all endpoints)
 * 4. ❌ 403 Forbidden (MANDOR on kpi-eksekutif - not allowed)
 * 5. ✅ 200 Success (ASISTEN on all endpoints)
 * 6. ✅ 200 Success (MANDOR on operasional & teknis - allowed)
 * 7. ✅ 200 Success (ADMIN on all endpoints - bypass)
 */

const http = require('http');
const { generateToken } = require('./middleware/authMiddleware');

// =====================================================
// TEST CONFIGURATION
// =====================================================

const BASE_URL = 'localhost';
const PORT = 3000;

// Test users with different roles
const TEST_USERS = {
  ADMIN: {
    id_pihak: '00000000-0000-0000-0000-000000000001',
    nama_pihak: 'Admin Test',
    role: 'ADMIN'
  },
  ASISTEN: {
    id_pihak: '00000000-0000-0000-0000-000000000002',
    nama_pihak: 'Asisten Test',
    role: 'ASISTEN'
  },
  MANDOR: {
    id_pihak: '00000000-0000-0000-0000-000000000003',
    nama_pihak: 'Mandor Test',
    role: 'MANDOR'
  },
  PELAKSANA: {
    id_pihak: '00000000-0000-0000-0000-000000000004',
    nama_pihak: 'Pelaksana Test',
    role: 'PELAKSANA'
  },
  VIEWER: {
    id_pihak: '00000000-0000-0000-0000-000000000005',
    nama_pihak: 'Viewer Test',
    role: 'VIEWER'
  }
};

// Generate tokens for all test users
const TOKENS = {};
Object.keys(TEST_USERS).forEach(role => {
  TOKENS[role] = generateToken(TEST_USERS[role]);
});

// Dashboard endpoints to test
const DASHBOARD_ENDPOINTS = [
  {
    path: '/api/v1/dashboard/kpi-eksekutif',
    name: 'KPI Eksekutif',
    allowedRoles: ['ASISTEN', 'ADMIN'],
    deniedRoles: ['MANDOR', 'PELAKSANA', 'VIEWER']
  },
  {
    path: '/api/v1/dashboard/operasional',
    name: 'Operasional',
    allowedRoles: ['MANDOR', 'ASISTEN', 'ADMIN'],
    deniedRoles: ['PELAKSANA', 'VIEWER']
  },
  {
    path: '/api/v1/dashboard/teknis',
    name: 'Teknis',
    allowedRoles: ['MANDOR', 'ASISTEN', 'ADMIN'],
    deniedRoles: ['PELAKSANA', 'VIEWER']
  }
];

// =====================================================
// HTTP REQUEST HELPER
// =====================================================

function makeRequest(method, path, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Add Authorization header if token provided
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// =====================================================
// TEST SCENARIOS
// =====================================================

async function runTests() {
  console.log('\n🧪 ============================================');
  console.log('🔐 RBAC FASE 2 - DASHBOARD ENDPOINTS TESTING');
  console.log('============================================\n');
  
  let testCount = 0;
  let passCount = 0;
  let failCount = 0;

  // ===== SCENARIO 1: No Token (401) =====
  console.log('📋 SCENARIO 1: Unauthorized (No Token) → 401');
  console.log('─────────────────────────────────────────────\n');

  for (const endpoint of DASHBOARD_ENDPOINTS) {
    testCount++;
    console.log(`Test ${testCount}: GET ${endpoint.path} (no token)`);
    
    try {
      const response = await makeRequest('GET', endpoint.path, null);
      
      if (response.statusCode === 401) {
        console.log(`✅ PASS: Got 401 Unauthorized`);
        console.log(`   Message: ${response.body.message || response.body.error}\n`);
        passCount++;
      } else {
        console.log(`❌ FAIL: Expected 401, got ${response.statusCode}`);
        console.log(`   Response: ${JSON.stringify(response.body)}\n`);
        failCount++;
      }
    } catch (error) {
      console.log(`❌ FAIL: ${error.message}\n`);
      failCount++;
    }
  }

  // ===== SCENARIO 2: Invalid Token (401) =====
  console.log('\n📋 SCENARIO 2: Unauthorized (Invalid Token) → 401');
  console.log('─────────────────────────────────────────────\n');

  const INVALID_TOKEN = 'invalid.jwt.token.here';

  for (const endpoint of DASHBOARD_ENDPOINTS) {
    testCount++;
    console.log(`Test ${testCount}: GET ${endpoint.path} (invalid token)`);
    
    try {
      const response = await makeRequest('GET', endpoint.path, INVALID_TOKEN);
      
      if (response.statusCode === 401) {
        console.log(`✅ PASS: Got 401 Unauthorized`);
        console.log(`   Message: ${response.body.message || response.body.error}\n`);
        passCount++;
      } else {
        console.log(`❌ FAIL: Expected 401, got ${response.statusCode}`);
        console.log(`   Response: ${JSON.stringify(response.body)}\n`);
        failCount++;
      }
    } catch (error) {
      console.log(`❌ FAIL: ${error.message}\n`);
      failCount++;
    }
  }

  // ===== SCENARIO 3: Wrong Role - PELAKSANA (403) =====
  console.log('\n📋 SCENARIO 3: Forbidden (PELAKSANA role) → 403');
  console.log('─────────────────────────────────────────────\n');

  for (const endpoint of DASHBOARD_ENDPOINTS) {
    testCount++;
    console.log(`Test ${testCount}: GET ${endpoint.path} (PELAKSANA token)`);
    
    try {
      const response = await makeRequest('GET', endpoint.path, TOKENS.PELAKSANA);
      
      if (response.statusCode === 403) {
        console.log(`✅ PASS: Got 403 Forbidden`);
        console.log(`   Message: ${response.body.message || response.body.error}\n`);
        passCount++;
      } else {
        console.log(`❌ FAIL: Expected 403, got ${response.statusCode}`);
        console.log(`   Response: ${JSON.stringify(response.body)}\n`);
        failCount++;
      }
    } catch (error) {
      console.log(`❌ FAIL: ${error.message}\n`);
      failCount++;
    }
  }

  // ===== SCENARIO 4: MANDOR on KPI Eksekutif (403) =====
  console.log('\n📋 SCENARIO 4: Forbidden (MANDOR on KPI Eksekutif) → 403');
  console.log('─────────────────────────────────────────────\n');

  testCount++;
  const kpiEndpoint = DASHBOARD_ENDPOINTS.find(e => e.name === 'KPI Eksekutif');
  console.log(`Test ${testCount}: GET ${kpiEndpoint.path} (MANDOR token)`);
  
  try {
    const response = await makeRequest('GET', kpiEndpoint.path, TOKENS.MANDOR);
    
    if (response.statusCode === 403) {
      console.log(`✅ PASS: Got 403 Forbidden`);
      console.log(`   Message: ${response.body.message || response.body.error}`);
      console.log(`   Reason: MANDOR not allowed on KPI Eksekutif (ASISTEN/ADMIN only)\n`);
      passCount++;
    } else {
      console.log(`❌ FAIL: Expected 403, got ${response.statusCode}`);
      console.log(`   Response: ${JSON.stringify(response.body)}\n`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ FAIL: ${error.message}\n`);
    failCount++;
  }

  // ===== SCENARIO 5: ASISTEN Success (200) =====
  console.log('\n📋 SCENARIO 5: Success (ASISTEN on all endpoints) → 200');
  console.log('─────────────────────────────────────────────\n');

  for (const endpoint of DASHBOARD_ENDPOINTS) {
    testCount++;
    console.log(`Test ${testCount}: GET ${endpoint.path} (ASISTEN token)`);
    
    try {
      const response = await makeRequest('GET', endpoint.path, TOKENS.ASISTEN);
      
      if (response.statusCode === 200) {
        console.log(`✅ PASS: Got 200 Success`);
        console.log(`   Message: ${response.body.message || 'OK'}`);
        console.log(`   Data keys: ${Object.keys(response.body.data || {}).join(', ')}\n`);
        passCount++;
      } else {
        console.log(`❌ FAIL: Expected 200, got ${response.statusCode}`);
        console.log(`   Response: ${JSON.stringify(response.body)}\n`);
        failCount++;
      }
    } catch (error) {
      console.log(`❌ FAIL: ${error.message}\n`);
      failCount++;
    }
  }

  // ===== SCENARIO 6: MANDOR Success on Operasional & Teknis (200) =====
  console.log('\n📋 SCENARIO 6: Success (MANDOR on Operasional & Teknis) → 200');
  console.log('─────────────────────────────────────────────\n');

  const mandorAllowedEndpoints = DASHBOARD_ENDPOINTS.filter(e => 
    e.name === 'Operasional' || e.name === 'Teknis'
  );

  for (const endpoint of mandorAllowedEndpoints) {
    testCount++;
    console.log(`Test ${testCount}: GET ${endpoint.path} (MANDOR token)`);
    
    try {
      const response = await makeRequest('GET', endpoint.path, TOKENS.MANDOR);
      
      if (response.statusCode === 200) {
        console.log(`✅ PASS: Got 200 Success`);
        console.log(`   Message: ${response.body.message || 'OK'}`);
        console.log(`   Data keys: ${Object.keys(response.body.data || {}).join(', ')}\n`);
        passCount++;
      } else {
        console.log(`❌ FAIL: Expected 200, got ${response.statusCode}`);
        console.log(`   Response: ${JSON.stringify(response.body)}\n`);
        failCount++;
      }
    } catch (error) {
      console.log(`❌ FAIL: ${error.message}\n`);
      failCount++;
    }
  }

  // ===== SCENARIO 7: ADMIN Bypass (200) =====
  console.log('\n📋 SCENARIO 7: Admin Bypass (ADMIN on all endpoints) → 200');
  console.log('─────────────────────────────────────────────\n');

  for (const endpoint of DASHBOARD_ENDPOINTS) {
    testCount++;
    console.log(`Test ${testCount}: GET ${endpoint.path} (ADMIN token)`);
    
    try {
      const response = await makeRequest('GET', endpoint.path, TOKENS.ADMIN);
      
      if (response.statusCode === 200) {
        console.log(`✅ PASS: Got 200 Success`);
        console.log(`   Message: ${response.body.message || 'OK'}`);
        console.log(`   Reason: ADMIN has full access to all endpoints\n`);
        passCount++;
      } else {
        console.log(`❌ FAIL: Expected 200, got ${response.statusCode}`);
        console.log(`   Response: ${JSON.stringify(response.body)}\n`);
        failCount++;
      }
    } catch (error) {
      console.log(`❌ FAIL: ${error.message}\n`);
      failCount++;
    }
  }

  // ===== FINAL SUMMARY =====
  console.log('\n🏁 ============================================');
  console.log('   TEST SUMMARY - RBAC FASE 2');
  console.log('============================================\n');
  console.log(`Total Tests:  ${testCount}`);
  console.log(`✅ Passed:     ${passCount}`);
  console.log(`❌ Failed:     ${failCount}`);
  console.log(`Success Rate: ${((passCount / testCount) * 100).toFixed(2)}%\n`);

  if (failCount === 0) {
    console.log('🎉 ALL TESTS PASSED! RBAC FASE 2 implementation is working correctly!\n');
  } else {
    console.log('⚠️  Some tests failed. Please review the implementation.\n');
  }

  console.log('============================================\n');
}

// =====================================================
// MAIN EXECUTION
// =====================================================

console.log('\n🚀 Starting RBAC FASE 2 Dashboard Tests...\n');
console.log('Prerequisites:');
console.log('1. Server must be running on http://localhost:3000');
console.log('2. Database must have test data');
console.log('3. RBAC middleware must be implemented\n');

console.log('Test Tokens Generated:');
console.log(`- ADMIN:     ${TOKENS.ADMIN.substring(0, 50)}...`);
console.log(`- ASISTEN:   ${TOKENS.ASISTEN.substring(0, 50)}...`);
console.log(`- MANDOR:    ${TOKENS.MANDOR.substring(0, 50)}...`);
console.log(`- PELAKSANA: ${TOKENS.PELAKSANA.substring(0, 50)}...`);
console.log(`- VIEWER:    ${TOKENS.VIEWER.substring(0, 50)}...`);

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test execution failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});
