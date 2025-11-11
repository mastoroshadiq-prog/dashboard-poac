-- ================================================================
-- PHASE 2: MULTI-PHASE LIFECYCLE DATA
-- ================================================================
-- Date: November 11, 2025
-- Purpose: Implement complete lifecycle coverage for all 5 phases
-- Target: Add 7 new SPKs (total: 11 SPKs, 22 executions)
--
-- Phases covered:
-- 1. Pembibitan (Nursery) - NEW
-- 2. TBM (Immature) - NEW
-- 3. TM (Mature) - NEW (additional to PANEN)
-- 4. Pemanenan (Harvest) - ✅ Already complete from Phase 1
-- 5. Replanting (Renewal) - NEW (planning only)
-- ================================================================

-- ================================================================
-- SECTION 1: PEMBIBITAN (Nursery Phase)
-- ================================================================
-- Business Context: Pre-nursery and main nursery operations
-- Target: 5,000 bibit with 95% survival rate
-- Timeline: 2025-01-01 to 2025-10-30 (10 months)
-- ================================================================

-- 1.1 Check if Pembibitan phase exists, if not create it
DO $$
DECLARE
  v_pembibitan_id UUID;  -- ALL IDs are UUID!
  v_sop_pembibitan_id UUID;
  v_sub_penyemaian_id UUID;
  v_sub_perawatan_id UUID;
  v_sub_seleksi_id UUID;
  v_jadwal_pembibitan_id UUID;
