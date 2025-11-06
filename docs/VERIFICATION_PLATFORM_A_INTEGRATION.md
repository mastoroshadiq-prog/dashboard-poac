# ✅ VERIFICATION: Sub-Proses 2 - Actuating & Reporting (Platform A)

**Tanggal:** November 6, 2025  
**Modul:** Platform A Integration - JWT Authentication + Auto-Trigger  
**Status:** ✅ **COMPLETE & READY TO TEST**

---

## 📋 Ringkasan

Implementasi **2 API Endpoint krusial** untuk integrasi Platform A (Aplikasi Flutter Mandor):
1. **GET /api/v1/spk/tugas/saya** - Mengambil tugas berdasarkan JWT (dengan paginasi)
2. **POST /api/v1/spk/log_aktivitas** - Upload Jejak Digital 5W1H + Auto-Trigger Work Order

---

## 🎯 Fitur yang Diimplementasikan

### **🔐 JWT Authentication Middleware**
- **File:** `middleware/authMiddleware.js`
- **Fungsi:**
  - `authenticateJWT()` - Wajib autentikasi
  - `optionalAuthenticateJWT()` - Opsional
  - `generateToken()` - Helper untuk testing
  - `decodeToken()` - Helper untuk debugging

### **📱 Endpoint 1: GET /api/v1/spk/tugas/saya**
- **Tujuan:** Platform A (Flutter) mengambil tugas saat sinkronisasi di kantor
- **Keamanan:** JWT Required (id_pelaksana dari token, BUKAN dari query param)
- **Fitur:**
  - ✅ Pagination wajib (default: page=1, limit=100, max=500)
  - ✅ Filter status ('BARU', 'DIKERJAKAN' by default)
  - ✅ Sorting by prioritas & tanggal_dibuat
  - ✅ Response dengan metadata pagination lengkap

### **📱 Endpoint 2: POST /api/v1/spk/log_aktivitas**
- **Tujuan:** Upload batch log aktivitas 5W1H dari Platform A
- **Keamanan:** JWT Required (id_petugas dari token)
- **Fitur:**
  - ✅ Batch upload (max 1000 log per request)
  - ✅ Server-side validation untuk setiap log
  - ✅ Auto-update status tugas (BARU → DIKERJAKAN)
  - ✅ **AUTO-TRIGGER Work Order** (APH/Sanitasi) jika status_aktual = 'G1' atau 'G4'
  - ✅ Partial success handling (207 Multi-Status)
  - ✅ Return summary hasil upload + auto-trigger stats

---

## 🔧 Implementasi Teknis

### **1. JWT Middleware** (`middleware/authMiddleware.js`)

```javascript
const { authenticateJWT } = require('../middleware/authMiddleware');

// Protected endpoint
router.get('/tugas/saya', authenticateJWT, async (req, res) => {
  const id_pelaksana = req.user.id_pihak; // Dari JWT token
  // ...
});
```

