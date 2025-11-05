# Backend API - Sistem Saraf Digital Kebun

Backend API untuk Dashboard POAC (Planning, Organizing, Actuating, Controlling) sistem manajemen kebun kelapa sawit dengan 1.2 juta pohon.

## 🎯 Filosofi 3P

- **SIMPLE (Sederhana):** Kerumitan di backend, UI lapangan minimalis & offline-first
- **TEPAT (Akurat):** Jejak Digital 5W1H, validasi server-side non-negotiable
- **PENINGKATAN BERTAHAP (Iteratif):** Closed loop feedback system

## 🛠 Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js 5.x
- **Database:** Supabase (PostgreSQL + PostGIS)
- **Authentication:** JWT (planned)
- **Environment:** dotenv

## 📁 Project Structure

```
backend-keboen/
├── config/
│   └── supabase.js          # Supabase client configuration
├── services/
│   └── dashboardService.js  # Business logic untuk KPI/KRI
├── routes/
│   └── dashboardRoutes.js   # API endpoints
├── docs/
│   └── API_DASHBOARD_KPI_EKSEKUTIF.md  # API Documentation
├── context/
│   ├── master_priming_prompt.md        # Filosofi & aturan
│   ├── draf_arsitektur_API_backend.md  # API contract
│   └── konfirmasi_pemahaman_arsitek.md # Fase 1 checkpoint
├── index.js                 # Entry point
├── package.json
├── .env.example             # Template environment variables
└── .env                     # Your credentials (GITIGNORED)
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` ke `.env` dan isi credentials Supabase Anda:

```bash
cp .env.example .env
```

Edit `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
PORT=3000
NODE_ENV=development
```

### 3. Run Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

### 4. Test API

Health check:
```bash
curl http://localhost:3000/health
```

Get KPI Eksekutif:
```bash
curl http://localhost:3000/api/v1/dashboard/kpi_eksekutif
```

## 📡 Available Endpoints

### Dashboard KPI/KRI

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/` | API Info | ✅ Ready |
| GET | `/health` | Health check + DB test | ✅ Ready |
| GET | `/api/v1/dashboard/kpi_eksekutif` | KPI Eksekutif (M-1.1, M-1.2) | ✅ Ready |
| GET | `/api/v1/dashboard/operasional` | Dashboard Operasional | 🚧 Planned |
| GET | `/api/v1/dashboard/teknis` | Dashboard Teknis | 🚧 Planned |

**Dokumentasi lengkap:** `docs/API_DASHBOARD_KPI_EKSEKUTIF.md`

## 📊 KPI/KRI yang Dikembalikan

Endpoint `/api/v1/dashboard/kpi_eksekutif` mengembalikan:

1. **`kri_lead_time_aph`** - Rata-rata waktu dari deteksi G1 ke eksekusi APH (hari)
2. **`kri_kepatuhan_sop`** - Persentase kepatuhan SOP (% tugas selesai)
3. **`tren_insidensi_baru`** - Array tren harian deteksi G1 (30 hari)
4. **`tren_g4_aktif`** - Jumlah pohon G4 belum disanitasi

**Contoh Response:**
```json
{
  "success": true,
  "data": {
    "kri_lead_time_aph": 2.0,
    "kri_kepatuhan_sop": 75.0,
    "tren_insidensi_baru": [
      { "date": "2025-10-28", "count": 1 }
    ],
    "tren_g4_aktif": 2,
    "generated_at": "2025-11-05T12:34:56.789Z",
    "filters": {}
  },
  "message": "Data KPI Eksekutif berhasil diambil"
}
```

## 🗄 Database Requirements

### Tables
- `log_aktivitas_5w1h` - Jejak digital 5W1H dari lapangan
- `spk_tugas` - Work orders untuk mandor/tim lapangan
- `spk_header` - Work order headers

### Setup Dummy Data

**PENTING:** API akan mengembalikan semua nilai 0 jika database kosong!

**Cara Insert Dummy Data:**

1. Buka Supabase SQL Editor
   - https://app.supabase.com → Your Project → SQL Editor
2. Copy isi file `sql/dummy_data_v1_2.sql`
3. Paste ke SQL Editor
4. Klik **RUN** atau tekan Ctrl+Enter
5. Verify data berhasil ter-insert:
   ```sql
   SELECT COUNT(*) FROM log_aktivitas_5w1h WHERE id_npokok LIKE 'DUMMY%';
   -- Expected: 5 rows
   ```

**Data yang akan di-insert:**
- 2 SPK Headers
- 5 SPK Tugas (2 SELESAI, 2 DIKERJAKAN, 1 BARU)
- 5 Log Aktivitas (termasuk G1 detections dan APH executions)

**Expected API Results setelah insert:**
- `kri_lead_time_aph`: 2.0 hari
- `kri_kepatuhan_sop`: 40.0%
- `tren_insidensi_baru`: 2 entries
- `tren_g4_aktif`: 2 tasks

## 🔐 Security Features

Sesuai **Filosofi TEPAT** dan **Tuntunan Keamanan**:

- ✅ Server-side validation untuk semua input
- ✅ Environment variables untuk credentials
- ✅ CORS configuration
- ✅ Input sanitization
- ✅ Error handling & logging
- 🚧 JWT Authentication (planned)
- 🚧 Rate limiting (planned)

## 📈 Scalability Features

Sesuai **Tuntunan Skalabilitas**:

- ✅ Agregasi di database (bukan di aplikasi)
- ✅ Parallel queries dengan `Promise.all()`
- ✅ Proper indexing di database
- ✅ JSON body size limit (10MB)
- 🚧 Pagination (planned)
- 🚧 Caching (planned)

## 🧪 Testing

### Manual Testing dengan cURL

```bash
# Health check
curl http://localhost:3000/health

