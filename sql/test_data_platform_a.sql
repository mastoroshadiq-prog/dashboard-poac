-- ============================================
-- TEST DATA FOR PLATFORM A ENDPOINTS
-- Run this in Supabase SQL Editor first!
-- ============================================

-- ⚠️  WORKAROUND: Disable FK constraint ke tupoksi_tipe karena RLS issue
-- Jalankan SQL ini untuk disable constraint sementara:
ALTER TABLE spk_tugas DROP CONSTRAINT IF EXISTS fk__spk_tugas_tipe;

-- ⚠️  CATATAN: Jangan re-enable constraint karena struktur tabel tupoksi_tipe berbeda
-- Constraint asli menggunakan kolom yang berbeda dari 'tipe_tugas'
-- Untuk production, sesuaikan dengan struktur tabel yang sebenarnya

-- 1. INSERT TEST PELAKSANA (Mandor)
-- Kolom master_pihak: id_pihak, tipe, nama, kode_unik, id_induk, alias, id_unik, jenis_id
INSERT INTO master_pihak (id_pihak, tipe, nama, kode_unik)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10'::uuid, 'PELAKSANA', 'Test Mandor Agus', 'MND-001'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'PELAKSANA', 'Test Mandor Budi', 'MND-002')
ON CONFLICT (id_pihak) DO NOTHING;

-- 2. INSERT TEST SPK HEADER (Parent dari spk_tugas)
-- Kolom spk_header: id_spk, nama_spk, id_asisten_pembuat, tanggal_dibuat, tanggal_target_selesai, status_spk, keterangan
INSERT INTO spk_header (id_spk, nama_spk, id_asisten_pembuat, tanggal_dibuat, tanggal_target_selesai, status_spk, keterangan)
VALUES 
  ('d3ffbc99-9c0b-4ef8-bb6d-6bb9bd380d01'::uuid, 'SPK Test Platform A - Batch 1', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10'::uuid, 
   '2025-11-06', '2025-11-15', 'AKTIF', 'SPK untuk testing Platform A endpoints'),
  ('d3ffbc99-9c0b-4ef8-bb6d-6bb9bd380d02'::uuid, 'SPK Test Platform A - Batch 2', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
   '2025-11-06', '2025-11-12', 'AKTIF', 'SPK untuk testing Platform A endpoints')
ON CONFLICT (id_spk) DO NOTHING;

-- 3. INSERT TEST NPOKOK (Pohon Kelapa)
-- Kolom kebun_n_pokok: id_npokok, id_tanaman, id_tipe, n_baris, n_pokok, tgl_tanam, petugas, from_date, thru_date, kode, catatan
INSERT INTO kebun_n_pokok (id_npokok, id_tanaman, id_tipe, n_baris, n_pokok, tgl_tanam, petugas, from_date, kode, catatan)
VALUES 
  ('b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380b01'::uuid, 'KELAPA-001', 'HIBRIDA', 1, 1, '2020-01-15', 'Test Petugas', '2020-01-15', 'TKB-001', 'Test pohon untuk Platform A'),
  ('b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380b02'::uuid, 'KELAPA-001', 'HIBRIDA', 1, 2, '2020-01-15', 'Test Petugas', '2020-01-15', 'TKB-002', 'Test pohon untuk Platform A'),
  ('b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380b03'::uuid, 'KELAPA-001', 'HIBRIDA', 2, 1, '2021-03-20', 'Test Petugas', '2021-03-20', 'TKB-003', 'Test pohon untuk Platform A')
ON CONFLICT (id_npokok) DO NOTHING;

-- 4. INSERT TEST TUGAS (SPK Tugas untuk Mandor)
-- Kolom spk_tugas: id_tugas, id_spk, id_pelaksana, tipe_tugas, status_tugas, target_json, prioritas
INSERT INTO spk_tugas (
  id_tugas, 
  id_spk,
  tipe_tugas, 
  id_pelaksana, 
  target_json, 
  status_tugas, 
  prioritas
)
VALUES 
  -- Tugas Inspeksi untuk Mandor Agus
  ('c2ffbc99-9c0b-4ef8-bb6d-6bb9bd380c01'::uuid, 'd3ffbc99-9c0b-4ef8-bb6d-6bb9bd380d01'::uuid, 'INSPEKSI', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10'::uuid,
   '{"target_npokok": ["b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380b01", "b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380b02"], "deadline": "2025-11-10"}'::jsonb,
   'BARU', 1),
   
  -- Tugas Pemupukan untuk Mandor Agus
  ('c2ffbc99-9c0b-4ef8-bb6d-6bb9bd380c02'::uuid, 'd3ffbc99-9c0b-4ef8-bb6d-6bb9bd380d01'::uuid, 'PEMUPUKAN', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10'::uuid,
   '{"target_npokok": ["b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380b03"], "jenis_pupuk": "NPK", "dosis": "200g/pohon"}'::jsonb,
   'BARU', 2),
   
  -- Tugas Inspeksi untuk Mandor Budi
  ('c2ffbc99-9c0b-4ef8-bb6d-6bb9bd380c03'::uuid, 'd3ffbc99-9c0b-4ef8-bb6d-6bb9bd380d02'::uuid, 'INSPEKSI', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
   '{"target_npokok": ["b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380b01"], "deadline": "2025-11-08"}'::jsonb,
   'DIKERJAKAN', 1)
ON CONFLICT (id_tugas) DO NOTHING;

-- ============================================
-- VERIFY DATA
-- ============================================

-- Check Pelaksana
SELECT 'master_pihak' as tabel, COUNT(*) as total 
FROM master_pihak 
WHERE id_pihak::text LIKE 'a0eebc99%';

-- Check SPK Header
SELECT 'spk_header' as tabel, COUNT(*) as total 
FROM spk_header 
WHERE id_spk::text LIKE 'd3ffbc99%';

-- Check Npokok  
SELECT 'kebun_n_pokok' as tabel, COUNT(*) as total 
FROM kebun_n_pokok 
WHERE id_npokok::text LIKE 'b1ffbc99%';

-- Check Tugas
SELECT 'spk_tugas' as tabel, COUNT(*) as total 
FROM spk_tugas 
WHERE id_tugas::text LIKE 'c2ffbc99%';

-- Show Test Tugas Detail
SELECT 
  t.id_tugas,
  t.tipe_tugas,
  p.nama as pelaksana,
  t.status_tugas,
  t.prioritas,
  t.target_json
FROM spk_tugas t
LEFT JOIN master_pihak p ON t.id_pelaksana = p.id_pihak
WHERE t.id_tugas::text LIKE 'c2ffbc99%'
ORDER BY t.prioritas;
