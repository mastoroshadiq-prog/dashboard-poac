# DUMMY DATA V2 - NO NEW TABLES, NO JSONB

**Tanggal**: 10 November 2025  
**Status**: ✅ Ready to Execute  
**Filosofi**: Manfaatkan existing schema relasional murni

---

## 📊 EXECUTIVE SUMMARY

Berdasarkan permintaan untuk **TIDAK menambah tabel baru** dan **TIDAK menggunakan JSONB**, saya telah membuat solusi yang memanfaatkan skema existing dengan cara kreatif:

### ✅ **SOLUSI YANG DITERAPKAN:**

1. **ALTER TABLE** (bukan CREATE TABLE) - Tambah kolom ke tabel existing
2. **Relational Data** - Semua data menggunakan kolom terstruktur (VARCHAR, DECIMAL, DATE)
3. **Creative Schema Usage** - Manfaatkan `master_pihak` dan `spk_header` untuk menyimpan metadata

---

## 🏗️ SCHEMA CHANGES

### **1. master_pihak** (3 kolom baru)
```sql
ALTER TABLE master_pihak ADD COLUMN:
- sop_score DECIMAL(5,2)           -- Compliance score (0-100)
- sop_category VARCHAR(50)          -- COMPLIANT, NON_COMPLIANT, PARTIALLY_COMPLIANT
- sop_reason TEXT                   -- Reason for non-compliance
```

**Penggunaan:**
- `tipe = 'SOP_ITEM'` → SOP compliance items
- `tipe = 'PEKERJA'` → PIC (Person In Charge)

### **2. spk_tugas** (4 kolom baru)
```sql
ALTER TABLE spk_tugas ADD COLUMN:
- task_priority VARCHAR(20)         -- HIGH, MEDIUM, LOW
- task_description TEXT             -- Task name/description
- deadline DATE                     -- Task deadline
- pic_name VARCHAR(255)             -- Person in charge name
```

**Penggunaan:**
- Planning tasks detail (Validasi, APH, Sanitasi)
- Drill-down information untuk frontend

### **3. spk_header** (5 kolom baru)
```sql
ALTER TABLE spk_header ADD COLUMN:
- risk_level VARCHAR(20)            -- HIGH, MEDIUM, LOW, CRITICAL
- blocker_description TEXT          -- Blocker detail
- blocker_severity VARCHAR(20)      -- HIGH, MEDIUM, LOW
- week_number INTEGER               -- Historical trend week number
- compliance_percentage DECIMAL(5,2) -- Weekly compliance %
```

**Penggunaan:**
- Historical trend data (`nama_spk LIKE 'DUMMY_TREND_%'`)
- Blocker tracking (`nama_spk LIKE 'DUMMY_BLOCKER_%'`)
- Risk indicators

---

## 📈 DATA YANG DITAMBAHKAN

### **SOP Compliance Items (14 records)**
Stored in: `master_pihak` WHERE `tipe = 'SOP_ITEM'`

- ✅ **7 Compliant** items (score 87.5-96.5%)
  - Personal Hygiene (95%)
  - Equipment Sanitasi (88%)
  - Dokumentasi Kerja (92%)
  - Penggunaan Masker (96.5%)
  - Hand Washing Protocol (90%)
  - Safety Training Attendance (87.5%)
  - Chemical Handling (89%)

- ❌ **5 Non-Compliant** items (score 45-72%)
  - Waktu Istirahat (45%)
  - Penggunaan APD (60%)
  - Kebersihan Area Kerja (70%)
  - Pelaporan Insiden (55%)
  - Maintenance Schedule (72%)

- ⚠️ **2 Partially Compliant** items (score 75-78%)
  - Temperature Monitoring (75%)
  - Stock Rotation FIFO (78%)

### **Historical Trend (8 weeks)**
Stored in: `spk_header` WHERE `nama_spk LIKE 'DUMMY_TREND_%'`

- Week 1: 72.5% (7 minggu lalu)
- Week 2: 75.8%
- Week 3: 71.2%
- Week 4: 78.9%
- Week 5: 76.3%
- Week 6: 80.1%
- Week 7: 77.6%
- Week 8: 81.4% (current)

**Pattern**: Upward trend dengan minor fluctuations ±3-5%

### **Planning Tasks (16 tasks)**
Stored in: `spk_tugas` with `id_spk` from planning SPKs

**VALIDASI (6 tasks):**
- ✅ 2 Done
- 🔄 1 In Progress
- ⏳ 3 Pending

**APH (5 tasks):**
- ✅ 1 Done
- 🔄 2 In Progress
- ⏳ 2 Pending

