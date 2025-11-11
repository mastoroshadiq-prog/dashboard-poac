/**
 * LIFECYCLE ROUTES - API ENDPOINTS
 * 
 * Endpoints:
 * - GET /api/v1/lifecycle/overview - Get all phases summary
 * - GET /api/v1/lifecycle/phase/:phase_name - Get specific phase metrics
 * - GET /api/v1/lifecycle/sop-compliance - Get SOP compliance by phase
 */

const express = require('express');
const router = express.Router();
const lifecycleService = require('../services/lifecycleService');

/**
 * GET /api/v1/lifecycle/overview
 * Description: Get lifecycle overview across all 5 phases
 * Response: { phases: [], summary: {}, health_index: number }
 */
router.get('/overview', async (req, res) => {
  try {
    console.log('📊 [API] GET /api/v1/lifecycle/overview');
    const result = await lifecycleService.getLifecycleOverview();
    res.json(result);
  } catch (error) {
    console.error('❌ [API] Error in /lifecycle/overview:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/lifecycle/phase/:phase_name
 * Description: Get detailed metrics for specific phase
 * Params: phase_name (Pembibitan, TBM, TM, Pemanenan, Replanting)
 * Response: { phase_info: {}, summary: {}, by_spk: [], weekly_breakdown: [] }
 */
router.get('/phase/:phase_name', async (req, res) => {
  try {
    const { phase_name } = req.params;
    console.log(`📊 [API] GET /api/v1/lifecycle/phase/${phase_name}`);
    const result = await lifecycleService.getPhaseMetrics(phase_name);
    
    if (result.error) {
      res.status(404).json(result);
    } else {
      res.json(result);
    }
  } catch (error) {
    console.error(`❌ [API] Error in /lifecycle/phase/${req.params.phase_name}:`, error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/lifecycle/sop-compliance
 * Description: Get SOP compliance metrics by phase
 * Response: { by_phase: [], overall_compliance: number, non_compliant_phases: [] }
 */
router.get('/sop-compliance', async (req, res) => {
  try {
    console.log('📊 [API] GET /api/v1/lifecycle/sop-compliance');
    const result = await lifecycleService.getSOPComplianceByPhase();
    res.json(result);
  } catch (error) {
    console.error('❌ [API] Error in /lifecycle/sop-compliance:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
