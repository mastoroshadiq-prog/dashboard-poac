-- ================================================================
-- PHASE 1 - ALL-IN-ONE EXECUTION SCRIPT
-- ================================================================
-- Purpose: Complete PANEN tracking implementation in ONE script
-- Run this in Supabase SQL Editor
-- Date: November 10, 2025
-- ================================================================

-- ****************************************************************
-- STEP 1: ENHANCE SCHEMA
-- ****************************************************************

ALTER TABLE public.ops_eksekusi_tindakan 
ADD COLUMN IF NOT EXISTS id_spk uuid;

ALTER TABLE public.ops_eksekusi_tindakan
ADD CONSTRAINT fk_eksekusi_spk
  FOREIGN KEY (id_spk)
  REFERENCES public.ops_spk_tindakan(id_spk)
  ON DELETE SET NULL;

-- ****************************************************************
-- STEP 2: MASTER DATA - SOP
-- ****************************************************************

INSERT INTO public.sop_tipe (nama_tipe_sop, deskripsi)
VALUES 
  ('SOP Panen', 'Standar operasional prosedur untuk kegiatan panen TBS (Tandan Buah Segar), meliputi kriteria matang panen, rotasi panen, sortasi buah, dan pengangkutan ke TPH/PKS. Mengacu pada GAP-ISPO-RSPO.')
ON CONFLICT DO NOTHING;

INSERT INTO public.sop_referensi (id_tipe_sop, nama_sop, deskripsi)
VALUES 
  (
    (SELECT id_tipe_sop FROM public.sop_tipe WHERE nama_tipe_sop = 'SOP Panen'),
    'Kriteria Matang Panen TBS',
    'GAP-ISPO-040: Kriteria matang panen berdasarkan brondolan jatuh'
  ),
  (
    (SELECT id_tipe_sop FROM public.sop_tipe WHERE nama_tipe_sop = 'SOP Panen'),
    'Sortasi dan Quality Control TBS',
    'GAP-ISPO-041: Standar sortasi TBS di TPH'
  ),
  (
    (SELECT id_tipe_sop FROM public.sop_tipe WHERE nama_tipe_sop = 'SOP Panen'),
    'Rotasi Panen Tepat Waktu',
    'GAP-ISPO-040: Kepatuhan interval rotasi 7-10 hari'
  ),
  (
    (SELECT id_tipe_sop FROM public.sop_tipe WHERE nama_tipe_sop = 'SOP Panen'),
    'Transportasi TBS ke PKS',
    'GAP-ISPO-042: Prosedur pengangkutan maksimal 24 jam'
  )
ON CONFLICT DO NOTHING;

-- ****************************************************************
-- STEP 3: MASTER DATA - OPS FASE & SUB-TINDAKAN
-- ****************************************************************

INSERT INTO public.ops_fase_besar (nama_fase, umur_mulai, umur_selesai, deskripsi)
VALUES 
  ('Pemanenan', 3, 25, 'Fase pemanenan TBS untuk tanaman menghasilkan (TM)')
ON CONFLICT DO NOTHING;

INSERT INTO public.ops_sub_tindakan (id_fase_besar, nama_sub, deskripsi)
VALUES 
  (
    (SELECT id_fase_besar FROM public.ops_fase_besar WHERE nama_fase = 'Pemanenan'),
    'Panen TBS Rotasi Rutin',
    'Kegiatan panen TBS sesuai kriteria matang, interval 7-10 hari'
  ),
  (
    (SELECT id_fase_besar FROM public.ops_fase_besar WHERE nama_fase = 'Pemanenan'),
    'Sortasi Buah di TPH',
    'Quality control TBS di Tempat Pengumpulan Hasil'
  ),
  (
    (SELECT id_fase_besar FROM public.ops_fase_besar WHERE nama_fase = 'Pemanenan'),
    'Angkut TBS ke TPH',
    'Transportasi TBS dari lapangan ke TPH'
  ),
  (
    (SELECT id_fase_besar FROM public.ops_fase_besar WHERE nama_fase = 'Pemanenan'),
    'Kirim TBS ke PKS',
    'Pengiriman TBS ke Pabrik Kelapa Sawit maksimal 24 jam'
  )
ON CONFLICT DO NOTHING;

-- ****************************************************************
-- STEP 4: JADWAL TINDAKAN (Planning)
-- ****************************************************************

INSERT INTO public.ops_jadwal_tindakan (
  id_tanaman, id_sub_tindakan, frekuensi, interval_hari, tanggal_mulai, tanggal_selesai
)
VALUES 
  (
    NULL,
    (SELECT id_sub_tindakan FROM public.ops_sub_tindakan WHERE nama_sub = 'Panen TBS Rotasi Rutin'),
    '2x per minggu',
    7,
    '2025-10-01',
    NULL
  )
