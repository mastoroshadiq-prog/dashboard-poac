/**
 * DRONE NDRE SERVICE
 * 
 * Service untuk mengelola data drone NDRE survey
 * - Get NDRE data dengan filter (divisi, blok, stress level, date)
 * - Format data untuk Map/Peta visualization
 * - Statistics & aggregation
 */

const { supabase } = require('../config/supabase');

/**
 * Get NDRE observation data dengan filter komprehensif
 * 
 * @param {Object} filters - Filter parameters
 * @param {string} filters.divisi - Filter by division (optional)
 * @param {string} filters.blok - Filter by block (optional)
 * @param {string} filters.blok_detail - Filter by detailed block (optional)
 * @param {string} filters.stress_level - Filter by classification (optional)
 * @param {string} filters.date_from - Filter start date (optional)
 * @param {string} filters.date_to - Filter end date (optional)
 * @param {number} filters.ndre_min - Minimum NDRE value (optional)
 * @param {number} filters.ndre_max - Maximum NDRE value (optional)
 * @param {number} filters.page - Page number (default: 1)
 * @param {number} filters.limit - Items per page (default: 50)
 * @returns {Object} NDRE data dengan pagination dan statistics
 */
async function getNDREData(filters = {}) {
  try {
    const {
      divisi,
      blok,
      blok_detail,
      stress_level,
      date_from,
      date_to,
      ndre_min,
      ndre_max,
      page = 1,
      limit = 50,
    } = filters;

    // Build query dengan JOIN ke kebun_n_pokok
    let query = supabase
      .from('kebun_observasi')
      .select(`
        id_observasi,
        id_npokok,
        tanggal_survey,
        jenis_survey,
        ndre_value,
        ndre_classification,
        keterangan,
        metadata_json,
        created_at,
        kebun_n_pokok (
          id_npokok,
          id_tanaman,
          divisi,
          blok,
          blok_detail,
          n_baris,
          n_pokok,
          object_id,
          tgl_tanam,
          kode
        )
      `)
      .eq('jenis_survey', 'DRONE_NDRE')
      .not('ndre_value', 'is', null);

    // Apply filters
    if (divisi) {
      query = query.eq('kebun_n_pokok.divisi', divisi);
    }
    if (blok) {
      query = query.eq('kebun_n_pokok.blok', blok);
    }
    if (blok_detail) {
      query = query.eq('kebun_n_pokok.blok_detail', blok_detail);
    }
    if (stress_level) {
      query = query.eq('ndre_classification', stress_level);
    }
    if (date_from) {
      query = query.gte('tanggal_survey', date_from);
    }
    if (date_to) {
      query = query.lte('tanggal_survey', date_to);
    }
    if (ndre_min !== undefined) {
      query = query.gte('ndre_value', ndre_min);
    }
    if (ndre_max !== undefined) {
      query = query.lte('ndre_value', ndre_max);
    }

    // Order by NDRE value (ascending - most stressed first)
    query = query.order('ndre_value', { ascending: true });

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // DEBUG: Check raw data
    console.log('🔍 Raw data sample (first item):');
    if (data && data.length > 0) {
      console.log('id_npokok:', data[0].id_npokok);
      console.log('kebun_n_pokok:', data[0].kebun_n_pokok);
    }

    // Transform data untuk Map visualization
    const mapData = data.map(obs => ({
      id: obs.id_npokok, // IMPORTANT: This is the tree ID (kebun_n_pokok.id_npokok)
      tree_id: obs.kebun_n_pokok?.id_tanaman,
      location: {
        id_npokok: obs.id_npokok,
        divisi: obs.kebun_n_pokok?.divisi,
        blok: obs.kebun_n_pokok?.blok,
        blok_detail: obs.kebun_n_pokok?.blok_detail,
        n_baris: obs.kebun_n_pokok?.n_baris,
        n_pokok: obs.kebun_n_pokok?.n_pokok,
        // Simulate lat/long for map (can be replaced with actual GPS data from metadata_json)
        latitude: simulateLatitude(obs.kebun_n_pokok?.divisi, obs.kebun_n_pokok?.blok, obs.kebun_n_pokok?.n_baris),
        longitude: simulateLongitude(obs.kebun_n_pokok?.divisi, obs.kebun_n_pokok?.blok, obs.kebun_n_pokok?.n_pokok),
      },
      ndre: {
        value: parseFloat(obs.ndre_value),
        classification: obs.ndre_classification,
        color: getStressColor(obs.ndre_classification),
        status: getStressStatus(obs.ndre_classification),
      },
      survey: {
        date: obs.tanggal_survey,
        type: obs.jenis_survey,
        notes: obs.keterangan,
      },
      metadata: obs.metadata_json,
    }));

    // DEBUG: Check mapped data
    console.log('🔍 Mapped data sample (first item):');
    if (mapData && mapData.length > 0) {
      console.log('id:', mapData[0].id);
      console.log('tree_id:', mapData[0].tree_id);
      console.log('Has id field:', 'id' in mapData[0]);
    }

    // Get statistics
    const stats = await getNDREStatistics(filters);

    return {
      success: true,
      data: mapData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total_items: count || data.length,
        total_pages: Math.ceil((count || data.length) / limit),
      },
      statistics: stats,
    };

  } catch (error) {
    console.error('Error getting NDRE data:', error);
    throw error;
  }
}

