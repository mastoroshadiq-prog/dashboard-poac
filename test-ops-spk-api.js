/**
 * TEST OPS SPK API - Multi-Purpose SPK System
 * Tests all 6 endpoints for ops_* tables
 * 
 * Run: node test-ops-spk-api.js
 */

const http = require('http');
const supabase = require('./config/supabase');

// Test configuration
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Test data storage
let testData = {
  fase: null,
  subTindakan: null,
  jadwal: null,
  newSpk: null
};

/**
 * Helper: Make HTTP request
 */
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

/**
 * Helper: Log test result
 */
function logTest(testName, passed, details = '') {
  const symbol = passed ? '✅' : '❌';
  console.log(`${symbol} ${testName}`);
  if (details) {
    console.log(`   ${details}`);
  }
  
  testResults.tests.push({ testName, passed, details });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

/**
 * Test 1: GET /api/v1/ops/fase - Get all lifecycle phases
 */
async function test1_GetFaseList() {
  console.log('\n📌 TEST 1: GET /api/v1/ops/fase');
  console.log('Expected: 5 phases (Pembibitan, TBM, TM, Pemanenan, Replanting)');
  
  try {
    const { status, data } = await makeRequest('GET', '/api/v1/ops/fase');
    
    if (status === 200 && data.success && data.data.length === 5) {
      // Store first fase for subsequent tests
      testData.fase = data.data.find(f => f.nama_fase === 'Pemanenan');
      
      logTest(
        'Test 1: Get Fase List',
        true,
        `Found ${data.data.length} phases: ${data.data.map(f => f.nama_fase).join(', ')}`
      );
      
      console.log('\n   Sample fase:');
      console.log(`   - Nama: ${testData.fase.nama_fase}`);
      console.log(`   - Umur: ${testData.fase.umur_mulai}-${testData.fase.umur_selesai} tahun`);
      console.log(`   - Sub-tindakan: ${testData.fase.jumlah_sub_tindakan} items`);
      
      return true;
    } else {
      logTest('Test 1: Get Fase List', false, `Unexpected response: ${JSON.stringify(data)}`);
      return false;
    }
  } catch (error) {
    logTest('Test 1: Get Fase List', false, error.message);
    return false;
  }
}

/**
 * Test 2: GET /api/v1/ops/fase/:id_fase/sub-tindakan
 */
async function test2_GetSubTindakanByFase() {
  console.log('\n📌 TEST 2: GET /api/v1/ops/fase/:id_fase/sub-tindakan');
  console.log('Expected: Sub-tindakan for Pemanenan phase');
  
  if (!testData.fase) {
    logTest('Test 2: Get Sub-Tindakan', false, 'No fase data from Test 1');
    return false;
  }
  
  try {
    const { status, data } = await makeRequest(
      'GET',
      `/api/v1/ops/fase/${testData.fase.id_fase_besar}/sub-tindakan`
    );
    
    if (status === 200 && data.success && data.data.sub_tindakan.length > 0) {
      // Store first sub-tindakan with jadwal for next test
      testData.subTindakan = data.data.sub_tindakan.find(s => s.jumlah_jadwal > 0);
      
      logTest(
        'Test 2: Get Sub-Tindakan by Fase',
        true,
        `Found ${data.data.sub_tindakan.length} sub-tindakan for ${data.data.fase.nama_fase}`
      );
      
      console.log('\n   Sub-tindakan list:');
      data.data.sub_tindakan.forEach(s => {
        console.log(`   - ${s.nama_sub} (${s.jumlah_jadwal} jadwal)`);
      });
      
      return true;
    } else {
      logTest('Test 2: Get Sub-Tindakan by Fase', false, `Unexpected response: ${JSON.stringify(data)}`);
      return false;
    }
  } catch (error) {
    logTest('Test 2: Get Sub-Tindakan by Fase', false, error.message);
    return false;
  }
}

/**
 * Test 3: GET /api/v1/ops/sub-tindakan/:id/jadwal
 */
async function test3_GetJadwalBySubTindakan() {
  console.log('\n📌 TEST 3: GET /api/v1/ops/sub-tindakan/:id/jadwal');
  console.log('Expected: Jadwal for selected sub-tindakan');
  
  if (!testData.subTindakan) {
    logTest('Test 3: Get Jadwal', false, 'No sub-tindakan data from Test 2');
    return false;
  }
  
  try {
    const { status, data } = await makeRequest(
      'GET',
      `/api/v1/ops/sub-tindakan/${testData.subTindakan.id_sub_tindakan}/jadwal`
    );
    
    if (status === 200 && data.success && data.data.jadwal.length > 0) {
      // Store first jadwal for SPK creation test
      testData.jadwal = data.data.jadwal[0];
      
      logTest(
        'Test 3: Get Jadwal by Sub-Tindakan',
        true,
        `Found ${data.data.jadwal.length} jadwal for ${data.data.sub_tindakan.nama_sub}`
      );
      
      console.log('\n   Jadwal details:');
      data.data.jadwal.forEach(j => {
        console.log(`   - Frekuensi: ${j.frekuensi}, Interval: ${j.interval_hari} hari`);
        console.log(`     SPK count: ${j.jumlah_spk}`);
      });
      
      return true;
    } else {
      logTest('Test 3: Get Jadwal by Sub-Tindakan', false, `Unexpected response: ${JSON.stringify(data)}`);
      return false;
    }
  } catch (error) {
    logTest('Test 3: Get Jadwal by Sub-Tindakan', false, error.message);
    return false;
  }
}

/**
 * Test 4: POST /api/v1/ops/spk/create - Create new SPK
 */
async function test4_CreateOPSSPK() {
  console.log('\n📌 TEST 4: POST /api/v1/ops/spk/create');
  console.log('Expected: Create new SPK document');
  
  if (!testData.jadwal) {
    logTest('Test 4: Create OPS SPK', false, 'No jadwal data from Test 3');
    return false;
  }
  
  try {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const twoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const spkData = {
      id_jadwal_tindakan: testData.jadwal.id_jadwal_tindakan,
      nomor_spk: `SPK/TEST/2025/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      tanggal_terbit: today,
      tanggal_mulai: nextWeek,
      tanggal_selesai: twoWeeks,
      penanggung_jawab: 'Asisten Kebun - Test User',
      mandor: 'Mandor Test',
      lokasi: 'Afdeling 99 - Blok TEST',
      uraian_pekerjaan: 'Test SPK creation via API',
      catatan: 'Created by automated test script'
    };
    
    const { status, data } = await makeRequest('POST', '/api/v1/ops/spk/create', spkData);
    
    if (status === 201 && data.success && data.data.spk) {
      testData.newSpk = data.data.spk;
      
      logTest(
        'Test 4: Create OPS SPK',
        true,
        `Created SPK: ${data.data.spk.nomor_spk} (Status: ${data.data.spk.status})`
      );
      
      console.log('\n   New SPK details:');
      console.log(`   - ID: ${data.data.spk.id_spk}`);
      console.log(`   - Nomor: ${data.data.spk.nomor_spk}`);
      console.log(`   - Status: ${data.data.spk.status}`);
      console.log(`   - Mandor: ${data.data.spk.mandor}`);
      console.log(`   - Lokasi: ${data.data.spk.lokasi}`);
      console.log(`   - Tanggal: ${data.data.spk.tanggal_mulai} - ${data.data.spk.tanggal_selesai}`);
      
      return true;
    } else {
      logTest('Test 4: Create OPS SPK', false, `Unexpected response: ${JSON.stringify(data)}`);
      return false;
    }
  } catch (error) {
    logTest('Test 4: Create OPS SPK', false, error.message);
    return false;
  }
}

/**
 * Test 5: GET /api/v1/ops/spk - Get SPK list with filters
 */
async function test5_GetSPKList() {
  console.log('\n📌 TEST 5: GET /api/v1/ops/spk');
  console.log('Expected: List all SPK with pagination and filters');
  
  try {
    // Test 5a: Get all SPK (no filter)
    const { status: status1, data: data1 } = await makeRequest('GET', '/api/v1/ops/spk');
    
    if (status1 === 200 && data1.success) {
      logTest(
        'Test 5a: Get All SPK',
        true,
        `Found ${data1.data.length} SPK total. Status summary: PENDING=${data1.summary.PENDING}, DIKERJAKAN=${data1.summary.DIKERJAKAN}, SELESAI=${data1.summary.SELESAI}`
      );
      
      // Test 5b: Filter by status PENDING
      const { status: status2, data: data2 } = await makeRequest('GET', '/api/v1/ops/spk?status=PENDING');
      
      if (status2 === 200 && data2.success) {
        logTest(
          'Test 5b: Filter by Status PENDING',
          true,
          `Found ${data2.data.length} PENDING SPK`
        );
        
        // Test 5c: Filter by mandor
        const { status: status3, data: data3 } = await makeRequest('GET', '/api/v1/ops/spk?mandor=Joko');
        
        if (status3 === 200 && data3.success) {
          logTest(
            'Test 5c: Filter by Mandor',
            true,
            `Found ${data3.data.length} SPK for mandor containing 'Joko'`
          );
          
          console.log('\n   Sample SPK from list:');
          if (data1.data.length > 0) {
            const sample = data1.data[0];
            console.log(`   - Nomor: ${sample.nomor_spk}`);
            console.log(`   - Status: ${sample.status}`);
            console.log(`   - Mandor: ${sample.mandor}`);
            console.log(`   - Lokasi: ${sample.lokasi}`);
            if (sample.ops_jadwal_tindakan?.ops_sub_tindakan) {
              console.log(`   - Sub-Tindakan: ${sample.ops_jadwal_tindakan.ops_sub_tindakan.nama_sub}`);
            }
          }
          
          return true;
        }
      }
    }
    
    logTest('Test 5: Get SPK List', false, 'One or more filter tests failed');
    return false;
  } catch (error) {
    logTest('Test 5: Get SPK List', false, error.message);
    return false;
  }
}

/**
 * Test 6: PUT /api/v1/ops/spk/:id_spk/status - Update SPK status
 */
async function test6_UpdateSPKStatus() {
  console.log('\n📌 TEST 6: PUT /api/v1/ops/spk/:id_spk/status');
  console.log('Expected: Update status from PENDING → DIKERJAKAN');
  
  if (!testData.newSpk) {
    logTest('Test 6: Update SPK Status', false, 'No SPK data from Test 4');
    return false;
  }
  
  try {
    const updateData = {
      status: 'DIKERJAKAN',
      catatan: 'Status updated by automated test - now in progress'
    };
    
    const { status, data } = await makeRequest(
      'PUT',
      `/api/v1/ops/spk/${testData.newSpk.id_spk}/status`,
      updateData
    );
    
    if (status === 200 && data.success && data.data.new_status === 'DIKERJAKAN') {
      logTest(
        'Test 6: Update SPK Status',
        true,
        `Status changed: ${data.data.previous_status} → ${data.data.new_status}`
      );
      
      console.log('\n   Status update details:');
      console.log(`   - Previous: ${data.data.previous_status}`);
      console.log(`   - New: ${data.data.new_status}`);
      console.log(`   - Catatan: ${data.data.spk.catatan}`);
      
      return true;
    } else {
      logTest('Test 6: Update SPK Status', false, `Unexpected response: ${JSON.stringify(data)}`);
      return false;
    }
  } catch (error) {
    logTest('Test 6: Update SPK Status', false, error.message);
    return false;
  }
}

/**
 * Cleanup: Delete test SPK
 */
async function cleanupTestData() {
  if (testData.newSpk) {
    console.log('\n🧹 Cleaning up test data...');
    
    try {
      const { supabase } = require('./config/supabase');
      const { error } = await supabase
        .from('ops_spk_tindakan')
        .delete()
        .eq('id_spk', testData.newSpk.id_spk);
      
      if (error) {
        console.log(`   ⚠️  Failed to delete test SPK: ${error.message}`);
      } else {
        console.log(`   ✅ Deleted test SPK: ${testData.newSpk.nomor_spk}`);
      }
    } catch (error) {
      console.log(`   ⚠️  Cleanup error: ${error.message}`);
    }
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('='.repeat(70));
  console.log('🧪 TESTING OPS SPK API - Multi-Purpose SPK System');
  console.log('='.repeat(70));
  console.log('Testing 6 endpoints for ops_* tables (Lifecycle phases → SPK)\n');
  
  // Run tests sequentially
  await test1_GetFaseList();
  await test2_GetSubTindakanByFase();
  await test3_GetJadwalBySubTindakan();
  await test4_CreateOPSSPK();
  await test5_GetSPKList();
  await test6_UpdateSPKStatus();
  
  // Cleanup
  await cleanupTestData();
  
  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(70));
  
  if (testResults.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! OPS SPK API is working correctly.\n');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED. Please review the errors above.\n');
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test runner error:', error);
  process.exit(1);
});
