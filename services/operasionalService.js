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
 * ENHANCEMENT: Calculate Deadlines for Each Category
 * 
 * Logika:
 * - Query spk_header.tanggal_target untuk SPK yang memiliki incomplete tasks
 * - Group by tipe_tugas (VALIDASI, APH, SANITASI)
 * - Return ISO 8601 date string (YYYY-MM-DD)
 * 
 * Note: Using 2-step query because Supabase nested select has column naming issues
 */
async function calculateDeadlines() {
  try {
    console.log('🔍 [ENHANCEMENT] Calculating Deadlines...');
    
    // Step 1: Get all incomplete tasks
    const { data: incompleteTasks, error: tasksError } = await supabase
      .from('spk_tugas')
      .select('id_spk, tipe_tugas')
      .neq('status_tugas', 'SELESAI');
    
    if (tasksError) throw tasksError;
    
    if (!incompleteTasks || incompleteTasks.length === 0) {
      console.log('⚠️  No incomplete tasks found');
      return {
        deadline_validasi: null,
        deadline_aph: null,
        deadline_sanitasi: null
      };
    }
    
    // Step 2: Get SPK headers for these tasks
    const spkIds = [...new Set(incompleteTasks.map(t => t.id_spk))];
    
    const { data: spkHeaders, error: headersError } = await supabase
      .from('spk_header')
      .select('id_spk, tanggal_target')
      .in('id_spk', spkIds);
    
    if (headersError) throw headersError;
    
    if (!spkHeaders || spkHeaders.length === 0) {
      console.log('⚠️  No SPK headers found');
      return {
        deadline_validasi: null,
        deadline_aph: null,
        deadline_sanitasi: null
      };
    }
    
    // Create SPK ID to deadline map
    const spkDeadlineMap = {};
    spkHeaders.forEach(spk => {
      spkDeadlineMap[spk.id_spk] = spk.tanggal_target;
    });
    
    // Group deadlines by category and find earliest
    let earliestValidasi = null;
    let earliestAph = null;
    let earliestSanitasi = null;
    
    incompleteTasks.forEach(task => {
      const tipe = task.tipe_tugas?.trim().toUpperCase() || '';
      const deadline = spkDeadlineMap[task.id_spk];
      
      if (!deadline) return;
      
      const deadlineDate = new Date(deadline);
      
      if (tipe.includes('VALIDASI') || tipe.includes('DRONE')) {
        if (!earliestValidasi || deadlineDate < new Date(earliestValidasi)) {
          earliestValidasi = deadline;
        }
      } else if (tipe === 'APH') {
        if (!earliestAph || deadlineDate < new Date(earliestAph)) {
          earliestAph = deadline;
        }
      } else if (tipe.includes('SANITASI')) {
        if (!earliestSanitasi || deadlineDate < new Date(earliestSanitasi)) {
          earliestSanitasi = deadline;
        }
      }
    });
    
    // Format to YYYY-MM-DD
    const formatDate = (dateStr) => {
      if (!dateStr) return null;
      return new Date(dateStr).toISOString().split('T')[0];
    };
    
    const result = {
      deadline_validasi: formatDate(earliestValidasi),
      deadline_aph: formatDate(earliestAph),
      deadline_sanitasi: formatDate(earliestSanitasi)
    };
    
    console.log('✅ Deadlines:', result);
    
    return result;
    
  } catch (err) {
    console.error('❌ Error calculating Deadlines:', err.message);
    return {
      deadline_validasi: null,
      deadline_aph: null,
      deadline_sanitasi: null
    };
  }
}

/**
 * ENHANCEMENT: Calculate Risk Level for Each Category
 * 
 * Business Rules:
 * - CRITICAL: Overdue OR No workers assigned OR (Progress < 30% AND < 7 days left)
 * - MEDIUM: Progress < 70% AND < 14 days left
 * - LOW: Progress >= 70% OR > 14 days left
 * 
 * @param {string} category - 'VALIDASI', 'APH', or 'SANITASI'
 * @param {number} target - Total tasks
 * @param {number} selesai - Completed tasks
 * @param {string|null} deadline - ISO date string
 * @param {number} pelaksanaAssigned - Number of workers assigned
 * @returns {string} 'LOW', 'MEDIUM', or 'CRITICAL'
 */
