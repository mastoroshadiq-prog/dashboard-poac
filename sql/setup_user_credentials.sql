-- ============================================================
-- SETUP USER CREDENTIALS FOR LOGIN
-- ============================================================
-- Purpose: Add username, password_hash, is_active columns to master_pihak
--          and create login credentials for mandor, asisten, and admin users
-- 
-- Date: November 19, 2025
-- Author: Backend Team
-- ============================================================

BEGIN;

-- 1. Add authentication columns if not exist
ALTER TABLE master_pihak 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create index for faster username lookup
CREATE INDEX IF NOT EXISTS idx_master_pihak_username ON master_pihak(username);
CREATE INDEX IF NOT EXISTS idx_master_pihak_is_active ON master_pihak(is_active);

-- 2. Update existing mandor users with usernames
-- Note: password_hash will be NULL for development mode (use DEV_PASSWORDS in authService.js)

UPDATE master_pihak 
SET 
  username = 'agus.mandor',
  is_active = TRUE,
  updated_at = CURRENT_TIMESTAMP
WHERE id_pihak = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; -- Agus (Mandor Sensus)

UPDATE master_pihak 
SET 
  username = 'eko.mandor',
  is_active = TRUE,
  updated_at = CURRENT_TIMESTAMP
WHERE id_pihak = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'; -- Eko (Mandor APH)

-- 3. Create/Update Asisten Manager user
INSERT INTO master_pihak (
  id_pihak, 
  nama, 
  tipe, 
  kode_unik, 
  username, 
  is_active
)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20',
  'Pak Budi (Asisten Manager)',
  'INTERNAL',
  'ASISTEN_BUDI',
  'asisten.budi',
  TRUE
)
ON CONFLICT (id_pihak) 
DO UPDATE SET 
  username = 'asisten.budi',
  is_active = TRUE,
  updated_at = CURRENT_TIMESTAMP;

-- 4. Create/Update Admin user
INSERT INTO master_pihak (
  id_pihak, 
  nama, 
  tipe, 
  kode_unik, 
  username, 
  is_active
)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a30',
  'System Administrator',
  'INTERNAL',
  'ADMIN_SYSTEM',
  'admin',
  TRUE
)
ON CONFLICT (id_pihak) 
DO UPDATE SET 
  username = 'admin',
  is_active = TRUE,
  updated_at = CURRENT_TIMESTAMP;

-- 5. Verify setup
DO $$
DECLARE
  v_mandor_count INT;
  v_asisten_count INT;
  v_admin_count INT;
BEGIN
  SELECT COUNT(*) INTO v_mandor_count 
  FROM master_pihak 
  WHERE username IN ('agus.mandor', 'eko.mandor') AND is_active = TRUE;
  
  SELECT COUNT(*) INTO v_asisten_count 
  FROM master_pihak 
  WHERE username = 'asisten.budi' AND is_active = TRUE;
  
  SELECT COUNT(*) INTO v_admin_count 
  FROM master_pihak 
  WHERE username = 'admin' AND is_active = TRUE;
  
  RAISE NOTICE '============================================================';
  RAISE NOTICE '✅ USER CREDENTIALS SETUP COMPLETE';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Mandor Users: % (expected: 2)', v_mandor_count;
  RAISE NOTICE 'Asisten Users: % (expected: 1)', v_asisten_count;
  RAISE NOTICE 'Admin Users: % (expected: 1)', v_admin_count;
  RAISE NOTICE '';
  RAISE NOTICE '📋 Development Mode Credentials (password_hash = NULL):';
  RAISE NOTICE '   Username: agus.mandor    | Password: mandor123  | Role: MANDOR';
  RAISE NOTICE '   Username: eko.mandor     | Password: mandor123  | Role: MANDOR';
  RAISE NOTICE '   Username: asisten.budi   | Password: asisten123 | Role: ASISTEN';
  RAISE NOTICE '   Username: admin          | Password: admin123   | Role: ADMIN';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Login Endpoint: POST /api/v1/auth/login';
  RAISE NOTICE '   Body: { "username": "agus.mandor", "password": "mandor123" }';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  PRODUCTION: Set password_hash with bcrypt before deployment!';
  RAISE NOTICE '   UPDATE master_pihak SET password_hash = $2b$10$...';
  RAISE NOTICE '============================================================';
END $$;

COMMIT;

-- ============================================================
-- OPTIONAL: Create test users (Pelaksana/Surveyor)
-- ============================================================

-- Uncomment if you want to create surveyor login accounts
/*
UPDATE master_pihak 
SET 
  username = 'ahmad.fauzi',
  is_active = TRUE
WHERE nama = 'Ahmad Fauzi' AND tipe = 'PEKERJA';

UPDATE master_pihak 
SET 
  username = 'budi.santoso',
  is_active = TRUE
WHERE nama = 'Budi Santoso' AND tipe = 'PEKERJA';

UPDATE master_pihak 
SET 
  username = 'cahyo.wibowo',
  is_active = TRUE
WHERE nama = 'Cahyo Wibowo' AND tipe = 'PEKERJA';
*/

-- ============================================================
-- PASSWORD HASH EXAMPLES (for production)
-- ============================================================
-- To generate bcrypt hash in Node.js:
-- const bcrypt = require('bcrypt');
-- const hash = await bcrypt.hash('yourpassword', 10);
-- 
-- Example hashes (DO NOT USE IN PRODUCTION - generate your own!):
-- 'mandor123'  -> $2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Cn8ck5q.JXLpSsrXuZKYe
-- 'asisten123' -> $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- 'admin123'   -> $2b$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm
--
-- To update password in production:
-- UPDATE master_pihak 
-- SET password_hash = '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Cn8ck5q.JXLpSsrXuZKYe'
-- WHERE username = 'agus.mandor';
