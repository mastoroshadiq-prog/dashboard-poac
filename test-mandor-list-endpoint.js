/**
 * Test Mandor List Endpoint
 * 
 * Purpose: Verify /api/v1/mandor/list returns Agus & Eko for SPK assignment form
 * 
 * Usage: Ensure server is running, then: node test-mandor-list-endpoint.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// ASISTEN token from generate-asisten-token.js
const ASISTEN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9waWhhayI6ImEwZWViYzk5LTljMGItNGVmOC1iYjZkLTZiYjliZDM4MGEyMCIsInJvbGUiOiJBU0lTVEVOIiwibmFtYV9waWhhayI6IlBhayBCdWRpIChBc2lzdGVuIE1hbmFnZXIpIiwiaWF0IjoxNzYzNDc4MTkwLCJleHAiOjE3NjM1NjQ1OTB9.Dv0iB4laaYPgJa0dlGy71dZvLUbdb517Ppm4lnyNECk';

async function testMandorListEndpoint() {
  console.log('\n🧪 Testing Mandor List Endpoint\n');
  console.log('Purpose: Fix frontend form "Assign to Mandor" dropdown');
  console.log('Expected: Should return Agus & Eko (MANDOR), NOT Ahmad/Budi/Cahyo (PEKERJA)\n');

  try {
    console.log('📡 Calling: GET /api/v1/mandor/list');
    console.log('🔑 Authorization: ASISTEN role\n');

    const response = await axios.get(`${BASE_URL}/api/v1/mandor/list`, {
      headers: {
        'Authorization': `Bearer ${ASISTEN_TOKEN}`
      }
    });

    console.log('✅ Response Status:', response.status);
    console.log('📦 Response Data:\n');
    console.log(JSON.stringify(response.data, null, 2));

    // Validate response structure
    if (response.data.success) {
      const mandorList = response.data.data.mandor_list;
      const total = response.data.data.total;

      console.log('\n✅ SUCCESS: Endpoint returned valid response');
      console.log(`📊 Total mandor: ${total}`);

      if (total === 2) {
        console.log('✅ CORRECT: Found 2 mandor (Agus & Eko)');
      } else {
        console.log(`⚠️  WARNING: Expected 2 mandor, got ${total}`);
      }

      console.log('\n👥 Mandor Details:');
      mandorList.forEach((mandor, index) => {
        console.log(`\n${index + 1}. ${mandor.nama}`);
        console.log(`   - ID: ${mandor.id_pihak}`);
        console.log(`   - Kode: ${mandor.kode_unik}`);
        console.log(`   - Tipe: ${mandor.tipe}`);
      });

      // Check for correct mandor names
      const mandorNames = mandorList.map(m => m.nama);
      const hasAgus = mandorNames.some(name => name.includes('Agus'));
      const hasEko = mandorNames.some(name => name.includes('Eko'));

      console.log('\n🔍 Validation:');
      console.log(`   ${hasAgus ? '✅' : '❌'} Agus found`);
      console.log(`   ${hasEko ? '✅' : '❌'} Eko found`);

      if (hasAgus && hasEko && total === 2) {
        console.log('\n🎉 TEST PASSED: Endpoint returns correct mandor list for form dropdown!');
        console.log('\n📋 Next Steps:');
        console.log('   1. Update frontend form to use this endpoint');
        console.log('   2. Change API call from old endpoint to: GET /api/v1/mandor/list');
        console.log('   3. Use ASISTEN token for authorization');
        console.log('   4. Map dropdown options: { value: id_pihak, label: nama }');
      } else {
        console.log('\n⚠️  TEST WARNING: Mandor list incomplete');
      }
    } else {
      console.log('\n❌ TEST FAILED: Response indicates error');
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED: Request error');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Is server running?');
      console.error('Start server with: node index.js');
    } else {
      console.error('Error:', error.message);
    }
  }

  console.log('\n');
}

testMandorListEndpoint();
