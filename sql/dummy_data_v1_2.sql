-- ============================================================
-- DUMMY DATA v1.2 - Untuk Testing API Dashboard KPI Eksekutif
-- ============================================================
-- Jalankan script ini di Supabase SQL Editor
-- 
-- Filosofi TEPAT: Data dummy harus realistis dan sesuai dengan
--                  expected values di dokumentasi API
-- ============================================================

-- STEP 1: Buat tabel jika belum ada
-- ============================================================

-- Tabel: spk_header (Work Order Header)
CREATE TABLE IF NOT EXISTS public.spk_header (
  id_spk UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_spk VARCHAR(255) NOT NULL,
  id_asisten_pembuat VARCHAR(50) NOT NULL,
  tanggal_target DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel: spk_tugas (Work Order Tasks)
CREATE TABLE IF NOT EXISTS public.spk_tugas (
  id_tugas UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_spk UUID REFERENCES spk_header(id_spk) ON DELETE CASCADE,
  id_pelaksana VARCHAR(50) NOT NULL,
  tipe_tugas VARCHAR(50) NOT NULL, -- VALIDASI_DRONE, APH, SANITASI
  status_tugas VARCHAR(50) NOT NULL DEFAULT 'BARU', -- BARU, DIKERJAKAN, SELESAI
  target_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel: log_aktivitas_5w1h (Field Activity Logs - 5W1H)
CREATE TABLE IF NOT EXISTS public.log_aktivitas_5w1h (
  id_log UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_tugas UUID REFERENCES spk_tugas(id_tugas) ON DELETE SET NULL,
  id_npokok VARCHAR(50) NOT NULL, -- ID Pohon
  id_petugas VARCHAR(50) NOT NULL, -- User ID (dari JWT)
  timestamp_eksekusi TIMESTAMP WITH TIME ZONE NOT NULL,
  gps_lat DECIMAL(10, 8),
  gps_long DECIMAL(11, 8),
  hasil_json JSONB NOT NULL, -- Contains status_aktual, tipe_aplikasi, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes untuk performance
CREATE INDEX IF NOT EXISTS idx_spk_tugas_tipe ON spk_tugas(tipe_tugas);
CREATE INDEX IF NOT EXISTS idx_spk_tugas_status ON spk_tugas(status_tugas);
CREATE INDEX IF NOT EXISTS idx_log_npokok ON log_aktivitas_5w1h(id_npokok);
CREATE INDEX IF NOT EXISTS idx_log_timestamp ON log_aktivitas_5w1h(timestamp_eksekusi);
CREATE INDEX IF NOT EXISTS idx_log_hasil_json ON log_aktivitas_5w1h USING GIN (hasil_json);

-- ============================================================
-- STEP 2: Clear existing dummy data (optional - uncomment jika perlu)
-- ============================================================
-- DELETE FROM log_aktivitas_5w1h WHERE id_npokok LIKE 'DUMMY%';
-- DELETE FROM spk_tugas WHERE id_tugas IN (
--   SELECT id_tugas FROM spk_tugas WHERE id_spk IN (
--     SELECT id_spk FROM spk_header WHERE nama_spk LIKE 'DUMMY%'
--   )
-- );
-- DELETE FROM spk_header WHERE nama_spk LIKE 'DUMMY%';

-- ============================================================
-- STEP 3: Insert Dummy Data
-- ============================================================

-- Insert SPK Header
INSERT INTO public.spk_header (id_spk, nama_spk, id_asisten_pembuat, tanggal_target)
VALUES 
  ('d0e12345-0001-0001-0001-000000000001'::UUID, 'DUMMY SPK Validasi Drone Oktober', 'AM001', '2025-10-28'),
  ('d0e12345-0002-0002-0002-000000000002'::UUID, 'DUMMY SPK Aplikasi APH Oktober', 'AM001', '2025-10-30')
ON CONFLICT (id_spk) DO NOTHING;

-- Insert SPK Tugas (Work Orders)
INSERT INTO public.spk_tugas (id_tugas, id_spk, id_pelaksana, tipe_tugas, status_tugas, target_json)
VALUES 
  -- Tugas Validasi (SELESAI)
  ('d0e12345-a001-a001-a001-000000000011'::UUID, 'd0e12345-0001-0001-0001-000000000001'::UUID, 'MANDOR001', 'VALIDASI_DRONE', 'SELESAI', '{"blok":"B01","target_pohon":50}'),
  
  -- Tugas APH (SELESAI)
  ('d0e12345-a002-a002-a002-000000000012'::UUID, 'd0e12345-0002-0002-0002-000000000002'::UUID, 'TIM_APH_001', 'APH', 'SELESAI', '{"pohon_target":["DUMMY-P001","DUMMY-P002"]}'),
  
  -- Tugas Sanitasi (BARU - belum dikerjakan)
  ('d0e12345-a003-a003-a003-000000000013'::UUID, 'd0e12345-0002-0002-0002-000000000002'::UUID, 'TIM_SANITASI_001', 'SANITASI', 'BARU', '{"pohon_g4":["DUMMY-P003"]}'),
  
  -- Tugas APH (DIKERJAKAN - sedang berjalan)
  ('d0e12345-a004-a004-a004-000000000014'::UUID, 'd0e12345-0002-0002-0002-000000000002'::UUID, 'TIM_APH_002', 'APH', 'DIKERJAKAN', '{"pohon_target":["DUMMY-P004"]}'),
  
  -- Tugas Sanitasi (DIKERJAKAN - sedang berjalan)
  ('d0e12345-a005-a005-a005-000000000015'::UUID, 'd0e12345-0002-0002-0002-000000000002'::UUID, 'TIM_SANITASI_002', 'SANITASI', 'DIKERJAKAN', '{"pohon_g4":["DUMMY-P005"]}')
ON CONFLICT (id_tugas) DO NOTHING;

-- Insert Log Aktivitas (5W1H Digital Trails)

-- Log #1: Validasi Drone (Pohon Normal - tidak ada masalah)
INSERT INTO public.log_aktivitas_5w1h (id_log, id_tugas, id_npokok, id_petugas, timestamp_eksekusi, gps_lat, gps_long, hasil_json)
VALUES (
  'log00001-0001-0001-0001-000000000001'::UUID,
  'd0e12345-a001-a001-a001-000000000011'::UUID,
  'DUMMY-P000',
  'MANDOR001',
  NOW() - INTERVAL '10 days', -- Hari -10
  -1.234567,
  101.234567,
  '{"status_aktual":"Normal","catatan":"Pohon sehat, tidak ada gejala"}' :: JSONB
)
ON CONFLICT (id_log) DO NOTHING;

-- Log #2: Validasi Drone - Deteksi G1 (HARI -8)
INSERT INTO public.log_aktivitas_5w1h (id_log, id_tugas, id_npokok, id_petugas, timestamp_eksekusi, gps_lat, gps_long, hasil_json)
VALUES (
  'log00002-0002-0002-0002-000000000002'::UUID,
  'd0e12345-a001-a001-a001-000000000011'::UUID,
  'DUMMY-P001', -- Pohon ini yang akan dapat APH
  'MANDOR001',
  NOW() - INTERVAL '8 days', -- Hari -8
  -1.234568,
  101.234568,
  '{"status_aktual":"G1 (Ganoderma Awal)","catatan":"Terdeteksi gejala awal ganoderma","foto_url":"https://example.com/g1-detection.jpg"}' :: JSONB
)
ON CONFLICT (id_log) DO NOTHING;

-- Log #3: Validasi Drone - Deteksi G4
INSERT INTO public.log_aktivitas_5w1h (id_log, id_tugas, id_npokok, id_petugas, timestamp_eksekusi, gps_lat, gps_long, hasil_json)
VALUES (
  'log00003-0003-0003-0003-000000000003'::UUID,
  'd0e12345-a001-a001-a001-000000000011'::UUID,
  'DUMMY-P003',
  'MANDOR001',
  NOW() - INTERVAL '9 days', -- Hari -9
  -1.234569,
  101.234569,
  '{"status_aktual":"G4 (Pohon Mati)","catatan":"Pohon sudah mati, perlu sanitasi segera"}' :: JSONB
)
ON CONFLICT (id_log) DO NOTHING;

-- Log #4: Eksekusi APH untuk Pohon DUMMY-P001 (HARI -6)
-- Selisih dari Log #2: 8 hari - 6 hari = 2 hari (LEAD TIME APH = 2.0 hari)
INSERT INTO public.log_aktivitas_5w1h (id_log, id_tugas, id_npokok, id_petugas, timestamp_eksekusi, gps_lat, gps_long, hasil_json)
VALUES (
  'log00004-0004-0004-0004-000000000004'::UUID,
  'd0e12345-a002-a002-a002-000000000012'::UUID,
  'DUMMY-P001', -- Same pohon as Log #2
  'TIM_APH_001',
  NOW() - INTERVAL '6 days', -- Hari -6
  -1.234568,
  101.234568,
  '{"tipe_aplikasi":"APH","volume_liter":5.0,"bahan":"Konsorsium Mikroba","metode":"Infusi","catatan":"APH preventif untuk G1","foto_sebelum":"https://example.com/before.jpg","foto_sesudah":"https://example.com/after.jpg"}' :: JSONB
)
ON CONFLICT (id_log) DO NOTHING;

-- Log #5: Deteksi G1 lainnya (untuk variasi tren)
INSERT INTO public.log_aktivitas_5w1h (id_log, id_tugas, id_npokok, id_petugas, timestamp_eksekusi, gps_lat, gps_long, hasil_json)
VALUES (
  'log00005-0005-0005-0005-000000000005'::UUID,
  'd0e12345-a001-a001-a001-000000000011'::UUID,
  'DUMMY-P002',
  'MANDOR001',
  NOW() - INTERVAL '5 days', -- Hari -5
  -1.234570,
  101.234570,
  '{"status_aktual":"G1 (Ganoderma Awal)","catatan":"Deteksi kedua"}' :: JSONB
)
ON CONFLICT (id_log) DO NOTHING;

-- ============================================================
-- STEP 4: Verify Data
-- ============================================================

-- Check SPK Header
SELECT 'spk_header' as table_name, COUNT(*) as row_count FROM spk_header WHERE nama_spk LIKE 'DUMMY%'
UNION ALL
SELECT 'spk_tugas', COUNT(*) FROM spk_tugas WHERE id_spk IN (SELECT id_spk FROM spk_header WHERE nama_spk LIKE 'DUMMY%')
UNION ALL
SELECT 'log_aktivitas_5w1h', COUNT(*) FROM log_aktivitas_5w1h WHERE id_npokok LIKE 'DUMMY%';

-- Verify status distribution (untuk KRI Kepatuhan SOP)
SELECT status_tugas, COUNT(*) as count 
FROM spk_tugas 
WHERE id_spk IN (SELECT id_spk FROM spk_header WHERE nama_spk LIKE 'DUMMY%')
GROUP BY status_tugas;

-- Verify G1 detections
SELECT id_npokok, timestamp_eksekusi, hasil_json->>'status_aktual' as status
FROM log_aktivitas_5w1h
WHERE hasil_json->>'status_aktual' = 'G1 (Ganoderma Awal)'
ORDER BY timestamp_eksekusi;

-- Verify APH executions
SELECT id_npokok, timestamp_eksekusi, hasil_json->>'tipe_aplikasi' as tipe
FROM log_aktivitas_5w1h
WHERE hasil_json->>'tipe_aplikasi' = 'APH'
ORDER BY timestamp_eksekusi;

-- ============================================================
-- EXPECTED API RESULTS setelah insert:
-- ============================================================
-- kri_lead_time_aph: 2.0 hari (Log #2 [Hari -8] → Log #4 [Hari -6])
-- kri_kepatuhan_sop: 40.0% (2 SELESAI / 5 TOTAL)
-- tren_insidensi_baru: [{date: 'Hari -8', count: 1}, {date: 'Hari -5', count: 1}]
-- tren_g4_aktif: 2 (1 BARU + 1 DIKERJAKAN)
-- ============================================================