function calculateRiskLevel(category, target, selesai, deadline, pelaksanaAssigned) {
  try {
    // Default to MEDIUM if no data
    if (target === 0) return 'LOW';
    
    const progress = selesai / target;
    
    // Calculate days to deadline
    let daysToDeadline = null;
    if (deadline) {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      const diffMs = deadlineDate - now;
      daysToDeadline = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }
    
    // Rule 1: Already overdue
    if (daysToDeadline !== null && daysToDeadline < 0) {
      return 'CRITICAL';
    }
    
    // Rule 2: No workers assigned and not 100% complete
    if (pelaksanaAssigned === 0 && progress < 1.0) {
      return 'CRITICAL';
    }
    
    // Rule 3: Low progress with approaching deadline
    if (daysToDeadline !== null && progress < 0.3 && daysToDeadline < 7) {
      return 'CRITICAL';
    }
    
    // Rule 4: Medium progress with some time left
    if (daysToDeadline !== null && progress < 0.7 && daysToDeadline < 14) {
      return 'MEDIUM';
    }
    
    // Rule 5: On track
    if (progress >= 0.7 || daysToDeadline === null || daysToDeadline > 14) {
      return 'LOW';
    }
    
    return 'MEDIUM'; // Default
    
  } catch (err) {
    console.error(`❌ Error calculating risk level for ${category}:`, err.message);
    return 'MEDIUM';
  }
}

/**
 * ENHANCEMENT: Detect Blockers for Each Category
 * 
 * Checks:
 * 1. Overdue tasks
 * 2. No pelaksana assigned
 * 3. Pelaksana shortage (insufficient workers)
 * 4. Stalled progress (no update in 3+ days)
 * 
 * @param {string} category - 'VALIDASI', 'APH', or 'SANITASI'
 * @param {number} target - Total tasks
 * @param {number} selesai - Completed tasks
 * @param {string|null} deadline - ISO date string
 * @param {number} pelaksanaAssigned - Number of workers assigned
 * @returns {Array<string>} List of blocker messages
 */
function detectBlockers(category, target, selesai, deadline, pelaksanaAssigned) {
  const blockers = [];
  
  try {
    const progress = selesai / target;
    
    // Calculate days to deadline
    let daysToDeadline = null;
    if (deadline) {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      const diffMs = deadlineDate - now;
      daysToDeadline = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }
    
    // Check 1: Overdue
    if (daysToDeadline !== null && daysToDeadline < 0) {
      blockers.push(`Deadline passed by ${Math.abs(daysToDeadline)} days`);
    }
    
    // Check 2: No pelaksana assigned
    if (pelaksanaAssigned === 0 && target > 0 && progress < 1.0) {
      blockers.push('No pelaksana assigned yet');
    }
    
    // Check 3: Insufficient workers (assume 3 tasks per worker)
    if (target > 0 && progress < 0.5) {
      const requiredWorkers = Math.ceil(target / 3);
      if (pelaksanaAssigned > 0 && pelaksanaAssigned < requiredWorkers) {
        const shortage = requiredWorkers - pelaksanaAssigned;
        blockers.push(`Pelaksana shortage (need ${shortage} more workers)`);
      }
    }
    
    // Note: Check 4 (stalled progress) would require querying updated_at timestamps
    // Skipped for now to maintain performance
    
  } catch (err) {
    console.error(`❌ Error detecting blockers for ${category}:`, err.message);
  }
  
  return blockers;
}

/**
 * ENHANCEMENT: Calculate Resource Allocation (Pelaksana Count)
 * 
 * Logika:
 * - COUNT DISTINCT id_pelaksana per category
 * - Only count incomplete tasks (not SELESAI)
 */
