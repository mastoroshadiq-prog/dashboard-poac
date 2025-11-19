/**
 * GET LIST MANDOR - For SPK Assignment Form (Asisten Manager)
 * Returns list of mandor users untuk dropdown "Assign to Mandor"
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticateJWT, authorizeRole } = require('../middleware/authMiddleware');

/**
 * GET /api/v1/mandor/list
 * 
 * Purpose: Get list of all mandor users for SPK assignment form
 * Used by: Asisten Manager when creating SPK
 * 
 * Authorization: ASISTEN, ADMIN only
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "mandor_list": [
 *       {
 *         "id_pihak": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
 *         "nama": "Agus (Mandor Sensus)",
 *         "kode_unik": "AGUS_MANDOR",
 *         "tipe": "INTERNAL"
 *       },
 *       {
 *         "id_pihak": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
 *         "nama": "Eko (Mandor APH)",
 *         "kode_unik": "EKO_MANDOR",
 *         "tipe": "INTERNAL"
 *       }
 *     ],
 *     "total": 2
 *   }
 * }
 */
router.get('/list',
  authenticateJWT,
  authorizeRole(['ASISTEN', 'ADMIN']),
  async (req, res) => {
    try {
      console.log('📋 [Mandor List] Fetching all mandor users...');

      // Query master_pihak untuk mandor
      // Mandor disimpan dengan tipe='INTERNAL' dan kode_unik contains 'MANDOR'
      const { data: allInternal, error } = await supabase
        .from('master_pihak')
        .select('id_pihak, nama, tipe, kode_unik, alias')
        .eq('tipe', 'INTERNAL')
        .order('nama', { ascending: true });

      if (error) {
        console.error('❌ Error fetching mandor list:', error);
        throw error;
      }

      // Filter untuk mandor (kode_unik mengandung 'MANDOR')
      const mandorList = allInternal?.filter(user => 
        user.kode_unik?.toUpperCase().includes('MANDOR')
      ) || [];

      console.log(`✅ Found ${mandorList.length} mandor(s)`);

      return res.status(200).json({
        success: true,
        data: {
          mandor_list: mandorList.map(m => ({
            id_pihak: m.id_pihak,
            nama: m.nama,
            kode_unik: m.kode_unik,
            tipe: m.tipe,
            alias: m.alias || null
          })),
          total: mandorList.length
        }
      });

    } catch (error) {
      console.error('❌ [Mandor List] Error:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
        message: 'Gagal mengambil daftar mandor'
      });
    }
  }
);

module.exports = router;