BEGIN
  -- Get or create ops_fase_besar for Pembibitan
  SELECT id_fase_besar INTO v_pembibitan_id
  FROM ops_fase_besar
  WHERE nama_fase = 'Pembibitan';
  
  IF v_pembibitan_id IS NULL THEN
    INSERT INTO ops_fase_besar (nama_fase, umur_mulai, umur_selesai, deskripsi)
    VALUES ('Pembibitan', 0, 1, 'Fase pembibitan di nursery (pre-nursery dan main nursery)')
    RETURNING id_fase_besar INTO v_pembibitan_id;
    RAISE NOTICE 'Created ops_fase_besar for Pembibitan: %', v_pembibitan_id;
  ELSE
    RAISE NOTICE 'Pembibitan phase already exists: %', v_pembibitan_id;
  END IF;

  -- Get or create SOP Tipe for Pembibitan
  SELECT id_tipe_sop INTO v_sop_pembibitan_id
  FROM sop_tipe
  WHERE nama_tipe_sop = 'SOP Pembibitan';
  
  IF v_sop_pembibitan_id IS NULL THEN
    INSERT INTO sop_tipe (nama_tipe_sop, deskripsi)
    VALUES ('SOP Pembibitan', 'Standar operasional prosedur untuk pembibitan kelapa sawit')
    RETURNING id_tipe_sop INTO v_sop_pembibitan_id;
    RAISE NOTICE 'Created sop_tipe for Pembibitan: %', v_sop_pembibitan_id;
  END IF;

  -- Create SOP Referensi for Pembibitan
  INSERT INTO sop_referensi (id_tipe_sop, nama_sop, deskripsi)
  VALUES 
    (v_sop_pembibitan_id, 'Penyemaian Benih Pre-Nursery', 
     'SOP-PBT-001 v1.0: Prosedur penyemaian benih di pre-nursery dengan kontrol kelembaban dan suhu'),
    (v_sop_pembibitan_id, 'Perawatan Bibit Main Nursery',
     'SOP-PBT-002 v1.0: Prosedur penyiraman, pemupukan, dan monitoring kesehatan bibit'),
    (v_sop_pembibitan_id, 'Seleksi dan Grading Bibit',
     'SOP-PBT-003 v1.0: Kriteria seleksi bibit berkualitas siap tanam (tinggi, diameter, daun)');

  -- Create ops_sub_tindakan for Pembibitan
  INSERT INTO ops_sub_tindakan (id_fase_besar, nama_sub, deskripsi)
  VALUES 
    (v_pembibitan_id, 'Penyemaian Benih', 'Penyemaian benih pre-nursery dengan media tanam khusus'),
    (v_pembibitan_id, 'Perawatan Bibit', 'Penyiraman, pemupukan, dan monitoring bibit'),
    (v_pembibitan_id, 'Seleksi Bibit', 'Quality control dan grading bibit siap tanam');

  -- Get IDs for sub_tindakan
  SELECT id_sub_tindakan INTO v_sub_penyemaian_id
  FROM ops_sub_tindakan
  WHERE id_fase_besar = v_pembibitan_id AND nama_sub = 'Penyemaian Benih';

  SELECT id_sub_tindakan INTO v_sub_perawatan_id
  FROM ops_sub_tindakan
  WHERE id_fase_besar = v_pembibitan_id AND nama_sub = 'Perawatan Bibit';

  SELECT id_sub_tindakan INTO v_sub_seleksi_id
  FROM ops_sub_tindakan
  WHERE id_fase_besar = v_pembibitan_id AND nama_sub = 'Seleksi Bibit';

  -- Create ops_jadwal_tindakan for Pembibitan
  INSERT INTO ops_jadwal_tindakan (
    id_sub_tindakan, frekuensi, interval_hari,
    tanggal_mulai, tanggal_selesai
  )
  VALUES (
    v_sub_perawatan_id, 'Harian', 1,
    '2025-01-01', '2025-10-30'
  )
  RETURNING id_jadwal_tindakan INTO v_jadwal_pembibitan_id;

  RAISE NOTICE 'Created jadwal for Pembibitan: %', v_jadwal_pembibitan_id;

  -- Create ops_spk_tindakan for Pembibitan (2 SPKs)
  INSERT INTO ops_spk_tindakan (
    nomor_spk, id_jadwal_tindakan, tanggal_terbit, tanggal_mulai, tanggal_selesai,
    lokasi, mandor, status, uraian_pekerjaan, catatan
  )
  VALUES 
    -- SPK 1: Pre-Nursery Batch 1
    (
      'SPK/PEMBIBITAN/2025/001', v_jadwal_pembibitan_id, '2025-01-05',
      '2025-01-10', '2025-05-31', 'Nursery Block A - Pre-Nursery',
      'Budi Santoso', 'SELESAI',
      'Penyemaian 2,500 benih varietas DxP Yangambi',
      'Batch 1: Target survival >95%. Tim: Andi, Sari, Dewi'
    ),
    -- SPK 2: Main Nursery Batch 2
    (
      'SPK/PEMBIBITAN/2025/002', v_jadwal_pembibitan_id, '2025-05-10',
      '2025-06-01', '2025-10-30', 'Nursery Block B - Main Nursery',
      'Siti Aminah', 'SELESAI',
      'Pemindahan ke main nursery dan perawatan intensif',
      'Batch 2: 2,500 bibit siap tanam. Tim: Rina, Tono, Joko'
    );

  -- Create ops_eksekusi_tindakan for Pembibitan (4 executions)
  INSERT INTO ops_eksekusi_tindakan (
    id_spk, tanggal_eksekusi, petugas, hasil, catatan
  )
  VALUES
    -- Executions for SPK/PEMBIBITAN/2025/001
    (
      (SELECT id_spk FROM ops_spk_tindakan WHERE nomor_spk = 'SPK/PEMBIBITAN/2025/001'),
      '2025-02-15', 'Andi, Sari',
      '1,250 bibit semai, survival 97%',
      'Pre-nursery batch pertama: 1,250 bibit dari 2,500 benih. Survival rate 97% (excellent). Media tanam optimal.'
    ),
    (
      (SELECT id_spk FROM ops_spk_tindakan WHERE nomor_spk = 'SPK/PEMBIBITAN/2025/001'),
      '2025-04-20', 'Andi, Dewi',
      '1,200 bibit semai, survival 93%',
      'Pre-nursery batch kedua: 1,200 bibit dari sisa 2,500 benih. Survival 93% (minor fungus issue resolved).'
    ),
    -- Executions for SPK/PEMBIBITAN/2025/002
    (
      (SELECT id_spk FROM ops_spk_tindakan WHERE nomor_spk = 'SPK/PEMBIBITAN/2025/002'),
      '2025-07-10', 'Rina, Tono',
      '1,300 bibit main nursery, growth rate normal',
      'Main nursery pemindahan pertama: 1,300 bibit dengan pertumbuhan normal. Height avg 45cm, 5 daun.'
    ),
    (
      (SELECT id_spk FROM ops_spk_tindakan WHERE nomor_spk = 'SPK/PEMBIBITAN/2025/002'),
      '2025-09-25', 'Joko, Rina',
      '1,250 bibit siap tanam, grading A: 95%',
      'Main nursery final: 1,250 bibit lulus seleksi. Grading A: 95% (height >60cm, 8 daun). Siap tanam!'
    );

  RAISE NOTICE '✅ PEMBIBITAN data inserted successfully!';
  RAISE NOTICE 'Total bibit: ~5,000 | Avg survival: 95%%';
