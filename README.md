# 🌴 Dashboard POAC - Backend API

**Backend API untuk Platform Operasional Kebun Kelapa Sawit**  
Sistem terintegrasi untuk manajemen SPK (Surat Perintah Kerja), dashboard KPI, dan monitoring operasional berbasis framework **POAC** (Planning, Organizing, Actuating, Controlling).

---

## 📋 Deskripsi Project

Platform **Dashboard POAC** adalah sistem backend yang dibangun menggunakan **Master Priming Prompt (MPP)** dengan prinsip **3P**:
- ✅ **SIMPLE** - Arsitektur sederhana dan mudah dipahami
- ✅ **TEPAT** - Validasi ketat dan keamanan data terjamin
- ✅ **PENINGKATAN BERTAHAB** - Development iteratif dan terukur

### **Tech Stack:**
- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Database:** Supabase (PostgreSQL + PostGIS)
- **Authentication:** Supabase Auth (planned)
- **Validation:** Server-side dengan FK constraints

---

## 🚀 Quick Start

### **1. Prerequisites**
```bash
node --version  # v18 or higher
npm --version   # v9 or higher
```

### **2. Installation**

```bash
# Clone repository
git clone https://github.com/mastoroshadiq-prog/dashboard-poac.git
cd dashboard-poac

# Install dependencies
npm install
```

### **3. Environment Setup**

Create `.env` file in root directory:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration (Platform A)
JWT_SECRET=your-128-char-hex-secret-here
JWT_EXPIRES_IN=7d
```

> **⚠️ IMPORTANT:** 
> - Never commit `.env` file! Use `.env.example` as template.
> - Generate JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### **4. Database Setup**

Run database migration scripts in Supabase SQL Editor:

```bash
# 1. Create tables (run in Supabase dashboard)
sql/dummy_data_v1_2.sql

# 2. Verify structure
node check-table-structure.js

# 3. Test connection
node debug-supabase.js
```

### **5. Run Server**

```bash
# Development mode
node index.js

# Expected output:
# 🚀 Server running on http://localhost:3000
# 📊 Dashboard endpoints: /api/v1/dashboard/*
# 📝 SPK endpoints: /api/v1/spk/*
```

---

## 📡 API Endpoints

### **Base URL:** `http://localhost:3000/api/v1`

### **Dashboard KPI (READ/OUTPUT)** 🔐 ✅

| Endpoint | Method | Auth | Roles | Description | Status |
|----------|--------|------|-------|-------------|--------|
| `/dashboard/kpi-eksekutif` | GET | JWT | ASISTEN, ADMIN | KPI Eksekutif (HPH, Produktivitas, Kualitas) | ✅ M-1.1 🔐 |
| `/dashboard/operasional` | GET | JWT | MANDOR, ASISTEN, ADMIN | Dashboard Operasional (SPK, Tugas, Progres) | ✅ M-1.2 🔐 |
| `/dashboard/teknis` | GET | JWT | MANDOR, ASISTEN, ADMIN | Dashboard Teknis (Peta, Target, Realisasi) | ✅ M-1.3 🔐 |

**🔐 RBAC FASE 2 (NEW!):**
- **Authentication:** JWT Required (Bearer token in Authorization header)
- **Authorization:** Role-based access control enforced
- **Dashboard KPI Eksekutif:** Only ASISTEN and ADMIN (executive level)
- **Dashboard Operasional & Teknis:** MANDOR, ASISTEN, ADMIN (operational + executive)

**⚠️ BREAKING CHANGES (Nov 7, 2025):**
- All Dashboard endpoints now require JWT authentication
- PELAKSANA role cannot access any Dashboard (403 Forbidden)
- Unauthorized requests return 401, forbidden requests return 403

**Example:**
```bash
# PowerShell - Dashboard (NOW REQUIRES JWT)
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # ASISTEN or ADMIN token
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/dashboard/kpi-eksekutif" `
  -Headers @{Authorization="Bearer $token"} | ConvertTo-Json -Depth 10

# PowerShell - Platform A (with JWT)
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/spk/tugas/saya" `
  -Headers @{Authorization="Bearer $token"} | ConvertTo-Json -Depth 5

