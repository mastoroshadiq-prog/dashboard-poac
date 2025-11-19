/**
 * ANALYTICS ROUTES - API ENDPOINTS
 * 
 * TUJUAN: Endpoints untuk Anomaly Detection & Performance Analytics
 * Dashboard Tier 3 (Asisten Manager) - Tactical Decision Making
 */

const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');
const spkAnomalyService = require('../services/spkAnomalyService');

// 🔐 RBAC Middleware
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

/**
 * GET /api/v1/analytics/anomaly-detection
 * 
 * TUJUAN: Detect operational anomalies (pohon miring, mati, gambut amblas, spacing issues)
 * DASHBOARD: Tier 3 Asisten Manager
 * 
 * QUERY PARAMETERS (Optional):
 * - divisi: Filter by divisi
 * - afdeling: Filter by afdeling
 * - blok: Filter by blok
 * - severity: Filter by severity (low, medium, high, critical)
 * 
 * RESPONSE SUCCESS (200):
 * {
 *   "success": true,
 *   "data": {
 *     "anomalies": [
 *       {
 *         "type": "POHON_MIRING",
 *         "severity": "HIGH",
 *         "count": 12,
 *         "locations": ["Blok A1 (3 pohon)", "Blok A5 (9 pohon)"],
 *         "description": "Pohon miring >30 derajat, risiko tumbang",
 *         "recommended_action": "Prioritas APH segera, evaluasi akar"
 *       },
 *       {
 *         "type": "POHON_MATI",
 *         "severity": "CRITICAL",
 *         "count": 8,
 *         "locations": ["Blok B2 (5 pohon)", "Blok B7 (3 pohon)"],
 *         "description": "Pohon mati, perlu replanting",
 *         "recommended_action": "Create SPK Sanitasi + Replanting"
 *       },
 *       {
 *         "type": "GAMBUT_AMBLAS",
 *         "severity": "MEDIUM",
 *         "count": 5,
 *         "locations": ["Blok C1 (2 blok)", "Blok C3 (3 blok)"],
 *         "description": "Tanah gambut amblas, drainage issue",
 *         "recommended_action": "Perbaikan drainage system, monitoring rutin"
 *       },
 *       {
 *         "type": "SPACING_ISSUE",
 *         "severity": "LOW",
 *         "count": 15,
 *         "locations": ["Multiple blocks"],
 *         "description": "Jarak tanam tidak sesuai standar (terlalu rapat/jauh)",
 *         "recommended_action": "Review planting plan, adjust untuk area baru"
 *       }
 *     ],
 *     "summary": {
 *       "total_anomalies": 40,
 *       "critical": 8,
 *       "high": 12,
 *       "medium": 5,
 *       "low": 15
 *     }
 *   },
 *   "message": "Anomaly detection berhasil diambil"
 * }
 * 
 * 🔐 SECURITY:
 * - Authentication: JWT Required
 * - Authorization: ASISTEN, ADMIN
 */
router.get('/anomaly-detection', 
  authenticateJWT,
  authorizeRole(['ASISTEN', 'ADMIN']),
  async (req, res) => {
  try {
    console.log('🔍 [Analytics] GET Anomaly Detection');
    console.log('   Filters:', req.query);
    
    const filters = {
      divisi: req.query.divisi || null,
      afdeling: req.query.afdeling || null,
      blok: req.query.blok || null,
      severity: req.query.severity || null,
      date_from: req.query.date_from || null,
      date_to: req.query.date_to || null
    };

    const result = await analyticsService.detectAnomalies(filters);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Gagal mendeteksi anomali'
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data,
      message: "Anomaly detection berhasil diambil"
    });
    
  } catch (error) {
    console.error('❌ [API Error] GET /api/v1/analytics/anomaly-detection:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Gagal mengambil data Anomaly Detection'
    });
  }
});

