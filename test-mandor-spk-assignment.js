#!/usr/bin/env node
/**
 * COMPREHENSIVE TESTING SCRIPT - MANDOR DASHBOARD SPK ASSIGNMENT
 * Tests the corrected SPK assignment flow (resource-based, not role-based)
 * 
 * Prerequisites:
 * 1. Server running on localhost:3000
 * 2. Database seeded with test data
 * 3. JWT tokens generated (run: node generate-mandor-tokens.js)
 */

require('dotenv').config();
const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api/v1';

// Test users (JWT tokens from generate-mandor-tokens.js)
const MANDOR_AGUS = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  name: 'Agus (Mandor Sensus)',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9waWhhayI6ImEwZWViYzk5LTljMGItNGVmOC1iYjZkLTZiYjliZDM4MGExMSIsInJvbGUiOiJNQU5ET1IiLCJuYW1hX3BpaGFrIjoiQWd1cyAoTWFuZG9yIFNlbnN1cykiLCJpYXQiOjE3NjM0NzU5OTIsImV4cCI6MTc2MzU2MjM5Mn0.KHa6ItgX7b_Hte9_kVSaXwYr4eX9vwENCU1MC7TSeF4'
};

const MANDOR_EKO = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  name: 'Eko (Mandor APH)',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9waWhhayI6ImEwZWViYzk5LTljMGItNGVmOC1iYjZkLTZiYjliZDM4MGExMiIsInJvbGUiOiJNQU5ET1IiLCJuYW1hX3BpaGFrIjoiRWtvIChNYW5kb3IgQVBIKSIsImlhdCI6MTc2MzQ3NTk5MiwiZXhwIjoxNzYzNTYyMzkyfQ.iOzvbw37dhlI0-8U-aUShp4cNrxsWJ0_RIIHaYjwccs'
};