# cURL - Dashboard (NOW REQUIRES JWT)
curl -X GET http://localhost:3000/api/v1/dashboard/kpi-eksekutif \
  -H "Authorization: Bearer <your-jwt-token>"

# cURL - Platform A
curl -X GET http://localhost:3000/api/v1/spk/tugas/saya \
  -H "Authorization: Bearer <your-jwt-token>"
```

### **SPK Management - Platform B (WRITE/INPUT)** 🔐 ✅

| Endpoint | Method | Auth | Roles | Description | Status |
|----------|--------|------|-------|-------------|--------|
| `/spk/` | POST | JWT | ASISTEN, ADMIN | Create SPK Header | ✅ M-4.1 🔐 |
| `/spk/:id_spk/tugas` | POST | JWT | ASISTEN, MANDOR, ADMIN | Add Batch Tugas to SPK | ✅ M-4.2 🔐 |
| `/spk/:id_spk` | PUT | JWT | ASISTEN, ADMIN | Update SPK Header | 🔜 M-4.3 |
| `/spk/:id_spk/tugas/:id_tugas` | PUT | JWT | ASISTEN, MANDOR, ADMIN | Update Tugas Status | 🔜 M-4.4 |

**🔐 RBAC FASE 1 (NEW!):**
- **Authentication:** JWT Required (Bearer token in Authorization header)
- **Authorization:** Role-based access control enforced
- **Identity Protection:** `id_asisten_pembuat` auto-extracted from JWT token
- **Security Logging:** Failed authorization attempts logged for audit trail

**⚠️ BREAKING CHANGES (Nov 7, 2025):**
- All Platform B endpoints now require JWT authentication
- `id_asisten_pembuat` no longer accepted in request body (forced from JWT)
- Unauthorized requests return 401, forbidden requests return 403

### **Platform A - Mobile Field Workers** 🔐 ✅

| Endpoint | Method | Auth | Roles | Description | Status |
|----------|--------|------|-------|-------------|--------|
| `/spk/tugas/saya` | GET | JWT | PELAKSANA, MANDOR, ADMIN | Get My Assigned Tasks (paginated) | ✅ NEW! 🔐 |
| `/spk/log_aktivitas` | POST | JWT | PELAKSANA, MANDOR, ADMIN | Upload 5W1H Activity Log (batch + auto-trigger) | ✅ NEW! 🔐 |

**Features:**
- 🔐 **JWT Authentication** - Secure token-based auth for mobile workers
- 🔐 **RBAC Authorization** - Role-based access control (PELAKSANA, MANDOR, ADMIN)
- 📱 **Pagination** - Efficient data loading (default 100, max 500 items)
- 📊 **5W1H Digital Trail** - Complete activity logging (Who, What, When, Where, Why, How)
- 🔧 **Auto-Trigger Work Orders** - Automatic APH/SANITASI tasks on G1/G4 status
- ✅ **Status Auto-Update** - BARU → DIKERJAKAN on first log upload

---

## 📝 API Documentation

### **M-4.1: Create SPK Header**

**Endpoint:** `POST /api/v1/spk/`

🔐 **Authentication Required:** JWT Bearer Token  
🛡️ **Authorized Roles:** `ASISTEN`, `ADMIN`

**Request Headers:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "nama_spk": "SPK Validasi Drone Blok A1",
  "tanggal_mulai": "2024-01-15",
  "tanggal_selesai": "2024-01-20",
  "keterangan": "Validasi drone untuk blok A1-A5"
}
```

⚠️ **BREAKING CHANGE (Nov 7, 2025):**  
- `id_asisten_pembuat` is now **AUTO-EXTRACTED from JWT token** (`req.user.id_pihak`)
- Do NOT include `id_asisten_pembuat` in request body (will be ignored)
- This prevents identity spoofing attacks

**Response:**
```json
{
  "success": true,
  "message": "SPK berhasil dibuat",
  "data": {
    "id_spk": "uuid-generated",
    "nama_spk": "SPK Validasi Drone Blok A1",
    "id_asisten_pembuat": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10",
    "status_spk": "BARU",
    "created_at": "2024-01-15T10:00:00Z",
    ...
  }
}
```

