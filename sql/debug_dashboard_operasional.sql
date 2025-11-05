-- ============================================================
-- DEBUG QUERY - Verify Database State for M-1.2
-- ============================================================
-- Tujuan: Verify data spk_tugas untuk Dashboard Operasional
-- ============================================================

-- 1. VERIFY DATA CORONG (M-2.1)
-- ============================================================
SELECT 
  tipe_tugas,
  status_tugas,
  LENGTH(status_tugas) as status_length,
  COUNT(*) as jumlah
FROM spk_tugas
GROUP BY tipe_tugas, status_tugas
ORDER BY tipe_tugas, status_tugas;

-- Expected (dari user requirement):
-- VALIDASI_DRONE + SELESAI: 2
-- APH + SELESAI: 1
-- SANITASI + SELESAI: 1  ← User expect ini, tapi database?
-- SANITASI + BARU/DIKERJAKAN: 1

-- 2. VERIFY PAPAN PERINGKAT (M-2.2)
-- ============================================================
SELECT 
  id_pelaksana,
  status_tugas,
  LENGTH(status_tugas) as status_length,
  COUNT(*) as jumlah
FROM spk_tugas
GROUP BY id_pelaksana, status_tugas
ORDER BY id_pelaksana, status_tugas;

-- Expected (dari user requirement):
-- uuid-mandor-agus: 2 SELESAI, 2 total → 100%
-- uuid-mandor-eko: 1 SELESAI, 1 total → 100%
-- uuid-tim-sanitasi-a: 1 SELESAI, 2 total → 50%

-- 3. DETAIL PER TASK
-- ============================================================
SELECT 
  id_tugas,
  tipe_tugas,
  status_tugas,
  id_pelaksana,
  CONCAT(
    'Tipe: ', tipe_tugas, 
    ' | Status: "', status_tugas, '"',
    ' | Pelaksana: ', LEFT(id_pelaksana::text, 20)
  ) as summary
FROM spk_tugas
ORDER BY id_pelaksana, tipe_tugas;

-- 4. CHECK EXACT MATCH
-- ============================================================
-- Apakah ada SANITASI yang SELESAI?
SELECT 
  COUNT(*) as sanitasi_selesai_count,
  array_agg(id_tugas) as task_ids
FROM spk_tugas
WHERE tipe_tugas ILIKE '%sanitasi%'
  AND status_tugas ILIKE '%selesai%';

-- Expected: count = 1 (sesuai user requirement)
-- Actual: count = 0? (berdasarkan API result)

-- 5. CHECK PELAKSANA EXACT VALUES
-- ============================================================
SELECT DISTINCT 
  id_pelaksana,
  COUNT(*) as total_tasks
FROM spk_tugas
GROUP BY id_pelaksana
ORDER BY total_tasks DESC;

-- Verify apakah ada UUID yang match dengan:
-- - 'uuid-mandor-agus'
-- - 'uuid-mandor-eko'
-- - 'uuid-tim-sanitasi-a'

-- ============================================================
-- DIAGNOSIS:
-- ============================================================
-- Kemungkinan issue:
-- 1. Dummy data di database berbeda dengan expected (user salah kasih expected)
-- 2. Tipe/status tugas ada whitespace atau case sensitivity issue
-- 3. id_pelaksana beda format (UUID real vs string dummy)
-- ============================================================
