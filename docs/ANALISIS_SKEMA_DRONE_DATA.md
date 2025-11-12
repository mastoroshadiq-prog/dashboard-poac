# ANALISIS SKEMA: Integrasi tableNDRE.csv dengan Database Existing

**Tanggal:** 12 November 2025  
**Tujuan:** Menganalisis apakah data drone NDRE bisa diterapkan ke tabel `kebun_n_pokok` dan `kebun_observasi` yang sudah ada

---

## 📊 1. STRUKTUR TABEL EXISTING

### **A. Tabel: `kebun_n_pokok`** (Master Data Pohon)

**Status:** ✅ **Table exists with data**

**Columns:**
```
id_npokok     UUID          Primary Key (b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11)
id_tanaman    VARCHAR       Kode tanaman (P-G14-01-01)
id_tipe       VARCHAR       Tipe tanaman (SAWIT)
n_baris       INTEGER       Nomor baris (1, 2, 3...)
n_pokok       INTEGER       Nomor pohon dalam baris (1, 2, 3...)
tgl_tanam     DATE          Tanggal tanam (2015-01-01)
petugas       TEXT          Petugas penanaman (nullable)
from_date     TIMESTAMPTZ   Tanggal record dibuat
thru_date     TIMESTAMPTZ   Tanggal record expired (nullable)
kode          VARCHAR       Kode blok (G-14)
catatan       TEXT          Catatan (nullable)
```

**Sample Data:**
```json
{
  "id_npokok": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "id_tanaman": "P-G14-01-01",
  "id_tipe": "SAWIT",
  "n_baris": 1,
  "n_pokok": 1,
  "tgl_tanam": "2015-01-01",
  "kode": "G-14"
}
```

**Row Count:** 3+ rows (active data)

---

### **B. Tabel: `kebun_observasi`** (Data Observasi)

**Status:** ✅ **Table exists but EMPTY**

**Columns:** *(Belum terdeteksi karena tabel kosong)*

**Row Count:** 0 rows

**Note:** Schema belum terlihat, perlu query DDL untuk melihat struktur lengkap

---

## 📋 2. STRUKTUR DATA: tableNDRE.csv

**Source:** Hasil survey drone dengan sensor NDRE (Normalized Difference Red Edge)

**Columns:**
```
DIVISI          VARCHAR       Divisi kebun (AME II)
Blok            VARCHAR       Kode blok pendek (D01)
BLOK_B          VARCHAR       Kode blok lengkap (D001A)
T_TANAM         INTEGER       Tahun tanam (2009)
N_BARIS         INTEGER       Nomor baris pohon (1)
N_POKOK         INTEGER       Nomor pohon dalam baris (1-17)
OBJECTID        INTEGER       ID unik pohon dari GIS (167903, 167913...)
NDRE125         FLOAT         Nilai NDRE raw dari sensor (0.386189026)
KlassNDRE12025  VARCHAR       Klasifikasi NDRE ("Stres Berat", "Stres Sedang")
Ket             VARCHAR       Keterangan ("Pokok Utama")
```

**Sample Data:**
```csv
AME II,D01,D001A,2009,1,1,167903,0.386189026,Stres Berat,Pokok Utama
AME II,D01,D001A,2009,1,2,167913,0.423064375,Stres Sedang,Pokok Utama
AME II,D01,D001A,2009,1,3,167935,0.459512596,Stres Sedang,Pokok Utama
```

**Total Rows:** 1,290 rows (1 header + 1,289 data rows)

**Business Context:**
- Survey drone dilakukan untuk deteksi kesehatan pohon
- NDRE value menunjukkan tingkat stress (low value = stress tinggi)
- Klasifikasi: "Stres Berat", "Stres Sedang", "Sehat" (belum terlihat dalam sample)

---

## 🔍 3. ANALISIS MAPPING: tableNDRE.csv → kebun_n_pokok

### **A. Field Matching Analysis**

