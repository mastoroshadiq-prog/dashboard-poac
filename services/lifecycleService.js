/**
 * LIFECYCLE SERVICE - MULTI-PHASE OPERATIONS
 * 
 * Purpose: Backend service untuk lifecycle management (Pembibitan, TBM, TM, Replanting)
 * Created: November 11, 2025
 * Phase: 2 - Multi-Phase Lifecycle Data
 * 
 * Features:
 * - getPhaseMetrics(phase_name): Get detailed metrics for specific phase
 * - getLifecycleOverview(): Get summary across all 5 phases
 * - getSOPComplianceByPhase(): Get SOP compliance metrics per phase
 */

const { supabase } = require('../config/supabase');

/**
 * FUNCTION 1: Get Phase Metrics
 * 
 * Input: phase_name (e.g., 'Pembibitan', 'TBM', 'TM', 'Pemanenan', 'Replanting')
 * Output: {
 *   phase_info: { nama_fase, umur_mulai, umur_selesai, deskripsi },
 *   summary: {
 *     total_sub_activities: number,
 *     total_schedules: number,
 *     total_spks: number,
 *     total_executions: number,
 *     completion_rate: percentage
 *   },
 *   by_spk: [ { nomor_spk, status, execution_count, ... } ],
 *   weekly_breakdown: [ { week, spk_count, execution_count } ]
 * }
 * 
 * Schema Reference:
 * - ops_fase_besar: id_fase_besar, nama_fase, umur_mulai, umur_selesai, deskripsi
 * - ops_sub_tindakan: id_sub_tindakan, id_fase_besar, nama_sub, deskripsi
 * - ops_jadwal_tindakan: id_jadwal_tindakan, id_sub_tindakan, frekuensi, interval_hari
 * - ops_spk_tindakan: id_spk, id_jadwal_tindakan, nomor_spk, tanggal_terbit, status
 * - ops_eksekusi_tindakan: id_eksekusi_tindakan, id_spk, tanggal_eksekusi, hasil
 */