// Test results tracker
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Utility functions
function logTest(name, status, details = '') {
  const emoji = status === 'PASS' ? '✅' : '❌';
  console.log(`${emoji} ${name}: ${status}`);
  if (details) console.log(`   ${details}`);
  
  testResults.tests.push({ name, status, details });
  if (status === 'PASS') testResults.passed++;
  else testResults.failed++;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test functions
async function testMandorDashboard(mandor) {
  console.log(`\n📊 Testing Dashboard for ${mandor.name}...`);
  
  try {
    const response = await axios.get(
      `${BASE_URL}/mandor/${mandor.id}/dashboard`,
      {
        headers: { Authorization: `Bearer ${mandor.token}` }
      }
    );
    
    if (response.status === 200) {
      const data = response.data.data;
      const spkCount = data.spk_list?.length || 0;
      const taskCount = data.summary?.pending_tasks + data.summary?.in_progress_tasks || 0;
      
      logTest(
        `Dashboard ${mandor.name}`,
        'PASS',
        `Found ${spkCount} SPK(s), ${taskCount} task(s)`
      );
      
      // Log SPK details
      if (data.spk_list && data.spk_list.length > 0) {
        console.log('   📋 SPK List:');
        data.spk_list.forEach(spk => {
          console.log(`      - ${spk.nama_spk} (${spk.task_count} tasks)`);
        });
      }
      
      return data;
    }
  } catch (error) {
    logTest(
      `Dashboard ${mandor.name}`,
      'FAIL',
      error.response?.data?.message || error.message
    );
    return null;
  }
}

async function testSPKList(mandor) {
  console.log(`\n📋 Testing SPK List for ${mandor.name}...`);
  
  try {
    const response = await axios.get(
      `${BASE_URL}/spk/mandor/${mandor.id}`,
      {
        headers: { Authorization: `Bearer ${mandor.token}` }
      }
    );
    
    if (response.status === 200) {
      const spkList = response.data.data?.spk_list || [];
      logTest(
        `SPK List ${mandor.name}`,
        'PASS',
        `Found ${spkList.length} SPK(s)`
      );
      
      return spkList;
    }
  } catch (error) {
    logTest(
      `SPK List ${mandor.name}`,
      'FAIL',
      error.response?.data?.message || error.message
    );
    return [];
  }
}

async function testSPKDetail(spkId, mandor) {
  console.log(`\n🔍 Testing SPK Detail for ${spkId}...`);
  
  try {
    const response = await axios.get(
      `${BASE_URL}/spk/${spkId}`,
      {
        headers: { Authorization: `Bearer ${mandor.token}` }
      }
    );
    
    if (response.status === 200) {
      const spk = response.data.data?.spk;
      const tasks = response.data.data?.tugas || [];
      logTest(
        `SPK Detail`,
        'PASS',
        `${spk?.nama_spk} has ${tasks.length} task(s)`
      );
      
      return { spk, tasks };
    }
  } catch (error) {
    logTest(
      `SPK Detail`,
      'FAIL',
      error.response?.data?.message || error.message
    );
    return null;
  }
}

async function testSurveyorList(mandor) {
  console.log(`\n👥 Testing Surveyor List for ${mandor.name}...`);
  
  try {
    const response = await axios.get(
      `${BASE_URL}/mandor/${mandor.id}/surveyors`,
      {
        headers: { Authorization: `Bearer ${mandor.token}` }
      }
    );
    
    if (response.status === 200) {
      const surveyors = response.data.data?.surveyors || [];
      const available = surveyors.filter(s => s.status === 'AVAILABLE').length;
      
      logTest(
        `Surveyor List ${mandor.name}`,
        'PASS',
        `Found ${surveyors.length} surveyor(s), ${available} available`
      );
      
      return surveyors;
    }
  } catch (error) {
    logTest(
      `Surveyor List ${mandor.name}`,
      'FAIL',
      error.response?.data?.message || error.message
    );
    return [];
  }
}

async function testCrossAccessPrevention() {
  console.log(`\n🔒 Testing Cross-Access Prevention...`);
  
  try {
    // Mandor Agus tries to access Mandor Eko's dashboard
    const response = await axios.get(
      `${BASE_URL}/mandor/${MANDOR_EKO.id}/dashboard`,
      {
        headers: { Authorization: `Bearer ${MANDOR_AGUS.token}` }
      }
    );
    
    // If we get 200, it's a security issue (but data will be Eko's SPKs, not Agus's)
    if (response.status === 200) {
      const spkList = response.data.data?.spk_list || [];
      logTest(
        'Cross-Access Prevention',
        'WARN',
        `⚠️ Security: Agus can access Eko's dashboard (but sees Eko's SPKs, not his own)`
      );
      console.log(`   Note: This is a known issue - add checkMandorAccess middleware to fix`);
    }
  } catch (error) {
    if (error.response?.status === 403) {
      logTest(
        'Cross-Access Prevention',
        'PASS',
        'Access denied as expected (403 Forbidden)'
      );
    } else {
      logTest(
        'Cross-Access Prevention',
        'FAIL',
        error.message
      );
    }
  }
}

async function testUnauthorizedAccess() {
  console.log(`\n🚫 Testing Unauthorized Access...`);
  
  try {
    const response = await axios.get(`${BASE_URL}/mandor/${MANDOR_AGUS.id}/dashboard`);
    
    logTest(
      'Unauthorized Access',
      'FAIL',
      'Should have returned 401 Unauthorized'
    );
  } catch (error) {
    if (error.response?.status === 401) {
      logTest(
        'Unauthorized Access',
        'PASS',
        'Access denied without token (401 Unauthorized)'
      );
    } else {
      logTest(
        'Unauthorized Access',
        'FAIL',
        `Unexpected error: ${error.message}`
      );
    }
  }
}

async function testInvalidToken() {
  console.log(`\n🔑 Testing Invalid Token...`);
  
  try {
    const response = await axios.get(
      `${BASE_URL}/mandor/${MANDOR_AGUS.id}/dashboard`,
      {
        headers: { Authorization: 'Bearer invalid_token_12345' }
      }
    );
    
    logTest(
      'Invalid Token',
      'FAIL',
      'Should have returned 401 Unauthorized'
    );
  } catch (error) {
    if (error.response?.status === 401) {
      logTest(
        'Invalid Token',
        'PASS',
        'Invalid token rejected (401 Unauthorized)'
      );
    } else {
      logTest(
        'Invalid Token',
        'FAIL',
        `Unexpected error: ${error.message}`
      );
    }
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 MANDOR DASHBOARD SPK ASSIGNMENT - COMPREHENSIVE TEST\n');
  console.log('=' .repeat(70));
  console.log('Testing corrected architecture: Resource-based (SPK assignment)');
  console.log('NOT role-based (Mandor APH vs Mandor Sensus)');
  console.log('=' .repeat(70));
  
  // Check server connectivity
  console.log('\n🔌 Checking server connectivity...');
  try {
    await axios.get(`${BASE_URL.replace('/api/v1', '')}/`);
    console.log('✅ Server is running');
  } catch (error) {
    console.error('❌ Server is not running. Please start the server first:');
    console.error('   node index.js');
    process.exit(1);
  }
  
  // Test 1: Mandor Agus Dashboard
  const agusData = await testMandorDashboard(MANDOR_AGUS);
  await sleep(500);
  
  // Test 2: Mandor Eko Dashboard
  const ekoData = await testMandorDashboard(MANDOR_EKO);
  await sleep(500);
  
  // Test 3: SPK List for both mandors
  const agusSPKs = await testSPKList(MANDOR_AGUS);
  await sleep(500);
  
  const ekoSPKs = await testSPKList(MANDOR_EKO);
  await sleep(500);
  
  // Test 4: SPK Detail (if SPKs exist)
  if (agusSPKs.length > 0) {
    await testSPKDetail(agusSPKs[0].id_spk, MANDOR_AGUS);
    await sleep(500);
  }
  
  // Test 5: Surveyor List
  await testSurveyorList(MANDOR_AGUS);
  await sleep(500);
  
  await testSurveyorList(MANDOR_EKO);
  await sleep(500);
  
  // Test 6: Security tests
  await testCrossAccessPrevention();
  await sleep(500);
  
  await testUnauthorizedAccess();
  await sleep(500);
  
  await testInvalidToken();
  
  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.tests.length}`);
  console.log(`🎯 Success Rate: ${((testResults.passed / testResults.tests.length) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => console.log(`   - ${t.name}: ${t.details}`));
  }
  
  console.log('\n' + '='.repeat(70));
  
  // Check for warnings
  const warnings = testResults.tests.filter(t => t.status === 'WARN');
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach(w => {
      console.log(`   - ${w.name}`);
      console.log(`     ${w.details}`);
    });
    console.log('\n   See docs/TESTING_MANDOR_MULTI_USER_RBAC.md for security fix');
  }
  
  // Exit with proper code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('\n💥 Test runner crashed:', error.message);
  process.exit(1);
});
