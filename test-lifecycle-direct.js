/**
 * DIRECT TEST - LIFECYCLE SERVICE
 * Test lifecycle service functions directly (bypass HTTP)
 */

require('dotenv').config();
const lifecycleService = require('./services/lifecycleService');

async function testDirect() {
  console.log('='.repeat(70));
  console.log('🧪 DIRECT TEST - LIFECYCLE SERVICE FUNCTIONS');
  console.log('='.repeat(70));

  try {
    // Test 1: getLifecycleOverview
    console.log('\n📊 Test 1: getLifecycleOverview()');
    console.log('-'.repeat(70));
    const overview = await lifecycleService.getLifecycleOverview();
    console.log('✅ SUCCESS\n');
    console.log('Summary:');
    console.log('  - Total Phases:', overview.summary.total_phases);
    console.log('  - Total SPKs:', overview.summary.total_spks_all);
    console.log('  - Total Executions:', overview.summary.total_executions_all);
    console.log('  - Avg Completion:', overview.summary.avg_completion + '%');
    console.log('  - Health Index:', overview.health_index);
    console.log('\nPhases:');
    overview.phases.forEach(p => {
      console.log(`  • ${p.nama_fase}: ${p.total_spks} SPKs, ${p.total_executions} exec, ${p.completion_rate}% complete`);
    });

    // Test 2: getPhaseMetrics for Pembibitan
    console.log('\n' + '='.repeat(70));
    console.log('📊 Test 2: getPhaseMetrics("Pembibitan")');
    console.log('-'.repeat(70));
    const pembibitan = await lifecycleService.getPhaseMetrics('Pembibitan');
    console.log('✅ SUCCESS\n');
    console.log('Phase Info:', pembibitan.phase_info.nama_fase);
    console.log('  - Age Range:', pembibitan.phase_info.umur_mulai, '-', pembibitan.phase_info.umur_selesai, 'tahun');
    console.log('\nSummary:');
    console.log('  - Sub Activities:', pembibitan.summary.total_sub_activities);
    console.log('  - Schedules:', pembibitan.summary.total_schedules);
    console.log('  - SPKs:', pembibitan.summary.total_spks);
    console.log('  - Executions:', pembibitan.summary.total_executions);
    console.log('  - Completion:', pembibitan.summary.completion_rate + '%');
    console.log('\nSPKs:');
    pembibitan.by_spk.forEach(spk => {
      console.log(`  • ${spk.nomor_spk}: ${spk.status}, ${spk.execution_count} exec, ${spk.sub_activity}`);
    });
    console.log('\nWeekly Breakdown:', pembibitan.weekly_breakdown.length, 'weeks');

    // Test 3: getSOPComplianceByPhase
    console.log('\n' + '='.repeat(70));
    console.log('📊 Test 3: getSOPComplianceByPhase()');
    console.log('-'.repeat(70));
    const sop = await lifecycleService.getSOPComplianceByPhase();
    console.log('✅ SUCCESS\n');
    console.log('Overall Compliance:', sop.overall_compliance + '%');
    console.log('\nBy Phase:');
    sop.by_phase.forEach(p => {
      console.log(`  • ${p.nama_fase}: ${p.sop_count} SOPs, ${p.spk_count} SPKs, ratio ${p.compliance_ratio} [${p.status}]`);
    });
    console.log('\nNon-Compliant Phases:', sop.non_compliant_phases.length);
    sop.non_compliant_phases.forEach(p => {
      console.log(`  ⚠️  ${p.nama_fase}: ${p.issue}`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('✅ ALL TESTS PASSED');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }

  process.exit(0);
}

testDirect();
