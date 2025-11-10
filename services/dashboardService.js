/**
 * DASHBOARD SERVICE - KPI EKSEKUTIF
 * 
 * Sub-Proses 3: KONTROL & PENYEMPURNAAN
 * Filosofi TEPAT: Query SQL kompleks untuk menghasilkan data KPI/KRI yang akurat
 * Tuntunan Skalabilitas: Agregasi di database, bukan di aplikasi
 * 
 * Sesuai: Tugas 3.2 - Dashboard Tampilan 1 (Eksekutif)
 * API Endpoint: GET /api/v1/dashboard/kpi_eksekutif
 */

const { supabase } = require('../config/supabase');

/**
 * 1. KRI: Lead Time APH (Average Days from G1 Detection to APH Execution)
 * 
 * Logika:
 * - Cari log_aktivitas dengan status_aktual = 'G1 (Ganoderma Awal)'
 * - Cari log_aktivitas dengan tipe_aplikasi = 'APH' untuk pohon yang sama
 * - Hitung selisih waktu dalam hari
 * - Return rata-rata
 * 
 * Dummy Expected: 2.0 hari (Log #2 [Hari -8] → Log #4 [Hari -6])
 */
async function calculateKriLeadTimeAph() {
  try {
    // Step 1: Get all G1 detections
    const { data: g1Logs, error: g1Error } = await supabase
      .from('log_aktivitas_5w1h')
      .select('id_npokok, timestamp_eksekusi, hasil_json');
    
    if (g1Error) throw g1Error;
    
    if (!g1Logs || g1Logs.length === 0) {
      console.log('⚠️  No logs found in log_aktivitas_5w1h');
      return 0;
    }
    
    // Filter G1 detections
    const g1Detections = g1Logs.filter(log => {
      try {
        const hasil = typeof log.hasil_json === 'string' 
          ? JSON.parse(log.hasil_json) 
          : log.hasil_json;
        return hasil?.status_aktual === 'G1 (Ganoderma Awal)';
      } catch {
        return false;
      }
    });
    
    // Filter APH executions
    const aphExecutions = g1Logs.filter(log => {
      try {
        const hasil = typeof log.hasil_json === 'string' 
          ? JSON.parse(log.hasil_json) 
          : log.hasil_json;
        return hasil?.tipe_aplikasi === 'APH';
      } catch {
        return false;
      }
    });
    
    if (g1Detections.length === 0 || aphExecutions.length === 0) {
      console.log(`⚠️  Found ${g1Detections.length} G1 detections and ${aphExecutions.length} APH executions`);
      return 0;
    }
    
    // Calculate lead times
    const leadTimes = [];
    g1Detections.forEach(g1 => {
      const matchingAph = aphExecutions.find(aph => 
        aph.id_npokok === g1.id_npokok &&
        new Date(aph.timestamp_eksekusi) > new Date(g1.timestamp_eksekusi)
      );
      
      if (matchingAph) {
        const diffMs = new Date(matchingAph.timestamp_eksekusi) - new Date(g1.timestamp_eksekusi);
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        leadTimes.push(diffDays);
      }
    });
    
    if (leadTimes.length === 0) return 0;
    
    const avgLeadTime = leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length;
    return parseFloat(avgLeadTime.toFixed(1));
    
  } catch (err) {
    console.error('❌ Error calculating KRI Lead Time APH:', err.message);
    return 0;
  }
}

/**
 * 2. KRI: Kepatuhan SOP (% SPK Selesai Tepat Waktu)
 * 
 * Logika:
 * - Count spk_tugas dengan status 'SELESAI'
 * - Count TOTAL spk_tugas (SEMUA status: BARU, DIKERJAKAN, SELESAI)
 * - Return persentase
 * 
 * Formula: (Jumlah SELESAI / Total SEMUA) × 100
 * 
 * Real Data Expected: 60.0% (3 Selesai / 5 Total)
 */
