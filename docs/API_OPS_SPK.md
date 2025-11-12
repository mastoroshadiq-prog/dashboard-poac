# OPS SPK API - Multi-Purpose SPK System

## Overview

API untuk mengelola **SPK Multi-Purpose** berdasarkan lifecycle phases kelapa sawit (Pembibitan, TBM, TM, Pemanenan, Replanting). Sistem ini berbeda dengan SPK Validasi Drone yang fokus pada tree-specific validation.

**Database Tables:**
- `ops_fase_besar` (5 phases) - Lifecycle phases dengan umur tanaman
- `ops_sub_tindakan` (14 activities) - Kegiatan operasional per phase
- `ops_jadwal_tindakan` (5 schedules) - Konfigurasi jadwal (frekuensi, interval)
- `ops_spk_tindakan` (11+ documents) - SPK dokumen untuk operasional

**Relationship Chain:**
```
ops_fase_besar → ops_sub_tindakan → ops_jadwal_tindakan → ops_spk_tindakan
```

---

## Base URL

```
http://localhost:3000/api/v1/ops
```

---

## Endpoints

### 1. GET /fase
**Deskripsi:** Dapatkan semua lifecycle phases dengan jumlah sub-tindakan

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id_fase_besar": "6d034e3c-8b14-419a-9651-f89f1781ab39",
      "nama_fase": "Pembibitan",
      "umur_mulai": 0,
      "umur_selesai": 1,
      "deskripsi": "Fase pembibitan di nursery (pre-nursery dan main nursery)",
      "created_at": "2025-11-11T04:07:14.537384+00:00",
      "updated_at": null,
      "jumlah_sub_tindakan": 3
    },
    {
      "id_fase_besar": "1dd9e5da-7d58-4e87-93de-5237327450cf",
      "nama_fase": "TBM",
      "umur_mulai": 1,
      "umur_selesai": 3,
      "deskripsi": "Tanaman Belum Menghasilkan - perawatan tanaman muda umur 1-3 tahun",
      "jumlah_sub_tindakan": 3
    },
    {
      "id_fase_besar": "0865a29f-5838-4590-9c47-d0e638bff7ab",
      "nama_fase": "Pemanenan",
      "umur_mulai": 3,
      "umur_selesai": 25,
      "deskripsi": "Fase pemanenan TBS untuk tanaman menghasilkan (TM)",
      "jumlah_sub_tindakan": 4
    }
  ],
  "total": 5
}
```

**Contoh cURL:**
```bash
curl http://localhost:3000/api/v1/ops/fase
```

**Contoh PowerShell:**
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/ops/fase" -Method Get -UseBasicParsing
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

---

### 2. GET /fase/:id_fase/sub-tindakan
**Deskripsi:** Dapatkan sub-tindakan untuk fase tertentu

**Path Parameters:**
- `id_fase` (UUID) - ID dari ops_fase_besar

**Response:**
```json
{
  "success": true,
  "data": {
    "fase": {
      "id_fase_besar": "0865a29f-5838-4590-9c47-d0e638bff7ab",
      "nama_fase": "Pemanenan",
      "umur_mulai": 3,
      "umur_selesai": 25,
      "deskripsi": "Fase pemanenan TBS untuk tanaman menghasilkan (TM)"
    },
    "sub_tindakan": [
      {
        "id_sub_tindakan": "a7cef3fc-bbfa-4485-ab75-15f448aa604f",
        "id_fase_besar": "0865a29f-5838-4590-9c47-d0e638bff7ab",
        "nama_sub": "Panen TBS Rotasi Rutin",
        "deskripsi": "Kegiatan panen TBS sesuai kriteria matang, interval 7-10 hari",
        "jumlah_jadwal": 1
      },
      {
        "id_sub_tindakan": "b8def4a1-1234-5678-9abc-def012345678",
        "nama_sub": "Angkut TBS ke TPH",
        "deskripsi": "Pengangkutan TBS dari lokasi panen ke TPH",
        "jumlah_jadwal": 0
      }
    ],
    "total_sub_tindakan": 4
  }
}
```

**Contoh cURL:**
```bash
curl http://localhost:3000/api/v1/ops/fase/0865a29f-5838-4590-9c47-d0e638bff7ab/sub-tindakan
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Fase not found"
}
```

---

### 3. GET /sub-tindakan/:id/jadwal
**Deskripsi:** Dapatkan jadwal untuk sub-tindakan tertentu

**Path Parameters:**
- `id` (UUID) - ID dari ops_sub_tindakan

**Response:**
```json
{
  "success": true,
  "data": {
    "sub_tindakan": {
      "id_sub_tindakan": "a7cef3fc-bbfa-4485-ab75-15f448aa604f",
      "nama_sub": "Panen TBS Rotasi Rutin",
      "deskripsi": "Kegiatan panen TBS sesuai kriteria matang, interval 7-10 hari",
      "ops_fase_besar": {
        "id_fase_besar": "0865a29f-5838-4590-9c47-d0e638bff7ab",
        "nama_fase": "Pemanenan",
        "umur_mulai": 3,
        "umur_selesai": 25
      }
    },
    "jadwal": [
      {
        "id_jadwal_tindakan": "d9e8f7c6-5432-1098-abcd-ef0123456789",
        "id_sub_tindakan": "a7cef3fc-bbfa-4485-ab75-15f448aa604f",
        "frekuensi": "2x per minggu",
        "interval_hari": 7,
        "jumlah_spk": 4
      }
    ],
    "total_jadwal": 1
  }
}
```

**Contoh cURL:**
```bash
curl http://localhost:3000/api/v1/ops/sub-tindakan/a7cef3fc-bbfa-4485-ab75-15f448aa604f/jadwal
```

---

### 4. POST /spk/create
**Deskripsi:** Buat SPK baru dari jadwal_tindakan

**Request Body:**
```json
{
  "id_jadwal_tindakan": "d9e8f7c6-5432-1098-abcd-ef0123456789",
  "nomor_spk": "SPK/PANEN/2025/005",
  "tanggal_terbit": "2025-11-12",
  "tanggal_mulai": "2025-11-19",
  "tanggal_selesai": "2025-11-26",
  "penanggung_jawab": "Asisten Kebun - Budi Santoso",
  "mandor": "Joko Susilo",
  "lokasi": "Afdeling 1 - Blok A1-A10",
  "uraian_pekerjaan": "Panen TBS rotasi rutin sesuai kriteria matang panen (brondolan 5-10 butir)",
  "catatan": "Pastikan grading sortir di TPH"
}
```

**Field Descriptions:**
- `id_jadwal_tindakan` (UUID, **required**) - FK to ops_jadwal_tindakan
- `nomor_spk` (String, **required**) - Nomor SPK unik
- `tanggal_terbit` (Date, optional) - Default: today
- `tanggal_mulai` (Date, **required**) - Tanggal mulai pekerjaan
- `tanggal_selesai` (Date, **required**) - Tanggal target selesai
- `penanggung_jawab` (String, **required**) - Asisten/Kepala Afdeling
- `mandor` (String, **required**) - Nama mandor pelaksana
- `lokasi` (String, **required**) - Lokasi pekerjaan (Afdeling, Blok)
- `uraian_pekerjaan` (String, **required**) - Deskripsi detail pekerjaan
- `catatan` (String, optional) - Catatan tambahan

**Response (201):**
```json
{
  "success": true,
  "message": "SPK created successfully",
  "data": {
    "spk": {
      "id_spk": "c41e73d2-8427-44d4-ba17-f1ffa954f4db",
      "id_jadwal_tindakan": "d9e8f7c6-5432-1098-abcd-ef0123456789",
      "nomor_spk": "SPK/PANEN/2025/005",
      "tanggal_terbit": "2025-11-12",
      "tanggal_mulai": "2025-11-19",
      "tanggal_selesai": "2025-11-26",
      "status": "PENDING",
      "penanggung_jawab": "Asisten Kebun - Budi Santoso",
      "mandor": "Joko Susilo",
      "lokasi": "Afdeling 1 - Blok A1-A10",
      "uraian_pekerjaan": "Panen TBS rotasi rutin sesuai kriteria matang panen",
      "catatan": "Pastikan grading sortir di TPH",
      "created_at": "2025-11-12T09:15:00.000Z"
    },
    "jadwal": { ... },
    "sub_tindakan": { ... },
    "fase": { ... }
  }
}
```

**Contoh cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/ops/spk/create \
  -H "Content-Type: application/json" \
  -d '{
    "id_jadwal_tindakan": "d9e8f7c6-5432-1098-abcd-ef0123456789",
    "nomor_spk": "SPK/PANEN/2025/005",
    "tanggal_mulai": "2025-11-19",
    "tanggal_selesai": "2025-11-26",
    "penanggung_jawab": "Asisten Kebun - Budi Santoso",
    "mandor": "Joko Susilo",
    "lokasi": "Afdeling 1 - Blok A1-A10",
    "uraian_pekerjaan": "Panen TBS rotasi rutin sesuai kriteria matang panen"
  }'
```

