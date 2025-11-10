-- ================================================================
-- PHASE 1 - STEP 4: CREATE EXECUTION RECORDS
-- ================================================================
-- Purpose: Record actual harvest executions linked to SPK documents
-- Based on: Tahap 6 workflow (SPK → Eksekusi)
-- Date: November 10, 2025
-- ================================================================

-- CRITICAL: This script uses PLACEHOLDER UUIDs
-- You MUST replace <SPK_001_ID>, <SPK_002_ID>, etc. with actual UUIDs
-- from phase1_step3_create_spk_documents.sql execution result!

-- HOW TO GET SPK IDs:
-- Run this query in Supabase SQL Editor:
-- SELECT nomor_spk, id_spk::text FROM ops_spk_tindakan WHERE nomor_spk LIKE 'SPK/PANEN/2025/%' ORDER BY nomor_spk;
-- Copy the id_spk values and replace placeholders below

-- ================================================================
-- SECTION 1: WEEK 1 EXECUTIONS (SPK/PANEN/2025/001)
-- ================================================================

-- Execution 1: October 14, 2025 (Day 1 - Blok A1-A5)
INSERT INTO public.ops_eksekusi_tindakan (
  id_jadwal_tindakan,
  id_spk,  -- ⭐ Link to SPK document (NEW from Tahap 6!)
  tanggal_eksekusi,
  hasil,
  petugas,
  catatan
)
VALUES 
  (
    -- Get jadwal_tindakan
    (
      SELECT jt.id_jadwal_tindakan 
      FROM public.ops_jadwal_tindakan jt
      JOIN public.ops_sub_tindakan st ON st.id_sub_tindakan = jt.id_sub_tindakan
      WHERE st.nama_sub = 'Panen TBS Rotasi Rutin'
      AND jt.tanggal_mulai = '2025-10-01'
      LIMIT 1
    ),
    -- Get SPK id for SPK/PANEN/2025/001
    (SELECT id_spk FROM public.ops_spk_tindakan WHERE nomor_spk = 'SPK/PANEN/2025/001'),
    '2025-10-14',
    '102.5 ton TBS, reject 2.1 ton (2.0%)',  -- Format: "X ton TBS, reject Y ton (Z%)"
    'Tim Panen 1 - 12 orang (Ketua: Agus Prasetyo)',
    'Blok A1-A5 selesai panen. Kondisi buah sangat bagus, brondolan rata-rata 1.5 butir. Cuaca cerah, panen dimulai 07:00 selesai 15:30. Sortasi di TPH: 2.1 ton reject (buah mentah 1.2 ton, overripe 0.9 ton). Quality score: 98%. Wheelbarrow trips: 85x.'
  );

-- Execution 2: October 18, 2025 (Day 2 - Blok A6-A10)
INSERT INTO public.ops_eksekusi_tindakan (
  id_jadwal_tindakan,
  id_spk,
  tanggal_eksekusi,
  hasil,
  petugas,
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
    (SELECT id_spk FROM public.ops_spk_tindakan WHERE nomor_spk = 'SPK/PANEN/2025/001'),
    '2025-10-18',
    '98.3 ton TBS, reject 1.9 ton (1.9%)',
    'Tim Panen 2 - 12 orang (Ketua: Bambang Sutejo)',
    'Blok A6-A10 selesai rotasi ke-3 tepat waktu (interval 7 hari dari rotasi sebelumnya). Reject rate turun ke 1.9% (improvement!). Kondisi: blok A8-A9 sedikit lebih rendah yield karena drainase kurang optimal (noted for follow-up). Panen 07:00-15:00. Transported to TPH same day, pickup PKS H+1 confirmed.'
  );

-- ================================================================
-- SECTION 2: WEEK 2 EXECUTIONS (SPK/PANEN/2025/002)
-- ================================================================

-- Execution 3: October 21, 2025 (Day 1 - Blok B1-B5)
INSERT INTO public.ops_eksekusi_tindakan (
  id_jadwal_tindakan,
  id_spk,
  tanggal_eksekusi,
  hasil,
  petugas,
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
    (SELECT id_spk FROM public.ops_spk_tindakan WHERE nomor_spk = 'SPK/PANEN/2025/002'),
    '2025-10-21',
    '108.3 ton TBS, reject 2.0 ton (1.8%)',
    'Tim Panen 1 - 12 orang (Ketua: Agus Prasetyo)',
    'Blok B1-B5 produktivitas naik vs minggu lalu (+5.7%). Fertilizer application 3 bulan lalu showing excellent response. Reject rate maintain di 1.8% (good!). Blok B3-B4 yang sebelumnya basah sudah kering, no delay. Brondolan rata-rata 2 butir (fully mature). Mini tractor 3 unit assist wheelbarrow for faster transport.'
  );

