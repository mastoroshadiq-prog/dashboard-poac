-- ============================================================================
-- INSERT TEST MANDOR USERS FOR RBAC TESTING
-- ============================================================================
-- Purpose: Create multiple mandor users to test role-based dashboard access
-- Date: 2025-01-XX
-- Note: Uses UUIDs matching those in test scripts (test-rbac-fase1.js)
-- ============================================================================

-- Insert test mandor users with known UUIDs
INSERT INTO master_pihak (id_pihak, nama, tipe, kode_unik, alias) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'Mandor Agus', 'MANDOR', 'MAN001', 'Agus'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Mandor Budi', 'MANDOR', 'MAN002', 'Budi'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Mandor Citra', 'MANDOR', 'MAN003', 'Citra')
ON CONFLICT (id_pihak) DO NOTHING;

-- Verify insertion
SELECT 
  id_pihak,
  nama,
  tipe,
  kode_unik,
  alias
FROM master_pihak
WHERE tipe = 'MANDOR'
ORDER BY nama;