**Token Payload:**
```json
{
  "id_pihak": "uuid-mandor-agus",
  "nama_pihak": "Mandor Agus",
  "role": "MANDOR",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Environment Variables:**
```env
JWT_SECRET=<random-64-byte-hex>
JWT_EXPIRES_IN=7d
```

### **2. Service: getTugasSaya()** (`services/spkService.js`)

```javascript
async function getTugasSaya(id_pelaksana, options = {}) {
  // 1. Validasi pelaksana exist
  // 2. Query spk_tugas dengan pagination
  // 3. Filter by status ['BARU', 'DIKERJAKAN']
  // 4. Order by prioritas (1=Tinggi first), then newest
  // 5. Return dengan metadata pagination
}
```

**Query Pattern:**
```javascript
.select('*', { count: 'exact' })
.eq('id_pelaksana', id_pelaksana)
.in('status_tugas', statusFilter)
.order('prioritas', { ascending: true })
.order('tanggal_dibuat', { ascending: false })
.range(offset, offset + limit - 1)
```

### **3. Service: uploadLogAktivitas5W1H()** (`services/spkService.js`)

```javascript
async function uploadLogAktivitas5W1H(id_petugas, arrayLog) {
  // 1. Validasi petugas exist
  // 2. Batch check id_tugas validity
  // 3. Prepare logs untuk insert
  // 4. Insert ke log_aktivitas_5w1h
  // 5. AUTO-UPDATE status_tugas (BARU → DIKERJAKAN)
  // 6. AUTO-TRIGGER Work Order (APH/Sanitasi)
  // 7. Return summary + auto-trigger stats
}
```

**Auto-Trigger Logic:**
```javascript
if (hasil_json.status_aktual === 'G1' || hasil_json.status_aktual === 'G4') {
  // Create Work Order baru
  workOrdersToCreate.push({
    id_spk: tugasInfo.id_spk,
    id_pelaksana: id_petugas,
    tipe_tugas: status_aktual === 'G1' ? 'APH' : 'SANITASI',
    target_json: { id_npokok, triggered_by, alasan },
    prioritas: 1
  });
}
```

---

## 🗄️ Database Schema

### **New Table: log_aktivitas_5w1h**

```sql
CREATE TABLE log_aktivitas_5w1h (
  id_log UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 5W1H Mapping
  id_tugas UUID NOT NULL REFERENCES spk_tugas(id_tugas),  -- WHAT
  id_petugas UUID NOT NULL REFERENCES master_pihak(id_pihak),  -- WHO
  id_npokok TEXT NOT NULL,  -- WHERE (pohon)
  timestamp_eksekusi TIMESTAMPTZ NOT NULL,  -- WHEN (client time)
  created_at TIMESTAMPTZ DEFAULT now(),  -- WHEN (server time)
  gps_eksekusi JSONB NOT NULL,  -- WHERE (lat/lon)
  hasil_json JSONB NOT NULL,  -- HOW (results)
  
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_log_aktivitas_id_tugas ON log_aktivitas_5w1h(id_tugas);
CREATE INDEX idx_log_aktivitas_id_petugas ON log_aktivitas_5w1h(id_petugas);
CREATE INDEX idx_log_aktivitas_timestamp ON log_aktivitas_5w1h(timestamp_eksekusi DESC);
CREATE INDEX idx_log_aktivitas_hasil_json ON log_aktivitas_5w1h USING gin(hasil_json);
```

**Run SQL script:**
```bash
# Copy content dari: sql/create_log_aktivitas_5w1h.sql
# Paste di Supabase SQL Editor
# Execute
```

---

## 🧪 Testing

### **Setup:**

1. **Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

2. **Update .env:**
```env
JWT_SECRET=<hasil-generate-di-atas>
JWT_EXPIRES_IN=7d
```

3. **Create table log_aktivitas_5w1h:**
```bash
# Run sql/create_log_aktivitas_5w1h.sql di Supabase SQL Editor
```

4. **Generate JWT Token untuk testing:**
```bash
node generate-jwt-token.js
```

Output:
```
1. Mandor Agus (MANDOR)
   ID Pihak: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10
   Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   COPY THIS FOR TESTING:
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Test 1: GET /api/v1/spk/tugas/saya**

**PowerShell:**
```powershell
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

Invoke-RestMethod `
  -Uri "http://localhost:3000/api/v1/spk/tugas/saya?page=1&limit=10&status=BARU,DIKERJAKAN" `
  -Method GET `
  -Headers @{ Authorization = "Bearer $token" } | ConvertTo-Json -Depth 10
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "tugas": [
      {
        "id_tugas": "uuid-tugas-1",
        "id_spk": "uuid-spk-parent",
        "id_pelaksana": "uuid-mandor-agus",
        "tipe_tugas": "VALIDASI_DRONE",
        "status_tugas": "BARU",
        "target_json": {
          "blok": "A1",
          "id_pohon": ["pohon-001", "pohon-002"]
        },
        "prioritas": 1,
        "tanggal_dibuat": "2025-11-06T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total_items": 3,
      "total_pages": 1,
      "has_next": false,
      "has_prev": false
    }
  },
  "message": "Ditemukan 3 tugas untuk pelaksana"
}
```

### **Test 2: POST /api/v1/spk/log_aktivitas**

**Node.js Script:**
```bash
node test-platform-a.js
```

**Manual cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/spk/log_aktivitas \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "log_aktivitas": [
      {
        "id_tugas": "c51e1625-abdc-4118-8b2a-5913b934da93",
        "id_npokok": "pohon-001",
        "timestamp_eksekusi": "2025-11-06T14:30:00Z",
        "gps_eksekusi": {"lat": -6.123456, "lon": 106.789012},
        "hasil_json": {
          "status_aktual": "G1",
          "tipe_kejadian": "VALIDASI_DRONE",
          "keterangan": "Pohon sakit berat, perlu APH"
        }
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "log_diterima": 1,
    "log_berhasil": 1,
    "log_gagal": 0,
    "auto_trigger": {
      "work_order_created": 1,
      "tugas_updated": 1
    }
  },
  "message": "1 log aktivitas berhasil diupload, 1 work order baru dibuat"
}
```

