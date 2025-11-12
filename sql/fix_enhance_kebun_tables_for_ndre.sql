-- ================================================================
-- FIX ENHANCE KEBUN TABLES FOR NDRE DRONE DATA
-- ================================================================
-- Date: November 12, 2025
-- Purpose: FIX kebun_observasi structure + enhance both tables
-- Strategy: Drop and recreate kebun_observasi (safe - table is empty)
-- ================================================================

-- ================================================================
-- PART 1: ENHANCE kebun_n_pokok (Master Pohon)
-- ================================================================

DO $$
BEGIN
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'ENHANCING kebun_n_pokok - Adding NDRE Support Columns';
  RAISE NOTICE '================================================================';
END $$;

-- 1.1 Add missing columns for location and GIS data
ALTER TABLE kebun_n_pokok
ADD COLUMN IF NOT EXISTS object_id INTEGER,
ADD COLUMN IF NOT EXISTS divisi VARCHAR(50),
ADD COLUMN IF NOT EXISTS blok VARCHAR(20),
ADD COLUMN IF NOT EXISTS blok_detail VARCHAR(20);

-- 1.2 Add comments for documentation
COMMENT ON COLUMN kebun_n_pokok.object_id IS 'Unique GIS object ID from drone/mapping system';
COMMENT ON COLUMN kebun_n_pokok.divisi IS 'Division/Region (e.g., AME II)';
COMMENT ON COLUMN kebun_n_pokok.blok IS 'Block code short (e.g., D01)';
COMMENT ON COLUMN kebun_n_pokok.blok_detail IS 'Block code detailed (e.g., D001A)';

-- 1.3 Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_kebun_n_pokok_object_id 
ON kebun_n_pokok(object_id) 
WHERE object_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_kebun_n_pokok_location 
ON kebun_n_pokok(divisi, blok, n_baris, n_pokok) 
WHERE divisi IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_kebun_n_pokok_blok_detail 
ON kebun_n_pokok(blok_detail) 
WHERE blok_detail IS NOT NULL;

-- 1.4 Create unique constraint for natural key (optional - comment out if causes conflict)
-- This ensures no duplicate trees with same location
-- Uncomment if you want to enforce uniqueness:
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_kebun_n_pokok_natural_key
-- ON kebun_n_pokok(divisi, blok, n_baris, n_pokok)
-- WHERE divisi IS NOT NULL AND blok IS NOT NULL;

DO $$
BEGIN
  RAISE NOTICE '✅ kebun_n_pokok enhanced successfully!';
  RAISE NOTICE '   - Added: object_id, divisi, blok, blok_detail';
  RAISE NOTICE '   - Created: 3 indexes for performance';
END $$;

-- ================================================================
-- PART 2: FIX kebun_observasi TABLE STRUCTURE
-- ================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'FIXING kebun_observasi - Recreating with correct structure';
  RAISE NOTICE '================================================================';
  RAISE NOTICE '⚠️  WARNING: This will DROP and RECREATE kebun_observasi table!';
  RAISE NOTICE '   (Safe because table is currently empty)';
  RAISE NOTICE '';
END $$;

-- 2.1 Drop existing table (CASCADE to remove dependent objects)
DROP TABLE IF EXISTS kebun_observasi CASCADE;

