# 🔧 TROUBLESHOOTING: Response API Semua Nilai 0

## 🔍 Diagnosis Masalah

Berdasarkan screenshot yang Anda kirim, API endpoint `GET /api/v1/dashboard/kpi_eksekutif` mengembalikan:

```json
{
  "success": true,
  "data": {
    "kri_lead_time_aph": 0,
    "kri_kepatuhan_sop": 0,
    "tren_insidensi_baru": [],
    "tren_g4_aktif": 0
  }
}
```

**Ada 2 Kemungkinan Penyebab:**

### Penyebab 1: Database Kosong ❌
- Tabel belum dibuat
- Data dummy belum di-insert

### Penyebab 2: RLS Policy Blocking ⚠️ **MOST COMMON!**
- Data **ADA** di database ✅
- RLS (Row Level Security) **ENABLED** ✅
- **Tidak ada policy** yang allow anon role untuk read ❌
- Backend pakai anon key → **BLOCKED!**

---

## ✅ SOLUSI A: Fix RLS Policy (Jika Data Sudah Ada)

### Step 1: Cek Apakah Ini Masalah RLS

Jalankan query berikut di Supabase SQL Editor:

```sql
-- Check RLS status
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('spk_header', 'spk_tugas', 'log_aktivitas_5w1h');
```

**Jika `rls_enabled = true` DAN data ada tapi API return 0 → Ini masalah RLS!**

### Step 2: Fix RLS Policy

**OPSI 1: Disable RLS (Development - Paling Mudah)**

Jalankan di Supabase SQL Editor:
```sql
ALTER TABLE public.spk_header DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.spk_tugas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_aktivitas_5w1h DISABLE ROW LEVEL SECURITY;
```

**OPSI 2: Enable RLS + Allow Public Read (Staging - Recommended)**

Jalankan script lengkap di `sql/fix_rls_policy.sql` (OPSI 2)

### Step 3: Verify Fix

```sql
-- Verify RLS disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'log_aktivitas_5w1h';
-- Expected: rowsecurity = false

-- Test data access
SELECT COUNT(*) FROM log_aktivitas_5w1h WHERE id_npokok LIKE 'DUMMY%';
-- Expected: 5 rows
```

### Step 4: Test API

```bash
curl http://localhost:3000/api/v1/dashboard/kpi_eksekutif
```

**Sekarang harus return nilai > 0!** ✅

---

## ✅ SOLUSI B: Insert Dummy Data (Jika Database Kosong)

### Step 1: Buka Supabase SQL Editor

1. Buka https://app.supabase.com
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri
4. Klik **New query**

### Step 2: Copy & Paste SQL Script

1. Buka file: `sql/dummy_data_v1_2.sql`
2. Copy **SEMUA ISI** file tersebut
3. Paste ke SQL Editor di Supabase
4. Klik tombol **RUN** (atau tekan Ctrl+Enter)

### Step 3: Verifikasi Data Berhasil Ter-insert

Jalankan query berikut di SQL Editor:

```sql
-- Check jumlah data
SELECT 'spk_header' as table_name, COUNT(*) as row_count 
FROM spk_header WHERE nama_spk LIKE 'DUMMY%'
UNION ALL
SELECT 'spk_tugas', COUNT(*) 
FROM spk_tugas WHERE id_spk IN (
  SELECT id_spk FROM spk_header WHERE nama_spk LIKE 'DUMMY%'
)
UNION ALL
SELECT 'log_aktivitas_5w1h', COUNT(*) 
FROM log_aktivitas_5w1h WHERE id_npokok LIKE 'DUMMY%';
```

**Expected Result:**
```
table_name           | row_count
---------------------|----------
spk_header           | 2
spk_tugas            | 5
log_aktivitas_5w1h   | 5
```

### Step 4: Test API Lagi

Setelah data ter-insert, test kembali endpoint:

