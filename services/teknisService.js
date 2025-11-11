/**
 * TECHNICAL SERVICE - DASHBOARD TEKNIS
 * 
 * Sub-Proses 3: KONTROL & PENYEMPURNAAN
 * Filosofi PENINGKATAN BERTAHAP: Matriks Kebingungan untuk evaluasi akurasi Drone
 * Tuntunan Akuntabilitas: Jejak Digital 5W1H untuk trace back ke sumber data
 * 
 * Sesuai: Tugas 3.3 - Dashboard Tampilan 3 (Teknis)
 * API Endpoint: GET /api/v1/dashboard/teknis
 * 
 * Features:
 * - M-3.1: Matriks Kebingungan (Confusion Matrix)
 * - M-3.2: Distribusi NDRE
 */

const { supabase } = require('../config/supabase');
const lifecycleService = require('./lifecycleService');

/**
 * FITUR M-3.1: MATRIKS KEBINGUNGAN (Confusion Matrix)
 * 
 * Tujuan: Mengevaluasi akurasi prediksi Drone vs Validasi Lapangan
 * 
 * Logika Confusion Matrix:
 * - Positive Class: Pohon sakit (G1, G2, G3, G4)
 * - Negative Class: Pohon sehat (G0)
 * 
 * - TRUE POSITIVE (TP): Drone predict POSITIVE (Kuning/Merah) AND Actual POSITIVE (G1-G4)
 * - FALSE POSITIVE (FP): Drone predict POSITIVE (Kuning/Merah) BUT Actual NEGATIVE (G0)
 * - FALSE NEGATIVE (FN): Drone predict NEGATIVE (Hijau) BUT Actual POSITIVE (G1-G4)
 * - TRUE NEGATIVE (TN): Drone predict NEGATIVE (Hijau) AND Actual NEGATIVE (G0)
 * 
 * Asumsi Mapping (dari context):
 * - Drone "Hijau" = Predict G0 (Sehat)
 * - Drone "Kuning" = Predict G1-G3 (Sakit Ringan-Sedang)
 * - Drone "Merah" = Predict G4 (Mati)
 * 
 * Expected Output (dari dummy_data_v1_2.sql):
 * {
 *   true_positive: 1,   // Log dengan Drone Kuning + Actual G1
 *   false_positive: 1,  // Log dengan Drone Kuning + Actual G0
 *   false_negative: 0,  // No logs dengan Drone Hijau + Actual G1-G4
 *   true_negative: 0    // No logs dengan Drone Hijau + Actual G0
 * }
 */
