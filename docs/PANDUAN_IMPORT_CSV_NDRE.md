# Panduan Import Data NDRE dari Excel/CSV

## 📋 Ringkasan

Dokumen ini menjelaskan cara **efisien** untuk mengekstrak ~1000 baris data dari file Excel NDRE yang berisi ribuan data, lalu mengimportnya ke database Supabase.

---

## 🎯 Tujuan

- Extract **1000 baris pertama** dari Excel NDRE (total ribuan baris)
- Convert ke format CSV
- Import ke database dengan **batch processing** (efisien untuk data besar)
- Hindari timeout dan memory issues

---

## 📊 Opsi Extract Data dari Excel

### **Opsi 1: Manual via Excel** (Paling Mudah) ⭐

**Langkah:**

1. Buka file Excel NDRE
2. **Select baris 1-1001** (1 header + 1000 data)
   - Klik header row (baris 1)
   - Shift + Klik baris 1001
3. **Copy** (Ctrl+C)
4. **Buat workbook baru** → Paste (Ctrl+V)
5. **Save As** → Pilih format **CSV (Comma delimited) (*.csv)**
6. Simpan dengan nama: `tableNDRE_1000.csv`

**Keuntungan:**
- ✅ Tidak perlu install tool tambahan
- ✅ Visual (bisa lihat data yang di-export)
- ✅ Cepat (< 2 menit)

**Kekurangan:**
- ❌ Manual (harus buka Excel setiap kali)
- ❌ Tidak bisa filter data (hanya first 1000)

---

### **Opsi 2: PowerShell Script** (Windows, Otomatis)

**Install Module (sekali saja):**
```powershell
Install-Module -Name ImportExcel -Scope CurrentUser
```

**Script: `extract-ndre-1000.ps1`**
```powershell
# Extract 1000 rows from Excel NDRE to CSV
param(
    [string]$ExcelPath = "D:\data\tableNDRE.xlsx",
    [string]$OutputPath = "D:\backend-keboen\context\tableNDRE_1000.csv",
    [int]$MaxRows = 1000
)

Write-Host "📂 Reading Excel: $ExcelPath" -ForegroundColor Cyan

# Import first 1001 rows (1 header + 1000 data)
$data = Import-Excel -Path $ExcelPath -StartRow 1 -EndRow ($MaxRows + 1)

Write-Host "✅ Loaded $($data.Count) rows" -ForegroundColor Green

# Export to CSV
$data | Export-Csv -Path $OutputPath -NoTypeInformation -Encoding UTF8

Write-Host "✅ Exported to: $OutputPath" -ForegroundColor Green
Write-Host "📊 File size: $((Get-Item $OutputPath).Length / 1KB) KB" -ForegroundColor Yellow
```

**Cara Pakai:**
```powershell
.\extract-ndre-1000.ps1 -ExcelPath "D:\data\tableNDRE.xlsx" -MaxRows 1000
```

**Keuntungan:**
- ✅ Otomatis (sekali klik)
- ✅ Fast (< 10 detik untuk 1000 rows)
- ✅ Bisa diulang tanpa buka Excel

**Kekurangan:**
- ❌ Perlu install module ImportExcel
- ❌ Windows only

---

### **Opsi 3: Python Script** (Cross-platform, Powerful)

**Install Dependencies (sekali saja):**
```bash
pip install pandas openpyxl
```

**Script: `extract-ndre-1000.py`**
```python
#!/usr/bin/env python3
"""
Extract first 1000 rows from Excel NDRE to CSV
"""
import pandas as pd
import sys

def extract_excel_to_csv(excel_path, output_csv, max_rows=1000):
    print(f"📂 Reading Excel: {excel_path}")
    
    # Read only first 1000 rows (efficient, doesn't load entire file)
    df = pd.read_excel(excel_path, nrows=max_rows)
    
    print(f"✅ Loaded {len(df)} rows, {len(df.columns)} columns")
    print(f"   Columns: {', '.join(df.columns)}")
    
    # Export to CSV
    df.to_csv(output_csv, index=False, encoding='utf-8')
    
    print(f"✅ Exported to: {output_csv}")
    print(f"📊 File size: {os.path.getsize(output_csv) / 1024:.2f} KB")

if __name__ == "__main__":
    excel_path = sys.argv[1] if len(sys.argv) > 1 else "D:/data/tableNDRE.xlsx"
    output_csv = sys.argv[2] if len(sys.argv) > 2 else "D:/backend-keboen/context/tableNDRE_1000.csv"
    max_rows = int(sys.argv[3]) if len(sys.argv) > 3 else 1000
    
    extract_excel_to_csv(excel_path, output_csv, max_rows)
```

**Cara Pakai:**
```bash
python extract-ndre-1000.py "D:\data\tableNDRE.xlsx" "context\tableNDRE_1000.csv" 1000
```

**Keuntungan:**
- ✅ Cross-platform (Windows, Linux, Mac)
- ✅ Powerful (bisa filter data berdasarkan kondisi tertentu)
- ✅ Efficient (hanya load data yang diperlukan)

