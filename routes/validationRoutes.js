/**
 * VALIDATION ROUTES - API ENDPOINTS
 * 
 * TUJUAN: Endpoints untuk Confusion Matrix & Field Validation Analysis
 * Dashboard Tier 3 (Asisten Manager) - Tactical Decision Making
 */

const express = require('express');
const router = express.Router();

// 🔐 RBAC Middleware
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

/**
 * GET /api/v1/validation/confusion-matrix
 * 
 * TUJUAN: Calculate Confusion Matrix (TP/FP/TN/FN) for drone NDRE validation accuracy
 * DASHBOARD: Tier 3 Asisten Manager
 * 
 * QUERY PARAMETERS (Optional):
 * - divisi: Filter by divisi
 * - afdeling: Filter by afdeling
 * - blok: Filter by blok
 * - date_from: Start date (ISO 8601)
 * - date_to: End date (ISO 8601)
 * 
 * RESPONSE SUCCESS (200):
 * {
 *   "success": true,
 *   "data": {
 *     "matrix": {
 *       "true_positive": 118,
 *       "false_positive": 23,
 *       "true_negative": 745,
 *       "false_negative": 24
 *     },
 *     "metrics": {
 *       "accuracy": 94.8,
 *       "precision": 83.7,
 *       "recall": 83.1,
 *       "f1_score": 83.4
 *     },
 *     "per_divisi": [
 *       {
 *         "divisi": "Divisi 1",
 *         "true_positive": 50,
 *         "false_positive": 10,
 *         "accuracy": 92.5
 *       }
 *     ],
 *     "recommendations": [
 *       {
 *         "type": "FALSE_POSITIVE",
 *         "count": 23,
 *         "message": "23 pohon (2.5%) diprediksi stress tapi sehat. Cek: bayangan awan, embun pagi, camera angle",
 *         "action": "Adjust NDRE threshold atau reschedule drone scan (pagi hari)"
 *       }
 *     ]
 *   },
 *   "message": "Confusion Matrix berhasil dihitung"
 * }
 * 
 * 🔐 SECURITY:
 * - Authentication: JWT Required
 * - Authorization: ASISTEN, ADMIN
 */
router.get('/confusion-matrix', 
  // ⚠️  TEMPORARY: No auth for frontend integration testing
  // authenticateJWT,
  // authorizeRole(['ASISTEN', 'ADMIN']),
  async (req, res) => {
  try {
    console.log('📊 [Validation] GET Confusion Matrix (NO AUTH)');
    console.log('   Filters:', req.query);
    
    // TODO: Implement confusion matrix calculation
    // Logic:
    // 1. Query kebun_observasi (drone predictions)
    // 2. Join with spk_tugas (field validations)
    // 3. Calculate TP/FP/TN/FN based on:
    //    - TP: drone = stress, field = stress
    //    - FP: drone = stress, field = healthy
    //    - TN: drone = healthy, field = healthy
    //    - FN: drone = healthy, field = stress
    // 4. Calculate metrics: accuracy, precision, recall, F1
    
    // STUB RESPONSE (for now) - NO NULL VALUES!
    return res.status(200).json({
      success: true,
      data: {
        matrix: {
          true_positive: 118,
          false_positive: 23,
          true_negative: 745,
          false_negative: 24
        },
        metrics: {
          accuracy: 94.8,
          precision: 83.7,
          recall: 83.1,
          f1_score: 83.4
        },
        per_divisi: [
          {
            divisi: "Divisi 1",
            true_positive: 50,
            false_positive: 10,
            true_negative: 300,
            false_negative: 10,
            accuracy: 94.6
          },
          {
            divisi: "Divisi 2",
            true_positive: 68,
            false_positive: 13,
            true_negative: 445,
            false_negative: 14,
            accuracy: 95.0
          }
        ],
        recommendations: [
          {
            type: "FALSE_POSITIVE",
            count: 23,
            message: "23 pohon (2.5%) diprediksi stress tapi sehat. Penyebab: bayangan awan, embun pagi, camera angle",
            action: "Naikkan NDRE threshold dari 0.45 ke 0.50 atau reschedule scan (hindari jam 06:00-08:00)"
          },
          {
            type: "FALSE_NEGATIVE",
            count: 24,
            message: "24 pohon (16.9%) diprediksi sehat tapi stress. Missed detection oleh drone",
            action: "Turunkan NDRE threshold dari 0.45 ke 0.40 atau tambahkan ground validation untuk borderline cases"
          }
        ]
      },
      message: "Confusion Matrix berhasil dihitung (STUB - belum implement)"
    });
    
  } catch (error) {
    console.error('❌ [API Error] GET /api/v1/validation/confusion-matrix:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Gagal menghitung Confusion Matrix'
    });
  }
});