/**
 * GET /api/v1/analytics/mandor-performance
 * 
 * TUJUAN: Track mandor performance KPIs (completion rate, quality score, efficiency)
 * DASHBOARD: Tier 3 Asisten Manager
 * 
 * QUERY PARAMETERS (Optional):
 * - mandor_id: Filter by specific mandor
 * - date_from: Start date
 * - date_to: End date
 * 
 * RESPONSE SUCCESS (200):
 * {
 *   "success": true,
 *   "data": {
 *     "performance": [
 *       {
 *         "mandor_id": "uuid-mandor-joko",
 *         "mandor_name": "Joko Susilo",
 *         "metrics": {
 *           "completion_rate": 95.5,
 *           "quality_score": 88.0,
 *           "efficiency_score": 92.3,
 *           "avg_response_time_hours": 2.5
 *         },
 *         "breakdown": {
 *           "total_spk": 20,
 *           "completed": 19,
 *           "pending": 1,
 *           "overdue": 0
 *         },
 *         "issues": [
 *           {
 *             "type": "QUALITY_ISSUE",
 *             "count": 2,
 *             "description": "2 validasi perlu re-check (data tidak lengkap)"
 *           }
 *         ],
 *         "recommendations": [
 *           {
 *             "type": "TRAINING",
 *             "message": "Perlu training: cara pengisian data validasi yang lengkap"
 *           }
 *         ]
 *       }
 *     ],
 *     "summary": {
 *       "avg_completion_rate": 92.8,
 *       "avg_quality_score": 85.5,
 *       "best_performer": "Joko Susilo",
 *       "needs_improvement": ["Ahmad (completion rate 75%)"]
 *     }
 *   },
 *   "message": "Mandor performance berhasil diambil"
 * }
 * 
 * 🔐 SECURITY:
 * - Authentication: JWT Required
 * - Authorization: ASISTEN, ADMIN
 */
router.get('/mandor-performance', 
  // ⚠️  TEMPORARY: No auth for frontend integration testing
  // authenticateJWT,
  // authorizeRole(['ASISTEN', 'ADMIN']),
  async (req, res) => {
  try {
    console.log('📈 [Analytics] GET Mandor Performance (NO AUTH)');
    console.log('   Filters:', req.query);
    
    // TODO: Implement mandor performance tracking
    // Logic:
    // 1. Query spk_header, spk_tugas grouped by mandor (id_pelaksana)
    // 2. Calculate completion rate: (completed / total) * 100
    // 3. Calculate quality score: based on validation accuracy
    // 4. Calculate efficiency: tasks completed per day
    // 5. Identify issues: overdue tasks, quality problems
    
    // STUB RESPONSE (for now) - NO NULL VALUES!
    return res.status(200).json({
      success: true,
      data: {
        performance: [
          {
            mandor_id: "uuid-mandor-joko",
            mandor_name: "Joko Susilo",
            metrics: {
              completion_rate: 95.5,
              quality_score: 88.0,
              efficiency_score: 92.3,
              avg_response_time_hours: 2.5
            },
            breakdown: {
              total_spk: 20,
              completed: 19,
              pending: 1,
              overdue: 0
            },
            issues: [
              {
                type: "QUALITY_ISSUE",
                count: 2,
                description: "2 validasi perlu re-check (data tidak lengkap)"
              }
            ],
            recommendations: [
              {
                type: "TRAINING",
                message: "Perlu training: cara pengisian data validasi yang lengkap"
              }
            ]
          },
          {
            mandor_id: "uuid-mandor-ahmad",
            mandor_name: "Ahmad Budi",
            metrics: {
              completion_rate: 75.0,
              quality_score: 82.0,
              efficiency_score: 78.5,
              avg_response_time_hours: 4.2
            },
            breakdown: {
              total_spk: 16,
              completed: 12,
              pending: 3,
              overdue: 1
            },
            issues: [
              {
                type: "OVERDUE",
                count: 1,
                description: "1 SPK overdue (delay 2 hari)"
              }
            ],
            recommendations: [
              {
                type: "WORKLOAD",
                message: "Reduce workload atau tambah support untuk Ahmad"
              }
            ]
          }
        ],
        summary: {
          avg_completion_rate: 92.8,
          avg_quality_score: 85.5,
          best_performer: "Joko Susilo",
          needs_improvement: ["Ahmad Budi (completion rate 75%, 1 overdue)"]
        }
      },
      message: "Mandor performance berhasil diambil (STUB - belum implement)"
    });
    
  } catch (error) {
    console.error('❌ [API Error] GET /api/v1/analytics/mandor-performance:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Gagal mengambil data Mandor Performance'
    });
  }
});