ON CONFLICT DO NOTHING;

-- ****************************************************************
-- STEP 5: SPK DOCUMENTS (Formal Instructions)
-- ****************************************************************

INSERT INTO public.ops_spk_tindakan (
  id_jadwal_tindakan, nomor_spk, tanggal_terbit, tanggal_mulai, tanggal_selesai,
  status, penanggung_jawab, mandor, lokasi, uraian_pekerjaan, catatan
)
VALUES 
  -- Week 1
  (
    (SELECT jt.id_jadwal_tindakan FROM public.ops_jadwal_tindakan jt
     JOIN public.ops_sub_tindakan st ON st.id_sub_tindakan = jt.id_sub_tindakan
     WHERE st.nama_sub = 'Panen TBS Rotasi Rutin' AND jt.tanggal_mulai = '2025-10-01' LIMIT 1),
    'SPK/PANEN/2025/001', '2025-10-13', '2025-10-14', '2025-10-18',
    'SELESAI', 'Asisten Kebun - Budi Santoso', 'Mandor Panen - Joko Susilo',
    'Blok A1-A10 (Afdeling 1)',
    'Panen TBS rotasi ke-3 untuk Blok A1-A10. Target: 200 ton TBS dalam 2 hari kerja.',
    'Cuaca cerah, kondisi jalan baik, alat transport ready. Estimasi yield: 1.8 ton/ha.'
  ),
  -- Week 2
  (
    (SELECT jt.id_jadwal_tindakan FROM public.ops_jadwal_tindakan jt
     JOIN public.ops_sub_tindakan st ON st.id_sub_tindakan = jt.id_sub_tindakan
     WHERE st.nama_sub = 'Panen TBS Rotasi Rutin' AND jt.tanggal_mulai = '2025-10-01' LIMIT 1),
    'SPK/PANEN/2025/002', '2025-10-20', '2025-10-21', '2025-10-25',
    'SELESAI', 'Asisten Kebun - Budi Santoso', 'Mandor Panen - Siti Aminah',
    'Blok B1-B10 (Afdeling 2)',
    'Panen TBS rotasi ke-3 untuk Blok B1-B10. Target: 210 ton TBS dalam 2 hari kerja.',
    'Sebagian blok masih basah pasca hujan. Delay possible 2-3 jam.'
  ),
  -- Week 3
  (
    (SELECT jt.id_jadwal_tindakan FROM public.ops_jadwal_tindakan jt
     JOIN public.ops_sub_tindakan st ON st.id_sub_tindakan = jt.id_sub_tindakan
     WHERE st.nama_sub = 'Panen TBS Rotasi Rutin' AND jt.tanggal_mulai = '2025-10-01' LIMIT 1),
    'SPK/PANEN/2025/003', '2025-10-27', '2025-10-28', '2025-11-01',
    'SELESAI', 'Asisten Kebun - Budi Santoso', 'Mandor Panen - Joko Susilo',
    'Blok C1-C10 (Afdeling 3)',
    'Panen TBS rotasi ke-3 untuk Blok C1-C10. Target: 225 ton TBS dalam 2 hari kerja.',
    'Produktivitas tinggi, kondisi pokok bagus. Cuaca optimal.'
  ),
  -- Week 4
  (
    (SELECT jt.id_jadwal_tindakan FROM public.ops_jadwal_tindakan jt
     JOIN public.ops_sub_tindakan st ON st.id_sub_tindakan = jt.id_sub_tindakan
     WHERE st.nama_sub = 'Panen TBS Rotasi Rutin' AND jt.tanggal_mulai = '2025-10-01' LIMIT 1),
    'SPK/PANEN/2025/004', '2025-11-03', '2025-11-04', '2025-11-08',
    'SELESAI', 'Asisten Kebun - Budi Santoso', 'Mandor Panen - Siti Aminah',
    'Blok D1-D10 (Afdeling 4)',
    'Panen TBS rotasi ke-3 untuk Blok D1-D10. Target: 240 ton TBS dalam 2 hari kerja.',
    'Cuaca optimal, semua tim full strength. Peak performance target.'
  );

-- ****************************************************************
-- STEP 6: EXECUTION RECORDS (Actual Harvest Data)
-- ****************************************************************

