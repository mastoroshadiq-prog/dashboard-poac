/**
 * Test Enhancement Functions
 * Quick test script untuk debugging enhancement
 */

require('dotenv').config();
const { getDashboardOperasional } = require('./services/operasionalService');
const { getKpiEksekutif } = require('./services/dashboardService');

async function testEnhancements() {
  console.log('🧪 Testing API Enhancements...\n');
  
  try {
    // Test Dashboard Operasional
    console.log('1️⃣ Testing Dashboard Operasional Enhancement...');
    const operasionalData = await getDashboardOperasional();
    console.log('✅ Success! Sample data:');
    console.log(JSON.stringify(operasionalData, null, 2).substring(0, 500) + '...\n');
    
    // Test KPI Eksekutif
    console.log('2️⃣ Testing KPI Eksekutif Enhancement...');
    const kpiData = await getKpiEksekutif();
    console.log('✅ Success! Sample data:');
    console.log(JSON.stringify(kpiData, null, 2).substring(0, 500) + '...\n');
    
    console.log('🎉 All tests passed!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

testEnhancements();
