# 📋 API SPK VALIDASI DRONE - TESTING GUIDE

## 🎯 Overview

API untuk workflow SPK Validasi Drone NDRE dengan 3 tahap:
1. **Asisten Manager**: Membuat SPK Validasi Drone (pilih pohon dari data NDRE)
2. **Mandor**: Melihat SPK yang ditugaskan + statistik tugas
3. **Mandor**: Menugaskan tugas ke surveyor lapangan

---

## 📡 Base URL

```
http://localhost:3000/api/v1/spk
```

---

## 🔐 Authentication

**Status**: Auth belum diimplementasi untuk testing awal.

Untuk production:
- Gunakan Supabase Auth JWT
- Tambahkan header: `Authorization: Bearer <jwt_token>`

---

## 📌 Endpoints

### 1️⃣ CREATE SPK VALIDASI DRONE (Asisten Manager)

**Endpoint**: `POST /api/v1/spk/validasi-drone`

**Deskripsi**: Asisten Manager membuat SPK untuk validasi pohon berdasarkan hasil drone NDRE.

**Request Body**:
```json
{
  "created_by": "uuid-asisten-manager",
  "assigned_to": "uuid-mandor",
  "trees": [
    "uuid-tree-1",
    "uuid-tree-2",
    "uuid-tree-3"
  ],
  "priority": "NORMAL",
  "deadline": "2025-02-01",
  "notes": "Validasi urgent area D001A - Stres Berat terdeteksi"
}
```

**Field Descriptions**:
- `created_by` (required): UUID user Asisten Manager
- `assigned_to` (required): UUID Mandor yang ditugaskan
- `trees` (required): Array UUID pohon (id_npokok) dari tabel kebun_n_pokok
- `priority` (optional): NORMAL | HIGH | URGENT (default: NORMAL)
  - ⚠️ Auto-adjusted ke URGENT jika ada Stres Berat
- `deadline` (optional): Target selesai (format: YYYY-MM-DD)
  - Auto-calculated jika tidak diisi:
    - URGENT: +2 hari
    - HIGH: +4 hari
    - NORMAL: +7 hari
- `notes` (optional): Catatan tambahan

**Response 201** (Success):
```json
{
  "success": true,
  "message": "SPK Validasi Drone berhasil dibuat",
  "data": {
    "spk": {
      "id_spk": "uuid-spk",
      "no_spk": "SPK-DRONE-1731380000000",
      "jenis_kegiatan": "VALIDASI_DRONE_NDRE",
      "prioritas": "URGENT",
      "status": "PENDING_ASSIGNMENT",
      "catatan": "Validasi 3 pohon berdasarkan survey drone NDRE. Stres Berat: 2, Stres Sedang: 1",
      "created_by": "uuid-asisten-manager",
      "assigned_to": "uuid-mandor",
      "target_selesai": "2025-01-27",
      "created_at": "2025-01-25T10:00:00Z"
    },
    "tugas": [
      {
        "id_tugas": "uuid-tugas-1",
        "id_spk": "uuid-spk",
        "id_npokok": "uuid-tree-1",
        "jenis_tindakan": "VALIDASI_NDRE",
        "status": "PENDING",
        "prioritas": "URGENT",
        "catatan": "Validasi pohon P-D001A-01-01 - NDRE: 0.125 (Stres Berat)...",
        "metadata_json": {
          "tree_location": {
            "divisi": "AME II",
            "blok": "D001",
            "blok_detail": "D001A",
            "n_baris": 1,
            "n_pokok": 1
          },
          "drone_data": {
            "id_observasi": "uuid-obs",
            "tanggal_survey": "2025-01-25",
            "ndre_value": 0.125,
            "ndre_classification": "Stres Berat"
          },
          "validation_checklist": [
            "Cek visual kondisi daun (warna, ukuran)",
            "Cek kondisi batang (kesehatan, penyakit)",
            "Cek kondisi tanah sekitar (kelembaban, nutrisi)",
            "Foto dokumentasi (4 arah: U/S/T/B)",
            "Verifikasi apakah stress sesuai hasil drone",
            "Catat penyebab stress jika ditemukan"
          ]
        }
      }
    ],
    "summary": {
      "total_trees": 3,
      "stress_levels": {
        "stres_berat": 2,
        "stres_sedang": 1,
        "sehat": 0
      },
      "priority": "URGENT",
      "deadline": "2025-01-27"
    }
  }
}
```