-- 2.2 Create table with complete correct structure
CREATE TABLE kebun_observasi (
  id_observasi UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_npokok UUID NOT NULL REFERENCES kebun_n_pokok(id_npokok) ON DELETE CASCADE,
  tanggal_survey DATE NOT NULL,
  jenis_survey VARCHAR(50) NOT NULL,
  ndre_value DECIMAL(10, 8),
  ndre_classification VARCHAR(50),
  metadata_json JSONB,
  keterangan TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2.3 Add comments for documentation
COMMENT ON TABLE kebun_observasi IS 'Time-series observation data for trees (drone surveys, manual inspections, etc.)';
COMMENT ON COLUMN kebun_observasi.id_observasi IS 'Primary key (UUID)';
COMMENT ON COLUMN kebun_observasi.id_npokok IS 'Foreign key to kebun_n_pokok (tree master data)';
COMMENT ON COLUMN kebun_observasi.tanggal_survey IS 'Date when observation/survey was conducted';
COMMENT ON COLUMN kebun_observasi.jenis_survey IS 'Survey type: DRONE_NDRE, MANUAL_INSPEKSI, SENSOR, etc.';
COMMENT ON COLUMN kebun_observasi.ndre_value IS 'NDRE sensor value (0-1 range, lower = more stress)';
COMMENT ON COLUMN kebun_observasi.ndre_classification IS 'NDRE classification: Stres Berat, Stres Sedang, Sehat';
COMMENT ON COLUMN kebun_observasi.metadata_json IS 'Flexible JSON storage for additional survey metadata';
COMMENT ON COLUMN kebun_observasi.keterangan IS 'Notes/remarks about the observation';

-- 2.4 Create indexes for performance
CREATE INDEX idx_kebun_observasi_npokok 
ON kebun_observasi(id_npokok);

CREATE INDEX idx_kebun_observasi_survey_date 
ON kebun_observasi(tanggal_survey DESC);

CREATE INDEX idx_kebun_observasi_jenis 
ON kebun_observasi(jenis_survey);

CREATE INDEX idx_kebun_observasi_ndre_value 
ON kebun_observasi(ndre_value) 
WHERE ndre_value IS NOT NULL;

CREATE INDEX idx_kebun_observasi_classification 
ON kebun_observasi(ndre_classification) 
WHERE ndre_classification IS NOT NULL;

-- 2.5 Create composite index for common queries
CREATE INDEX idx_kebun_observasi_survey_lookup 
ON kebun_observasi(jenis_survey, tanggal_survey DESC, id_npokok);

-- 2.6 Create unique constraint to prevent duplicate observations
CREATE UNIQUE INDEX idx_kebun_observasi_unique_survey
ON kebun_observasi(id_npokok, tanggal_survey, jenis_survey);

-- 2.7 Create updated_at trigger (auto-update timestamp)
CREATE OR REPLACE FUNCTION update_kebun_observasi_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_kebun_observasi_updated_at
BEFORE UPDATE ON kebun_observasi
FOR EACH ROW
EXECUTE FUNCTION update_kebun_observasi_updated_at();

DO $$
BEGIN
  RAISE NOTICE '✅ kebun_observasi created successfully!';
  RAISE NOTICE '   - Columns: id_observasi, id_npokok, tanggal_survey, jenis_survey,';
  RAISE NOTICE '              ndre_value, ndre_classification, metadata_json, keterangan,';
  RAISE NOTICE '              created_at, updated_at';
  RAISE NOTICE '   - Created: 6 indexes for performance';
  RAISE NOTICE '   - Created: Unique constraint (prevent duplicate surveys)';
  RAISE NOTICE '   - Created: Auto-update trigger for updated_at';
END $$;

-- ================================================================
-- PART 3: VERIFICATION
-- ================================================================

DO $$
DECLARE
  v_npokok_columns INTEGER;
  v_observasi_columns INTEGER;
  v_npokok_indexes INTEGER;
  v_observasi_indexes INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '================================================================';
  RAISE NOTICE 'VERIFICATION';
  RAISE NOTICE '================================================================';
  
  -- Count columns in kebun_n_pokok
  SELECT COUNT(*) INTO v_npokok_columns
  FROM information_schema.columns
  WHERE table_name = 'kebun_n_pokok'
    AND column_name IN ('object_id', 'divisi', 'blok', 'blok_detail');
  
  -- Count columns in kebun_observasi
  SELECT COUNT(*) INTO v_observasi_columns
  FROM information_schema.columns
  WHERE table_name = 'kebun_observasi'
    AND column_name IN ('id_npokok', 'ndre_value', 'ndre_classification', 'metadata_json', 'keterangan');
  
  -- Count indexes on kebun_n_pokok
  SELECT COUNT(*) INTO v_npokok_indexes
  FROM pg_indexes
  WHERE tablename = 'kebun_n_pokok'
    AND indexname LIKE 'idx_kebun_n_pokok_%';
  
  -- Count indexes on kebun_observasi
  SELECT COUNT(*) INTO v_observasi_indexes
  FROM pg_indexes
  WHERE tablename = 'kebun_observasi'
    AND indexname LIKE 'idx_kebun_observasi_%';
  
  RAISE NOTICE 'kebun_n_pokok:';
  RAISE NOTICE '  - New columns added: % / 4', v_npokok_columns;
  RAISE NOTICE '  - Indexes created: %', v_npokok_indexes;
  RAISE NOTICE '';
  RAISE NOTICE 'kebun_observasi:';
  RAISE NOTICE '  - Critical columns present: % / 5 (id_npokok, ndre_value, etc.)', v_observasi_columns;
  RAISE NOTICE '  - Indexes created: %', v_observasi_indexes;
  RAISE NOTICE '';
  
  IF v_npokok_columns = 4 AND v_observasi_columns = 5 THEN
    RAISE NOTICE '✅ SUCCESS! All enhancements applied correctly!';
  ELSE
    RAISE WARNING '⚠️  Some columns may already exist or failed to create';
    RAISE NOTICE '    kebun_n_pokok columns: % (expected 4)', v_npokok_columns;
    RAISE NOTICE '    kebun_observasi columns: % (expected 5)', v_observasi_columns;
  END IF;
  
  RAISE NOTICE '================================================================';
END $$;

-- ================================================================
-- PART 4: SAMPLE QUERIES (for testing)
-- ================================================================

-- Show enhanced kebun_n_pokok structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'kebun_n_pokok'
ORDER BY ordinal_position;

-- Show kebun_observasi structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'kebun_observasi'
ORDER BY ordinal_position;

-- Show all indexes on kebun_n_pokok
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'kebun_n_pokok'
ORDER BY indexname;

-- Show all indexes on kebun_observasi
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'kebun_observasi'
ORDER BY indexname;

-- End of fix_enhance_kebun_tables_for_ndre.sql
