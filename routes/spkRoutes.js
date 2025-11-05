/**
 * SPK ROUTES - API ENDPOINTS (INPUT/WRITE)
 * 
 * KATEGORI 2: Tuntunan Backend - API untuk Write Operations
 * Sub-Proses 1 & 2: INTEL & PLAN + EKSEKUSI & LAPOR
 * 
 * Filosofi 3P:
 * - SIMPLE: Endpoint terstruktur, validasi jelas
 * - TEPAT: Jejak Digital 5W1H wajib, validasi server-side ketat
 * - PENINGKATAN BERTAHAB: Trigger otomatis Work Order baru
 * 
 * Tuntunan Keamanan: Semua input harus divalidasi server-side
 * Tuntunan Dokumentasi: Setiap endpoint disertai contoh request/response
 */

const express = require('express');
const router = express.Router();
const spkService = require('../services/spkService');

// ============================================================
// FITUR M-4.1: MEMBUAT SPK HEADER
// ============================================================

/**
 * POST /api/v1/spk/
 * 
 * TUJUAN: Membuat SPK Header baru (Induk Penugasan)
 * FITUR: M-4.1 - Membuat SPK Header
 * SUB-PROSES: SP-1 (Intel & Plan) - Organizing
 * 
 * REQUEST BODY (JSON):
 * {
 *   "nama_spk": "SPK Validasi Drone Blok A1 - Oktober 2025",
 *   "id_asisten_pembuat": "uuid-asisten-agus",
 *   "tanggal_target_selesai": "2025-11-15",  // Optional (ISO 8601 date)
 *   "keterangan": "Validasi hasil deteksi drone..."  // Optional
 * }
 * 
 * RESPONSE SUCCESS (201):
 * {
 *   "success": true,
 *   "data": {
 *     "id_spk": "uuid-spk-baru",
 *     "nama_spk": "SPK Validasi Drone Blok A1 - Oktober 2025",
 *     "id_asisten_pembuat": "uuid-asisten-agus",
 *     "tanggal_dibuat": "2025-11-05T12:00:00Z",
 *     "tanggal_target_selesai": "2025-11-15",
 *     "status_spk": "BARU",
 *     "keterangan": "Validasi hasil deteksi drone..."
 *   },
 *   "message": "SPK Header berhasil dibuat"
 * }
 * 
 * ERROR RESPONSE (400 - Validasi):
 * {
 *   "success": false,
 *   "error": "Validation failed",
 *   "errors": [
 *     { "field": "nama_spk", "message": "Nama SPK wajib diisi" },
 *     { "field": "id_asisten_pembuat", "message": "ID Asisten tidak valid" }
 *   ],
 *   "message": "Data SPK tidak valid"
 * }
 * 
 * ERROR RESPONSE (500):
 * {
 *   "success": false,
 *   "error": "Error message",
 *   "message": "Gagal membuat SPK Header"
 * }
 * 
 * CONTOH REQUEST (cURL):
 * curl -X POST http://localhost:3000/api/v1/spk/ \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "nama_spk": "SPK Validasi Drone Blok A1",
 *     "id_asisten_pembuat": "uuid-asisten-agus"
 *   }'
 */