**Contoh PowerShell:**
```powershell
$body = @{
    id_jadwal_tindakan = "d9e8f7c6-5432-1098-abcd-ef0123456789"
    nomor_spk = "SPK/PANEN/2025/005"
    tanggal_mulai = "2025-11-19"
    tanggal_selesai = "2025-11-26"
    penanggung_jawab = "Asisten Kebun - Budi Santoso"
    mandor = "Joko Susilo"
    lokasi = "Afdeling 1 - Blok A1-A10"
    uraian_pekerjaan = "Panen TBS rotasi rutin sesuai kriteria matang panen"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/ops/spk/create" -Method Post -Body $body -ContentType "application/json"
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Jadwal tindakan not found"
}
```

---

### 5. GET /spk
**Deskripsi:** Dapatkan daftar SPK dengan filter dan pagination

**Query Parameters:**
- `status` (String, optional) - Filter by status: PENDING, DIKERJAKAN, SELESAI, DITUNDA
- `id_fase_besar` (UUID, optional) - Filter by lifecycle phase
- `tanggal_mulai` (Date, optional) - Filter SPK >= tanggal_mulai
- `tanggal_selesai` (Date, optional) - Filter SPK <= tanggal_selesai
- `mandor` (String, optional) - Partial match on mandor name
- `lokasi` (String, optional) - Partial match on lokasi
- `page` (Number, optional, default: 1) - Page number
- `limit` (Number, optional, default: 20) - Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id_spk": "c41e73d2-8427-44d4-ba17-f1ffa954f4db",
      "nomor_spk": "SPK/PANEN/2025/005",
      "tanggal_terbit": "2025-11-12",
      "tanggal_mulai": "2025-11-19",
      "tanggal_selesai": "2025-11-26",
      "status": "PENDING",
      "penanggung_jawab": "Asisten Kebun - Budi Santoso",
      "mandor": "Joko Susilo",
      "lokasi": "Afdeling 1 - Blok A1-A10",
      "uraian_pekerjaan": "Panen TBS rotasi rutin sesuai kriteria matang panen",
      "catatan": "Pastikan grading sortir di TPH",
      "ops_jadwal_tindakan": {
        "id_jadwal_tindakan": "d9e8f7c6-5432-1098-abcd-ef0123456789",
        "frekuensi": "2x per minggu",
        "interval_hari": 7,
        "ops_sub_tindakan": {
          "id_sub_tindakan": "a7cef3fc-bbfa-4485-ab75-15f448aa604f",
          "nama_sub": "Panen TBS Rotasi Rutin",
          "ops_fase_besar": {
            "nama_fase": "Pemanenan"
          }
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "total_pages": 1
  },
  "summary": {
    "PENDING": 1,
    "DIKERJAKAN": 0,
    "SELESAI": 11,
    "DITUNDA": 0
  }
}
```

**Contoh cURL:**
```bash
# Get all SPK
curl http://localhost:3000/api/v1/ops/spk