async function calculateMatriksKebingungan() {
  try {
    console.log('🔍 [DEBUG] Calculating Matriks Kebingungan (Confusion Matrix)...');
    
    // FIXED: Query without JOIN to avoid Supabase relationship cache issues
    // Step 1: Get all logs
    const { data: logs, error: logsError } = await supabase
      .from('log_aktivitas_5w1h')
      .select('id_log, hasil_json, id_tugas');
    
    if (logsError) throw logsError;
    
    // Step 2: Get all spk_tugas
    const tugasIds = [...new Set(logs.map(log => log.id_tugas))];
    const { data: tugasList, error: tugasError } = await supabase
      .from('spk_tugas')
      .select('id_tugas, tipe_tugas')
      .in('id_tugas', tugasIds);
    
    if (tugasError) throw tugasError;
    
    // Step 3: Create map for quick lookup
    const tugasMap = {};
    tugasList.forEach(tugas => {
      tugasMap[tugas.id_tugas] = tugas;
    });
    
    // Step 4: Combine data
    const data = logs.map(log => ({
      id_log: log.id_log,
      hasil_json: log.hasil_json,
      spk_tugas: tugasMap[log.id_tugas] || null
    }));
    
    console.log(`📊 Total Logs: ${data?.length || 0}`);
    
    if (!data || data.length === 0) {
      return {
        true_positive: 0,
        false_positive: 0,
        false_negative: 0,
        true_negative: 0
      };
    }
    
    // Filter hanya VALIDASI logs
    const validasiLogs = data.filter(log => {
      const tipe = log.spk_tugas?.tipe_tugas?.trim().toUpperCase() || '';
      return tipe.includes('VALIDASI') || tipe.includes('DRONE');
    });
    
    console.log(`🔍 Validation Logs Found: ${validasiLogs.length}`);
    
    let tp = 0, fp = 0, fn = 0, tn = 0;
    
    validasiLogs.forEach(log => {
      try {
        // Parse hasil_json (bisa string atau object)
        let hasilData;
        if (typeof log.hasil_json === 'string') {
          hasilData = JSON.parse(log.hasil_json);
        } else {
          hasilData = log.hasil_json;
        }
        
        // DEBUG: show raw hasil_json when status_drone missing
        const rawStatusDrone = (hasilData?.status_drone || hasilData?.statusDrone || hasilData?.drone_status || '');
        if (!rawStatusDrone) {
          console.log(`   ℹ️  Raw hasil_json for log ${log.id_log}:`, JSON.stringify(hasilData));
        }
        
        // Extract status_drone and support multiple possible field names
        // CRITICAL: Database uses index_gano (0-4), not status_drone text!
        // Mapping: 0=Hijau(Sehat), 1-3=Kuning(Sakit), 4=Merah(Mati)
        let statusDrone = '';
        
        if (hasilData?.index_gano !== undefined && hasilData?.index_gano !== null) {
          const indexGano = parseInt(hasilData.index_gano);
          if (indexGano === 0) {
            statusDrone = 'HIJAU'; // Predict Sehat (Negative)
          } else if (indexGano >= 1 && indexGano <= 3) {
            statusDrone = 'KUNING'; // Predict Sakit G1-G3 (Positive)
          } else if (indexGano === 4) {
            statusDrone = 'MERAH'; // Predict Mati G4 (Positive)
          }
        } else {
          // Fallback: check text fields (for future data)
          const statusDroneRaw = hasilData?.status_drone || hasilData?.statusDrone || hasilData?.drone_status || hasilData?.prediksi || hasilData?.prediksi_label || hasilData?.label || (hasilData?.classification && hasilData.classification.label) || hasilData?.ndre_class || '';
          statusDrone = (statusDroneRaw || '').toString().trim().toUpperCase();
        }

        // Extract status_aktual with multiple fallbacks
        const statusAktualRaw = hasilData?.status_aktual || hasilData?.statusAktual || hasilData?.actual_status || hasilData?.label_actual || hasilData?.status || '';
        const statusAktual = (statusAktualRaw || '').toString().trim().toUpperCase();        // Determine if Actual is Positive (G1-G4) or Negative (G0)
        const actualPositive = statusAktual.includes('G1') || 
                               statusAktual.includes('G2') || 
                               statusAktual.includes('G3') || 
                               statusAktual.includes('G4');
        const actualNegative = statusAktual.includes('G0') || statusAktual.includes('SEHAT');
        
        // Determine if Drone Predicted Positive (Kuning/Merah) or Negative (Hijau)
        const dronePositive = statusDrone.includes('KUNING') || statusDrone.includes('MERAH');
        const droneNegative = statusDrone.includes('HIJAU');
        
        // Calculate confusion matrix cells
        if (dronePositive && actualPositive) {
          tp++;
          console.log(`   ✅ TP: Drone=${statusDrone}, Actual=${statusAktual}`);
        } else if (dronePositive && actualNegative) {
          fp++;
          console.log(`   ⚠️  FP: Drone=${statusDrone}, Actual=${statusAktual}`);
        } else if (droneNegative && actualPositive) {
          fn++;
          console.log(`   ❌ FN: Drone=${statusDrone}, Actual=${statusAktual}`);
        } else if (droneNegative && actualNegative) {
          tn++;
          console.log(`   ✅ TN: Drone=${statusDrone}, Actual=${statusAktual}`);
        } else {
          console.log(`   ⚠️  UNCLASSIFIED: Drone=${statusDrone}, Actual=${statusAktual}`);
        }
        
      } catch (parseErr) {
        console.error(`   ❌ Failed to parse hasil_json for log ${log.id_log}:`, parseErr.message);
      }
    });
    
    const result = {
      true_positive: tp,
      false_positive: fp,
      false_negative: fn,
      true_negative: tn
    };
    
    console.log('✅ Confusion Matrix:', result);
    
    // Calculate metrics (for reference)
    const total = tp + fp + fn + tn;
    if (total > 0) {
      const accuracy = ((tp + tn) / total * 100).toFixed(1);
      const precision = tp + fp > 0 ? (tp / (tp + fp) * 100).toFixed(1) : 0;
      const recall = tp + fn > 0 ? (tp / (tp + fn) * 100).toFixed(1) : 0;
      console.log(`   📈 Metrics: Accuracy=${accuracy}%, Precision=${precision}%, Recall=${recall}%`);
    }
    
    return result;
    
  } catch (err) {
    console.error('❌ Error calculating Matriks Kebingungan:', err.message);
    throw err;
  }
}