router.post('/', async (req, res) => {
  try {
    // Prinsip KEAMANAN: Validasi server-side untuk semua input
    const spkData = req.body;
    
    // 1. Validasi Required Fields
    const requiredFields = ['nama_spk', 'id_asisten_pembuat'];
    const missingFields = [];
    
    requiredFields.forEach(field => {
      if (!spkData[field] || spkData[field].toString().trim() === '') {
        missingFields.push({
          field: field,
          message: `Field ${field} wajib diisi`
        });
      }
    });
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: missingFields,
        message: 'Data SPK tidak valid - field wajib tidak lengkap'
      });
    }
    
    // 2. Validasi Format & Tipe Data
    const validationErrors = [];
    
    // 2a. Validasi nama_spk (max 255 chars)
    if (spkData.nama_spk.length > 255) {
      validationErrors.push({
        field: 'nama_spk',
        message: 'Nama SPK maksimal 255 karakter'
      });
    }
    
    // 2b. Validasi id_asisten_pembuat (format UUID atau alphanumeric)
    // Catatan: Supabase menggunakan UUID, tapi kita flexible untuk custom ID
    if (!/^[a-zA-Z0-9_-]{1,50}$/.test(spkData.id_asisten_pembuat)) {
      validationErrors.push({
        field: 'id_asisten_pembuat',
        message: 'ID Asisten tidak valid (gunakan alphanumeric, max 50 karakter)'
      });
    }
    
    // 2c. Validasi tanggal_target_selesai (optional, tapi kalau ada harus valid)
    if (spkData.tanggal_target_selesai) {
      const targetDate = new Date(spkData.tanggal_target_selesai);
      if (isNaN(targetDate.getTime())) {
        validationErrors.push({
          field: 'tanggal_target_selesai',
          message: 'Format tanggal tidak valid (gunakan ISO 8601: YYYY-MM-DD)'
        });
      }
      // Validasi: tanggal target tidak boleh di masa lalu
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (targetDate < today) {
        validationErrors.push({
          field: 'tanggal_target_selesai',
          message: 'Tanggal target tidak boleh di masa lalu'
        });
      }
    }
    
    // 2d. Validasi keterangan (optional, max 5000 chars untuk text field)
    if (spkData.keterangan && spkData.keterangan.length > 5000) {
      validationErrors.push({
        field: 'keterangan',
        message: 'Keterangan maksimal 5000 karakter'
      });
    }
    
    // Jika ada error validasi, return 400
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: validationErrors,
        message: 'Data SPK tidak valid'
      });
    }
    
    // 3. Call service layer untuk insert ke database
    const newSpk = await spkService.createSpkHeader(spkData);
    
    // 4. Prinsip TEPAT: Response sesuai kontrak API
    return res.status(201).json({
      success: true,
      data: newSpk,
      message: 'SPK Header berhasil dibuat'
    });
    
  } catch (error) {
    // Error handling dengan logging
    console.error('❌ [API Error] POST /api/v1/spk/:', error.message);
    
    // Cek apakah error dari foreign key constraint (ID Asisten tidak ditemukan)
    if (error.message.includes('foreign key') || error.message.includes('violates')) {
      return res.status(400).json({
        success: false,
        error: error.message,
        message: 'ID Asisten Pembuat tidak ditemukan di database'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Gagal membuat SPK Header'
    });
  }
});

// ============================================================
// FITUR M-4.2: MENAMBAH TUGAS KE SPK (BATCH)
// ============================================================

/**
 * POST /api/v1/spk/:id_spk/tugas
 * 
 * TUJUAN: Menambahkan tugas (batch/array) ke SPK Header yang sudah ada
 * FITUR: M-4.2 - Menambah Tugas ke SPK
 * SUB-PROSES: SP-1 (Intel & Plan) - Organizing (Breakdown SPK ke Tugas Detail)
 * 
 * URL PARAMETERS:
 * - id_spk: UUID SPK Header yang sudah dibuat (dari M-4.1)
 * 
 * REQUEST BODY (JSON - Array of Tugas):
 * {
 *   "tugas": [
 *     {
 *       "id_pelaksana": "uuid-mandor-budi",
 *       "tipe_tugas": "VALIDASI_DRONE",
 *       "target_json": {
 *         "blok": "A1",
 *         "id_pohon": ["uuid-pohon-1", "uuid-pohon-2", "uuid-pohon-3"]
 *       },
 *       "prioritas": 1  // Optional: 1=Tinggi, 2=Sedang, 3=Rendah (default: 2)
 *     },
 *     {
 *       "id_pelaksana": "uuid-mandor-citra",
 *       "tipe_tugas": "VALIDASI_DRONE",
 *       "target_json": {
 *         "blok": "A2",
 *         "id_pohon": ["uuid-pohon-4", "uuid-pohon-5"]
 *       },
 *       "prioritas": 2
 *     }
 *   ]
 * }
 * 
 * RESPONSE SUCCESS (201):
 * {
 *   "success": true,
 *   "data": {
 *     "id_spk": "uuid-spk",
 *     "jumlah_tugas_ditambahkan": 2,
 *     "tugas": [
 *       {
 *         "id_tugas": "uuid-tugas-1",
 *         "id_pelaksana": "uuid-mandor-budi",
 *         "tipe_tugas": "VALIDASI_DRONE",
 *         "status_tugas": "BARU",
 *         ...
 *       },
 *       ...
 *     ]
 *   },
 *   "message": "2 tugas berhasil ditambahkan ke SPK"
 * }
 * 
 * ERROR RESPONSE (400):
 * {
 *   "success": false,
 *   "error": "Validation failed",
 *   "errors": [
 *     { "index": 0, "field": "id_pelaksana", "message": "..." }
 *   ],
 *   "message": "Validasi tugas gagal"
 * }
 * 
 * ERROR RESPONSE (404):
 * {
 *   "success": false,
 *   "error": "SPK not found",
 *   "message": "SPK dengan ID ... tidak ditemukan"
 * }
 * 
 * CONTOH REQUEST (cURL):
 * curl -X POST http://localhost:3000/api/v1/spk/{id_spk}/tugas \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "tugas": [
 *       {
 *         "id_pelaksana": "uuid-mandor-budi",
 *         "tipe_tugas": "VALIDASI_DRONE",
 *         "target_json": {"blok": "A1", "id_pohon": ["uuid-1", "uuid-2"]}
 *       }
 *     ]
 *   }'
 */