END $$;

-- ================================================================
-- SECTION 2: TBM (Tanaman Belum Menghasilkan / Immature)
-- ================================================================
-- Business Context: Young palms 1-3 years old
-- Target: 120 ha with +12% YoY growth rate
-- Timeline: 2025-01-15 to 2025-10-30
-- ================================================================

DO $$
DECLARE
  v_tbm_id UUID;  -- ALL IDs are UUID!
  v_sop_tbm_id UUID;
  v_sub_pemupukan_id UUID;
  v_sub_penyiangan_id UUID;
  v_sub_hama_id UUID;
  v_jadwal_tbm_id UUID;
BEGIN
  -- Get or create ops_fase_besar for TBM
  SELECT id_fase_besar INTO v_tbm_id
  FROM ops_fase_besar
  WHERE nama_fase = 'TBM';
  
  IF v_tbm_id IS NULL THEN
    INSERT INTO ops_fase_besar (nama_fase, umur_mulai, umur_selesai, deskripsi)
    VALUES ('TBM', 1, 3, 'Tanaman Belum Menghasilkan - perawatan tanaman muda umur 1-3 tahun')
    RETURNING id_fase_besar INTO v_tbm_id;
    RAISE NOTICE 'Created ops_fase_besar for TBM: %', v_tbm_id;
  ELSE
    RAISE NOTICE 'TBM phase already exists: %', v_tbm_id;
  END IF;

  -- Get or create SOP Tipe for TBM
  SELECT id_tipe_sop INTO v_sop_tbm_id
  FROM sop_tipe
  WHERE nama_tipe_sop = 'SOP TBM';
  
  IF v_sop_tbm_id IS NULL THEN
    INSERT INTO sop_tipe (nama_tipe_sop, deskripsi)
    VALUES ('SOP TBM', 'Standar operasional prosedur perawatan TBM')
    RETURNING id_tipe_sop INTO v_sop_tbm_id;
    RAISE NOTICE 'Created sop_tipe for TBM: %', v_sop_tbm_id;
  END IF;

  -- Create SOP Referensi for TBM
  INSERT INTO sop_referensi (id_tipe_sop, nama_sop, deskripsi)
  VALUES 
    (v_sop_tbm_id, 'Pemupukan TBM Tahun 1-3',
     'SOP-TBM-001 v1.0: Dosis dan jadwal pemupukan NPK untuk TBM umur 1-3 tahun'),
    (v_sop_tbm_id, 'Penyiangan dan Pengendalian Gulma TBM',
     'SOP-TBM-002 v1.0: Prosedur penyiangan manual dan rotary cutter untuk TBM'),
    (v_sop_tbm_id, 'Pengendalian Hama TBM',
     'SOP-TBM-003 v1.0: Monitoring dan pengendalian ulat api, kumbang tanduk');

  -- Create ops_sub_tindakan for TBM
  INSERT INTO ops_sub_tindakan (id_fase_besar, nama_sub, deskripsi)
  VALUES 
    (v_tbm_id, 'Pemupukan TBM', 'Aplikasi pupuk NPK sesuai umur tanaman'),
    (v_tbm_id, 'Penyiangan Gulma', 'Pembersihan gulma di piringan dan gawangan'),
    (v_tbm_id, 'Pengendalian Hama', 'Monitoring dan treatment hama/penyakit');

  -- Get IDs for sub_tindakan
  SELECT id_sub_tindakan INTO v_sub_pemupukan_id
  FROM ops_sub_tindakan
  WHERE id_fase_besar = v_tbm_id AND nama_sub = 'Pemupukan TBM';

  SELECT id_sub_tindakan INTO v_sub_penyiangan_id
  FROM ops_sub_tindakan
  WHERE id_fase_besar = v_tbm_id AND nama_sub = 'Penyiangan Gulma';

  SELECT id_sub_tindakan INTO v_sub_hama_id
  FROM ops_sub_tindakan
  WHERE id_fase_besar = v_tbm_id AND nama_sub = 'Pengendalian Hama';

  -- Create ops_jadwal_tindakan for TBM (focus on Pemupukan)
  INSERT INTO ops_jadwal_tindakan (
    id_sub_tindakan, frekuensi, interval_hari,
    tanggal_mulai, tanggal_selesai
  )
  VALUES (
    v_sub_pemupukan_id, 'Bulanan', 30,
    '2025-01-15', '2025-10-30'
  )
  RETURNING id_jadwal_tindakan INTO v_jadwal_tbm_id;

  RAISE NOTICE 'Created jadwal for TBM: %', v_jadwal_tbm_id;

  -- Create ops_spk_tindakan for TBM (3 SPKs)
  INSERT INTO ops_spk_tindakan (
    nomor_spk, id_jadwal_tindakan, tanggal_terbit, tanggal_mulai, tanggal_selesai,
    lokasi, mandor, status, uraian_pekerjaan, catatan
  )
  VALUES 
    -- SPK 1: Pemupukan Quarter 1
    (
      'SPK/TBM/2025/001', v_jadwal_tbm_id, '2025-01-10',
      '2025-01-15', '2025-03-31', 'Afdeling 1 - TBM Block A-C',
      'Agus Wijaya', 'SELESAI',
      'Pemupukan TBM 40 ha - NPK 15-15-6-4 dosis 1.5kg/pohon',
      'Q1: Umur 18 bulan. Tim: Bayu, Citra, Dedi, Eko'
    ),
    -- SPK 2: Pemupukan Quarter 2
    (
      'SPK/TBM/2025/002', v_jadwal_tbm_id, '2025-04-05',
      '2025-04-10', '2025-06-30', 'Afdeling 1 - TBM Block D-F',
      'Yudi Pratama', 'SELESAI',
      'Pemupukan TBM 40 ha - NPK 15-15-6-4 dosis 2.0kg/pohon',
      'Q2: Umur 21 bulan. Tim: Feri, Gita, Hani'
    ),
    -- SPK 3: Pemupukan Quarter 3
    (
      'SPK/TBM/2025/003', v_jadwal_tbm_id, '2025-07-01',
      '2025-07-05', '2025-09-30', 'Afdeling 2 - TBM Block G-I',
      'Rina Kusuma', 'SELESAI',
      'Pemupukan TBM 40 ha - NPK 15-15-6-4 dosis 2.5kg/pohon',
      'Q3: Umur 24 bulan. Tim: Ika, Jaya, Kurnia'
    );

  -- Create ops_eksekusi_tindakan for TBM (6 executions)
  INSERT INTO ops_eksekusi_tindakan (
    id_spk, tanggal_eksekusi, petugas, hasil, catatan
  )
  VALUES
    -- Executions for SPK/TBM/2025/001
    (
      (SELECT id_spk FROM ops_spk_tindakan WHERE nomor_spk = 'SPK/TBM/2025/001'),
      '2025-02-10', 'Bayu, Citra',
      '20 ha dipupuk, growth rate +10%',
      'TBM Block A-B: 20 ha aplikasi NPK. Monitoring: tinggi avg +35cm dalam 3 bulan (growth +10%).'
    ),
    (
      (SELECT id_spk FROM ops_spk_tindakan WHERE nomor_spk = 'SPK/TBM/2025/001'),
      '2025-03-20', 'Dedi, Eko',
      '20 ha dipupuk, growth rate +11%',
      'TBM Block C: 20 ha aplikasi NPK. Monitoring: tinggi avg +38cm dalam 3 bulan (growth +11%).'
    ),
    -- Executions for SPK/TBM/2025/002
    (
      (SELECT id_spk FROM ops_spk_tindakan WHERE nomor_spk = 'SPK/TBM/2025/002'),
      '2025-05-05', 'Feri, Gita',
      '20 ha dipupuk, growth rate +12%',
      'TBM Block D-E: 20 ha aplikasi NPK. Monitoring: tinggi avg +42cm, diameter +1.2cm (growth +12%).'
    ),
    (
      (SELECT id_spk FROM ops_spk_tindakan WHERE nomor_spk = 'SPK/TBM/2025/002'),
      '2025-06-15', 'Hani',
      '20 ha dipupuk, growth rate +13%',
      'TBM Block F: 20 ha aplikasi NPK. Monitoring: tinggi avg +45cm, excellent growth (+13% YoY).'
    ),
    -- Executions for SPK/TBM/2025/003
    (
      (SELECT id_spk FROM ops_spk_tindakan WHERE nomor_spk = 'SPK/TBM/2025/003'),
      '2025-08-10', 'Ika, Jaya',
      '20 ha dipupuk, growth rate +12%',
      'TBM Block G-H: 20 ha aplikasi NPK. Monitoring: pertumbuhan stabil +12% YoY.'
    ),
    (
      (SELECT id_spk FROM ops_spk_tindakan WHERE nomor_spk = 'SPK/TBM/2025/003'),
      '2025-09-25', 'Kurnia',
      '20 ha dipupuk, growth rate +11%',
      'TBM Block I: 20 ha aplikasi NPK final. Total 120 ha completed. Avg growth +11.5% YoY.'
    );

  RAISE NOTICE '✅ TBM data inserted successfully!';
  RAISE NOTICE 'Total lahan: 120 ha | Avg growth: +12%% YoY';