/**
 * FITUR M-3.2: DISTRIBUSI NDRE (Status Health Distribution)
 * 
 * Tujuan: Visualisasi distribusi status kesehatan pohon dari validasi lapangan
 * 
 * Logika:
 * - Query log_aktivitas_5w1h dengan tipe VALIDASI_DRONE
 * - Extract status_aktual dari hasil_json
 * - GROUP BY status_aktual dan COUNT(*)
 * 
 * Expected Output (dari dummy_data_v1_2.sql):
 * [
 *   { status_aktual: "G0 (Sehat)", jumlah: 1 },
 *   { status_aktual: "G1 (Ganoderma Awal)", jumlah: 1 },
 *   { status_aktual: "G3 (Berat)", jumlah: 1 },
 *   { status_aktual: "G4 (Mati)", jumlah: 2 }
 * ]
 */
async function calculateDistribusiNdre() {
  try {
    console.log('🔍 [DEBUG] Calculating Distribusi NDRE (Health Status Distribution)...');
    
    // FIXED: Query without JOIN to avoid Supabase relationship cache issues
    // Step 1: Get all logs
    const { data: logs, error: logsError } = await supabase
      .from('log_aktivitas_5w1h')
      .select('id_log, hasil_json, id_tugas');
    
    if (logsError) throw logsError;
    
    // Step 2: Get all spk_tugas
    const tugasIds = [...new Set(logs.map(log => log.id_tugas))];
    const { data: tugasList, error: tugasError } = await supabase
      .from('spk_tugas')
      .select('id_tugas, tipe_tugas')
      .in('id_tugas', tugasIds);
    
    if (tugasError) throw tugasError;
    
    // Step 3: Create map for quick lookup
    const tugasMap = {};
    tugasList.forEach(tugas => {
      tugasMap[tugas.id_tugas] = tugas;
    });
    
    // Step 4: Combine data
    const data = logs.map(log => ({
      id_log: log.id_log,
      hasil_json: log.hasil_json,
      spk_tugas: tugasMap[log.id_tugas] || null
    }));
    
    console.log(`📊 Total Logs: ${data?.length || 0}`);
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Filter hanya VALIDASI logs
    const validasiLogs = data.filter(log => {
      const tipe = log.spk_tugas?.tipe_tugas?.trim().toUpperCase() || '';
      return tipe.includes('VALIDASI') || tipe.includes('DRONE');
    });
    
    console.log(`🔍 Validation Logs Found: ${validasiLogs.length}`);
    
    // Manual GROUP BY status_aktual
    const statusMap = {};
    
    validasiLogs.forEach(log => {
      try {
        // Parse hasil_json
        let hasilData;
        if (typeof log.hasil_json === 'string') {
          hasilData = JSON.parse(log.hasil_json);
        } else {
          hasilData = log.hasil_json;
        }

        // DEBUG: print raw hasil_json for visibility (enable with DEBUG_TEKNIS=1)
        if (process.env.DEBUG_TEKNIS === '1') {
          console.log(`   ℹ️  [DEBUG_TEKNIS] raw hasil_json for log ${log.id_log}:`, JSON.stringify(hasilData));
        }

        const statusAktual = hasilData?.status_aktual?.trim() || 'Unknown';
        
        if (!statusMap[statusAktual]) {
          statusMap[statusAktual] = 0;
        }
        
        statusMap[statusAktual] += 1;
        
      } catch (parseErr) {
        console.error(`   ❌ Failed to parse hasil_json for log ${log.id_log}:`, parseErr.message);
      }
    });
    
    // Convert map to array
    const distribution = Object.entries(statusMap).map(([status, count]) => ({
      status_aktual: status,
      jumlah: count
    }));
    
    // Sort by status (G0, G1, G2, G3, G4)
    distribution.sort((a, b) => {
      const orderMap = { 'G0': 0, 'G1': 1, 'G2': 2, 'G3': 3, 'G4': 4 };
      const aOrder = orderMap[a.status_aktual.substring(0, 2)] ?? 99;
      const bOrder = orderMap[b.status_aktual.substring(0, 2)] ?? 99;
      return aOrder - bOrder;
    });
    
    console.log(`✅ Distribution: ${distribution.length} unique statuses`);
    console.log('   Data:', distribution);
    
    return distribution;
    
  } catch (err) {
    console.error('❌ Error calculating Distribusi NDRE:', err.message);
    throw err;
  }
}