**Kekurangan:**
- ❌ Perlu install Python + dependencies

---

## 🚀 Import CSV ke Database

Setelah mendapatkan file CSV (1000 rows), gunakan script Node.js yang sudah dibuat:

### **Script: `import-ndre-csv.js`**

**Features:**
- ✅ Batch processing (100 rows per batch) → hindari timeout
- ✅ 2-phase process (Master data → Observation data)
- ✅ Progress tracking
- ✅ Error handling
- ✅ Dry-run mode (test tanpa insert)

**Usage:**

```bash
# Dry run (test tanpa insert data)
node import-ndre-csv.js --file=context/tableNDRE_1000.csv --limit=1000 --survey-date=2025-01-25 --dry-run

# Real import
node import-ndre-csv.js --file=context/tableNDRE_1000.csv --limit=1000 --survey-date=2025-01-25

# Custom batch size (default 100)
node import-ndre-csv.js --file=context/tableNDRE_1000.csv --limit=1000 --batch=50 --survey-date=2025-01-25
```

**Parameters:**
- `--file`: Path ke file CSV (default: `context/tableNDRE.csv`)
- `--limit`: Max rows to import (default: 1000)
- `--batch`: Batch size (default: 100)
- `--survey-date`: Tanggal survey (format: YYYY-MM-DD)
- `--dry-run`: Test mode (tidak insert data)

**Output Example:**
```
======================================================================
🚀 NDRE CSV IMPORT - BATCH PROCESSOR
======================================================================

Configuration:
  - File: context/tableNDRE_1000.csv
  - Max Rows: 1000
  - Batch Size: 100
  - Survey Date: 2025-01-25
  - Survey Type: DRONE_NDRE
  - Dry Run: NO (data will be inserted)

📂 Reading CSV: context/tableNDRE_1000.csv
✅ Parsed 1000 total rows, processing 1000 rows

======================================================================
📊 PHASE 1: UPSERT MASTER DATA (kebun_n_pokok)
======================================================================
Processing 1000 rows in 10 batches...
Progress [██████████████████████████████████████████████████] 100% (10/10)
----------------------------------------------------------------------
✅ PHASE 1 COMPLETE
   - Inserted/Updated: 1000
   - Errors: 0
----------------------------------------------------------------------

======================================================================
📊 PHASE 2: INSERT OBSERVATION DATA (kebun_observasi)
======================================================================
Fetching master data to get id_npokok mapping...
Fetching master data [██████████████████████████████████████████████████] 100% (1000/1000)
✅ Fetched 1000 master records
Inserting observation data...
Progress [██████████████████████████████████████████████████] 100% (10/10)
----------------------------------------------------------------------
✅ PHASE 2 COMPLETE
   - Inserted: 1000
   - Skipped (no master): 0
   - Errors: 0
----------------------------------------------------------------------

======================================================================
📊 IMPORT SUMMARY
======================================================================
Total Rows Processed: 1000
Duration: 45.23s

Phase 1 (Master Data):
  - Inserted/Updated: 1000
  - Errors: 0

Phase 2 (Observation Data):
  - Inserted: 1000
  - Skipped: 0
  - Errors: 0

✅ IMPORT SUCCESSFUL!
======================================================================
```

---

## 📋 Workflow Lengkap (End-to-End)

### **Step 1: Execute SQL Enhancement** ✅

```bash
# Login ke Supabase Dashboard
# Buka SQL Editor
# Copy-paste isi file: sql/enhance_kebun_tables_for_ndre.sql
# Execute
```

**Expected Output:**
```sql
✅ Added 4 columns to kebun_n_pokok
✅ Created 3 indexes on kebun_n_pokok
✅ Added 4 columns to kebun_observasi
✅ Created 6 indexes on kebun_observasi
✅ Enhancement complete!
```

---

### **Step 2: Extract 1000 Rows dari Excel** 📊

**Pilih salah satu opsi:**
- ✅ Manual via Excel (paling mudah)
- ✅ PowerShell script (Windows, otomatis)
- ✅ Python script (cross-platform)

**Output:** File `tableNDRE_1000.csv` di folder `context/`

---

### **Step 3: Test Import (Dry Run)** 🧪

```bash
node import-ndre-csv.js --file=context/tableNDRE_1000.csv --limit=1000 --survey-date=2025-01-25 --dry-run
```

**Cek output:**
- ✅ No errors in parsing CSV
- ✅ All batches processed
- ✅ `[DRY RUN]` messages appear

---

### **Step 4: Real Import** 🚀

```bash
node import-ndre-csv.js --file=context/tableNDRE_1000.csv --limit=1000 --survey-date=2025-01-25
```

**Monitor:**
- Phase 1 progress (master data)
- Phase 2 progress (observation data)
- Error count (should be 0)

---

### **Step 5: Verify Data** ✅

