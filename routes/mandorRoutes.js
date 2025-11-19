/**
 * MANDOR ROUTES - API ENDPOINTS
 * Dashboard Mandor - Task Execution & Team Management
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const verifySupabaseAuth = require('../middleware/supabaseAuthMiddleware');

// Apply auth middleware to all routes
router.use(verifySupabaseAuth);

// ENDPOINT: Dashboard Overview (from authenticated user)
// GET /api/v1/mandor/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const mandor_id = req.user.id_pihak;
    
    if (!mandor_id) {
      return res.status(400).json({
        success: false,
        message: 'User tidak terhubung dengan master_pihak'
      });
    }

    console.log(`📊 [Mandor Dashboard] User: ${req.user.email} (${mandor_id})`);

    // Get SPKs where this mandor is assigned
    const { data: spkData, error: spkError } = await supabase
      .from('spk_header')
      .select(`
        id_spk, 
        nama_spk,
        status_spk, 
        risk_level, 
        tanggal_target_selesai,
        spk_tugas!inner(
          id_tugas, 
          status_tugas, 
          id_pelaksana,
          tipe_tugas,
          target_json,
          prioritas
        )
      `)
      .eq('spk_tugas.id_pelaksana', mandor_id);

    if (spkError) {
      console.error('❌ Error fetching SPK:', spkError);
      throw spkError;
    }

    // Count unique SPKs
    const uniqueSPKs = spkData ? [...new Map(spkData.map(s => [s.id_spk, s])).values()] : [];
    const activeSPK = uniqueSPKs.filter(s => 
      s.status_spk === 'PENDING' || s.status_spk === 'DIKERJAKAN' || s.status_spk === 'BARU'
    ).length;

    // Get all tasks
    const { data: tasksData, error: tasksError } = await supabase
      .from('spk_tugas')
      .select(`
        id_tugas, 
        id_spk,
        status_tugas, 
        tipe_tugas,
        prioritas,
        target_json,
        spk_header!inner(nama_spk, status_spk)
      `)
      .eq('id_pelaksana', mandor_id);

    if (tasksError) {
      console.error('❌ Error fetching tasks:', tasksError);
      throw tasksError;
    }

    const totalTasks = tasksData ? tasksData.length : 0;
    const pendingTasks = tasksData ? tasksData.filter(t => 
      t.status_tugas === 'PENDING' || t.status_tugas === 'BARU'
    ).length : 0;
    const inProgressTasks = tasksData ? tasksData.filter(t => 
      t.status_tugas === 'DIKERJAKAN' || t.status_tugas === 'IN_PROGRESS'
    ).length : 0;
    const completedTasks = tasksData ? tasksData.filter(t => 
      t.status_tugas === 'SELESAI' || t.status_tugas === 'COMPLETED'
    ).length : 0;

    res.json({
      success: true,
      data: {
        mandor: req.user.pihak,
        metrics: {
          total_spk: uniqueSPKs.length,
          spk_aktif: activeSPK,
          total_tugas: totalTasks,
          tugas_pending: pendingTasks,
          tugas_dikerjakan: inProgressTasks,
          tugas_selesai: completedTasks
        },
        recent_spk: uniqueSPKs.slice(0, 5),
        recent_tasks: tasksData ? tasksData.slice(0, 10) : []
      }
    });

  } catch (error) {
    console.error('❌ [Mandor Dashboard] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dashboard mandor',
      error: error.message
    });
  }
});

// LEGACY ENDPOINT: Dashboard with mandor_id parameter (for backward compatibility)
router.get('/:mandor_id/dashboard', async (req, res) => {
  try {
    const { mandor_id } = req.params;
    console.log(`📊 [Mandor Dashboard] User: ${mandor_id}`);

    // Get SPKs where this mandor is assigned (via spk_tugas)
    // IMPORTANT: We query SPK headers that have at least one task assigned to this mandor
    const { data: spkData, error: spkError } = await supabase
      .from('spk_header')
      .select(`
        id_spk, 
        nama_spk,
        status_spk, 
        risk_level, 
        tanggal_target_selesai,
        spk_tugas!inner(
          id_tugas, 
          status_tugas, 
          id_pelaksana,
          tipe_tugas,
          target_json,
          prioritas
        )
      `)
      .eq('spk_tugas.id_pelaksana', mandor_id);

    if (spkError) {
      console.error('❌ Error fetching SPK:', spkError);
      throw spkError;
    }

    // Count unique SPKs (one SPK can have multiple tasks for same mandor)
    const uniqueSPKs = spkData ? [...new Map(spkData.map(s => [s.id_spk, s])).values()] : [];
    const activeSPK = uniqueSPKs.filter(s => 
      s.status_spk === 'PENDING' || s.status_spk === 'DIKERJAKAN' || s.status_spk === 'BARU'
    ).length;

    // Get all tasks for this mandor
    const { data: tasksData, error: tasksError } = await supabase
      .from('spk_tugas')
      .select(`
        id_tugas, 
        id_spk,
        status_tugas, 
        tipe_tugas,
        prioritas,
        target_json,
        spk_header!inner(nama_spk, status_spk)
      `)
      .eq('id_pelaksana', mandor_id);

    if (tasksError) {
      console.error('❌ Error fetching tasks:', tasksError);
      throw tasksError;
    }

    // Calculate task statistics
    const totalTasks = tasksData ? tasksData.length : 0;
    const pendingTasks = tasksData ? tasksData.filter(t => 
      t.status_tugas === 'PENDING' || t.status_tugas === 'BARU'
    ).length : 0;
    const inProgressTasks = tasksData ? tasksData.filter(t => 
      t.status_tugas === 'DIKERJAKAN' || t.status_tugas === 'IN_PROGRESS'
    ).length : 0;
    const completedTasks = tasksData ? tasksData.filter(t => 
      t.status_tugas === 'SELESAI' || t.status_tugas === 'COMPLETED'
    ).length : 0;

    // Get urgent tasks (high priority or near deadline)
    const urgentTasks = tasksData ? tasksData.filter(t => 
      t.prioritas === 1 || t.status_tugas === 'PENDING'
    ).slice(0, 5) : [];

    console.log(`✅ Found ${uniqueSPKs.length} SPK(s), ${totalTasks} task(s) for mandor ${mandor_id}`);

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          active_spk: activeSPK,
          total_spk: uniqueSPKs.length,
          pending_tasks: pendingTasks,
          in_progress_tasks: inProgressTasks,
          completed_today: completedTasks, // TODO: Filter by today's date
          urgent_count: urgentTasks.length,
          overdue_count: 0 // TODO: Calculate based on deadline
        },
        today_targets: {
          trees_to_validate: totalTasks,
          completed: completedTasks,
          remaining: totalTasks - completedTasks,
          progress_percentage: totalTasks > 0 ? parseFloat(((completedTasks / totalTasks) * 100).toFixed(1)) : 0
        },
        spk_list: uniqueSPKs.map(spk => ({
          id_spk: spk.id_spk,
          nama_spk: spk.nama_spk,
          status: spk.status_spk,
          risk_level: spk.risk_level,
          deadline: spk.tanggal_target_selesai,
          task_count: spkData.filter(s => s.id_spk === spk.id_spk).length
        })),
        urgent_items: urgentTasks.map(task => ({
          id_tugas: task.id_tugas,
          id_spk: task.id_spk,
          spk_name: task.spk_header?.nama_spk,
          tipe_tugas: task.tipe_tugas,
          status: task.status_tugas,
          prioritas: task.prioritas,
          target: task.target_json
        }))
      }
    });
  } catch (error) {
    console.error('❌ [Mandor Dashboard] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ENDPOINT 2: Surveyor List
// Mandor uses this to see available surveyors for task assignment
router.get('/:mandor_id/surveyors', async (req, res) => {
  try {
    const { mandor_id } = req.params;
    console.log(`👥 [Mandor Surveyors] Mandor: ${mandor_id}`);

    // Get surveyors from master_pihak (using tipe='PEKERJA' or similar)
    // Note: Adjust the tipe filter based on your actual data
    const { data: surveyors, error: surveyorError } = await supabase
      .from('master_pihak')
      .select('id_pihak, nama, tipe, kode_unik')
      .eq('tipe', 'PEKERJA'); // Surveyors are stored as PEKERJA type

    if (surveyorError) {
      console.error('❌ Error fetching surveyors:', surveyorError);
      throw surveyorError;
    }

    // Get current workload for each surveyor
    const enrichedSurveyors = await Promise.all((surveyors || []).map(async (s) => {
      // Count tasks assigned to this surveyor
      const { data: tasks } = await supabase
        .from('spk_tugas')
        .select('id_tugas, status_tugas')
        .eq('id_pelaksana', s.id_pihak);

      const activeTasks = tasks ? tasks.filter(t => 
        t.status_tugas === 'DIKERJAKAN' || t.status_tugas === 'IN_PROGRESS'
      ).length : 0;
      const pendingTasks = tasks ? tasks.filter(t => 
        t.status_tugas === 'PENDING' || t.status_tugas === 'BARU'
      ).length : 0;
      const completedToday = tasks ? tasks.filter(t => 
        t.status_tugas === 'SELESAI' || t.status_tugas === 'COMPLETED'
      ).length : 0;

      // Determine availability status
      let status = 'AVAILABLE';
      if (activeTasks > 5) status = 'BUSY';
      else if (activeTasks > 2) status = 'WORKING';

      return {
        surveyor_id: s.id_pihak,
        name: s.nama,
        kode: s.kode_unik,
        status: status,
        current_workload: {
          active_tasks: activeTasks,
          pending_tasks: pendingTasks,
          completed_today: completedToday
        },
        performance: {
          completion_rate: tasks && tasks.length > 0 
            ? parseFloat(((completedToday / tasks.length) * 100).toFixed(1))
            : 0,
          avg_time_per_task: 25, // TODO: Calculate from log_aktivitas
          quality_score: 88.0 // TODO: Calculate from validation results
        }
      };
    }));

    const availableCount = enrichedSurveyors.filter(s => s.status === 'AVAILABLE').length;
    const workingCount = enrichedSurveyors.filter(s => s.status === 'WORKING' || s.status === 'BUSY').length;

    console.log(`✅ Found ${enrichedSurveyors.length} surveyor(s), ${availableCount} available`);

    return res.status(200).json({
      success: true,
      data: {
        surveyors: enrichedSurveyors,
        summary: {
          total_surveyors: enrichedSurveyors.length,
          available: availableCount,
          working: workingCount,
          off_duty: 0 // TODO: Track off-duty status
        }
      }
    });
  } catch (error) {
    console.error('❌ [Mandor Surveyors] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ENDPOINT 3: Real-time Progress
router.get('/:mandor_id/tasks/realtime', async (req, res) => {
  try {
    console.log(` [Mandor] Real-time for: ${req.params.mandor_id}`);

    const { data: activeTasks } = await supabase
      .from('spk_tugas')
      .select(`id_tugas, target_json, kebun_pihak!spk_tugas_id_pelaksana_fkey(nama_lengkap)`)
      .eq('status_tugas', 'IN_PROGRESS')
      .limit(20);

    const { data: recentCompletions } = await supabase
      .from('spk_tugas')
      .select(`id_tugas, target_json, kebun_pihak!spk_tugas_id_pelaksana_fkey(nama_lengkap)`)
      .eq('status_tugas', 'COMPLETED')
      .order('updated_at', { ascending: false })
      .limit(10);

    return res.status(200).json({
      success: true,
      data: {
        active_tasks: (activeTasks || []).map(t => ({
          task_id: t.id_tugas,
          surveyor_name: t.kebun_pihak?.nama_lengkap || 'Unknown',
          tree_id: t.target_json?.tree_id || 'N/A',
          location: 'N/A',
          status: 'IN_PROGRESS',
          elapsed_time_mins: 0
        })),
        recent_completions: (recentCompletions || []).map(t => ({
          task_id: t.id_tugas,
          surveyor_name: t.kebun_pihak?.nama_lengkap || 'Unknown',
          tree_id: t.target_json?.tree_id || 'N/A',
          time_taken_mins: 20
        }))
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ENDPOINT 4: Daily Performance
router.get('/:mandor_id/performance/daily', async (req, res) => {
  try {
    console.log(` [Mandor] Performance for: ${req.params.mandor_id}`);

    const { data: allTasks } = await supabase
      .from('spk_tugas')
      .select('id_tugas, status_tugas');

    const completedTasks = allTasks ? allTasks.filter(t => t.status_tugas === 'COMPLETED').length : 0;
    const totalTasks = allTasks ? allTasks.length : 0;

    return res.status(200).json({
      success: true,
      data: {
        date: new Date().toISOString().split('T')[0],
        targets: {
          planned_tasks: totalTasks,
          completed: completedTasks,
          in_progress: allTasks ? allTasks.filter(t => t.status_tugas === 'IN_PROGRESS').length : 0,
          pending: allTasks ? allTasks.filter(t => t.status_tugas === 'PENDING').length : 0,
          achievement_rate: totalTasks > 0 ? parseFloat(((completedTasks / totalTasks) * 100).toFixed(1)) : 0
        },
        by_surveyor: [],
        issues: [],
        recommendations: []
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