**Validation:**
- ✅ JWT authentication (`401` if missing/invalid token)
- ✅ Role authorization (`403` if not ASISTEN/ADMIN)
- ✅ Server-side FK validation (`id_asisten_pembuat` → `master_pihak`)
- ✅ Date format validation (YYYY-MM-DD)
- ✅ Required fields check (`nama_spk` only)
- ✅ Auto-generate UUID for `id_spk`
- ✅ Default status: `BARU`

**Test Script:**
```bash
# PowerShell
.\test-post-spk.ps1

# Node.js
node test-spk-create.js
```

📄 **Verification:** `docs/VERIFICATION_M4.1_CREATE_SPK_HEADER.md`

---

### **M-4.2: Add Batch Tugas to SPK**

**Endpoint:** `POST /api/v1/spk/:id_spk/tugas`

🔐 **Authentication Required:** JWT Bearer Token  
🛡️ **Authorized Roles:** `ASISTEN`, `MANDOR`, `ADMIN`

**Request Headers:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body:**
```json
{
  "tugas": [
    {
      "id_pelaksana": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10",
      "tipe_tugas": "VALIDASI_DRONE",
      "target_json": {
        "blok": "A1",
        "id_pohon": ["pohon-001", "pohon-002", "pohon-003"]
      },
      "prioritas": 1,
      "catatan": "Validasi kondisi pohon"
    },
    {
      "id_pelaksana": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "tipe_tugas": "APH",
      "target_json": {
        "blok": "B1",
        "id_pohon": ["pohon-004"]
      },
      "prioritas": 2
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tugas berhasil ditambahkan ke SPK",
  "data": {
    "id_spk": "uuid-spk",
    "jumlah_tugas_ditambahkan": 2,
    "tugas_created": [
      {
        "id_tugas": "uuid-generated-1",
        "status_tugas": "BARU",
        "tipe_tugas": "VALIDASI_DRONE",
        ...
      },
      ...
    ]
  }
}
```

**Validation:**
- ✅ JWT authentication (`401` if missing/invalid token)
- ✅ Role authorization (`403` if not ASISTEN/MANDOR/ADMIN)
- ✅ SPK existence check (`id_spk` → `spk_header`)
- ✅ Pelaksana FK validation (`id_pelaksana` → `master_pihak`)
- ✅ Tipe tugas enum validation (`VALIDASI_DRONE`, `APH`, `PANEN`, `LAINNYA`)
- ✅ Target JSON structure validation
- ✅ Batch insert (atomic transaction)
- ✅ Default status: `BARU`

**Test Script:**
```bash
# PowerShell (API test)
.\test-add-tugas-api.ps1

# Node.js (Service test)
node test-add-tugas.js
```

📄 **Verification:** `docs/VERIFICATION_M4.2_ADD_TUGAS_SPK.md`

---

### **Platform A: Get My Tasks (Mobile Workers)**

**Endpoint:** `GET /api/v1/spk/tugas/saya` 🔐

**Authentication:** JWT Required (Bearer Token)

**Query Parameters:**
```
?page=1              # Page number (default: 1)
&limit=100           # Items per page (default: 100, max: 500)
&status=BARU,DIKERJAKAN  # Filter by status (default: BARU,DIKERJAKAN)
```

**Request Headers:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tugas": [
      {
        "id_tugas": "c2ffbc99-9c0b-4ef8-bb6d-6bb9bd380c01",
        "id_spk": "d3ffbc99-9c0b-4ef8-bb6d-6bb9bd380d01",
        "id_pelaksana": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10",
        "tipe_tugas": "INSPEKSI",
        "status_tugas": "BARU",
        "target_json": {
          "target_npokok": ["b1ffbc99-...", "b1ffbc99-..."],
          "deadline": "2025-11-10"
        },
        "prioritas": 1
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 100,
      "total_items": 3,
      "total_pages": 1,
      "has_next": false,
      "has_prev": false
    }
  },
  "message": "Ditemukan 3 tugas untuk pelaksana"
}
```

**Validation:**
- ✅ JWT token validation (signature, expiration)
- ✅ Extract `id_pelaksana` from token payload
- ✅ Validate pelaksana exists in `master_pihak`
- ✅ Pagination bounds (max 500 items)
- ✅ Order by: prioritas ASC

**Token Generation:**
```bash
# Generate test token
node generate-token-only.js