async function calculateResourceAllocation() {
  try {
    console.log('🔍 [ENHANCEMENT] Calculating Resource Allocation...');
    
    // Query all incomplete tasks
    const { data, error } = await supabase
      .from('spk_tugas')
      .select('tipe_tugas, id_pelaksana, status_tugas')
      .neq('status_tugas', 'SELESAI')
      .not('id_pelaksana', 'is', null);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return {
        pelaksana_assigned_validasi: 0,
        pelaksana_assigned_aph: 0,
        pelaksana_assigned_sanitasi: 0
      };
    }
    
    // Use Sets to count unique pelaksana per category
    const validasiPelaksana = new Set();
    const aphPelaksana = new Set();
    const sanitasiPelaksana = new Set();
    
    data.forEach(task => {
      const tipe = task.tipe_tugas?.trim().toUpperCase() || '';
      const pelaksana = task.id_pelaksana;
      
      if (!pelaksana) return;
      
      if (tipe.includes('VALIDASI') || tipe.includes('DRONE')) {
        validasiPelaksana.add(pelaksana);
      } else if (tipe === 'APH') {
        aphPelaksana.add(pelaksana);
      } else if (tipe.includes('SANITASI')) {
        sanitasiPelaksana.add(pelaksana);
      }
    });
    
    const result = {
      pelaksana_assigned_validasi: validasiPelaksana.size,
      pelaksana_assigned_aph: aphPelaksana.size,
      pelaksana_assigned_sanitasi: sanitasiPelaksana.size
    };
    
    console.log('✅ Resource Allocation:', result);
    
    return result;
    
  } catch (err) {
    console.error('❌ Error calculating Resource Allocation:', err.message);
    return {
      pelaksana_assigned_validasi: 0,
      pelaksana_assigned_aph: 0,
      pelaksana_assigned_sanitasi: 0
    };
  }
}

/**
 * 📊 ENHANCEMENT: Get Planning Tasks by Category
 * 
 * Requirements: PERINTAH_KERJA_BACKEND_Dummy_Data_Injection.md #3
 * Fetch tasks dari spk_tugas (existing table dengan kolom tambahan)
 * 
 * SCHEMA: spk_tugas
 * - tipe_tugas = VALIDASI_DRONE, APH, SANITASI
 * - status_tugas = SELESAI (Done), DIKERJAKAN (In Progress), BARU (Pending)
 * - task_description = task name
 * - pic_name = person in charge
 * - deadline = task deadline
 * - task_priority = HIGH, MEDIUM, LOW
 * 
 * @param {String} category - VALIDASI_DRONE, APH, atau SANITASI
 * @returns {Array} List of tasks with name, status, PIC, deadline, priority
 */
async function getTasksByCategory(category) {
  try {
    // Map category ke tipe_tugas
    const categoryMap = {
      'VALIDASI': 'VALIDASI_DRONE',
      'APH': 'APH',
      'SANITASI': 'SANITASI'
    };
    
    const tipeTugas = categoryMap[category.toUpperCase()] || category.toUpperCase();
    
    const { data, error } = await supabase
      .from('spk_tugas')
      .select('task_description, status_tugas, pic_name, deadline, task_priority, id_pelaksana')
      .eq('tipe_tugas', tipeTugas)
      .in('id_spk', [
        supabase.from('spk_header').select('id_spk').like('nama_spk', 'DUMMY_Planning_%')
      ])
      .order('deadline', { ascending: true });
    
    if (error) throw error;
    
    // Map status_tugas to frontend format
    const statusMap = {
      'SELESAI': 'Done',
      'DIKERJAKAN': 'In Progress',
      'BARU': 'Pending'
    };
    
    const tasks = (data || []).map(task => ({
      name: task.task_description,
      status: statusMap[task.status_tugas?.trim().toUpperCase()] || 'Pending',
      pic: task.pic_name,
      deadline: task.deadline,
      priority: task.task_priority?.toLowerCase() || 'medium'
    }));
    
    console.log(`✅ Tasks for ${category}: ${tasks.length} items`);
    
    return tasks;
    
  } catch (err) {
    console.error(`❌ Error fetching tasks for ${category}:`, err.message);
    return [];
  }
}

