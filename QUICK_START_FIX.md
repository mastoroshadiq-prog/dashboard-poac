# 🚀 QUICK START GUIDE - Fix Response Nilai 0

## ❌ Masalah Anda

API endpoint mengembalikan:
```json
{
  "kri_lead_time_aph": 0,
  "kri_kepatuhan_sop": 0,
  "tren_insidensi_baru": [],
  "tren_g4_aktif": 0
}
```

## 🔍 Root Cause

Ada 2 kemungkinan:
1. ❌ Database kosong (belum ada data)
2. ❌ **RLS (Row Level Security) Policy memblokir akses** ← **INI YANG ANDA ALAMI!**

## ✅ Solusi: 2 Langkah Mudah

### STEP 1: Fix RLS Policy ⚠️ PENTING!

**Jika data sudah ada di database tapi API tetap return 0, ini masalah RLS!**

1. **Buka Supabase SQL Editor**
   - https://app.supabase.com → Your Project → SQL Editor → New query

2. **Jalankan SQL Script untuk Fix RLS:**
   - Buka file: `sql/fix_rls_policy.sql`
   - **Copy OPSI 1** (Disable RLS - untuk development):
   ```sql
   ALTER TABLE public.spk_header DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.spk_tugas DISABLE ROW LEVEL SECURITY;
   ALTER TABLE public.log_aktivitas_5w1h DISABLE ROW LEVEL SECURITY;
   ```
   - Paste ke SQL Editor → Klik **RUN**

3. **Verify RLS Status:**
   ```sql
   SELECT tablename, rowsecurity as rls_enabled
   FROM pg_tables 
   WHERE schemaname = 'public' 
     AND tablename IN ('spk_header', 'spk_tugas', 'log_aktivitas_5w1h');
   ```
   
   **Expected:** `rls_enabled = false` untuk semua tabel ✅

---

### STEP 2: Test API Lagi

Buka browser atau Postman:
```
http://localhost:3000/api/v1/dashboard/kpi_eksekutif
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "kri_lead_time_aph": 2.0,          ← BUKAN 0 lagi!
    "kri_kepatuhan_sop": 40.0,         ← BUKAN 0 lagi!
    "tren_insidensi_baru": [           ← BUKAN [] lagi!
      { "date": "2025-10-28", "count": 1 },
      { "date": "2025-10-30", "count": 1 }
    ],
    "tren_g4_aktif": 2,                ← BUKAN 0 lagi!
    "generated_at": "2025-11-05T...",
    "filters": {}
  },
  "message": "Data KPI Eksekutif berhasil diambil"
}
```

---

## 🔐 Penjelasan RLS (Row Level Security)

### Apa itu RLS?
RLS adalah fitur security Supabase yang **membatasi akses data** berdasarkan user/role.

### Mengapa API return 0?
- Database **ada data** ✅
- RLS **enabled** ✅
- **Tapi tidak ada policy** yang allow `anon` role untuk read data ❌
- Backend menggunakan `anon key` → **Blocked by RLS!**

### Solusi untuk Development:
**OPSI 1:** Disable RLS (paling mudah)
```sql
ALTER TABLE public.spk_header DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.spk_tugas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_aktivitas_5w1h DISABLE ROW LEVEL SECURITY;
```

**OPSI 2:** Enable RLS tapi allow public read (lebih aman)
```sql
-- Jalankan script lengkap di: sql/fix_rls_policy.sql (OPSI 2)
CREATE POLICY "Allow public read access" 
ON public.log_aktivitas_5w1h 
FOR SELECT 
TO anon, authenticated
USING (true);
```

### Rekomendasi:
- **Development:** Gunakan OPSI 1 (Disable RLS)
- **Staging:** Gunakan OPSI 2 (RLS + Allow All)
- **Production:** Implement JWT auth + user-based policies

---

## ✅ Verifikasi Data Berhasil Ter-insert

Jalankan query berikut di Supabase SQL Editor:

```sql
-- Check jumlah data dummy
SELECT COUNT(*) as total_dummy_logs
FROM log_aktivitas_5w1h 
WHERE id_npokok LIKE 'DUMMY%';
```

**Expected Result:** `5`

Jika hasilnya 5, berarti data sudah berhasil ter-insert! ✅

---

## 🎯 Penjelasan Mengapa Nilai Berubah

### Sebelum Insert (Nilai 0):
- Database **kosong**
- Tidak ada log aktivitas G1
- Tidak ada log APH
- Tidak ada SPK tugas

### Setelah Insert (Nilai Real):
- **5 rows** di `log_aktivitas_5w1h`
  - 2 deteksi G1 (termasuk DUMMY-P001 di hari -8)
  - 1 eksekusi APH (DUMMY-P001 di hari -6)
  - 1 deteksi G4
  - 1 log normal
- **5 rows** di `spk_tugas`
  - 2 status SELESAI
  - 2 status DIKERJAKAN
  - 1 status BARU

### Perhitungan KPI/KRI:

1. **Lead Time APH = 2.0 hari**
   - G1 detected: Hari -8 (DUMMY-P001)
   - APH executed: Hari -6 (DUMMY-P001)
   - Selisih: 8 - 6 = **2 hari**

2. **Kepatuhan SOP = 40%**
   - SELESAI: 2 tugas
   - Total (SELESAI + DIKERJAKAN + BARU): 5 tugas
   - Persentase: 2/5 = **40%**

3. **Tren Insidensi = 2 entries**
   - Hari -8: 1 deteksi G1
   - Hari -5: 1 deteksi G1

4. **G4 Aktif = 2 tugas**
   - 1 tugas SANITASI status BARU
   - 1 tugas SANITASI status DIKERJAKAN

---

## 🆘 Jika Masih Gagal

### Error: "relation does not exist"
**Solusi:** Pastikan menjalankan **SEMUA** isi script SQL, tidak hanya sebagian.

### Error: "duplicate key value"
**Solusi:** Data sudah pernah di-insert sebelumnya. Uncomment bagian DELETE di script:
```sql
DELETE FROM log_aktivitas_5w1h WHERE id_npokok LIKE 'DUMMY%';
DELETE FROM spk_tugas WHERE id_spk IN (...);
DELETE FROM spk_header WHERE nama_spk LIKE 'DUMMY%';
```

### Masih dapat nilai 0
**Solusi:** Jalankan debug script:
```bash
node debug-database.js
```

---

## 📞 Next Steps

Setelah API mengembalikan nilai yang benar:

1. ✅ **Integrate dengan Frontend**
   - Gunakan contoh code di `docs/API_DASHBOARD_KPI_EKSEKUTIF.md`
   - Render data dengan ApexCharts
   
2. ✅ **Implement API berikutnya**
   - Sub-Proses 1: Work Order Management
   - Sub-Proses 2: Log Aktivitas Upload

---

*Quick start guide ini membantu Anda fix masalah "response nilai 0" dalam 3 langkah mudah*
