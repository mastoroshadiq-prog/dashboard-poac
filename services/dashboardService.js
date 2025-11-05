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
 * MAIN SERVICE FUNCTION: Get All KPI Eksekutif
 * 
 * Menggabungkan semua KPI/KRI dalam satu response
 * Sesuai kontrak API: GET /api/v1/dashboard/kpi_eksekutif
 */
async function getKpiEksekutif(filters = {}) {
  try {
    // Prinsip SKALABILITAS: Run queries in parallel
    const [
      kriLeadTimeAph,
      kriKepatuhanSop,
      trenInsidensiG1,
      trenG4Aktif
    ] = await Promise.all([
      calculateKriLeadTimeAph(),
      calculateKriKepatuhanSop(),
      calculateTrenInsidensiG1(),
      calculateG4Aktif()
    ]);
    
    // Struktur response sesuai kontrak API
    return {
      kri_lead_time_aph: kriLeadTimeAph,
      kri_kepatuhan_sop: kriKepatuhanSop,
      tren_insidensi_baru: trenInsidensiG1,
      tren_g4_aktif: trenG4Aktif,
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
  calculateG4Aktif
};
