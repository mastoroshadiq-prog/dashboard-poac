# 🚀 PHASE 1 EXECUTION GUIDE - PANEN TRACKING

**Tahap 6 SPK Workflow Implementation**  
**Date:** November 10, 2025  
**Goal:** Implement PANEN (Harvest) tracking using NEW schema (ops_*, sop_*)

---

## 📋 PRE-EXECUTION CHECKLIST

✅ Tim developer sudah create schema di Supabase (ops_*, sop_* tables)  
✅ Backend code sudah updated (operasionalService.js + test script)  
✅ SQL script ready (phase1_ALL_IN_ONE.sql)  

---

## 🎯 STEP-BY-STEP EXECUTION

### **STEP 1: Execute SQL Script in Supabase** (5 minutes)

1. **Open Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
   - Navigate to: **SQL Editor**

2. **Open Combined Script**
   - File: `sql/phase1_ALL_IN_ONE.sql`
   - Copy ENTIRE contents (Ctrl+A, Ctrl+C)

3. **Paste & Run**
   - Create new query in Supabase SQL Editor
   - Paste script
   - Click **RUN** button (or F5)

4. **Verify Execution**
   - Check query results at bottom
   - Should see verification table:
     ```
     phase           | sop_tipe | sop_ref | fase | sub_tindakan | jadwal | spk_docs | executions
     ----------------+----------+---------+------+--------------+--------+----------+------------
     PHASE 1 DATA... | 1        | 4       | 1    | 4            | 1      | 4        | 8
     ```
   
   - Should see detailed execution list (8 rows)
   - Should see SUCCESS MESSAGE at bottom

5. **If Errors Occur:**
   - **Error: "column id_spk already exists"**
     - OK! Script is idempotent, column was added before
     - Continue execution
   
   - **Error: "duplicate key value violates unique constraint"**
     - OK! Data already inserted (script uses ON CONFLICT DO NOTHING)
     - Check verification queries manually
   
   - **Error: "relation does not exist"**
     - ❌ CRITICAL: Tables not created yet
     - Contact tim developer - schema not deployed to Supabase
     - STOP execution

---

### **STEP 2: Verify Data in Supabase** (2 minutes)

Run this query in SQL Editor to double-check:

```sql
-- Verify full workflow chain
SELECT 
  fb.nama_fase,
  st.nama_sub,
  jt.frekuensi,
  spk.nomor_spk,
  spk.lokasi,
  spk.mandor,
  COUNT(et.id_eksekusi_tindakan) as executions
FROM ops_fase_besar fb
JOIN ops_sub_tindakan st ON st.id_fase_besar = fb.id_fase_besar
JOIN ops_jadwal_tindakan jt ON jt.id_sub_tindakan = st.id_sub_tindakan
JOIN ops_spk_tindakan spk ON spk.id_jadwal_tindakan = jt.id_jadwal_tindakan
LEFT JOIN ops_eksekusi_tindakan et ON et.id_spk = spk.id_spk
WHERE fb.nama_fase = 'Pemanenan'
GROUP BY fb.nama_fase, st.nama_sub, jt.frekuensi, spk.nomor_spk, spk.lokasi, spk.mandor
ORDER BY spk.nomor_spk;
```

**Expected Output:**
- 4 rows (SPK/PANEN/2025/001 to 004)
- Each SPK has 2 executions
- nama_fase = 'Pemanenan'
- nama_sub = 'Panen TBS Rotasi Rutin'

---

### **STEP 3: Test Backend API** (3 minutes)

1. **Start Backend Server**
   ```powershell
   cd d:\backend-keboen
   node index.js
   ```
   
   Wait for: `🚀 Server running on port 3000`

2. **Run Test Script**
   ```powershell
   # Open NEW terminal (keep server running)
   node test-panen-api.js
   ```

3. **Check Test Results**
   - Should see: `✅ SUMMARY:` with Total TBS ~895 ton
   - Should see: `✅ BY SPK:` with 4 SPK documents
   - Should see: `✅ WEEKLY BREAKDOWN:` with weekly totals
   - Should see: `🎉 ALL TESTS PASSED!`