**Query 1: Check master data count**
```sql
SELECT COUNT(*) AS total_trees
FROM kebun_n_pokok
WHERE object_id IS NOT NULL;
-- Expected: ~1000 (or more if data already exists)
```

**Query 2: Check observation data count**
```sql
SELECT COUNT(*) AS total_observations
FROM kebun_observasi
WHERE jenis_survey = 'DRONE_NDRE'
  AND tanggal_survey = '2025-01-25';
-- Expected: 1000
```

**Query 3: Sample data**
```sql
SELECT 
  np.divisi,
  np.blok,
  np.n_baris,
  np.n_pokok,
  obs.ndre_value,
  obs.ndre_classification,
  obs.keterangan
FROM kebun_observasi obs
JOIN kebun_n_pokok np ON obs.id_npokok = np.id_npokok
WHERE obs.jenis_survey = 'DRONE_NDRE'
  AND obs.tanggal_survey = '2025-01-25'
ORDER BY obs.ndre_value ASC
LIMIT 10;
-- Expected: 10 rows dengan data NDRE terlengkap
```

**Query 4: Check for duplicates (should be 0)**
```sql
SELECT 
  id_npokok,
  tanggal_survey,
  jenis_survey,
  COUNT(*) AS duplicate_count
FROM kebun_observasi
GROUP BY id_npokok, tanggal_survey, jenis_survey
HAVING COUNT(*) > 1;
-- Expected: 0 rows (unique constraint prevents duplicates)
```

---

## ⚡ Performance Tips

### **Untuk File CSV Sangat Besar (10,000+ rows)**

1. **Increase Batch Size:**
   ```bash
   node import-ndre-csv.js --batch=500 --limit=10000
   ```
   - Default: 100 rows/batch
   - Large batch: 500-1000 rows/batch (faster but more memory)

2. **Split Import into Multiple Files:**
   ```bash
   # Extract 1000 rows per file
   python extract-ndre-1000.py "D:\data\tableNDRE.xlsx" "context\tableNDRE_part1.csv" 1000
   python extract-ndre-1000.py "D:\data\tableNDRE.xlsx" "context\tableNDRE_part2.csv" 1000 --skip-rows=1000
   
   # Import each file
   node import-ndre-csv.js --file=context/tableNDRE_part1.csv --limit=1000
   node import-ndre-csv.js --file=context/tableNDRE_part2.csv --limit=1000
   ```

3. **Use Supabase Local (if available):**
   - Faster than remote database
   - No network latency

---

## 🛠️ Troubleshooting

### **Error: "onConflict column doesn't exist"**

**Cause:** Unique constraint belum dibuat pada tabel `kebun_n_pokok`

**Solution:** Execute SQL untuk create unique constraint:
```sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_kebun_n_pokok_unique_location
ON kebun_n_pokok(divisi, blok, n_baris, n_pokok)
WHERE divisi IS NOT NULL AND blok IS NOT NULL;
```

---

### **Error: "Foreign key violation"**

**Cause:** Data di kebun_observasi reference ke id_npokok yang tidak ada

**Solution:** Script sudah handle ini otomatis (skip jika master tidak ada). Lihat "Skipped" count di Phase 2.

---

### **Import Sangat Lambat (> 5 menit untuk 1000 rows)**

**Possible Causes:**
1. Network latency (remote Supabase)
2. Batch size terlalu kecil
3. Too many indexes (query setiap row)

**Solutions:**
1. Increase batch size: `--batch=500`
2. Use local Supabase instance
3. Temporarily disable indexes during import (advanced)

---

## 📌 Summary

| Method | Time | Skill Level | Best For |
|--------|------|-------------|----------|
| **Manual Excel** | 2 min | Beginner | One-time import |
| **PowerShell** | 1 min | Intermediate | Windows users, automation |
| **Python** | 1 min | Intermediate | Cross-platform, complex filtering |
| **Import Script** | 1-2 min | Intermediate | All scenarios (production-ready) |

**Recommended Workflow:**
1. ✅ Use **Manual Excel** untuk first-time (cepat, mudah)
2. ✅ Use **Python/PowerShell** untuk recurring imports (otomatis)
3. ✅ Always run **dry-run** dulu sebelum real import

---

## 🎯 Next Steps

Setelah import berhasil:

1. ✅ **Validate data** (run verification queries)
2. ✅ **Create dashboard queries** untuk visualisasi NDRE
3. ✅ **Setup RLS policies** untuk kebun_observasi (security)
4. ✅ **Document business logic** (apa arti NDRE < 0.4? Stres Berat?)
5. ✅ **Automate recurring imports** (jika ada survey rutin)

---

**Butuh bantuan?** Check file:
- `import-ndre-csv.js` → Main import script
- `sql/enhance_kebun_tables_for_ndre.sql` → Table enhancement
- `docs/ANALISIS_SKEMA_DRONE_DATA.md` → Technical analysis
- `docs/EXECUTIVE_SUMMARY_DRONE_DATA.md` → Business context

