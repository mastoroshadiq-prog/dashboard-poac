/**
 * TEST RBAC FASE 1 - Role-Based Access Control
 * 
 * Test Scenarios:
 * 1. Unauthorized access (no token) → 401
 * 2. Forbidden access (wrong role) → 403
 * 3. Authorized access (correct role) → 200/201
 * 4. Identity spoofing prevention (id_asisten_pembuat from JWT)
 */

require('dotenv').config();
const jwt = require('jsonwebtoken');
const http = require('http');

const BASE_URL = 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-CHANGE-THIS';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate token helper
function generateToken(payload) {
  if (!payload.id_pihak) {
    throw new Error('id_pihak wajib ada di payload token');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Test users with different roles
const TEST_USERS = {
  admin: {
    id_pihak: 'admin-test-001',
    nama_pihak: 'Test Admin',
    role: 'ADMIN'
  },
  asisten: {
    id_pihak: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10',
    nama_pihak: 'Test Asisten Agus',
    role: 'ASISTEN'
  },
  mandor: {
    id_pihak: 'mandor-test-001',
    nama_pihak: 'Test Mandor Budi',
    role: 'MANDOR'
  },
  pelaksana: {
    id_pihak: 'pelaksana-test-001',
    nama_pihak: 'Test Pelaksana Citra',
    role: 'PELAKSANA'
  },
  viewer: {
    id_pihak: 'viewer-test-001',
    nama_pihak: 'Test Viewer',
    role: 'VIEWER'
  }
};

// Generate tokens
const TOKENS = {};
Object.keys(TEST_USERS).forEach(key => {
  TOKENS[key] = generateToken(TEST_USERS[key]);
});

console.log('='.repeat(80));
console.log('🔐 TEST RBAC FASE 1 - Role-Based Access Control');
console.log('='.repeat(80));
console.log('\n📋 Test Users:');
Object.keys(TEST_USERS).forEach(key => {
  console.log(`   ${key.toUpperCase()}: ${TEST_USERS[key].role} (${TEST_USERS[key].id_pihak})`);
});
console.log('\n' + '='.repeat(80));

// Helper: HTTP Request
function httpRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ 
            status: res.statusCode, 
            data: JSON.parse(data),
            headers: res.headers
          });
        } catch (e) {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// Test Case Helper
async function testCase(name, fn) {
  try {
    console.log(`\n🧪 ${name}`);
    const result = await fn();
    
    if (result.pass) {
      console.log(`   ✅ PASS: ${result.message}`);
      return true;
    } else {
      console.log(`   ❌ FAIL: ${result.message}`);
      if (result.details) {
        console.log(`   Details:`, JSON.stringify(result.details, null, 2));
      }
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    console.log(`   Stack:`, error.stack);
    return false;
  }
}

// TEST 1: Unauthorized Access (No Token)
async function testUnauthorizedAccess() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/spk/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
      // ⚠️ NO Authorization header
    }
  };
  
  const body = JSON.stringify({
    nama_spk: 'Test SPK Unauthorized'
  });
  
  const result = await httpRequest(options, body);
  
  return {
    pass: result.status === 401,
    message: result.status === 401 
      ? 'Correctly rejected (401 Unauthorized)' 
      : `Expected 401, got ${result.status}`,
    details: result.data
  };
}

// TEST 2: Forbidden Access - PELAKSANA tries to create SPK
async function testForbiddenAccess() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/spk/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKENS.pelaksana}`  // ⚠️ PELAKSANA role
    }
  };
  
  const body = JSON.stringify({
    nama_spk: 'Test SPK Forbidden'
  });
  
  const result = await httpRequest(options, body);
  
  return {
    pass: result.status === 403,
    message: result.status === 403 
      ? 'Correctly forbidden (403 Forbidden) - PELAKSANA cannot create SPK' 
      : `Expected 403, got ${result.status}`,
    details: result.data
  };
}

// TEST 3: Authorized Access - ASISTEN creates SPK
async function testAuthorizedAccess() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/spk/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKENS.asisten}`  // ✅ ASISTEN role
    }
  };
  
  const body = JSON.stringify({
    nama_spk: `Test SPK RBAC - ${new Date().toISOString()}`
  });
  
  const result = await httpRequest(options, body);
  
  const idFromToken = result.data?.data?.id_asisten_pembuat === TEST_USERS.asisten.id_pihak;
  
  return {
    pass: result.status === 201 && idFromToken,
    message: result.status === 201 
      ? (idFromToken 
          ? 'SPK created successfully with id_asisten_pembuat from JWT token' 
          : 'SPK created but id_asisten_pembuat NOT from token!')
      : `Expected 201, got ${result.status}`,
    details: result.data
  };
}