| tableNDRE.csv Field | kebun_n_pokok Field | Match Type | Notes |
|---------------------|---------------------|------------|-------|
| **N_BARIS** | **n_baris** | ✅ **EXACT MATCH** | Integer, same semantics |
| **N_POKOK** | **n_pokok** | ✅ **EXACT MATCH** | Integer, same semantics |
| **T_TANAM** | **tgl_tanam** | ⚠️ **PARTIAL** | Year (2009) vs Full Date (2015-01-01) |
| **Blok/BLOK_B** | **kode** | ⚠️ **PARTIAL** | "D01"/"D001A" vs "G-14" (format berbeda) |
| **DIVISI** | *(missing)* | ❌ **NO MATCH** | Tidak ada kolom divisi di kebun_n_pokok |
| **OBJECTID** | *(missing)* | ❌ **NO MATCH** | Tidak ada kolom OBJECTID (unique GIS ID) |
| **NDRE125** | *(missing)* | ❌ **NO MATCH** | Tidak ada kolom untuk sensor value |
| **KlassNDRE12025** | *(missing)* | ❌ **NO MATCH** | Tidak ada kolom untuk classification |
| **Ket** | **catatan** | ⚠️ **PARTIAL** | Bisa dipetakan tapi semantics berbeda |

### **B. Primary Key Analysis**

**kebun_n_pokok:**
- Primary Key: `id_npokok` (UUID, auto-generated)
- Natural Key: Kombinasi (`n_baris`, `n_pokok`, `kode`?) - **TIDAK UNIQUE**

**tableNDRE.csv:**
- Natural Key: Kombinasi (`DIVISI`, `Blok`, `N_BARIS`, `N_POKOK`) - **UNIQUE**
- Alternative: `OBJECTID` (unique GIS identifier) - **UNIQUE**

**Problem:** 
- Tidak ada kolom `OBJECTID` di `kebun_n_pokok` untuk matching
- Kombinasi (n_baris, n_pokok) saja TIDAK cukup karena bisa duplikat antar blok

### **C. Data Type Compatibility**

| Field | CSV Type | DB Type | Compatible? | Conversion Needed |
|-------|----------|---------|-------------|-------------------|
| N_BARIS | INTEGER | INTEGER | ✅ YES | No |
| N_POKOK | INTEGER | INTEGER | ✅ YES | No |
| T_TANAM | INTEGER (2009) | DATE | ⚠️ PARTIAL | Convert to YYYY-01-01 |
| NDRE125 | FLOAT | - | ❌ NO COLUMN | Need new column |
| KlassNDRE12025 | VARCHAR | - | ❌ NO COLUMN | Need new column |
| OBJECTID | INTEGER | - | ❌ NO COLUMN | Need new column |

---

## 🔍 4. ANALISIS MAPPING: tableNDRE.csv → kebun_observasi

**Status:** ⚠️ **CANNOT ANALYZE - Table is EMPTY**

**Assumption:** Tabel `kebun_observasi` kemungkinan dirancang untuk:
- Menyimpan data observasi/monitoring (time-series)
- Relasi ke `kebun_n_pokok` via foreign key
- Menyimpan hasil sensor/survey (NDRE, drone data, etc.)

**Recommended Actions:**
1. Query DDL schema dari Supabase:
   ```sql
   SELECT column_name, data_type, is_nullable, column_default
   FROM information_schema.columns
   WHERE table_name = 'kebun_observasi'
   ORDER BY ordinal_position;
   ```

2. Check foreign key constraints:
   ```sql
   SELECT constraint_name, table_name, column_name
   FROM information_schema.key_column_usage
   WHERE table_name = 'kebun_observasi';
   ```

---

## ✅ 5. KESIMPULAN & REKOMENDASI

### **A. Apakah tableNDRE.csv bisa LANGSUNG diterapkan ke kebun_n_pokok?**

**Jawaban:** ❌ **TIDAK BISA LANGSUNG**