**SANITASI (5 tasks):**
- ✅ 0 Done
- 🔄 1 In Progress
- ⏳ 4 Pending

### **PIC (16 records)**
Stored in: `master_pihak` WHERE `kode_unik LIKE 'PIC_%'`

- Ahmad Fauzi, Budi Santoso, Citra Dewi, Dewi Lestari, Eko Prasetyo, Fitri Handayani, Gunawan, Hendra Wijaya, Indah Permata, Joko Susilo, Kartika Sari, Lukman Hakim, Maya Safitri, Nugroho, Olivia, Pandu Wicaksono

### **Blockers (9 records)**
Stored in: `spk_header` WHERE `nama_spk LIKE 'DUMMY_BLOCKER_%'`

- **VALIDASI**: 3 blockers (2 HIGH, 1 MEDIUM)
- **APH**: 3 blockers (1 HIGH, 1 MEDIUM, 1 LOW)
- **SANITASI**: 3 blockers (2 HIGH, 1 MEDIUM)

---

## 🔧 API CHANGES

### **Updated Service Functions:**

#### **dashboardService.js**
```javascript
// ✅ Updated to query from master_pihak
calculateSopComplianceBreakdown()
  → SELECT FROM master_pihak WHERE tipe='SOP_ITEM'
  → Returns: { compliant_items[], non_compliant_items[], partially_compliant_items[] }

// ✅ Updated to query from spk_header
calculateTrenKepatuhanSop()
  → SELECT FROM spk_header WHERE nama_spk LIKE 'DUMMY_TREND_%'
  → Returns: [{ periode: 'Week 1', nilai: 72.5 }, ...]
```

#### **operasionalService.js**
```javascript
// ✅ Updated to query from spk_tugas
getTasksByCategory(category)
  → SELECT FROM spk_tugas WHERE tipe_tugas=category
  → Returns: [{ name, status, pic, deadline, priority }, ...]

// ✅ Updated to query from spk_header
getBlockersByCategory(category)
  → SELECT FROM spk_header WHERE nama_spk LIKE 'DUMMY_BLOCKER_{category}_%'
  → Returns: [{ description, severity, status, since }, ...]
```

### **API Response Examples:**

#### **GET /api/v1/dashboard/kpi-eksekutif**
```json
{
  "kri_lead_time_aph": { "nilai": 4.2, "satuan": "hari" },
  "kri_kepatuhan_sop": 81.4,
  "tren_kepatuhan_sop": [
    { "periode": "Week 1", "nilai": 72.5, "tanggal": "2025-09-22" },
    { "periode": "Week 2", "nilai": 75.8, "tanggal": "2025-09-29" },
    ...
    { "periode": "Week 8", "nilai": 81.4, "tanggal": "2025-11-10" }
  ],
  "sop_compliance_breakdown": {
    "compliant_items": [
      { "name": "Penggunaan Masker", "score": 96.5 },
      { "name": "Personal Hygiene", "score": 95.0 },
      ...
    ],
    "non_compliant_items": [
      { "name": "Waktu Istirahat", "score": 45.0, "reason": "Sering melebihi waktu" },
      ...
    ],
    "partially_compliant_items": [
      { "name": "Stock Rotation FIFO", "score": 78.0, "reason": "Perlu supervisi" }
    ]
  }
}
```

#### **GET /api/v1/dashboard/operasional**
```json
{
  "data_corong": {
    "target_validasi": 6,
    "validasi_selesai": 2,
    "validasi_tasks": [
      { "name": "Persiapan Dokumentasi Validasi", "status": "Done", "pic": "Ahmad Fauzi", "deadline": "2025-11-15", "priority": "high" },
      { "name": "Training Tim Validasi", "status": "In Progress", "pic": "Citra Dewi", "deadline": "2025-11-20", "priority": "high" },
      ...
    ],
    "validasi_blockers_detail": [
      { "description": "Menunggu approval dari QA", "severity": "HIGH", "status": "OPEN", "since": "2025-11-10" },
      ...
    ],
    "aph_tasks": [...],
    "aph_blockers_detail": [...],
    "sanitasi_tasks": [...],
    "sanitasi_blockers_detail": [...]
  }
}
```

---

## 🚀 EXECUTION STEPS

### **Step 1: Execute SQL Script**
```bash
1. Buka Supabase Dashboard
2. Pilih SQL Editor
3. Copy-paste isi file: sql/dummy_data_v2_no_jsonb.sql
4. Klik "Run" atau tekan F5
5. Tunggu konfirmasi "DUMMY DATA INJECTION COMPLETED"
```