# Copy token and test
$token = "eyJhbG..."
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/spk/tugas/saya" `
  -Headers @{Authorization="Bearer $token"}
```

📄 **Full Documentation:** `docs/VERIFICATION_PLATFORM_A_INTEGRATION.md`

---

### **Platform A: Upload Activity Log (5W1H)**

**Endpoint:** `POST /api/v1/spk/log_aktivitas` 🔐

**Authentication:** JWT Required (Bearer Token)

**Request Body:**
```json
{
  "log_aktivitas": [
    {
      "id_tugas": "c2ffbc99-9c0b-4ef8-bb6d-6bb9bd380c01",
      "id_npokok": "b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380b01",
      "timestamp_eksekusi": "2025-11-06T14:30:00",
      "gps_eksekusi": {
        "lat": -6.2088,
        "lon": 106.8456
      },
      "hasil_json": {
        "status_aktual": "G1",
        "kondisi": "Baik",
        "catatan": "Pohon sehat, perlu APH"
      }
    }
  ]
}
```

**Response:**
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
  "message": "1 log aktivitas berhasil diupload"
}
```

**5W1H Digital Trail:**
- **WHO:** `id_petugas` (extracted from JWT token)
- **WHAT:** `id_tugas` (task being executed)
- **WHEN:** `timestamp_eksekusi` (execution time)
- **WHERE:** `id_npokok` + `gps_eksekusi` (location)
- **WHY:** Implicit in task assignment
- **HOW:** `hasil_json` (execution results)

**Auto-Trigger Logic:**
- 🔧 **G1 Status** → Auto-create **APH** Work Order
- 🔧 **G4 Status** → Auto-create **SANITASI** Work Order
- ✅ **First Log** → Auto-update task status: `BARU` → `DIKERJAKAN`

**Validation:**
- ✅ JWT token validation
- ✅ Batch size limit (max 1000 logs)
- ✅ FK validation: `id_tugas` exists in `spk_tugas`
- ✅ FK validation: `id_npokok` exists in `kebun_n_pokok` (optional)
- ✅ GPS format validation (lat/lon)
- ✅ Timestamp format validation (ISO 8601)

**Test Script:**
```bash
# Automated test (server + token + HTTP requests)
node test-full-auto.js

# Expected output:
# ✅ GET /tugas/saya: 200 OK (3 tasks)
# ✅ POST /log_aktivitas: 201 Created (1 log, 1 auto-trigger)
```

📄 **Verification:** `docs/VERIFICATION_PLATFORM_A_INTEGRATION.md`

---

## � Security & RBAC

### **Authentication**
- **JWT Bearer Token** required for all Platform A and Platform B endpoints
- Token expires in **7 days** (configurable via `JWT_EXPIRES_IN`)
- Secret stored in environment variable `JWT_SECRET`

### **Role-Based Access Control (RBAC)**

**Role Hierarchy:**
```
ADMIN         → Full access to all endpoints
  ↓
ASISTEN       → Create/update SPK, assign tasks (Estate Manager)
  ↓
MANDOR        → Assign tasks to subordinates, upload logs (Field Supervisor)
  ↓
PELAKSANA     → Execute tasks, upload own logs (Field Worker)
  ↓
VIEWER        → Read-only access (future implementation)
```

**Permission Matrix:**

| Endpoint | Method | Allowed Roles | Description |
|----------|--------|---------------|-------------|
| **Dashboard Endpoints (RBAC FASE 2)** | | | |
| `/api/v1/dashboard/kpi-eksekutif` | GET | `ASISTEN`, `ADMIN` | View Executive KPI Dashboard |
| `/api/v1/dashboard/operasional` | GET | `MANDOR`, `ASISTEN`, `ADMIN` | View Operational Dashboard |
| `/api/v1/dashboard/teknis` | GET | `MANDOR`, `ASISTEN`, `ADMIN` | View Technical Dashboard |
| **SPK Management (RBAC FASE 1)** | | | |
| `/api/v1/spk/` | POST | `ASISTEN`, `ADMIN` | Create SPK Header |
| `/api/v1/spk/:id/tugas` | POST | `ASISTEN`, `MANDOR`, `ADMIN` | Add Tasks to SPK |
| **Platform A - Mobile Workers (RBAC FASE 1)** | | | |
| `/api/v1/spk/tugas/saya` | GET | `PELAKSANA`, `MANDOR`, `ADMIN` | Get My Tasks |
| `/api/v1/spk/log_aktivitas` | POST | `PELAKSANA`, `MANDOR`, `ADMIN` | Upload Activity Log |