END $$;

-- ================================================================
-- SECTION 3: TM (Tanaman Menghasilkan / Mature - Beyond PANEN)
-- ================================================================
-- Business Context: Mature palms 3-25 years - maintenance activities
-- Note: PANEN already implemented in Phase 1
-- Target: 450 ha with productivity 22 ton/ha
-- Timeline: 2025-02-01 to 2025-10-30
-- ================================================================

DO $$
DECLARE
  v_tm_id UUID;  -- ALL IDs are UUID!
  v_sop_tm_id UUID;
  v_sub_pemupukan_tm_id UUID;
  v_sub_perawatan_id UUID;
  v_jadwal_tm_id UUID;
BEGIN
  -- Get or create ops_fase_besar for TM
  SELECT id_fase_besar INTO v_tm_id
  FROM ops_fase_besar
  WHERE nama_fase = 'TM';
  
  IF v_tm_id IS NULL THEN
    INSERT INTO ops_fase_besar (nama_fase, umur_mulai, umur_selesai, deskripsi)
    VALUES ('TM', 3, 25, 'Tanaman Menghasilkan - perawatan tanaman produktif umur 3-25 tahun')
    RETURNING id_fase_besar INTO v_tm_id;
    RAISE NOTICE 'Created ops_fase_besar for TM: %', v_tm_id;
  ELSE
    RAISE NOTICE 'TM phase already exists: %', v_tm_id;
  END IF;

  -- Get or create SOP Tipe for TM
  SELECT id_tipe_sop INTO v_sop_tm_id
  FROM sop_tipe
  WHERE nama_tipe_sop = 'SOP TM';
  
  IF v_sop_tm_id IS NULL THEN
    INSERT INTO sop_tipe (nama_tipe_sop, deskripsi)
    VALUES ('SOP TM', 'Standar operasional prosedur perawatan TM produktif')
    RETURNING id_tipe_sop INTO v_sop_tm_id;
    RAISE NOTICE 'Created sop_tipe for TM: %', v_sop_tm_id;
  END IF;

  -- Create SOP Referensi for TM
  INSERT INTO sop_referensi (id_tipe_sop, nama_sop, deskripsi)
  VALUES 
    (v_sop_tm_id, 'Pemupukan TM Produktif',
     'SOP-TM-001 v1.0: Dosis dan jadwal pemupukan NPK untuk TM produktif'),
    (v_sop_tm_id, 'Perawatan Tajuk dan Pruning',
     'SOP-TM-002 v1.0: Prosedur pemotongan pelepah dan sanitasi tajuk untuk optimalisasi produksi');

  -- Create ops_sub_tindakan for TM (additional to PANEN)
  INSERT INTO ops_sub_tindakan (id_fase_besar, nama_sub, deskripsi)
  VALUES 
    (v_tm_id, 'Pemupukan TM', 'Aplikasi pupuk NPK untuk tanaman produktif'),
    (v_tm_id, 'Perawatan Tajuk', 'Pruning pelepah dan sanitasi kanopi');

  -- Get IDs for sub_tindakan
  SELECT id_sub_tindakan INTO v_sub_pemupukan_tm_id
  FROM ops_sub_tindakan
  WHERE id_fase_besar = v_tm_id AND nama_sub = 'Pemupukan TM';

  SELECT id_sub_tindakan INTO v_sub_perawatan_id
  FROM ops_sub_tindakan
  WHERE id_fase_besar = v_tm_id AND nama_sub = 'Perawatan Tajuk';

  -- Create ops_jadwal_tindakan for TM
  INSERT INTO ops_jadwal_tindakan (
    id_sub_tindakan, frekuensi, interval_hari,
    tanggal_mulai, tanggal_selesai
  )
  VALUES (
    v_sub_pemupukan_tm_id, 'Bulanan', 30,
    '2025-02-01', '2025-10-30'
  )
  RETURNING id_jadwal_tindakan INTO v_jadwal_tm_id;

  RAISE NOTICE 'Created jadwal for TM: %', v_jadwal_tm_id;

  -- Create ops_spk_tindakan for TM (2 SPKs - maintenance only)
  INSERT INTO ops_spk_tindakan (
    nomor_spk, id_jadwal_tindakan, tanggal_terbit, tanggal_mulai, tanggal_selesai,
    lokasi, mandor, status, uraian_pekerjaan, catatan
  )
  VALUES 
    -- SPK 1: Pemupukan Semester 1
    (
      'SPK/TM/2025/001', v_jadwal_tm_id, '2025-02-01',
      '2025-02-05', '2025-06-30', 'Afdeling 3-4 - TM Produktif',
      'Herman Gunawan', 'SELESAI',
      'Pemupukan TM 225 ha - NPK 13-6-27-4 dosis 3.0kg/pohon',
      'Semester 1: Afdeling 3-4. Tim: Lisa, Miko, Nani, Omar, Putri'
    ),
    -- SPK 2: Pemupukan Semester 2
    (
      'SPK/TM/2025/002', v_jadwal_tm_id, '2025-07-01',
      '2025-07-05', '2025-10-30', 'Afdeling 5 - TM Produktif',
      'Siti Nurhaliza', 'SELESAI',
      'Pemupukan TM 225 ha - NPK 13-6-27-4 dosis 3.0kg/pohon',
      'Semester 2: Afdeling 5. Tim: Qori, Rudi, Siska, Tari'
    );

  -- Create ops_eksekusi_tindakan for TM (4 executions)
  INSERT INTO ops_eksekusi_tindakan (
    id_spk, tanggal_eksekusi, petugas, hasil, catatan
  )
  VALUES
    -- Executions for SPK/TM/2025/001
    (
      (SELECT id_spk FROM ops_spk_tindakan WHERE nomor_spk = 'SPK/TM/2025/001'),
      '2025-03-15', 'Lisa, Miko, Nani',
      '115 ha dipupuk, productivity 21 ton/ha',
      'TM Afdeling 3: 115 ha aplikasi NPK. Monitoring productivity: 21 ton/ha (good baseline).'
    ),
    (
      (SELECT id_spk FROM ops_spk_tindakan WHERE nomor_spk = 'SPK/TM/2025/001'),
      '2025-06-10', 'Omar, Putri',
      '110 ha dipupuk, productivity 22 ton/ha',
      'TM Afdeling 4: 110 ha aplikasi NPK. Monitoring productivity: 22 ton/ha (target achieved!).'
    ),
    -- Executions for SPK/TM/2025/002
    (
      (SELECT id_spk FROM ops_spk_tindakan WHERE nomor_spk = 'SPK/TM/2025/002'),
      '2025-08-20', 'Qori, Rudi, Siska',
      '120 ha dipupuk, productivity 23 ton/ha',
      'TM Afdeling 5 batch 1: 120 ha aplikasi NPK. Excellent productivity: 23 ton/ha (above target!).'
    ),
    (
      (SELECT id_spk FROM ops_spk_tindakan WHERE nomor_spk = 'SPK/TM/2025/002'),
      '2025-10-15', 'Tari',
      '105 ha dipupuk, productivity 22 ton/ha',
      'TM Afdeling 5 batch 2: 105 ha aplikasi NPK final. Total 450 ha completed. Avg: 22 ton/ha ✅'
    );

  RAISE NOTICE '✅ TM data inserted successfully!';
  RAISE NOTICE 'Total lahan: 450 ha | Avg productivity: 22 ton/ha';