**Alasan:**
1. **Missing Critical Columns:**
   - Tidak ada `OBJECTID` (unique GIS identifier)
   - Tidak ada `DIVISI` (division/region)
   - Tidak ada `NDRE125` (sensor value)
   - Tidak ada `KlassNDRE12025` (classification)

2. **Natural Key Mismatch:**
   - CSV: `(DIVISI, Blok, N_BARIS, N_POKOK)` → UNIQUE
   - DB: `(n_baris, n_pokok)` → NOT UNIQUE (bisa duplikat antar blok)

3. **Schema Purpose Mismatch:**
   - `kebun_n_pokok` = Master data pohon (static, 1 row per tree)
   - `tableNDRE.csv` = Survey results (time-series, multiple observations per tree)

### **B. Apakah tableNDRE.csv bisa diterapkan ke kebun_observasi?**

**Jawaban:** ✅ **SANGAT MUNGKIN** (need schema verification)

**Reasoning:**
1. **Tabel `kebun_observasi` kosong** → kemungkinan baru dibuat untuk purpose ini
2. **Naming convention** suggests observation/monitoring data (time-series)
3. **Typical design pattern:**
   ```
   kebun_n_pokok (master) 1 --< many kebun_observasi (observations)
   ```

**Expected Schema (hypothesis):**
```sql
CREATE TABLE kebun_observasi (
  id_observasi UUID PRIMARY KEY,
  id_npokok UUID REFERENCES kebun_n_pokok(id_npokok),  -- FK to master
  tanggal_observasi DATE,
  jenis_observasi VARCHAR,  -- 'DRONE_NDRE', 'MANUAL', etc.
  nilai_observasi JSONB,    -- Flexible storage
  keterangan TEXT
);
```

### **C. Recommended Solution: HYBRID APPROACH**

#### **OPTION 1: Enhance kebun_n_pokok + Use kebun_observasi** ⭐ **RECOMMENDED**

**Step 1: Enhance `kebun_n_pokok` with missing static fields**
```sql
ALTER TABLE kebun_n_pokok
ADD COLUMN IF NOT EXISTS object_id INTEGER UNIQUE,
ADD COLUMN IF NOT EXISTS divisi VARCHAR(50),
ADD COLUMN IF NOT EXISTS blok VARCHAR(20),
ADD COLUMN IF NOT EXISTS blok_detail VARCHAR(20);

-- Create index for fast lookup
CREATE INDEX IF NOT EXISTS idx_kebun_n_pokok_location 
ON kebun_n_pokok (divisi, blok, n_baris, n_pokok);

-- Create unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_kebun_n_pokok_natural_key
ON kebun_n_pokok (divisi, blok, n_baris, n_pokok);
```

**Step 2: Verify/Create `kebun_observasi` schema**
```sql
-- If table doesn't match, create proper structure
CREATE TABLE IF NOT EXISTS kebun_observasi (
  id_observasi UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_npokok UUID NOT NULL REFERENCES kebun_n_pokok(id_npokok),
  tanggal_survey DATE NOT NULL,
  jenis_survey VARCHAR(50) NOT NULL,  -- 'DRONE_NDRE', 'MANUAL_INSPEKSI'
  ndre_value DECIMAL(10, 8),
  ndre_classification VARCHAR(50),    -- 'Stres Berat', 'Stres Sedang', 'Sehat'
  metadata_json JSONB,
  keterangan TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (id_npokok, tanggal_survey, jenis_survey)
);

CREATE INDEX idx_kebun_observasi_npokok ON kebun_observasi(id_npokok);
CREATE INDEX idx_kebun_observasi_survey ON kebun_observasi(tanggal_survey);
CREATE INDEX idx_kebun_observasi_ndre ON kebun_observasi(ndre_value);
```

**Step 3: Import tableNDRE.csv (2-phase process)**

