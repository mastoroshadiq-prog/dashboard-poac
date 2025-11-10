-- ================================================================
-- PHASE 1 - STEP 2: MASTER DATA SETUP
-- ================================================================
-- Purpose: Setup SOP & OPS master data for PANEN phase
-- Based on: Tahap 3 (Fase Tindakan) + Tahap 4 (SOP) + Tahap 6 (SPK)
-- Date: November 10, 2025
-- Target: Production Supabase Database
-- ================================================================

-- ================================================================
-- SECTION 1: SOP MASTER DATA
-- ================================================================

-- Insert SOP Tipe: SOP Panen
INSERT INTO public.sop_tipe (nama_tipe_sop, deskripsi)
VALUES 
  ('SOP Panen', 'Standar operasional prosedur untuk kegiatan panen TBS (Tandan Buah Segar), meliputi kriteria matang panen, rotasi panen, sortasi buah, dan pengangkutan ke TPH/PKS. Mengacu pada GAP-ISPO-RSPO.')
ON CONFLICT DO NOTHING;

-- Get the id_tipe_sop for SOP Panen (will use in next insert)
-- Note: Save this for reference
DO $$ 
DECLARE 
  v_id_tipe_sop_panen uuid;
BEGIN
  SELECT id_tipe_sop INTO v_id_tipe_sop_panen
  FROM public.sop_tipe
  WHERE nama_tipe_sop = 'SOP Panen';
  
  RAISE NOTICE 'SOP Panen ID: %', v_id_tipe_sop_panen;
END $$;

-- Insert SOP Referensi: Detail SOP for Panen
INSERT INTO public.sop_referensi (id_tipe_sop, nama_sop, deskripsi)
VALUES 
  -- SOP 1: Kriteria Matang Panen
  (
    (SELECT id_tipe_sop FROM public.sop_tipe WHERE nama_tipe_sop = 'SOP Panen'),
    'Kriteria Matang Panen TBS',
    'GAP-ISPO-040: Kriteria matang panen berdasarkan brondolan jatuh (minimal 1-2 brondolan per tandan), fraksi matang minimal, warna buah. Rotasi panen setiap 7-10 hari untuk TM produktif.'
  ),
  -- SOP 2: Sortasi dan Quality Control
  (
    (SELECT id_tipe_sop FROM public.sop_tipe WHERE nama_tipe_sop = 'SOP Panen'),
    'Sortasi dan Quality Control TBS',
    'GAP-ISPO-041: Standar sortasi TBS di TPH, pemisahan buah lulus (mentah <10%, overripe <5%), handling reject/afkir, dokumentasi kualitas hasil panen per blok.'
  ),
  -- SOP 3: Rotasi Panen Tepat Waktu
  (
    (SELECT id_tipe_sop FROM public.sop_tipe WHERE nama_tipe_sop = 'SOP Panen'),
    'Rotasi Panen Tepat Waktu',
    'GAP-ISPO-040: Kepatuhan terhadap interval rotasi panen 7-10 hari, pemetaan blok untuk scheduling, monitoring ketepatan waktu panen untuk maksimalkan kualitas dan yield.'
  ),
  -- SOP 4: Transportasi ke PKS
  (
    (SELECT id_tipe_sop FROM public.sop_tipe WHERE nama_tipe_sop = 'SOP Panen'),
    'Transportasi TBS ke PKS',
    'GAP-ISPO-042: Prosedur pengangkutan TBS dari TPH ke Pabrik Kelapa Sawit, maksimal 24 jam setelah panen, dokumentasi delivery note, handling buah untuk minimalisir kerusakan.'
  )
ON CONFLICT DO NOTHING;

-- ================================================================
-- SECTION 2: OPS FASE BESAR
-- ================================================================

-- Insert Fase Besar: Pemanenan
INSERT INTO public.ops_fase_besar (nama_fase, umur_mulai, umur_selesai, deskripsi)
VALUES 
  (
    'Pemanenan',
    3,  -- TM mulai umur 3 tahun
    25, -- Produktif hingga 25 tahun
    'Fase pemanenan TBS (Tandan Buah Segar) untuk tanaman menghasilkan (TM). Meliputi kegiatan panen rutin sesuai rotasi, sortasi buah, transportasi ke TPH, dan pengiriman ke PKS. Target: maksimalkan yield dan kualitas TBS.'
  )
ON CONFLICT DO NOTHING;

-- Get the id_fase_besar for Pemanenan
DO $$ 
DECLARE 
  v_id_fase_panen uuid;
