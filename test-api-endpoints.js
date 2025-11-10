/**
 * TEST API ENDPOINTS - Dummy Data v2.0
 * 
 * Script untuk testing API endpoints setelah dummy data injection
 * Menguji 2 endpoint utama:
 * 1. GET /api/v1/dashboard/kpi-eksekutif
 * 2. GET /api/v1/dashboard/operasional
 */

const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const BASE_URL = `http://localhost:${process.env.PORT || 3000}`;

// Generate test JWT token
function generateTestToken() {
  const payload = {
    sub: '11111111-1111-1111-1111-000000000001', // Test user ID
    id_pihak: '11111111-1111-1111-1111-000000000001', // Required by auth middleware
    role: 'ADMIN', // Admin role untuk akses penuh
    email: 'test@kebun.com'
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

// Test endpoint function
async function testEndpoint(endpoint, name) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🧪 Testing: ${name}`);
  console.log(`${'='.repeat(70)}`);
  
  const token = generateTestToken();
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    console.log(`\n📡 URL: ${url}`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    console.log(`\n📝 Response:`);
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log(`\n✅ Test PASSED: ${name}`);
      
      // Specific validations
      if (endpoint.includes('kpi-eksekutif')) {
        console.log(`\n🔍 Validating KPI Eksekutif fields...`);
        
        if (data.data.sop_compliance_breakdown) {
          console.log(`   ✅ sop_compliance_breakdown: Found`);
          console.log(`      - Compliant: ${data.data.sop_compliance_breakdown.compliant_items?.length || 0} items`);
          console.log(`      - Non-Compliant: ${data.data.sop_compliance_breakdown.non_compliant_items?.length || 0} items`);
          console.log(`      - Partially Compliant: ${data.data.sop_compliance_breakdown.partially_compliant_items?.length || 0} items`);
        } else {
          console.log(`   ❌ sop_compliance_breakdown: Missing`);
        }
        
        if (data.data.tren_kepatuhan_sop) {
          console.log(`   ✅ tren_kepatuhan_sop: Found (${data.data.tren_kepatuhan_sop.length} weeks)`);
        } else {
          console.log(`   ❌ tren_kepatuhan_sop: Missing`);
        }
      }
      
      if (endpoint.includes('operasional')) {
        console.log(`\n🔍 Validating Dashboard Operasional fields...`);
        
        if (data.data.data_corong) {
          console.log(`   ✅ data_corong: Found`);
          
          if (data.data.data_corong.validasi_tasks) {
            console.log(`      - validasi_tasks: ${data.data.data_corong.validasi_tasks.length} tasks`);
          }
          if (data.data.data_corong.aph_tasks) {
            console.log(`      - aph_tasks: ${data.data.data_corong.aph_tasks.length} tasks`);
          }
          if (data.data.data_corong.sanitasi_tasks) {
            console.log(`      - sanitasi_tasks: ${data.data.data_corong.sanitasi_tasks.length} tasks`);
          }
          if (data.data.data_corong.validasi_blockers_detail) {
            console.log(`      - validasi_blockers_detail: ${data.data.data_corong.validasi_blockers_detail.length} blockers`);
          }
          if (data.data.data_corong.aph_blockers_detail) {
            console.log(`      - aph_blockers_detail: ${data.data.data_corong.aph_blockers_detail.length} blockers`);
          }
          if (data.data.data_corong.sanitasi_blockers_detail) {
            console.log(`      - sanitasi_blockers_detail: ${data.data.data_corong.sanitasi_blockers_detail.length} blockers`);
          }
        } else {
          console.log(`   ❌ data_corong: Missing`);
        }
      }
    } else {
      console.log(`\n❌ Test FAILED: ${name}`);
      console.log(`   Error: ${data.error}`);
      console.log(`   Message: ${data.message}`);
    }
    
  } catch (error) {
    console.log(`\n❌ Test ERROR: ${name}`);
    console.log(`   ${error.message}`);
  }
}

// Main test runner
async function runTests() {
  console.log(`\n${'█'.repeat(70)}`);
  console.log(`🚀 API ENDPOINT TESTING - DUMMY DATA V2.0`);
  console.log(`${'█'.repeat(70)}`);
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  console.log(`🔗 Base URL: ${BASE_URL}`);
  
  // Test 1: KPI Eksekutif
  await testEndpoint('/api/v1/dashboard/kpi-eksekutif', 'GET /api/v1/dashboard/kpi-eksekutif');
  
  // Test 2: Dashboard Operasional
  await testEndpoint('/api/v1/dashboard/operasional', 'GET /api/v1/dashboard/operasional');
  
  console.log(`\n${'█'.repeat(70)}`);
  console.log(`✅ ALL TESTS COMPLETED`);
  console.log(`${'█'.repeat(70)}\n`);
}

// Run tests
runTests().catch(console.error);
