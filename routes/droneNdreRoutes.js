/**
 * DRONE NDRE ROUTES
 * 
 * Endpoints untuk data drone NDRE survey
 */

const express = require('express');
const router = express.Router();
const droneNdreService = require('../services/droneNdreService');

/**
 * GET /api/drone/ndre
 * Get NDRE data dengan filter komprehensif
 * 
 * Query Parameters:
 * - divisi: string (optional) - Filter by division
 * - blok: string (optional) - Filter by block
 * - blok_detail: string (optional) - Filter by detailed block
 * - stress_level: string (optional) - Filter by classification (Stres Berat, Stres Sedang, Sehat)
 * - date_from: string (optional) - Filter start date (YYYY-MM-DD)
 * - date_to: string (optional) - Filter end date (YYYY-MM-DD)
 * - ndre_min: number (optional) - Minimum NDRE value
 * - ndre_max: number (optional) - Maximum NDRE value
 * - page: number (optional) - Page number (default: 1)
 * - limit: number (optional) - Items per page (default: 50, max: 500)
 * 
 * Response:
 * {
 *   success: true,
 *   data: [
 *     {
 *       id: "uuid",
 *       tree_id: "P-D001A-01-01",
 *       location: {
 *         divisi: "AME II",
 *         blok: "D01",
 *         blok_detail: "D001A",
 *         n_baris: 1,
 *         n_pokok: 1,
 *         latitude: 1.5001,
 *         longitude: 101.5001
 *       },
 *       ndre: {
 *         value: 0.3862,
 *         classification: "Stres Berat",
 *         color: "#DC2626",
 *         status: "URGENT"
 *       },
 *       survey: {
 *         date: "2025-01-25",
 *         type: "DRONE_NDRE",
 *         notes: "Pokok Utama"
 *       }
 *     }
 *   ],
 *   pagination: {
 *     page: 1,
 *     limit: 50,
 *     total_items: 1000,
 *     total_pages: 20
 *   },
 *   statistics: {
 *     total_trees: 1000,
 *     classification: {
 *       "Stres Berat": { count: 450, percentage: "45.00", priority: "URGENT", color: "#DC2626" },
 *       "Stres Sedang": { count: 350, percentage: "35.00", priority: "HIGH", color: "#F59E0B" },
 *       "Sehat": { count: 200, percentage: "20.00", priority: "NORMAL", color: "#10B981" }
 *     },
 *     ndre_range: { min: "0.3000", max: "0.9000", avg: "0.5500" },
 *     recommendations: {
 *       urgent_validation: 450,
 *       high_priority: 350,
 *       total_needs_attention: 800
 *     }
 *   }
 * }
 */
router.get('/ndre', async (req, res) => {
  try {
    const filters = {
      divisi: req.query.divisi,
      blok: req.query.blok,
      blok_detail: req.query.blok_detail,
      stress_level: req.query.stress_level,
      date_from: req.query.date_from,
      date_to: req.query.date_to,
      ndre_min: req.query.ndre_min ? parseFloat(req.query.ndre_min) : undefined,
      ndre_max: req.query.ndre_max ? parseFloat(req.query.ndre_max) : undefined,
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: Math.min(parseInt(req.query.limit) || 50, 500), // Max 500 items per page
    };

    const result = await droneNdreService.getNDREData(filters);
    res.json(result);

  } catch (error) {
    console.error('Error in GET /api/drone/ndre:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch NDRE data',
      message: error.message,
    });
  }
});

/**
 * GET /api/drone/ndre/statistics
 * Get NDRE statistics only (faster than full data query)
 * 
 * Query Parameters:
 * - divisi: string (optional)
 * - blok: string (optional)
 * - date_from: string (optional)
 * - date_to: string (optional)
 */
router.get('/ndre/statistics', async (req, res) => {
  try {
    const filters = {
      divisi: req.query.divisi,
      blok: req.query.blok,
      date_from: req.query.date_from,
      date_to: req.query.date_to,
    };

    const stats = await droneNdreService.getNDREStatistics(filters);
    
    res.json({
      success: true,
      statistics: stats,
    });

  } catch (error) {
    console.error('Error in GET /api/drone/ndre/statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch NDRE statistics',
      message: error.message,
    });
  }
});

/**
 * GET /api/drone/ndre/filters
 * Get available filter options for UI dropdowns
 * 
 * Response:
 * {
 *   success: true,
 *   filters: {
 *     divisi: ["AME II", "AME III"],
 *     blok: ["D01", "D02", "D03"],
 *     blok_detail: ["D001A", "D001B", "D002A"],
 *     stress_levels: ["Stres Berat", "Stres Sedang", "Sehat"]
 *   }
 * }
 */
router.get('/ndre/filters', async (req, res) => {
  try {
    const result = await droneNdreService.getFilterOptions();
    res.json(result);

  } catch (error) {
    console.error('Error in GET /api/drone/ndre/filters:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch filter options',
      message: error.message,
    });
  }
});

/**
 * GET /api/drone/tree/:id_npokok
 * Get detail pohon specific untuk validasi
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     id_npokok: "uuid",
 *     id_tanaman: "P-D001A-01-01",
 *     divisi: "AME II",
 *     blok: "D01",
 *     ...
 *     kebun_observasi: [
 *       {
 *         id_observasi: "uuid",
 *         tanggal_survey: "2025-01-25",
 *         ndre_value: 0.3862,
 *         ndre_classification: "Stres Berat",
 *         ...
 *       }
 *     ]
 *   }
 * }
 */
router.get('/tree/:id_npokok', async (req, res) => {
  try {
    const { id_npokok } = req.params;
    const result = await droneNdreService.getTreeDetail(id_npokok);
    res.json(result);

  } catch (error) {
    console.error('Error in GET /api/drone/tree/:id_npokok:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tree detail',
      message: error.message,
    });
  }
});

module.exports = router;
