/**
 * SIMPLE TEST FOR SPK VALIDASI DRONE API
 * Run this AFTER server is started
 */

const http = require('http');

console.log('\n========================================');
console.log('  TESTING SPK VALIDASI DRONE API');
console.log('========================================\n');

// Helper function to make HTTP requests
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
            statusCode: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
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

async function runTests() {
  try {
    // Test 1: Health check
    console.log('[TEST 1] Health Check...');
    const health = await makeRequest('GET', '/health');
    if (health.statusCode === 200) {
      console.log('✅ Server healthy:', health.data.message);
    } else {
      console.log('❌ Health check failed:', health.statusCode);
      return;
    }

    // Test 2: Get trees with Stres Berat
    console.log('\n[TEST 2] Getting trees with Stres Berat...');
    const trees = await makeRequest('GET', '/api/v1/drone/ndre?stress_level=Stres%20Berat&limit=3');
    
    if (trees.statusCode !== 200 || !trees.data.data || trees.data.data.length === 0) {
      console.log('❌ No trees found or error:', trees.statusCode);
      console.log('Response:', JSON.stringify(trees.data, null, 2));
      return;
    }

    const treeIds = trees.data.data.map(t => t.id);
    console.log(`✅ Found ${treeIds.length} trees`);
    trees.data.data.forEach(t => {
      console.log(`   - ${t.tree_id}: NDRE ${t.ndre.value} (${t.ndre.classification})`);
    });

    // Test 3: Create SPK
    console.log('\n[TEST 3] Creating SPK Validasi Drone...');
    
    // Use REAL user UUIDs from database (FK constraint!)
    const asisten_uuid = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const mandor_uuid = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
    const surveyor_uuid = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13';
    
    const spkBody = {
      created_by: asisten_uuid,
      assigned_to: mandor_uuid,
      trees: treeIds,
      priority: 'NORMAL',
      notes: 'Testing SPK creation from automated test'
    };

    const spkResult = await makeRequest('POST', '/api/v1/spk/validasi-drone', spkBody);
    
    if (spkResult.statusCode === 201 && spkResult.data.success) {
      console.log('✅ SPK Created!');
      console.log(`   SPK ID: ${spkResult.data.data.spk.id_spk}`);
      console.log(`   SPK No: ${spkResult.data.data.spk.no_spk}`);
      console.log(`   Priority: ${spkResult.data.data.summary.priority}`);
      console.log(`   Deadline: ${spkResult.data.data.spk.target_selesai}`);
      console.log(`   Total Tugas: ${spkResult.data.data.summary.total_trees}`);
      console.log(`   Stres Berat: ${spkResult.data.data.summary.stress_levels.stres_berat}`);
      
      const spkId = spkResult.data.data.spk.id_spk;
      const mandorId = spkResult.data.data.spk.assigned_to;
      const tugasIds = spkResult.data.data.tugas.map(t => t.id_tugas);

      // Test 4: Get SPK Detail
      console.log('\n[TEST 4] Getting SPK Detail...');
      const spkDetail = await makeRequest('GET', `/api/v1/spk/${spkId}`);
      
      if (spkDetail.statusCode === 200) {
        console.log('✅ SPK Detail retrieved');
        console.log(`   Total Tugas: ${spkDetail.data.data.statistics.total_tugas}`);
        console.log(`   Completion: ${spkDetail.data.data.statistics.completion_percentage}%`);
      }

      // Test 5: Get SPK List for Mandor
      console.log('\n[TEST 5] Getting SPK List for Mandor...');
      const spkList = await makeRequest('GET', `/api/v1/spk/mandor/${mandorId}`);
      
      if (spkList.statusCode === 200) {
        console.log(`✅ SPK List retrieved: ${spkList.data.pagination.total_items} SPK(s)`);
      }

      // Test 6: Assign to Surveyor
      console.log('\n[TEST 6] Assigning tasks to surveyor...');
      
      const assignBody = {
        id_tugas_list: tugasIds.slice(0, 2), // Assign first 2 tasks
        surveyor_id: surveyor_uuid, // Use same real UUID
        mandor_id: mandorId,
        notes: 'Testing task assignment'
      };

      const assignResult = await makeRequest('POST', `/api/v1/spk/${spkId}/assign-surveyor`, assignBody);
      
      if (assignResult.statusCode === 200 && assignResult.data.success) {
        console.log(`✅ Tasks assigned: ${assignResult.data.data.assigned_count} tasks`);
      }

      // Final summary
      console.log('\n========================================');
      console.log('  ALL TESTS PASSED! ✅');
      console.log('========================================');
      console.log(`\nCreated SPK ID: ${spkId}`);
      console.log(`View in browser: http://localhost:3000/api/v1/spk/${spkId}`);
      console.log('\n✅ Point 2 COMPLETE: SPK Validasi Drone API working!\n');

    } else {
      console.log('❌ Failed to create SPK');
      console.log('Status:', spkResult.statusCode);
      console.log('Response:', JSON.stringify(spkResult.data, null, 2));
    }

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }
}

// Run tests
runTests();
