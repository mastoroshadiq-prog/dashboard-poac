/**
 * SPK VALIDASI DRONE SERVICE
 * 
 * Service untuk membuat SPK penugasan validasi pohon
 * berdasarkan hasil survey drone NDRE
 * 
 * Workflow:
 * 1. Asisten Manager pilih pohon dari data drone NDRE
 * 2. Create SPK untuk validasi lapangan
 * 3. Assign ke Mandor
 * 4. Mandor assign ke Surveyor
 * 5. Surveyor eksekusi di lapangan (Platform A)
 */

const { supabase } = require('../config/supabase');

/**
 * Create SPK Validasi Drone
 * 
 * @param {Object} params - SPK parameters
 * @param {string} params.created_by - User ID (Asisten Manager)
 * @param {string} params.assigned_to - Mandor ID
 * @param {Array} params.trees - List of tree IDs (id_npokok) yang perlu validasi
 * @param {string} params.priority - URGENT | HIGH | NORMAL
 * @param {string} params.deadline - Target completion date
 * @param {string} params.notes - Additional notes
 * @returns {Object} SPK data with tasks
 */
async function createSPKValidasiDrone(params) {
  try {
    const {
      created_by,
      assigned_to,
      trees = [],
      priority = 'HIGH',
      deadline,
      notes,
    } = params;

    // DEBUG: Log parameters
    console.log(' createSPKValidasiDrone called with params:', {
      created_by,
      assigned_to,
      trees_count: trees.length,
      priority,
      deadline,
      notes
    });

    // Validation
    if (!created_by || !assigned_to || trees.length === 0) {
      throw new Error('Missing required fields: created_by, assigned_to, trees');
    }

    console.log(' Creating SPK for trees:', trees);

    // Get tree details from database
    const { data: treeData, error: treeError } = await supabase
      .from('kebun_n_pokok')
      .select(`
        *,
        kebun_observasi!inner (
          id_observasi,
          tanggal_survey,
          ndre_value,
          ndre_classification,
          jenis_survey
        )
      `)
      .in('id_npokok', trees)
      .eq('kebun_observasi.jenis_survey', 'DRONE_NDRE');

    console.log(' Query result:', { count: treeData?.length, error: treeError });

    if (treeError) throw treeError;

    if (!treeData || treeData.length === 0) {
      throw new Error('No valid trees found for validation');
    }

    // Sort observations by date (latest first) and take only the latest
    const enrichedTreeData = treeData.map(tree => {
      const sortedObs = (tree.kebun_observasi || []).sort((a, b) => 
        new Date(b.tanggal_survey) - new Date(a.tanggal_survey)
      );
      return {
        ...tree,
        kebun_observasi: sortedObs.length > 0 ? [sortedObs[0]] : []
      };
    });

    // Calculate priority statistics
    const stressBerat = enrichedTreeData.filter(t => 
      t.kebun_observasi[0]?.ndre_classification === 'Stres Berat'
    ).length;
    
    const stresSedang = enrichedTreeData.filter(t => 
      t.kebun_observasi[0]?.ndre_classification === 'Stres Sedang'
    ).length;

    // Auto-adjust priority based on stress level
    let finalPriority = priority;
    if (stressBerat > 0) {
      finalPriority = 'URGENT';
    } else if (stresSedang > 0 && priority === 'NORMAL') {
      finalPriority = 'HIGH';
    }

    // ================================================================
    // SOP INTEGRATION: Fetch active SOP for VALIDASI_DRONE_NDRE
    // ================================================================
    const { data: sopData, error: sopError } = await supabase
      .from('sop_master')
      .select('*')
      .eq('jenis_kegiatan', 'VALIDASI_DRONE_NDRE')
      .eq('is_active', true)
      .eq('status', 'ACTIVE')
      .single();

    if (sopError) {
      console.warn('  No active SOP found for VALIDASI_DRONE_NDRE:', sopError.message);
    } else {
      console.log(' Using SOP:', sopData.sop_code, sopData.sop_version);
      console.log('   - Checklist Items:', sopData.checklist_items?.length || 0);
      console.log('   - Mandatory Photos:', sopData.mandatory_photos);
      console.log('   - Est. Time:', sopData.estimated_time_mins, 'mins');
    }

    // Create SPK Header (using spk_header table)
    const spkNo = `SPK-DRONE-${Date.now()}`;
    const spkData = {
      nama_spk: `Validasi Drone NDRE - ${new Date().toLocaleDateString('id-ID')}`,
      id_asisten_pembuat: created_by,
      tanggal_dibuat: new Date().toISOString(),
      tanggal_target_selesai: deadline || calculateDeadline(finalPriority),
      status_spk: 'PENDING', // PENDING, IN_PROGRESS, COMPLETED, CANCELLED
      keterangan: notes || `Validasi ${enrichedTreeData.length} pohon berdasarkan survey drone NDRE. Stres Berat: ${stressBerat}, Stres Sedang: ${stresSedang}. Assigned to: ${assigned_to}`,
      risk_level: finalPriority, // URGENT, HIGH, NORMAL
      week_number: getWeekNumber(new Date()),
      // SOP Integration
      id_sop: sopData?.id_sop || null,
      sop_version_used: sopData?.sop_version || null,
    };

    console.log(' Inserting SPK with data:', JSON.stringify(spkData, null, 2));

    const { data: spk, error: spkError } = await supabase
      .from('spk_header')
      .insert(spkData)
      .select()
      .single();

    if (spkError) {
      console.error(' SPK Insert Error:', JSON.stringify(spkError, null, 2));
      throw spkError;
    }

    console.log(' SPK Created:', spk.id_spk);

    // Create tugas for each tree (using spk_tugas table)
    const tasks = enrichedTreeData.map(tree => {
      const obs = tree.kebun_observasi[0]; // Latest observation
      
      // CRITICAL: id_pelaksana CANNOT be null (NOT NULL constraint)
      // and MUST be valid user UUID (FK constraint)
      if (!assigned_to) {
        throw new Error('assigned_to is required and cannot be null');
      }
      
      return {
        id_spk: spk.id_spk,
        id_pelaksana: assigned_to, // Mandor - MUST be valid user UUID!
        tipe_tugas: 'VALIDASI_NDRE', // Max 15 chars
        status_tugas: 'PENDING', // PENDING, ASSIGNED, IN_PROGRESS, COMPLETED
        target_json: {
          id_npokok: tree.id_npokok,
          tree_id: tree.id_tanaman,
          tree_location: {
            divisi: tree.divisi,
            blok: tree.blok,
            blok_detail: tree.blok_detail,
            n_baris: tree.n_baris,
            n_pokok: tree.n_pokok,
          },
          drone_data: {
            id_observasi: obs?.id_observasi,
            tanggal_survey: obs?.tanggal_survey,
            ndre_value: obs?.ndre_value,
            ndre_classification: obs?.ndre_classification,
          },
          // SOP Integration: Use dynamic checklist from SOP
          validation_checklist: sopData?.checklist_items || [
            'Cek visual kondisi daun (warna, ukuran)',
            'Cek kondisi batang (kesehatan, penyakit)',
            'Cek kondisi tanah sekitar (kelembaban, nutrisi)',
            'Foto dokumentasi (4 arah: U/S/T/B)',
            'Verifikasi apakah stress sesuai hasil drone',
            'Catat penyebab stress jika ditemukan',
          ],
          // SOP Integration: Add SOP reference
          sop_reference: sopData ? {
            id_sop: sopData.id_sop,
            sop_code: sopData.sop_code,
            sop_version: sopData.sop_version,
            sop_name: sopData.sop_name,
            mandatory_photos: sopData.mandatory_photos,
            estimated_time_mins: sopData.estimated_time_mins,
          } : null,
        },
        prioritas: obs?.ndre_classification === 'Stres Berat' ? 1 : 
                   obs?.ndre_classification === 'Stres Sedang' ? 2 : 3,
        task_priority: obs?.ndre_classification === 'Stres Berat' ? 'URGENT' : 
                       obs?.ndre_classification === 'Stres Sedang' ? 'HIGH' : 'NORMAL',
        task_description: `Validasi pohon ${tree.id_tanaman} - NDRE: ${obs?.ndre_value} (${obs?.ndre_classification}). Lokasi: ${tree.divisi}, ${tree.blok_detail}, Baris ${tree.n_baris}, Pokok ${tree.n_pokok}`,
        deadline: deadline || calculateDeadline(finalPriority),
        pic_name: null, // Will be filled when assigned to surveyor
      };
    });

    console.log(' Inserting', tasks.length, 'tugas...');
    console.log('Sample task:', JSON.stringify(tasks[0], null, 2));

    const { data: tugasData, error: tugasError } = await supabase
      .from('spk_tugas')
      .insert(tasks)
      .select();

    if (tugasError) {
      console.error(' Tugas Insert Error:', JSON.stringify(tugasError, null, 2));
      throw tugasError;
    }

    console.log(' Tugas Created:', tugasData.length);

    // Log activity
    await logSPKActivity({
      id_spk: spk.id_spk,
      user_id: created_by,
      action: 'CREATE_SPK_VALIDASI_DRONE',
      notes: `Created SPK ${spk.nama_spk} with ${tugasData.length} validation tasks. Priority: ${finalPriority}`,
    });

    // Helper: Group tasks by location (blok) with detail baris and pokok
    function getLocationBreakdown(tugasData) {
      const locationMap = {};
      
      tugasData.forEach(tugas => {
        const loc = tugas.target_json?.tree_location;
        if (!loc) return;
        
        const blokKey = `${loc.divisi}_${loc.blok}_${loc.blok_detail}`;
        
        if (!locationMap[blokKey]) {
          locationMap[blokKey] = {
            divisi: loc.divisi,
            blok: loc.blok,
            blok_detail: loc.blok_detail,
            trees: [],
          };
        }
        
        locationMap[blokKey].trees.push({
          n_baris: loc.n_baris,
          n_pokok: loc.n_pokok,
          id_tugas: tugas.id_tugas,
        });
      });
      
      return Object.values(locationMap).map(loc => ({
        ...loc,
        tree_count: loc.trees.length,
      }));
    }

    return {
      spk: {
        id_spk: spk.id_spk,
        no_spk: `SPK-${spk.id_spk.substring(0, 8)}`, // Generate from ID
        nama_spk: spk.nama_spk,
        jenis_kegiatan: 'VALIDASI_DRONE_NDRE',
        status: spk.status_spk,
        prioritas: spk.risk_level,
        created_by: spk.id_asisten_pembuat,
        assigned_to: assigned_to,
        target_selesai: spk.tanggal_target_selesai,
        catatan: spk.keterangan,
        created_at: spk.tanggal_dibuat,
        // SOP Integration: Expose SOP reference in response
        sop_reference: sopData ? {
          id_sop: sopData.id_sop,
          sop_code: sopData.sop_code,
          sop_version: sopData.sop_version,
          sop_name: sopData.sop_name,
        } : null,
      },
      // Enhancement: Expose tree_location at tugas level
      tugas: tugasData.map(t => ({
        ...t,
        tree_location: t.target_json?.tree_location || null,
      })),
      summary: {
        total_trees: tugasData.length,
        stress_levels: {
          stres_berat: stressBerat,
          stres_sedang: stresSedang,
          sehat: tugasData.length - stressBerat - stresSedang,
        },
        priority: finalPriority,
        deadline: spk.tanggal_target_selesai,
        // Enhancement: Add location breakdown
        locations: getLocationBreakdown(tugasData),
      },
    };

  } catch (error) {
    console.error('Error creating SPK Validasi Drone:', error);
    throw error;
  }
}