/**
 * Get NDRE statistics
 */
async function getNDREStatistics(filters = {}) {
  try {
    const {
      divisi,
      blok,
      date_from,
      date_to,
    } = filters;

    // Query aggregation
    let query = supabase
      .from('kebun_observasi')
      .select(`
        ndre_value,
        ndre_classification,
        kebun_n_pokok (divisi, blok)
      `)
      .eq('jenis_survey', 'DRONE_NDRE')
      .not('ndre_value', 'is', null);

    // Apply filters
    if (divisi) query = query.eq('kebun_n_pokok.divisi', divisi);
    if (blok) query = query.eq('kebun_n_pokok.blok', blok);
    if (date_from) query = query.gte('tanggal_survey', date_from);
    if (date_to) query = query.lte('tanggal_survey', date_to);

    const { data, error } = await query;
    
    if (error) throw error;

    // Calculate statistics
    const total = data.length;
    const ndreValues = data.map(d => parseFloat(d.ndre_value));
    
    const stressBerat = data.filter(d => d.ndre_classification === 'Stres Berat').length;
    const stresSedang = data.filter(d => d.ndre_classification === 'Stres Sedang').length;
    const sehat = data.filter(d => d.ndre_classification === 'Sehat').length;
    const lainnya = total - stressBerat - stresSedang - sehat;

    return {
      total_trees: total,
      classification: {
        'Stres Berat': {
          count: stressBerat,
          percentage: ((stressBerat / total) * 100).toFixed(2),
          priority: 'URGENT',
          color: '#DC2626', // Red
        },
        'Stres Sedang': {
          count: stresSedang,
          percentage: ((stresSedang / total) * 100).toFixed(2),
          priority: 'HIGH',
          color: '#F59E0B', // Orange
        },
        'Sehat': {
          count: sehat,
          percentage: ((sehat / total) * 100).toFixed(2),
          priority: 'NORMAL',
          color: '#10B981', // Green
        },
        'Lainnya': {
          count: lainnya,
          percentage: ((lainnya / total) * 100).toFixed(2),
          priority: 'LOW',
          color: '#6B7280', // Gray
        },
      },
      ndre_range: {
        min: Math.min(...ndreValues).toFixed(4),
        max: Math.max(...ndreValues).toFixed(4),
        avg: (ndreValues.reduce((a, b) => a + b, 0) / total).toFixed(4),
      },
      recommendations: {
        urgent_validation: stressBerat,
        high_priority: stresSedang,
        total_needs_attention: stressBerat + stresSedang,
      },
    };

  } catch (error) {
    console.error('Error getting NDRE statistics:', error);
    throw error;
  }
}

/**
 * Get unique filter options (for dropdown filters)
 */