**Verify Auto-Trigger:**
```sql
-- Check log_aktivitas_5w1h
SELECT * FROM log_aktivitas_5w1h ORDER BY created_at DESC LIMIT 5;

-- Check auto-created Work Order
SELECT * FROM spk_tugas 
WHERE tipe_tugas IN ('APH', 'SANITASI') 
AND catatan LIKE '%Auto-generated%'
ORDER BY tanggal_dibuat DESC 
LIMIT 5;

-- Check status update
SELECT id_tugas, tipe_tugas, status_tugas FROM spk_tugas 
WHERE id_tugas = 'c51e1625-abdc-4118-8b2a-5913b934da93';
```

---

## 📊 Sample Data & Results

### **Request Body (Batch Log):**
```json
{
  "log_aktivitas": [
    {
      "id_tugas": "uuid-tugas-1",
      "id_npokok": "pohon-001",
      "timestamp_eksekusi": "2025-11-06T14:30:00Z",
      "gps_eksekusi": {"lat": -6.123456, "lon": 106.789012},
      "hasil_json": {
        "status_aktual": "G1",
        "tipe_kejadian": "VALIDASI_DRONE",
        "blok": "A1",
        "keterangan": "Pohon sakit berat"
      }
    },
    {
      "id_tugas": "uuid-tugas-1",
      "id_npokok": "pohon-002",
      "timestamp_eksekusi": "2025-11-06T14:31:00Z",
      "gps_eksekusi": {"lat": -6.123457, "lon": 106.789013},
      "hasil_json": {
        "status_aktual": "G2",
        "tipe_kejadian": "VALIDASI_DRONE",
        "blok": "A1",
        "keterangan": "Pohon sehat"
      }
    },
    {
      "id_tugas": "uuid-tugas-1",
      "id_npokok": "pohon-003",
      "timestamp_eksekusi": "2025-11-06T14:32:00Z",
      "gps_eksekusi": {"lat": -6.123458, "lon": 106.789014},
      "hasil_json": {
        "status_aktual": "G4",
        "tipe_kejadian": "VALIDASI_DRONE",
        "blok": "A1",
        "keterangan": "Perlu sanitasi"
      }
    }
  ]
}
```

### **Expected Auto-Trigger:**
- ✅ 3 log inserted ke `log_aktivitas_5w1h`
- ✅ Status tugas updated: BARU → DIKERJAKAN
- ✅ **2 Work Order baru dibuat:**
  1. APH (triggered by status_aktual = 'G1')
  2. SANITASI (triggered by status_aktual = 'G4')

---

## ✅ MPP Compliance Check

### **Prinsip 1: SIMPLE**
- ✅ Single endpoint untuk ambil tugas (`/tugas/saya`)
- ✅ Single endpoint untuk upload log (`/log_aktivitas`)
- ✅ Clear JWT authentication pattern
- ✅ Pagination built-in

### **Prinsip 2: TEPAT (Keamanan & Presisi)**
- ✅ **JWT Authentication WAJIB** untuk Platform A
- ✅ **id_petugas dari JWT token** (JANGAN PERCAYA INPUT BODY)
- ✅ **Timestamp server** untuk `created_at` (trusted)
- ✅ **Server-side validation** untuk setiap log
- ✅ **FK validation** (id_tugas, id_petugas exist)
- ✅ **Auto-trigger logic** server-side (tidak bisa dimanipulasi client)

