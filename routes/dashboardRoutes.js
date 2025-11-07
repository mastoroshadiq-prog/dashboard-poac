/**
 * DASHBOARD ROUTES - API ENDPOINTS
 * 
 * Sub-Proses 3: KONTROL & PENYEMPURNAAN
 * Tuntunan Dokumentasi: Setiap endpoint disertai contoh request/response
 * Tuntunan Keamanan: Validasi server-side untuk semua input
 */

const express = require('express');
const router = express.Router();
const dashboardService = require('../services/dashboardService');
const operasionalService = require('../services/operasionalService');
const teknisService = require('../services/teknisService');

// 🔐 RBAC FASE 2: Authentication & Authorization Middleware
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

/**
 * GET /api/v1/dashboard/kpi_eksekutif
 * 
 * 🔐 RBAC FASE 2: Requires JWT + Role Authorization
 * ALLOWED ROLES: ASISTEN, ADMIN (Eksekutif level only)
 * 
 * TUJUAN: Mengisi Dashboard Tampilan 1 (Eksekutif) - Fitur M-1.1 & M-1.2
 * 
 * QUERY PARAMETERS (Optional):
 * - estate: Filter by estate ID (future enhancement)
 * - date_from: Start date for filtering (ISO 8601)
 * - date_to: End date for filtering (ISO 8601)
 * 
 * RESPONSE STRUCTURE:
 * {
 *   "success": true,
 *   "data": {
 *     "kri_lead_time_aph": 2.0,           // Average days (float)
 *     "kri_kepatuhan_sop": 75.0,           // Percentage (float)
 *     "tren_insidensi_baru": [             // Array of daily trends
 *       { "date": "2025-10-28", "count": 1 },
 *       { "date": "2025-10-29", "count": 0 }
 *     ],
 *     "tren_g4_aktif": 2,                   // Count (integer)
 *     "generated_at": "2025-11-05T12:00:00Z",
 *     "filters": { "estate": null }
 *   },
 *   "message": "Data KPI Eksekutif berhasil diambil"
 * }
 * 
 * ERROR RESPONSE:
 * {
 *   "success": false,
 *   "error": "Error message",
 *   "message": "Gagal mengambil data KPI Eksekutif"
 * }
 * 
 * CONTOH REQUEST:
 * GET /api/v1/dashboard/kpi_eksekutif
 * Authorization: Bearer <jwt-token>
 * 
 * GET /api/v1/dashboard/kpi_eksekutif?estate=EST001
 * Authorization: Bearer <jwt-token>
 */
router.get('/kpi-eksekutif', 
  authenticateJWT, 
  authorizeRole(['ASISTEN', 'ADMIN']), 
  async (req, res) => {
  try {
    // Prinsip KEAMANAN: Validasi server-side untuk query parameters
    const filters = {};
    
    // Optional filter: estate
    if (req.query.estate) {
      // Validasi format estate ID (alphanumeric, max 50 chars)
      if (!/^[a-zA-Z0-9_-]{1,50}$/.test(req.query.estate)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid estate parameter format',
          message: 'Parameter estate harus alphanumeric (max 50 karakter)'
        });
      }
      filters.estate = req.query.estate;
    }
    
    // Optional filter: date range
    if (req.query.date_from) {
      const dateFrom = new Date(req.query.date_from);
      if (isNaN(dateFrom.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date_from parameter',
          message: 'Parameter date_from harus format ISO 8601 (YYYY-MM-DD)'
        });
      }
      filters.date_from = dateFrom.toISOString();
    }
    
    if (req.query.date_to) {
      const dateTo = new Date(req.query.date_to);
      if (isNaN(dateTo.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date_to parameter',
          message: 'Parameter date_to harus format ISO 8601 (YYYY-MM-DD)'
        });
      }
      filters.date_to = dateTo.toISOString();
    }
    
    // Call service layer
    const data = await dashboardService.getKpiEksekutif(filters);
    
    // Prinsip TEPAT: Response sesuai kontrak API
    return res.status(200).json({
      success: true,
      data: data,
      message: 'Data KPI Eksekutif berhasil diambil'
    });
    
  } catch (error) {
    // Error handling dengan logging
    console.error('❌ [API Error] GET /api/v1/dashboard/kpi_eksekutif:', error.message);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Gagal mengambil data KPI Eksekutif'
    });
  }
});

