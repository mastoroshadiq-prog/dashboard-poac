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
```

> **⚠️ IMPORTANT:** Never commit `.env` file! Use `.env.example` as template.

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

### **Dashboard KPI (READ/OUTPUT)** ✅

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/dashboard/kpi-eksekutif` | GET | KPI Eksekutif (HPH, Produktivitas, Kualitas) | ✅ M-1.1 |
| `/dashboard/operasional` | GET | Dashboard Operasional (SPK, Tugas, Progres) | ✅ M-1.2 |
| `/dashboard/teknis` | GET | Dashboard Teknis (Peta, Target, Realisasi) | ✅ M-1.3 |

**Example:**
```bash
# PowerShell
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/dashboard/kpi-eksekutif" -Method GET | ConvertTo-Json -Depth 10

# cURL
curl -X GET http://localhost:3000/api/v1/dashboard/kpi-eksekutif
```

### **SPK Management (WRITE/INPUT)** ✅

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/spk/` | POST | Create SPK Header | ✅ M-4.1 |
| `/spk/:id_spk/tugas` | POST | Add Batch Tugas to SPK | ✅ M-4.2 |
| `/spk/:id_spk` | PUT | Update SPK Header | 🔜 M-4.3 |
| `/spk/:id_spk/tugas/:id_tugas` | PUT | Update Tugas Status | 🔜 M-4.4 |

---

## 📝 API Documentation

### **M-4.1: Create SPK Header**

**Endpoint:** `POST /api/v1/spk/`

**Request Body:**
```json
{
  "nama_spk": "SPK Validasi Drone Blok A1",
  "id_asisten_pembuat": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10",
  "tanggal_mulai": "2024-01-15",
  "tanggal_selesai": "2024-01-20",
  "keterangan": "Validasi drone untuk blok A1-A5"
}
```

**Response:**
```json
{
  "success": true,
  "message": "SPK berhasil dibuat",
  "data": {
    "id_spk": "uuid-generated",
    "nama_spk": "SPK Validasi Drone Blok A1",
    "status_spk": "BARU",
    "created_at": "2024-01-15T10:00:00Z",
    ...
  }
}
```

**Validation:**
- ✅ Server-side FK validation (`id_asisten_pembuat` → `master_pihak`)
- ✅ Date format validation (YYYY-MM-DD)
- ✅ Required fields check
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

## 🗄️ Database Schema

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
├── tipe_tugas (ENUM: VALIDASI_DRONE, APH, PANEN, LAINNYA)
├── status_tugas (ENUM: BARU, DIKERJAKAN, SELESAI, DITOLAK)
├── target_json (JSONB)
├── prioritas (INTEGER)
└── created_at (TIMESTAMP)

master_pihak
├── id_pihak (PK, UUID)
├── nama_pihak (TEXT)
├── role (TEXT)
└── created_at (TIMESTAMP)
```

**Relationships:**
- `spk_header.id_asisten_pembuat` → `master_pihak.id_pihak`
- `spk_tugas.id_spk` → `spk_header.id_spk`
- `spk_tugas.id_pelaksana` → `master_pihak.id_pihak`

---

## 🧪 Testing

### **Manual Testing (PowerShell)**

```bash
# Test Dashboard KPI
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/dashboard/kpi-eksekutif" -Method GET

# Test Create SPK
.\test-post-spk.ps1

# Test Add Tugas
.\test-add-tugas-api.ps1
```

### **Automated Testing (Node.js)**

```bash
# Test connection
node debug-supabase.js

# Test M-4.1
node test-spk-create.js

# Test M-4.2
node test-add-tugas.js

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
│   └── supabase.js          # Supabase client configuration
├── context/
│   ├── master_priming_prompt.md
│   ├── optimalisasi_skema_db_v1.1.md
│   └── panduan_platform_b.md
├── docs/
│   ├── VERIFICATION_M4.1_CREATE_SPK_HEADER.md
│   ├── VERIFICATION_M4.2_ADD_TUGAS_SPK.md
│   ├── TESTING_GUIDE.md
│   └── TROUBLESHOOTING.md
├── routes/
│   ├── dashboardRoutes.js   # Dashboard endpoints (M-1.x)
│   └── spkRoutes.js          # SPK management endpoints (M-4.x)
├── services/
│   ├── dashboardService.js   # Dashboard business logic
│   ├── operasionalService.js # Operational data aggregation
│   ├── teknisService.js      # Technical data processing
│   └── spkService.js         # SPK business logic
├── sql/
│   ├── dummy_data_v1_2.sql   # Database schema & initial data
│   └── verify_data.sql       # Data verification queries
├── .env.example              # Environment template
├── .gitignore                # Git exclusions
├── index.js                  # Main server entry point
├── package.json              # Dependencies
└── README.md                 # This file
```

---

## 🔐 Security

### **Implemented:**
- ✅ Environment variables for credentials (`.env`)
- ✅ Server-side validation for all inputs
- ✅ FK constraints for data integrity
- ✅ Enum validation for status fields
- ✅ `.gitignore` protection for `.env` file
- ✅ Supabase Row Level Security (RLS) ready

### **Best Practices:**
- Never commit `.env` file
- Use `anon` key for public access
- Use `service_role` key only in server-side
- Enable RLS policies in production
- Validate all user inputs on server

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

### **Phase 3: SPK WRITE APIs** 🔄
- [x] M-4.1: Create SPK Header
- [x] M-4.2: Add Tugas (Batch)
- [ ] M-4.3: Update SPK
- [ ] M-4.4: Update Tugas

### **Phase 4: Advanced Features** 🔜
- [ ] M-5.x: Workflow automation (status transitions)
- [ ] M-6.x: Notification system
- [ ] M-7.x: Audit trail (log_aktivitas_5w1h)
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

**Last Updated:** November 2025  
**Version:** 1.0.0 (M-4.2 Complete)  
**Framework:** Master Priming Prompt (MPP) - 3P Principles