/**
 * 📊 ENHANCEMENT: Get Planning Blockers by Category
 * 
 * Requirements: PERINTAH_KERJA_BACKEND_Dummy_Data_Injection.md #4
 * Fetch blockers dari spk_header (existing table dengan kolom tambahan)
 * 
 * SCHEMA: spk_header
 * - nama_spk LIKE 'DUMMY_BLOCKER_{category}_%'
 * - blocker_description = blocker detail
 * - blocker_severity = HIGH, MEDIUM, LOW
 * - tanggal_target = identified date
 * 
 * @param {String} category - VALIDASI, APH, atau SANITASI
 * @returns {Array} List of blockers with description, severity, status
 */
async function getBlockersByCategory(category) {
  try {
    const { data, error } = await supabase
      .from('spk_header')
      .select('blocker_description, blocker_severity, tanggal_target_selesai')
      .like('nama_spk', `DUMMY_BLOCKER_${category.toUpperCase()}_%`)
      .not('blocker_description', 'is', null)
      .order('blocker_severity', { ascending: true });  // HIGH first
    
    if (error) throw error;
    
    const blockers = (data || []).map(blocker => ({
      description: blocker.blocker_description,
      severity: blocker.blocker_severity,
      status: 'OPEN',  // All blockers are active
      since: blocker.tanggal_target_selesai
    }));
    
    console.log(`✅ Blockers for ${category}: ${blockers.length} items`);
    
    return blockers;
    
  } catch (err) {
    console.error(`❌ Error fetching blockers for ${category}:`, err.message);
    return [];
  }
}

/**
 * 📊 PANEN METRICS - NEW SCHEMA (ops_*)
 * 
 * Requirements: Tahap 6 SPK Workflow Model
 * Fetch execution data from ops_eksekusi_tindakan (NEW schema)
 * 
 * WORKFLOW: SOP → Jadwal → SPK → Eksekusi
 * 
 * SCHEMA: ops_eksekusi_tindakan
 * - id_spk (FK to ops_spk_tindakan)
 * - hasil = "X ton TBS, reject Y ton (Z%)"
 * - tanggal_eksekusi
 * - petugas
 * - catatan
 * 
 * @returns {Object} Panen metrics with summary and breakdown
 */