/**
 * GET /api/v1/dashboard/operasional
 * 
 * 🔐 RBAC FASE 2: Requires JWT + Role Authorization
 * ALLOWED ROLES: MANDOR, ASISTEN, ADMIN (Operational + Eksekutif level)
 * 
 * TUJUAN: Mengisi Dashboard Tampilan 2 (Operasional) - Fitur M-2.1 & M-2.2
 * 
 * QUERY PARAMETERS (Optional):
 * - divisi: Filter by divisi ID (future enhancement)
 * - date_from: Start date for filtering (ISO 8601)
 * - date_to: End date for filtering (ISO 8601)
 * 
 * RESPONSE STRUCTURE:
 * {
 *   "success": true,
 *   "data": {
 *     "data_corong": {                     // M-2.1: Corong Alur Kerja
 *       "target_validasi": 2,
 *       "validasi_selesai": 2,
 *       "target_aph": 1,
 *       "aph_selesai": 1,
 *       "target_sanitasi": 2,
 *       "sanitasi_selesai": 1
 *     },
 *     "data_papan_peringkat": [            // M-2.2: Papan Peringkat Tim
 *       {
 *         "id_pelaksana": "uuid-mandor-agus",
 *         "selesai": 2,
 *         "total": 2,
 *         "rate": 100.0
 *       }
 *     ],
 *     "generated_at": "2025-11-05T12:00:00Z",
 *     "filters": {}
 *   },
 *   "message": "Data Dashboard Operasional berhasil diambil"
 * }
 * 
 * ERROR RESPONSE:
 * {
 *   "success": false,
 *   "error": "Error message",
 *   "message": "Gagal mengambil data Dashboard Operasional"
 * }
 * 
 * CONTOH REQUEST:
 * GET /api/v1/dashboard/operasional
 * Authorization: Bearer <jwt-token>
 * 
 * GET /api/v1/dashboard/operasional?divisi=DIV001
 * Authorization: Bearer <jwt-token>
 */
router.get('/operasional', 
  authenticateJWT, 
  authorizeRole(['MANDOR', 'ASISTEN', 'ADMIN']), 
  async (req, res) => {
  try {
    // Prinsip KEAMANAN: Validasi server-side untuk query parameters
    const filters = {};
    
    // Optional filter: divisi
    if (req.query.divisi) {
      // Validasi format divisi ID (alphanumeric, max 50 chars)
      if (!/^[a-zA-Z0-9_-]{1,50}$/.test(req.query.divisi)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid divisi parameter format',
          message: 'Parameter divisi harus alphanumeric (max 50 karakter)'
        });
      }
      filters.divisi = req.query.divisi;
    }
    
    // Optional filter: date range
    if (req.query.date_from) {
      const dateFrom = new Date(req.query.date_from);
      if (isNaN(dateFrom.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date_from parameter',
          message: 'Parameter date_from harus format ISO 8601 (YYYY-MM-DD)'
        });
      }
      filters.date_from = dateFrom.toISOString();
    }
    
    if (req.query.date_to) {
      const dateTo = new Date(req.query.date_to);
      if (isNaN(dateTo.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date_to parameter',
          message: 'Parameter date_to harus format ISO 8601 (YYYY-MM-DD)'
        });
      }
      filters.date_to = dateTo.toISOString();
    }
    
    // Call service layer
    const data = await operasionalService.getDashboardOperasional(filters);
    
    // Prinsip TEPAT: Response sesuai kontrak API
    return res.status(200).json({
      success: true,
      data: data,
      message: 'Data Dashboard Operasional berhasil diambil'
    });
    
  } catch (error) {
    // Error handling dengan logging
    console.error('❌ [API Error] GET /api/v1/dashboard/operasional:', error.message);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Gagal mengambil data Dashboard Operasional'
    });
  }
});

