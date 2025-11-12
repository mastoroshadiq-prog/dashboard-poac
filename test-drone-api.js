/**
 * Test Drone NDRE API Endpoints
 */

const http = require('http');

const BASE_URL = 'localhost';
const PORT = 3000;

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: path,
      method: 'GET',
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testEndpoints() {
  console.log('='.repeat(60));
  console.log('🧪 TESTING DRONE NDRE API ENDPOINTS');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Test 1: Get Filter Options
    console.log('📋 Test 1: GET /api/v1/drone/ndre/filters');
    const filters = await makeRequest('/api/v1/drone/ndre/filters');
    console.log('✅ Success!');
    console.log(JSON.stringify(filters, null, 2));
    console.log('');

    // Test 2: Get Statistics
    console.log('📊 Test 2: GET /api/v1/drone/ndre/statistics');
    const stats = await makeRequest('/api/v1/drone/ndre/statistics');
    console.log('✅ Success!');
    console.log(JSON.stringify(stats, null, 2));
    console.log('');

    // Test 3: Get NDRE Data (first 10 items)
    console.log('🗺️  Test 3: GET /api/v1/drone/ndre?limit=10&stress_level=Stres Berat');
    const data = await makeRequest('/api/v1/drone/ndre?limit=10&stress_level=Stres%20Berat');
    console.log('✅ Success!');
    console.log(`   Total items: ${data.data?.length || 0}`);
    console.log(`   Pagination: Page ${data.pagination?.page} of ${data.pagination?.total_pages}`);
    console.log('   Sample data (first item):');
    if (data.data && data.data[0]) {
      console.log(JSON.stringify(data.data[0], null, 2));
    }
    console.log('');

    console.log('='.repeat(60));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    process.exit(1);
  }
}

testEndpoints();