**Response 400** (Validation Error):
```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": {
    "created_by": null,
    "assigned_to": null,
    "trees": "trees harus berupa array dengan minimal 1 pohon"
  }
}
```

**Response 404** (Trees Not Found):
```json
{
  "success": false,
  "message": "No valid trees found for validation"
}
```

---

### 2️⃣ GET SPK LIST FOR MANDOR

**Endpoint**: `GET /api/v1/spk/mandor/:mandor_id`

**Deskripsi**: Mandor melihat daftar SPK yang ditugaskan dengan statistik tugas.

**Path Parameters**:
- `mandor_id` (required): UUID Mandor

**Query Parameters**:
- `status`: Filter by status (PENDING_ASSIGNMENT | ASSIGNED | IN_PROGRESS | COMPLETED)
- `priority`: Filter by priority (NORMAL | HIGH | URGENT)
- `date_from`: Filter from date (YYYY-MM-DD)
- `date_to`: Filter to date (YYYY-MM-DD)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Example Request**:
```bash
GET /api/v1/spk/mandor/uuid-mandor-123?status=PENDING_ASSIGNMENT&priority=URGENT&page=1&limit=10
```

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id_spk": "uuid-spk-1",
      "no_spk": "SPK-DRONE-1731380000000",
      "jenis_kegiatan": "VALIDASI_DRONE_NDRE",
      "status": "PENDING_ASSIGNMENT",
      "prioritas": "URGENT",
      "catatan": "Validasi 15 pohon berdasarkan survey drone NDRE...",
      "created_at": "2025-01-25T10:00:00Z",
      "target_selesai": "2025-01-27",
      "task_statistics": {
        "total": 15,
        "pending": 10,
        "assigned": 3,
        "in_progress": 2,
        "completed": 0,
        "urgent_count": 8
      },
      "completion_percentage": 13.33
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total_items": 5,
    "total_pages": 1
  }
}
```

**Response 400** (Missing mandor_id):
```json
{
  "success": false,
  "message": "mandor_id wajib diisi"
}
```

---

### 3️⃣ ASSIGN TUGAS TO SURVEYOR (Mandor)

**Endpoint**: `POST /api/v1/spk/:spk_id/assign-surveyor`

**Deskripsi**: Mandor menugaskan tugas ke surveyor lapangan.

**Path Parameters**:
- `spk_id` (required): UUID SPK

**Request Body**:
```json
{
  "id_tugas_list": [
    "uuid-tugas-1",
    "uuid-tugas-2",
    "uuid-tugas-3"
  ],
  "surveyor_id": "uuid-surveyor-123",
  "mandor_id": "uuid-mandor-456",
  "notes": "Prioritaskan area D001A terlebih dahulu"
}
```

**Field Descriptions**:
- `id_tugas_list` (required): Array UUID tugas yang akan ditugaskan
- `surveyor_id` (required): UUID surveyor yang ditugaskan
- `mandor_id` (required): UUID mandor (untuk authorization)
- `notes` (optional): Instruksi tambahan untuk surveyor

**Response 200**:
```json
{
  "success": true,
  "message": "3 tugas berhasil ditugaskan ke surveyor",
  "data": {
    "assigned_count": 3,
    "failed_count": 0,
    "tugas_list": [
      {
        "id_tugas": "uuid-tugas-1",
        "id_npokok": "uuid-tree-1",
        "tree_id": "P-D001A-01-01",
        "status": "ASSIGNED",
        "assigned_to": "uuid-surveyor-123",
        "assigned_at": "2025-01-25T11:00:00Z"
      }
    ]
  }
}
```

**Response 400** (Validation Error):
```json
{
  "success": false,
  "message": "id_tugas_list harus berupa array dengan minimal 1 tugas"
}
```

**Response 404** (SPK/Tugas Not Found):
```json
{
  "success": false,
  "message": "SPK atau tugas tidak ditemukan"
}
```

---

### 4️⃣ GET SPK DETAIL

**Endpoint**: `GET /api/v1/spk/:spk_id`

**Deskripsi**: Melihat detail lengkap SPK dengan semua tugas dan data pohon.

**Path Parameters**:
- `spk_id` (required): UUID SPK

**Example Request**:
```bash
GET /api/v1/spk/uuid-spk-123
```

**Response 200**:
```json
{
  "success": true,
  "data": {
    "spk": {
      "id_spk": "uuid-spk",
      "no_spk": "SPK-DRONE-1731380000000",
      "jenis_kegiatan": "VALIDASI_DRONE_NDRE",
      "prioritas": "URGENT",
      "status": "PENDING_ASSIGNMENT",
      "catatan": "Validasi 15 pohon...",
      "created_by": "uuid-asisten",
      "assigned_to": "uuid-mandor",
      "target_selesai": "2025-01-27",
      "created_at": "2025-01-25T10:00:00Z"
    },
    "tugas": [
      {
        "id_tugas": "uuid-tugas-1",
        "id_npokok": "uuid-tree-1",
        "tree_data": {
          "id_npokok": "uuid-tree-1",
          "id_tanaman": "P-D001A-01-01",
          "divisi": "AME II",
          "blok": "D001",
          "blok_detail": "D001A",
          "n_baris": 1,
          "n_pokok": 1,
          "tgl_tanam": "2020-05-15"
        },
        "ndre_data": {
          "id_observasi": "uuid-obs",
          "tanggal_survey": "2025-01-25",
          "ndre_value": 0.125,
          "ndre_classification": "Stres Berat"
        },
        "status": "PENDING",
        "prioritas": "URGENT",
        "assigned_to": null,
        "catatan": "Validasi pohon P-D001A-01-01...",
        "validation_checklist": [
          "Cek visual kondisi daun (warna, ukuran)",
          "Cek kondisi batang (kesehatan, penyakit)",
          "Cek kondisi tanah sekitar (kelembaban, nutrisi)",
          "Foto dokumentasi (4 arah: U/S/T/B)",
          "Verifikasi apakah stress sesuai hasil drone",
          "Catat penyebab stress jika ditemukan"
        ],
        "created_at": "2025-01-25T10:00:00Z",
        "updated_at": "2025-01-25T10:00:00Z"
      }
    ],
    "statistics": {
      "total_tugas": 15,
      "status_breakdown": {
        "PENDING": 10,
        "ASSIGNED": 3,
        "IN_PROGRESS": 2,
        "COMPLETED": 0
      },
      "priority_breakdown": {
        "URGENT": 8,
        "HIGH": 5,
        "NORMAL": 2
      },
      "completion_percentage": 13.33
    }
  }
}
```

**Response 404**:
```json
{
  "success": false,
  "message": "SPK dengan ID uuid-xxx tidak ditemukan"
}
```

---

## 🧪 Testing Steps

### **STEP 1: Get Tree IDs from Drone NDRE Data**

Gunakan endpoint Drone NDRE untuk mendapatkan ID pohon dengan Stres Berat/Sedang:

```bash
GET http://localhost:3000/api/v1/drone/ndre?stress_level=Stres%20Berat&limit=5
```

Copy `id_npokok` dari response untuk digunakan di Step 2.

---

### **STEP 2: Create SPK Validasi Drone**

**PowerShell**:
```powershell
$body = @{
    created_by = "test-asisten-manager-uuid"
    assigned_to = "test-mandor-uuid"
    trees = @(
        "uuid-tree-1",
        "uuid-tree-2",
        "uuid-tree-3"
    )
    priority = "NORMAL"
    notes = "Testing SPK Validasi Drone"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/spk/validasi-drone" -Method Post -Body $body -ContentType "application/json"
$response | ConvertTo-Json -Depth 10
```

**Browser Console (JavaScript)**:
```javascript
fetch('http://localhost:3000/api/v1/spk/validasi-drone', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    created_by: "test-asisten-manager-uuid",
    assigned_to: "test-mandor-uuid",
    trees: ["uuid-tree-1", "uuid-tree-2"],
    priority: "NORMAL",
    notes: "Testing SPK"
  })
})
.then(r => r.json())
.then(data => console.log(data));
```

Copy `id_spk` dari response.

---

### **STEP 3: Get SPK List for Mandor**

**Browser**:
```
http://localhost:3000/api/v1/spk/mandor/test-mandor-uuid?priority=URGENT
```

**PowerShell**:
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/spk/mandor/test-mandor-uuid" -Method Get | ConvertTo-Json -Depth 10
```