**Phase 1: Populate/Update kebun_n_pokok**
```sql
-- Upsert master data (if not exists)
INSERT INTO kebun_n_pokok (
  object_id, divisi, blok, blok_detail, 
  n_baris, n_pokok, tgl_tanam, id_tipe, kode
)
SELECT 
  OBJECTID as object_id,
  DIVISI as divisi,
  Blok as blok,
  BLOK_B as blok_detail,
  N_BARIS as n_baris,
  N_POKOK as n_pokok,
  (T_TANAM || '-01-01')::DATE as tgl_tanam,
  'SAWIT' as id_tipe,
  BLOK_B as kode
FROM imported_tableNDRE_csv
ON CONFLICT (divisi, blok, n_baris, n_pokok) 
DO UPDATE SET
  object_id = EXCLUDED.object_id,
  blok_detail = EXCLUDED.blok_detail,
  tgl_tanam = EXCLUDED.tgl_tanam;
```

**Phase 2: Insert observation data**
```sql
-- Insert NDRE survey results
INSERT INTO kebun_observasi (
  id_npokok, tanggal_survey, jenis_survey,
  ndre_value, ndre_classification, keterangan
)
SELECT 
  np.id_npokok,
  '2025-01-25'::DATE as tanggal_survey,  -- Survey date (adjust!)
  'DRONE_NDRE' as jenis_survey,
  csv.NDRE125 as ndre_value,
  csv.KlassNDRE12025 as ndre_classification,
  csv.Ket as keterangan
FROM imported_tableNDRE_csv csv
JOIN kebun_n_pokok np ON (
  np.divisi = csv.DIVISI AND
  np.blok = csv.Blok AND
  np.n_baris = csv.N_BARIS AND
  np.n_pokok = csv.N_POKOK
);
```

**Benefits:**
- ✅ Maintains data normalization
- ✅ Supports historical tracking (multiple surveys over time)
- ✅ No data redundancy
- ✅ Scalable for future surveys
- ✅ Uses existing table structure

---

#### **OPTION 2: Create New Dedicated Table** (Alternative)

If `kebun_observasi` schema doesn't fit, create dedicated table:

```sql
CREATE TABLE drone_ndre_survey (
  id_survey UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_npokok UUID REFERENCES kebun_n_pokok(id_npokok),
  object_id INTEGER NOT NULL,  -- From GIS/drone
  tanggal_survey DATE NOT NULL,
  ndre_value DECIMAL(10, 8) NOT NULL,
  ndre_classification VARCHAR(50),
  divisi VARCHAR(50),
  blok VARCHAR(20),
  n_baris INTEGER,
  n_pokok INTEGER,
  keterangan TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (object_id, tanggal_survey)
);
```

**Drawbacks:**
- ⚠️ Data redundancy (divisi, blok, n_baris, n_pokok duplicated)
- ⚠️ Schema proliferation (more tables to maintain)
- ✅ Simpler import (no 2-phase process)
- ✅ Isolated from master data changes

---

## 📋 6. ACTION PLAN - NEXT STEPS

### **IMMEDIATE (Today - Nov 12):**

1. **Query `kebun_observasi` DDL schema:**
   ```sql
   SELECT 
     column_name, 
     data_type, 
     is_nullable, 
     column_default,
     character_maximum_length
   FROM information_schema.columns
   WHERE table_schema = 'public' 
     AND table_name = 'kebun_observasi'
   ORDER BY ordinal_position;
   ```

2. **Check Foreign Key relationships:**
   ```sql
   SELECT
     tc.constraint_name,
     kcu.column_name,
     ccu.table_name AS foreign_table_name,
     ccu.column_name AS foreign_column_name
   FROM information_schema.table_constraints AS tc
   JOIN information_schema.key_column_usage AS kcu
     ON tc.constraint_name = kcu.constraint_name
   JOIN information_schema.constraint_column_usage AS ccu
     ON ccu.constraint_name = tc.constraint_name
   WHERE tc.table_name = 'kebun_observasi'
     AND tc.constraint_type = 'FOREIGN KEY';
   ```

