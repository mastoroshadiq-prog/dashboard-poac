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

// ============================================================
// SUB-PROSES 2: ACTUATING & REPORTING (Platform A - Flutter)
// ============================================================

const { authenticateJWT } = require('../middleware/authMiddleware');

/**
 * GET /api/v1/spk/tugas/saya
 * 
 * TUJUAN: Dipanggil oleh Platform A (Flutter) untuk mengambil tugas pelaksana
 * FITUR: Sub-Proses 2.1 - Mengambil Tugas (Sinkronisasi di Kantor)
 * KEAMANAN: WAJIB JWT Authentication
 * 
 * AUTHENTICATION:
 * - Header: "Authorization: Bearer <jwt_token>"
 * - Token payload HARUS berisi: { id_pihak: "uuid-mandor-agus", ... }
 * 
 * QUERY PARAMETERS (Paginasi - WAJIB untuk Skalabilitas):
 * - page: number (default: 1)
 * - limit: number (default: 100, max: 500)
 * - status: string (optional filter: 'BARU', 'DIKERJAKAN', atau 'BARU,DIKERJAKAN')
 * 
 * LOGIKA:
 * 1. Ambil id_pelaksana dari JWT token (req.user.id_pihak) - JANGAN DARI QUERY PARAM
 * 2. Query spk_tugas WHERE id_pelaksana = req.user.id_pihak
 * 3. Filter hanya status 'BARU' atau 'DIKERJAKAN' (default)
 * 4. Implementasi paginasi (offset/limit)
 * 5. Return array tugas dengan metadata pagination
 * 
 * RESPONSE SUCCESS (200):
 * {
 *   "success": true,
 *   "data": {
 *     "tugas": [
 *       {
 *         "id_tugas": "uuid-tugas-1",
 *         "id_spk": "uuid-spk-parent",
 *         "tipe_tugas": "VALIDASI_DRONE",
 *         "status_tugas": "BARU",
 *         "target_json": { "blok": "A1", "id_pohon": [...] },
 *         "prioritas": 1,
 *         "tanggal_dibuat": "2025-11-06T10:00:00Z"
 *       },
 *       ...
 *     ],
 *     "pagination": {
 *       "page": 1,
 *       "limit": 100,
 *       "total_items": 250,
 *       "total_pages": 3,
 *       "has_next": true,
 *       "has_prev": false
 *     }
 *   },
 *   "message": "Ditemukan 100 tugas untuk pelaksana"
 * }
 * 
 * ERROR RESPONSE (401):
 * {
 *   "success": false,
 *   "error": "Unauthorized",
 *   "message": "Token tidak ditemukan. Silakan login terlebih dahulu."
 * }
 * 
 * CONTOH REQUEST:
 * curl -X GET "http://localhost:3000/api/v1/spk/tugas/saya?page=1&limit=50&status=BARU" \
 *   -H "Authorization: Bearer <jwt_token>"
 */
router.get('/tugas/saya', authenticateJWT, async (req, res) => {
  try {
    // Prinsip KEAMANAN: Ambil id_pelaksana dari JWT (BUKAN dari query param!)
    const id_pelaksana = req.user.id_pihak;
    
    // Prinsip SKALABILITAS: Parsing pagination parameters
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 100;
    
    // Validasi pagination
    if (page < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid page',
        message: 'Parameter "page" harus >= 1'
      });
    }
    
    // Batasi max limit untuk performa
    if (limit < 1 || limit > 500) {
      limit = 100; // Default jika invalid
    }
    
    // Parsing status filter (optional)
    let statusFilter = req.query.status 
      ? req.query.status.split(',').map(s => s.trim().toUpperCase())
      : ['BARU', 'DIKERJAKAN']; // Default: hanya BARU & DIKERJAKAN
    
    // Validasi status (hanya allow 'BARU', 'DIKERJAKAN', 'SELESAI')
    const validStatuses = ['BARU', 'DIKERJAKAN', 'SELESAI'];
    statusFilter = statusFilter.filter(s => validStatuses.includes(s));
    
    if (statusFilter.length === 0) {
      statusFilter = ['BARU', 'DIKERJAKAN']; // Fallback
    }
    
    console.log('📱 [Platform A] GET Tugas Saya');
    console.log('   Pelaksana:', id_pelaksana);
    console.log('   Page:', page, 'Limit:', limit);
    console.log('   Status Filter:', statusFilter);
    
    // Call service layer
    const result = await spkService.getTugasSaya(id_pelaksana, {
      page,
      limit,
      status: statusFilter
    });
    
    return res.status(200).json({
      success: true,
      data: result,
      message: `Ditemukan ${result.tugas.length} tugas untuk pelaksana`
    });
    
  } catch (error) {
    console.error('❌ [API Error] GET /api/v1/spk/tugas/saya:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Gagal mengambil daftar tugas'
    });
  }
});