---

### **STEP 4: Get SPK Detail**

**Browser**:
```
http://localhost:3000/api/v1/spk/[id_spk_from_step2]
```

Copy beberapa `id_tugas` untuk Step 5.

---

### **STEP 5: Assign Tugas to Surveyor**

**PowerShell**:
```powershell
$body = @{
    id_tugas_list = @("uuid-tugas-1", "uuid-tugas-2")
    surveyor_id = "test-surveyor-uuid"
    mandor_id = "test-mandor-uuid"
    notes = "Prioritas area D001A"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/spk/[spk_id]/assign-surveyor" -Method Post -Body $body -ContentType "application/json"
$response | ConvertTo-Json -Depth 10
```

---

## 📊 Business Logic Highlights

### ✅ Auto-Priority Adjustment
- Jika ada pohon **Stres Berat** → Priority otomatis jadi **URGENT**
- Jika ada pohon **Stres Sedang** + input priority NORMAL → Auto jadi **HIGH**

### ⏰ Auto-Deadline Calculation
- **URGENT**: +2 hari dari sekarang
- **HIGH**: +4 hari dari sekarang
- **NORMAL**: +7 hari dari sekarang

### 📋 Validation Checklist (Auto-Generated)
Setiap tugas validasi sudah dilengkapi checklist standar:
1. ✅ Cek visual kondisi daun (warna, ukuran)
2. ✅ Cek kondisi batang (kesehatan, penyakit)
3. ✅ Cek kondisi tanah sekitar (kelembaban, nutrisi)
4. ✅ Foto dokumentasi (4 arah: U/S/T/B)
5. ✅ Verifikasi apakah stress sesuai hasil drone
6. ✅ Catat penyebab stress jika ditemukan

