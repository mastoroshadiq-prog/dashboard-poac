-- ============================================================
-- DEBUG QUERY - Test RLS & Data Access
-- ============================================================
-- Jalankan query ini di Supabase SQL Editor untuk debug
-- ============================================================

-- 1. Check RLS Status (Paling Penting!)
-- ============================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('spk_header', 'spk_tugas', 'log_aktivitas_5w1h')
ORDER BY tablename;

-- Expected: rls_enabled = false untuk semua tabel
-- Jika true → RLS masih blocking!

-- 2. Test Data Access sebagai ANON user
-- ============================================================
-- Ini simulasi query yang dilakukan oleh backend (menggunakan anon key)

SET ROLE anon;

-- Test: Bisa akses spk_tugas?
SELECT COUNT(*) as total_tasks FROM spk_tugas;
-- Expected: 5 (sesuai verification sebelumnya)
-- Jika 0 → RLS BLOCKING!

-- Test: Bisa lihat detail status?
SELECT status_tugas, COUNT(*) 
FROM spk_tugas 
GROUP BY status_tugas;
-- Expected: Ada rows dengan SELESAI = 3

RESET ROLE;

-- 3. Force Disable RLS (Jika masih blocking)
-- ============================================================
ALTER TABLE public.spk_header DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.spk_tugas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_aktivitas_5w1h DISABLE ROW LEVEL SECURITY;

-- 4. Verify Fix
-- ============================================================
SELECT 
  tablename,
  rowsecurity as rls_still_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('spk_header', 'spk_tugas', 'log_aktivitas_5w1h');

-- Expected: rls_still_enabled = false untuk semua

-- 5. Test lagi sebagai ANON
-- ============================================================
SET ROLE anon;

SELECT 
  'spk_tugas' as table_name,
  COUNT(*) as count
FROM spk_tugas

UNION ALL

SELECT 'log_aktivitas_5w1h', COUNT(*)
FROM log_aktivitas_5w1h;

-- Expected: 
-- spk_tugas: 5
-- log_aktivitas_5w1h: 7

RESET ROLE;

-- ============================================================
-- DIAGNOSIS:
-- ============================================================
-- Jika COUNT = 0 saat SET ROLE anon:
--   → RLS masih aktif dan blocking
--   → Jalankan ALTER TABLE DISABLE di atas
--
-- Jika COUNT > 0 saat SET ROLE anon:
--   → RLS sudah disabled
--   → Masalah ada di code logic (bukan RLS)
--
-- ============================================================