3. **Decision Point:**
   - If `kebun_observasi` schema matches expected pattern → Use OPTION 1
   - If `kebun_observasi` schema doesn't fit → Use OPTION 2

### **SHORT TERM (This Week):**

4. **Enhance `kebun_n_pokok` schema** (add missing columns)
5. **Create import script** for tableNDRE.csv
6. **Test import** with sample data (first 10 rows)
7. **Validate data integrity** (FK constraints, unique constraints)

### **MEDIUM TERM (Next Week):**

8. **Full import** of 1,289 rows
9. **Create API endpoint** for NDRE data retrieval
10. **Update POAC workflow** to use `kebun_observasi` instead of JSONB
11. **Implement SARAN #1** from architecture validation (structured columns)

---

## 🎯 7. EXPECTED OUTCOME

**After Implementation:**

**kebun_n_pokok (Master Data):**
```
1,289 rows (or more if trees already exist)
Columns: id_npokok, object_id, divisi, blok, n_baris, n_pokok, tgl_tanam, ...
Example: (uuid-123, 167903, "AME II", "D01", 1, 1, "2009-01-01", ...)
```

**kebun_observasi (Survey Results):**
```
1,289 rows (first survey)
Columns: id_observasi, id_npokok, tanggal_survey, ndre_value, ndre_classification, ...
Example: (uuid-456, uuid-123, "2025-01-25", 0.386189026, "Stres Berat", ...)
```

**Future Surveys:**
```
2025-02-25: +1,289 rows (second survey)
2025-03-25: +1,289 rows (third survey)
...
Total: 3,867 rows (3 surveys) → Enables trend analysis!
```

**Benefits:**
- ✅ **Proper data normalization** (no redundancy)
- ✅ **Historical tracking** (multiple surveys per tree)
- ✅ **Performance optimization** (indexed queries)
- ✅ **Scalability** (ready for millions of observations)
- ✅ **Data integrity** (FK constraints enforce relationships)
- ✅ **Analytics ready** (time-series analysis, ML training)

---

## 🚨 8. RISKS & MITIGATION

### **Risk 1: Schema Mismatch**
- **Issue:** `kebun_observasi` schema berbeda dari expected
- **Mitigation:** Query DDL first, adapt import script accordingly
- **Fallback:** Use OPTION 2 (create dedicated table)

### **Risk 2: Data Conflict**
- **Issue:** Trees in tableNDRE.csv sudah ada di kebun_n_pokok dengan data berbeda
- **Mitigation:** Use UPSERT (ON CONFLICT DO UPDATE) untuk merge data
- **Validation:** Compare T_TANAM vs tgl_tanam before override

### **Risk 3: Missing Trees**
- **Issue:** Trees dalam survey tidak terdaftar di master
- **Mitigation:** Insert mode (create if not exists)
- **Logging:** Track new trees inserted vs updated

### **Risk 4: Performance**
- **Issue:** 1,289 row import might be slow
- **Mitigation:** Batch insert (chunks of 100 rows), use COPY instead of INSERT
- **Monitoring:** Track import duration, log progress

---

## ✅ 9. SUMMARY

| Question | Answer | Confidence |
|----------|--------|------------|
| Bisa langsung ke `kebun_n_pokok`? | ❌ **TIDAK** | 100% |
| Perlu modifikasi `kebun_n_pokok`? | ✅ **YA** (tambah 4 kolom) | 100% |
| Bisa ke `kebun_observasi`? | ✅ **SANGAT MUNGKIN** | 80% |
| Perlu tabel baru? | ⚠️ **OPTIONAL** (fallback) | 50% |
| Recommended approach? | **HYBRID** (enhance + use existing) | 95% |

**Next Action:** Query `kebun_observasi` schema untuk konfirmasi final! 🎯

---

**END OF ANALYSIS**
