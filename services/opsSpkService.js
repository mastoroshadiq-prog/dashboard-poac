const { supabase } = require('../config/supabase');

/**
 * OPS SPK Service - Multi-Purpose SPK System
 * Handles operational SPK for lifecycle phases (Pembibitan, TBM, TM, Pemanenan, Replanting)
 */

/**
 * Get all lifecycle phases with sub-tindakan counts
 * Endpoint: GET /api/v1/ops/fase
 */
async function getFaseList() {
  try {
    // Get all phases with sub-tindakan count
    const { data: faseList, error: faseError } = await supabase
      .from('ops_fase_besar')
      .select('*')
      .order('umur_mulai');

    if (faseError) throw faseError;

    // Get counts for each fase
    const faseWithCounts = await Promise.all(
      faseList.map(async (fase) => {
        const { count, error: countError } = await supabase
          .from('ops_sub_tindakan')
          .select('*', { count: 'exact', head: true })
          .eq('id_fase_besar', fase.id_fase_besar);

        if (countError) throw countError;

        return {
          ...fase,
          jumlah_sub_tindakan: count || 0
        };
      })
    );

    return {
      success: true,
      data: faseWithCounts,
      total: faseWithCounts.length
    };
  } catch (error) {
    console.error('Error getting fase list:', error);
    throw error;
  }
}

/**
 * Get sub-tindakan for specific fase
 * Endpoint: GET /api/v1/ops/fase/:id_fase/sub-tindakan
 */
async function getSubTindakanByFase(id_fase) {
  try {
    // Get fase info
    const { data: fase, error: faseError } = await supabase
      .from('ops_fase_besar')
      .select('*')
      .eq('id_fase_besar', id_fase)
      .single();

    if (faseError) throw faseError;
    if (!fase) {
      return {
        success: false,
        message: 'Fase not found'
      };
    }

    // Get sub-tindakan for this fase
    const { data: subTindakan, error: subError } = await supabase
      .from('ops_sub_tindakan')
      .select('*')
      .eq('id_fase_besar', id_fase)
      .order('nama_sub');

    if (subError) throw subError;

    // Get jadwal count for each sub-tindakan
    const subTindakanWithJadwal = await Promise.all(
      subTindakan.map(async (sub) => {
        const { count, error: countError } = await supabase
          .from('ops_jadwal_tindakan')
          .select('*', { count: 'exact', head: true })
          .eq('id_sub_tindakan', sub.id_sub_tindakan);

        if (countError) throw countError;

        return {
          ...sub,
          jumlah_jadwal: count || 0
        };
      })
    );

    return {
      success: true,
      data: {
        fase: fase,
        sub_tindakan: subTindakanWithJadwal,
        total_sub_tindakan: subTindakanWithJadwal.length
      }
    };
  } catch (error) {
    console.error('Error getting sub-tindakan:', error);
    throw error;
  }
}

/**
 * Get jadwal for specific sub-tindakan
 * Endpoint: GET /api/v1/ops/sub-tindakan/:id/jadwal
 */
async function getJadwalBySubTindakan(id_sub_tindakan) {
  try {
    // Get sub-tindakan info with fase
    const { data: subTindakan, error: subError } = await supabase
      .from('ops_sub_tindakan')
      .select(`
        *,
        ops_fase_besar (
          id_fase_besar,
          nama_fase,
          umur_mulai,
          umur_selesai
        )
      `)
      .eq('id_sub_tindakan', id_sub_tindakan)
      .single();

    if (subError) throw subError;
    if (!subTindakan) {
      return {
        success: false,
        message: 'Sub-tindakan not found'
      };
    }

    // Get jadwal for this sub-tindakan
    const { data: jadwal, error: jadwalError } = await supabase
      .from('ops_jadwal_tindakan')
      .select('*')
      .eq('id_sub_tindakan', id_sub_tindakan);

    if (jadwalError) throw jadwalError;

    // Get SPK count for each jadwal
    const jadwalWithSPK = await Promise.all(
      jadwal.map(async (j) => {
        const { count, error: countError } = await supabase
          .from('ops_spk_tindakan')
          .select('*', { count: 'exact', head: true })
          .eq('id_jadwal_tindakan', j.id_jadwal_tindakan);

        if (countError) throw countError;

        return {
          ...j,
          jumlah_spk: count || 0
        };
      })
    );

    return {
      success: true,
      data: {
        sub_tindakan: subTindakan,
        jadwal: jadwalWithSPK,
        total_jadwal: jadwalWithSPK.length
      }
    };
  } catch (error) {
    console.error('Error getting jadwal:', error);
    throw error;
  }
}

/**
 * Create new SPK from jadwal_tindakan
 * Endpoint: POST /api/v1/ops/spk/create
 */