async function getPanenMetrics() {
  try {
    console.log('🔍 [PANEN] Calculating Panen Metrics (NEW Schema)...');
    
    // Query all PANEN executions with full workflow JOIN
    const { data, error } = await supabase
      .from('ops_eksekusi_tindakan')
      .select(`
        id_eksekusi_tindakan,
        tanggal_eksekusi,
        hasil,
        petugas,
        catatan,
        ops_spk_tindakan!inner (
          id_spk,
          nomor_spk,
          lokasi,
          mandor,
          status,
          tanggal_mulai,
          tanggal_selesai
        ),
        ops_jadwal_tindakan!inner (
          ops_sub_tindakan!inner (
            nama_sub,
            ops_fase_besar!inner (
              nama_fase
            )
          )
        )
      `)
      .not('id_spk', 'is', null);  // Only executions linked to SPK
    
    if (error) throw error;
    
    console.log(`📊 Total Panen Executions: ${data?.length || 0}`);
    
    if (!data || data.length === 0) {
      return {
        summary: {
          total_ton_tbs: 0,
          avg_reject_persen: 0,
          total_spk: 0,
          total_executions: 0
        },
        by_spk: [],
        weekly_breakdown: []
      };
    }
    
    // Parse hasil field: "X ton TBS, reject Y ton (Z%)"
    const parseHasil = (hasil) => {
      if (!hasil) return { ton_tbs: 0, reject_ton: 0, reject_persen: 0 };
      
      try {
        // Extract: "102.5 ton TBS, reject 2.1 ton (2.0%)"
        const tonMatch = hasil.match(/([\d.]+)\s*ton\s*TBS/i);
        const rejectTonMatch = hasil.match(/reject\s*([\d.]+)\s*ton/i);
        const rejectPersenMatch = hasil.match(/\(([\d.]+)%\)/);
        
        return {
          ton_tbs: tonMatch ? parseFloat(tonMatch[1]) : 0,
          reject_ton: rejectTonMatch ? parseFloat(rejectTonMatch[1]) : 0,
          reject_persen: rejectPersenMatch ? parseFloat(rejectPersenMatch[1]) : 0
        };
      } catch (err) {
        console.error('⚠️  Error parsing hasil:', hasil, err);
        return { ton_tbs: 0, reject_ton: 0, reject_persen: 0 };
      }
    };
    
    // Process all executions
    const executionsParsed = data.map(exec => {
      const parsed = parseHasil(exec.hasil);
      
      return {
        id_eksekusi: exec.id_eksekusi_tindakan,
        tanggal: exec.tanggal_eksekusi,
        ton_tbs: parsed.ton_tbs,
        reject_ton: parsed.reject_ton,
        reject_persen: parsed.reject_persen,
        petugas: exec.petugas,
        catatan: exec.catatan,
        spk: {
          id_spk: exec.ops_spk_tindakan.id_spk,
          nomor_spk: exec.ops_spk_tindakan.nomor_spk,
          lokasi: exec.ops_spk_tindakan.lokasi,
          mandor: exec.ops_spk_tindakan.mandor,
          status: exec.ops_spk_tindakan.status,
          tanggal_mulai: exec.ops_spk_tindakan.tanggal_mulai,
          tanggal_selesai: exec.ops_spk_tindakan.tanggal_selesai
        }
      };
    });
    
    // Calculate summary
    const totalTonTbs = executionsParsed.reduce((sum, e) => sum + e.ton_tbs, 0);
    const totalRejectPersen = executionsParsed.reduce((sum, e) => sum + e.reject_persen, 0);
    const avgRejectPersen = executionsParsed.length > 0 
      ? totalRejectPersen / executionsParsed.length 
      : 0;
    
    const uniqueSpks = [...new Set(executionsParsed.map(e => e.spk.id_spk))];
    
    const summary = {
      total_ton_tbs: parseFloat(totalTonTbs.toFixed(1)),
      avg_reject_persen: parseFloat(avgRejectPersen.toFixed(2)),
      total_spk: uniqueSpks.length,
      total_executions: executionsParsed.length
    };
    
    // Group by SPK
    const spkMap = {};
    
    executionsParsed.forEach(exec => {
      const spkId = exec.spk.id_spk;
      
      if (!spkMap[spkId]) {
        spkMap[spkId] = {
          nomor_spk: exec.spk.nomor_spk,
          lokasi: exec.spk.lokasi,
          mandor: exec.spk.mandor,
          status: exec.spk.status,
          tanggal_mulai: exec.spk.tanggal_mulai,
          tanggal_selesai: exec.spk.tanggal_selesai,
          total_ton: 0,
          avg_reject: 0,
          execution_count: 0,
          executions: []
        };
      }
      
      spkMap[spkId].total_ton += exec.ton_tbs;
      spkMap[spkId].avg_reject += exec.reject_persen;
      spkMap[spkId].execution_count += 1;
      spkMap[spkId].executions.push({
        tanggal: exec.tanggal,
        ton_tbs: exec.ton_tbs,
        reject_persen: exec.reject_persen,
        petugas: exec.petugas
      });
    });
    
    // Convert to array and calculate averages
    const bySpk = Object.values(spkMap).map(spk => ({
      nomor_spk: spk.nomor_spk,
      lokasi: spk.lokasi,
      mandor: spk.mandor,
      status: spk.status,
      periode: `${spk.tanggal_mulai} s/d ${spk.tanggal_selesai}`,
      total_ton: parseFloat(spk.total_ton.toFixed(1)),
      avg_reject: parseFloat((spk.avg_reject / spk.execution_count).toFixed(2)),
      execution_count: spk.execution_count,
      executions: spk.executions
    }));
    
    // Sort by tanggal_mulai
    bySpk.sort((a, b) => new Date(a.periode.split(' s/d ')[0]) - new Date(b.periode.split(' s/d ')[0]));
    
    // Weekly breakdown (group by week)
    const weeklyMap = {};
    
    executionsParsed.forEach(exec => {
      const date = new Date(exec.tanggal);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());  // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyMap[weekKey]) {
        weeklyMap[weekKey] = {
          week_start: weekKey,
          total_ton: 0,
          avg_reject: 0,
          execution_count: 0
        };
      }
      
      weeklyMap[weekKey].total_ton += exec.ton_tbs;
      weeklyMap[weekKey].avg_reject += exec.reject_persen;
      weeklyMap[weekKey].execution_count += 1;
    });
    
    const weeklyBreakdown = Object.values(weeklyMap).map(week => ({
      week_start: week.week_start,
      total_ton: parseFloat(week.total_ton.toFixed(1)),
      avg_reject: parseFloat((week.avg_reject / week.execution_count).toFixed(2)),
      execution_count: week.execution_count
    }));
    
    // Sort by week
    weeklyBreakdown.sort((a, b) => new Date(a.week_start) - new Date(b.week_start));
    
    console.log('✅ Panen Metrics Summary:', summary);
    console.log(`   By SPK: ${bySpk.length} documents`);
    console.log(`   Weekly: ${weeklyBreakdown.length} weeks`);
    
    return {
      summary,
      by_spk: bySpk,
      weekly_breakdown: weeklyBreakdown
    };
    
  } catch (err) {
    console.error('❌ Error calculating Panen Metrics:', err.message);
    throw err;
  }
}

