-- ============================================================
-- FIX RLS POLICY - Supabase Row Level Security
-- ============================================================
-- MASALAH: Data ada di database tapi API mengembalikan nilai 0
-- PENYEBAB: RLS (Row Level Security) memblokir akses dari anon key
-- SOLUSI: Disable RLS ATAU buat policy yang allow public read
-- ============================================================

-- OPSI 1: DISABLE RLS (Untuk Development/Testing)
-- ============================================================
-- ⚠️ WARNING: Hanya untuk development! 
-- Untuk production, gunakan OPSI 2 dengan proper policies

ALTER TABLE public.spk_header DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.spk_tugas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_aktivitas_5w1h DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- OPSI 2: ENABLE RLS dengan Policy Allow All (Recommended untuk Testing)
-- ============================================================
-- Gunakan opsi ini jika ingin RLS tetap aktif tapi allow read access

-- Enable RLS (jika belum enabled)
ALTER TABLE public.spk_header ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spk_tugas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_aktivitas_5w1h ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (jika ada)
DROP POLICY IF EXISTS "Allow public read access" ON public.spk_header;
DROP POLICY IF EXISTS "Allow public read access" ON public.spk_tugas;
DROP POLICY IF EXISTS "Allow public read access" ON public.log_aktivitas_5w1h;

DROP POLICY IF EXISTS "Allow public write access" ON public.spk_header;
DROP POLICY IF EXISTS "Allow public write access" ON public.spk_tugas;
DROP POLICY IF EXISTS "Allow public write access" ON public.log_aktivitas_5w1h;

-- Create policies: Allow SELECT untuk semua users (termasuk anon)
CREATE POLICY "Allow public read access" 
ON public.spk_header 
FOR SELECT 
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public read access" 
ON public.spk_tugas 
FOR SELECT 
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public read access" 
ON public.log_aktivitas_5w1h 
FOR SELECT 
TO anon, authenticated
USING (true);

-- Create policies: Allow INSERT untuk testing (optional)
CREATE POLICY "Allow public write access" 
ON public.spk_header 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public write access" 
ON public.spk_tugas 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow public write access" 
ON public.log_aktivitas_5w1h 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- ============================================================
-- OPSI 3: ENABLE RLS dengan Policy Berbasis User (Production Ready)
-- ============================================================
-- Untuk production, gunakan policy yang lebih ketat
-- Uncomment jika sudah implement JWT authentication

-- CREATE POLICY "Users can read own data" 
-- ON public.log_aktivitas_5w1h 
-- FOR SELECT 
-- TO authenticated
-- USING (auth.uid()::text = id_petugas);

-- CREATE POLICY "Managers can read all data" 
-- ON public.log_aktivitas_5w1h 
-- FOR SELECT 
-- TO authenticated
-- USING (
--   EXISTS (
--     SELECT 1 FROM user_roles 
--     WHERE user_id = auth.uid() 
--     AND role IN ('manager', 'admin')
--   )
-- );

-- ============================================================
-- VERIFY POLICIES
-- ============================================================

-- Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('spk_header', 'spk_tugas', 'log_aktivitas_5w1h');

-- Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('spk_header', 'spk_tugas', 'log_aktivitas_5w1h')
ORDER BY tablename, policyname;

-- ============================================================
-- TEST QUERY (Jalankan setelah apply policy)
-- ============================================================

-- Test: Harus return 5 rows jika RLS sudah fix
SELECT COUNT(*) as total_logs
FROM public.log_aktivitas_5w1h 
WHERE id_npokok LIKE 'DUMMY%';

-- Test: Harus return 5 rows
SELECT COUNT(*) as total_tugas
FROM public.spk_tugas;

-- Test: Harus return 2 rows
SELECT COUNT(*) as total_spk
FROM public.spk_header;

-- ============================================================
-- REKOMENDASI
-- ============================================================
-- 
-- UNTUK DEVELOPMENT/TESTING:
-- → Gunakan OPSI 1 (Disable RLS) - Paling mudah
-- 
-- UNTUK STAGING:
-- → Gunakan OPSI 2 (RLS + Allow All) - Balance antara security & testing
-- 
-- UNTUK PRODUCTION:
-- → Gunakan OPSI 3 (RLS + User-based Policy) - Paling aman
-- → Implement JWT authentication di backend
-- → Tambahkan user_id validation di policy
-- 
-- ============================================================