router.post('/:id_spk/tugas', async (req, res) => {
  try {
    // Prinsip KEAMANAN: Validasi server-side untuk URL parameter
    const { id_spk } = req.params;
    
    // 1. Validasi id_spk dari URL parameter
    if (!id_spk || id_spk.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Invalid id_spk',
        message: 'Parameter id_spk tidak boleh kosong'
      });
    }
    
    // Validasi format UUID (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id_spk)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid id_spk format',
        message: 'Format id_spk harus UUID yang valid'
      });
    }
    
    // 2. Validasi request body - harus ada array 'tugas'
    const { tugas } = req.body;
    
    if (!tugas || !Array.isArray(tugas)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        message: 'Request body harus berisi array "tugas"'
      });
    }
    
    if (tugas.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Empty array',
        message: 'Array tugas tidak boleh kosong (minimal 1 tugas)'
      });
    }
    
    // Prinsip SKALABILITAS: Batasi jumlah tugas per batch
    if (tugas.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Too many tasks',
        message: 'Maksimal 100 tugas per batch (untuk performa)'
      });
    }
    
    // 3. Validasi setiap item tugas dalam array
    const validationErrors = [];
    const requiredFields = ['id_pelaksana', 'tipe_tugas', 'target_json'];
    
    tugas.forEach((item, index) => {
      // 3a. Cek required fields
      requiredFields.forEach(field => {
        if (!item[field] || (typeof item[field] === 'string' && item[field].trim() === '')) {
          validationErrors.push({
            index: index,
            field: field,
            message: `Tugas ke-${index + 1}: Field ${field} wajib diisi`
          });
        }
      });
      
      // 3b. Validasi format id_pelaksana (UUID)
      if (item.id_pelaksana && !uuidRegex.test(item.id_pelaksana)) {
        validationErrors.push({
          index: index,
          field: 'id_pelaksana',
          message: `Tugas ke-${index + 1}: Format id_pelaksana harus UUID yang valid`
        });
      }
      
      // 3c. Validasi tipe_tugas (max 15 chars sesuai schema)
      if (item.tipe_tugas && item.tipe_tugas.length > 15) {
        validationErrors.push({
          index: index,
          field: 'tipe_tugas',
          message: `Tugas ke-${index + 1}: tipe_tugas maksimal 15 karakter`
        });
      }
      
      // 3d. Validasi target_json (harus object, bukan string)
      if (item.target_json) {
        if (typeof item.target_json === 'string') {
          // Coba parse jika string
          try {
            JSON.parse(item.target_json);
          } catch {
            validationErrors.push({
              index: index,
              field: 'target_json',
              message: `Tugas ke-${index + 1}: target_json harus JSON object yang valid`
            });
          }
        } else if (typeof item.target_json !== 'object') {
          validationErrors.push({
            index: index,
            field: 'target_json',
            message: `Tugas ke-${index + 1}: target_json harus berupa object`
          });
        }
      }
      
      // 3e. Validasi prioritas (optional, tapi kalau ada harus 1-3)
      if (item.prioritas !== undefined) {
        const prioritas = parseInt(item.prioritas);
        if (isNaN(prioritas) || prioritas < 1 || prioritas > 3) {
          validationErrors.push({
            index: index,
            field: 'prioritas',
            message: `Tugas ke-${index + 1}: prioritas harus 1 (Tinggi), 2 (Sedang), atau 3 (Rendah)`
          });
        }
      }
    });
    
    // Jika ada error validasi, return 400
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: validationErrors,
        message: `Validasi gagal pada ${validationErrors.length} item tugas`
      });
    }
    
    // 4. Call service layer untuk batch insert
    const result = await spkService.addTugasKeSpk(id_spk, tugas);
    
    // 5. Prinsip TEPAT: Response sesuai kontrak API
    return res.status(201).json({
      success: true,
      data: result,
      message: `${result.jumlah_tugas_ditambahkan} tugas berhasil ditambahkan ke SPK`
    });
    
  } catch (error) {
    // Error handling dengan logging
    console.error('❌ [API Error] POST /api/v1/spk/:id_spk/tugas:', error.message);
    
    // Cek apakah error dari SPK not found
    if (error.message.includes('tidak ditemukan') || error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message,
        message: 'SPK tidak ditemukan'
      });
    }
    
    // Cek apakah error dari foreign key constraint
    if (error.message.includes('foreign key') || error.message.includes('violates')) {
      return res.status(400).json({
        success: false,
        error: error.message,
        message: 'ID Pelaksana atau Tipe Tugas tidak valid (tidak ditemukan di database)'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Gagal menambahkan tugas ke SPK'
    });
  }
});

