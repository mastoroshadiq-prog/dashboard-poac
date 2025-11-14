/**
 * MANDOR ROUTES - API ENDPOINTS
 * Dashboard Mandor - Task Execution & Team Management
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// ENDPOINT 1: Dashboard Overview
router.get('/:mandor_id/dashboard', async (req, res) => {
  try {
    const { mandor_id } = req.params;
    console.log(` [Mandor] Dashboard for: ${mandor_id}`);

    // Get SPK Summary
    const { data: spkData } = await supabase
      .from('spk_header')
      .select(`id_spk, status_spk, risk_level, tanggal_target_selesai, spk_tugas!inner(id_tugas, status_tugas, id_pelaksana)`)
      .eq('spk_tugas.id_pelaksana', mandor_id);

    const activeSPK = spkData ? spkData.filter(s => s.status_spk === 'PENDING' || s.status_spk === 'DIKERJAKAN').length : 0;

    // Get Tasks
    const { data: tasksData } = await supabase
      .from('spk_tugas')
      .select('id_tugas, status_tugas')
      .eq('id_pelaksana', mandor_id);

    const pendingTasks = tasksData ? tasksData.filter(t => t.status_tugas === 'PENDING').length : 0;
    const inProgressTasks = tasksData ? tasksData.filter(t => t.status_tugas === 'IN_PROGRESS').length : 0;
    const completedTasks = tasksData ? tasksData.filter(t => t.status_tugas === 'COMPLETED').length : 0;

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          active_spk: activeSPK,
          pending_tasks: pendingTasks,
          in_progress_tasks: inProgressTasks,
          completed_today: 0,
          urgent_count: 0,
          overdue_count: 0
        },
        today_targets: {
          trees_to_validate: tasksData ? tasksData.length : 0,
          completed: completedTasks,
          remaining: tasksData ? tasksData.length - completedTasks : 0,
          progress_percentage: tasksData && tasksData.length > 0 ? parseFloat(((completedTasks / tasksData.length) * 100).toFixed(1)) : 0
        },
        surveyor_workload: [],
        urgent_items: []
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ENDPOINT 2: Surveyor List
router.get('/:mandor_id/surveyors', async (req, res) => {
  try {
    console.log(` [Mandor] Surveyors for: ${req.params.mandor_id}`);

    const { data: surveyors } = await supabase
      .from('kebun_pihak')
      .select('id_pihak, nama_lengkap')
      .eq('role', 'SURVEYOR')
      .eq('is_active', true);

    const enrichedSurveyors = (surveyors || []).map(s => ({
      surveyor_id: s.id_pihak,
      name: s.nama_lengkap,
      status: 'AVAILABLE',
      current_workload: { active_tasks: 0, pending_tasks: 0, completed_today: 0 },
      performance: { completion_rate: 0, avg_time_per_task: 25, quality_score: 88.0 }
    }));

    return res.status(200).json({
      success: true,
      data: {
        surveyors: enrichedSurveyors,
        summary: {
          total_surveyors: enrichedSurveyors.length,
          available: enrichedSurveyors.length,
          working: 0,
          off_duty: 0
        }
      }
    });
  } catch (error) {
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