# Filter by status
curl "http://localhost:3000/api/v1/ops/spk?status=PENDING"

# Filter by mandor
curl "http://localhost:3000/api/v1/ops/spk?mandor=Joko"

# Pagination
curl "http://localhost:3000/api/v1/ops/spk?page=1&limit=10"

# Combine filters
curl "http://localhost:3000/api/v1/ops/spk?status=PENDING&mandor=Joko&page=1&limit=20"
```

**Contoh PowerShell:**
```powershell
# Get all SPK
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/ops/spk"

# Filter by status
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/ops/spk?status=PENDING"

# Filter by mandor
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/ops/spk?mandor=Joko"
```

---

### 6. PUT /spk/:id_spk/status
**Deskripsi:** Update status SPK

**Path Parameters:**
- `id_spk` (UUID) - ID dari ops_spk_tindakan

**Request Body:**
```json
{
  "status": "DIKERJAKAN",
  "catatan": "Pekerjaan dimulai, team sudah di lapangan"
}
```

**Field Descriptions:**
- `status` (String, **required**) - New status: PENDING, DIKERJAKAN, SELESAI, DITUNDA
- `catatan` (String, optional) - Catatan tambahan untuk update

**Response:**
```json
{
  "success": true,
  "message": "SPK status updated successfully",
  "data": {
    "previous_status": "PENDING",
    "new_status": "DIKERJAKAN",
    "spk": {
      "id_spk": "c41e73d2-8427-44d4-ba17-f1ffa954f4db",
      "nomor_spk": "SPK/PANEN/2025/005",
      "status": "DIKERJAKAN",
      "catatan": "Pekerjaan dimulai, team sudah di lapangan",
      "updated_at": "2025-11-12T10:30:00.000Z"
    }
  }
}
```

**Contoh cURL:**
```bash
curl -X PUT http://localhost:3000/api/v1/ops/spk/c41e73d2-8427-44d4-ba17-f1ffa954f4db/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "DIKERJAKAN",
    "catatan": "Pekerjaan dimulai, team sudah di lapangan"
  }'
