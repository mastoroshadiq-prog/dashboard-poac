-- ============================================================
-- DUMMY DATA v2.0 - NO NEW TABLES, NO JSONB REQUIRED
-- ============================================================
-- FILOSOFI: Manfaatkan existing schema dengan data relasional murni
-- Untuk: Interactive Drill-Down Dashboard Frontend
-- Tanggal: 10 November 2025
-- ============================================================

-- ============================================================
-- STEP 1: ALTER TABLE (Tambah kolom, BUKAN tabel baru)
-- ============================================================

-- Pastikan kolom dasar ada di spk_header
ALTER TABLE public.spk_header 
  ADD COLUMN IF NOT EXISTS tanggal_target_selesai DATE;

-- Tambah kolom untuk SOP compliance tracking di master_pihak
ALTER TABLE public.master_pihak 
  ADD COLUMN IF NOT EXISTS sop_score DECIMAL(5,2) DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS sop_category VARCHAR(50),
  ADD COLUMN IF NOT EXISTS sop_reason TEXT;

-- Tambah kolom untuk planning metadata di spk_tugas
ALTER TABLE public.spk_tugas 
  ADD COLUMN IF NOT EXISTS task_priority VARCHAR(20) DEFAULT 'MEDIUM',
  ADD COLUMN IF NOT EXISTS task_description TEXT,
  ADD COLUMN IF NOT EXISTS deadline DATE,
  ADD COLUMN IF NOT EXISTS pic_name VARCHAR(255);

-- Tambah kolom untuk risk & blockers di spk_header
ALTER TABLE public.spk_header 
  ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20),
  ADD COLUMN IF NOT EXISTS blocker_description TEXT,
  ADD COLUMN IF NOT EXISTS blocker_severity VARCHAR(20);

-- Tambah kolom untuk historical tracking di spk_header
ALTER TABLE public.spk_header
  ADD COLUMN IF NOT EXISTS week_number INTEGER,
  ADD COLUMN IF NOT EXISTS compliance_percentage DECIMAL(5,2);

-- Add comments for documentation
COMMENT ON COLUMN public.master_pihak.sop_score IS 'SOP Compliance Score (0-100)';
COMMENT ON COLUMN public.master_pihak.sop_category IS 'COMPLIANT, NON_COMPLIANT, PARTIALLY_COMPLIANT';
COMMENT ON COLUMN public.spk_tugas.task_priority IS 'HIGH, MEDIUM, LOW';
COMMENT ON COLUMN public.spk_tugas.deadline IS 'Task deadline date';
COMMENT ON COLUMN public.spk_header.risk_level IS 'HIGH, MEDIUM, LOW, CRITICAL';

-- ============================================================
-- STEP 2: CLEAR OLD DUMMY DATA (Optional)
-- ============================================================
-- Clear dummy data jika script dijalankan ulang
DELETE FROM public.spk_tugas WHERE id_spk IN (
  SELECT id_spk FROM public.spk_header WHERE nama_spk LIKE 'DUMMY%'
);
DELETE FROM public.spk_header WHERE nama_spk LIKE 'DUMMY%';
DELETE FROM public.master_pihak WHERE kode_unik LIKE 'SOP_%' OR kode_unik LIKE 'PIC_%';

-- ============================================================
-- STEP 3: INSERT SOP COMPLIANCE DATA
-- Menggunakan master_pihak sebagai "registry" untuk SOP items
-- ============================================================

-- COMPLIANT ITEMS (7 items, score 87.5-96.5%)
INSERT INTO public.master_pihak (id_pihak, tipe, nama, kode_unik, sop_score, sop_category, sop_reason)
VALUES 
  (gen_random_uuid(), 'SOP_ITEM', 'Personal Hygiene', 'SOP_001', 95.0, 'COMPLIANT', 'Sangat baik dalam menjaga kebersihan pribadi'),
  (gen_random_uuid(), 'SOP_ITEM', 'Equipment Sanitasi', 'SOP_002', 88.0, 'COMPLIANT', 'Perawatan alat sanitasi sangat teratur'),
  (gen_random_uuid(), 'SOP_ITEM', 'Dokumentasi Kerja', 'SOP_003', 92.0, 'COMPLIANT', 'Pencatatan lengkap dan tepat waktu'),
  (gen_random_uuid(), 'SOP_ITEM', 'Penggunaan Masker', 'SOP_004', 96.5, 'COMPLIANT', 'Compliance sempurna untuk penggunaan masker'),
  (gen_random_uuid(), 'SOP_ITEM', 'Hand Washing Protocol', 'SOP_005', 90.0, 'COMPLIANT', 'Protokol cuci tangan diikuti dengan baik'),
  (gen_random_uuid(), 'SOP_ITEM', 'Safety Training Attendance', 'SOP_006', 87.5, 'COMPLIANT', 'Kehadiran training safety tinggi'),
  (gen_random_uuid(), 'SOP_ITEM', 'Chemical Handling', 'SOP_007', 89.0, 'COMPLIANT', 'Penanganan bahan kimia sesuai prosedur');