# KPI Eksekutif
curl http://localhost:3000/api/v1/dashboard/kpi_eksekutif

# Dengan query parameters
curl "http://localhost:3000/api/v1/dashboard/kpi_eksekutif?estate=EST001"
```

### Testing dengan Postman

Import collection dari `docs/postman_collection.json` (planned)

## 📝 Development Scripts

```bash
# Development dengan auto-reload
npm run dev

# Production
npm start

# Test (planned)
npm test
```

## 🐛 Troubleshooting

### Server tidak bisa start

**Error:** `SUPABASE_URL dan SUPABASE_KEY harus diset di file .env!`

**Solusi:**
1. Pastikan file `.env` sudah dibuat (copy dari `.env.example`)
2. Isi `SUPABASE_URL` dan `SUPABASE_KEY` dengan credentials dari Supabase dashboard

### Database connection failed

**Error di `/health`:** `"database": "Disconnected"`

**Solusi:**
1. Check credentials di `.env`
2. Pastikan Supabase project aktif
3. Check internet connection
4. Verifikasi API key tidak expired

### Response semua nilai 0 ⚠️ MOST COMMON ISSUE

**Symptoms:** API returns `kri_lead_time_aph: 0`, `kri_kepatuhan_sop: 0`, dll.

**Root Cause:** Ada 2 kemungkinan:
1. Database kosong (belum insert dummy data)
2. **RLS (Row Level Security) memblokir akses** ← **PALING SERING!**

**Quick Check:** Apakah data ada di database?
```sql
-- Jalankan di Supabase SQL Editor
SELECT COUNT(*) FROM log_aktivitas_5w1h;
```

**Jika COUNT > 0 tapi API return 0 → Ini masalah RLS!**

**Solusi RLS:** Lihat `docs/SOLVED_RLS_ISSUE.md` atau jalankan:

```sql
-- Quick Fix: Disable RLS untuk development
ALTER TABLE public.spk_header DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.spk_tugas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_aktivitas_5w1h DISABLE ROW LEVEL SECURITY;
```

**Dokumentasi Lengkap:** 
- `docs/SOLVED_RLS_ISSUE.md` - Root cause & solutions
- `sql/fix_rls_policy.sql` - Script lengkap 3 opsi
- `docs/TROUBLESHOOTING.md` - Troubleshooting guide

### Debug Database

Jalankan helper script:
```bash
node debug-database.js
```

## 🚧 Roadmap

### Fase 1: ✅ SELESAI
- [x] Setup project structure
- [x] Supabase integration
- [x] API: GET /api/v1/dashboard/kpi_eksekutif
- [x] Server-side validation
- [x] Error handling
- [x] Documentation

### Fase 2: 🚧 IN PROGRESS
- [ ] JWT Authentication
- [ ] API: Work Order management (SP-1)
- [ ] API: Log aktivitas upload (SP-2)
- [ ] API: Dashboard Operasional
- [ ] API: Dashboard Teknis

### Fase 3: 📋 PLANNED
- [ ] Rate limiting
- [ ] Caching layer
- [ ] Unit tests
- [ ] Integration tests
- [ ] API versioning
- [ ] Pagination
- [ ] WebSocket for real-time updates

## 📚 Documentation

- **Filosofi & Aturan:** `context/master_priming_prompt.md`
- **API Contract:** `context/draf_arsitektur_API_backend.md`
- **Konfirmasi Arsitek:** `context/konfirmasi_pemahaman_arsitek.md`
- **API Doc KPI Eksekutif:** `docs/API_DASHBOARD_KPI_EKSEKUTIF.md`

## 👥 Team

- **Arsitek:** Gemini 2.5 Pro (Senior Software Architect)
- **Developer:** ikin
- **Project:** Backend Kebun Kelapa Sawit

## 📄 License

ISC

---

**Status:** ✅ Fase 1 Complete - API KPI Eksekutif Ready for Production

**Next Steps:** 
1. Setup `.env` dengan credentials Supabase
2. Insert dummy data
3. Test endpoint `/api/v1/dashboard/kpi_eksekutif`
4. Integrate dengan Platform B (Dashboard Web)