**Security Features:**
- ✅ **Identity Protection:** `id_asisten_pembuat` auto-extracted from JWT (prevents spoofing)
- ✅ **Authorization Enforcement:** Role checked on every request via `authorizeRole()` middleware
- ✅ **Audit Trail:** Failed authorization attempts logged with user details, endpoint, IP, timestamp
- ✅ **Case-Insensitive Roles:** Normalized to uppercase for consistency
- ✅ **Error Responses:** `401 Unauthorized` (no/invalid token), `403 Forbidden` (wrong role)

**Implementation Files:**
- `middleware/authMiddleware.js` - JWT authentication + RBAC authorization
- `routes/spkRoutes.js` - Protected endpoints with role checks
- `test-rbac-fase1.js` - Comprehensive RBAC test suite (7 scenarios)

📄 **RBAC Analysis:** `docs/ANALISIS_RBAC.md`

---

## �🗄️ Database Schema

### **Core Tables:**

```
spk_header
├── id_spk (PK, UUID)
├── nama_spk (TEXT)
├── id_asisten_pembuat (FK → master_pihak)
├── status_spk (ENUM: BARU, AKTIF, SELESAI, DIBATALKAN)
├── tanggal_mulai (DATE)
├── tanggal_selesai (DATE)
└── created_at (TIMESTAMP)

spk_tugas
├── id_tugas (PK, UUID)
├── id_spk (FK → spk_header)
├── id_pelaksana (FK → master_pihak)
├── tipe_tugas (ENUM: VALIDASI_DRONE, APH, PANEN, SANITASI, INSPEKSI, PEMUPUKAN, LAINNYA)
├── status_tugas (ENUM: BARU, DIKERJAKAN, SELESAI, DITOLAK)
├── target_json (JSONB)
├── prioritas (INTEGER)
└── created_at (TIMESTAMP)

log_aktivitas_5w1h (Platform A)
├── id_log (PK, UUID)
├── id_tugas (FK → spk_tugas)
├── id_petugas (FK → master_pihak)
├── id_npokok (UUID, optional FK → kebun_n_pokok)
├── timestamp_eksekusi (TIMESTAMP)
├── gps_eksekusi (JSONB: {lat, lon})
├── hasil_json (JSONB)
└── created_at (TIMESTAMP)

master_pihak
├── id_pihak (PK, UUID)
├── nama (TEXT)
├── tipe (TEXT: PELAKSANA, ASISTEN, MANDOR, etc.)
├── kode_unik (TEXT)
└── created_at (TIMESTAMP)

kebun_n_pokok
├── id_npokok (PK, UUID)
├── id_tanaman (TEXT)
├── n_baris (INTEGER)
├── n_pokok (INTEGER)
├── kode (TEXT)
└── created_at (TIMESTAMP)
```

**Relationships:**
- `spk_header.id_asisten_pembuat` → `master_pihak.id_pihak`
- `spk_tugas.id_spk` → `spk_header.id_spk`
- `spk_tugas.id_pelaksana` → `master_pihak.id_pihak`
- `log_aktivitas_5w1h.id_tugas` → `spk_tugas.id_tugas` (Platform A)
- `log_aktivitas_5w1h.id_petugas` → `master_pihak.id_pihak` (Platform A)
- `log_aktivitas_5w1h.id_npokok` → `kebun_n_pokok.id_npokok` (optional)

---

## 🧪 Testing

### **RBAC Manual Testing (PowerShell)**