async function createOPSSPK(spkData) {
  try {
    const {
      id_jadwal_tindakan,
      nomor_spk,
      tanggal_terbit,
      tanggal_mulai,
      tanggal_selesai,
      penanggung_jawab,
      mandor,
      lokasi,
      uraian_pekerjaan,
      catatan
    } = spkData;

    // Validate jadwal exists
    const { data: jadwal, error: jadwalError } = await supabase
      .from('ops_jadwal_tindakan')
      .select(`
        *,
        ops_sub_tindakan (
          *,
          ops_fase_besar (*)
        )
      `)
      .eq('id_jadwal_tindakan', id_jadwal_tindakan)
      .single();

    if (jadwalError) throw jadwalError;
    if (!jadwal) {
      return {
        success: false,
        message: 'Jadwal tindakan not found'
      };
    }

    // Create SPK
    const { data: newSPK, error: spkError } = await supabase
      .from('ops_spk_tindakan')
      .insert([
        {
          id_jadwal_tindakan,
          nomor_spk,
          tanggal_terbit: tanggal_terbit || new Date().toISOString().split('T')[0],
          tanggal_mulai,
          tanggal_selesai,
          status: 'PENDING', // Default status
          penanggung_jawab,
          mandor,
          lokasi,
          uraian_pekerjaan,
          catatan
        }
      ])
      .select()
      .single();

    if (spkError) throw spkError;

    return {
      success: true,
      message: 'SPK created successfully',
      data: {
        spk: newSPK,
        jadwal: jadwal,
        sub_tindakan: jadwal.ops_sub_tindakan,
        fase: jadwal.ops_sub_tindakan.ops_fase_besar
      }
    };
  } catch (error) {
    console.error('Error creating OPS SPK:', error);
    throw error;
  }
}

/**
 * Get SPK list with filters
 * Endpoint: GET /api/v1/ops/spk
 */
async function getSPKList(filters = {}) {
  try {
    const {
      status,
      id_fase_besar,
      tanggal_mulai,
      tanggal_selesai,
      mandor,
      lokasi,
      page = 1,
      limit = 20
    } = filters;

    let query = supabase
      .from('ops_spk_tindakan')
      .select(`
        *,
        ops_jadwal_tindakan (
          *,
          ops_sub_tindakan (
            *,
            ops_fase_besar (*)
          )
        )
      `, { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (mandor) {
      query = query.ilike('mandor', `%${mandor}%`);
    }

    if (lokasi) {
      query = query.ilike('lokasi', `%${lokasi}%`);
    }

    if (tanggal_mulai) {
      query = query.gte('tanggal_mulai', tanggal_mulai);
    }

    if (tanggal_selesai) {
      query = query.lte('tanggal_selesai', tanggal_selesai);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query
      .order('tanggal_terbit', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: spkList, error: spkError, count } = await query;

    if (spkError) throw spkError;

    // Filter by fase if requested (post-query filter since it's nested)
    let filteredList = spkList;
    if (id_fase_besar) {
      filteredList = spkList.filter(
        spk => spk.ops_jadwal_tindakan?.ops_sub_tindakan?.id_fase_besar === id_fase_besar
      );
    }

    // Group by status
    const statusSummary = {
      PENDING: 0,
      DIKERJAKAN: 0,
      SELESAI: 0,
      DITUNDA: 0
    };

    filteredList.forEach(spk => {
      if (statusSummary.hasOwnProperty(spk.status)) {
        statusSummary[spk.status]++;
      }
    });

    return {
      success: true,
      data: filteredList,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: id_fase_besar ? filteredList.length : count,
        total_pages: Math.ceil((id_fase_besar ? filteredList.length : count) / limit)
      },
      summary: statusSummary
    };
  } catch (error) {
    console.error('Error getting SPK list:', error);
    throw error;
  }
}

/**
 * Update SPK status
 * Endpoint: PUT /api/v1/ops/spk/:id_spk/status
 */
async function updateSPKStatus(id_spk, newStatus, catatan) {
  try {
    // Validate status
    const validStatuses = ['PENDING', 'DIKERJAKAN', 'SELESAI', 'DITUNDA'];
    if (!validStatuses.includes(newStatus)) {
      return {
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      };
    }

    // Get current SPK
    const { data: currentSPK, error: getError } = await supabase
      .from('ops_spk_tindakan')
      .select('*')
      .eq('id_spk', id_spk)
      .single();

    if (getError) throw getError;
    if (!currentSPK) {
      return {
        success: false,
        message: 'SPK not found'
      };
    }

    // Update SPK
    const updateData = {
      status: newStatus
    };

    // Add catatan if provided
    if (catatan) {
      updateData.catatan = catatan;
    }

    const { data: updatedSPK, error: updateError } = await supabase
      .from('ops_spk_tindakan')
      .update(updateData)
      .eq('id_spk', id_spk)
      .select()
      .single();

    if (updateError) throw updateError;

    return {
      success: true,
      message: 'SPK status updated successfully',
      data: {
        previous_status: currentSPK.status,
        new_status: newStatus,
        spk: updatedSPK
      }
    };
  } catch (error) {
    console.error('Error updating SPK status:', error);
    throw error;
  }
}

module.exports = {
  getFaseList,
  getSubTindakanByFase,
  getJadwalBySubTindakan,
  createOPSSPK,
  getSPKList,
  updateSPKStatus
};