async function getFilterOptions() {
  try {
    // Get unique divisions
    const { data: divisiData } = await supabase
      .from('kebun_n_pokok')
      .select('divisi')
      .not('divisi', 'is', null);
    
    const divisiList = [...new Set(divisiData.map(d => d.divisi))].sort();

    // Get unique blocks
    const { data: blokData } = await supabase
      .from('kebun_n_pokok')
      .select('blok, blok_detail')
      .not('blok', 'is', null);
    
    const blokList = [...new Set(blokData.map(d => d.blok))].sort();
    const blokDetailList = [...new Set(blokData.map(d => d.blok_detail).filter(Boolean))].sort();

    // Get stress classifications
    const { data: classData } = await supabase
      .from('kebun_observasi')
      .select('ndre_classification')
      .eq('jenis_survey', 'DRONE_NDRE')
      .not('ndre_classification', 'is', null);
    
    const classifications = [...new Set(classData.map(d => d.ndre_classification))].sort();

    return {
      success: true,
      filters: {
        divisi: divisiList,
        blok: blokList,
        blok_detail: blokDetailList,
        stress_levels: classifications,
      },
    };

  } catch (error) {
    console.error('Error getting filter options:', error);
    throw error;
  }
}

/**
 * Helper: Simulate latitude based on location
 * (Replace with actual GPS data from metadata_json if available)
 */
function simulateLatitude(divisi, blok, n_baris) {
  // Base coordinate for plantation (example: Sumatra palm oil plantation)
  const baseLat = 1.5; // Example: 1.5° N
  
  // Offset based on division (assume different estates)
  const divisiOffset = divisi === 'AME II' ? 0.05 : 0;
  
  // Offset based on block (each block ~500m apart = ~0.0045 degrees)
  const blokCode = blok ? parseInt(blok.replace(/\D/g, '')) || 0 : 0;
  const blokOffset = blokCode * 0.0045;
  
  // Offset based on row (each row ~8m apart = ~0.000072 degrees)
  const barisOffset = (n_baris || 0) * 0.000072;
  
  return baseLat + divisiOffset + blokOffset + barisOffset;
}

/**
 * Helper: Simulate longitude based on location
 */
function simulateLongitude(divisi, blok, n_pokok) {
  // Base coordinate for plantation
  const baseLong = 101.5; // Example: 101.5° E
  
  // Offset based on division
  const divisiOffset = divisi === 'AME II' ? 0.03 : 0;
  
  // Offset based on block
  const blokCode = blok ? parseInt(blok.replace(/\D/g, '')) || 0 : 0;
  const blokOffset = blokCode * 0.0035;
  
  // Offset based on tree position (each tree ~9m apart = ~0.000081 degrees)
  const pokokOffset = (n_pokok || 0) * 0.000081;
  
  return baseLong + divisiOffset + blokOffset + pokokOffset;
}

/**
 * Helper: Get color based on stress classification
 */
function getStressColor(classification) {
  const colorMap = {
    'Stres Berat': '#DC2626',    // Red
    'Stres Sedang': '#F59E0B',   // Orange
    'Sehat': '#10B981',          // Green
  };
  return colorMap[classification] || '#6B7280'; // Gray default
}

/**
 * Helper: Get status label
 */
function getStressStatus(classification) {
  const statusMap = {
    'Stres Berat': 'URGENT',
    'Stres Sedang': 'WARNING',
    'Sehat': 'HEALTHY',
  };
  return statusMap[classification] || 'UNKNOWN';
}

/**
 * Get detail pohon untuk validasi
 */
async function getTreeDetail(id_npokok) {
  try {
    const { data, error } = await supabase
      .from('kebun_n_pokok')
      .select(`
        *,
        kebun_observasi (
          id_observasi,
          tanggal_survey,
          jenis_survey,
          ndre_value,
          ndre_classification,
          keterangan,
          metadata_json
        )
      `)
      .eq('id_npokok', id_npokok)
      .single();

    if (error) throw error;

    return {
      success: true,
      data: data,
    };

  } catch (error) {
    console.error('Error getting tree detail:', error);
    throw error;
  }
}

module.exports = {
  getNDREData,
  getNDREStatistics,
  getFilterOptions,
  getTreeDetail,
};
