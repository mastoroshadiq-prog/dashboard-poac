-- ================================================================
-- PHASE 1 - STEP 3: CREATE SPK DOCUMENTS
-- ================================================================
-- Purpose: Create formal SPK documents for PANEN operations
-- Based on: SkenarioDB_Tahap6_SPK.md
-- Following workflow: Jadwal → SPK → Eksekusi
-- Date: November 10, 2025
-- ================================================================

-- IMPORTANT: Run phase1_step2_master_data_setup.sql first!
-- This script requires jadwal_tindakan to exist

-- ================================================================
-- SECTION 1: WEEK 1 SPK (October 14-18, 2025)
-- ================================================================

INSERT INTO public.ops_spk_tindakan (
  id_jadwal_tindakan,
  nomor_spk,
  tanggal_terbit,
  tanggal_mulai,
  tanggal_selesai,
  status,
  penanggung_jawab,
  mandor,
  lokasi,
  uraian_pekerjaan,
  catatan
)
VALUES 
  (
    -- Get jadwal_tindakan for Panen TBS Rotasi Rutin
    (
      SELECT jt.id_jadwal_tindakan 
      FROM public.ops_jadwal_tindakan jt
      JOIN public.ops_sub_tindakan st ON st.id_sub_tindakan = jt.id_sub_tindakan
      WHERE st.nama_sub = 'Panen TBS Rotasi Rutin'
      AND jt.tanggal_mulai = '2025-10-01'
      LIMIT 1
    ),
    'SPK/PANEN/2025/001',  -- Formal SPK number
    '2025-10-13',          -- Issued date (1 day before execution)
    '2025-10-14',          -- Start date
    '2025-10-18',          -- End date
    'SELESAI',             -- Status: DRAFT → DISETUJUI → SELESAI
    'Asisten Kebun - Budi Santoso',  -- Responsible person
    'Mandor Panen - Joko Susilo',    -- Field supervisor
    'Blok A1-A10 (Afdeling 1)',      -- Location
    'Panen TBS rotasi ke-3 untuk Blok A1-A10. Target: 200 ton TBS dalam 2 hari kerja (14 & 18 Oktober). Tim: 2 grup @ 12 orang. Koordinasi dengan TPH untuk handling. Kriteria matang: brondolan 1-2 butir.',
    'Cuaca diprediksi cerah, kondisi jalan kebun baik, alat transport (wheelbarrow & mini tractor) ready. Estimasi yield: 1.8 ton/ha. Perhatian khusus: blok A5-A7 produktivitas tinggi.'
  );

-- ================================================================
-- SECTION 2: WEEK 2 SPK (October 21-25, 2025)
-- ================================================================

INSERT INTO public.ops_spk_tindakan (
  id_jadwal_tindakan,
  nomor_spk,
  tanggal_terbit,
  tanggal_mulai,
  tanggal_selesai,
  status,
  penanggung_jawab,
  mandor,
  lokasi,
  uraian_pekerjaan,
  catatan
)
VALUES 
  (
    (
      SELECT jt.id_jadwal_tindakan 
      FROM public.ops_jadwal_tindakan jt
      JOIN public.ops_sub_tindakan st ON st.id_sub_tindakan = jt.id_sub_tindakan
      WHERE st.nama_sub = 'Panen TBS Rotasi Rutin'
      AND jt.tanggal_mulai = '2025-10-01'
      LIMIT 1
    ),
    'SPK/PANEN/2025/002',
    '2025-10-20',
    '2025-10-21',
    '2025-10-25',
    'SELESAI',
    'Asisten Kebun - Budi Santoso',
    'Mandor Panen - Siti Aminah',
    'Blok B1-B10 (Afdeling 2)',
    'Panen TBS rotasi ke-3 untuk Blok B1-B10. Target: 210 ton TBS dalam 2 hari kerja (21 & 25 Oktober). Tim: 2 grup @ 12 orang. Fokus area: Blok B3-B8 (high yield). Quality control ketat untuk reject rate <2%.',
    'Kondisi: Sebagian blok B2-B4 masih basah pasca hujan tanggal 19 Okt. Delay possible 2-3 jam untuk blok tersebut. Alat egrek tambahan 5 unit untuk speed up. Koordinasi PKS untuk pickup H+1.'
  );

-- ================================================================
-- SECTION 3: WEEK 3 SPK (October 28 - November 1, 2025)
-- ================================================================

INSERT INTO public.ops_spk_tindakan (
  id_jadwal_tindakan,
  nomor_spk,
  tanggal_terbit,
  tanggal_mulai,
  tanggal_selesai,
  status,
  penanggung_jawab,
  mandor,
  lokasi,
  uraian_pekerjaan,
  catatan
)
VALUES 
  (
    (
      SELECT jt.id_jadwal_tindakan 
      FROM public.ops_jadwal_tindakan jt
      JOIN public.ops_sub_tindakan st ON st.id_sub_tindakan = jt.id_sub_tindakan
      WHERE st.nama_sub = 'Panen TBS Rotasi Rutin'
      AND jt.tanggal_mulai = '2025-10-01'
      LIMIT 1
    ),
    'SPK/PANEN/2025/003',
    '2025-10-27',
    '2025-10-28',
    '2025-11-01',
    'SELESAI',
    'Asisten Kebun - Budi Santoso',
    'Mandor Panen - Joko Susilo',
    'Blok C1-C10 (Afdeling 3)',
    'Panen TBS rotasi ke-3 untuk Blok C1-C10. Target: 225 ton TBS dalam 2 hari kerja (28 Okt & 1 Nov). Tim: 2 grup @ 12 orang. Area ini high productivity, expected yield 2.0 ton/ha. Extra wheelbarrow 10 unit.',
    'Produktivitas tinggi observed di rotasi sebelumnya. Kondisi pokok sangat bagus (fertilizer response excellent). Cuaca optimal. All equipment checked & ready. Team morale high after Week 2 achievement. Target stretch: 230 ton if possible.'
  );

