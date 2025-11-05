-- ============================================================
-- VERIFICATION QUERIES - Data Check (Fixed)
-- ============================================================
-- Query untuk melihat data yang ada di database Anda
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Check semua log aktivitas (untuk Lead Time APH & Tren G1)
-- ============================================================
SELECT 
  id_npokok,
  timestamp_eksekusi,
  hasil_json->>'status_aktual' as status_aktual,
  hasil_json->>'tipe_aplikasi' as tipe_aplikasi,
  id_petugas
FROM log_aktivitas_5w1h
ORDER BY timestamp_eksekusi DESC
LIMIT 20;

-- 2. Check G1 Detections
-- ============================================================
SELECT 
  id_npokok,
  timestamp_eksekusi,
  hasil_json->>'status_aktual' as status
FROM log_aktivitas_5w1h
WHERE hasil_json->>'status_aktual' LIKE '%G1%'
ORDER BY timestamp_eksekusi DESC;

-- 3. Check APH Executions
-- ============================================================
SELECT 
  id_npokok,
  timestamp_eksekusi,
  hasil_json->>'tipe_aplikasi' as tipe_aplikasi,
  hasil_json->>'volume_liter' as volume
FROM log_aktivitas_5w1h
WHERE hasil_json->>'tipe_aplikasi' = 'APH'
ORDER BY timestamp_eksekusi DESC;

-- 4. Check Lead Time Calculation (Manual)
-- ============================================================
-- Melihat pasangan G1 detection → APH execution untuk pohon yang sama
WITH g1_logs AS (
  SELECT 
    id_npokok,
    timestamp_eksekusi as g1_detected_at
  FROM log_aktivitas_5w1h
  WHERE hasil_json->>'status_aktual' LIKE '%G1%'
),
aph_logs AS (
  SELECT 
    id_npokok,
    timestamp_eksekusi as aph_executed_at
  FROM log_aktivitas_5w1h
  WHERE hasil_json->>'tipe_aplikasi' = 'APH'
)
SELECT 
  g1.id_npokok,
  g1.g1_detected_at,
  aph.aph_executed_at,
  EXTRACT(EPOCH FROM (aph.aph_executed_at - g1.g1_detected_at)) / 86400 as lead_time_days
FROM g1_logs g1
INNER JOIN aph_logs aph ON g1.id_npokok = aph.id_npokok
WHERE aph.aph_executed_at > g1.g1_detected_at
ORDER BY lead_time_days;

-- 5. Check Status SPK Tugas (untuk Kepatuhan SOP)
-- ============================================================
SELECT 
  status_tugas, 
  COUNT(*) as jumlah
FROM spk_tugas
GROUP BY status_tugas
ORDER BY jumlah DESC;

-- Detail SPK Tugas
SELECT 
  id_tugas,
  tipe_tugas,
  status_tugas,
  id_pelaksana
FROM spk_tugas
ORDER BY tipe_tugas, status_tugas;

-- 6. Check SPK Sanitasi (untuk G4 Aktif / tren_g4_aktif)
-- ============================================================
SELECT 
  id_tugas,
  tipe_tugas,
  status_tugas,
  id_pelaksana,
  target_json
FROM spk_tugas
WHERE tipe_tugas = 'SANITASI'
ORDER BY status_tugas;

-- Count SPK Sanitasi yang belum selesai
SELECT COUNT(*) as g4_aktif_count
FROM spk_tugas
WHERE tipe_tugas = 'SANITASI'
  AND status_tugas IN ('BARU', 'DIKERJAKAN');

-- 7. Check Tren G1 per tanggal (30 hari terakhir)
-- ============================================================
SELECT 
  DATE(timestamp_eksekusi) as tanggal,
  COUNT(*) as jumlah_g1
FROM log_aktivitas_5w1h
WHERE hasil_json->>'status_aktual' LIKE '%G1%'
  AND timestamp_eksekusi >= NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp_eksekusi)
ORDER BY tanggal DESC;

-- 8. Summary - Overview semua KPI/KRI
-- ============================================================
SELECT 
  'Total Logs' as metric,
  COUNT(*)::text as value
FROM log_aktivitas_5w1h

UNION ALL

SELECT 
  'Total SPK Tugas',
  COUNT(*)::text
FROM spk_tugas

UNION ALL

SELECT 
  'Total SPK Header',
  COUNT(*)::text
FROM spk_header

UNION ALL

SELECT 
  'G1 Detections',
  COUNT(*)::text
FROM log_aktivitas_5w1h
WHERE hasil_json->>'status_aktual' LIKE '%G1%'

UNION ALL

SELECT 
  'APH Executions',
  COUNT(*)::text
FROM log_aktivitas_5w1h
WHERE hasil_json->>'tipe_aplikasi' = 'APH'

UNION ALL

SELECT 
  'Sanitasi Tasks (Active)',
  COUNT(*)::text
FROM spk_tugas
WHERE tipe_tugas = 'SANITASI'
  AND status_tugas IN ('BARU', 'DIKERJAKAN')

UNION ALL

SELECT 
  'SPK Selesai',
  COUNT(*)::text
FROM spk_tugas
WHERE status_tugas = 'SELESAI'

UNION ALL

SELECT 
  'SPK Dikerjakan',
  COUNT(*)::text
FROM spk_tugas
WHERE status_tugas = 'DIKERJAKAN';

-- 9. Check struktur tabel (untuk debug)
-- ============================================================
-- Melihat kolom apa saja yang ada di tabel
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('spk_header', 'spk_tugas', 'log_aktivitas_5w1h')
ORDER BY table_name, ordinal_position;

-- ============================================================
-- EXPECTED RESULTS (Berdasarkan Response API Anda):
-- ============================================================
-- kri_lead_time_aph: 2.2 hari
--   → Ada pasangan G1 detection + APH execution dengan selisih 2.2 hari
--
-- kri_kepatuhan_sop: 0%
--   → Tidak ada SPK dengan status SELESAI
--   → Atau semua SPK masih BARU
--
-- tren_insidensi_baru: [{date: "2025-10-27", count: 1}]
--   → Ada 1 deteksi G1 pada tanggal 2025-10-27
--
-- tren_g4_aktif: 0
--   → Tidak ada SPK Sanitasi dengan status BARU atau DIKERJAKAN
--   → Atau tidak ada SPK dengan tipe_tugas = 'SANITASI'
-- ============================================================