/**
 * POST /api/v1/analytics/create-spk-from-anomaly
 * 
 * TUJUAN: Create SPK automatically from detected anomaly
 * DASHBOARD: Tier 3 Asisten Manager
 * 
 * REQUEST BODY:
 * {
 *   "anomaly_type": "POHON_MIRING" | "POHON_MATI" | "NDRE_STRES_BERAT" | "GAMBUT_AMBLAS" | "SPACING_ISSUE",
 *   "anomaly_ids": ["id-obs-1", "id-obs-2", ...], // Optional
 *   "mandor_id": "uuid-mandor",
 *   "priority": "URGENT" | "HIGH" | "NORMAL" | "LOW",
 *   "notes": "Catatan tambahan untuk SPK"
 * }
 * 
 * RESPONSE SUCCESS (201):
 * {
 *   "success": true,
 *   "data": {
 *     "spk": {
 *       "id_spk": "uuid",
 *       "nomor_spk": "SPK-POH-123456",
 *       "nama_spk": "SPK APH - Pohon Miring - 19/11/2025",
 *       "jenis_kegiatan": "APH",
 *       "status": "BARU",
 *       "prioritas": "HIGH",
 *       "deadline": "2025-11-26"
 *     },
 *     "tugas": {
 *       "id_tugas": "uuid",
 *       "assigned_to_mandor": "uuid-mandor",
 *       "status": "PENDING"
 *     }
 *   },
 *   "message": "SPK berhasil dibuat dari anomaly detection"
 * }
 * 
 * 🔐 SECURITY:
 * - Authentication: JWT Required
 * - Authorization: ASISTEN, ADMIN
 */
router.post('/create-spk-from-anomaly',
  authenticateJWT,
  authorizeRole(['ASISTEN', 'ADMIN']),
  async (req, res) => {
    try {
      console.log('🔧 [Analytics] POST Create SPK from Anomaly');
      console.log('   Body:', req.body);

      const { anomaly_type, anomaly_ids, mandor_id, priority, notes } = req.body;
      const asisten_id = req.user.id_pihak; // From JWT token

      // Validation
      if (!anomaly_type || !mandor_id) {
        return res.status(400).json({
          success: false,
          message: 'anomaly_type dan mandor_id wajib diisi'
        });
      }

      const result = await spkAnomalyService.createSPKFromAnomaly({
        anomaly_type,
        anomaly_ids,
        mandor_id,
        asisten_id,
        priority: priority || 'NORMAL',
        notes
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);

    } catch (error) {
      console.error('❌ [API Error] POST /api/v1/analytics/create-spk-from-anomaly:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Gagal membuat SPK dari anomaly'
      });
    }
  }
);

/**
 * POST /api/v1/analytics/bulk-create-spk-from-anomalies
 * 
 * TUJUAN: Bulk create multiple SPKs from multiple anomalies
 * 
 * REQUEST BODY:
 * {
 *   "anomalies": [
 *     {
 *       "anomaly_type": "POHON_MIRING",
 *       "anomaly_ids": [...],
 *       "mandor_id": "uuid-mandor-1",
 *       "priority": "HIGH"
 *     },
 *     {
 *       "anomaly_type": "POHON_MATI",
 *       "anomaly_ids": [...],
 *       "mandor_id": "uuid-mandor-2",
 *       "priority": "CRITICAL"
 *     }
 *   ]
 * }
 * 
 * RESPONSE SUCCESS (201):
 * {
 *   "success": true,
 *   "data": {
 *     "created": [...],
 *     "failed": [...]
 *   },
 *   "message": "2 SPK berhasil dibuat, 0 gagal"
 * }
 */
router.post('/bulk-create-spk-from-anomalies',
  authenticateJWT,
  authorizeRole(['ASISTEN', 'ADMIN']),
  async (req, res) => {
    try {
      console.log('🔧 [Analytics] POST Bulk Create SPKs from Anomalies');
      
      const { anomalies } = req.body;
      const asisten_id = req.user.id_pihak;

      if (!anomalies || !Array.isArray(anomalies) || anomalies.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'anomalies array wajib diisi'
        });
      }

      const result = await spkAnomalyService.bulkCreateSPKFromAnomalies(anomalies, asisten_id);

      return res.status(201).json(result);

    } catch (error) {
      console.error('❌ [API Error] POST /api/v1/analytics/bulk-create-spk-from-anomalies:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Gagal bulk create SPK'
      });
    }
  }
);

module.exports = router;