-- NON-COMPLIANT ITEMS (5 items, score 45-72%)
INSERT INTO public.master_pihak (id_pihak, tipe, nama, kode_unik, sop_score, sop_category, sop_reason)
VALUES 
  (gen_random_uuid(), 'SOP_ITEM', 'Waktu Istirahat', 'SOP_NC_001', 45.0, 'NON_COMPLIANT', 'Sering melebihi waktu istirahat yang ditentukan'),
  (gen_random_uuid(), 'SOP_ITEM', 'Penggunaan APD', 'SOP_NC_002', 60.0, 'NON_COMPLIANT', 'Tidak lengkap menggunakan APD saat bekerja'),
  (gen_random_uuid(), 'SOP_ITEM', 'Kebersihan Area Kerja', 'SOP_NC_003', 70.0, 'NON_COMPLIANT', 'Perlu peningkatan kebersihan shift malam'),
  (gen_random_uuid(), 'SOP_ITEM', 'Pelaporan Insiden', 'SOP_NC_004', 55.0, 'NON_COMPLIANT', 'Keterlambatan pelaporan lebih dari 24 jam'),
  (gen_random_uuid(), 'SOP_ITEM', 'Maintenance Schedule', 'SOP_NC_005', 72.0, 'NON_COMPLIANT', 'Jadwal maintenance sering terlambat 1-2 hari');

-- PARTIALLY COMPLIANT ITEMS (2 items, score 75-78%)
INSERT INTO public.master_pihak (id_pihak, tipe, nama, kode_unik, sop_score, sop_category, sop_reason)
VALUES 
  (gen_random_uuid(), 'SOP_ITEM', 'Temperature Monitoring', 'SOP_PC_001', 75.0, 'PARTIALLY_COMPLIANT', 'Monitoring kadang terlambat di weekend'),
  (gen_random_uuid(), 'SOP_ITEM', 'Stock Rotation FIFO', 'SOP_PC_002', 78.0, 'PARTIALLY_COMPLIANT', 'Implementasi FIFO masih perlu supervisi');

-- ============================================================
-- STEP 4: INSERT HISTORICAL TREND DATA (8 weeks)
-- Menggunakan spk_header untuk menyimpan historical snapshots
-- ============================================================

INSERT INTO public.spk_header (id_spk, nama_spk, id_asisten_pembuat, tanggal_target_selesai, week_number, compliance_percentage)
VALUES 
  (gen_random_uuid(), 'DUMMY_TREND_Week_1', gen_random_uuid(), CURRENT_DATE - INTERVAL '49 days', 1, 72.5),
  (gen_random_uuid(), 'DUMMY_TREND_Week_2', gen_random_uuid(), CURRENT_DATE - INTERVAL '42 days', 2, 75.8),
  (gen_random_uuid(), 'DUMMY_TREND_Week_3', gen_random_uuid(), CURRENT_DATE - INTERVAL '35 days', 3, 71.2),
  (gen_random_uuid(), 'DUMMY_TREND_Week_4', gen_random_uuid(), CURRENT_DATE - INTERVAL '28 days', 4, 78.9),
  (gen_random_uuid(), 'DUMMY_TREND_Week_5', gen_random_uuid(), CURRENT_DATE - INTERVAL '21 days', 5, 76.3),
  (gen_random_uuid(), 'DUMMY_TREND_Week_6', gen_random_uuid(), CURRENT_DATE - INTERVAL '14 days', 6, 80.1),
  (gen_random_uuid(), 'DUMMY_TREND_Week_7', gen_random_uuid(), CURRENT_DATE - INTERVAL '7 days', 7, 77.6),
  (gen_random_uuid(), 'DUMMY_TREND_Week_8', gen_random_uuid(), CURRENT_DATE, 8, 81.4);