4. **If Tests Fail:**
   - **Error: "Cannot find module './config/supabase'"**
     - Check file exists: `config/supabase.js`
     - Verify module.exports syntax
   
   - **Error: "connect ECONNREFUSED"**
     - Supabase connection failed
     - Check `.env` file has correct SUPABASE_URL and SUPABASE_ANON_KEY
   
   - **Data validation failed (TBS < 890 or > 900)**
     - SQL script not fully executed
     - Re-run Step 1 completely
     - Check for partial INSERT errors

---

### **STEP 4: Test API Endpoint Manually** (Optional - 2 minutes)

Using curl or Postman:

```powershell
# GET Dashboard Operasional
curl http://localhost:3000/api/v1/dashboard/operasional `
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response Structure:**
```json
{
  "data_corong": { ... },
  "data_papan_peringkat": [ ... ],
  "kpi_hasil_panen": {
    "summary": {
      "total_ton_tbs": 895.3,
      "avg_reject_persen": 2.16,
      "total_spk": 4,
      "total_executions": 8
    },
    "by_spk": [
      {
        "nomor_spk": "SPK/PANEN/2025/001",
        "lokasi": "Blok A1-A10 (Afdeling 1)",
        "mandor": "Mandor Panen - Joko Susilo",
        "status": "SELESAI",
        "periode": "2025-10-14 s/d 2025-10-18",
        "total_ton": 200.8,
        "avg_reject": 1.95,
        "execution_count": 2,
        "executions": [ ... ]
      },
      { ... 3 more SPKs ... }
    ],
    "weekly_breakdown": [ ... ]
  },
  "generated_at": "2025-11-10T...",
  "filters": {}
}
```

**Key Fields to Verify:**
- ✅ `kpi_hasil_panen` object exists
- ✅ `summary.total_ton_tbs` = ~895
- ✅ `by_spk` array has 4 items
- ✅ Each SPK has `executions` array with 2 items

---

### **STEP 5: Commit Changes** (2 minutes)

```powershell
git add .
git commit -m "feat: implement PANEN tracking with Tahap 6 SPK workflow

- Add id_spk column to ops_eksekusi_tindakan
- Setup master data: SOP Panen (1 tipe + 4 SOPs)
- Setup OPS hierarchy: 1 fase + 4 sub-tindakan + 1 jadwal
- Create 4 SPK documents (SPK/PANEN/2025/001-004)
- Insert 8 harvest executions (895.3 ton total TBS)
- Implement getPanenMetrics() in operasionalService.js
- Add kpi_hasil_panen to dashboard API response
- Create test script for validation

Following Tahap 6 model: SOP → Jadwal → SPK → Eksekusi
Data covers October-November 2025 harvest period
Reject rates: 1.9-2.6% (all within threshold)
"

git push origin main
```

---

## 🎯 SUCCESS CRITERIA

Phase 1 is **COMPLETE** when ALL checkboxes are ✅:

- [ ] SQL script executed successfully in Supabase
- [ ] Verification query shows: 1 SOP tipe, 4 SOP ref, 1 fase, 4 sub-tindakan, 1 jadwal, 4 SPK, 8 executions
- [ ] Test script passes all 7 validations
- [ ] API endpoint returns `kpi_hasil_panen` object
- [ ] Total TBS = ~895 ton
- [ ] Avg Reject = ~2.16%
- [ ] Code committed to GitHub

---

## 🚨 TROUBLESHOOTING GUIDE

### Issue 1: "relation ops_eksekusi_tindakan does not exist"

**Cause:** Schema belum di-deploy ke Supabase oleh tim developer

**Solution:**
1. Confirm dengan PM/team lead
2. Check Supabase → Table Editor → Pastikan ada tables: `ops_fase_besar`, `ops_sub_tindakan`, `ops_jadwal_tindakan`, `ops_spk_tindakan`, `ops_eksekusi_tindakan`
3. Jika tidak ada, minta tim developer deploy schema dulu
4. Reference: `context/ops_schema_supabase.txt`

---

### Issue 2: "permission denied for table ops_eksekusi_tindakan"

**Cause:** RLS (Row Level Security) policies block access

**Solution:**
1. Go to Supabase → Authentication → Policies
2. For tables: `ops_*` and `sop_*`
3. Add policy:
   ```sql
   CREATE POLICY "Allow public read" ON ops_eksekusi_tindakan
   FOR SELECT USING (true);
   
   CREATE POLICY "Allow public insert" ON ops_eksekusi_tindakan
   FOR INSERT WITH CHECK (true);
   ```
