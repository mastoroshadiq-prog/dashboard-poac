# 📊 EXECUTIVE SUMMARY - Analisis Skema Drone Data (tableNDRE.csv)

**Tanggal:** 12 November 2025  
**Analyst:** AI Backend Team  
**Status:** ✅ Analysis Complete - Awaiting Decision

---

## 🎯 PERTANYAAN UTAMA

> **"Apakah data di tableNDRE.csv bisa diterapkan ke tabel yang sudah ada di Supabase yaitu `kebun_n_pokok` dan `kebun_observasi`?"**

---

## ✅ JAWABAN SINGKAT

**YA, BISA!** ✅ Tapi dengan **modifikasi schema** dan **2-phase import process**.

**Recommended Approach:**
1. **Enhance `kebun_n_pokok`** → tambah 4 kolom (object_id, divisi, blok, blok_detail)
2. **Use `kebun_observasi`** → simpan hasil survey NDRE (time-series data)

---

## 📋 FINDINGS - Tabel Existing

### 1. `kebun_n_pokok` (Master Data Pohon)

**Status:** ✅ **ACTIVE** (3+ rows data)

**Current Schema:**
```
✅ id_npokok      UUID         Primary Key
✅ n_baris        INTEGER      Row number (matches CSV!)
✅ n_pokok        INTEGER      Tree number (matches CSV!)
✅ tgl_tanam      DATE         Plant date
✅ kode           VARCHAR      Block code
✅ id_tipe        VARCHAR      Tree type (SAWIT)
✅ id_tanaman     VARCHAR      Tree identifier

❌ object_id      -            MISSING (need for GIS matching)
❌ divisi         -            MISSING (need for location)
❌ blok           -            MISSING (need for location)
❌ blok_detail    -            MISSING (need for detailed location)
```

**Gap Analysis:**
- ✅ Core fields (`n_baris`, `n_pokok`) **MATCHED**
- ❌ Location fields (`DIVISI`, `Blok`, `OBJECTID`) **MISSING**
- ❌ Sensor fields (`NDRE125`, `KlassNDRE12025`) **MISSING** (correct - should be in observasi)

**Verdict:** ⚠️ **NEEDS ENHANCEMENT** (add 4 columns)

---

### 2. `kebun_observasi` (Data Observasi)

**Status:** ⚠️ **EMPTY** (0 rows)

**Schema:** ❓ **UNKNOWN** (table exists but structure not yet queried via SQL)

**Hypothesis:**
```sql
-- Expected structure (typical observation table pattern)
id_observasi          UUID         Primary Key
id_npokok             UUID         FK → kebun_n_pokok
tanggal_observasi     DATE         Observation date
jenis_observasi       VARCHAR      'DRONE_NDRE', 'MANUAL', etc.
nilai_observasi       JSONB        Flexible data storage
keterangan            TEXT         Notes
```

**Expected Usage:**
- Store time-series observation data (multiple surveys per tree)
- Link to master data via FK (`id_npokok`)
- Support multiple observation types (drone, manual, sensor)

**Verdict:** ✅ **PERFECT FIT** for NDRE survey data (pending schema confirmation)

---

## 📋 FINDINGS - tableNDRE.csv

**Data Volume:** 1,289 rows (trees surveyed)

**Key Fields:**
```
Location:
  • DIVISI: "AME II"
  • Blok: "D01"
  • BLOK_B: "D001A" (detailed block code)
  • N_BARIS: 1
  • N_POKOK: 1-17

Identifiers:
  • OBJECTID: 167903, 167913... (unique GIS ID)
  • T_TANAM: 2009 (year planted)

Sensor Data:
  • NDRE125: 0.386189026 (NDRE value from drone)
  • KlassNDRE12025: "Stres Berat", "Stres Sedang" (classification)
  • Ket: "Pokok Utama" (notes)
```

**Business Context:**
- Drone survey results for tree health monitoring
- NDRE (Normalized Difference Red Edge) indicates stress level
- Lower value = higher stress (0.38 = Severe, 0.42 = Moderate)

---

## 🔧 SOLUTION: 2-Phase Import Process

### **PHASE 1: Update Master Data (`kebun_n_pokok`)**

**Action:** Enhance schema + import/update tree master data

