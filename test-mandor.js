const http = require('http');

console.log('\n========================================');
console.log('  TESTING MANDOR DASHBOARD ENDPOINTS');
console.log('========================================\n');

const TEST_MANDOR_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';

function makeRequest(method, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function test() {
  try {
    console.log('Testing with Mandor ID:', TEST_MANDOR_ID, '\n');

    // Test 1: Dashboard Overview
    console.log('[TEST 1] Dashboard Overview...');
    const r1 = await makeRequest('GET', `/api/v1/mandor/${TEST_MANDOR_ID}/dashboard`);
    if (r1.statusCode === 200 && r1.data.success) {
      console.log(' Dashboard:', r1.data.data.summary);
    } else {
      console.log(' Failed:', r1.statusCode);
    }

    // Test 2: Surveyors
    console.log('\n[TEST 2] Surveyor List...');
    const r2 = await makeRequest('GET', `/api/v1/mandor/${TEST_MANDOR_ID}/surveyors`);
    if (r2.statusCode === 200 && r2.data.success) {
      console.log(' Surveyors:', r2.data.data.summary);
    } else {
      console.log(' Failed:', r2.statusCode);
    }

    // Test 3: Real-time
    console.log('\n[TEST 3] Real-time Progress...');
    const r3 = await makeRequest('GET', `/api/v1/mandor/${TEST_MANDOR_ID}/tasks/realtime`);
    if (r3.statusCode === 200 && r3.data.success) {
      console.log(' Real-time: Active=' + r3.data.data.active_tasks.length + ', Recent=' + r3.data.data.recent_completions.length);
    } else {
      console.log(' Failed:', r3.statusCode);
    }

    // Test 4: Daily Performance
    console.log('\n[TEST 4] Daily Performance...');
    const r4 = await makeRequest('GET', `/api/v1/mandor/${TEST_MANDOR_ID}/performance/daily`);
    if (r4.statusCode === 200 && r4.data.success) {
      console.log(' Performance:', r4.data.data.targets);
    } else {
      console.log(' Failed:', r4.statusCode);
    }

    console.log('\n ALL TESTS COMPLETED!\n');
  } catch (error) {
    console.error(' Error:', error.message);
  }
}

test();