/**
 * MAIN SERVICE FUNCTION: Get Dashboard Operasional
 * 
 * Menggabungkan semua data operasional dalam satu response
 * Sesuai kontrak API: GET /api/v1/dashboard/operasional
 * 
 * ENHANCED with:
 * - deadline_{validasi, aph, sanitasi}
 * - risk_level_{validasi, aph, sanitasi}
 * - blockers_{validasi, aph, sanitasi}
 * - pelaksana_assigned_{validasi, aph, sanitasi}
 * - kpi_hasil_panen (NEW: Tahap 6 model)
 * 
 * @param {Object} filters - Optional filters (divisi, tanggal, dll)
 * @returns {Object} Dashboard operasional data
 */
async function getDashboardOperasional(filters = {}) {
  try {
    console.log('🚀 [START] Get Dashboard Operasional (Enhanced)', { filters });
    
    // Prinsip SKALABILITAS: Run queries in parallel
    const [
      dataCorong, 
      dataPapanPeringkat,
      deadlines,
      resourceAllocation,
      validasiTasks,     // ✨ NEW: Fetch planning tasks
      aphTasks,
      sanitasiTasks,
      validasiBlockersDb,  // ✨ NEW: Fetch database blockers
      aphBlockersDb,
      sanitasiBlockersDb,
      panenMetrics        // 🆕 NEW: Panen KPI (Tahap 6)
    ] = await Promise.all([
      calculateDataCorong(),
      calculatePapanPeringkat(),
      calculateDeadlines(),
      calculateResourceAllocation(),
      getTasksByCategory('VALIDASI'),      // ✨ NEW
      getTasksByCategory('APH'),            // ✨ NEW
      getTasksByCategory('SANITASI'),       // ✨ NEW
      getBlockersByCategory('VALIDASI'),    // ✨ NEW
      getBlockersByCategory('APH'),         // ✨ NEW
      getBlockersByCategory('SANITASI'),    // ✨ NEW
      getPanenMetrics()                     // 🆕 NEW
    ]);
    
    // Calculate risk levels (synchronous - based on data we already have)
    const riskLevelValidasi = calculateRiskLevel(
      'VALIDASI',
      dataCorong.target_validasi,
      dataCorong.validasi_selesai,
      deadlines.deadline_validasi,
      resourceAllocation.pelaksana_assigned_validasi
    );
    
    const riskLevelAph = calculateRiskLevel(
      'APH',
      dataCorong.target_aph,
      dataCorong.aph_selesai,
      deadlines.deadline_aph,
      resourceAllocation.pelaksana_assigned_aph
    );
    
    const riskLevelSanitasi = calculateRiskLevel(
      'SANITASI',
      dataCorong.target_sanitasi,
      dataCorong.sanitasi_selesai,
      deadlines.deadline_sanitasi,
      resourceAllocation.pelaksana_assigned_sanitasi
    );
    
    // Detect blockers (synchronous - based on data we already have)
    const blockersValidasi = detectBlockers(
      'VALIDASI',
      dataCorong.target_validasi,
      dataCorong.validasi_selesai,
      deadlines.deadline_validasi,
      resourceAllocation.pelaksana_assigned_validasi
    );
    
    const blockersAph = detectBlockers(
      'APH',
      dataCorong.target_aph,
      dataCorong.aph_selesai,
      deadlines.deadline_aph,
      resourceAllocation.pelaksana_assigned_aph
    );
    
    const blockersSanitasi = detectBlockers(
      'SANITASI',
      dataCorong.target_sanitasi,
      dataCorong.sanitasi_selesai,
      deadlines.deadline_sanitasi,
      resourceAllocation.pelaksana_assigned_sanitasi
    );
    
    // Struktur response sesuai kontrak API (ENHANCED)
    return {
      data_corong: {
        // EXISTING FIELDS (backward compatible)
        target_validasi: dataCorong.target_validasi,
        validasi_selesai: dataCorong.validasi_selesai,
        target_aph: dataCorong.target_aph,
        aph_selesai: dataCorong.aph_selesai,
        target_sanitasi: dataCorong.target_sanitasi,
        sanitasi_selesai: dataCorong.sanitasi_selesai,
        
        // ⭐ NEW ENHANCEMENT FIELDS - Deadlines
        deadline_validasi: deadlines.deadline_validasi,
        deadline_aph: deadlines.deadline_aph,
        deadline_sanitasi: deadlines.deadline_sanitasi,
        
        // ⭐ NEW ENHANCEMENT FIELDS - Risk Levels
        risk_level_validasi: riskLevelValidasi,
        risk_level_aph: riskLevelAph,
        risk_level_sanitasi: riskLevelSanitasi,
        
        // ⭐ NEW ENHANCEMENT FIELDS - Blockers (calculated)
        blockers_validasi: blockersValidasi,
        blockers_aph: blockersAph,
        blockers_sanitasi: blockersSanitasi,
        
        // ⭐ NEW ENHANCEMENT FIELDS - Resource Allocation
        pelaksana_assigned_validasi: resourceAllocation.pelaksana_assigned_validasi,
        pelaksana_assigned_aph: resourceAllocation.pelaksana_assigned_aph,
        pelaksana_assigned_sanitasi: resourceAllocation.pelaksana_assigned_sanitasi,
        
        // ✨ NEW DRILL-DOWN FIELDS - Planning Tasks
        validasi_tasks: validasiTasks,
        aph_tasks: aphTasks,
        sanitasi_tasks: sanitasiTasks,
        
        // ✨ NEW DRILL-DOWN FIELDS - Database Blockers (detailed)
        validasi_blockers_detail: validasiBlockersDb,
        aph_blockers_detail: aphBlockersDb,
        sanitasi_blockers_detail: sanitasiBlockersDb
      },
      data_papan_peringkat: dataPapanPeringkat,
      
      // 🆕 NEW KPI: Hasil Panen (Tahap 6 Model)
      kpi_hasil_panen: panenMetrics,
      
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
  calculatePapanPeringkat,
  // Export enhancement functions
  calculateDeadlines,
  calculateRiskLevel,
  detectBlockers,
  calculateResourceAllocation,
  // Export drill-down functions (NEW)
  getTasksByCategory,
  getBlockersByCategory,
  // Export PANEN metrics (NEW - Tahap 6)
  getPanenMetrics
};