BEGIN
  SELECT id_fase_besar INTO v_id_fase_panen
  FROM public.ops_fase_besar
  WHERE nama_fase = 'Pemanenan';
  
  RAISE NOTICE 'Fase Pemanenan ID: %', v_id_fase_panen;
END $$;

-- ================================================================
-- SECTION 3: OPS SUB-TINDAKAN
-- ================================================================

-- Insert Sub-Tindakan for Pemanenan fase
INSERT INTO public.ops_sub_tindakan (id_fase_besar, nama_sub, deskripsi)
VALUES 
  -- Sub 1: Panen TBS Rotasi Rutin
  (
    (SELECT id_fase_besar FROM public.ops_fase_besar WHERE nama_fase = 'Pemanenan'),
    'Panen TBS Rotasi Rutin',
    'Kegiatan panen TBS sesuai kriteria matang (brondolan jatuh 1-2 butir), interval rotasi 7-10 hari. Menggunakan egrek/dodos, dokumentasi hasil per blok, sortasi awal di lapangan.'
  ),
  -- Sub 2: Sortasi Buah di TPH
  (
    (SELECT id_fase_besar FROM public.ops_fase_besar WHERE nama_fase = 'Pemanenan'),
    'Sortasi Buah di TPH',
    'Quality control TBS di Tempat Pengumpulan Hasil, pemisahan buah lulus vs reject (mentah/overripe/abnormal), pencatatan reject rate, dokumentasi kualitas per afdeling.'
  ),
  -- Sub 3: Angkut ke TPH
  (
    (SELECT id_fase_besar FROM public.ops_fase_besar WHERE nama_fase = 'Pemanenan'),
    'Angkut TBS ke TPH',
    'Transportasi TBS dari lapangan ke TPH menggunakan wheelbarrow/mini tractor, handling untuk minimalisir kerusakan buah, dokumentasi tonase per trip.'
  ),
  -- Sub 4: Kirim ke PKS
  (
    (SELECT id_fase_besar FROM public.ops_fase_besar WHERE nama_fase = 'Pemanenan'),
    'Kirim TBS ke PKS',
    'Pengiriman TBS dari TPH ke Pabrik Kelapa Sawit maksimal 24 jam setelah panen, dokumentasi delivery note, koordinasi dengan PKS untuk scheduling.'
  )
ON CONFLICT DO NOTHING;

-- Get IDs for reference
DO $$ 
DECLARE 
  v_id_sub_panen uuid;
  v_id_sub_sortasi uuid;
  v_id_sub_angkut uuid;
  v_id_sub_kirim uuid;
BEGIN
  SELECT id_sub_tindakan INTO v_id_sub_panen
  FROM public.ops_sub_tindakan
  WHERE nama_sub = 'Panen TBS Rotasi Rutin';
  
  SELECT id_sub_tindakan INTO v_id_sub_sortasi
  FROM public.ops_sub_tindakan
  WHERE nama_sub = 'Sortasi Buah di TPH';
  
  SELECT id_sub_tindakan INTO v_id_sub_angkut
  FROM public.ops_sub_tindakan
  WHERE nama_sub = 'Angkut TBS ke TPH';
  
  SELECT id_sub_tindakan INTO v_id_sub_kirim
  FROM public.ops_sub_tindakan
  WHERE nama_sub = 'Kirim TBS ke PKS';
  
  RAISE NOTICE 'Sub-Tindakan IDs:';
  RAISE NOTICE 'Panen TBS: %', v_id_sub_panen;
  RAISE NOTICE 'Sortasi: %', v_id_sub_sortasi;
  RAISE NOTICE 'Angkut: %', v_id_sub_angkut;
  RAISE NOTICE 'Kirim: %', v_id_sub_kirim;
END $$;

-- ================================================================
-- SECTION 4: OPS JADWAL TINDAKAN (Planning)
-- ================================================================

-- Insert Jadwal Tindakan: Panen Rutin
-- This is the PLANNING layer (before SPK is issued)
INSERT INTO public.ops_jadwal_tindakan (
  id_tanaman,          -- NULL for now (per-block scheduling, not per-tree)
  id_sub_tindakan,
  frekuensi,
  interval_hari,
  tanggal_mulai,
  tanggal_selesai
)
VALUES 
  (
    NULL,  -- id_tanaman: Not tracked at tree level for panen
    (SELECT id_sub_tindakan FROM public.ops_sub_tindakan WHERE nama_sub = 'Panen TBS Rotasi Rutin'),
    '2x per minggu',
    7,  -- Every 7 days
    '2025-10-01',  -- Start of harvest season
    NULL  -- Ongoing (no end date)
  )
ON CONFLICT DO NOTHING;

