/**
 * TEST LIFECYCLE API ENDPOINTS
 * 
 * Purpose: Test all 3 lifecycle endpoints without interfering with server
 */

const BASE_URL = 'http://localhost:3000/api/v1/lifecycle';

async function testLifecycleAPI() {
  console.log('='.repeat(60));
  console.log('🧪 TESTING LIFECYCLE API ENDPOINTS');
  console.log('='.repeat(60));

  try {
    // Test 1: Overview
    console.log('\n📊 Test 1: GET /api/v1/lifecycle/overview');
    const overviewRes = await fetch(`${BASE_URL}/overview`);
    const overview = await overviewRes.json();
    console.log('✅ SUCCESS');
    console.log('Summary:', JSON.stringify(overview.summary, null, 2));
    console.log('Phases count:', overview.phases.length);
    console.log('Health Index:', overview.health_index);

    // Test 2: Phase Metrics (Pembibitan)
    console.log('\n📊 Test 2: GET /api/v1/lifecycle/phase/Pembibitan');
    const pembibitanRes = await fetch(`${BASE_URL}/phase/Pembibitan`);
    const pembibitan = await pembibitanRes.json();
    console.log('✅ SUCCESS');
    console.log('Phase Info:', pembibitan.phase_info.nama_fase);
    console.log('Summary:', JSON.stringify(pembibitan.summary, null, 2));
    console.log('SPKs:', pembibitan.by_spk.length);

    // Test 3: SOP Compliance
    console.log('\n📊 Test 3: GET /api/v1/lifecycle/sop-compliance');
    const sopRes = await fetch(`${BASE_URL}/sop-compliance`);
    const sop = await sopRes.json();
    console.log('✅ SUCCESS');
    console.log('Overall Compliance:', sop.overall_compliance + '%');
    console.log('By Phase count:', sop.by_phase.length);
    console.log('Non-compliant:', sop.non_compliant_phases.length);

    console.log('\n' + '='.repeat(60));
    console.log('✅ ALL TESTS PASSED');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error.message);
  }
}

// Run tests
testLifecycleAPI();
