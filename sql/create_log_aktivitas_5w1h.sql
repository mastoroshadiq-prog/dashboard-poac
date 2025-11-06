/**
 * SQL SCRIPT: Create Table log_aktivitas_5w1h
 * 
 * TUJUAN: Jejak Digital 5W1H untuk semua aktivitas lapangan
 * 
 * 5W1H MAPPING:
 * - WHO: id_petugas (FK ke master_pihak)
 * - WHAT: id_tugas (FK ke spk_tugas)
 * - WHEN: timestamp_eksekusi (dari HP), created_at (dari server)
 * - WHERE: id_npokok (pohon), gps_eksekusi (lat/lon)
 * - WHY: Dikaitkan dengan SPK & Tugas
 * - HOW: hasil_json (hasil eksekusi, status, keterangan)
 * 
 * RUN THIS IN SUPABASE SQL EDITOR!
 */

-- Drop table jika sudah ada (hati-hati di production!)
-- DROP TABLE IF EXISTS log_aktivitas_5w1h CASCADE;

-- Create table log_aktivitas_5w1h
CREATE TABLE IF NOT EXISTS log_aktivitas_5w1h (
  -- Primary Key
  id_log UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys (5W1H)
  id_tugas UUID NOT NULL REFERENCES spk_tugas(id_tugas) ON DELETE CASCADE,
  id_petugas UUID NOT NULL REFERENCES master_pihak(id_pihak) ON DELETE RESTRICT,
  id_npokok TEXT NOT NULL, -- ID pohon (bisa FK jika ada master_pohon)
  
  -- Timestamps (WHEN)
  timestamp_eksekusi TIMESTAMPTZ NOT NULL, -- Waktu eksekusi dari HP (client time)
  created_at TIMESTAMPTZ DEFAULT now(), -- Waktu insert ke server (server time)
  
  -- Location (WHERE)
  gps_eksekusi JSONB NOT NULL, -- { "lat": -6.123, "lon": 106.456 }
  
  -- Results (HOW)
  hasil_json JSONB NOT NULL, -- { "status_aktual": "G1", "keterangan": "...", ... }
  
  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes untuk performa query
CREATE INDEX IF NOT EXISTS idx_log_aktivitas_id_tugas ON log_aktivitas_5w1h(id_tugas);
CREATE INDEX IF NOT EXISTS idx_log_aktivitas_id_petugas ON log_aktivitas_5w1h(id_petugas);
CREATE INDEX IF NOT EXISTS idx_log_aktivitas_id_npokok ON log_aktivitas_5w1h(id_npokok);
CREATE INDEX IF NOT EXISTS idx_log_aktivitas_timestamp ON log_aktivitas_5w1h(timestamp_eksekusi DESC);
CREATE INDEX IF NOT EXISTS idx_log_aktivitas_created_at ON log_aktivitas_5w1h(created_at DESC NULLS LAST);

-- Index untuk JSONB query (jika perlu filter by status_aktual)
CREATE INDEX IF NOT EXISTS idx_log_aktivitas_hasil_json ON log_aktivitas_5w1h USING gin(hasil_json);

-- Comments untuk dokumentasi
COMMENT ON TABLE log_aktivitas_5w1h IS 'Jejak Digital 5W1H untuk semua aktivitas lapangan (Validasi, APH, Sanitasi, Panen)';
COMMENT ON COLUMN log_aktivitas_5w1h.id_log IS 'Primary key (auto-generated UUID)';
COMMENT ON COLUMN log_aktivitas_5w1h.id_tugas IS 'WHAT - Tugas yang dikerjakan (FK ke spk_tugas)';
COMMENT ON COLUMN log_aktivitas_5w1h.id_petugas IS 'WHO - Petugas yang mengerjakan (FK ke master_pihak)';
COMMENT ON COLUMN log_aktivitas_5w1h.id_npokok IS 'WHERE - ID pohon yang dikerjakan';
COMMENT ON COLUMN log_aktivitas_5w1h.timestamp_eksekusi IS 'WHEN - Waktu eksekusi dari HP (client time)';
COMMENT ON COLUMN log_aktivitas_5w1h.created_at IS 'WHEN - Waktu insert ke server (server time, trusted)';
COMMENT ON COLUMN log_aktivitas_5w1h.gps_eksekusi IS 'WHERE - GPS coordinates (JSONB: {lat, lon})';
COMMENT ON COLUMN log_aktivitas_5w1h.hasil_json IS 'HOW - Hasil eksekusi (JSONB: status_aktual, keterangan, foto_url, etc)';

-- RLS (Row Level Security) - Optional, enable di production
-- ALTER TABLE log_aktivitas_5w1h ENABLE ROW LEVEL SECURITY;

-- Sample policy: Petugas hanya bisa lihat log mereka sendiri
-- CREATE POLICY "petugas_view_own_logs" ON log_aktivitas_5w1h
--   FOR SELECT
--   USING (auth.uid() = id_petugas);

-- Sample policy: Petugas bisa insert log mereka sendiri
-- CREATE POLICY "petugas_insert_own_logs" ON log_aktivitas_5w1h
--   FOR INSERT
--   WITH CHECK (auth.uid() = id_petugas);

-- Verify table created
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'log_aktivitas_5w1h'
ORDER BY ordinal_position;

-- Sample data untuk testing (optional)
/*
INSERT INTO log_aktivitas_5w1h (
  id_tugas,
  id_petugas,
  id_npokok,
  timestamp_eksekusi,
  gps_eksekusi,
  hasil_json
) VALUES (
  'c51e1625-abdc-4118-8b2a-5913b934da93', -- Ganti dengan id_tugas real
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', -- Ganti dengan id_petugas real
  'pohon-001',
  '2025-11-06T14:30:00Z',
  '{"lat": -6.123456, "lon": 106.789012}',
  '{"status_aktual": "G1", "tipe_kejadian": "VALIDASI_DRONE", "keterangan": "Pohon sakit berat"}'
);
*/

-- Success message
SELECT 'Table log_aktivitas_5w1h created successfully!' AS message;