-- ============================================================
-- STEP 5: INSERT PIC (Person In Charge) untuk Tasks
-- Menggunakan master_pihak dengan tipe 'PEKERJA'
-- ============================================================

INSERT INTO public.master_pihak (id_pihak, tipe, nama, kode_unik)
VALUES 
  ('11111111-1111-1111-1111-000000000001'::UUID, 'PEKERJA', 'Ahmad Fauzi', 'PIC_001'),
  ('11111111-1111-1111-1111-000000000002'::UUID, 'PEKERJA', 'Budi Santoso', 'PIC_002'),
  ('11111111-1111-1111-1111-000000000003'::UUID, 'PEKERJA', 'Citra Dewi', 'PIC_003'),
  ('11111111-1111-1111-1111-000000000004'::UUID, 'PEKERJA', 'Dewi Lestari', 'PIC_004'),
  ('11111111-1111-1111-1111-000000000005'::UUID, 'PEKERJA', 'Eko Prasetyo', 'PIC_005'),
  ('11111111-1111-1111-1111-000000000006'::UUID, 'PEKERJA', 'Fitri Handayani', 'PIC_006'),
  ('11111111-1111-1111-1111-000000000007'::UUID, 'PEKERJA', 'Gunawan', 'PIC_007'),
  ('11111111-1111-1111-1111-000000000008'::UUID, 'PEKERJA', 'Hendra Wijaya', 'PIC_008'),
  ('11111111-1111-1111-1111-000000000009'::UUID, 'PEKERJA', 'Indah Permata', 'PIC_009'),
  ('11111111-1111-1111-1111-000000000010'::UUID, 'PEKERJA', 'Joko Susilo', 'PIC_010'),
  ('11111111-1111-1111-1111-000000000011'::UUID, 'PEKERJA', 'Kartika Sari', 'PIC_011'),
  ('11111111-1111-1111-1111-000000000012'::UUID, 'PEKERJA', 'Lukman Hakim', 'PIC_012'),
  ('11111111-1111-1111-1111-000000000013'::UUID, 'PEKERJA', 'Maya Safitri', 'PIC_013'),
  ('11111111-1111-1111-1111-000000000014'::UUID, 'PEKERJA', 'Nugroho', 'PIC_014'),
  ('11111111-1111-1111-1111-000000000015'::UUID, 'PEKERJA', 'Olivia', 'PIC_015'),
  ('11111111-1111-1111-1111-000000000016'::UUID, 'PEKERJA', 'Pandu Wicaksono', 'PIC_016');

-- ============================================================
-- STEP 6: INSERT PLANNING TASKS - VALIDASI (6 tasks)
-- Menggunakan spk_tugas dengan metadata lengkap
-- ============================================================

-- SPK Header untuk VALIDASI
INSERT INTO public.spk_header (id_spk, nama_spk, id_asisten_pembuat, tanggal_target_selesai, risk_level)
VALUES 
  ('22222222-2222-2222-2222-000000000001'::UUID, 'DUMMY_Planning_Validasi_2025', gen_random_uuid(), CURRENT_DATE + INTERVAL '14 days', 'MEDIUM');