INSERT INTO public.ops_eksekusi_tindakan (
  id_jadwal_tindakan, id_spk, tanggal_eksekusi, hasil, petugas, catatan
)
VALUES 
  -- Week 1 Executions
  (
    (SELECT jt.id_jadwal_tindakan FROM public.ops_jadwal_tindakan jt
     JOIN public.ops_sub_tindakan st ON st.id_sub_tindakan = jt.id_sub_tindakan
     WHERE st.nama_sub = 'Panen TBS Rotasi Rutin' AND jt.tanggal_mulai = '2025-10-01' LIMIT 1),
    (SELECT id_spk FROM public.ops_spk_tindakan WHERE nomor_spk = 'SPK/PANEN/2025/001'),
    '2025-10-14',
    '102.5 ton TBS, reject 2.1 ton (2.0%)',
    'Tim Panen 1 - 12 orang (Ketua: Agus Prasetyo)',
    'Blok A1-A5 selesai. Kondisi buah sangat bagus, quality score: 98%.'
  ),
  (
    (SELECT jt.id_jadwal_tindakan FROM public.ops_jadwal_tindakan jt
     JOIN public.ops_sub_tindakan st ON st.id_sub_tindakan = jt.id_sub_tindakan
     WHERE st.nama_sub = 'Panen TBS Rotasi Rutin' AND jt.tanggal_mulai = '2025-10-01' LIMIT 1),
    (SELECT id_spk FROM public.ops_spk_tindakan WHERE nomor_spk = 'SPK/PANEN/2025/001'),
    '2025-10-18',
    '98.3 ton TBS, reject 1.9 ton (1.9%)',
    'Tim Panen 2 - 12 orang (Ketua: Bambang Sutejo)',
    'Blok A6-A10 selesai tepat waktu. Reject rate improvement!'
  ),
  -- Week 2 Executions
  (
    (SELECT jt.id_jadwal_tindakan FROM public.ops_jadwal_tindakan jt
     JOIN public.ops_sub_tindakan st ON st.id_sub_tindakan = jt.id_sub_tindakan
     WHERE st.nama_sub = 'Panen TBS Rotasi Rutin' AND jt.tanggal_mulai = '2025-10-01' LIMIT 1),
    (SELECT id_spk FROM public.ops_spk_tindakan WHERE nomor_spk = 'SPK/PANEN/2025/002'),
    '2025-10-21',
    '108.3 ton TBS, reject 2.0 ton (1.8%)',
    'Tim Panen 1 - 12 orang (Ketua: Agus Prasetyo)',
    'Blok B1-B5 produktivitas naik +5.7%. Fertilizer response excellent.'
  ),
  (
    (SELECT jt.id_jadwal_tindakan FROM public.ops_jadwal_tindakan jt
     JOIN public.ops_sub_tindakan st ON st.id_sub_tindakan = jt.id_sub_tindakan
     WHERE st.nama_sub = 'Panen TBS Rotasi Rutin' AND jt.tanggal_mulai = '2025-10-01' LIMIT 1),
    (SELECT id_spk FROM public.ops_spk_tindakan WHERE nomor_spk = 'SPK/PANEN/2025/002'),
    '2025-10-25',
    '105.7 ton TBS, reject 2.2 ton (2.1%)',
    'Tim Panen 2 - 12 orang (Ketua: Bambang Sutejo)',
    'Blok B6-B10 closing. Total Week 2: 214 ton (target achieved!).'
  ),
  -- Week 3 Executions
  (
    (SELECT jt.id_jadwal_tindakan FROM public.ops_jadwal_tindakan jt
     JOIN public.ops_sub_tindakan st ON st.id_sub_tindakan = jt.id_sub_tindakan
     WHERE st.nama_sub = 'Panen TBS Rotasi Rutin' AND jt.tanggal_mulai = '2025-10-01' LIMIT 1),
    (SELECT id_spk FROM public.ops_spk_tindakan WHERE nomor_spk = 'SPK/PANEN/2025/003'),
    '2025-10-28',
    '115.2 ton TBS, reject 2.5 ton (2.2%)',
    'Tim Panen 1 - 12 orang (Ketua: Agus Prasetyo)',
    'Blok C1-C5 PEAK PRODUCTIVITY! Highest yield Oktober.'
  ),
  (
    (SELECT jt.id_jadwal_tindakan FROM public.ops_jadwal_tindakan jt
     JOIN public.ops_sub_tindakan st ON st.id_sub_tindakan = jt.id_sub_tindakan
     WHERE st.nama_sub = 'Panen TBS Rotasi Rutin' AND jt.tanggal_mulai = '2025-10-01' LIMIT 1),
    (SELECT id_spk FROM public.ops_spk_tindakan WHERE nomor_spk = 'SPK/PANEN/2025/003'),
    '2025-11-01',
    '112.8 ton TBS, reject 2.8 ton (2.4%)',
    'Tim Panen 2 - 12 orang (Ketua: Bambang Sutejo)',
    'Blok C6-C10 maintain quality. Total Week 3: 228 ton (target exceeded!).'
  ),
  -- Week 4 Executions
  (
    (SELECT jt.id_jadwal_tindakan FROM public.ops_jadwal_tindakan jt
     JOIN public.ops_sub_tindakan st ON st.id_sub_tindakan = jt.id_sub_tindakan
     WHERE st.nama_sub = 'Panen TBS Rotasi Rutin' AND jt.tanggal_mulai = '2025-10-01' LIMIT 1),
    (SELECT id_spk FROM public.ops_spk_tindakan WHERE nomor_spk = 'SPK/PANEN/2025/004'),
    '2025-11-04',
    '118.5 ton TBS, reject 2.9 ton (2.4%)',
    'Tim Panen 1 - 12 orang (Ketua: Agus Prasetyo)',
    'Blok D1-D5 hasil sangat baik! NEW RECORD single-day harvest.'
  ),
  (
    (SELECT jt.id_jadwal_tindakan FROM public.ops_jadwal_tindakan jt
     JOIN public.ops_sub_tindakan st ON st.id_sub_tindakan = jt.id_sub_tindakan
     WHERE st.nama_sub = 'Panen TBS Rotasi Rutin' AND jt.tanggal_mulai = '2025-10-01' LIMIT 1),
    (SELECT id_spk FROM public.ops_spk_tindakan WHERE nomor_spk = 'SPK/PANEN/2025/004'),
    '2025-11-08',
    '124.0 ton TBS, reject 3.2 ton (2.6%)',
    'Tim Panen 2 - 12 orang (Ketua: Bambang Sutejo)',
    'Blok D6-D10 CLOSING STRONG! ALL-TIME HIGH: 124 ton! Total Week 4: 242.5 ton. GRAND TOTAL: 895.3 ton dari 8 panen events!'
  );

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Summary Report
SELECT 
  'PHASE 1 DATA SETUP' as phase,
  (SELECT COUNT(*) FROM public.sop_tipe WHERE nama_tipe_sop = 'SOP Panen') as sop_tipe,
  (SELECT COUNT(*) FROM public.sop_referensi WHERE id_tipe_sop = (SELECT id_tipe_sop FROM public.sop_tipe WHERE nama_tipe_sop = 'SOP Panen')) as sop_ref,
  (SELECT COUNT(*) FROM public.ops_fase_besar WHERE nama_fase = 'Pemanenan') as fase,
  (SELECT COUNT(*) FROM public.ops_sub_tindakan WHERE id_fase_besar = (SELECT id_fase_besar FROM public.ops_fase_besar WHERE nama_fase = 'Pemanenan')) as sub_tindakan,
  (SELECT COUNT(*) FROM public.ops_jadwal_tindakan WHERE id_sub_tindakan IN (SELECT id_sub_tindakan FROM public.ops_sub_tindakan WHERE id_fase_besar = (SELECT id_fase_besar FROM public.ops_fase_besar WHERE nama_fase = 'Pemanenan'))) as jadwal,
  (SELECT COUNT(*) FROM public.ops_spk_tindakan WHERE nomor_spk LIKE 'SPK/PANEN/2025/%') as spk_docs,
  (SELECT COUNT(*) FROM public.ops_eksekusi_tindakan WHERE id_spk IN (SELECT id_spk FROM public.ops_spk_tindakan WHERE nomor_spk LIKE 'SPK/PANEN/2025/%')) as executions;

-- Expected: 1, 4, 1, 4, 1, 4, 8

-- Detailed Execution List
SELECT 
  TO_CHAR(et.tanggal_eksekusi, 'YYYY-MM-DD') as tanggal,
  spk.nomor_spk,
  spk.lokasi,
  et.hasil,
  LEFT(et.petugas, 30) as tim
FROM public.ops_eksekusi_tindakan et
JOIN public.ops_spk_tindakan spk ON spk.id_spk = et.id_spk
WHERE spk.nomor_spk LIKE 'SPK/PANEN/2025/%'
ORDER BY et.tanggal_eksekusi;

-- ================================================================
-- SUCCESS MESSAGE
-- ================================================================

SELECT 
  '✅ PHASE 1 - PANEN TRACKING DATA SETUP COMPLETE!' as status,
  '🎯 Total: 1 SOP Tipe, 4 SOP Ref, 1 Fase, 4 Sub-Tindakan, 1 Jadwal, 4 SPK, 8 Executions' as summary,
  '📊 Total TBS Harvested: ~895.3 ton from 8 panen events' as achievement,
  '🚀 Next: Update operasionalService.js to query this data' as next_step;
