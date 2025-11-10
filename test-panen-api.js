/**
 * PHASE 1 - PANEN API TEST SCRIPT
 * 
 * Test: GET /api/v1/dashboard/operasional
 * Validate: kpi_hasil_panen object with Tahap 6 model data
 * 
 * Run after executing sql/phase1_ALL_IN_ONE.sql
 */

const { supabase } = require('./config/supabase');
const { getPanenMetrics } = require('./services/operasionalService');

async function testPanenMetrics() {
  console.log('\n🧪 =====================================');
  console.log('   PHASE 1 - PANEN METRICS TEST');
  console.log('   =====================================\n');
  console.log('⚠️  NOTE: Testing PANEN only (NEW schema)');
  console.log('   Skipping OLD schema features (Validasi, APH, Sanitasi)\n');
  
  try {
    // Test 1: Direct function call
    console.log('📊 Test 1: getPanenMetrics() direct call...\n');
    
    const panenData = await getPanenMetrics();
    
    console.log('✅ SUMMARY:');
    console.log(`   Total TBS: ${panenData.summary.total_ton_tbs} ton`);
    console.log(`   Avg Reject: ${panenData.summary.avg_reject_persen}%`);
    console.log(`   Total SPK: ${panenData.summary.total_spk}`);
    console.log(`   Total Executions: ${panenData.summary.total_executions}`);
    
    console.log('\n✅ BY SPK:');
    panenData.by_spk.forEach((spk, idx) => {
      console.log(`   ${idx + 1}. ${spk.nomor_spk}`);
      console.log(`      Lokasi: ${spk.lokasi}`);
      console.log(`      Mandor: ${spk.mandor}`);
      console.log(`      Total: ${spk.total_ton} ton (${spk.execution_count} executions)`);
      console.log(`      Avg Reject: ${spk.avg_reject}%`);
    });
    
    console.log('\n✅ WEEKLY BREAKDOWN:');
    panenData.weekly_breakdown.forEach((week, idx) => {
      console.log(`   Week ${idx + 1} (${week.week_start}): ${week.total_ton} ton, reject ${week.avg_reject}%`);
    });
    
    // Validation
    console.log('\n\n🎯 VALIDATION:');
    
    const validations = [
      {
        name: 'Summary exists',
        pass: panenData.summary !== undefined
      },
      {
        name: 'Total TBS ~885 ton',
        pass: panenData.summary.total_ton_tbs >= 880 && 
              panenData.summary.total_ton_tbs <= 890
      },
      {
        name: 'Avg Reject ~2.18%',
        pass: panenData.summary.avg_reject_persen >= 2.0 && 
              panenData.summary.avg_reject_persen <= 2.3
      },
      {
        name: 'Total SPK = 4',
        pass: panenData.summary.total_spk === 4
      },
      {
        name: 'Total Executions = 8',
        pass: panenData.summary.total_executions === 8
      },
      {
        name: 'by_spk array length = 4',
        pass: panenData.by_spk?.length === 4
      },
      {
        name: 'weekly_breakdown exists',
        pass: panenData.weekly_breakdown !== undefined
      }
    ];
    
    let passCount = 0;
    validations.forEach(v => {
      const status = v.pass ? '✅' : '❌';
      console.log(`   ${status} ${v.name}`);
      if (v.pass) passCount++;
    });
    
    console.log(`\n📈 SCORE: ${passCount}/${validations.length} validations passed`);
    
    if (passCount === validations.length) {
      console.log('\n🎉 ALL TESTS PASSED! Phase 1 PANEN implementation successful!\n');
      console.log('📝 NOTE: Validasi/APH/Sanitasi still use OLD schema (spk_header)');
      console.log('   These will be migrated in Phase 2-3.\n');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed. Check SQL script execution.\n');
      process.exit(1);
    }
    
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    console.error('\nStack trace:', err.stack);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Did you run sql/phase1_ALL_IN_ONE.sql in Supabase?');
    console.log('   2. Check Supabase connection in config/supabase.js');
    console.log('   3. Verify table permissions (RLS policies)');
    process.exit(1);
  }
}

// Run test
testPanenMetrics();
