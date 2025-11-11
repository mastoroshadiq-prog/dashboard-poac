/**
 * TEST ENHANCED DASHBOARD SERVICES
 * Test lifecycle enhancements in all 3 dashboard services
 */

require('dotenv').config();
const operasionalService = require('./services/operasionalService');
const dashboardService = require('./services/dashboardService');
const teknisService = require('./services/teknisService');

async function testEnhancements() {
  console.log('='.repeat(70));
  console.log('🧪 TEST ENHANCED DASHBOARD SERVICES - LIFECYCLE INTEGRATION');
  console.log('='.repeat(70));

  try {
    // Test 1: Operasional Service - Lifecycle Widget
    console.log('\n📊 Test 1: operasionalService.getLifecycleWidget()');
    console.log('-'.repeat(70));
    const widget = await operasionalService.getLifecycleWidget();
    console.log('✅ SUCCESS\n');
    console.log('Widget Data:');
    console.log('  - Total Phases:', widget.total_phases);
    console.log('  - Total SPKs:', widget.total_spks);
    console.log('  - Total Executions:', widget.total_executions);
    console.log('  - Avg Completion:', widget.avg_completion + '%');
    console.log('  - Health Index:', widget.health_index);
    console.log('\nPhases Summary:', widget.phases_summary.length, 'phases');
    widget.phases_summary.forEach(p => {
      console.log(`  • ${p.nama_fase}: ${p.spks} SPKs, ${p.executions} exec, ${p.completion}%`);
    });

    // Test 2: Dashboard Service - SOP Compliance
    console.log('\n' + '='.repeat(70));
    console.log('📊 Test 2: dashboardService.getLifecycleSOPCompliance()');
    console.log('-'.repeat(70));
    const sop = await dashboardService.getLifecycleSOPCompliance();
    console.log('✅ SUCCESS\n');
    console.log('SOP Compliance:');
    console.log('  - Overall Compliance:', sop.overall_compliance + '%');
    console.log('  - Compliant Phases:', sop.compliant_phases + '/' + sop.total_phases);
    console.log('  - Non-Compliant Count:', sop.non_compliant_count);
    console.log('  - Needs Attention:', sop.needs_attention.join(', '));
    console.log('\nPhases Detail:', sop.phases.length, 'phases');
    sop.phases.forEach(p => {
      console.log(`  • ${p.nama_fase}: ${p.sop_count} SOPs → ${p.spk_count} SPKs [${p.status}]`);
    });

    // Test 3: Teknis Service - Health Index
    console.log('\n' + '='.repeat(70));
    console.log('📊 Test 3: teknisService.getPlantationHealthIndex()');
    console.log('-'.repeat(70));
    const health = await teknisService.getPlantationHealthIndex();
    console.log('✅ SUCCESS\n');
    console.log('Plantation Health:');
    console.log('  - Overall Health:', health.overall_health);
    console.log('  - Total Phases:', health.total_phases);
    console.log('  - Critical Phases:', health.critical_phases.length);
    if (health.critical_phases.length > 0) {
      console.log('    ⚠️  ', health.critical_phases.join(', '));
    }
    console.log('\nBy Phase:', health.by_phase.length, 'phases');
    health.by_phase.forEach(p => {
      console.log(`  • ${p.nama_fase}: ${p.health_score}% [${p.status}] - ${p.spks} SPKs, ${p.executions} exec`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('✅ ALL ENHANCEMENT TESTS PASSED');
    console.log('='.repeat(70));
    console.log('\n📋 Summary:');
    console.log('  ✅ operasionalService.getLifecycleWidget() - Working');
    console.log('  ✅ dashboardService.getLifecycleSOPCompliance() - Working');
    console.log('  ✅ teknisService.getPlantationHealthIndex() - Working');
    console.log('\n🎯 All 3 dashboard services enhanced with lifecycle data!');

  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }

  process.exit(0);
}

testEnhancements();