### 📝 Activity Logging
Semua aksi tercatat di tabel `spk_log_aktivitas`:
- CREATE_SPK_VALIDASI_DRONE
- ASSIGN_TUGAS_TO_SURVEYOR

---

## 🎯 Integration dengan Drone NDRE API

### Workflow End-to-End:

1. **Frontend Map View** (GET /api/v1/drone/ndre)
   - Tampilkan peta NDRE dengan color coding
   - Filter: Stres Berat, Stres Sedang
   - User select multiple trees

2. **Create SPK Button** (POST /api/v1/spk/validasi-drone)
   - Frontend kirim list tree IDs
   - Backend create SPK + tugas
   - Return SPK ID

3. **Mandor Dashboard** (GET /api/v1/spk/mandor/:mandor_id)
   - List SPK dengan statistik
   - Filter by priority, status

4. **Assign Surveyor** (POST /api/v1/spk/:spk_id/assign-surveyor)
   - Mandor pilih surveyor
   - Assign tugas ke surveyor

5. **Surveyor Mobile App** (GET /api/v1/spk/:spk_id)
   - Surveyor lihat tugas
   - Checklist validation
   - Upload hasil

---

## 🐛 Troubleshooting

### Error: "trees harus berupa array dengan minimal 1 pohon"
- Pastikan field `trees` berupa array: `["uuid-1", "uuid-2"]`
- Minimal 1 tree ID

### Error: "No valid trees found for validation"
- Tree IDs tidak ditemukan di database
- Pastikan tree ID valid (dari tabel kebun_n_pokok)
- Pastikan tree memiliki observasi NDRE (jenis_survey = 'DRONE_NDRE')

### Error: "mandor_id wajib diisi"
- Path parameter :mandor_id missing
- Contoh benar: `/api/v1/spk/mandor/uuid-123`

### Server Error 500
- Check terminal log untuk detail error
- Verifikasi Supabase connection
- Check apakah tabel spk, spk_tugas, spk_log_aktivitas exist

---

## 📚 Related Documentation

- [Drone NDRE API Guide](./DRONE_NDRE_API_GUIDE.md)
- [CSV Import Guide](../PANDUAN_IMPORT_CSV_NDRE.md)
- [Database Schema](../sql/fix_enhance_kebun_tables_for_ndre.sql)

---

**Last Updated**: 2025-01-25  
**API Version**: 1.0  
**Status**: ✅ Ready for Testing