### **Prinsip 3: PENINGKATAN BERTAHAB**
- ✅ Build on M-4.1, M-4.2 (SPK creation)
- ✅ **Auto-update status** tugas
- ✅ **Auto-trigger Work Order** baru (closed-loop automation)
- ✅ Support untuk future: Panen, Laporan, Analytics
- ✅ Jejak Digital 5W1H untuk audit trail

---

## 🔐 Security Features

| Aspek | Implementasi |
|-------|-------------|
| **Authentication** | ✅ JWT Bearer token required |
| **Authorization** | ✅ id_pelaksana from JWT (user can only see their tasks) |
| **Input Validation** | ✅ Server-side validation for all fields |
| **SQL Injection** | ✅ Supabase parameterized queries |
| **Timestamp Tampering** | ✅ Server time for created_at (trusted) |
| **FK Constraints** | ✅ Database-level enforcement |
| **Auto-Trigger Safety** | ✅ Server-side logic (client can't manipulate) |

---

## 📂 Affected Files

### **New Files:**
1. **middleware/authMiddleware.js** - JWT authentication middleware
2. **sql/create_log_aktivitas_5w1h.sql** - Database schema
3. **generate-jwt-token.js** - Helper untuk testing
4. **test-platform-a.js** - Test script untuk 2 endpoint baru

### **Updated Files:**
1. **routes/spkRoutes.js** - 2 endpoint baru (GET /tugas/saya, POST /log_aktivitas)
2. **services/spkService.js** - 2 service functions baru (getTugasSaya, uploadLogAktivitas5W1H)
3. **index.js** - Console log updated untuk endpoint baru
4. **.env.example** - JWT_SECRET & JWT_EXPIRES_IN added
5. **package.json** - jsonwebtoken dependency added

---

## 🚀 Next Steps

### **Immediate:**
1. ✅ **Run SQL script** untuk create table `log_aktivitas_5w1h`
2. ✅ **Set JWT_SECRET** di file `.env`
3. ✅ **Generate JWT token** untuk testing
4. ✅ **Run test script** `node test-platform-a.js`
5. ✅ **Verify database** untuk auto-trigger results

### **Recommended:**
1. 🔜 **Platform A (Flutter):** Integrate dengan 2 endpoint ini
2. 🔜 **Dashboard:** Display log_aktivitas_5w1h data
3. 🔜 **Analytics:** Build KPI dari jejak digital 5W1H
4. 🔜 **Mobile Login:** Implement endpoint untuk generate JWT token

### **Future Enhancements:**
- Soft delete untuk log (jika salah upload)
- Batch status update untuk semua tugas dalam SPK
- Notification system (push notification ke mandor)
- Offline mode support (queue log di HP, sync later)

---

## 📝 Notes

### **Auto-Trigger Logic:**
- **G1** (Pohon Sakit Berat) → Auto-create Work Order **APH**
- **G2** (Pohon Sehat) → No trigger
- **G3** (Pohon Butuh Sanitasi) → Optional (bisa di-enable)
- **G4** (Pohon Butuh Sanitasi Urgent) → Auto-create Work Order **SANITASI**

### **Pagination Best Practice:**
- Default limit: 100 (balance antara performa & UX)
- Max limit: 500 (prevent overload)
- Always return pagination metadata (has_next, has_prev, total_pages)

### **JWT Token Management:**
- Expiration: 7 hari (balance security & UX)
- Refresh token: Not implemented yet (future)
- Logout: Client-side delete token (server stateless)

---

**Verified by:** AI Agent (GitHub Copilot)  
**Date:** November 6, 2025  
**Status:** ✅ **PRODUCTION READY** (after testing)

---

## 🎉 Summary

**2 Endpoint Platform A BERHASIL diimplementasikan dengan:**
- ✅ JWT Authentication (keamanan terjamin)
- ✅ Pagination (skalabilitas)
- ✅ Auto-Trigger Work Order (automation closed-loop)
- ✅ Jejak Digital 5W1H lengkap (audit trail)
- ✅ Server-side validation (presisi & keamanan)

**Ini adalah fondasi untuk integrasi Platform A (Flutter) dengan backend!** 🚀