async function getPhaseMetrics(phase_name) {
  try {
    console.log(`🔍 [LIFECYCLE] Fetching metrics for phase: ${phase_name}`);

    // Step 1: Get phase info
    const { data: phaseData, error: phaseError } = await supabase
      .from('ops_fase_besar')
      .select('id_fase_besar, nama_fase, umur_mulai, umur_selesai, deskripsi')
      .eq('nama_fase', phase_name)
      .single();

    if (phaseError) throw phaseError;
    if (!phaseData) {
      return { error: `Phase '${phase_name}' not found` };
    }

    // Step 2: Get complete data with JOINs
    const { data: fullData, error: fullError } = await supabase
      .from('ops_spk_tindakan')
      .select(`
        id_spk,
        nomor_spk,
        tanggal_terbit,
        tanggal_mulai,
        tanggal_selesai,
        status,
        lokasi,
        mandor,
        uraian_pekerjaan,
        ops_jadwal_tindakan!inner (
          id_jadwal_tindakan,
          frekuensi,
          interval_hari,
          ops_sub_tindakan!inner (
            id_sub_tindakan,
            nama_sub,
            ops_fase_besar!inner (
              id_fase_besar,
              nama_fase
            )
          )
        )
      `)
      .eq('ops_jadwal_tindakan.ops_sub_tindakan.ops_fase_besar.nama_fase', phase_name);

    if (fullError) throw fullError;

    // Step 3: Get executions for these SPKs
    const spkIds = (fullData || []).map(spk => spk.id_spk);
    let executionsData = [];
    
    if (spkIds.length > 0) {
      const { data: execData, error: execError } = await supabase
        .from('ops_eksekusi_tindakan')
        .select('id_eksekusi_tindakan, id_spk, tanggal_eksekusi, hasil, petugas, catatan')
        .in('id_spk', spkIds);

      if (execError) throw execError;
      executionsData = execData || [];
    }

    // Step 4: Calculate summary
    const total_spks = (fullData || []).length;
    const total_executions = executionsData.length;
    const spks_selesai = (fullData || []).filter(spk => spk.status === 'SELESAI').length;
    const completion_rate = total_spks > 0 ? ((spks_selesai / total_spks) * 100).toFixed(2) : 0;

    // Get unique sub_activities and schedules
    const uniqueSubActivities = new Set();
    const uniqueSchedules = new Set();
    (fullData || []).forEach(spk => {
      if (spk.ops_jadwal_tindakan?.ops_sub_tindakan) {
        uniqueSubActivities.add(spk.ops_jadwal_tindakan.ops_sub_tindakan.id_sub_tindakan);
      }
      if (spk.ops_jadwal_tindakan) {
        uniqueSchedules.add(spk.ops_jadwal_tindakan.id_jadwal_tindakan);
      }
    });

    // Step 5: Build by_spk array with execution details
    const by_spk = (fullData || []).map(spk => {
      const executions = executionsData.filter(ex => ex.id_spk === spk.id_spk);
      return {
        nomor_spk: spk.nomor_spk,
        status: spk.status,
        tanggal_terbit: spk.tanggal_terbit,
        tanggal_mulai: spk.tanggal_mulai,
        tanggal_selesai: spk.tanggal_selesai,
        lokasi: spk.lokasi,
        mandor: spk.mandor,
        uraian_pekerjaan: spk.uraian_pekerjaan,
        sub_activity: spk.ops_jadwal_tindakan?.ops_sub_tindakan?.nama_sub || '',
        execution_count: executions.length,
        executions: executions.map(ex => ({
          tanggal: ex.tanggal_eksekusi,
          hasil: ex.hasil,
          petugas: ex.petugas
        }))
      };
    });

    // Step 6: Weekly breakdown (group by week)
    const weeklyMap = {};
    executionsData.forEach(ex => {
      const date = new Date(ex.tanggal_eksekusi);
      const weekNum = getWeekNumber(date);
      const weekKey = `${date.getFullYear()}-W${weekNum}`;
      
      if (!weeklyMap[weekKey]) {
        weeklyMap[weekKey] = { week: weekKey, execution_count: 0, spk_ids: new Set() };
      }
      weeklyMap[weekKey].execution_count++;
      weeklyMap[weekKey].spk_ids.add(ex.id_spk);
    });

    const weekly_breakdown = Object.values(weeklyMap).map(w => ({
      week: w.week,
      spk_count: w.spk_ids.size,
      execution_count: w.execution_count
    })).sort((a, b) => a.week.localeCompare(b.week));

    return {
      phase_info: {
        nama_fase: phaseData.nama_fase,
        umur_mulai: phaseData.umur_mulai,
        umur_selesai: phaseData.umur_selesai,
        deskripsi: phaseData.deskripsi
      },
      summary: {
        total_sub_activities: uniqueSubActivities.size,
        total_schedules: uniqueSchedules.size,
        total_spks: total_spks,
        total_executions: total_executions,
        spks_selesai: spks_selesai,
        completion_rate: parseFloat(completion_rate)
      },
      by_spk: by_spk,
      weekly_breakdown: weekly_breakdown
    };

  } catch (error) {
    console.error(`❌ [LIFECYCLE] Error in getPhaseMetrics:`, error);
    throw error;
  }
}

/**
 * FUNCTION 2: Get Lifecycle Overview
 * 
 * Output: {
 *   phases: [ { nama_fase, total_spks, total_executions, completion_rate, ... } ],
 *   summary: { total_phases, total_spks_all, total_executions_all, avg_completion },
 *   health_index: number (0-100)
 * }
 */
async function getLifecycleOverview() {
  try {
    console.log('🔍 [LIFECYCLE] Fetching lifecycle overview for all phases');

    // Get all phases
    const { data: phases, error: phaseError } = await supabase
      .from('ops_fase_besar')
      .select('id_fase_besar, nama_fase, umur_mulai, umur_selesai, deskripsi')
      .order('umur_mulai');

    if (phaseError) throw phaseError;

    // Get metrics for each phase
    const phaseMetrics = await Promise.all(
      (phases || []).map(async (phase) => {
        const metrics = await getPhaseMetrics(phase.nama_fase);
        return {
          nama_fase: phase.nama_fase,
          umur_range: `${phase.umur_mulai}-${phase.umur_selesai} tahun`,
          total_spks: metrics.summary?.total_spks || 0,
          total_executions: metrics.summary?.total_executions || 0,
          spks_selesai: metrics.summary?.spks_selesai || 0,
          completion_rate: metrics.summary?.completion_rate || 0
        };
      })
    );

    // Calculate summary
    const total_spks_all = phaseMetrics.reduce((sum, p) => sum + p.total_spks, 0);
    const total_executions_all = phaseMetrics.reduce((sum, p) => sum + p.total_executions, 0);
    const avg_completion = phaseMetrics.length > 0
      ? (phaseMetrics.reduce((sum, p) => sum + p.completion_rate, 0) / phaseMetrics.length).toFixed(2)
      : 0;

    // Calculate health index (based on completion rate and execution density)
    const execution_density = total_spks_all > 0 ? (total_executions_all / total_spks_all) : 0;
    const health_index = Math.min(100, (parseFloat(avg_completion) * 0.7) + (execution_density * 10));

    return {
      phases: phaseMetrics,
      summary: {
        total_phases: phases.length,
        total_spks_all: total_spks_all,
        total_executions_all: total_executions_all,
        avg_completion: parseFloat(avg_completion)
      },
      health_index: parseFloat(health_index.toFixed(2))
    };

  } catch (error) {
    console.error(`❌ [LIFECYCLE] Error in getLifecycleOverview:`, error);
    throw error;
  }
}

