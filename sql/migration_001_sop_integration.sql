-- ================================================================
-- MIGRATION 001: SOP Integration with Versioning Support
-- ================================================================
-- Purpose: Integrate SOP (Standard Operating Procedures) dengan SPK
-- Features: Versioning, Compliance Tracking, Historical Data
-- Date: 14 November 2025
-- Author: Backend Team
-- ================================================================

-- ================================================================
-- 1. CREATE SOP MASTER TABLE (with Versioning)
-- ================================================================

CREATE TABLE IF NOT EXISTS public.sop_master (
  -- Primary Key
  id_sop UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- SOP Identity
  sop_code VARCHAR(20) NOT NULL,
  sop_version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
  jenis_kegiatan VARCHAR(50) NOT NULL,
  
  -- SOP Content
  sop_name VARCHAR(255) NOT NULL,
  sop_description TEXT,
  
  -- Checklist Configuration
  checklist_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Operational Metadata
  mandatory_photos INTEGER DEFAULT 4,
  estimated_time_mins INTEGER DEFAULT 15,
  safety_requirements TEXT[],
  tools_required TEXT[],
  
  -- Status & Lifecycle
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  is_active BOOLEAN DEFAULT false,
  
  -- Approval Workflow
  created_by UUID REFERENCES master_pihak(id_pihak),
  approved_by UUID REFERENCES master_pihak(id_pihak),
  approved_at TIMESTAMP,
  deprecated_by UUID REFERENCES master_pihak(id_pihak),
  deprecated_at TIMESTAMP,
  deprecation_reason TEXT,
  
  -- Audit Trail
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(sop_code, sop_version)
);

CREATE INDEX IF NOT EXISTS idx_sop_jenis_kegiatan ON sop_master(jenis_kegiatan, is_active);
CREATE INDEX IF NOT EXISTS idx_sop_code ON sop_master(sop_code);
CREATE INDEX IF NOT EXISTS idx_sop_status ON sop_master(status, is_active);

COMMENT ON TABLE sop_master IS 'Master SOP dengan versioning support';

-- ================================================================
-- 2. ALTER SPK HEADER - Link to SOP
-- ================================================================

ALTER TABLE public.spk_header
ADD COLUMN IF NOT EXISTS id_sop UUID REFERENCES sop_master(id_sop),
ADD COLUMN IF NOT EXISTS sop_version_used VARCHAR(20);

CREATE INDEX IF NOT EXISTS idx_spk_header_id_sop ON spk_header(id_sop);

-- ================================================================
-- 3. CREATE SOP COMPLIANCE LOG TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS public.sop_compliance_log (
  id_compliance UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_log_aktivitas UUID REFERENCES log_aktivitas_5w1h(id_log) ON DELETE CASCADE,
  id_tugas UUID REFERENCES spk_tugas(id_tugas) ON DELETE CASCADE,
  id_sop UUID REFERENCES sop_master(id_sop),
  
  checklist_completed JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  compliance_rate DECIMAL(5,2) NOT NULL DEFAULT 0.0,
  total_items INTEGER NOT NULL DEFAULT 0,
  completed_items INTEGER NOT NULL DEFAULT 0,
  mandatory_items INTEGER NOT NULL DEFAULT 0,
  mandatory_completed INTEGER NOT NULL DEFAULT 0,
  
  photos_uploaded INTEGER NOT NULL DEFAULT 0,
  photos_required INTEGER NOT NULL DEFAULT 0,
  
  completion_time_mins INTEGER,
  estimated_time_mins INTEGER,
  
  surveyor_notes TEXT,
  issues_encountered TEXT[],
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_log_tugas ON sop_compliance_log(id_tugas);
CREATE INDEX IF NOT EXISTS idx_compliance_log_sop ON sop_compliance_log(id_sop);

-- ================================================================
-- 4. CREATE SOP VERSION HISTORY TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS public.sop_version_history (
  id_history UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_sop UUID REFERENCES sop_master(id_sop) ON DELETE CASCADE,
  
  old_version VARCHAR(20),
  new_version VARCHAR(20) NOT NULL,
  change_type VARCHAR(20) NOT NULL,
  
  changes_summary TEXT,
  changes_detail JSONB,
  
  changed_by UUID REFERENCES master_pihak(id_pihak),
  changed_at TIMESTAMP DEFAULT NOW(),
  
  approved_by UUID REFERENCES master_pihak(id_pihak),
  approved_at TIMESTAMP,
  
  affected_spk_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_version_history_sop ON sop_version_history(id_sop, changed_at DESC);

-- ================================================================
-- 5. CREATE VIEWS
-- ================================================================

CREATE OR REPLACE VIEW v_sop_active AS
SELECT 
  id_sop, sop_code, sop_version, jenis_kegiatan, sop_name,
  checklist_items, mandatory_photos, estimated_time_mins,
  safety_requirements, tools_required, approved_at
FROM sop_master
WHERE is_active = true AND status = 'ACTIVE'
ORDER BY jenis_kegiatan, sop_code;

CREATE OR REPLACE VIEW v_sop_compliance_summary AS
SELECT 
  sop.id_sop, sop.sop_code, sop.sop_name, sop.sop_version,
  COUNT(DISTINCT cl.id_tugas) as total_tasks_executed,
  AVG(cl.compliance_rate) as avg_compliance_rate,
  COUNT(CASE WHEN cl.compliance_rate >= 80 THEN 1 END) as tasks_passed,
  COUNT(CASE WHEN cl.compliance_rate < 80 THEN 1 END) as tasks_failed
FROM sop_master sop
LEFT JOIN sop_compliance_log cl ON sop.id_sop = cl.id_sop
WHERE sop.is_active = true
GROUP BY sop.id_sop, sop.sop_code, sop.sop_name, sop.sop_version;

-- ================================================================
-- 6. CREATE TRIGGER FUNCTION
-- ================================================================

CREATE OR REPLACE FUNCTION deprecate_old_sop_version()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true AND NEW.status = 'ACTIVE' THEN
    UPDATE sop_master
    SET 
      is_active = false,
      status = 'DEPRECATED',
      deprecated_at = NOW(),
      deprecation_reason = 'Auto-deprecated: New version ' || NEW.sop_version || ' activated'
    WHERE 
      sop_code = NEW.sop_code 
      AND id_sop != NEW.id_sop 
      AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_deprecate_old_sop ON sop_master;
CREATE TRIGGER trg_deprecate_old_sop
  AFTER UPDATE OF is_active, status ON sop_master
  FOR EACH ROW
  WHEN (NEW.is_active = true AND NEW.status = 'ACTIVE')
  EXECUTE FUNCTION deprecate_old_sop_version();

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================

