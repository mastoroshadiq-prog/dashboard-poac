/**
 * SPK FROM ANOMALY SERVICE
 * ========================
 * Purpose: Create SPK automatically from detected anomalies
 * 
 * Features:
 * - Auto-categorize anomaly type to SPK type
 * - Create SPK with appropriate priority
 * - Assign to mandor
 * 
 * Author: Backend Team
 * Date: November 19, 2025
 */

const { supabase } = require('../config/supabase');

/**
 * Create SPK from Anomaly Detection Results
 * @param {Object} params - { anomaly_type, anomaly_ids, mandor_id, asisten_id, priority, notes }
 * @returns {Object} { success, spk, message }
 */
async function createSPKFromAnomaly(params) {
  try {
    const { anomaly_type, anomaly_ids, mandor_id, asisten_id, priority, notes } = params;

    console.log('🔧 [SPK Anomaly] Creating SPK from anomaly:', anomaly_type);

    // Validate required params
    if (!anomaly_type || !mandor_id || !asisten_id) {
      return {
        success: false,
        message: 'anomaly_type, mandor_id, dan asisten_id wajib diisi'
      };
    }

    // Map anomaly type to SPK type
    const anomalyToSPKMap = {
      'POHON_MIRING': {
        tipe_tugas: 'APH',
        nama_prefix: 'SPK APH - Pohon Miring',
        keterangan: 'Penanganan pohon miring untuk mencegah tumbang dan kerusakan lebih lanjut'
      },
      'POHON_MATI': {
        tipe_tugas: 'SANITASI',
        nama_prefix: 'SPK Sanitasi - Pohon Mati',
        keterangan: 'Sanitasi dan replanting pohon mati'
      },
      'NDRE_STRES_BERAT': {
        tipe_tugas: 'VALIDASI_DRONE',
        nama_prefix: 'SPK Validasi - NDRE Stres Berat',
        keterangan: 'Validasi lapangan untuk pohon dengan NDRE Stres Berat'
      },
      'GAMBUT_AMBLAS': {
        tipe_tugas: 'INFRASTRUCTURE',
        nama_prefix: 'SPK Infrastruktur - Gambut Amblas',
        keterangan: 'Perbaikan drainage dan sistem infrastruktur'
      },
      'SPACING_ISSUE': {
        tipe_tugas: 'SENSUS',
        nama_prefix: 'SPK Sensus - Spacing Issue',
        keterangan: 'Review dan koreksi jarak tanam'
      }
    };

    const spkConfig = anomalyToSPKMap[anomaly_type];

    if (!spkConfig) {
      return {
        success: false,
        message: `Tipe anomaly '${anomaly_type}' tidak dikenali`
      };
    }

    // Generate SPK number (simplified)
    const timestamp = Date.now().toString().slice(-6);
    const nomor_spk = `SPK-${anomaly_type.substring(0, 3)}-${timestamp}`;

    // Calculate deadline based on priority
    const deadlineDays = {
      'URGENT': 3,
      'HIGH': 7,
      'NORMAL': 14,
      'LOW': 21
    };
    
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + (deadlineDays[priority] || 14));

    // 1. Create SPK Header
    const { data: spkHeader, error: error1 } = await supabase
      .from('spk_header')
      .insert({
        nomor_spk: nomor_spk,
        nama_spk: `${spkConfig.nama_prefix} - ${new Date().toLocaleDateString('id-ID')}`,
        jenis_kegiatan: spkConfig.tipe_tugas,
        status_spk: 'BARU',
        prioritas: priority || 'NORMAL',
        tanggal_terbit: new Date().toISOString(),
        tanggal_target: deadline.toISOString(),
        id_asisten_pembuat: asisten_id,
        keterangan: notes || spkConfig.keterangan,
        metadata_json: JSON.stringify({
          created_from: 'ANOMALY_DETECTION',
          anomaly_type: anomaly_type,
          anomaly_ids: anomaly_ids || [],
          auto_generated: true,
          created_at: new Date().toISOString()
        })
      })
      .select()
      .single();

    if (error1) {
      console.error('❌ [SPK Anomaly] Error creating SPK header:', error1);
      return {
        success: false,
        message: 'Gagal membuat SPK header',
        error: error1.message
      };
    }

    console.log('✅ [SPK Anomaly] SPK header created:', spkHeader.id_spk);

    // 2. Create SPK Tugas (assigned to mandor)
    const { data: spkTugas, error: error2 } = await supabase
      .from('spk_tugas')
      .insert({
        id_spk: spkHeader.id_spk,
        id_pelaksana: mandor_id, // Assign to mandor
        tipe_tugas: spkConfig.tipe_tugas,
        status_tugas: 'PENDING',
        prioritas: priority === 'URGENT' ? 1 : priority === 'HIGH' ? 2 : 3,
        target_json: JSON.stringify({
          anomaly_type: anomaly_type,
          anomaly_count: anomaly_ids?.length || 0,
          created_from_analytics: true
        }),
        keterangan: `Auto-generated dari Anomaly Detection: ${anomaly_type}`
      })
      .select()
      .single();

    if (error2) {
      console.error('❌ [SPK Anomaly] Error creating SPK tugas:', error2);
      // Rollback: delete SPK header
      await supabase.from('spk_header').delete().eq('id_spk', spkHeader.id_spk);
      
      return {
        success: false,
        message: 'Gagal membuat SPK tugas',
        error: error2.message
      };
    }

    console.log('✅ [SPK Anomaly] SPK tugas created:', spkTugas.id_tugas);

    return {
      success: true,
      data: {
        spk: {
          id_spk: spkHeader.id_spk,
          nomor_spk: spkHeader.nomor_spk,
          nama_spk: spkHeader.nama_spk,
          jenis_kegiatan: spkHeader.jenis_kegiatan,
          status: spkHeader.status_spk,
          prioritas: spkHeader.prioritas,
          deadline: spkHeader.tanggal_target
        },
        tugas: {
          id_tugas: spkTugas.id_tugas,
          assigned_to_mandor: mandor_id,
          status: spkTugas.status_tugas
        }
      },
      message: 'SPK berhasil dibuat dari anomaly detection'
    };

  } catch (error) {
    console.error('❌ [SPK Anomaly] Create SPK error:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan sistem',
      error: error.message
    };
  }
}

/**
 * Bulk Create SPKs from Multiple Anomalies
 * @param {Array} anomalies - Array of { anomaly_type, anomaly_ids, mandor_id, priority }
 * @param {string} asisten_id - Asisten who creates SPKs
 * @returns {Object} { success, created_spks, failed_spks }
 */
async function bulkCreateSPKFromAnomalies(anomalies, asisten_id) {
  try {
    console.log('🔧 [SPK Anomaly] Bulk creating SPKs:', anomalies.length);

    const results = {
      created: [],
      failed: []
    };

    for (const anomaly of anomalies) {
      const result = await createSPKFromAnomaly({
        ...anomaly,
        asisten_id
      });

      if (result.success) {
        results.created.push(result.data);
      } else {
        results.failed.push({
          anomaly_type: anomaly.anomaly_type,
          error: result.message
        });
      }
    }

    return {
      success: true,
      data: results,
      message: `${results.created.length} SPK berhasil dibuat, ${results.failed.length} gagal`
    };

  } catch (error) {
    console.error('❌ [SPK Anomaly] Bulk create error:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan sistem',
      error: error.message
    };
  }
}

module.exports = {
  createSPKFromAnomaly,
  bulkCreateSPKFromAnomalies
};