```

**Contoh PowerShell:**
```powershell
$body = @{
    status = "DIKERJAKAN"
    catatan = "Pekerjaan dimulai, team sudah di lapangan"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/v1/ops/spk/c41e73d2-8427-44d4-ba17-f1ffa954f4db/status" -Method Put -Body $body -ContentType "application/json"
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid status. Must be one of: PENDING, DIKERJAKAN, SELESAI, DITUNDA"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "SPK not found"
}
```

---

## Status Workflow

```
PENDING → DIKERJAKAN → SELESAI
    ↓
  DITUNDA → DIKERJAKAN → SELESAI
```

**Status Descriptions:**
- `PENDING` - SPK sudah dibuat, belum dimulai
- `DIKERJAKAN` - SPK sedang dalam pengerjaan
- `SELESAI` - SPK sudah selesai dikerjakan
- `DITUNDA` - SPK ditunda sementara (force majeure, cuaca, dll)

---

## Comparison: ops_spk_tindakan vs spk_header/spk_tugas

### ops_spk_tindakan (Multi-Purpose SPK)
- **Use Case:** Routine operational work (panen, pemupukan, perawatan)
- **Scope:** Location-based (Afdeling, Blok)
- **Structure:** Single document (all info in one table)
- **Assignment:** Mandor-level (no individual tree tracking)
- **Data:** Text fields (uraian_pekerjaan, catatan)
- **Status:** Manual updates (PENDING → DIKERJAKAN → SELESAI)
- **Example:** "Panen TBS Blok A1-A10" (4 SPK documents for weekly harvest)

### spk_header/spk_tugas (Tree-Specific Validation)
- **Use Case:** Tree-specific validation (NDRE stress assessment)
- **Scope:** Individual tree UUIDs
- **Structure:** Split (header + tasks, 1:N relationship)
- **Assignment:** Surveyor-level with UUID FKs
- **Data:** JSONB fields (tree_data with GPS, NDRE values)
- **Status:** Auto-progression when tasks assigned
- **Example:** "Validasi 50 pohon stres berat" (31 SPK headers, 48 tasks)

**Recommendation:** Keep both systems - they serve different purposes and don't overlap.

---

## Testing

### Run Test Suite
```bash
node test-ops-spk-api.js
```

**Test Coverage:**
- ✅ Test 1: GET /fase (5 phases expected)
- ✅ Test 2: GET /fase/:id/sub-tindakan (sub-actions for Pemanenan)
- ✅ Test 3: GET /sub-tindakan/:id/jadwal (schedules for Panen TBS)
- ✅ Test 4: POST /spk/create (create test SPK)
- ✅ Test 5: GET /spk (list with filters: all, status, mandor)
- ✅ Test 6: PUT /spk/:id/status (update PENDING → DIKERJAKAN)

**Test Results:**
```
✅ Passed: 8
❌ Failed: 0
📈 Success Rate: 100.0%
```

---

## Database Schema

### ops_fase_besar
```sql
CREATE TABLE ops_fase_besar (
  id_fase_besar UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_fase VARCHAR(100) NOT NULL,
  umur_mulai INTEGER NOT NULL,
  umur_selesai INTEGER NOT NULL,
  deskripsi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);