/**
 * FUNCTION 3: Get SOP Compliance by Phase
 * 
 * Output: {
 *   by_phase: [ { nama_fase, sop_count, spk_count, compliance_ratio } ],
 *   overall_compliance: percentage,
 *   non_compliant_phases: [ { nama_fase, issue } ]
 * }
 * 
 * Schema Reference:
 * - sop_tipe: id_tipe_sop, nama_tipe_sop, deskripsi
 * - sop_referensi: id_sop, id_tipe_sop, nama_sop, deskripsi
 */
async function getSOPComplianceByPhase() {
  try {
    console.log('🔍 [LIFECYCLE] Calculating SOP compliance by phase');

    // Get all SOP types
    const { data: sopTypes, error: sopError } = await supabase
      .from('sop_tipe')
      .select(`
        id_tipe_sop,
        nama_tipe_sop,
        deskripsi
      `);

    if (sopError) throw sopError;

    // Get SOP referensi count per type
    const { data: sopRefs, error: sopRefError } = await supabase
      .from('sop_referensi')
      .select('id_tipe_sop');

    if (sopRefError) throw sopRefError;

    // Map SOP counts
    const sopCountMap = {};
    (sopRefs || []).forEach(ref => {
      sopCountMap[ref.id_tipe_sop] = (sopCountMap[ref.id_tipe_sop] || 0) + 1;
    });

    // Get lifecycle overview for SPK counts
    const overview = await getLifecycleOverview();

    // Build compliance data
    const by_phase = (sopTypes || []).map(sop => {
      const phaseName = sop.nama_tipe_sop.replace('SOP ', ''); // e.g., "SOP Pembibitan" -> "Pembibitan"
      const phaseMetric = overview.phases.find(p => p.nama_fase === phaseName);
      
      const sop_count = sopCountMap[sop.id_tipe_sop] || 0;
      const spk_count = phaseMetric?.total_spks || 0;
      const compliance_ratio = sop_count > 0 ? (spk_count / sop_count).toFixed(2) : 0;

      return {
        nama_fase: phaseName,
        sop_count: sop_count,
        spk_count: spk_count,
        compliance_ratio: parseFloat(compliance_ratio),
        status: parseFloat(compliance_ratio) >= 0.8 ? 'COMPLIANT' : 'NEEDS_ATTENTION'
      };
    });

    // Calculate overall compliance
    const total_sop = by_phase.reduce((sum, p) => sum + p.sop_count, 0);
    const total_spk = by_phase.reduce((sum, p) => sum + p.spk_count, 0);
    const overall_compliance = total_sop > 0 ? ((total_spk / total_sop) * 100).toFixed(2) : 0;

    // Identify non-compliant phases
    const non_compliant_phases = by_phase
      .filter(p => p.status === 'NEEDS_ATTENTION')
      .map(p => ({
        nama_fase: p.nama_fase,
        issue: `Low SPK/SOP ratio (${p.compliance_ratio}). Expected >= 0.8`
      }));

    return {
      by_phase: by_phase,
      overall_compliance: parseFloat(overall_compliance),
      non_compliant_phases: non_compliant_phases
    };

  } catch (error) {
    console.error(`❌ [LIFECYCLE] Error in getSOPComplianceByPhase:`, error);
    throw error;
  }
}

/**
 * HELPER: Get ISO Week Number
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
}

module.exports = {
  getPhaseMetrics,
  getLifecycleOverview,
  getSOPComplianceByPhase
};