/**
 * POST /api/v1/log_aktivitas
 * 
 * TUJUAN: Dipanggil oleh Platform A (Flutter) untuk upload Jejak Digital 5W1H
 * FITUR: Sub-Proses 2.1, 2.3, 2.4 - Melaporkan Hasil Eksekusi Tugas
 * KEAMANAN: WAJIB JWT Authentication
 * 
 * INI ADALAH API PALING PENTING UNTUK DASHBOARD!
 * 
 * AUTHENTICATION:
 * - Header: "Authorization: Bearer <jwt_token>"
 * - Token payload HARUS berisi: { id_pihak: "uuid-mandor-agus", ... }
 * 
 * REQUEST BODY (Batch Upload):
 * {
 *   "log_aktivitas": [
 *     {
 *       "id_tugas": "uuid-tugas-1",
 *       "id_npokok": "uuid-pohon-123",
 *       "timestamp_eksekusi": "2025-11-06T14:30:00Z",  // ISO 8601
 *       "gps_eksekusi": { "lat": -6.1234, "lon": 106.5678 },  // JSONB
 *       "hasil_json": {
 *         "status_aktual": "G1",  // G1, G2, G3, G4 (untuk Validasi)
 *         "tipe_kejadian": "VALIDASI_DRONE",
 *         "keterangan": "Pohon sakit berat, perlu APH segera"
 *       }
 *     },
 *     ...
 *   ]
 * }
 * 
 * LOGIKA (Prinsip TEPAT - WAJIB):
 * 1. Ambil id_petugas (WHO) dari JWT token - JANGAN PERCAYA INPUT BODY
 * 2. Validasi server-side untuk SETIAP log dalam array:
 *    - id_tugas exist di spk_tugas
 *    - id_npokok valid (optional jika ada tabel master_pohon)
 *    - timestamp_eksekusi valid ISO 8601
 *    - gps_eksekusi valid lat/lon
 *    - hasil_json valid structure
 * 3. Batch INSERT ke tabel log_aktivitas_5w1h
 * 4. AUTO-TRIGGER (WAJIB):
 *    a. Update status_tugas di spk_tugas (misal: BARU -> DIKERJAKAN)
 *    b. Jika hasil_json.status_aktual = 'G1' atau 'G4':
 *       -> AUTO-CREATE Work Order baru untuk APH/Sanitasi (Tugas 2.2)
 * 5. Return summary hasil upload
 * 
 * RESPONSE SUCCESS (201):
 * {
 *   "success": true,
 *   "data": {
 *     "log_diterima": 15,
 *     "log_berhasil": 15,
 *     "log_gagal": 0,
 *     "auto_trigger": {
 *       "work_order_created": 3,  // Jumlah WO APH/Sanitasi yang di-create
 *       "tugas_updated": 15       // Jumlah status tugas yang di-update
 *     }
 *   },
 *   "message": "15 log aktivitas berhasil diupload, 3 work order baru dibuat"
 * }
 * 
 * RESPONSE PARTIAL SUCCESS (207 - Multi-Status):
 * {
 *   "success": true,
 *   "data": {
 *     "log_diterima": 20,
 *     "log_berhasil": 18,
 *     "log_gagal": 2,
 *     "errors": [
 *       { "index": 5, "error": "id_tugas tidak ditemukan" },
 *       { "index": 12, "error": "timestamp_eksekusi invalid" }
 *     ],
 *     "auto_trigger": { ... }
 *   },
 *   "message": "18/20 log berhasil diupload, 2 log gagal validasi"
 * }
 * 
 * ERROR RESPONSE (401):
 * {
 *   "success": false,
 *   "error": "Unauthorized",
 *   "message": "Token tidak ditemukan"
 * }
 * 
 * CONTOH REQUEST:
 * curl -X POST http://localhost:3000/api/v1/log_aktivitas \
 *   -H "Authorization: Bearer <jwt_token>" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "log_aktivitas": [
 *       {
 *         "id_tugas": "uuid-tugas-1",
 *         "id_npokok": "uuid-pohon-123",
 *         "timestamp_eksekusi": "2025-11-06T14:30:00Z",
 *         "gps_eksekusi": {"lat": -6.1234, "lon": 106.5678},
 *         "hasil_json": {"status_aktual": "G1", "keterangan": "..."}
 *       }
 *     ]
 *   }'
 */
