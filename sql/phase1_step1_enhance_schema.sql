-- ================================================================
-- PHASE 1 - STEP 1: SCHEMA ENHANCEMENT
-- ================================================================
-- Purpose: Add missing FK to link eksekusi → SPK
-- Based on: SkenarioDB_Tahap6_SPK.md recommendation
-- Date: November 10, 2025
-- Author: AI Agent (approved by PM)
-- ================================================================

-- Add id_spk column to ops_eksekusi_tindakan
-- This allows 1 SPK → Many Executions relationship
-- Example: SPK/PANEN/2025/001 → Day 1: 102.5 ton, Day 2: 98.3 ton

ALTER TABLE public.ops_eksekusi_tindakan 
ADD COLUMN IF NOT EXISTS id_spk uuid;

-- Add foreign key constraint
ALTER TABLE public.ops_eksekusi_tindakan
ADD CONSTRAINT fk_eksekusi_spk
  FOREIGN KEY (id_spk)
  REFERENCES public.ops_spk_tindakan(id_spk)
  ON DELETE SET NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.ops_eksekusi_tindakan.id_spk IS 
  'Link to SPK document. Allows tracing: which formal SPK generated this execution record. Per Tahap 6: 1 SPK can have multiple executions.';

-- ================================================================
-- VERIFICATION
-- ================================================================

-- Check if column added successfully
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'ops_eksekusi_tindakan'
  AND column_name = 'id_spk';

-- Check if FK constraint added
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'ops_eksekusi_tindakan'
  AND kcu.column_name = 'id_spk';

-- Expected result:
-- constraint_name: fk_eksekusi_spk
-- foreign_table_name: ops_spk_tindakan
-- foreign_column_name: id_spk

-- ================================================================
-- ROLLBACK (if needed)
-- ================================================================

-- Uncomment these lines if you need to rollback:
-- ALTER TABLE public.ops_eksekusi_tindakan DROP CONSTRAINT IF EXISTS fk_eksekusi_spk;
-- ALTER TABLE public.ops_eksekusi_tindakan DROP COLUMN IF EXISTS id_spk;
