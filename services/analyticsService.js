/**
 * ANALYTICS SERVICE
 * =================
 * Purpose: Business logic for analytics & anomaly detection
 * 
 * Features:
 * - Detect operational anomalies (pohon miring, mati, NDRE stres)
 * - Mandor performance metrics
 * - SPK completion analytics
 * 
 * Author: Backend Team
 * Date: November 19, 2025
 */

const { supabase } = require('../config/supabase');

/**
 * Detect Anomalies
 * @param {Object} filters - { divisi, afdeling, date_from, date_to }
 * @returns {Object} { anomalies, summary }
 */
async function detectAnomalies(filters = {}) {
  try {
    console.log('🔍 [Analytics] Detecting anomalies with filters:', filters);

    const anomalies = [];

    // 1. POHON MIRING (angle > 30°)
    const { data: pohonMiring, error: error1 } = await supabase
      .from('kebun_observasi')
      .select(`
        id_observasi,
        id_npokok,
        metadata_json,
        tanggal_observasi,
        kebun_n_pokok!inner(
          id_npokok,
          id_blok,
          kebun_blok!inner(
            kode_blok,
            kebun_afdeling!inner(
              kode_afdeling
            )
          )
        )
      `)
      .not('metadata_json', 'is', null);

    if (!error1 && pohonMiring) {
      const miringItems = pohonMiring
        .filter(obs => {
          try {
            const metadata = typeof obs.metadata_json === 'string' 
              ? JSON.parse(obs.metadata_json) 
              : obs.metadata_json;
            const angle = parseFloat(metadata?.angle || 0);
            return angle > 30;
          } catch (e) {
            return false;
          }
        })
        .map(obs => {
          const metadata = typeof obs.metadata_json === 'string' 
            ? JSON.parse(obs.metadata_json) 
            : obs.metadata_json;
          return {
            id_observasi: obs.id_observasi,
            id_npokok: obs.id_npokok,
            blok: obs.kebun_n_pokok?.kebun_blok?.kode_blok || 'Unknown',
            afdeling: obs.kebun_n_pokok?.kebun_blok?.kebun_afdeling?.kode_afdeling || 'Unknown',
            angle: parseFloat(metadata?.angle || 0),
            tanggal: obs.tanggal_observasi
          };
        });

      if (miringItems.length > 0) {
        // Group by location
        const locationMap = {};
        miringItems.forEach(item => {
          const key = `${item.afdeling}-${item.blok}`;
          if (!locationMap[key]) {
            locationMap[key] = { count: 0, afdeling: item.afdeling, blok: item.blok };
          }
          locationMap[key].count++;
        });

        const locations = Object.values(locationMap).map(loc => 
          `${loc.afdeling}-${loc.blok} (${loc.count} pohon)`
        );

        anomalies.push({
          type: "POHON_MIRING",
          severity: miringItems.length > 10 ? "HIGH" : "MEDIUM",
          count: miringItems.length,
          locations: locations.slice(0, 5), // Top 5 locations
          description: `Pohon miring >30 derajat, risiko tumbang`,
          recommended_action: "Prioritas APH segera, evaluasi sistem akar",
          details: miringItems.slice(0, 10) // Top 10 details
        });
      }
    }

    // 2. POHON MATI (status_aktual = MATI)
    const { data: pohonMati, error: error2 } = await supabase
      .from('kebun_n_pokok')
      .select(`
        id_npokok,
        status_aktual,
        id_blok,
        kebun_blok!inner(
          kode_blok,
          kebun_afdeling!inner(
            kode_afdeling
          )
        )
      `)
      .eq('status_aktual', 'MATI');

    if (!error2 && pohonMati && pohonMati.length > 0) {
      // Group by location
      const locationMap = {};
      pohonMati.forEach(pohon => {
        const afdeling = pohon.kebun_blok?.kebun_afdeling?.kode_afdeling || 'Unknown';
        const blok = pohon.kebun_blok?.kode_blok || 'Unknown';
        const key = `${afdeling}-${blok}`;
        if (!locationMap[key]) {
          locationMap[key] = { count: 0, afdeling, blok };
        }
        locationMap[key].count++;
      });

      const locations = Object.values(locationMap).map(loc => 
        `${loc.afdeling}-${loc.blok} (${loc.count} pohon)`
      );

      anomalies.push({
        type: "POHON_MATI",
        severity: "CRITICAL",
        count: pohonMati.length,
        locations: locations.slice(0, 5),
        description: "Pohon mati, perlu replanting",
        recommended_action: "Create SPK Sanitasi + Replanting segera",
        details: pohonMati.slice(0, 10).map(p => ({
          id_npokok: p.id_npokok,
          blok: p.kebun_blok?.kode_blok,
          afdeling: p.kebun_blok?.kebun_afdeling?.kode_afdeling
        }))
      });
    }

    // 3. NDRE STRES BERAT
    const { data: ndreStres, error: error3 } = await supabase
      .from('kebun_observasi')
      .select(`
        id_observasi,
        id_npokok,
        ndre_value,
        ndre_classification,
        tanggal_observasi,
        kebun_n_pokok!inner(
          id_npokok,
          id_blok,
          kebun_blok!inner(
            kode_blok,
            kebun_afdeling!inner(
              kode_afdeling
            )
          )
        )
      `)
      .eq('ndre_classification', 'Stres Berat');

    if (!error3 && ndreStres && ndreStres.length > 0) {
      const locationMap = {};
      ndreStres.forEach(obs => {
        const afdeling = obs.kebun_n_pokok?.kebun_blok?.kebun_afdeling?.kode_afdeling || 'Unknown';
        const blok = obs.kebun_n_pokok?.kebun_blok?.kode_blok || 'Unknown';
        const key = `${afdeling}-${blok}`;
        if (!locationMap[key]) {
          locationMap[key] = { count: 0, afdeling, blok };
        }
        locationMap[key].count++;
      });

      const locations = Object.values(locationMap).map(loc => 
        `${loc.afdeling}-${loc.blok} (${loc.count} pohon)`
      );

      anomalies.push({
        type: "NDRE_STRES_BERAT",
        severity: "HIGH",
        count: ndreStres.length,
        locations: locations.slice(0, 5),
        description: "Pohon dengan NDRE Stres Berat, perlu validasi lapangan",
        recommended_action: "Create SPK Validasi Drone untuk konfirmasi lapangan",
        details: ndreStres.slice(0, 10).map(obs => ({
          id_observasi: obs.id_observasi,
          id_npokok: obs.id_npokok,
          ndre_value: obs.ndre_value,
          blok: obs.kebun_n_pokok?.kebun_blok?.kode_blok,
          afdeling: obs.kebun_n_pokok?.kebun_blok?.kebun_afdeling?.kode_afdeling,
          tanggal: obs.tanggal_observasi
        }))
      });
    }

    // Calculate summary
    const summary = {
      total_anomalies: anomalies.reduce((sum, a) => sum + a.count, 0),
      critical: anomalies.filter(a => a.severity === 'CRITICAL').reduce((sum, a) => sum + a.count, 0),
      high: anomalies.filter(a => a.severity === 'HIGH').reduce((sum, a) => sum + a.count, 0),
      medium: anomalies.filter(a => a.severity === 'MEDIUM').reduce((sum, a) => sum + a.count, 0),
      low: anomalies.filter(a => a.severity === 'LOW').reduce((sum, a) => sum + a.count, 0),
      by_type: anomalies.map(a => ({ type: a.type, count: a.count, severity: a.severity }))
    };

    console.log('✅ [Analytics] Anomalies detected:', summary.total_anomalies);

    return {
      success: true,
      data: {
        anomalies,
        summary
      }
    };

  } catch (error) {
    console.error('❌ [Analytics] Detect anomalies error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get Mandor Performance Metrics
 * @param {Object} filters - { mandor_id, date_from, date_to }
 * @returns {Object} Performance data
 */
async function getMandorPerformance(filters = {}) {
  try {
    console.log('📊 [Analytics] Getting mandor performance:', filters);

    // Query SPK assignments for mandor
    const query = supabase
      .from('spk_tugas')
      .select(`
        id_tugas,
        status_tugas,
        prioritas,
        tanggal_mulai,
        tanggal_selesai,
        id_pelaksana,
        spk_header!inner(
          id_spk,
          nama_spk,
          status_spk
        )
      `);

    if (filters.mandor_id) {
      query.eq('id_pelaksana', filters.mandor_id);
    }

    const { data: tasks, error } = await query;

    if (error) {
      throw error;
    }

    if (!tasks || tasks.length === 0) {
      return {
        success: true,
        data: {
          performance: [],
          summary: { total_mandor: 0 }
        }
      };
    }

    // Calculate metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status_tugas === 'SELESAI').length;
    const pendingTasks = tasks.filter(t => t.status_tugas === 'PENDING' || t.status_tugas === 'BARU').length;
    const inProgressTasks = tasks.filter(t => t.status_tugas === 'DIKERJAKAN').length;

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0;

    // Calculate average response time (from BARU to DIKERJAKAN)
    const responseTimes = tasks
      .filter(t => t.tanggal_mulai && t.status_tugas !== 'BARU')
      .map(t => {
        const start = new Date(t.tanggal_mulai);
        const now = new Date();
        return (now - start) / (1000 * 60 * 60); // hours
      });

    const avgResponseTime = responseTimes.length > 0
      ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(1)
      : 0;

    const performance = {
      mandor_id: filters.mandor_id,
      metrics: {
        completion_rate: parseFloat(completionRate),
        quality_score: 85.0, // TODO: Implement quality scoring
        efficiency_score: 90.0, // TODO: Implement efficiency scoring
        avg_response_time_hours: parseFloat(avgResponseTime)
      },
      breakdown: {
        total_spk: tasks.length,
        completed: completedTasks,
        pending: pendingTasks,
        in_progress: inProgressTasks
      }
    };

    return {
      success: true,
      data: {
        performance: [performance],
        summary: { total_mandor: 1 }
      }
    };

  } catch (error) {
    console.error('❌ [Analytics] Get mandor performance error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  detectAnomalies,
  getMandorPerformance
};
