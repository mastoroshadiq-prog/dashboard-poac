/**
 * SQL MIGRATION: Supabase Auth Integration
 * 
 * RBAC FASE 3 (Revised): Link Supabase Auth dengan master_pihak
 * Tujuan: Menghubungkan auth.users dengan master_pihak untuk RBAC granular
 * 
 * RUN THIS IN SUPABASE SQL EDITOR!
 */

-- Step 1: Add auth_user_id column to master_pihak
-- This links master_pihak with Supabase Auth users
ALTER TABLE master_pihak 
  ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Step 2: Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_master_pihak_auth_user_id ON master_pihak(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_master_pihak_email ON master_pihak(email);

-- Step 3: Add comments for documentation
COMMENT ON COLUMN master_pihak.auth_user_id IS 'FK to auth.users (Supabase Auth)';
COMMENT ON COLUMN master_pihak.email IS 'Email untuk login (unique, matches auth.users.email)';
COMMENT ON COLUMN master_pihak.is_active IS 'Status aktif akun (true = aktif, false = nonaktif)';
COMMENT ON COLUMN master_pihak.last_login IS 'Timestamp login terakhir';

-- Step 4: Insert/Update test users
-- These users should be created in Supabase Auth first via Dashboard or API

-- Update existing users dengan email (if any)
UPDATE master_pihak 
SET email = 'admin@keboen.com', 
    is_active = true,
    role = 'ADMIN'
WHERE nama_pihak ILIKE '%admin%' AND email IS NULL
LIMIT 1;

UPDATE master_pihak 
SET email = 'asisten@keboen.com', 
    is_active = true,
    role = 'ASISTEN'
WHERE nama_pihak ILIKE '%asisten%' AND email IS NULL
LIMIT 1;

UPDATE master_pihak 
SET email = 'mandor@keboen.com', 
    is_active = true,
    role = 'MANDOR'
WHERE id_pihak = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10' AND email IS NULL;

-- Step 5: Insert test users if table is empty
INSERT INTO master_pihak (
  id_pihak, 
  nama_pihak, 
  role, 
  email, 
  is_active
) VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    'Administrator System',
    'ADMIN',
    'admin@keboen.com',
    true
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Asisten Kebun Utama',
    'ASISTEN',
    'asisten@keboen.com',
    true
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10',
    'Mandor Agus',
    'MANDOR',
    'mandor@keboen.com',
    true
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'Pelaksana Budi',
    'PELAKSANA',
    'pelaksana@keboen.com',
    true
  )
ON CONFLICT (id_pihak) 
DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Step 6: Verify test users created
SELECT 
  id_pihak,
  nama_pihak,
  role,
  email,
  auth_user_id,
  is_active,
  created_at
FROM master_pihak
WHERE email IS NOT NULL
ORDER BY role;

-- Step 7: Create function to sync user_metadata when user logs in
-- This updates master_pihak.last_login and auth.users.raw_user_meta_data

CREATE OR REPLACE FUNCTION public.handle_auth_user_login()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_login in master_pihak
  UPDATE master_pihak
  SET last_login = now()
  WHERE auth_user_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users for login tracking
-- Note: This requires Supabase dashboard configuration or service role

-- Step 8: Success message
SELECT 
  'Supabase Auth integration migration completed!' as message,
  COUNT(*) as total_users,
  COUNT(CASE WHEN auth_user_id IS NOT NULL THEN 1 END) as linked_to_auth,
  COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as has_email
FROM master_pihak;

-- ==============================================================================
-- NEXT STEPS (Manual in Supabase Dashboard):
-- ==============================================================================
--
-- 1. CREATE SUPABASE AUTH USERS:
--    - Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/auth/users
--    - Click "Add user" → "Create new user"
--    - Email: admin@keboen.com, Password: (your choice)
--    - Email: asisten@keboen.com, Password: (your choice)
--    - Email: mandor@keboen.com, Password: (your choice)
--    - Email: pelaksana@keboen.com, Password: (your choice)
--
-- 2. LINK AUTH USERS TO master_pihak:
--    - After creating Supabase Auth users, get their UUID from auth.users table
--    - Run this SQL to link:
--      UPDATE master_pihak 
--      SET auth_user_id = '<supabase-auth-uuid>' 
--      WHERE email = 'admin@keboen.com';
--
-- 3. SET USER METADATA (Optional but recommended):
--    - In Supabase Dashboard → Auth → Users → Select user → Edit
--    - Add to "User Metadata" JSON:
--      {
--        "role": "ASISTEN",
--        "id_pihak": "22222222-2222-2222-2222-222222222222",
--        "nama_pihak": "Asisten Kebun Utama"
--      }
--
-- 4. TEST LOGIN (Frontend):
--    - Use @supabase/supabase-js client
--    - supabase.auth.signInWithPassword({ email, password })
--    - Token will be automatically managed
--
-- ==============================================================================
-- PRODUCTION NOTES:
-- ==============================================================================
--
-- 1. Enable Email Confirmation (recommended):
--    - Supabase Dashboard → Authentication → Settings
--    - Enable "Confirm email" option
--
-- 2. Configure Email Templates:
--    - Customize "Confirm signup" email template
--    - Customize "Reset password" email template
--
-- 3. Set Password Requirements:
--    - Minimum length: 8 characters (recommended)
--    - Complexity: Upper + lower + number + special char
--
-- 4. Enable RLS (Row Level Security):
--    ALTER TABLE master_pihak ENABLE ROW LEVEL SECURITY;
--    
--    -- Policy: Users can read their own data
--    CREATE POLICY "users_read_own_data" ON master_pihak
--      FOR SELECT USING (auth.uid() = auth_user_id);
--    
--    -- Policy: Admins can read all data
--    CREATE POLICY "admins_read_all" ON master_pihak
--      FOR SELECT USING (
--        auth.jwt() ->> 'role' = 'ADMIN' OR
--        (SELECT role FROM master_pihak WHERE auth_user_id = auth.uid()) = 'ADMIN'
--      );
--
-- 5. Rate Limiting:
--    - Configure in Supabase Dashboard → Settings → API
--    - Recommended: 100 requests per minute per IP
--
-- ==============================================================================
