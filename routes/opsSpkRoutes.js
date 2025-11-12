const express = require('express');
const router = express.Router();
const opsSpkService = require('../services/opsSpkService');

/**
 * OPS SPK Routes - Multi-Purpose SPK System
 * Base path: /api/v1/ops
 */

/**
 * GET /api/v1/ops/fase
 * Get all lifecycle phases with sub-tindakan counts
 */
router.get('/fase', async (req, res) => {
  try {
    const result = await opsSpkService.getFaseList();
    res.json(result);
  } catch (error) {
    console.error('Error in GET /fase:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/ops/fase/:id_fase/sub-tindakan
 * Get sub-tindakan for specific fase
 */
router.get('/fase/:id_fase/sub-tindakan', async (req, res) => {
  try {
    const { id_fase } = req.params;
    const result = await opsSpkService.getSubTindakanByFase(id_fase);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error in GET /fase/:id_fase/sub-tindakan:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/ops/sub-tindakan/:id/jadwal
 * Get jadwal for specific sub-tindakan
 */
router.get('/sub-tindakan/:id/jadwal', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await opsSpkService.getJadwalBySubTindakan(id);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error in GET /sub-tindakan/:id/jadwal:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * POST /api/v1/ops/spk/create
 * Create new SPK from jadwal_tindakan
 * 
 * Body:
 * {
 *   id_jadwal_tindakan: UUID,
 *   nomor_spk: String,
 *   tanggal_terbit: Date (optional, defaults to today),
 *   tanggal_mulai: Date,
 *   tanggal_selesai: Date,
 *   penanggung_jawab: String,
 *   mandor: String,
 *   lokasi: String,
 *   uraian_pekerjaan: String,
 *   catatan: String (optional)
 * }
 */
router.post('/spk/create', async (req, res) => {
  try {
    const result = await opsSpkService.createOPSSPK(req.body);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error in POST /spk/create:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/ops/spk
 * Get SPK list with filters
 * 
 * Query params:
 * - status: String (PENDING, DIKERJAKAN, SELESAI, DITUNDA)
 * - id_fase_besar: UUID
 * - tanggal_mulai: Date (range start)
 * - tanggal_selesai: Date (range end)
 * - mandor: String (partial match)
 * - lokasi: String (partial match)
 * - page: Number (default: 1)
 * - limit: Number (default: 20)
 */
router.get('/spk', async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      id_fase_besar: req.query.id_fase_besar,
      tanggal_mulai: req.query.tanggal_mulai,
      tanggal_selesai: req.query.tanggal_selesai,
      mandor: req.query.mandor,
      lokasi: req.query.lokasi,
      page: req.query.page || 1,
      limit: req.query.limit || 20
    };
    
    const result = await opsSpkService.getSPKList(filters);
    res.json(result);
  } catch (error) {
    console.error('Error in GET /spk:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * PUT /api/v1/ops/spk/:id_spk/status
 * Update SPK status
 * 
 * Body:
 * {
 *   status: String (PENDING, DIKERJAKAN, SELESAI, DITUNDA),
 *   catatan: String (optional)
 * }
 */
router.put('/spk/:id_spk/status', async (req, res) => {
  try {
    const { id_spk } = req.params;
    const { status, catatan } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const result = await opsSpkService.updateSPKStatus(id_spk, status, catatan);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error in PUT /spk/:id_spk/status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;