async function calculateKriKepatuhanSop() {
  try {
    console.log('🔍 [DEBUG] Calculating Kepatuhan SOP...');
    
    const { data, error } = await supabase
      .from('spk_tugas')
      .select('status_tugas');
    
    console.log('🔍 [DEBUG] Query result:', { 
      dataLength: data?.length, 
      error: error?.message,
      sample: data?.[0]
    });
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log('⚠️  No tasks found in spk_tugas');
      return 0;
    }
    
    // Debug: tampilkan semua status
    const statusCounts = {};
    data.forEach(task => {
      const status = task.status_tugas;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    console.log('🔍 [DEBUG] Status distribution:', statusCounts);
    
    // Count tasks yang SELESAI (TRIM whitespace!)
    const completedTasks = data.filter(task => 
      task.status_tugas && task.status_tugas.trim() === 'SELESAI'
    ).length;
    
    // Total SEMUA tasks (tidak filter apapun)
    const totalTasks = data.length;
    
    if (totalTasks === 0) return 0;
    
    console.log(`✅ Kepatuhan SOP: ${completedTasks} SELESAI / ${totalTasks} TOTAL`);
    
    // Return persentase dengan 1 desimal
    const percentage = parseFloat(((completedTasks / totalTasks) * 100).toFixed(1));
    console.log(`✅ Result: ${percentage}%`);
    
    return percentage;
    
  } catch (err) {
    console.error('❌ Error calculating KRI Kepatuhan SOP:', err.message);
    return 0;
  }
}

/**
 * 3. KPI: Tren Insidensi Baru G1 (Per Hari - 30 Hari Terakhir)
 * 
 * Logika:
 * - Group by DATE(timestamp_eksekusi) untuk 30 hari terakhir
 * - Count log_aktivitas dengan status_aktual = 'G1 (Ganoderma Awal)'
 * - Return array [{date, count}]
 * 
 * Dummy Expected: [{date: 'Hari -8', count: 1}, ...]
 */
async function calculateTrenInsidensiG1() {
  try {
    const { data, error } = await supabase
      .from('log_aktivitas_5w1h')
      .select('timestamp_eksekusi, hasil_json')
      .gte('timestamp_eksekusi', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp_eksekusi', { ascending: true });
    
    if (error) throw error;
    
    if (!data || data.length === 0) return [];
    
    // Filter hanya G1 dan group by date
    const g1Logs = data.filter(log => {
      try {
        const hasil = typeof log.hasil_json === 'string' 
          ? JSON.parse(log.hasil_json) 
          : log.hasil_json;
        return hasil?.status_aktual === 'G1 (Ganoderma Awal)';
      } catch {
        return false;
      }
    });
    
    // Group by date
    const trendMap = {};
    g1Logs.forEach(log => {
      const date = new Date(log.timestamp_eksekusi).toISOString().split('T')[0];
      trendMap[date] = (trendMap[date] || 0) + 1;
    });
    
    // Convert to array format
    return Object.entries(trendMap).map(([date, count]) => ({
      date,
      count
    }));
    
  } catch (err) {
    console.error('❌ Error calculating Tren Insidensi G1:', err.message);
    return [];
  }
}

/**
 * 4. KPI: G4 Aktif (Belum Disanitasi)
 * 
 * Logika:
 * - Count spk_tugas dengan tipe_tugas = 'SANITASI'
 * - Dan status_tugas = 'BARU' OR 'DIKERJAKAN'
 * 
 * Real Data Expected: 2 (berdasarkan verification query)
 */
async function calculateG4Aktif() {
  try {
    // Ambil semua tugas dulu untuk debug
    const { data: allTasks, error: allError } = await supabase
      .from('spk_tugas')
      .select('id_tugas, tipe_tugas, status_tugas');
    
    if (allError) throw allError;
    
    console.log(`📊 Total SPK Tugas: ${allTasks?.length || 0}`);
    
    // Filter di JavaScript untuk lebih flexible (TRIM whitespace!)
    const sanitasiTasks = allTasks?.filter(task => {
      const tipeMatch = task.tipe_tugas?.trim().toUpperCase().includes('SANITASI');
      const statusTrimmed = task.status_tugas?.trim().toUpperCase();
      const statusMatch = statusTrimmed === 'BARU' || statusTrimmed === 'DIKERJAKAN';
      return tipeMatch && statusMatch;
    }) || [];
    
    console.log(`🔍 Sanitasi Tasks Found: ${sanitasiTasks.length}`);
    if (sanitasiTasks.length > 0) {
      console.log('   Sample:', JSON.stringify(sanitasiTasks[0]));
    }
    
    return sanitasiTasks.length;
    
  } catch (err) {
    console.error('❌ Error calculating G4 Aktif:', err.message);
    return 0;
  }
}

/**
 * 5. ENHANCEMENT: Tren Kepatuhan SOP (Time Series - 8 Weeks)
 * 
 * Logika:
 * - Query spk_tugas dengan GROUP BY week
 * - Calculate completion rate per week: (SELESAI / TOTAL) * 100
 * - Return array of {periode, nilai} for last 8 weeks
 * 
 * Expected Output:
 * [
 *   {periode: "Week 1", nilai: 15.0},
 *   {periode: "Week 2", nilai: 18.5},
 *   ...
 * ]
 */
async function calculateTrenKepatuhanSop() {
  try {
    console.log('🔍 [ENHANCEMENT] Calculating Tren Kepatuhan SOP...');
    
    // Query all tasks from last 8 weeks
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - (8 * 7));
    
    const { data, error } = await supabase
      .from('spk_tugas')
      .select('created_at, status_tugas')
      .gte('created_at', eightWeeksAgo.toISOString())
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log('⚠️  No tasks found in last 8 weeks for trend analysis');
      // Return current week only
      const currentCompliance = await calculateKriKepatuhanSop();
      return [{ periode: 'Week 1', nilai: currentCompliance }];
    }
    
    // Group by week
    const weeklyData = {};
    
    data.forEach(task => {
      const taskDate = new Date(task.created_at);
      // Calculate week number (ISO week)
      const weekStart = new Date(taskDate);
      weekStart.setDate(taskDate.getDate() - taskDate.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = { total: 0, selesai: 0 };
      }
      
      weeklyData[weekKey].total += 1;
      
      const statusTrimmed = task.status_tugas?.trim().toUpperCase() || '';
      if (statusTrimmed === 'SELESAI') {
        weeklyData[weekKey].selesai += 1;
      }
    });
    
    // Convert to array and calculate percentages
    const weeklyArray = Object.entries(weeklyData)
      .map(([weekKey, stats]) => ({
        weekKey,
        nilai: stats.total > 0 
          ? parseFloat(((stats.selesai / stats.total) * 100).toFixed(1))
          : 0
      }))
      .sort((a, b) => new Date(a.weekKey) - new Date(b.weekKey)); // Sort chronologically
    
    // Format with period labels (Week 1, Week 2, etc.)
    const trendResult = weeklyArray.map((item, index) => ({
      periode: `Week ${index + 1}`,
      nilai: item.nilai
    }));
    
    console.log(`✅ Tren Kepatuhan SOP: ${trendResult.length} weeks`);
    console.log('   Sample:', trendResult.slice(0, 3));
    
    return trendResult;
    
  } catch (err) {
    console.error('❌ Error calculating Tren Kepatuhan SOP:', err.message);
    // Fallback: return current compliance only
    const currentCompliance = await calculateKriKepatuhanSop();
    return [{ periode: 'Week 1', nilai: currentCompliance }];
  }
}