-- Validasi Tasks
INSERT INTO public.spk_tugas (id_tugas, id_spk, id_pelaksana, tipe_tugas, status_tugas, target_json, task_priority, task_description, deadline, pic_name)
VALUES 
  -- ✅ DONE (2 tasks)
  (gen_random_uuid(), '22222222-2222-2222-2222-000000000001'::UUID, '11111111-1111-1111-1111-000000000001'::UUID, 'VALIDASI_DRONE', 'SELESAI', '{}', 'HIGH', 'Persiapan Dokumentasi Validasi', CURRENT_DATE + INTERVAL '5 days', 'Ahmad Fauzi'),
  (gen_random_uuid(), '22222222-2222-2222-2222-000000000001'::UUID, '11111111-1111-1111-1111-000000000002'::UUID, 'VALIDASI_DRONE', 'SELESAI', '{}', 'MEDIUM', 'Review Prosedur Validasi', CURRENT_DATE + INTERVAL '7 days', 'Budi Santoso'),
  
  -- 🔄 IN PROGRESS (1 task)
  (gen_random_uuid(), '22222222-2222-2222-2222-000000000001'::UUID, '11111111-1111-1111-1111-000000000003'::UUID, 'VALIDASI_DRONE', 'DIKERJAKAN', '{}', 'HIGH', 'Training Tim Validasi', CURRENT_DATE + INTERVAL '10 days', 'Citra Dewi'),
  
  -- ⏳ PENDING (3 tasks)
  (gen_random_uuid(), '22222222-2222-2222-2222-000000000001'::UUID, '11111111-1111-1111-1111-000000000004'::UUID, 'VALIDASI_DRONE', 'BARU', '{}', 'HIGH', 'Implementasi Sistem Validasi', CURRENT_DATE + INTERVAL '14 days', 'Dewi Lestari'),
  (gen_random_uuid(), '22222222-2222-2222-2222-000000000001'::UUID, '11111111-1111-1111-1111-000000000005'::UUID, 'VALIDASI_DRONE', 'BARU', '{}', 'MEDIUM', 'Quality Check Validasi', CURRENT_DATE + INTERVAL '21 days', 'Eko Prasetyo'),
  (gen_random_uuid(), '22222222-2222-2222-2222-000000000001'::UUID, '11111111-1111-1111-1111-000000000006'::UUID, 'VALIDASI_DRONE', 'BARU', '{}', 'LOW', 'Testing & Verification', CURRENT_DATE + INTERVAL '25 days', 'Fitri Handayani');

-- ============================================================
-- STEP 7: INSERT PLANNING TASKS - APH (5 tasks)
-- ============================================================

-- SPK Header untuk APH
INSERT INTO public.spk_header (id_spk, nama_spk, id_asisten_pembuat, tanggal_target_selesai, risk_level)
VALUES 
  ('33333333-3333-3333-3333-000000000001'::UUID, 'DUMMY_Planning_APH_2025', gen_random_uuid(), CURRENT_DATE + INTERVAL '20 days', 'HIGH');

-- APH Tasks
INSERT INTO public.spk_tugas (id_tugas, id_spk, id_pelaksana, tipe_tugas, status_tugas, target_json, task_priority, task_description, deadline, pic_name)
VALUES 
  -- ✅ DONE (1 task)
  (gen_random_uuid(), '33333333-3333-3333-3333-000000000001'::UUID, '11111111-1111-1111-1111-000000000007'::UUID, 'APH', 'SELESAI', '{}', 'HIGH', 'Inspeksi Fasilitas APH', CURRENT_DATE + INTERVAL '3 days', 'Gunawan'),
  
  -- 🔄 IN PROGRESS (2 tasks)
  (gen_random_uuid(), '33333333-3333-3333-3333-000000000001'::UUID, '11111111-1111-1111-1111-000000000008'::UUID, 'APH', 'DIKERJAKAN', '{}', 'HIGH', 'Update Prosedur Handling', CURRENT_DATE + INTERVAL '8 days', 'Hendra Wijaya'),
  (gen_random_uuid(), '33333333-3333-3333-3333-000000000001'::UUID, '11111111-1111-1111-1111-000000000009'::UUID, 'APH', 'DIKERJAKAN', '{}', 'MEDIUM', 'Sertifikasi Tim APH', CURRENT_DATE + INTERVAL '12 days', 'Indah Permata'),
  
  -- ⏳ PENDING (2 tasks)
  (gen_random_uuid(), '33333333-3333-3333-3333-000000000001'::UUID, '11111111-1111-1111-1111-000000000010'::UUID, 'APH', 'BARU', '{}', 'MEDIUM', 'Audit Kepatuhan APH', CURRENT_DATE + INTERVAL '15 days', 'Joko Susilo'),
  (gen_random_uuid(), '33333333-3333-3333-3333-000000000001'::UUID, '11111111-1111-1111-1111-000000000011'::UUID, 'APH', 'BARU', '{}', 'HIGH', 'Implementasi Cold Chain', CURRENT_DATE + INTERVAL '20 days', 'Kartika Sari');