-- Get jadwal ID for reference in SPK creation
DO $$ 
DECLARE 
  v_id_jadwal_panen uuid;
BEGIN
  SELECT id_jadwal_tindakan INTO v_id_jadwal_panen
  FROM public.ops_jadwal_tindakan
  WHERE id_sub_tindakan = (
    SELECT id_sub_tindakan FROM public.ops_sub_tindakan WHERE nama_sub = 'Panen TBS Rotasi Rutin'
  )
  AND tanggal_mulai = '2025-10-01';
  
  RAISE NOTICE 'Jadwal Panen ID: %', v_id_jadwal_panen;
END $$;

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Verify SOP data
SELECT 
  st.nama_tipe_sop,
  COUNT(sr.id_sop) as jumlah_sop_detail
FROM public.sop_tipe st
LEFT JOIN public.sop_referensi sr ON sr.id_tipe_sop = st.id_tipe_sop
WHERE st.nama_tipe_sop = 'SOP Panen'
GROUP BY st.nama_tipe_sop;
-- Expected: 1 row, 4 SOP detail

-- Verify OPS Fase Besar
SELECT 
  nama_fase,
  umur_mulai,
  umur_selesai,
  deskripsi
FROM public.ops_fase_besar
WHERE nama_fase = 'Pemanenan';
-- Expected: 1 row

-- Verify OPS Sub-Tindakan
SELECT 
  fb.nama_fase,
  st.nama_sub,
  st.deskripsi
FROM public.ops_sub_tindakan st
JOIN public.ops_fase_besar fb ON fb.id_fase_besar = st.id_fase_besar
WHERE fb.nama_fase = 'Pemanenan'
ORDER BY st.nama_sub;
-- Expected: 4 rows

-- Verify OPS Jadwal
SELECT 
  jt.frekuensi,
  jt.interval_hari,
  jt.tanggal_mulai,
  st.nama_sub,
  fb.nama_fase
FROM public.ops_jadwal_tindakan jt
JOIN public.ops_sub_tindakan st ON st.id_sub_tindakan = jt.id_sub_tindakan
JOIN public.ops_fase_besar fb ON fb.id_fase_besar = st.id_fase_besar
WHERE fb.nama_fase = 'Pemanenan';
-- Expected: 1 row (Panen TBS Rotasi Rutin)

-- Summary report
SELECT 
  'Master Data Setup' as status,
  (SELECT COUNT(*) FROM public.sop_tipe WHERE nama_tipe_sop = 'SOP Panen') as sop_tipe_count,
  (SELECT COUNT(*) FROM public.sop_referensi WHERE id_tipe_sop = (SELECT id_tipe_sop FROM public.sop_tipe WHERE nama_tipe_sop = 'SOP Panen')) as sop_ref_count,
  (SELECT COUNT(*) FROM public.ops_fase_besar WHERE nama_fase = 'Pemanenan') as fase_count,
  (SELECT COUNT(*) FROM public.ops_sub_tindakan WHERE id_fase_besar = (SELECT id_fase_besar FROM public.ops_fase_besar WHERE nama_fase = 'Pemanenan')) as sub_tindakan_count,
  (SELECT COUNT(*) FROM public.ops_jadwal_tindakan WHERE id_sub_tindakan IN (SELECT id_sub_tindakan FROM public.ops_sub_tindakan WHERE id_fase_besar = (SELECT id_fase_besar FROM public.ops_fase_besar WHERE nama_fase = 'Pemanenan'))) as jadwal_count;
-- Expected: 1, 4, 1, 4, 1

-- ================================================================
-- ROLLBACK (if needed)
-- ================================================================

-- Uncomment these lines if you need to rollback:
/*
DELETE FROM public.ops_jadwal_tindakan 
WHERE id_sub_tindakan IN (
  SELECT id_sub_tindakan FROM public.ops_sub_tindakan 
  WHERE id_fase_besar = (SELECT id_fase_besar FROM public.ops_fase_besar WHERE nama_fase = 'Pemanenan')
);

DELETE FROM public.ops_sub_tindakan 
WHERE id_fase_besar = (SELECT id_fase_besar FROM public.ops_fase_besar WHERE nama_fase = 'Pemanenan');

DELETE FROM public.ops_fase_besar WHERE nama_fase = 'Pemanenan';

DELETE FROM public.sop_referensi 
WHERE id_tipe_sop = (SELECT id_tipe_sop FROM public.sop_tipe WHERE nama_tipe_sop = 'SOP Panen');

DELETE FROM public.sop_tipe WHERE nama_tipe_sop = 'SOP Panen';
*/

-- ================================================================
-- END OF SCRIPT
-- ================================================================
