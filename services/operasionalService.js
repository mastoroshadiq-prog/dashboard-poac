/**
 * OPERATIONAL SERVICE - DASHBOARD OPERASIONAL
 * 
 * Sub-Proses 3: KONTROL & PENYEMPURNAAN
 * Filosofi TEPAT: Query SQL untuk menghasilkan data operasional real-time
 * Tuntunan Skalabilitas: Agregasi di database dengan GROUP BY
 * 
 * Sesuai: Tugas 3.1 - Dashboard Tampilan 2 (Operasional)
 * API Endpoint: GET /api/v1/dashboard/operasional
 * 
 * Features:
 * - M-2.1: Corong Alur Kerja (Funnel Chart)
 * - M-2.2: Papan Peringkat Tim (Leaderboard)
 */

const { supabase } = require('../config/supabase');

/**
 * FITUR M-2.1: CORONG ALUR KERJA (Funnel Chart)
 * 
 * Logika:
 * - Hitung jumlah spk_tugas berdasarkan tipe_tugas dan status_tugas
 * - Tipe: VALIDASI_DRONE, APH, SANITASI
 * - Status: BARU/DIKERJAKAN (target), SELESAI (actual)
 * 
 * Dummy Expected (dari dummy_data_v1_2.sql):
 * {
 *   target_validasi: 2,    // VALIDASI_DRONE total
 *   validasi_selesai: 2,   // VALIDASI_DRONE SELESAI
 *   target_aph: 1,         // APH total
 *   aph_selesai: 1,        // APH SELESAI
 *   target_sanitasi: 2,    // SANITASI total
 *   sanitasi_selesai: 1    // SANITASI SELESAI
 * }
 */
async function calculateDataCorong() {
  try {
    console.log('🔍 [DEBUG] Calculating Data Corong (Funnel)...');
    
    // Query semua tasks dengan select minimal (optimasi)
    const { data, error } = await supabase
      .from('spk_tugas')
      .select('tipe_tugas, status_tugas');
    
    if (error) throw error;
    
    console.log(`📊 Total Tasks: ${data?.length || 0}`);
    
    if (!data || data.length === 0) {
      return {
        target_validasi: 0,
        validasi_selesai: 0,
        target_aph: 0,
        aph_selesai: 0,
        target_sanitasi: 0,
        sanitasi_selesai: 0
      };
    }
    
    // Sanitize data (trim whitespace dari database)
    const cleanData = data.map(task => ({
      tipe: task.tipe_tugas?.trim().toUpperCase() || '',
      status: task.status_tugas?.trim().toUpperCase() || ''
    }));
    
    // Count VALIDASI_DRONE
    const validasiTasks = cleanData.filter(t => 
      t.tipe.includes('VALIDASI') || t.tipe.includes('DRONE')
    );
    const targetValidasi = validasiTasks.length;
    const validasiSelesai = validasiTasks.filter(t => t.status === 'SELESAI').length;
    
    // Count APH
    const aphTasks = cleanData.filter(t => t.tipe === 'APH');
    const targetAph = aphTasks.length;
    const aphSelesai = aphTasks.filter(t => t.status === 'SELESAI').length;
    
    // Count SANITASI
    const sanitasiTasks = cleanData.filter(t => t.tipe.includes('SANITASI'));
    const targetSanitasi = sanitasiTasks.length;
    const sanitasiSelesai = sanitasiTasks.filter(t => t.status === 'SELESAI').length;
    
    const result = {
      target_validasi: targetValidasi,
      validasi_selesai: validasiSelesai,
      target_aph: targetAph,
      aph_selesai: aphSelesai,
      target_sanitasi: targetSanitasi,
      sanitasi_selesai: sanitasiSelesai
    };
    
    console.log('✅ Data Corong:', result);
    return result;
    
  } catch (err) {
    console.error('❌ Error calculating Data Corong:', err.message);
    throw err;
  }
}