-- ============================================================
-- STEP 8: INSERT PLANNING TASKS - SANITASI (5 tasks)
-- ============================================================

-- SPK Header untuk SANITASI
INSERT INTO public.spk_header (id_spk, nama_spk, id_asisten_pembuat, tanggal_target_selesai, risk_level, blocker_description, blocker_severity)
VALUES 
  ('44444444-4444-4444-4444-000000000001'::UUID, 'DUMMY_Planning_Sanitasi_2025', gen_random_uuid(), CURRENT_DATE + INTERVAL '28 days', 'MEDIUM', 'Menunggu procurement chemical sanitasi', 'HIGH');

-- Sanitasi Tasks
INSERT INTO public.spk_tugas (id_tugas, id_spk, id_pelaksana, tipe_tugas, status_tugas, target_json, task_priority, task_description, deadline, pic_name)
VALUES 
  -- ✅ DONE (0 tasks) - Tidak ada yang selesai
  
  -- 🔄 IN PROGRESS (1 task)
  (gen_random_uuid(), '44444444-4444-4444-4444-000000000001'::UUID, '11111111-1111-1111-1111-000000000012'::UUID, 'SANITASI', 'DIKERJAKAN', '{}', 'HIGH', 'Pelatihan Sanitasi Pekerja', CURRENT_DATE + INTERVAL '6 days', 'Lukman Hakim'),
  
  -- ⏳ PENDING (4 tasks)
  (gen_random_uuid(), '44444444-4444-4444-4444-000000000001'::UUID, '11111111-1111-1111-1111-000000000013'::UUID, 'SANITASI', 'BARU', '{}', 'HIGH', 'Procurement Chemical Sanitasi', CURRENT_DATE + INTERVAL '10 days', 'Maya Safitri'),
  (gen_random_uuid(), '44444444-4444-4444-4444-000000000001'::UUID, '11111111-1111-1111-1111-000000000014'::UUID, 'SANITASI', 'BARU', '{}', 'MEDIUM', 'Setup Monitoring System', CURRENT_DATE + INTERVAL '18 days', 'Nugroho'),
  (gen_random_uuid(), '44444444-4444-4444-4444-000000000001'::UUID, '11111111-1111-1111-1111-000000000015'::UUID, 'SANITASI', 'BARU', '{}', 'MEDIUM', 'Deep Cleaning Schedule', CURRENT_DATE + INTERVAL '22 days', 'Olivia'),
  (gen_random_uuid(), '44444444-4444-4444-4444-000000000001'::UUID, '11111111-1111-1111-1111-000000000016'::UUID, 'SANITASI', 'BARU', '{}', 'LOW', 'Dokumentasi SOP Sanitasi', CURRENT_DATE + INTERVAL '28 days', 'Pandu Wicaksono');

-- ============================================================
-- STEP 9: INSERT BLOCKERS (Menggunakan spk_header)
-- ============================================================

-- VALIDASI Blockers
INSERT INTO public.spk_header (id_spk, nama_spk, id_asisten_pembuat, tanggal_target_selesai, blocker_description, blocker_severity, risk_level)
VALUES 
  (gen_random_uuid(), 'DUMMY_BLOCKER_VALIDASI_1', gen_random_uuid(), CURRENT_DATE, 'Menunggu approval dari Quality Assurance Department', 'HIGH', 'HIGH'),
  (gen_random_uuid(), 'DUMMY_BLOCKER_VALIDASI_2', gen_random_uuid(), CURRENT_DATE, 'Kekurangan personel untuk training validation', 'HIGH', 'MEDIUM'),
  (gen_random_uuid(), 'DUMMY_BLOCKER_VALIDASI_3', gen_random_uuid(), CURRENT_DATE, 'Software validasi masih dalam tahap testing', 'MEDIUM', 'MEDIUM');