**SQL:**
```sql
-- 1. Add missing columns
ALTER TABLE kebun_n_pokok
ADD COLUMN IF NOT EXISTS object_id INTEGER UNIQUE,
ADD COLUMN IF NOT EXISTS divisi VARCHAR(50),
ADD COLUMN IF NOT EXISTS blok VARCHAR(20),
ADD COLUMN IF NOT EXISTS blok_detail VARCHAR(20);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_kebun_n_pokok_location 
ON kebun_n_pokok (divisi, blok, n_baris, n_pokok);

CREATE UNIQUE INDEX IF NOT EXISTS idx_kebun_n_pokok_natural_key
ON kebun_n_pokok (divisi, blok, n_baris, n_pokok);

-- 3. Import/Update master data
INSERT INTO kebun_n_pokok (
  object_id, divisi, blok, blok_detail, 
  n_baris, n_pokok, tgl_tanam, id_tipe, kode
)
SELECT 
  OBJECTID,
  DIVISI,
  Blok,
  BLOK_B,
  N_BARIS,
  N_POKOK,
  (T_TANAM || '-01-01')::DATE,
  'SAWIT',
  BLOK_B
FROM csv_import_temp
ON CONFLICT (divisi, blok, n_baris, n_pokok) 
DO UPDATE SET
  object_id = EXCLUDED.object_id,
  tgl_tanam = EXCLUDED.tgl_tanam;
```

**Result:** 1,289 trees in master table (new or updated)

---

### **PHASE 2: Import Survey Data (`kebun_observasi`)**

**Action:** Insert NDRE observation results

**SQL (Option A - If schema matches expected):**
```sql
INSERT INTO kebun_observasi (
  id_npokok, 
  tanggal_observasi, 
  jenis_observasi,
  ndre_value,
  ndre_classification,
  keterangan
)
SELECT 
  np.id_npokok,
  '2025-01-25'::DATE,  -- Survey date
  'DRONE_NDRE',
  csv.NDRE125,
  csv.KlassNDRE12025,
  csv.Ket
FROM csv_import_temp csv
JOIN kebun_n_pokok np ON (
  np.divisi = csv.DIVISI AND
  np.blok = csv.Blok AND
  np.n_baris = csv.N_BARIS AND
  np.n_pokok = csv.N_POKOK
);
```

**SQL (Option B - If need to create/modify schema):**
```sql
-- Create or alter kebun_observasi to match NDRE data
CREATE TABLE IF NOT EXISTS kebun_observasi (
  id_observasi UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_npokok UUID NOT NULL REFERENCES kebun_n_pokok(id_npokok),
  tanggal_survey DATE NOT NULL,
  jenis_survey VARCHAR(50) NOT NULL,
  ndre_value DECIMAL(10, 8),
  ndre_classification VARCHAR(50),
  metadata_json JSONB,
  keterangan TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (id_npokok, tanggal_survey, jenis_survey)
);

-- Then insert as above
```

**Result:** 1,289 observation records (first survey)

---

## ✅ BENEFITS - Recommended Approach

### **Data Architecture:**
```
kebun_n_pokok (Master)          kebun_observasi (Time-Series)
├─ id_npokok (PK)               ├─ id_observasi (PK)
├─ object_id (GIS ID)           ├─ id_npokok (FK) ───┐
├─ divisi, blok                 ├─ tanggal_survey    │
├─ n_baris, n_pokok             ├─ ndre_value        │
├─ tgl_tanam                    ├─ classification    │
└─ (static metadata)            └─ (dynamic data) ◄──┘
                                     │
                                     ├─ 2025-01-25: 1,289 rows
                                     ├─ 2025-02-25: 1,289 rows
                                     ├─ 2025-03-25: 1,289 rows
                                     └─ ...
```

### **Advantages:**
1. ✅ **Proper Normalization** - No data redundancy
2. ✅ **Historical Tracking** - Multiple surveys per tree over time
3. ✅ **Scalability** - Ready for millions of observations
4. ✅ **Data Integrity** - FK constraints enforce relationships
5. ✅ **Performance** - Indexed queries on location + survey date
6. ✅ **Analytics Ready** - Time-series analysis, trend detection, ML training
7. ✅ **Flexible** - Can add more observation types (manual, sensor, etc.)

### **Use Cases Unlocked:**
- 📈 **Trend Analysis:** "Apakah NDRE pohon membaik setelah pemupukan?"
- 🎯 **Targeted Action:** "Pohon mana yang stres konsisten dalam 3 bulan?"
- 🤖 **Predictive ML:** "Prediksi produktivitas berdasarkan historical NDRE"
- 📊 **Dashboard KPI:** "Rata-rata kesehatan kebun per divisi/blok"

---

## 🚧 IMPLEMENTATION STEPS

### **TODAY (Nov 12, 2025):**

**Step 1:** ✅ **DONE** - Analyze existing schema
- Query `kebun_n_pokok` structure
- Confirm `kebun_observasi` exists (empty)

**Step 2:** 🔄 **NEXT** - Verify `kebun_observasi` schema
```sql
-- Run in Supabase SQL Editor
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'kebun_observasi'
ORDER BY ordinal_position;
```

**Step 3:** 📝 Decision Point
- If schema matches → Proceed with PHASE 1 & 2
- If schema doesn't match → Modify `kebun_observasi` first

### **TOMORROW (Nov 13, 2025):**

**Step 4:** Enhance `kebun_n_pokok`
- Add 4 columns (object_id, divisi, blok, blok_detail)
- Create indexes
- Test with sample data (10 rows)