// ============================================================
// PLACEHOLDER ENDPOINTS (BELUM DIIMPLEMENTASIKAN)
// ============================================================

/**
 * POST /api/v1/spk/lapor-validasi
 * [PLACEHOLDER - Belum diimplementasikan]
 */
router.post('/lapor-validasi', async (req, res) => {
  try {
    // TODO: Implementasi lapor validasi
    return res.status(501).json({
      success: false,
      message: 'Endpoint belum diimplementasikan',
      todo: 'POST /api/v1/spk/lapor-validasi'
    });
  } catch (error) {
    console.error('❌ [API Error] POST /api/v1/spk/lapor-validasi:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v1/spk/lapor-aph
 * [PLACEHOLDER - Belum diimplementasikan]
 */
router.post('/lapor-aph', async (req, res) => {
  try {
    // TODO: Implementasi lapor APH
    return res.status(501).json({
      success: false,
      message: 'Endpoint belum diimplementasikan',
      todo: 'POST /api/v1/spk/lapor-aph'
    });
  } catch (error) {
    console.error('❌ [API Error] POST /api/v1/spk/lapor-aph:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/v1/spk/lapor-sanitasi
 * [PLACEHOLDER - Belum diimplementasikan]
 */
router.post('/lapor-sanitasi', async (req, res) => {
  try {
    // TODO: Implementasi lapor sanitasi
    return res.status(501).json({
      success: false,
      message: 'Endpoint belum diimplementasikan',
      todo: 'POST /api/v1/spk/lapor-sanitasi'
    });
  } catch (error) {
    console.error('❌ [API Error] POST /api/v1/spk/lapor-sanitasi:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/v1/spk/daftar-tugas
 * [PLACEHOLDER - Belum diimplementasikan]
 */
router.get('/daftar-tugas', async (req, res) => {
  try {
    // TODO: Implementasi get daftar tugas
    return res.status(501).json({
      success: false,
      message: 'Endpoint belum diimplementasikan',
      todo: 'GET /api/v1/spk/daftar-tugas'
    });
  } catch (error) {
    console.error('❌ [API Error] GET /api/v1/spk/daftar-tugas:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
