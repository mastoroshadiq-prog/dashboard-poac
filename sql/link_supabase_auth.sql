-- ============================================================
-- LINK SUPABASE AUTH TO MASTER_PIHAK
-- ============================================================
-- Purpose: Connect Supabase Auth users with master_pihak records
-- Run AFTER creating users in Supabase Auth Dashboard
-- 
-- Date: November 19, 2025
-- ============================================================

BEGIN;

-- 1. Add auth_user_id column
ALTER TABLE master_pihak 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_master_pihak_auth_user_id ON master_pihak(auth_user_id);

-- 2. Link Supabase Auth users to master_pihak
-- NOTE: Replace UUID values with actual auth.users.id from Supabase Auth Dashboard

-- Link Agus Mandor
UPDATE master_pihak 
SET auth_user_id = (
  SELECT id FROM auth.users WHERE email = 'agus.mandor@keboen.com' LIMIT 1
)
WHERE username = 'agus.mandor';

-- Link Eko Mandor
UPDATE master_pihak 
SET auth_user_id = (
  SELECT id FROM auth.users WHERE email = 'eko.mandor@keboen.com' LIMIT 1
)
WHERE username = 'eko.mandor';

-- Link Asisten Budi
UPDATE master_pihak 
SET auth_user_id = (
  SELECT id FROM auth.users WHERE email = 'asisten.budi@keboen.com' LIMIT 1
)
WHERE username = 'asisten.budi';

-- Link Admin
UPDATE master_pihak 
SET auth_user_id = (
  SELECT id FROM auth.users WHERE email = 'admin@keboen.com' LIMIT 1
)
WHERE username = 'admin';

-- 3. Verify linkage
SELECT COUNT(*) as linked_count
FROM master_pihak 
WHERE auth_user_id IS NOT NULL 
AND username IN ('agus.mandor', 'eko.mandor', 'asisten.budi', 'admin');

-- Show linked accounts
SELECT 
  mp.username,
  mp.nama,
  au.email,
  mp.auth_user_id
FROM master_pihak mp
JOIN auth.users au ON mp.auth_user_id = au.id
WHERE mp.username IN ('agus.mandor', 'eko.mandor', 'asisten.budi', 'admin');

COMMIT;

-- ============================================================
-- VERIFICATION QUERY
-- ============================================================
-- Run this to check if linkage is successful:
/*
SELECT 
  au.email,
  au.id as auth_user_id,
  mp.username,
  mp.nama,
  mp.id_pihak,
  au.created_at as auth_created_at,
  mp.is_active
FROM auth.users au
LEFT JOIN master_pihak mp ON au.id = mp.auth_user_id
WHERE au.email LIKE '%@keboen.com'
ORDER BY au.email;
*/
