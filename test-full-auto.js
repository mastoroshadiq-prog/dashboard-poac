/**
 * FULL AUTO TEST - Platform A Endpoints
 * Menjalankan server, generate token, dan test endpoints secara otomatis
 */
require('dotenv').config();
const jwt = require('jsonwebtoken');
const http = require('http');

const JWT_SECRET = process.env.JWT_SECRET;
const BASE_URL = 'http://localhost:3000';

// Test user
const testUser = {
  id_pihak: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10',
  nama_pihak: 'Test Mandor Agus',
  role: 'MANDOR'
};

// Generate token
const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: '7d' });

console.log('='.repeat(80));
console.log('🧪 FULL AUTO TEST - Platform A Endpoints');
console.log('='.repeat(80));
console.log('\n🔑 Generated Token:');
console.log(token);
console.log('\n⏰ Expires:', new Date(jwt.decode(token).exp * 1000).toLocaleString());

// Helper: HTTP Request
function httpRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
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

// Test 1: GET /tugas/saya
async function testGetTugasSaya() {
  console.log('\n' + '='.repeat(80));
  console.log('📋 TEST 1: GET /api/v1/spk/tugas/saya');
  console.log('='.repeat(80));
  
  try {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/spk/tugas/saya',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    const result = await httpRequest(options);
    
    console.log('\n✅ Status:', result.status);
    console.log('📦 Response:');
    console.log(JSON.stringify(result.data, null, 2));
    
    if (result.data.success && result.data.data) {
      console.log('\n📊 Summary:');
      console.log('   Total Tugas:', result.data.data.total);
      console.log('   Tugas Count:', result.data.data.tugas?.length || 0);
    }
    
    return result;
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    return null;
  }
}

// Test 2: POST /log_aktivitas
async function testPostLogAktivitas() {
  console.log('\n' + '='.repeat(80));
  console.log('📝 TEST 2: POST /api/v1/spk/log_aktivitas (Auto-Trigger G1 → APH)');
  console.log('='.repeat(80));
  
  try {
    const body = {
      log_aktivitas: [
        {
          id_tugas: 'c2ffbc99-9c0b-4ef8-bb6d-6bb9bd380c01',
          id_npokok: 'b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380b01',
          timestamp_eksekusi: new Date().toISOString(),
          gps_eksekusi: { lat: -6.2088, lon: 106.8456 },
          hasil_json: {
            status_aktual: 'G1',
            kondisi: 'Baik',
            catatan: 'Test auto-trigger APH dari auto test script'
          }
        }
      ]
    };
    
    const postData = JSON.stringify(body);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/spk/log_aktivitas',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const result = await httpRequest(options, postData);
    
    console.log('\n✅ Status:', result.status);
    console.log('📦 Response:');
    console.log(JSON.stringify(result.data, null, 2));
    
    if (result.data.success && result.data.data) {
      console.log('\n📊 Summary:');
      console.log('   Logs Inserted:', result.data.data.inserted);
      console.log('   Auto-Triggered WO:', result.data.data.auto_triggered_wo);
    }
    
    return result;
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    return null;
  }
}

// Main test
(async () => {
  console.log('\n⏳ Waiting 2 seconds for server to be ready...\n');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testGetTugasSaya();
  await testPostLogAktivitas();
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ ALL TESTS COMPLETED');
  console.log('='.repeat(80));
  console.log('\n📝 Next: Check Supabase for:');
  console.log('   1. log_aktivitas_5w1h table (should have 1 new row)');
  console.log('   2. spk_tugas table (should have 1 new APH Work Order)');
  console.log('   3. id_tugas c2ffbc99... status should be DIKERJAKAN\n');
})();
