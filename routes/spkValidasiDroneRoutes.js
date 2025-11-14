/**
 * SPK VALIDASI DRONE ROUTES
 * ========================
 * Routes untuk workflow SPK Validasi hasil drone NDRE
 * 
 * Workflow:
 * 1. Asisten Manager: Membuat SPK Validasi Drone (POST /validasi-drone)
 * 2. Mandor: Melihat SPK yang ditugaskan (GET /mandor/:mandor_id)
 * 3. Mandor: Menugaskan tugas ke surveyor (POST /:spk_id/assign-surveyor)
 * 
 * Author: Backend Team
 * Date: 2025-01-25
 */

const express = require('express');
const router = express.Router();
const spkValidasiDroneService = require('../services/spkValidasiDroneService');

// ============================================================
// ⚠️ CRITICAL: KANBAN ROUTE MUST BE FIRST!
// ============================================================
/**
 * GET /api/v1/spk/kanban
 * 
 * CRITICAL: This route MUST be defined BEFORE all other routes
 * to prevent /:spk_id from catching "kanban" as UUID parameter!
 * 
 * Response 200:
 * {
 *   "success": true,
 *   "data": {
 *     "PENDING": [...],
 *     "DIKERJAKAN": [...],
 *     "SELESAI": [...]
 *   }
 * }
 */
router.get('/kanban', async (req, res) => {
  try {
    console.log('✅✅✅ [SUCCESS] Route /kanban HIT FIRST!');
    console.log('📋 [Kanban] GET SPK Kanban');
    
    const filters = {
      divisi: req.query.divisi || null,
      afdeling: req.query.afdeling || null,
      mandor_id: req.query.mandor_id || null
    };
    
    // Import spkService for kanban function
    const spkService = require('../services/spkService');
    const result = await spkService.getSPKKanban(filters);
    
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Data SPK Kanban berhasil diambil'
    });
    
  } catch (error) {
    console.error('❌ Error getting SPK kanban:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Gagal mengambil data SPK Kanban'
    });
  }
});

// ============================================================
// ENDPOINT 1: CREATE SPK VALIDASI DRONE (Asisten Manager)
// ============================================================
/**
 * POST /api/v1/spk/validasi-drone
 * 
 * Request Body:
 * {
 *   "created_by": "uuid-asisten-manager",
 *   "assigned_to": "uuid-mandor", 
 *   "trees": ["uuid-tree-1", "uuid-tree-2", ...],
 *   "priority": "NORMAL|HIGH|URGENT",
 *   "deadline": "2025-02-01",  // Optional, auto-calculated if not provided
 *   "notes": "Validasi urgent area D001A"
 * }
 * 
 * Response 201:
 * {
 *   "success": true,
 *   "message": "SPK Validasi Drone berhasil dibuat",
 *   "data": {
 *     "spk": { id_spk, no_spk, jenis_kegiatan, ... },
 *     "tugas": [ { id_tugas, id_npokok, tree_id, ... } ],
 *     "summary": {
 *       "total_trees": 15,
 *       "stress_levels": { stres_berat: 8, stres_sedang: 5, sehat: 2 },
 *       "final_priority": "URGENT",
 *       "deadline": "2025-01-27"
 *     }
 *   }
 * }
 */
router.post('/validasi-drone', async (req, res) => {
  try {
    const { created_by, assigned_to, trees, priority, deadline, notes } = req.body;

    // Validasi input
    if (!created_by || !assigned_to || !trees || !Array.isArray(trees) || trees.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Validasi gagal',
        errors: {
          created_by: created_by ? null : 'created_by wajib diisi',
          assigned_to: assigned_to ? null : 'assigned_to (mandor) wajib diisi',
          trees: (!trees || !Array.isArray(trees) || trees.length === 0) 
            ? 'trees harus berupa array dengan minimal 1 pohon' 
            : null
        }
      });
    }

    // Validasi priority jika ada
    const validPriorities = ['NORMAL', 'HIGH', 'URGENT'];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: `Priority harus salah satu dari: ${validPriorities.join(', ')}`
      });
    }

    // Create SPK
    const result = await spkValidasiDroneService.createSPKValidasiDrone({
      created_by,
      assigned_to,
      trees,
      priority: priority || 'NORMAL',
      deadline,
      notes
    });

    return res.status(201).json({
      success: true,
      message: 'SPK Validasi Drone berhasil dibuat',
      data: result
    });

  } catch (error) {
    console.error('❌ Error creating SPK Validasi Drone:', error);
    
    // Handle specific errors
    if (error.message.includes('tidak ditemukan')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Gagal membuat SPK Validasi Drone',
      error: error.message
    });
  }
});

// ============================================================
// ENDPOINT 2: GET SPK LIST FOR MANDOR
// ============================================================
/**
 * GET /api/v1/spk/mandor/:mandor_id
 * 
 * Query Parameters:
 * - status: DRAFT|PENDING|IN_PROGRESS|COMPLETED|CANCELLED
 * - priority: NORMAL|HIGH|URGENT
 * - date_from: 2025-01-01
 * - date_to: 2025-01-31
 * - page: 1
 * - limit: 20
 * 
 * Response 200:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id_spk": "uuid",
 *       "no_spk": "SPK/VAL/2025/001",
 *       "jenis_kegiatan": "VALIDASI_DRONE_NDRE",
 *       "status": "PENDING",
 *       "priority": "URGENT",
 *       "created_at": "2025-01-25T10:00:00Z",
 *       "deadline": "2025-01-27",
 *       "task_statistics": {
 *         "total": 15,
 *         "pending": 10,
 *         "assigned": 3,
 *         "in_progress": 2,
 *         "completed": 0,
 *         "urgent_count": 8
 *       },
 *       "completion_percentage": 13.33
 *     }
 *   ],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 20,
 *     "total_items": 5,
 *     "total_pages": 1
 *   }
 * }
 */
