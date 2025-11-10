-- ============================================================
-- DUMMY DATA INJECTION FOR FRONTEND INTERACTIVE DASHBOARD
-- ============================================================
-- Purpose: Populate database with realistic data untuk drill-down features
-- Requirements: PERINTAH_KERJA_BACKEND_Dummy_Data_Injection.md
-- Created: November 10, 2025
-- Version: 1.0
-- ============================================================

-- ============================================================
-- PART 1: CREATE NEW TABLES FOR ENHANCED FEATURES
-- ============================================================

-- Table: sop_compliance_items (SOP Compliance Breakdown)
CREATE TABLE IF NOT EXISTS public.sop_compliance_items (
  id_sop_item UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(50) NOT NULL, -- 'COMPLIANT', 'NON_COMPLIANT', 'PARTIALLY_COMPLIANT'
  score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  reason TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Table: sop_compliance_history (Historical Trend Data)
CREATE TABLE IF NOT EXISTS public.sop_compliance_history (
  id_history UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number INTEGER NOT NULL, -- 1-52
  year INTEGER NOT NULL,
  week_label VARCHAR(50), -- "Week 1", "Week 2", etc
  compliance_percentage DECIMAL(5,2) NOT NULL CHECK (compliance_percentage >= 0 AND compliance_percentage <= 100),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(year, week_number)
);

-- Table: planning_tasks (Detailed Tasks for Validasi, APH, Sanitasi)
CREATE TABLE IF NOT EXISTS public.planning_tasks (
  id_task UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'VALIDASI', 'APH', 'SANITASI'
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'DONE', 'IN_PROGRESS', 'PENDING'
  pic_name VARCHAR(255) NOT NULL, -- Person In Charge
  deadline DATE NOT NULL,
  priority VARCHAR(20) DEFAULT 'MEDIUM', -- 'HIGH', 'MEDIUM', 'LOW'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: planning_blockers (Blockers/Hambatan)
CREATE TABLE IF NOT EXISTS public.planning_blockers (
  id_blocker UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL, -- 'VALIDASI', 'APH', 'SANITASI'
  description TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL, -- 'HIGH', 'MEDIUM', 'LOW'
  status VARCHAR(50) DEFAULT 'OPEN', -- 'OPEN', 'RESOLVED'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sop_items_category ON sop_compliance_items(category);
CREATE INDEX IF NOT EXISTS idx_sop_history_year_week ON sop_compliance_history(year, week_number);
CREATE INDEX IF NOT EXISTS idx_planning_tasks_category ON planning_tasks(category);
CREATE INDEX IF NOT EXISTS idx_planning_tasks_status ON planning_tasks(status);
CREATE INDEX IF NOT EXISTS idx_planning_blockers_category ON planning_blockers(category);
CREATE INDEX IF NOT EXISTS idx_planning_blockers_status ON planning_blockers(status);

-- ============================================================
-- PART 2: INSERT SOP COMPLIANCE ITEMS (Requirement #1)
-- ============================================================

-- Clear existing dummy data
DELETE FROM public.sop_compliance_items WHERE item_name LIKE '%Protocol%' OR item_name LIKE '%APD%';

-- COMPLIANT ITEMS (5-7 items with high scores)
INSERT INTO public.sop_compliance_items (item_name, category, score, reason)
VALUES 
  ('Personal Hygiene', 'COMPLIANT', 95.0, 'Sangat baik dalam menjaga kebersihan pribadi'),
  ('Equipment Sanitasi', 'COMPLIANT', 88.0, 'Penggunaan equipment sanitasi sesuai standar'),
  ('Dokumentasi Kerja', 'COMPLIANT', 92.0, 'Pencatatan aktivitas lengkap dan tertib'),
  ('Penggunaan Masker', 'COMPLIANT', 96.5, 'Konsisten menggunakan masker selama bekerja'),
  ('Hand Washing Protocol', 'COMPLIANT', 90.0, 'Protokol cuci tangan dijalankan dengan baik'),
  ('Safety Briefing', 'COMPLIANT', 87.5, 'Rutin mengikuti briefing keselamatan'),
  ('Tool Maintenance', 'COMPLIANT', 89.0, 'Perawatan alat kerja dilakukan berkala')
ON CONFLICT (item_name) DO UPDATE SET
  category = EXCLUDED.category,
  score = EXCLUDED.score,
  reason = EXCLUDED.reason,
  last_updated = NOW();

-- NON-COMPLIANT ITEMS (3-5 items with low scores)
INSERT INTO public.sop_compliance_items (item_name, category, score, reason)
VALUES 
  ('Waktu Istirahat', 'NON_COMPLIANT', 45.0, 'Sering melebihi waktu istirahat yang ditentukan'),
  ('Penggunaan APD', 'NON_COMPLIANT', 60.0, 'Tidak lengkap menggunakan APD (alat pelindung diri)'),
  ('Kebersihan Area Kerja', 'NON_COMPLIANT', 70.0, 'Perlu peningkatan terutama shift malam'),
  ('Pelaporan Insiden', 'NON_COMPLIANT', 55.0, 'Keterlambatan pelaporan insiden > 24 jam'),
  ('Maintenance Schedule', 'NON_COMPLIANT', 72.0, 'Jadwal maintenance sering terlambat 1-2 hari')
ON CONFLICT (item_name) DO UPDATE SET
  category = EXCLUDED.category,
  score = EXCLUDED.score,
  reason = EXCLUDED.reason,
  last_updated = NOW();

-- PARTIALLY COMPLIANT ITEMS (2-3 items - optional)
INSERT INTO public.sop_compliance_items (item_name, category, score, reason)
VALUES 
  ('Prosedur Sterilisasi', 'PARTIALLY_COMPLIANT', 78.0, 'Kadang skip langkah tertentu saat terburu-buru'),
  ('Chemical Storage', 'PARTIALLY_COMPLIANT', 75.0, 'Penyimpanan bahan kimia perlu lebih terorganisir')
ON CONFLICT (item_name) DO UPDATE SET
  category = EXCLUDED.category,
  score = EXCLUDED.score,
  reason = EXCLUDED.reason,
  last_updated = NOW();

-- ============================================================
-- PART 3: INSERT HISTORICAL TREND DATA (Requirement #2)
-- ============================================================

-- Clear existing history
DELETE FROM public.sop_compliance_history WHERE year = 2025;

-- Insert 8 weeks of historical data (trend naik dengan fluktuasi minor)
INSERT INTO public.sop_compliance_history (year, week_number, week_label, compliance_percentage, recorded_at)
VALUES 
  (2025, 37, 'Week 1', 72.5, NOW() - INTERVAL '7 weeks'),
  (2025, 38, 'Week 2', 75.8, NOW() - INTERVAL '6 weeks'),
  (2025, 39, 'Week 3', 71.2, NOW() - INTERVAL '5 weeks'),
  (2025, 40, 'Week 4', 78.9, NOW() - INTERVAL '4 weeks'),
  (2025, 41, 'Week 5', 76.3, NOW() - INTERVAL '3 weeks'),
  (2025, 42, 'Week 6', 80.1, NOW() - INTERVAL '2 weeks'),
  (2025, 43, 'Week 7', 77.6, NOW() - INTERVAL '1 week'),
  (2025, 44, 'Week 8', 81.4, NOW())
ON CONFLICT (year, week_number) DO UPDATE SET
  week_label = EXCLUDED.week_label,
  compliance_percentage = EXCLUDED.compliance_percentage,
  recorded_at = EXCLUDED.recorded_at;

-- ============================================================
-- PART 4: INSERT PLANNING TASKS (Requirement #3)
-- ============================================================

-- Clear existing tasks
DELETE FROM public.planning_tasks WHERE task_name LIKE 'Persiapan%' OR task_name LIKE 'Review%';

-- VALIDASI TASKS (6 tasks total)
INSERT INTO public.planning_tasks (task_name, category, status, pic_name, deadline, priority, description)
VALUES 
  -- Done tasks (2)
  ('Persiapan Dokumentasi Validasi', 'VALIDASI', 'DONE', 'Ahmad Fauzi', CURRENT_DATE + INTERVAL '5 days', 'HIGH', 'Menyiapkan template dan checklist validasi drone'),
  ('Review Prosedur Validasi', 'VALIDASI', 'DONE', 'Budi Santoso', CURRENT_DATE + INTERVAL '7 days', 'MEDIUM', 'Review SOP validasi drone existing'),
  
  -- In Progress (1)
  ('Training Tim Validasi', 'VALIDASI', 'IN_PROGRESS', 'Citra Dewi', CURRENT_DATE + INTERVAL '10 days', 'HIGH', 'Pelatihan penggunaan software validasi baru'),
  
  -- Pending (3)
  ('Implementasi Sistem Validasi', 'VALIDASI', 'PENDING', 'Dewi Lestari', CURRENT_DATE + INTERVAL '14 days', 'HIGH', 'Deploy sistem validasi ke production'),
  ('Quality Check Validasi', 'VALIDASI', 'PENDING', 'Eko Prasetyo', CURRENT_DATE + INTERVAL '21 days', 'MEDIUM', 'Audit kualitas hasil validasi'),
  ('Testing & Verification', 'VALIDASI', 'PENDING', 'Fitri Handayani', CURRENT_DATE + INTERVAL '25 days', 'MEDIUM', 'Testing sistem validasi end-to-end')
ON CONFLICT DO NOTHING;

-- APH TASKS (5 tasks total)
INSERT INTO public.planning_tasks (task_name, category, status, pic_name, deadline, priority, description)
VALUES 
  -- Done (1)
  ('Inspeksi Fasilitas APH', 'APH', 'DONE', 'Gunawan', CURRENT_DATE + INTERVAL '3 days', 'HIGH', 'Inspeksi cold storage dan handling facility'),
  
  -- In Progress (2)
  ('Update Prosedur Handling', 'APH', 'IN_PROGRESS', 'Hendra Wijaya', CURRENT_DATE + INTERVAL '8 days', 'HIGH', 'Update SOP handling APH sesuai standar baru'),
  ('Sertifikasi Tim APH', 'APH', 'IN_PROGRESS', 'Indah Permata', CURRENT_DATE + INTERVAL '12 days', 'MEDIUM', 'Sertifikasi handling APH dari BPOM'),
  
  -- Pending (2)
  ('Audit Kepatuhan APH', 'APH', 'PENDING', 'Joko Susilo', CURRENT_DATE + INTERVAL '15 days', 'HIGH', 'Internal audit compliance APH'),
  ('Implementasi Cold Chain', 'APH', 'PENDING', 'Kartika Sari', CURRENT_DATE + INTERVAL '20 days', 'HIGH', 'Setup cold chain monitoring system')
ON CONFLICT DO NOTHING;

-- SANITASI TASKS (5 tasks total)
INSERT INTO public.planning_tasks (task_name, category, status, pic_name, deadline, priority, description)
VALUES 
  -- Done (0 tasks)
  
  -- In Progress (1)
  ('Pelatihan Sanitasi Pekerja', 'SANITASI', 'IN_PROGRESS', 'Lukman Hakim', CURRENT_DATE + INTERVAL '6 days', 'HIGH', 'Training prosedur sanitasi untuk tim lapangan'),
  
  -- Pending (4)
  ('Procurement Chemical Sanitasi', 'SANITASI', 'PENDING', 'Maya Safitri', CURRENT_DATE + INTERVAL '10 days', 'HIGH', 'Pengadaan bahan kimia sanitasi premium'),
  ('Setup Monitoring System', 'SANITASI', 'PENDING', 'Nugroho', CURRENT_DATE + INTERVAL '18 days', 'MEDIUM', 'Instalasi IoT monitoring sanitasi'),
  ('Deep Cleaning Schedule', 'SANITASI', 'PENDING', 'Olivia', CURRENT_DATE + INTERVAL '22 days', 'MEDIUM', 'Penjadwalan deep cleaning area kerja'),
  ('Dokumentasi SOP Sanitasi', 'SANITASI', 'PENDING', 'Pandu Wicaksono', CURRENT_DATE + INTERVAL '28 days', 'LOW', 'Dokumentasi lengkap SOP sanitasi')
ON CONFLICT DO NOTHING;

-- ============================================================
-- PART 5: INSERT BLOCKERS (Requirement #4)
-- ============================================================

-- Clear existing blockers
DELETE FROM public.planning_blockers WHERE description LIKE 'Menunggu approval%' OR description LIKE 'Kekurangan%';

-- VALIDASI BLOCKERS (3 items)
INSERT INTO public.planning_blockers (category, description, severity, status)
VALUES 
  ('VALIDASI', 'Menunggu approval dari Quality Assurance Department', 'HIGH', 'OPEN'),
  ('VALIDASI', 'Kekurangan personel terlatih untuk validasi', 'MEDIUM', 'OPEN'),
  ('VALIDASI', 'Software validasi belum terintegrasi dengan sistem utama', 'HIGH', 'OPEN')
ON CONFLICT DO NOTHING;

-- APH BLOCKERS (3 items)
INSERT INTO public.planning_blockers (category, description, severity, status)
VALUES 
  ('APH', 'Equipment cold storage masih dalam proses procurement', 'HIGH', 'OPEN'),
  ('APH', 'Sertifikasi halal untuk produk APH pending', 'MEDIUM', 'OPEN'),
  ('APH', 'Koordinasi dengan supplier untuk standar handling belum final', 'LOW', 'OPEN')
ON CONFLICT DO NOTHING;

-- SANITASI BLOCKERS (3 items)
INSERT INTO public.planning_blockers (category, description, severity, status)
VALUES 
  ('SANITASI', 'Budget untuk chemical sanitasi premium belum disetujui', 'MEDIUM', 'OPEN'),
  ('SANITASI', 'Area renovasi menghalangi akses untuk deep cleaning', 'HIGH', 'OPEN'),
  ('SANITASI', 'Training schedule bentrok dengan production deadline', 'MEDIUM', 'OPEN')
ON CONFLICT DO NOTHING;

-- ============================================================
-- PART 6: UPDATE EXISTING TABLES - DEADLINES & RISK LEVELS (Requirement #5)
-- ============================================================

-- Update spk_header dengan deadline yang tidak NULL
UPDATE public.spk_header
SET tanggal_target = CURRENT_DATE + INTERVAL '14 days'
WHERE nama_spk LIKE '%Validasi%' AND tanggal_target IS NULL;

UPDATE public.spk_header
SET tanggal_target = CURRENT_DATE + INTERVAL '20 days'
WHERE nama_spk LIKE '%APH%' AND tanggal_target IS NULL;

UPDATE public.spk_header
SET tanggal_target = CURRENT_DATE + INTERVAL '28 days'
WHERE nama_spk LIKE '%Sanitasi%' OR nama_spk LIKE '%SANITASI%' AND tanggal_target IS NULL;

-- Add risk_level column to spk_header if not exists
ALTER TABLE public.spk_header 
ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20) DEFAULT 'LOW';

-- Update risk levels
UPDATE public.spk_header
SET risk_level = 'MEDIUM'
WHERE nama_spk LIKE '%Validasi%';

UPDATE public.spk_header
SET risk_level = 'HIGH'
WHERE nama_spk LIKE '%APH%';

UPDATE public.spk_header
SET risk_level = 'MEDIUM'
WHERE nama_spk LIKE '%Sanitasi%' OR nama_spk LIKE '%SANITASI%';

-- ============================================================
-- PART 7: VERIFICATION QUERIES
-- ============================================================

-- Verify SOP Compliance Items
SELECT 
  'sop_compliance_items' as table_name,
  category,
  COUNT(*) as total_items,
  ROUND(AVG(score), 2) as avg_score
FROM public.sop_compliance_items
GROUP BY category
ORDER BY category;

-- Verify SOP Compliance History
SELECT 
  'sop_compliance_history' as table_name,
  COUNT(*) as total_weeks,
  MIN(compliance_percentage) as min_compliance,
  MAX(compliance_percentage) as max_compliance,
  ROUND(AVG(compliance_percentage), 2) as avg_compliance
FROM public.sop_compliance_history
WHERE year = 2025;

-- Verify Planning Tasks
SELECT 
  'planning_tasks' as table_name,
  category,
  status,
  COUNT(*) as total_tasks
FROM public.planning_tasks
GROUP BY category, status
ORDER BY category, 
  CASE status 
    WHEN 'DONE' THEN 1 
    WHEN 'IN_PROGRESS' THEN 2 
    WHEN 'PENDING' THEN 3 
  END;

-- Verify Planning Blockers
SELECT 
  'planning_blockers' as table_name,
  category,
  severity,
  COUNT(*) as total_blockers
FROM public.planning_blockers
WHERE status = 'OPEN'
GROUP BY category, severity
ORDER BY category, 
  CASE severity 
    WHEN 'HIGH' THEN 1 
    WHEN 'MEDIUM' THEN 2 
    WHEN 'LOW' THEN 3 
  END;

-- Verify SPK Header Updates
SELECT 
  'spk_header' as table_name,
  COUNT(*) as total_spk,
  COUNT(CASE WHEN tanggal_target IS NOT NULL THEN 1 END) as has_deadline,
  COUNT(CASE WHEN risk_level IS NOT NULL THEN 1 END) as has_risk_level
FROM public.spk_header;

-- ============================================================
-- SUCCESS MESSAGE
-- ============================================================
SELECT 
  '✅ DUMMY DATA INJECTION COMPLETED!' as message,
  (SELECT COUNT(*) FROM sop_compliance_items) as sop_items,
  (SELECT COUNT(*) FROM sop_compliance_history WHERE year = 2025) as history_weeks,
  (SELECT COUNT(*) FROM planning_tasks) as total_tasks,
  (SELECT COUNT(*) FROM planning_blockers WHERE status = 'OPEN') as open_blockers;

-- ============================================================
-- NOTES FOR BACKEND TEAM:
-- ============================================================
-- 
-- 1. Tables Created:
--    - sop_compliance_items (14 records)
--    - sop_compliance_history (8 weeks)
--    - planning_tasks (16 records: 6 Validasi, 5 APH, 5 Sanitasi)
--    - planning_blockers (9 records: 3 per category)
--
-- 2. Existing Tables Updated:
--    - spk_header (added risk_level column, updated deadlines)
--
-- 3. Next Steps:
--    - Update dashboardService.js untuk sop_compliance_breakdown
--    - Update operasionalService.js untuk tasks & blockers
--    - Test API endpoints
--    - Deploy to staging
--
-- 4. API Endpoints yang Perlu Update:
--    - GET /api/v1/dashboard/kpi-eksekutif
--      → Tambah field: sop_compliance_breakdown, tren_kepatuhan_sop (8 weeks)
--    
--    - GET /api/v1/dashboard/operasional
--      → Tambah field: validasi_tasks, aph_tasks, sanitasi_tasks
--      → Tambah field: validasi_blockers, aph_blockers, sanitasi_blockers
--      → Update field: deadline_validasi, deadline_aph, deadline_sanitasi
--      → Update field: risk_level_validasi, risk_level_aph, risk_level_sanitasi
--
-- ============================================================