// TEST 4: Identity Spoofing Prevention
async function testIdentitySpoofingPrevention() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/spk/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKENS.asisten}`
    }
  };
  
  // ⚠️ Attempt to spoof: send different id_asisten_pembuat in body
  const body = JSON.stringify({
    nama_spk: 'Test Identity Spoofing',
    id_asisten_pembuat: 'fake-asisten-id-12345'  // ⚠️ Malicious input
  });
  
  const result = await httpRequest(options, body);
  
  const actualId = result.data?.data?.id_asisten_pembuat;
  const expectedId = TEST_USERS.asisten.id_pihak;
  
  return {
    pass: result.status === 201 && actualId === expectedId,
    message: actualId === expectedId
      ? 'Identity spoofing prevented! id_asisten_pembuat forced from JWT'
      : `SECURITY BREACH: id_asisten_pembuat = ${actualId} (should be ${expectedId})`,
    details: { 
      sent_in_body: 'fake-asisten-id-12345',
      actual_in_db: actualId,
      expected_from_jwt: expectedId
    }
  };
}

// TEST 5: ADMIN has full access
async function testAdminAccess() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/spk/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKENS.admin}`  // ✅ ADMIN role
    }
  };
  
  const body = JSON.stringify({
    nama_spk: 'Test SPK by ADMIN'
  });
  
  const result = await httpRequest(options, body);
  
  return {
    pass: result.status === 201,
    message: result.status === 201 
      ? 'ADMIN successfully created SPK' 
      : `Expected 201, got ${result.status}`,
    details: result.data
  };
}

// TEST 6: VIEWER cannot access Platform A endpoints
async function testViewerForbidden() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/spk/tugas/saya',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${TOKENS.viewer}`  // ⚠️ VIEWER role
    }
  };
  
  const result = await httpRequest(options);
  
  return {
    pass: result.status === 403,
    message: result.status === 403 
      ? 'VIEWER correctly forbidden from Platform A' 
      : `Expected 403, got ${result.status}`,
    details: result.data
  };
}

// TEST 7: MANDOR can add tugas
async function testMandorAddTugas() {
  // First, create SPK as ASISTEN
  const createSpkOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/spk/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKENS.asisten}`
    }
  };
  
  const spkBody = JSON.stringify({
    nama_spk: 'SPK for MANDOR test'
  });
  
  const spkResult = await httpRequest(createSpkOptions, spkBody);
  
  if (spkResult.status !== 201) {
    return {
      pass: false,
      message: 'Failed to create SPK for test',
      details: spkResult.data
    };
  }
  
  const id_spk = spkResult.data.data.id_spk;
  
  // Now MANDOR tries to add tugas
  const addTugasOptions = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/v1/spk/${id_spk}/tugas`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKENS.mandor}`  // ✅ MANDOR role
    }
  };
  
  const tugasBody = JSON.stringify({
    tugas: [
      {
        id_pelaksana: TEST_USERS.pelaksana.id_pihak,
        tipe_tugas: 'INSPEKSI',
        target_json: { test: true },
        prioritas: 1
      }
    ]
  });
  
  const result = await httpRequest(addTugasOptions, tugasBody);
  
  return {
    pass: result.status === 201,
    message: result.status === 201 
      ? 'MANDOR successfully added tugas to SPK' 
      : `Expected 201, got ${result.status}`,
    details: result.data
  };
}

// RUN ALL TESTS
async function runAllTests() {
  console.log('\n⏳ Starting tests in 3 seconds (make sure server is running)...\n');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const results = [];
  
  results.push(await testCase('TEST 1: Unauthorized Access (No Token)', testUnauthorizedAccess));
  results.push(await testCase('TEST 2: Forbidden Access (PELAKSANA → Create SPK)', testForbiddenAccess));
  results.push(await testCase('TEST 3: Authorized Access (ASISTEN → Create SPK)', testAuthorizedAccess));
  results.push(await testCase('TEST 4: Identity Spoofing Prevention', testIdentitySpoofingPrevention));
  results.push(await testCase('TEST 5: ADMIN Full Access', testAdminAccess));
  results.push(await testCase('TEST 6: VIEWER Forbidden (Platform A)', testViewerForbidden));
  results.push(await testCase('TEST 7: MANDOR can add tugas', testMandorAddTugas));
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(80));
  
  const passed = results.filter(r => r).length;
  const failed = results.filter(r => !r).length;
  const total = results.length;
  
  console.log(`\n   Total Tests: ${total}`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   Success Rate: ${((passed/total) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! RBAC FASE 1 implementation successful!\n');
  } else {
    console.log('\n⚠️  Some tests failed. Review errors above.\n');
  }
  
  console.log('='.repeat(80));
}

// Execute
runAllTests().catch(error => {
  console.error('\n❌ Test execution error:', error);
  process.exit(1);
});