/**
 * Get SPK list untuk Mandor (with filters & pagination)
 */
async function getSPKListForMandor(mandor_id, filters = {}) {
  try {
    const {
      status,
      priority,
      date_from,
      date_to,
      page = 1,
      limit = 20
    } = filters;

    // Build query - find SPKs where mandor is assigned to at least one task
    let query = supabase
      .from('spk_header')
      .select(`
        *,
        spk_tugas!inner (
          id_tugas,
          status_tugas,
          prioritas,
          id_pelaksana
        )
      `, { count: 'exact' })
      .eq('spk_tugas.id_pelaksana', mandor_id); // Find SPKs where mandor is assigned

    // Apply filters
    if (status) {
      query = query.eq('status_spk', status);
    }
    if (priority) {
      query = query.eq('risk_level', priority);
    }
    if (date_from) {
      query = query.gte('tanggal_dibuat', date_from);
    }
    if (date_to) {
      query = query.lte('tanggal_dibuat', date_to);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query
      .order('tanggal_dibuat', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    // Add task statistics to each SPK
    const enrichedData = data.map(spk => {
      const tasks = spk.spk_tugas || [];
      const pending = tasks.filter(t => t.status_tugas === 'PENDING').length;
      const assigned = tasks.filter(t => t.status_tugas === 'ASSIGNED').length;
      const inProgress = tasks.filter(t => t.status_tugas === 'IN_PROGRESS').length;
      const completed = tasks.filter(t => t.status_tugas === 'COMPLETED').length;
      const urgent = tasks.filter(t => t.prioritas === 1).length; // 1 = URGENT

      return {
        id_spk: spk.id_spk,
        no_spk: `SPK-${spk.id_spk.substring(0, 8)}`,
        nama_spk: spk.nama_spk,
        jenis_kegiatan: 'VALIDASI_DRONE_NDRE',
        status: spk.status_spk,
        prioritas: spk.risk_level,
        catatan: spk.keterangan,
        created_at: spk.tanggal_dibuat,
        target_selesai: spk.tanggal_target_selesai,
        task_statistics: {
          total: tasks.length,
          pending: pending,
          assigned: assigned,
          in_progress: inProgress,
          completed: completed,
          urgent_count: urgent,
        },
        completion_percentage: tasks.length > 0 ? 
          parseFloat(((completed / tasks.length) * 100).toFixed(2)) : 0,
      };
    });

    return {
      data: enrichedData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total_items: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      }
    };

  } catch (error) {
    console.error('Error getting SPK list for mandor:', error);
    throw error;
  }
}

/**
 * Get SPK Detail (for viewing full SPK info with all tasks)
 */
async function getSPKDetail(spk_id) {
  try {
    // Get SPK header
    const { data: spkData, error: spkError } = await supabase
      .from('spk_header')
      .select('*')
      .eq('id_spk', spk_id)
      .single();

    if (spkError) throw spkError;
    if (!spkData) throw new Error(`SPK dengan ID ${spk_id} tidak ditemukan`);

    // Get all tugas
    const { data: tugasData, error: tugasError } = await supabase
      .from('spk_tugas')
      .select('*')
      .eq('id_spk', spk_id)
      .order('task_priority', { ascending: true });

    if (tugasError) throw tugasError;

    // Enrich tugas with tree data from target_json
    const enrichedTugas = tugasData.map(tugas => ({
      id_tugas: tugas.id_tugas,
      id_npokok: tugas.target_json?.id_npokok,
      tree_data: {
        id_tanaman: tugas.target_json?.tree_id,
        ...tugas.target_json?.tree_location
      },
      ndre_data: tugas.target_json?.drone_data || null,
      status: tugas.status_tugas,
      prioritas: tugas.prioritas,
      assigned_to: tugas.id_pelaksana,
      pic_name: tugas.pic_name,
      catatan: tugas.task_description,
      validation_checklist: tugas.target_json?.validation_checklist || [],
      deadline: tugas.deadline,
    }));

    // Calculate statistics
    const statusBreakdown = {};
    const priorityBreakdown = {};
    
    tugasData.forEach(t => {
      statusBreakdown[t.status_tugas] = (statusBreakdown[t.status_tugas] || 0) + 1;
      priorityBreakdown[t.prioritas] = (priorityBreakdown[t.prioritas] || 0) + 1;
    });

    const completedCount = statusBreakdown['COMPLETED'] || 0;
    const totalCount = tugasData.length;

    return {
      spk: {
        id_spk: spkData.id_spk,
        no_spk: `SPK-${spkData.id_spk.substring(0, 8)}`,
        nama_spk: spkData.nama_spk,
        jenis_kegiatan: 'VALIDASI_DRONE_NDRE',
        status: spkData.status_spk,
        prioritas: spkData.risk_level,
        catatan: spkData.keterangan,
        created_at: spkData.tanggal_dibuat,
        target_selesai: spkData.tanggal_target_selesai,
      },
      tugas: enrichedTugas,
      statistics: {
        total_tugas: totalCount,
        status_breakdown: statusBreakdown,
        priority_breakdown: priorityBreakdown,
        completion_percentage: totalCount > 0 ? 
          parseFloat(((completedCount / totalCount) * 100).toFixed(2)) : 0,
      }
    };

  } catch (error) {
    console.error('Error getting SPK detail:', error);
    throw error;
  }
}

/**
 * Assign SPK tugas ke Surveyor (by Mandor)
 */
async function assignTugasToSurveyor(params) {
  try {
    const {
      id_tugas_list, // Array of tugas IDs
      surveyor_id,
      mandor_id, // For authorization check
      notes,
    } = params;

    if (!id_tugas_list || id_tugas_list.length === 0) {
      throw new Error('No tasks provided for assignment');
    }

    // Update tugas with surveyor assignment
    const { data, error } = await supabase
      .from('spk_tugas')
      .update({
        id_pelaksana: surveyor_id,
        status_tugas: 'ASSIGNED',
        pic_name: notes || `Assigned by mandor ${mandor_id}`,
      })
      .in('id_tugas', id_tugas_list)
      .select();

    if (error) throw error;

    // Update SPK status to DIKERJAKAN if it was PENDING
    if (data.length > 0) {
      const spk_id = data[0].id_spk;
      
      // Check current SPK status
      const { data: spkData } = await supabase
        .from('spk_header')
        .select('status_spk')
        .eq('id_spk', spk_id)
        .single();
      
      // If SPK was PENDING and now has assigned tasks, update to DIKERJAKAN
      if (spkData && spkData.status_spk === 'PENDING') {
        await supabase
          .from('spk_header')
          .update({ status_spk: 'DIKERJAKAN' })
          .eq('id_spk', spk_id);
      }
    }

    // Log activity for each assignment
    for (const tugas of data) {
      await logSPKActivity({
        id_spk: tugas.id_spk,
        user_id: mandor_id,
        action: 'ASSIGN_TUGAS_TO_SURVEYOR',
        notes: `Assigned task ${tugas.id_tugas} to surveyor ${surveyor_id}. ${notes || ''}`,
      });
    }

    return {
      assigned_count: data.length,
      failed_count: id_tugas_list.length - data.length,
      tugas_list: data.map(t => ({
        id_tugas: t.id_tugas,
        id_npokok: t.target_json?.id_npokok,
        tree_id: t.target_json?.tree_id,
        status: t.status_tugas,
        assigned_to: t.id_pelaksana,
        assigned_at: new Date().toISOString(),
      })),
    };

  } catch (error) {
    console.error('Error assigning tugas to surveyor:', error);
    throw error;
  }
}

/**
 * Helper: Calculate deadline based on priority
 */
function calculateDeadline(priority) {
  const now = new Date();
  let daysToAdd = 7; // Default: 1 week

  if (priority === 'URGENT') {
    daysToAdd = 2; // 2 days for urgent
  } else if (priority === 'HIGH') {
    daysToAdd = 4; // 4 days for high
  }

  now.setDate(now.getDate() + daysToAdd);
  return now.toISOString().split('T')[0]; // Return YYYY-MM-DD
}

/**
 * Helper: Get week number of year
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Helper: Log SPK activity
 * TODO: Create spk_log_aktivitas table
 */
async function logSPKActivity(params) {
  try {
    // Temporarily disabled - table doesn't exist yet
    console.log(' Activity Log:', params);
    
    /* 
    const { id_spk, user_id, action, notes } = params;

    await supabase
      .from('spk_log_aktivitas')
      .insert({
        id_spk: id_spk,
        user_id: user_id,
        aktivitas: action,
        catatan: notes,
        timestamp: new Date().toISOString(),
      });
    */
  } catch (error) {
    console.error('Error logging SPK activity:', error);
    // Don't throw - logging failure should not block main operation
  }
}

module.exports = {
  createSPKValidasiDrone,
  getSPKListForMandor,
  assignTugasToSurveyor,
  getSPKDetail,
};