**Step 5:** Import PHASE 1
- Parse tableNDRE.csv
- Insert/Update master data
- Validate: 1,289 rows affected

**Step 6:** Import PHASE 2
- Insert observation data
- Validate: 1,289 rows inserted
- Check FK integrity

**Step 7:** Testing
- Query sample data via API
- Verify POAC workflow integration
- Performance test (query speed)

### **NEXT WEEK (Nov 18-22):**

**Step 8:** API Integration
- Create endpoint: `GET /api/v1/kebun/observasi/ndre`
- Update dashboard services
- Frontend integration guide

**Step 9:** Implement SARAN #1 (from POAC validation)
- Refactor confusion matrix to use structured data
- Performance benchmark vs JSONB approach

---

## 🎯 SUCCESS CRITERIA

**After Implementation:**

1. ✅ **Data Volume:**
   - `kebun_n_pokok`: 1,289+ rows (trees registered)
   - `kebun_observasi`: 1,289 rows (first survey)

2. ✅ **Data Quality:**
   - All NDRE values imported correctly
   - No orphaned observations (all have valid FK)
   - No duplicates (unique constraints enforced)

3. ✅ **Query Performance:**
   - Tree lookup by location: <50ms
   - Historical NDRE trend: <100ms
   - Dashboard aggregation: <500ms

4. ✅ **Integration:**
   - POAC workflow uses `kebun_observasi` (not JSONB)
   - Confusion Matrix queries structured columns
   - Frontend displays NDRE classification correctly

---

## 📊 COMPARISON - Before vs After

### **BEFORE (Current - CHECKPOINT state):**
```
Drone Data Storage:
  ❌ No master pohon table
  ⚠️ JSONB workaround (spk_tugas.target_json)
  ⚠️ Slow queries (JSONB parsing)
  ❌ No historical tracking
  ❌ No referential integrity

Performance:
  ⚠️ Confusion Matrix: JSONB query (slow)
  ⚠️ No indexes on sensor data
  ❌ Cannot track trends over time

Scalability:
  ❌ Not ready for millions of observations
  ⚠️ Data redundancy in JSONB
```

### **AFTER (Recommended Implementation):**
```
Drone Data Storage:
  ✅ Proper master table (kebun_n_pokok)
  ✅ Time-series observations (kebun_observasi)
  ✅ Fast queries (B-tree indexes)
  ✅ Historical tracking (multiple surveys)
  ✅ Referential integrity (FK constraints)

Performance:
  ✅ Confusion Matrix: Structured query (10-100x faster)
  ✅ Indexed on location + date + sensor value
  ✅ Trend analysis via time-series queries

Scalability:
  ✅ Ready for millions of observations
  ✅ No data redundancy (normalized)
  ✅ Production-grade architecture
```

---

## ⚠️ RISKS & MITIGATION

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| `kebun_observasi` schema mismatch | HIGH | 30% | Query schema first, adapt import script |
| Data conflict (trees already exist) | MEDIUM | 50% | Use UPSERT (ON CONFLICT DO UPDATE) |
| Import performance slow | LOW | 20% | Batch insert (100 rows/chunk), use COPY |
| Missing trees in master | MEDIUM | 40% | Insert mode (create if not exists) |

---

## 💡 RECOMMENDATIONS

### **IMMEDIATE:**
1. ✅ **Query `kebun_observasi` DDL** - Confirm schema structure
2. ✅ **Decide on survey date** - What date to assign for this NDRE dataset?
3. ✅ **Backup before import** - Take Supabase snapshot

### **SHORT TERM:**
4. ✅ **Test with 10 rows** - Validate import logic before full run
5. ✅ **Create rollback plan** - Script to undo changes if needed
6. ✅ **Document assumptions** - Record business rules (e.g., survey date)

### **LONG TERM:**
7. ✅ **Automate future imports** - CSV upload endpoint for regular surveys
8. ✅ **Dashboard integration** - Display NDRE trends visually
9. ✅ **Alert system** - Notify when trees show consistent stress

---

## 📝 CONCLUSION

**Question:** Apakah tableNDRE.csv bisa diterapkan ke `kebun_n_pokok` dan `kebun_observasi`?

**Answer:** ✅ **YA, SANGAT COCOK!**

**Why:**
- `kebun_n_pokok` = Perfect for master tree data (dengan enhancement 4 kolom)
- `kebun_observasi` = Perfect for time-series NDRE surveys
- Architecture follows best practices (normalized, scalable, performant)

**Next Action:** 
1. Query `kebun_observasi` schema untuk konfirmasi
2. Get approval untuk enhance `kebun_n_pokok`
3. Tentukan survey date untuk dataset ini
4. Execute 2-phase import process

**Timeline:** 2-3 hari (include testing & validation)

---

**STATUS: ✅ READY TO PROCEED**

Menunggu konfirmasi schema `kebun_observasi` dan approval untuk enhance `kebun_n_pokok`. 🎯

---

**END OF SUMMARY**
