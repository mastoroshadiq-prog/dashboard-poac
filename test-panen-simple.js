/**
 * SIMPLE PANEN TEST - No process.exit()
 */

const { getPanenMetrics } = require('./services/operasionalService');

async function test() {
  console.log('\n🧪 TESTING PANEN METRICS (NEW SCHEMA)\n');
  
  try {
    const data = await getPanenMetrics();
    
    console.log('✅ SUCCESS!');
    console.log('\nSummary:');
    console.log(`  Total TBS: ${data.summary.total_ton_tbs} ton`);
    console.log(`  Avg Reject: ${data.summary.avg_reject_persen}%`);
    console.log(`  Total SPK: ${data.summary.total_spk}`);
    console.log(`  Executions: ${data.summary.total_executions}`);
    
    console.log('\nSPK Breakdown:');
    data.by_spk.forEach(spk => {
      console.log(`  ${spk.nomor_spk}: ${spk.total_ton} ton (reject ${spk.avg_reject}%)`);
    });
    
    console.log('\nWeekly:');
    data.weekly_breakdown.forEach(week => {
      console.log(`  ${week.week_start}: ${week.total_ton} ton`);
    });
    
    // Validations
    console.log('\n🎯 VALIDATIONS:');
    const checks = {
      'Total TBS in range 880-890': data.summary.total_ton_tbs >= 880 && data.summary.total_ton_tbs <= 890,
      'Avg Reject in range 2-2.3%': data.summary.avg_reject_persen >= 2.0 && data.summary.avg_reject_persen <= 2.3,
      'Total SPK = 4': data.summary.total_spk === 4,
      'Total Executions = 8': data.summary.total_executions === 8
    };
    
    let allPass = true;
    for (const [name, pass] of Object.entries(checks)) {
      console.log(`  ${pass ? '✅' : '❌'} ${name}`);
      if (!pass) allPass = false;
    }
    
    if (allPass) {
      console.log('\n🎉 ALL TESTS PASSED!\n');
    } else {
      console.log('\n⚠️  Some tests failed\n');
    }
    
  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
  }
}

test();