/**
 * 6. ENHANCEMENT: Planning Accuracy (Historical Metrics)
 * 
 * Logika:
 * - Compare last month vs current month task completion
 * - Calculate accuracy percentage: (actual / target) * 100
 * - Project final accuracy based on daily velocity
 * 
 * Expected Output:
 * {
 *   last_month: { target_completion: 85, actual_completion: 72, accuracy_percentage: 84.7 },
 *   current_month: { target_completion: 20, actual_completion: 7, accuracy_percentage: 35.0, projected_final_accuracy: 42.5 }
 * }
 */
async function calculatePlanningAccuracy() {
  try {
    console.log('🔍 [ENHANCEMENT] Calculating Planning Accuracy...');
    
    const now = new Date();
    
    // Last month date range
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    
    // Current month date range
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    // Query last month tasks
    const { data: lastMonthTasks, error: lastMonthError } = await supabase
      .from('spk_tugas')
      .select('status_tugas')
      .gte('created_at', lastMonthStart.toISOString())
      .lte('created_at', lastMonthEnd.toISOString());
    
    if (lastMonthError) throw lastMonthError;
    
    // Query current month tasks
    const { data: currentMonthTasks, error: currentMonthError } = await supabase
      .from('spk_tugas')
      .select('status_tugas, created_at')
      .gte('created_at', currentMonthStart.toISOString())
      .lte('created_at', currentMonthEnd.toISOString());
    
    if (currentMonthError) throw currentMonthError;
    
    // Calculate last month stats
    const lastMonthTotal = lastMonthTasks?.length || 0;
    const lastMonthCompleted = lastMonthTasks?.filter(t => 
      t.status_tugas?.trim().toUpperCase() === 'SELESAI'
    ).length || 0;
    const lastMonthAccuracy = lastMonthTotal > 0 
      ? parseFloat(((lastMonthCompleted / lastMonthTotal) * 100).toFixed(1))
      : 0;
    
    // Calculate current month stats
    const currentMonthTotal = currentMonthTasks?.length || 0;
    const currentMonthCompleted = currentMonthTasks?.filter(t => 
      t.status_tugas?.trim().toUpperCase() === 'SELESAI'
    ).length || 0;
    const currentMonthAccuracy = currentMonthTotal > 0 
      ? parseFloat(((currentMonthCompleted / currentMonthTotal) * 100).toFixed(1))
      : 0;
    
    // Calculate projected final accuracy (simple linear projection)
    const daysInMonth = currentMonthEnd.getDate();
    const currentDay = now.getDate();
    const remainingDays = daysInMonth - currentDay;
    
    let projectedFinalAccuracy = currentMonthAccuracy;
    
    if (currentDay > 0 && currentMonthTotal > 0) {
      // Daily completion rate
      const dailyCompletionRate = currentMonthCompleted / currentDay;
      // Projected total completions by end of month
      const projectedCompletions = currentMonthCompleted + (dailyCompletionRate * remainingDays);
      projectedFinalAccuracy = parseFloat(((projectedCompletions / currentMonthTotal) * 100).toFixed(1));
      
      // Cap at 100%
      if (projectedFinalAccuracy > 100) projectedFinalAccuracy = 100.0;
    }
    
    const result = {
      last_month: {
        target_completion: lastMonthTotal,
        actual_completion: lastMonthCompleted,
        accuracy_percentage: lastMonthAccuracy
      },
      current_month: {
        target_completion: currentMonthTotal,
        actual_completion: currentMonthCompleted,
        accuracy_percentage: currentMonthAccuracy,
        projected_final_accuracy: projectedFinalAccuracy
      }
    };
    
    console.log('✅ Planning Accuracy:', result);
    
    return result;
    
  } catch (err) {
    console.error('❌ Error calculating Planning Accuracy:', err.message);
    return {
      last_month: {
        target_completion: 0,
        actual_completion: 0,
        accuracy_percentage: 0.0
      },
      current_month: {
        target_completion: 0,
        actual_completion: 0,
        accuracy_percentage: 0.0,
        projected_final_accuracy: 0.0
      }
    };
  }
}