```bash
curl http://localhost:3000/api/v1/dashboard/kpi_eksekutif
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "kri_lead_time_aph": 2.0,
    "kri_kepatuhan_sop": 40.0,
    "tren_insidensi_baru": [
      { "date": "2025-10-28", "count": 1 },
      { "date": "2025-10-30", "count": 1 }
    ],
    "tren_g4_aktif": 2,
    "generated_at": "2025-11-05...",
    "filters": {}
  },
  "message": "Data KPI Eksekutif berhasil diambil"
}
```

---

## 🧪 Debug Manual (Optional)

Jika masih mendapat nilai 0 setelah insert data, jalankan script debug:

```bash
node debug-database.js
```

Script ini akan:
- Check koneksi ke Supabase
- Verify apakah tabel ada
- Count jumlah rows di setiap tabel
- Menampilkan sample data

---

## 📊 Expected Values Explained

Berdasarkan dummy data yang di-insert:

### 1. `kri_lead_time_aph: 2.0`
**Perhitungan:**
- Log #2: Deteksi G1 pada pohon DUMMY-P001 di **Hari -8**
- Log #4: Eksekusi APH pada pohon DUMMY-P001 di **Hari -6**
- **Lead Time:** 8 - 6 = **2.0 hari** ✅

### 2. `kri_kepatuhan_sop: 40.0`
**Perhitungan:**
- Total SPK tugas: 5
- Status SELESAI: 2
- Status DIKERJAKAN: 2
- Status BARU: 1
- **Kepatuhan:** 2 / (2 + 2 + 1) = 2/5 = **40.0%** ✅

**Note:** Nilai berbeda dengan dokumentasi (75%) karena kita insert 5 tugas, bukan 4.

### 3. `tren_insidensi_baru`
**Data:**
- Hari -8: 1 deteksi G1 (DUMMY-P001)
- Hari -5: 1 deteksi G1 (DUMMY-P002)
- **Array:** `[{date: "2025-10-28", count: 1}, {date: "2025-10-30", count: 1}]` ✅

### 4. `tren_g4_aktif: 2`
**Perhitungan:**
- SPK Sanitasi dengan status BARU: 1
- SPK Sanitasi dengan status DIKERJAKAN: 1
- **Total:** 1 + 1 = **2** ✅

---

## 🔧 Jika Masih Bermasalah

### Problem 1: Tabel tidak ada

**Error:** `relation "public.spk_header" does not exist`

**Solusi:**
SQL script akan otomatis membuat tabel. Pastikan menjalankan **SEMUA** bagian script, terutama bagian `CREATE TABLE`.

### Problem 2: Permission denied

**Error:** `permission denied for table`

**Solusi:**
Gunakan Supabase SQL Editor (bukan external tool). SQL Editor memiliki permission penuh.

### Problem 3: Duplicate key error

**Error:** `duplicate key value violates unique constraint`

**Solusi:**
Data sudah ter-insert sebelumnya. Uncomment bagian `DELETE` di script untuk clear data lama:

```sql
DELETE FROM log_aktivitas_5w1h WHERE id_npokok LIKE 'DUMMY%';
DELETE FROM spk_tugas WHERE id_spk IN (...);
DELETE FROM spk_header WHERE nama_spk LIKE 'DUMMY%';
```

---

## ✅ Checklist Troubleshooting

- [ ] File `.env` sudah terisi dengan SUPABASE_URL dan SUPABASE_KEY
- [ ] Server berjalan tanpa error (`npm run dev`)
- [ ] `/health` endpoint return "Connected"
- [ ] SQL script `dummy_data_v1_2.sql` sudah dijalankan di Supabase
- [ ] Verifikasi data: 2 rows di spk_header, 5 rows di spk_tugas, 5 rows di log_aktivitas_5w1h
- [ ] Test endpoint `/api/v1/dashboard/kpi_eksekutif` lagi
- [ ] Response menunjukkan nilai > 0

---

## 📞 Next Steps

Setelah data berhasil ter-insert dan API mengembalikan nilai yang benar:

1. **Integrate dengan Frontend Dashboard** (Platform B)
2. **Implement API untuk Sub-Proses 1** (Work Order Management)
3. **Implement API untuk Sub-Proses 2** (Log Aktivitas Upload)

---

*Troubleshooting guide ini membantu mengatasi masalah "semua nilai 0" pada response API*