END $$;

-- ================================================================
-- SECTION 4: REPLANTING (Renewal / Peremajaan)
-- ================================================================
-- Business Context: Planning for old palm replacement (>25 years)
-- Target: 15 ha identified for replanting (planning stage only)
-- Timeline: 2025-11-01 onwards (future planning)
-- ================================================================

DO $$
DECLARE
  v_replanting_id UUID;  -- ALL IDs are UUID!
  v_sop_replanting_id UUID;
  v_sub_survey_id UUID;
  v_sub_persiapan_id UUID;
  v_jadwal_replanting_id UUID;
BEGIN
  -- Get or create ops_fase_besar for Replanting
  SELECT id_fase_besar INTO v_replanting_id
  FROM ops_fase_besar
  WHERE nama_fase = 'Replanting';
  
  IF v_replanting_id IS NULL THEN
    INSERT INTO ops_fase_besar (nama_fase, umur_mulai, umur_selesai, deskripsi)
    VALUES ('Replanting', 25, 30, 'Peremajaan tanaman tua - penggantian tanaman >25 tahun')
    RETURNING id_fase_besar INTO v_replanting_id;
    RAISE NOTICE 'Created ops_fase_besar for Replanting: %', v_replanting_id;
  ELSE
    RAISE NOTICE 'Replanting phase already exists: %', v_replanting_id;
  END IF;

  -- Get or create SOP Tipe for Replanting
  SELECT id_tipe_sop INTO v_sop_replanting_id
  FROM sop_tipe
  WHERE nama_tipe_sop = 'SOP Replanting';
  
  IF v_sop_replanting_id IS NULL THEN
    INSERT INTO sop_tipe (nama_tipe_sop, deskripsi)
    VALUES ('SOP Replanting', 'Standar operasional prosedur peremajaan tanaman')
    RETURNING id_tipe_sop INTO v_sop_replanting_id;
    RAISE NOTICE 'Created sop_tipe for Replanting: %', v_sop_replanting_id;
  END IF;

  -- Create SOP Referensi for Replanting
  INSERT INTO sop_referensi (id_tipe_sop, nama_sop, deskripsi)
  VALUES 
    (v_sop_replanting_id, 'Survey dan Identifikasi Lahan Replanting',
     'SOP-RPL-001 v1.0: Kriteria dan prosedur survey lahan untuk peremajaan'),
    (v_sop_replanting_id, 'Persiapan Lahan Replanting',
     'SOP-RPL-002 v1.0: Prosedur land clearing, jalan pikul, dan persiapan tanam');

  -- Create ops_sub_tindakan for Replanting
  INSERT INTO ops_sub_tindakan (id_fase_besar, nama_sub, deskripsi)
  VALUES 
    (v_replanting_id, 'Survey Replanting', 'Survey produktivitas dan identifikasi blok replanting'),
    (v_replanting_id, 'Persiapan Lahan', 'Land clearing dan persiapan infrastruktur');

  -- Get IDs for sub_tindakan
  SELECT id_sub_tindakan INTO v_sub_survey_id
  FROM ops_sub_tindakan
  WHERE id_fase_besar = v_replanting_id AND nama_sub = 'Survey Replanting';

  SELECT id_sub_tindakan INTO v_sub_persiapan_id
  FROM ops_sub_tindakan
  WHERE id_fase_besar = v_replanting_id AND nama_sub = 'Persiapan Lahan';

  -- Create ops_jadwal_tindakan for Replanting (planning only)
  INSERT INTO ops_jadwal_tindakan (
    id_sub_tindakan, frekuensi, interval_hari,
    tanggal_mulai, tanggal_selesai
  )
  VALUES (
    v_sub_survey_id, 'Tahunan', 365,
    '2025-11-01', '2026-12-31'
  )
  RETURNING id_jadwal_tindakan INTO v_jadwal_replanting_id;

  RAISE NOTICE 'Created jadwal for Replanting (planning only): %', v_jadwal_replanting_id;

  -- NOTE: No SPKs or executions for Replanting (future planning only)
  RAISE NOTICE '✅ REPLANTING planning data inserted successfully!';
  RAISE NOTICE 'Target lahan: 15 ha | Status: PLANNING for 2026';