-- Execution 4: October 25, 2025 (Day 2 - Blok B6-B10)
INSERT INTO public.ops_eksekusi_tindakan (
  id_jadwal_tindakan,
  id_spk,
  tanggal_eksekusi,
  hasil,
  petugas,
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
    (SELECT id_spk FROM public.ops_spk_tindakan WHERE nomor_spk = 'SPK/PANEN/2025/002'),
    '2025-10-25',
    '105.7 ton TBS, reject 2.2 ton (2.1%)',
    'Tim Panen 2 - 12 orang (Ketua: Bambang Sutejo)',
    'Blok B6-B10 closing untuk Afdeling 2. Sedikit delay 2 jam di pagi hari karena hujan ringan 06:30-08:30, start panen 08:45. Reject rate naik sedikit ke 2.1% (acceptable range). Blok B9-B10 noted: pokok umur 15 tahun mulai showing decline in yield, candidate untuk rejuvenation assessment. Total Week 2: 214 ton (vs target 210 ton) ✓ ACHIEVED!'
  );

-- ================================================================
-- SECTION 3: WEEK 3 EXECUTIONS (SPK/PANEN/2025/003)
-- ================================================================

-- Execution 5: October 28, 2025 (Day 1 - Blok C1-C5)
INSERT INTO public.ops_eksekusi_tindakan (
  id_jadwal_tindakan,
  id_spk,
  tanggal_eksekusi,
  hasil,
  petugas,
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
    (SELECT id_spk FROM public.ops_spk_tindakan WHERE nomor_spk = 'SPK/PANEN/2025/003'),
    '2025-10-28',
    '115.2 ton TBS, reject 2.5 ton (2.2%)',
    'Tim Panen 1 - 12 orang (Ketua: Agus Prasetyo)',
    'Blok C1-C5 PEAK PRODUCTIVITY! Highest yield so far in October. Pokok umur 8-10 tahun (prime production age). Brondolan 2-3 butir per tandan (excellent maturity). Cuaca perfect, tim morale high after Week 2 success. Reject mostly dari overripe (pokok terlalu produktif, beberapa tandan lewat matang). Extra 10 wheelbarrow deployed untuk handle high volume. Panen 06:30-16:00 (extended 30 min).'
  );

-- Execution 6: November 1, 2025 (Day 2 - Blok C6-C10)
INSERT INTO public.ops_eksekusi_tindakan (
  id_jadwal_tindakan,
  id_spk,
  tanggal_eksekusi,
  hasil,
  petugas,
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
    (SELECT id_spk FROM public.ops_spk_tindakan WHERE nomor_spk = 'SPK/PANEN/2025/003'),
    '2025-11-01',
    '112.8 ton TBS, reject 2.8 ton (2.4%)',
    'Tim Panen 2 - 12 orang (Ketua: Bambang Sutejo)',
    'Blok C6-C10 maintain high productivity. Quality tetap terjaga meski reject naik slight ke 2.4% (masih dalam acceptable <3%). Blok C7-C8 exceptional: 2.3 ton/ha yield! Sortasi extra ketat untuk maintain PKS acceptance rate. Total Week 3: 228 ton (vs target 225 ton) ✓ EXCEEDED! Afdeling 3 confirmed as TOP PERFORMER untuk Oktober 2025.'
  );

-- ================================================================
-- SECTION 4: WEEK 4 EXECUTIONS (SPK/PANEN/2025/004)
-- ================================================================

-- Execution 7: November 4, 2025 (Day 1 - Blok D1-D5)
INSERT INTO public.ops_eksekusi_tindakan (
  id_jadwal_tindakan,
  id_spk,
  tanggal_eksekusi,
  hasil,
  petugas,
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
    (SELECT id_spk FROM public.ops_spk_tindakan WHERE nomor_spk = 'SPK/PANEN/2025/004'),
    '2025-11-04',
    '118.5 ton TBS, reject 2.9 ton (2.4%)',
    'Tim Panen 1 - 12 orang (Ketua: Agus Prasetyo)',
    'Blok D1-D5 hasil sangat baik! NEW RECORD untuk single-day harvest di Oktober-November period. Pokok prime condition (umur 10-12 tahun), fertilizer + weather optimal combination. Cuaca cerah, zero equipment issue, tim full strength. Brondolan 2 butir average. Reject 2.4% mostly overripe (sign of high productivity). TPH handling smooth, PKS pickup scheduled same day due to high volume.'
  );