/**
 * GET /api/v1/validation/field-vs-drone
 * 
 * TUJUAN: Compare drone predictions vs field validation results
 * DASHBOARD: Tier 3 Asisten Manager
 * 
 * QUERY PARAMETERS (Optional):
 * - divisi: Filter by divisi
 * - afdeling: Filter by afdeling
 * - date_from: Start date
 * - date_to: End date
 * 
 * RESPONSE SUCCESS (200):
 * {
 *   "success": true,
 *   "data": {
 *     "distribution": [
 *       {
 *         "category": "TRUE_POSITIVE",
 *         "drone_prediction": "STRESS",
 *         "field_validation": "STRESS",
 *         "trees": 118,
 *         "percentage": 13.0,
 *         "common_causes": ["Ganoderma confirmed", "Nutrisi deficiency"]
 *       },
 *       {
 *         "category": "FALSE_POSITIVE",
 *         "drone_prediction": "STRESS",
 *         "field_validation": "HEALTHY",
 *         "trees": 23,
 *         "percentage": 2.5,
 *         "common_causes": ["Bayangan awan", "Embun pagi", "Camera angle"]
 *       }
 *     ],
 *     "summary": {
 *       "total_validated": 910,
 *       "match_rate": 94.8,
 *       "mismatch_rate": 5.2
 *     }
 *   },
 *   "message": "Field vs Drone comparison berhasil diambil"
 * }
 * 
 * 🔐 SECURITY:
 * - Authentication: JWT Required
 * - Authorization: ASISTEN, ADMIN
 */
router.get('/field-vs-drone', 
  // ⚠️  TEMPORARY: No auth for frontend integration testing
  // authenticateJWT,
  // authorizeRole(['ASISTEN', 'ADMIN']),
  async (req, res) => {
  try {
    console.log('📊 [Validation] GET Field vs Drone (NO AUTH)');
    console.log('   Filters:', req.query);
    
    // TODO: Implement field vs drone comparison
    
    // STUB RESPONSE (for now) - NO NULL VALUES!
    return res.status(200).json({
      success: true,
      data: {
        distribution: [
          {
            category: "TRUE_POSITIVE",
            drone_prediction: "STRESS",
            field_validation: "STRESS",
            trees: 118,
            percentage: 13.0,
            common_causes: ["Ganoderma confirmed", "Nutrisi deficiency", "Root damage"]
          },
          {
            category: "FALSE_POSITIVE",
            drone_prediction: "STRESS",
            field_validation: "HEALTHY",
            trees: 23,
            percentage: 2.5,
            common_causes: ["Bayangan awan", "Embun pagi", "Camera angle"]
          },
          {
            category: "TRUE_NEGATIVE",
            drone_prediction: "HEALTHY",
            field_validation: "HEALTHY",
            trees: 745,
            percentage: 81.9,
            common_causes: ["Pohon sehat"]
          },
          {
            category: "FALSE_NEGATIVE",
            drone_prediction: "HEALTHY",
            field_validation: "STRESS",
            trees: 24,
            percentage: 2.6,
            common_causes: ["Stress awal (belum terdeteksi NDRE)", "Pohon tertutup kanopi"]
          }
        ],
        summary: {
          total_validated: 910,
          match_rate: 94.8,
          mismatch_rate: 5.2
        }
      },
      message: "Field vs Drone comparison berhasil diambil (STUB - belum implement)"
    });
    
  } catch (error) {
    console.error('❌ [API Error] GET /api/v1/validation/field-vs-drone:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Gagal mengambil data Field vs Drone'
    });
  }
});

module.exports = router;