/**
 * GET /api/v1/dashboard/teknis
 * 
 * 🔐 RBAC FASE 2: Requires JWT + Role Authorization
 * ALLOWED ROLES: MANDOR, ASISTEN, ADMIN (Technical + Eksekutif level)
 * 
 * TUJUAN: Mengisi Dashboard Tampilan 3 (Teknis) - Fitur M-3.1 & M-3.2
 * 
 * QUERY PARAMETERS (Optional):
 * - umh: Filter by UMH ID (future enhancement)
 * - date_from: Start date for filtering (ISO 8601)
 * - date_to: End date for filtering (ISO 8601)
 * 
 * RESPONSE STRUCTURE:
 * {
 *   "success": true,
 *   "data": {
 *     "data_matriks_kebingungan": {    // M-3.1: Confusion Matrix
 *       "true_positive": 1,
 *       "false_positive": 1,
 *       "false_negative": 0,
 *       "true_negative": 0
 *     },
 *     "data_distribusi_ndre": [         // M-3.2: Health Status Distribution
 *       { "status_aktual": "G0 (Sehat)", "jumlah": 1 },
 *       { "status_aktual": "G1 (Ganoderma Awal)", "jumlah": 1 }
 *     ],
 *     "generated_at": "2025-11-05T12:00:00Z",
 *     "filters": {}
 *   },
 *   "message": "Data Dashboard Teknis berhasil diambil"
 * }
 * 
 * ERROR RESPONSE:
 * {
 *   "success": false,
 *   "error": "Error message",
 *   "message": "Gagal mengambil data Dashboard Teknis"
 * }
 * 
 * CONTOH REQUEST:
 * GET /api/v1/dashboard/teknis
 * Authorization: Bearer <jwt-token>
 * 
 * GET /api/v1/dashboard/teknis?umh=UMH001
 * Authorization: Bearer <jwt-token>
 */
router.get('/teknis', 
  authenticateJWT, 
  authorizeRole(['MANDOR', 'ASISTEN', 'ADMIN']), 
  async (req, res) => {
  try {
    // Prinsip KEAMANAN: Validasi server-side untuk query parameters
    const filters = {};
    
    // Optional filter: umh
    if (req.query.umh) {
      // Validasi format UMH ID (alphanumeric, max 50 chars)
      if (!/^[a-zA-Z0-9_-]{1,50}$/.test(req.query.umh)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid umh parameter format',
          message: 'Parameter umh harus alphanumeric (max 50 karakter)'
        });
      }
      filters.umh = req.query.umh;
    }
    
    // Optional filter: date range
    if (req.query.date_from) {
      const dateFrom = new Date(req.query.date_from);
      if (isNaN(dateFrom.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date_from parameter',
          message: 'Parameter date_from harus format ISO 8601 (YYYY-MM-DD)'
        });
      }
      filters.date_from = dateFrom.toISOString();
    }
    
    if (req.query.date_to) {
      const dateTo = new Date(req.query.date_to);
      if (isNaN(dateTo.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date_to parameter',
          message: 'Parameter date_to harus format ISO 8601 (YYYY-MM-DD)'
        });
      }
      filters.date_to = dateTo.toISOString();
    }
    
    // Call service layer
    const data = await teknisService.getDashboardTeknis(filters);
    
    // Prinsip TEPAT: Response sesuai kontrak API
    return res.status(200).json({
      success: true,
      data: data,
      message: 'Data Dashboard Teknis berhasil diambil'
    });
    
  } catch (error) {
    // Error handling dengan logging
    console.error('❌ [API Error] GET /api/v1/dashboard/teknis:', error.message);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Gagal mengambil data Dashboard Teknis'
    });
  }
});

module.exports = router;