/**
 * MAIN SERVICE FUNCTION: Get Dashboard Teknis
 * 
 * Menggabungkan semua data teknis dalam satu response
 * Sesuai kontrak API: GET /api/v1/dashboard/teknis
 * 
 * @param {Object} filters - Optional filters (umh, tanggal, dll)
 * @returns {Object} Dashboard teknis data
 */
async function getDashboardTeknis(filters = {}) {
  try {
    console.log('🚀 [START] Get Dashboard Teknis', { filters });
    
    // Prinsip SKALABILITAS: Run queries in parallel
    const [matriksKebingungan, distribusiNdre] = await Promise.all([
      calculateMatriksKebingungan(),
      calculateDistribusiNdre()
    ]);
    
    // Struktur response sesuai kontrak API
    return {
      data_matriks_kebingungan: matriksKebingungan,
      data_distribusi_ndre: distribusiNdre,
      // Metadata untuk debugging (5W1H - When)
      generated_at: new Date().toISOString(),
      filters: filters
    };
    
  } catch (err) {
    console.error('❌ Error in getDashboardTeknis:', err.message);
    throw err;
  }
}

/**
 * PLANTATION HEALTH INDEX BY PHASE (NEW - Phase 2)
 * 
 * Purpose: Add lifecycle health metrics to technical dashboard
 * Returns: Health index breakdown by lifecycle phase
 * 
 * Output:
 * {
 *   overall_health: 76,
 *   by_phase: [
 *     { nama_fase: 'Pembibitan', health_score: 100, status: 'EXCELLENT' },
 *     { nama_fase: 'TBM', health_score: 100, status: 'EXCELLENT' },
 *     ...
 *   ],
 *   critical_phases: ['Replanting']
 * }
 */
async function getPlantationHealthIndex() {
  try {
    console.log('🔍 [LIFECYCLE] Fetching plantation health index by phase...');
    
    // Get lifecycle overview
    const overview = await lifecycleService.getLifecycleOverview();
    
    // Calculate health score per phase
    const byPhase = overview.phases.map(p => {
      // Health score = completion rate (simple formula)
      const healthScore = p.completion_rate;
      
      let status = 'CRITICAL';
      if (healthScore >= 80) status = 'EXCELLENT';
      else if (healthScore >= 60) status = 'GOOD';
      else if (healthScore >= 40) status = 'FAIR';
      else if (healthScore > 0) status = 'POOR';
      
      return {
        nama_fase: p.nama_fase,
        health_score: healthScore,
        status: status,
        spks: p.total_spks,
        executions: p.total_executions
      };
    });
    
    // Identify critical phases (< 40%)
    const criticalPhases = byPhase
      .filter(p => p.health_score < 40)
      .map(p => p.nama_fase);
    
    const result = {
      overall_health: overview.health_index,
      by_phase: byPhase,
      critical_phases: criticalPhases,
      total_phases: overview.summary.total_phases
    };
    
    console.log('✅ Plantation health index generated');
    return result;
    
  } catch (error) {
    console.error('❌ Error in getPlantationHealthIndex:', error);
    return {
      overall_health: 0,
      by_phase: [],
      critical_phases: [],
      total_phases: 0
    };
  }
}

// Export functions
module.exports = {
  getDashboardTeknis,
  calculateMatriksKebingungan,
  calculateDistribusiNdre,
  // Export LIFECYCLE metrics (NEW - Phase 2)
  getPlantationHealthIndex
};