```powershell
# 1. Generate tokens for different roles
node generate-token-only.js
# Select role when prompted: ADMIN, ASISTEN, MANDOR, PELAKSANA, VIEWER

# 2. Test 401 Unauthorized (no token)
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/spk/" -Method POST `
  -ContentType "application/json" `
  -Body '{"nama_spk":"Test SPK"}'
# Expected: 401 "Access denied. No token provided"

# 3. Test 403 Forbidden (wrong role)
$pelaksanaToken = "eyJhbG..." # PELAKSANA token
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/spk/" -Method POST `
  -Headers @{Authorization="Bearer $pelaksanaToken"} `
  -ContentType "application/json" `
  -Body '{"nama_spk":"Test SPK"}'
# Expected: 403 "Access denied. Requires role: ASISTEN, ADMIN"

# 4. Test 200/201 Success (correct role)
$asistenToken = "eyJhbG..." # ASISTEN token
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/spk/" -Method POST `
  -Headers @{Authorization="Bearer $asistenToken"} `
  -ContentType "application/json" `
  -Body '{"nama_spk":"Test SPK Valid"}'
# Expected: 201 "SPK berhasil dibuat"

# 5. Test identity protection (id_asisten_pembuat auto from JWT)
# Note: id_asisten_pembuat in request body will be IGNORED
$bodyWithId = @{
  nama_spk = "Test SPK"
  id_asisten_pembuat = "00000000-0000-0000-0000-000000000000" # Wrong ID
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/spk/" -Method POST `
  -Headers @{Authorization="Bearer $asistenToken"} `
  -ContentType "application/json" `
  -Body $bodyWithId
# Expected: 201 with id_asisten_pembuat = token's id_pihak (NOT from body)
```

**Test Scenarios Coverage:**
- ✅ Test 1: No token → `401 Unauthorized`
- ✅ Test 2: Invalid token → `401 Unauthorized`  
- ✅ Test 3: Wrong role → `403 Forbidden`
- ✅ Test 4: Correct role → `200/201 Success`
- ✅ Test 5: Identity spoofing → Prevented (JWT override)
- ✅ Test 6: Multi-role endpoint → All allowed roles succeed
- ✅ Test 7: Admin bypass → ADMIN can access all endpoints

📄 **Full Test Suite:** `test-rbac-fase1.js` (automated tests)

---

### **Manual Testing (PowerShell)**

```bash
# Test Dashboard KPI
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/dashboard/kpi-eksekutif" -Method GET

# Test Create SPK (Platform B) - REQUIRES JWT NOW
$token = "eyJhbG..." # ASISTEN or ADMIN token
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/spk/" -Method POST `
  -Headers @{Authorization="Bearer $token"} `
  -ContentType "application/json" `
  -Body '{"nama_spk":"Test SPK"}'

# Test Add Tugas (Platform B) - REQUIRES JWT NOW
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/spk/{id_spk}/tugas" -Method POST `
  -Headers @{Authorization="Bearer $token"} `
  -ContentType "application/json" `
  -Body '{"tugas":[...]}'

# Test Platform A - Get Tasks
node generate-token-only.js  # Copy PELAKSANA/MANDOR/ADMIN token
$token = "eyJhbG..."
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/spk/tugas/saya" `
  -Headers @{Authorization="Bearer $token"}

# Test Platform A - Upload Log
# (Use PowerShell command from generate-token-only.js output)
```

### **Automated Testing (Node.js)**

```bash
# Test connection
node debug-supabase.js

# Test Platform B
node test-spk-create.js      # M-4.1
node test-add-tugas.js       # M-4.2

# Test Platform A (Full Auto)
node test-full-auto.js       # JWT + GET + POST endpoints

# Test dashboard endpoints
node test-teknis.js
```

### **Database Verification**

```bash
# Check table structure
node check-table-structure.js

# Run SQL queries
# Use sql/verify_data.sql in Supabase dashboard
```

---

## 📂 Project Structure

```
dashboard-poac/
├── config/
│   └── supabase.js               # Supabase client configuration
├── context/
│   ├── master_priming_prompt.md
│   ├── optimalisasi_skema_db_v1.1.md
│   └── panduan_platform_b.md
├── docs/
│   ├── VERIFICATION_M4.1_CREATE_SPK_HEADER.md
│   ├── VERIFICATION_M4.2_ADD_TUGAS_SPK.md
│   ├── VERIFICATION_PLATFORM_A_INTEGRATION.md  # 🆕 Platform A
│   ├── TESTING_GUIDE.md
│   └── TROUBLESHOOTING.md
├── middleware/
│   └── authMiddleware.js         # 🆕 JWT authentication
├── routes/
│   ├── dashboardRoutes.js        # Dashboard endpoints (M-1.x)
│   └── spkRoutes.js              # SPK + Platform A endpoints (M-4.x)
├── services/
│   ├── dashboardService.js       # Dashboard business logic
│   ├── operasionalService.js     # Operational data aggregation
│   ├── teknisService.js          # Technical data processing
│   └── spkService.js             # SPK + Platform A business logic
├── sql/
│   ├── dummy_data_v1_2.sql       # Database schema & initial data
│   ├── test_data_platform_a.sql  # 🆕 Platform A test data
│   ├── create_log_aktivitas_5w1h.sql      # 🆕 5W1H schema (with FK)
│   ├── create_log_aktivitas_5w1h_simple.sql  # 🆕 5W1H schema (simplified)
│   └── verify_data.sql           # Data verification queries
├── generate-token-only.js        # 🆕 JWT token generator
├── test-full-auto.js             # 🆕 Automated Platform A testing
├── .env.example                  # Environment template
├── .gitignore                    # Git exclusions
├── index.js                      # Main server entry point
├── package.json                  # Dependencies
├── QUICK_START_PLATFORM_A.md     # 🆕 Platform A quick guide
└── README.md                     # This file
```

---

## 🔐 Security

### **Implemented:**
- ✅ Environment variables for credentials (`.env`)
- ✅ **JWT Authentication for Platform A** (Bearer token, 7-day expiration)
- ✅ Server-side validation for all inputs
- ✅ FK constraints for data integrity
- ✅ Enum validation for status fields
- ✅ `.gitignore` protection for `.env` file
- ✅ Supabase Row Level Security (RLS) ready
- ✅ **Token-based authorization** (id_pelaksana extraction from JWT)
- ✅ **Pagination bounds** (max 500 items per request)

### **Best Practices:**
- Never commit `.env` file
- Use `anon` key for public access
- Use `service_role` key only in server-side
- Enable RLS policies in production
- Validate all user inputs on server
- **Rotate JWT_SECRET regularly in production**
- **Store tokens securely on mobile devices** (Flutter Secure Storage)

---

## 🛠️ Development Workflow

### **MPP Principles (3P):**

1. **SIMPLE (Sederhana)**
   - One endpoint = one responsibility
   - Clear request/response structure
   - Minimal code complexity

2. **TEPAT (Presisi & Keamanan)**
   - Server-side validation ALWAYS
   - FK validation via database queries
   - Specific error messages
   - Transaction safety

3. **PENINGKATAN BERTAHAB (Incremental)**
   - Module-by-module implementation
   - Verification checkpoint after each module
   - Build on previous foundations
   - Documentation-first approach

### **Module Status:**

| Module | Feature | Status | Verification Doc |
|--------|---------|--------|------------------|
| M-1.1 | Dashboard KPI Eksekutif | ✅ Complete | ✅ VERIFICATION_M1.1_KPI_EKSEKUTIF.md |
| M-1.2 | Dashboard Operasional | ✅ Complete | ✅ VERIFICATION_M1.2_DASHBOARD_OPERASIONAL.md |
| M-1.3 | Dashboard Teknis | ✅ Complete | ✅ VERIFICATION_M1.3_DASHBOARD_TEKNIS.md |
| M-4.1 | Create SPK Header | ✅ Complete | ✅ VERIFICATION_M4.1_CREATE_SPK_HEADER.md |
| M-4.2 | Add Tugas to SPK | ✅ Complete | ✅ VERIFICATION_M4.2_ADD_TUGAS_SPK.md |
| **Platform A** | **Mobile Field Workers** | **✅ Complete** | **✅ VERIFICATION_PLATFORM_A_INTEGRATION.md** |
| - | GET /tugas/saya (JWT) | ✅ Complete | - |
| - | POST /log_aktivitas (5W1H + Auto-Trigger) | ✅ Complete | - |
| M-4.3 | Update SPK | 🔜 Next | - |
| M-4.4 | Update Tugas | 🔜 Planned | - |

---

## 🐛 Troubleshooting

### **Common Issues:**

**1. Connection Error to Supabase**
```bash
# Check environment variables
cat .env

# Test connection
node debug-supabase.js
```

**2. FK Constraint Violation**
```bash
# Verify master_pihak has data
node check-table-structure.js

# Insert dummy data if needed
node insert-dummy-master-pihak.js
```

**3. Server Won't Start**
```bash
# Check port availability
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <pid> /F
```

**4. RLS Policy Blocking Queries**
```sql
-- Disable RLS for development (in Supabase dashboard)
ALTER TABLE spk_header DISABLE ROW LEVEL SECURITY;
ALTER TABLE spk_tugas DISABLE ROW LEVEL SECURITY;
```

📄 **Full Guide:** `docs/TROUBLESHOOTING.md`

---

## 📚 Documentation

- 📖 **Master Priming Prompt:** `context/master_priming_prompt.md`
- 🗃️ **Database Schema:** `context/optimalisasi_skema_db_v1.1.md`
- 🧪 **Testing Guide:** `docs/TESTING_GUIDE.md`
- 🔧 **Troubleshooting:** `docs/TROUBLESHOOTING.md`
- ✅ **Verification Checkpoints:** `docs/VERIFICATION_*.md`

---

## 🚀 Roadmap

### **Phase 1: Foundation** ✅
- [x] Database schema & dummy data
- [x] Supabase connection setup
- [x] Basic server structure

### **Phase 2: Dashboard READ APIs** ✅
- [x] M-1.1: KPI Eksekutif
- [x] M-1.2: Dashboard Operasional
- [x] M-1.3: Dashboard Teknis

### **Phase 3: SPK WRITE APIs** ✅
- [x] M-4.1: Create SPK Header
- [x] M-4.2: Add Tugas (Batch)
- [x] **Platform A: JWT Authentication**
- [x] **Platform A: GET /tugas/saya (Pagination)**
- [x] **Platform A: POST /log_aktivitas (5W1H + Auto-Trigger)**
- [ ] M-4.3: Update SPK
- [ ] M-4.4: Update Tugas

### **Phase 4: Advanced Features** �
- [x] **M-7.1: 5W1H Activity Logging (Platform A)**
- [x] **Auto-Trigger Work Orders (G1→APH, G4→SANITASI)**
- [ ] M-5.x: Workflow automation (status transitions - extended)
- [ ] M-6.x: Notification system
- [ ] M-8.x: Report generation

### **Phase 5: Production Ready** 🔜
- [ ] Authentication & Authorization
- [ ] RLS policies implementation
- [ ] API rate limiting
- [ ] Comprehensive error logging
- [ ] API documentation (Swagger/OpenAPI)

---

## 👥 Contributors

- **Developer:** AI Agent (GitHub Copilot)
- **Architect:** Master Priming Prompt (MPP)
- **Owner:** mastoroshadiq-prog

---

## 📄 License

This project is developed for internal use. All rights reserved.

---

## 📞 Support

For issues or questions:
1. Check `docs/TROUBLESHOOTING.md`
2. Review verification documents in `docs/`
3. Contact project owner

---

**Last Updated:** November 6, 2025  
**Version:** 1.1.0 (Platform A Integration Complete)  
**Framework:** Master Priming Prompt (MPP) - 3P Principles

**Recent Updates:**
- ✅ Platform A: JWT Authentication for mobile workers
- ✅ Platform A: GET /tugas/saya with pagination
- ✅ Platform A: POST /log_aktivitas with 5W1H digital trail
- ✅ Auto-Trigger: Work Order creation on G1/G4 status
- ✅ Database: log_aktivitas_5w1h table schema
- ✅ Testing: Automated test suite (test-full-auto.js)
- ✅ Fixed: spk_tugas column ordering (removed created_at)

**Commits:**
- `3336a11` - Initial Platform A implementation (13 files, 2,276 insertions)
- `bc1d11c` - Bug fixes + testing utilities (3 files, 202 insertions)