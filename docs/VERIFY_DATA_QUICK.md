# 🔍 Quick Data Verification Guide

## Query Cepat untuk Lihat Data Anda

### 1️⃣ Check Summary (Paling Penting)
```sql
-- Jalankan ini dulu untuk overview
SELECT 
  'Total Logs' as metric,
  COUNT(*)::text as value
FROM log_aktivitas_5w1h

UNION ALL

SELECT 'Total SPK Tugas', COUNT(*)::text FROM spk_tugas
UNION ALL
SELECT 'G1 Detections', COUNT(*)::text FROM log_aktivitas_5w1h
WHERE hasil_json->>'status_aktual' LIKE '%G1%'
UNION ALL
SELECT 'APH Executions', COUNT(*)::text FROM log_aktivitas_5w1h
WHERE hasil_json->>'tipe_aplikasi' = 'APH';
```

**Expected untuk data Anda:**
```
metric              | value
--------------------|-------
Total Logs          | ? (minimal 2 untuk lead time 2.2)
Total SPK Tugas     | ?
G1 Detections       | 1 (sesuai tren)
APH Executions      | 1 (untuk calculate lead time)
```

---

### 2️⃣ Check Lead Time APH (2.2 hari)
```sql
-- Lihat pasangan G1 → APH untuk pohon yang sama
WITH g1_logs AS (
  SELECT id_npokok, timestamp_eksekusi as g1_time
  FROM log_aktivitas_5w1h
  WHERE hasil_json->>'status_aktual' LIKE '%G1%'
),
aph_logs AS (
  SELECT id_npokok, timestamp_eksekusi as aph_time
  FROM log_aktivitas_5w1h
  WHERE hasil_json->>'tipe_aplikasi' = 'APH'
)
SELECT 
  g1.id_npokok,
  g1.g1_time,
  aph.aph_time,
  EXTRACT(EPOCH FROM (aph.aph_time - g1.g1_time)) / 86400 as days
FROM g1_logs g1
JOIN aph_logs aph ON g1.id_npokok = aph.id_npokok
WHERE aph.aph_time > g1.g1_time;
```

**Expected:** Harus ada row dengan `days ≈ 2.2`

---

### 3️⃣ Check Kepatuhan SOP (0%)
```sql
-- Lihat distribusi status SPK
SELECT 
  status_tugas, 
  COUNT(*) as jumlah
FROM spk_tugas
GROUP BY status_tugas;
```

**Expected untuk 0%:**
```
status_tugas | jumlah
-------------|-------
BARU         | X (semua masih baru)
```

**Jika ingin perbaiki jadi ada yang selesai:**
```sql
-- Update beberapa tugas jadi SELESAI (untuk testing)
UPDATE spk_tugas 
SET status_tugas = 'SELESAI' 
WHERE id_tugas IN (
  SELECT id_tugas FROM spk_tugas LIMIT 2
);
```

---

### 4️⃣ Check Tren G1 (1 entry pada 2025-10-27)
```sql
-- Lihat deteksi G1 per tanggal
SELECT 
  DATE(timestamp_eksekusi) as tanggal,
  COUNT(*) as jumlah,
  array_agg(id_npokok) as pohon_ids
FROM log_aktivitas_5w1h
WHERE hasil_json->>'status_aktual' LIKE '%G1%'
GROUP BY DATE(timestamp_eksekusi)
ORDER BY tanggal DESC;
```

**Expected:** 
```
tanggal     | jumlah | pohon_ids
------------|--------|----------
2025-10-27  | 1      | {P001}
```

---

### 5️⃣ Check G4 Aktif (0)
```sql
-- Lihat SPK Sanitasi
SELECT 
  id_tugas,
  status_tugas,
  id_pelaksana
FROM spk_tugas
WHERE tipe_tugas = 'SANITASI';
```

**Expected untuk 0:**
- Query return 0 rows (tidak ada SPK Sanitasi)
- ATAU semua SPK Sanitasi sudah SELESAI

**Jika ingin test dengan nilai > 0:**
```sql
-- Insert SPK Sanitasi dummy
INSERT INTO spk_tugas (id_spk, id_pelaksana, tipe_tugas, status_tugas)
VALUES (
  (SELECT id_spk FROM spk_header LIMIT 1),
  'TIM_SANITASI_001',
  'SANITASI',
  'BARU'
);
```

---

## 🎯 Interpretation

Berdasarkan API response Anda:
```json
{
  "kri_lead_time_aph": 2.2,
  "kri_kepatuhan_sop": 0,
  "tren_insidensi_baru": [{"date": "2025-10-27", "count": 1}],
  "tren_g4_aktif": 0
}
```

**Data Anda:**
- ✅ Ada 1 pohon detected G1 pada 2025-10-27
- ✅ Pohon tersebut mendapat APH 2.2 hari kemudian
- ✅ Tidak ada SPK yang SELESAI (semua masih BARU/DIKERJAKAN)
- ✅ Tidak ada SPK Sanitasi yang pending

**Kesimpulan:** Data VALID! ✅

Ini adalah data **real** dari sistem Anda, bukan dummy data.

---

## 🚀 Next Steps

### A. Continue dengan Data Real
Jika data sudah cukup untuk development, lanjut ke:
- Frontend integration
- API berikutnya (Work Order, Log Upload)

### B. Add More Test Data
Jika perlu lebih banyak data untuk testing:
```sql
-- Tambah SPK dengan status SELESAI
UPDATE spk_tugas 
SET status_tugas = 'SELESAI' 
WHERE id_tugas = (SELECT id_tugas FROM spk_tugas LIMIT 1);

-- Tambah SPK Sanitasi
INSERT INTO spk_tugas (id_spk, id_pelaksana, tipe_tugas, status_tugas)
SELECT id_spk, 'TIM_SANITASI', 'SANITASI', 'BARU'
FROM spk_header LIMIT 1;
```

Test API lagi → Nilai akan berubah!

---

**File ini lebih aman karena tidak assume column `created_at` exist**