/**
 * MAIN SERVICE FUNCTION: Get All KPI Eksekutif
 * 
 * Menggabungkan semua KPI/KRI dalam satu response
 * Sesuai kontrak API: GET /api/v1/dashboard/kpi_eksekutif
 * 
 * ENHANCED with:
 * - tren_kepatuhan_sop (time series, 8 weeks)
 * - planning_accuracy (last month vs current month)
 */
async function getKpiEksekutif(filters = {}) {
  try {
    // Prinsip SKALABILITAS: Run queries in parallel
    const [
      kriLeadTimeAph,
      kriKepatuhanSop,
      trenInsidensiG1,
      trenG4Aktif,
      trenKepatuhanSop,
      planningAccuracy
    ] = await Promise.all([
      calculateKriLeadTimeAph(),
      calculateKriKepatuhanSop(),
      calculateTrenInsidensiG1(),
      calculateG4Aktif(),
      calculateTrenKepatuhanSop(),
      calculatePlanningAccuracy()
    ]);
    
    // Struktur response sesuai kontrak API
    return {
      // EXISTING FIELDS (backward compatible)
      kri_lead_time_aph: kriLeadTimeAph,
      kri_kepatuhan_sop: kriKepatuhanSop,
      tren_insidensi_baru: trenInsidensiG1,
      tren_g4_aktif: trenG4Aktif,
      
      // ⭐ NEW ENHANCEMENT FIELDS
      tren_kepatuhan_sop: trenKepatuhanSop,
      planning_accuracy: planningAccuracy,
      
      // Metadata untuk debugging (5W1H - When)
      generated_at: new Date().toISOString(),
      // Filters yang digunakan (untuk future enhancement)
      filters: filters
    };
    
  } catch (err) {
    console.error('❌ Error in getKpiEksekutif:', err.message);
    throw new Error('Gagal mengambil data KPI Eksekutif: ' + err.message);
  }
}

module.exports = {
  getKpiEksekutif,
  // Export individual functions untuk testing
  calculateKriLeadTimeAph,
  calculateKriKepatuhanSop,
  calculateTrenInsidensiG1,
  calculateG4Aktif,
  // Export enhancement functions
  calculateTrenKepatuhanSop,
  calculatePlanningAccuracy
};