-- APH Blockers
INSERT INTO public.spk_header (id_spk, nama_spk, id_asisten_pembuat, tanggal_target_selesai, blocker_description, blocker_severity, risk_level)
VALUES 
  (gen_random_uuid(), 'DUMMY_BLOCKER_APH_1', gen_random_uuid(), CURRENT_DATE, 'Delay pengadaan equipment APH dari supplier', 'HIGH', 'HIGH'),
  (gen_random_uuid(), 'DUMMY_BLOCKER_APH_2', gen_random_uuid(), CURRENT_DATE, 'Perlu revisi prosedur handling berdasarkan audit', 'MEDIUM', 'MEDIUM'),
  (gen_random_uuid(), 'DUMMY_BLOCKER_APH_3', gen_random_uuid(), CURRENT_DATE, 'Jadwal sertifikasi tim masih menunggu konfirmasi', 'LOW', 'LOW');

-- SANITASI Blockers
INSERT INTO public.spk_header (id_spk, nama_spk, id_asisten_pembuat, tanggal_target_selesai, blocker_description, blocker_severity, risk_level)
VALUES 
  (gen_random_uuid(), 'DUMMY_BLOCKER_SANITASI_1', gen_random_uuid(), CURRENT_DATE, 'Budget approval untuk chemical sanitasi tertunda', 'HIGH', 'HIGH'),
  (gen_random_uuid(), 'DUMMY_BLOCKER_SANITASI_2', gen_random_uuid(), CURRENT_DATE, 'Vendor monitoring system belum submit proposal', 'MEDIUM', 'MEDIUM'),
  (gen_random_uuid(), 'DUMMY_BLOCKER_SANITASI_3', gen_random_uuid(), CURRENT_DATE, 'Koordinasi jadwal deep cleaning dengan operasional', 'MEDIUM', 'MEDIUM');

-- ============================================================
-- STEP 10: VERIFICATION QUERIES
-- ============================================================

-- Verify SOP Compliance Data
SELECT 
  'SOP Compliance Items' as data_type,
  sop_category,
  COUNT(*) as total,
  ROUND(AVG(sop_score), 2) as avg_score
FROM public.master_pihak
WHERE tipe = 'SOP_ITEM'
GROUP BY sop_category
ORDER BY sop_category;

-- Verify Historical Trend
SELECT 
  'Historical Trend' as data_type,
  week_number,
  compliance_percentage,
  tanggal_target_selesai
FROM public.spk_header
WHERE nama_spk LIKE 'DUMMY_TREND_%'
ORDER BY week_number;

-- Verify Planning Tasks
SELECT 
  'Planning Tasks' as data_type,
  tipe_tugas as category,
  status_tugas as status,
  COUNT(*) as total_tasks
FROM public.spk_tugas
WHERE id_spk IN (
  SELECT id_spk FROM public.spk_header 
  WHERE nama_spk LIKE 'DUMMY_Planning_%'
)
GROUP BY tipe_tugas, status_tugas
ORDER BY tipe_tugas, status_tugas;

-- Verify PIC (Person In Charge)
SELECT 
  'Person In Charge' as data_type,
  COUNT(*) as total_pic
FROM public.master_pihak
WHERE kode_unik LIKE 'PIC_%';

-- Verify Blockers
SELECT 
  'Blockers' as data_type,
  blocker_severity,
  COUNT(*) as total
FROM public.spk_header
WHERE nama_spk LIKE 'DUMMY_BLOCKER_%'
GROUP BY blocker_severity
ORDER BY blocker_severity;

-- ============================================================
-- SUMMARY
-- ============================================================
SELECT 'DUMMY DATA INJECTION COMPLETED' as status,
       NOW() as executed_at,
       'All data inserted without new tables or JSONB' as note;

/*
 * ✅ EXECUTION COMPLETE
 * 
 * What was added:
 * - 14 SOP compliance items (in master_pihak)
 * - 8 weeks historical trend (in spk_header)
 * - 16 planning tasks (6 Validasi, 5 APH, 5 Sanitasi) (in spk_tugas)
 * - 16 PIC records (in master_pihak)
 * - 9 blockers (3 per category) (in spk_header)
 * 
 * Schema changes:
 * - ALTER TABLE master_pihak: +3 columns (sop_score, sop_category, sop_reason)
 * - ALTER TABLE spk_tugas: +4 columns (task_priority, task_description, deadline, pic_name)
 * - ALTER TABLE spk_header: +5 columns (risk_level, blocker_description, blocker_severity, week_number, compliance_percentage)
 * 
 * Total: 0 new tables, 12 new columns, 63 new records
 */