4. OR: Temporarily disable RLS for testing:
   ```sql
   ALTER TABLE ops_eksekusi_tindakan DISABLE ROW LEVEL SECURITY;
   ```
   (Re-enable after testing!)

---

### Issue 3: Test script shows "Total TBS = 0"

**Cause:** Data tidak ter-insert atau JOIN query salah

**Debug Steps:**
1. Check raw data:
   ```sql
   SELECT COUNT(*) FROM ops_eksekusi_tindakan;
   -- Expected: 8
   ```

2. Check SPK link:
   ```sql
   SELECT COUNT(*) FROM ops_eksekusi_tindakan WHERE id_spk IS NOT NULL;
   -- Expected: 8
   ```

3. Check hasil field:
   ```sql
   SELECT hasil FROM ops_eksekusi_tindakan LIMIT 3;
   -- Expected: "X ton TBS, reject Y ton (Z%)"
   ```

4. If COUNT = 0, re-run SQL script completely

---

### Issue 4: "Cannot read property 'ops_spk_tindakan' of null"

**Cause:** JOIN query di Supabase client error (nested select syntax)

**Solution:**
1. Check Supabase JS client version: `npm list @supabase/supabase-js`
2. Upgrade if < 2.0: `npm install @supabase/supabase-js@latest`
3. Restart backend: `Ctrl+C`, then `node index.js`

---

## 📊 EXPECTED DATA SUMMARY

After successful execution, database should contain:

**SOP Layer:**
- 1 SOP Tipe: "SOP Panen"
- 4 SOP Referensi: GAP-ISPO-040 (Kriteria), 041 (Sortasi), 040 (Rotasi), 042 (Transportasi)

**OPS Layer:**
- 1 Fase Besar: "Pemanenan" (umur 3-25 tahun)
- 4 Sub-Tindakan: Panen TBS, Sortasi, Angkut, Kirim
- 1 Jadwal Tindakan: 2x per minggu, interval 7 hari

**SPK Documents:**
- SPK/PANEN/2025/001: Oct 14-18, Blok A1-A10, Target 200 ton
- SPK/PANEN/2025/002: Oct 21-25, Blok B1-B10, Target 210 ton
- SPK/PANEN/2025/003: Oct 28-Nov 1, Blok C1-C10, Target 225 ton
- SPK/PANEN/2025/004: Nov 4-8, Blok D1-D10, Target 240 ton

**Execution Records:**
- 8 harvest events across 4 weeks
- Total: 895.3 ton TBS
- Average reject: 2.16%
- 2 teams: Tim Panen 1 (Agus), Tim Panen 2 (Bambang)
- 2 mandor: Joko Susilo, Siti Aminah

---

## 📈 NEXT STEPS (After Phase 1)

Once Phase 1 is complete:

1. **Frontend Integration**
   - Update dashboard UI to show `kpi_hasil_panen`
   - Create chart: Total TBS per SPK (bar chart)
   - Create chart: Weekly trend (line chart)
   - Create table: SPK breakdown with drill-down

2. **Phase 2: VALIDASI Migration**
   - Migrate VALIDASI_DRONE to ops_* schema
   - Create ops_sub_tindakan for "Validasi Hasil Panen"
   - Link to existing drone survey data

3. **Phase 3: APH & SANITASI**
   - Migrate remaining workflows
   - Full deprecation of spk_header/spk_tugas
   - 100% using Tahap 6 model

---

## 🎉 COMPLETION

When all steps above are ✅:

**YOU ARE DONE WITH PHASE 1!** 🚀

Backend now supports:
- ✅ Existing features (Validasi, APH, Sanitasi) using OLD schema
- ✅ NEW feature (Panen) using Tahap 6 model (NEW schema)
- ✅ Hybrid approach working smoothly
- ✅ Foundation for future migrations

**Total implementation time:** ~15 minutes

**Next:** Update frontend to display harvest metrics! 📊

---

**Questions?** Check `context/FINAL_COMPREHENSIVE_ANALYSIS_TAHAP_3_4_6.md` for detailed schema documentation.