/**
 * FITUR M-2.2: PAPAN PERINGKAT TIM (Leaderboard)
 * 
 * Logika:
 * - GROUP BY id_pelaksana
 * - COUNT(*) sebagai total tugas
 * - COUNT(CASE WHEN status = 'SELESAI' THEN 1 END) sebagai selesai
 * - Calculate completion rate: (selesai / total) * 100
 * - ORDER BY rate DESC (tertinggi di atas)
 * 
 * Dummy Expected (dari dummy_data_v1_2.sql):
 * [
 *   { id_pelaksana: 'uuid-mandor-agus', selesai: 2, total: 2, rate: 100.0 },
 *   { id_pelaksana: 'uuid-mandor-eko', selesai: 1, total: 1, rate: 100.0 },
 *   { id_pelaksana: 'uuid-tim-sanitasi-a', selesai: 1, total: 2, rate: 50.0 }
 * ]
 */
async function calculatePapanPeringkat() {
  try {
    console.log('🔍 [DEBUG] Calculating Papan Peringkat (Leaderboard)...');
    
    // Query semua tasks dengan id_pelaksana dan status
    const { data, error } = await supabase
      .from('spk_tugas')
      .select('id_pelaksana, status_tugas');
    
    if (error) throw error;
    
    console.log(`📊 Total Tasks for Leaderboard: ${data?.length || 0}`);
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Group by id_pelaksana (manual aggregation di JavaScript)
    const pelaksanaMap = {};
    
    data.forEach(task => {
      const pelaksana = task.id_pelaksana;
      const statusTrimmed = task.status_tugas?.trim().toUpperCase() || '';
      
      if (!pelaksana) return; // Skip jika null
      
      if (!pelaksanaMap[pelaksana]) {
        pelaksanaMap[pelaksana] = {
          id_pelaksana: pelaksana,
          total: 0,
          selesai: 0
        };
      }
      
      pelaksanaMap[pelaksana].total += 1;
      
      if (statusTrimmed === 'SELESAI') {
        pelaksanaMap[pelaksana].selesai += 1;
      }
    });
    
    // Convert map to array dan calculate rate
    const leaderboard = Object.values(pelaksanaMap).map(item => ({
      id_pelaksana: item.id_pelaksana,
      selesai: item.selesai,
      total: item.total,
      rate: item.total > 0 
        ? parseFloat(((item.selesai / item.total) * 100).toFixed(1))
        : 0
    }));
    
    // Sort by rate DESC (tertinggi di atas)
    leaderboard.sort((a, b) => b.rate - a.rate);
    
    console.log(`✅ Papan Peringkat: ${leaderboard.length} pelaksana`);
    console.log('   Top 3:', leaderboard.slice(0, 3));
    
    return leaderboard;
    
  } catch (err) {
    console.error('❌ Error calculating Papan Peringkat:', err.message);
    throw err;
  }
}

/**
 * MAIN SERVICE FUNCTION: Get Dashboard Operasional
 * 
 * Menggabungkan semua data operasional dalam satu response
 * Sesuai kontrak API: GET /api/v1/dashboard/operasional
 * 
 * @param {Object} filters - Optional filters (divisi, tanggal, dll)
 * @returns {Object} Dashboard operasional data
 */
async function getDashboardOperasional(filters = {}) {
  try {
    console.log('🚀 [START] Get Dashboard Operasional', { filters });
    
    // Prinsip SKALABILITAS: Run queries in parallel
    const [dataCorong, dataPapanPeringkat] = await Promise.all([
      calculateDataCorong(),
      calculatePapanPeringkat()
    ]);
    
    // Struktur response sesuai kontrak API
    return {
      data_corong: dataCorong,
      data_papan_peringkat: dataPapanPeringkat,
      // Metadata untuk debugging (5W1H - When)
      generated_at: new Date().toISOString(),
      filters: filters
    };
    
  } catch (err) {
    console.error('❌ Error in getDashboardOperasional:', err.message);
    throw err;
  }
}

// Export functions
module.exports = {
  getDashboardOperasional,
  calculateDataCorong,
  calculatePapanPeringkat
};