-- Execution 8: November 8, 2025 (Day 2 - Blok D6-D10) - CURRENT/LATEST
INSERT INTO public.ops_eksekusi_tindakan (
  id_jadwal_tindakan,
  id_spk,
  tanggal_eksekusi,
  hasil,
  petugas,
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
    (SELECT id_spk FROM public.ops_spk_tindakan WHERE nomor_spk = 'SPK/PANEN/2025/004'),
    '2025-11-08',
    '124.0 ton TBS, reject 3.2 ton (2.6%)',
    'Tim Panen 2 - 12 orang (Ketua: Bambang Sutejo)',
    'Blok D6-D10 CLOSING STRONG untuk Week 4! ALL-TIME HIGH single-day harvest: 124 ton! Afdeling 4 proven sebagai prime production area. Reject rate 2.6% (acceptable given extreme high volume). Quality: 97.4% lulus sortasi. Total Week 4: 242.5 ton (vs target 240) ✓ EXCEEDED! TOTAL OKTOBER-NOVEMBER PHASE 1: 895.3 ton from 8 panen events. Team performance EXCELLENT! Recommend: bonus incentive + equipment upgrade for Q1 2026.'
  );

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Verify all execution records
SELECT 
  TO_CHAR(et.tanggal_eksekusi, 'YYYY-MM-DD') as tanggal,
  spk.nomor_spk,
  spk.lokasi,
  et.hasil,
  et.petugas,
  LEFT(et.catatan, 80) as catatan_preview
FROM public.ops_eksekusi_tindakan et
JOIN public.ops_spk_tindakan spk ON spk.id_spk = et.id_spk
WHERE spk.nomor_spk LIKE 'SPK/PANEN/2025/%'
ORDER BY et.tanggal_eksekusi;
-- Expected: 8 rows

-- Parse hasil for summary (extract ton TBS and reject %)
SELECT 
  spk.nomor_spk,
  COUNT(et.id_eksekusi_tindakan) as jumlah_eksekusi,
  STRING_AGG(TO_CHAR(et.tanggal_eksekusi, 'DD Mon'), ', ' ORDER BY et.tanggal_eksekusi) as tanggal_list
FROM public.ops_eksekusi_tindakan et
JOIN public.ops_spk_tindakan spk ON spk.id_spk = et.id_spk
WHERE spk.nomor_spk LIKE 'SPK/PANEN/2025/%'
GROUP BY spk.nomor_spk
ORDER BY spk.nomor_spk;
-- Expected: 4 SPKs, each with 2 executions

-- Full workflow verification (SOP → Jadwal → SPK → Eksekusi)
SELECT 
  fb.nama_fase,
  st.nama_sub,
  jt.frekuensi,
  spk.nomor_spk,
  spk.status,
  COUNT(et.id_eksekusi_tindakan) as eksekusi_count
FROM public.ops_fase_besar fb
JOIN public.ops_sub_tindakan st ON st.id_fase_besar = fb.id_fase_besar
JOIN public.ops_jadwal_tindakan jt ON jt.id_sub_tindakan = st.id_sub_tindakan
JOIN public.ops_spk_tindakan spk ON spk.id_jadwal_tindakan = jt.id_jadwal_tindakan
LEFT JOIN public.ops_eksekusi_tindakan et ON et.id_spk = spk.id_spk
WHERE fb.nama_fase = 'Pemanenan'
  AND spk.nomor_spk LIKE 'SPK/PANEN/2025/%'
GROUP BY fb.nama_fase, st.nama_sub, jt.frekuensi, spk.nomor_spk, spk.status
ORDER BY spk.nomor_spk;
-- Expected: 4 rows, each with eksekusi_count = 2

-- Summary statistics
SELECT 
  'Execution Records Summary' as report,
  COUNT(*) as total_executions,
  COUNT(DISTINCT id_spk) as total_spk_dengan_eksekusi,
  COUNT(DISTINCT petugas) as unique_teams,
  MIN(tanggal_eksekusi) as earliest_panen,
  MAX(tanggal_eksekusi) as latest_panen,
  MAX(tanggal_eksekusi) - MIN(tanggal_eksekusi) as duration_days
FROM public.ops_eksekusi_tindakan
WHERE id_spk IN (
  SELECT id_spk FROM public.ops_spk_tindakan WHERE nomor_spk LIKE 'SPK/PANEN/2025/%'
);
-- Expected: 8 executions, 4 SPKs, 2 teams, ~25 days duration

-- ================================================================
-- ROLLBACK (if needed)
-- ================================================================

-- Uncomment if you need to rollback:
/*
DELETE FROM public.ops_eksekusi_tindakan 
WHERE id_spk IN (
  SELECT id_spk FROM public.ops_spk_tindakan WHERE nomor_spk LIKE 'SPK/PANEN/2025/%'
);
*/

-- ================================================================
-- END OF SCRIPT
-- ================================================================

-- NEXT STEP: Update operasionalService.js to query this data!
-- See: phase1_step5_update_service_functions.md