END $$;

-- ================================================================
-- VERIFICATION SECTION
-- ================================================================
-- Run queries to verify all data inserted correctly
-- ================================================================

DO $$
DECLARE
  v_total_spks INTEGER;
  v_total_executions INTEGER;
  v_pembibitan_count INTEGER;
  v_tbm_count INTEGER;
  v_tm_count INTEGER;
  v_panen_count INTEGER;
  v_replanting_count INTEGER;
BEGIN
  -- Count total SPKs
  SELECT COUNT(*) INTO v_total_spks FROM ops_spk_tindakan;
  
  -- Count total executions
  SELECT COUNT(*) INTO v_total_executions FROM ops_eksekusi_tindakan;
  
  -- Count SPKs per phase
  SELECT COUNT(DISTINCT spk.id_spk) INTO v_pembibitan_count
  FROM ops_spk_tindakan spk
  JOIN ops_jadwal_tindakan jt ON spk.id_jadwal_tindakan = jt.id_jadwal_tindakan
  JOIN ops_sub_tindakan st ON jt.id_sub_tindakan = st.id_sub_tindakan
  JOIN ops_fase_besar fb ON st.id_fase_besar = fb.id_fase_besar
  WHERE fb.nama_fase = 'Pembibitan';
  
  SELECT COUNT(DISTINCT spk.id_spk) INTO v_tbm_count
  FROM ops_spk_tindakan spk
  JOIN ops_jadwal_tindakan jt ON spk.id_jadwal_tindakan = jt.id_jadwal_tindakan
  JOIN ops_sub_tindakan st ON jt.id_sub_tindakan = st.id_sub_tindakan
  JOIN ops_fase_besar fb ON st.id_fase_besar = fb.id_fase_besar
  WHERE fb.nama_fase = 'TBM';
  
  SELECT COUNT(DISTINCT spk.id_spk) INTO v_tm_count
  FROM ops_spk_tindakan spk
  JOIN ops_jadwal_tindakan jt ON spk.id_jadwal_tindakan = jt.id_jadwal_tindakan
  JOIN ops_sub_tindakan st ON jt.id_sub_tindakan = st.id_sub_tindakan
  JOIN ops_fase_besar fb ON st.id_fase_besar = fb.id_fase_besar
  WHERE fb.nama_fase = 'TM';
  
  SELECT COUNT(DISTINCT spk.id_spk) INTO v_panen_count
  FROM ops_spk_tindakan spk
  JOIN ops_jadwal_tindakan jt ON spk.id_jadwal_tindakan = jt.id_jadwal_tindakan
  JOIN ops_sub_tindakan st ON jt.id_sub_tindakan = st.id_sub_tindakan
  JOIN ops_fase_besar fb ON st.id_fase_besar = fb.id_fase_besar
  WHERE fb.nama_fase = 'Pemanenan';
  
  SELECT COUNT(DISTINCT spk.id_spk) INTO v_replanting_count
  FROM ops_spk_tindakan spk
  JOIN ops_jadwal_tindakan jt ON spk.id_jadwal_tindakan = jt.id_jadwal_tindakan
  JOIN ops_sub_tindakan st ON jt.id_sub_tindakan = st.id_sub_tindakan
  JOIN ops_fase_besar fb ON st.id_fase_besar = fb.id_fase_besar
  WHERE fb.nama_fase = 'Replanting';
  
  RAISE NOTICE '';
  RAISE NOTICE '================================================';
  RAISE NOTICE '✅ PHASE 2 DATA VERIFICATION';
  RAISE NOTICE '================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Total SPKs across all phases: %', v_total_spks;
  RAISE NOTICE 'Total Executions: %', v_total_executions;
  RAISE NOTICE '';
  RAISE NOTICE 'SPKs by Phase:';
  RAISE NOTICE '  🌱 Pembibitan: % SPKs', v_pembibitan_count;
  RAISE NOTICE '  🌿 TBM: % SPKs', v_tbm_count;
  RAISE NOTICE '  🌳 TM: % SPKs', v_tm_count;
  RAISE NOTICE '  🌾 Panen: % SPKs (from Phase 1)', v_panen_count;
  RAISE NOTICE '  🔄 Replanting: % SPKs (planning only)', v_replanting_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Expected: 11 total SPKs (2+3+2+4+0)';
  RAISE NOTICE 'Expected: 22 total executions (4+6+4+8+0)';
  RAISE NOTICE '';
  
  IF v_total_spks = 11 AND v_total_executions = 22 THEN
    RAISE NOTICE '🎉 SUCCESS! All data inserted correctly!';
  ELSE
    RAISE WARNING '⚠️ WARNING: Data count mismatch! Please review.';
  END IF;
  
  RAISE NOTICE '================================================';
END $$;

-- ================================================================
-- SUMMARY QUERY - View all phases
-- ================================================================
SELECT 
  fb.nama_fase as "Phase",
  COUNT(DISTINCT st.id_sub_tindakan) as "Sub-Activities",
  COUNT(DISTINCT jt.id_jadwal_tindakan) as "Schedules",
  COUNT(DISTINCT spk.id_spk) as "SPKs",
  COUNT(DISTINCT et.id_eksekusi_tindakan) as "Executions",
  STRING_AGG(DISTINCT spk.status, ', ') as "SPK Status"
FROM ops_fase_besar fb
LEFT JOIN ops_sub_tindakan st ON st.id_fase_besar = fb.id_fase_besar
LEFT JOIN ops_jadwal_tindakan jt ON jt.id_sub_tindakan = st.id_sub_tindakan
LEFT JOIN ops_spk_tindakan spk ON spk.id_jadwal_tindakan = jt.id_jadwal_tindakan
LEFT JOIN ops_eksekusi_tindakan et ON et.id_spk = spk.id_spk
GROUP BY fb.id_fase_besar, fb.nama_fase
ORDER BY fb.umur_mulai;

-- End of phase2_multi_phase_data.sql
