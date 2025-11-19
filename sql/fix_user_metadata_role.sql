-- ============================================================
-- UPDATE USER METADATA - FIX ROLE VIEWER → MANDOR
-- ============================================================
-- Run di Supabase SQL Editor
-- ============================================================

-- Update agus.mandor role dari VIEWER ke MANDOR
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"MANDOR"'
)
WHERE email = 'agus.mandor@keboen.com';

-- Update username juga (jika belum ada)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data,
  '{username}',
  '"agus.mandor"'
)
WHERE email = 'agus.mandor@keboen.com';

-- Update eko.mandor
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"MANDOR"'
  ),
  '{username}',
  '"eko.mandor"'
)
WHERE email = 'eko.mandor@keboen.com';

-- Update asisten.budi
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"ASISTEN"'
  ),
  '{username}',
  '"asisten.budi"'
)
WHERE email = 'asisten.budi@keboen.com';

-- Update admin
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"ADMIN"'
  ),
  '{username}',
  '"admin"'
)
WHERE email = 'admin@keboen.com';

-- Verify
SELECT 
  email,
  raw_user_meta_data->>'username' as username,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users
WHERE email LIKE '%@keboen.com'
ORDER BY email;