router.get('/mandor/:mandor_id', async (req, res) => {
  try {
    const { mandor_id } = req.params;
    const { status, priority, date_from, date_to, page, limit } = req.query;

    if (!mandor_id) {
      return res.status(400).json({
        success: false,
        message: 'mandor_id wajib diisi'
      });
    }

    const filters = {
      status,
      priority,
      date_from,
      date_to,
      page: parseInt(page) || 1,
      limit: Math.min(parseInt(limit) || 20, 100) // Max 100 per page
    };

    const result = await spkValidasiDroneService.getSPKListForMandor(mandor_id, filters);

    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('❌ Error getting SPK list for mandor:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar SPK',
      error: error.message
    });
  }
});

// ============================================================
// ENDPOINT 3: ASSIGN TUGAS TO SURVEYOR (Mandor)
// ============================================================
/**
 * POST /api/v1/spk/:spk_id/assign-surveyor
 * 
 * Request Body:
 * {
 *   "id_tugas_list": ["uuid-tugas-1", "uuid-tugas-2", ...],
 *   "surveyor_id": "uuid-surveyor",
 *   "mandor_id": "uuid-mandor",
 *   "notes": "Prioritaskan area D001A"
 * }
 * 
 * Response 200:
 * {
 *   "success": true,
 *   "message": "Tugas berhasil ditugaskan ke surveyor",
 *   "data": {
 *     "assigned_count": 5,
 *     "failed_count": 0,
 *     "tugas_list": [
 *       {
 *         "id_tugas": "uuid",
 *         "id_npokok": "uuid-tree",
 *         "tree_id": "P-D001A-01-01",
 *         "status": "ASSIGNED",
 *         "assigned_to": "uuid-surveyor",
 *         "assigned_at": "2025-01-25T11:00:00Z"
 *       }
 *     ]
 *   }
 * }
 */
router.post('/:spk_id/assign-surveyor', async (req, res) => {
  try {
    const { spk_id } = req.params;
    const { id_tugas_list, surveyor_id, mandor_id, notes } = req.body;

    // Validasi input
    if (!id_tugas_list || !Array.isArray(id_tugas_list) || id_tugas_list.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'id_tugas_list harus berupa array dengan minimal 1 tugas'
      });
    }

    if (!surveyor_id) {
      return res.status(400).json({
        success: false,
        message: 'surveyor_id wajib diisi'
      });
    }

    if (!mandor_id) {
      return res.status(400).json({
        success: false,
        message: 'mandor_id wajib diisi'
      });
    }

    // Assign tugas
    const result = await spkValidasiDroneService.assignTugasToSurveyor({
      spk_id,
      id_tugas_list,
      surveyor_id,
      mandor_id,
      notes
    });

    return res.status(200).json({
      success: true,
      message: `${result.assigned_count} tugas berhasil ditugaskan ke surveyor`,
      data: result
    });

  } catch (error) {
    console.error('❌ Error assigning tugas to surveyor:', error);

    if (error.message.includes('tidak ditemukan') || error.message.includes('tidak valid')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Gagal menugaskan surveyor',
      error: error.message
    });
  }
});

// ============================================================
// NOTE: /kanban route has been MOVED to TOP of file (line ~38)
// to ensure it's registered BEFORE /:spk_id catch-all route
// ============================================================
// ENDPOINT 5: GET SPK DETAIL
// ============================================================
/**
 * GET /api/v1/spk/:spk_id
 * 
 * NOTE: This is a catch-all route, so specific routes (like /kanban) 
 * MUST be defined BEFORE this one!
 * 
 * Response 200:
 * {
 *   "success": true,
 *   "data": {
 *     "spk": { id_spk, no_spk, jenis_kegiatan, status, priority, ... },
 *     "tugas": [
 *       {
 *         "id_tugas": "uuid",
 *         "id_npokok": "uuid-tree",
 *         "tree_data": { id_tanaman: "P-D001A-01-01", divisi, blok, ... },
 *         "ndre_data": { value: 0.125, classification: "Stres Berat", ... },
 *         "status": "PENDING",
 *         "priority": "URGENT",
 *         "validation_checklist": [ ... ]
 *       }
 *     ],
 *     "statistics": {
 *       "total_tugas": 15,
 *       "status_breakdown": { PENDING: 10, ASSIGNED: 3, IN_PROGRESS: 2 },
 *       "priority_breakdown": { URGENT: 8, HIGH: 5, NORMAL: 2 },
 *       "completion_percentage": 13.33
 *     }
 *   }
 * }
 */
router.get('/:spk_id', async (req, res) => {
  try {
    const { spk_id } = req.params;
    
    console.log('🔴🔴🔴 [DEBUG] Route /:spk_id HIT! spk_id =', spk_id);

    if (!spk_id) {
      return res.status(400).json({
        success: false,
        message: 'spk_id wajib diisi'
      });
    }

    // Validate UUID format to prevent "kanban" being treated as UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(spk_id)) {
      console.log('🔴 [DEBUG] Invalid UUID format detected:', spk_id);
      return res.status(400).json({
        success: false,
        message: `Invalid spk_id format: "${spk_id}" is not a valid UUID. Did you mean to use a different endpoint?`
      });
    }

    const result = await spkValidasiDroneService.getSPKDetail(spk_id);

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Error getting SPK detail:', error);

    if (error.message.includes('tidak ditemukan')) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil detail SPK',
      error: error.message
    });
  }
});

module.exports = router;