```

### ops_sub_tindakan
```sql
CREATE TABLE ops_sub_tindakan (
  id_sub_tindakan UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_fase_besar UUID REFERENCES ops_fase_besar(id_fase_besar),
  nama_sub VARCHAR(200) NOT NULL,
  deskripsi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);
```

### ops_jadwal_tindakan
```sql
CREATE TABLE ops_jadwal_tindakan (
  id_jadwal_tindakan UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_sub_tindakan UUID REFERENCES ops_sub_tindakan(id_sub_tindakan),
  frekuensi VARCHAR(100),
  interval_hari INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);
```

### ops_spk_tindakan
```sql
CREATE TABLE ops_spk_tindakan (
  id_spk UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_jadwal_tindakan UUID REFERENCES ops_jadwal_tindakan(id_jadwal_tindakan),
  nomor_spk VARCHAR(50) UNIQUE NOT NULL,
  tanggal_terbit DATE NOT NULL,
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  penanggung_jawab VARCHAR(200),
  mandor VARCHAR(200),
  lokasi TEXT,
  uraian_pekerjaan TEXT,
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);
```

---

## Error Handling

All endpoints return consistent error responses:

**Format:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Technical error details"
}
```

**HTTP Status Codes:**
- `200` - Success (GET, PUT)
- `201` - Created (POST)
- `400` - Bad Request (invalid data, validation error)
- `404` - Not Found (resource tidak ditemukan)
- `500` - Internal Server Error

---

## Future Enhancements

1. **Authentication & Authorization**
   - JWT token validation
   - Role-based access (Asisten, Mandor, Kepala Afdeling)
   - Row-level security (RLS) per afdeling

2. **Advanced Filtering**
   - Date range filters
   - Multi-status filter (OR condition)
   - Fase hierarchy filter (get SPK across multiple phases)

3. **Reporting**
   - SPK completion rate by mandor
   - Timeline analysis (on-time vs delayed)
   - Workload distribution by afdeling

4. **Notifications**
   - Auto-reminder for overdue SPK
   - Mandor notification when SPK assigned
   - Status change notifications

5. **Audit Trail**
   - Log all status changes with timestamp + user
   - Track SPK modifications (who, when, what changed)

---

## Support

**Files:**
- Service: `services/opsSpkService.js`
- Routes: `routes/opsSpkRoutes.js`
- Tests: `test-ops-spk-api.js`
- Docs: `docs/API_OPS_SPK.md` (this file)

**Related Documentation:**
- SPK Validasi Drone: `docs/API_SPK_VALIDASI_DRONE.md`
- Dashboard KPI: `docs/API_DASHBOARD_KPI_EKSEKUTIF.md`

**Contact:**
- Backend Developer: [Your Name]
- Date Created: 2025-11-12
- Version: 1.0.0