-- ================================================================
-- SECTION 4: WEEK 4 SPK (November 4-8, 2025) - CURRENT
-- ================================================================

INSERT INTO public.ops_spk_tindakan (
  id_jadwal_tindakan,
  nomor_spk,
  tanggal_terbit,
  tanggal_mulai,
  tanggal_selesai,
  status,
  penanggung_jawab,
  mandor,
  lokasi,
  uraian_pekerjaan,
  catatan
)
VALUES 
  (
    (
      SELECT jt.id_jadwal_tindakan 
      FROM public.ops_jadwal_tindakan jt
      JOIN public.ops_sub_tindakan st ON st.id_sub_tindakan = jt.id_sub_tindakan
      WHERE st.nama_sub = 'Panen TBS Rotasi Rutin'
      AND jt.tanggal_mulai = '2025-10-01'
      LIMIT 1
    ),
    'SPK/PANEN/2025/004',
    '2025-11-03',
    '2025-11-04',
    '2025-11-08',
    'SELESAI',
    'Asisten Kebun - Budi Santoso',
    'Mandor Panen - Siti Aminah',
    'Blok D1-D10 (Afdeling 4)',
    'Panen TBS rotasi ke-3 untuk Blok D1-D10 (closing week November minggu 1). Target: 240 ton TBS dalam 2 hari kerja (4 & 8 November). Tim: 2 grup @ 12 orang full strength. Peak performance target: yield 2.1 ton/ha.',
    'Cuaca optimal (cerah, dry), semua tim full strength (no absentee), equipment 100% ready. Blok D adalah prime area dengan pokok umur 8-12 tahun (peak production). Target ambitious tapi achievable. PKS confirmed ready untuk immediate pickup. Quality focus: reject rate target <2%.'
  );

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Verify all SPK created
SELECT 
  nomor_spk,
  tanggal_terbit,
  tanggal_mulai,
  tanggal_selesai,
  status,
  penanggung_jawab,
  mandor,
  lokasi,
  LEFT(uraian_pekerjaan, 50) as uraian_short
FROM public.ops_spk_tindakan
WHERE nomor_spk LIKE 'SPK/PANEN/2025/%'
ORDER BY nomor_spk;
-- Expected: 4 rows (SPK/PANEN/2025/001 to 004)

-- Verify SPK linked to jadwal
SELECT 
  spk.nomor_spk,
  spk.status,
  st.nama_sub,
  fb.nama_fase,
  jt.frekuensi
FROM public.ops_spk_tindakan spk
JOIN public.ops_jadwal_tindakan jt ON jt.id_jadwal_tindakan = spk.id_jadwal_tindakan
JOIN public.ops_sub_tindakan st ON st.id_sub_tindakan = jt.id_sub_tindakan
JOIN public.ops_fase_besar fb ON fb.id_fase_besar = st.id_fase_besar
WHERE spk.nomor_spk LIKE 'SPK/PANEN/2025/%'
ORDER BY spk.nomor_spk;
-- Expected: 4 rows, all linked to "Panen TBS Rotasi Rutin" sub-tindakan

-- Get SPK IDs for use in execution records (SAVE THESE!)
SELECT 
  nomor_spk,
  id_spk,
  lokasi
FROM public.ops_spk_tindakan
WHERE nomor_spk LIKE 'SPK/PANEN/2025/%'
ORDER BY nomor_spk;

-- Summary report
SELECT 
  'SPK Documents Created' as status,
  COUNT(*) as total_spk,
  COUNT(CASE WHEN status = 'SELESAI' THEN 1 END) as spk_selesai,
  COUNT(DISTINCT penanggung_jawab) as unique_pj,
  COUNT(DISTINCT mandor) as unique_mandor,
  COUNT(DISTINCT lokasi) as unique_lokasi
FROM public.ops_spk_tindakan
WHERE nomor_spk LIKE 'SPK/PANEN/2025/%';
-- Expected: 4 total, 4 selesai, 1 PJ, 2 mandor, 4 lokasi

-- ================================================================
-- IMPORTANT: COPY SPK IDs FOR NEXT SCRIPT
-- ================================================================
-- You will need these IDs for phase1_step4_execution_records.sql
-- Run this query and save the results:

SELECT 
  nomor_spk,
  id_spk::text as spk_id_for_copy,
  lokasi,
  mandor
FROM public.ops_spk_tindakan
WHERE nomor_spk LIKE 'SPK/PANEN/2025/%'
ORDER BY nomor_spk;

-- Copy each id_spk value - you'll use them in the next script!

-- ================================================================
-- ROLLBACK (if needed)
-- ================================================================

-- Uncomment if you need to rollback:
/*
DELETE FROM public.ops_spk_tindakan 
WHERE nomor_spk LIKE 'SPK/PANEN/2025/%';
*/

-- ================================================================
-- END OF SCRIPT
-- ================================================================
