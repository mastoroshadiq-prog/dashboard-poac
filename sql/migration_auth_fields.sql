/**
 * SQL MIGRATION: Add Authentication Fields to master_pihak
 * 
 * RBAC FASE 3: Authentication Setup
 * Tujuan: Tambah kolom username, password_hash, is_active untuk login
 * 
 * RUN THIS IN SUPABASE SQL EDITOR!
 */

-- Step 1: Add new columns to master_pihak table
ALTER TABLE master_pihak 
  ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
  ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Step 2: Add index on username for faster login queries
CREATE INDEX IF NOT EXISTS idx_master_pihak_username ON master_pihak(username);
CREATE INDEX IF NOT EXISTS idx_master_pihak_email ON master_pihak(email);

-- Step 3: Add comments for documentation
COMMENT ON COLUMN master_pihak.username IS 'Username untuk login (unique)';
COMMENT ON COLUMN master_pihak.password_hash IS 'Bcrypt hashed password';
COMMENT ON COLUMN master_pihak.is_active IS 'Status aktif akun (true = aktif, false = nonaktif)';
COMMENT ON COLUMN master_pihak.last_login IS 'Timestamp login terakhir';

-- Step 4: Insert test users for development (with hardcoded passwords)
-- NOTE: In production, use bcrypt.hash() to generate password_hash
-- For now, we'll use NULL and rely on hardcoded passwords in authService.js

-- Update existing users dengan username (if any)
UPDATE master_pihak 
SET username = 'admin', 
    is_active = true,
    role = 'ADMIN'
WHERE nama_pihak ILIKE '%admin%' AND username IS NULL
LIMIT 1;

UPDATE master_pihak 
SET username = 'asisten001', 
    is_active = true,
    role = 'ASISTEN'
WHERE nama_pihak ILIKE '%asisten%' AND username IS NULL
LIMIT 1;

UPDATE master_pihak 
SET username = 'mandor001', 
    is_active = true,
    role = 'MANDOR'
WHERE id_pihak = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10' AND username IS NULL;

-- Step 5: Insert test users if table is empty
INSERT INTO master_pihak (
  id_pihak, 
  nama_pihak, 
  role, 
  username, 
  email, 
  is_active,
  password_hash
) VALUES 
  (
    '11111111-1111-1111-1111-111111111111',
    'Administrator System',
    'ADMIN',
    'admin',
    'admin@keboen.com',
    true,
    NULL  -- Will use hardcoded password: admin123
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Asisten Kebun Utama',
    'ASISTEN',
    'asisten001',
    'asisten@keboen.com',
    true,
    NULL  -- Will use hardcoded password: asisten123
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10',
    'Mandor Agus',
    'MANDOR',
    'mandor001',
    'mandor@keboen.com',
    true,
    NULL  -- Will use hardcoded password: mandor123
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'Pelaksana Budi',
    'PELAKSANA',
    'pelaksana001',
    'pelaksana@keboen.com',
    true,
    NULL  -- Will use hardcoded password: pelaksana123
  )
ON CONFLICT (id_pihak) 
DO UPDATE SET
  username = EXCLUDED.username,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Step 6: Verify test users created
SELECT 
  id_pihak,
  nama_pihak,
  role,
  username,
  email,
  is_active,
  password_hash IS NOT NULL as has_password,
  created_at
FROM master_pihak
WHERE username IN ('admin', 'asisten001', 'mandor001', 'pelaksana001')
ORDER BY role;

-- Step 7: Success message
SELECT 'Authentication fields added to master_pihak successfully!' as message,
       COUNT(*) as test_users_count
FROM master_pihak
WHERE username IS NOT NULL;

-- NOTES FOR PRODUCTION:
-- 1. Generate bcrypt password hash using Node.js:
--    const bcrypt = require('bcrypt');
--    const hash = await bcrypt.hash('your-password', 10);
--
-- 2. Update password_hash:
--    UPDATE master_pihak 
--    SET password_hash = '$2b$10$...' 
--    WHERE username = 'admin';
--
-- 3. Remove hardcoded passwords from authService.js
--
-- 4. Enable RLS (Row Level Security) for production:
--    ALTER TABLE master_pihak ENABLE ROW LEVEL SECURITY;