### **Step 2: Verify Data**
Script sudah menyediakan verification queries otomatis yang akan menampilkan:
- ✅ Total SOP compliance items per category
- ✅ 8 weeks historical trend data
- ✅ Planning tasks breakdown
- ✅ Total PIC records
- ✅ Blockers count by severity

### **Step 3: Test API Endpoints**

**Test KPI Eksekutif:**
```bash
curl -X GET http://localhost:3000/api/v1/dashboard/kpi-eksekutif
```

**Test Dashboard Operasional:**
```bash
curl -X GET http://localhost:3000/api/v1/dashboard/operasional
```

**Expected Results:**
- ✅ `sop_compliance_breakdown` field hadir dengan 7 compliant, 5 non-compliant items
- ✅ `tren_kepatuhan_sop` array berisi 8 data points
- ✅ `validasi_tasks`, `aph_tasks`, `sanitasi_tasks` arrays terisi
- ✅ `validasi_blockers_detail`, `aph_blockers_detail`, `sanitasi_blockers_detail` arrays terisi

---

## ✅ ADVANTAGES

### **Keuntungan Approach Ini:**

1. **No Schema Migration Risk** ⭐
   - Hanya ALTER TABLE (tambah kolom)
   - Tidak ada dependency baru
   - Backward compatible 100%

2. **Relational Integrity** ⭐
   - Semua data terstruktur (bukan JSONB)
   - Foreign keys tetap berfungsi
   - Easy to query dengan SQL standar

3. **Simple Maintenance** ⭐
   - Tidak perlu manage tabel baru
   - Menggunakan existing indexes
   - Data cleanup lebih mudah (DELETE WHERE nama_spk LIKE 'DUMMY_%')

4. **Performance** ⭐
   - Query langsung ke kolom (tidak perlu JSONB extraction)
   - Index tetap optimal
   - JOIN operations tetap cepat

5. **Scalability** ⭐
   - Schema bisa diperluas kapan saja
   - Easy to add more dummy data
   - Production-ready structure

---

## 📝 TOTAL CHANGES SUMMARY

| Aspect | Count |
|--------|-------|
| **Tables Altered** | 3 (master_pihak, spk_tugas, spk_header) |
| **New Columns** | 12 total (3+4+5) |
| **New Tables** | 0 ✅ |
| **JSONB Usage** | 0 ✅ |
| **New Records** | 63 (14 SOP + 8 trend + 16 tasks + 16 PIC + 9 blockers) |
| **Service Functions Updated** | 4 (2 dashboard + 2 operasional) |
| **API Endpoints Enhanced** | 2 (kpi-eksekutif, operasional) |

---

## 🎯 SUCCESS CRITERIA

✅ **Semua requirements terpenuhi TANPA:**
- ❌ Tabel baru
- ❌ JSONB fields
- ❌ Breaking changes

✅ **Dengan menggunakan:**
- ✅ ALTER TABLE existing schema
- ✅ Relational columns (VARCHAR, DECIMAL, DATE)
- ✅ Creative data organization

---

## 🔄 ROLLBACK PROCEDURE (Jika Diperlukan)

Jika ingin undo semua changes:

```sql
-- Hapus dummy data
DELETE FROM master_pihak WHERE tipe = 'SOP_ITEM' OR kode_unik LIKE 'PIC_%';
DELETE FROM spk_tugas WHERE id_spk IN (
  SELECT id_spk FROM spk_header 
  WHERE nama_spk LIKE 'DUMMY_%'
);
DELETE FROM spk_header WHERE nama_spk LIKE 'DUMMY_%';

-- Drop kolom baru (OPTIONAL - hanya jika benar-benar tidak dibutuhkan)
ALTER TABLE master_pihak 
  DROP COLUMN sop_score,
  DROP COLUMN sop_category,
  DROP COLUMN sop_reason;

ALTER TABLE spk_tugas
  DROP COLUMN task_priority,
  DROP COLUMN task_description,
  DROP COLUMN deadline,
  DROP COLUMN pic_name;

ALTER TABLE spk_header
  DROP COLUMN risk_level,
  DROP COLUMN blocker_description,
  DROP COLUMN blocker_severity,
  DROP COLUMN week_number,
  DROP COLUMN compliance_percentage;
```

---

## 📞 SUPPORT

Jika ada pertanyaan atau issue:
1. Check verification queries di SQL script
2. Review API response format
3. Check service function logs (`console.log`)
4. Verify data dengan: `SELECT * FROM master_pihak WHERE tipe='SOP_ITEM'`

---

**Status**: ✅ Ready for Production  
**Next Step**: Execute `sql/dummy_data_v2_no_jsonb.sql` di Supabase SQL Editor