router.post('/log_aktivitas', authenticateJWT, async (req, res) => {
  try {
    // Prinsip KEAMANAN: Ambil id_petugas (WHO) dari JWT - JANGAN PERCAYA INPUT BODY
    const id_petugas = req.user.id_pihak;
    
    // 1. Validasi request body - harus ada array 'log_aktivitas'
    const { log_aktivitas } = req.body;
    
    if (!log_aktivitas || !Array.isArray(log_aktivitas)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request body',
        message: 'Request body harus berisi array "log_aktivitas"'
      });
    }
    
    if (log_aktivitas.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Empty array',
        message: 'Array log_aktivitas tidak boleh kosong (minimal 1 log)'
      });
    }
    
    // Prinsip SKALABILITAS: Batasi jumlah log per batch
    if (log_aktivitas.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Too many logs',
        message: 'Maksimal 1000 log per batch (untuk performa)'
      });
    }
    
    console.log('📱 [Platform A] POST Log Aktivitas 5W1H');
    console.log('   Petugas (WHO):', id_petugas);
    console.log('   Jumlah Log:', log_aktivitas.length);
    
    // 2. Validasi basic structure setiap log
    const requiredFields = ['id_tugas', 'id_npokok', 'timestamp_eksekusi', 'gps_eksekusi', 'hasil_json'];
    const validationErrors = [];
    
    log_aktivitas.forEach((log, index) => {
      // Cek required fields
      requiredFields.forEach(field => {
        if (!log[field]) {
          validationErrors.push({
            index: index,
            field: field,
            message: `Log ke-${index + 1}: Field ${field} wajib diisi`
          });
        }
      });
      
      // Validasi timestamp format (ISO 8601)
      if (log.timestamp_eksekusi) {
        const timestamp = new Date(log.timestamp_eksekusi);
        if (isNaN(timestamp.getTime())) {
          validationErrors.push({
            index: index,
            field: 'timestamp_eksekusi',
            message: `Log ke-${index + 1}: Format timestamp harus ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)`
          });
        }
      }
      
      // Validasi gps_eksekusi (harus object dengan lat & lon)
      if (log.gps_eksekusi) {
        if (typeof log.gps_eksekusi !== 'object' || !log.gps_eksekusi.lat || !log.gps_eksekusi.lon) {
          validationErrors.push({
            index: index,
            field: 'gps_eksekusi',
            message: `Log ke-${index + 1}: gps_eksekusi harus object dengan property "lat" dan "lon"`
          });
        }
      }
      
      // Validasi hasil_json (harus object)
      if (log.hasil_json && typeof log.hasil_json !== 'object') {
        validationErrors.push({
          index: index,
          field: 'hasil_json',
          message: `Log ke-${index + 1}: hasil_json harus berupa object`
        });
      }
    });
    
    // Jika ada error validasi, return 400
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: validationErrors,
        message: `Validasi gagal pada ${validationErrors.length} log`
      });
    }
    
    // 3. Call service layer untuk batch insert + auto-trigger
    const result = await spkService.uploadLogAktivitas5W1H(id_petugas, log_aktivitas);
    
    // 4. Return response dengan status code yang sesuai
    if (result.log_gagal > 0) {
      // Partial success - ada beberapa log yang gagal
      return res.status(207).json({
        success: true,
        data: result,
        message: `${result.log_berhasil}/${result.log_diterima} log berhasil diupload, ${result.log_gagal} log gagal`
      });
    } else {
      // Full success
      return res.status(201).json({
        success: true,
        data: result,
        message: `${result.log_berhasil} log aktivitas berhasil diupload${result.auto_trigger.work_order_created > 0 ? `, ${result.auto_trigger.work_order_created} work order baru dibuat` : ''}`
      });
    }
    
  } catch (error) {
    console.error('❌ [API Error] POST /api/v1/log_aktivitas:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Gagal mengupload log aktivitas'
    });
  }
});

module.exports = router;
