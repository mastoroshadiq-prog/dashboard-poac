/**
 * SQL SCRIPT: Create Table log_aktivitas_5w1h (SIMPLIFIED VERSION)
 * 
 * TUJUAN: Jejak Digital 5W1H untuk semua aktivitas lapangan
 * 
 * RUN THIS IN SUPABASE SQL EDITOR!
 * 
 * NOTE: Versi simplified tanpa foreign key constraints untuk testing.
 * Untuk production, uncomment FK constraints.
 */

-- Drop table jika sudah ada (hati-hati di production!)
DROP TABLE IF EXISTS log_aktivitas_5w1h CASCADE;

-- Create table log_aktivitas_5w1h
CREATE TABLE log_aktivitas_5w1h (
  -- Primary Key
  id_log UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys (5W1H) - Simplified: No FK constraints untuk testing
  id_tugas UUID NOT NULL,  -- WHAT - Tugas yang dikerjakan
  id_petugas UUID NOT NULL,  -- WHO - Petugas yang mengerjakan
  id_npokok TEXT NOT NULL,  -- WHERE - ID pohon
  
  -- Timestamps (WHEN)
  timestamp_eksekusi TIMESTAMPTZ NOT NULL,  -- Waktu dari HP
  created_at TIMESTAMPTZ DEFAULT now(),  -- Waktu server
  
  -- Location (WHERE)
  gps_eksekusi JSONB NOT NULL,  -- GPS coordinates
  
  -- Results (HOW)
  hasil_json JSONB NOT NULL,  -- Hasil eksekusi
  
  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes untuk performa
CREATE INDEX idx_log_id_tugas ON log_aktivitas_5w1h(id_tugas);
CREATE INDEX idx_log_id_petugas ON log_aktivitas_5w1h(id_petugas);
CREATE INDEX idx_log_timestamp ON log_aktivitas_5w1h(timestamp_eksekusi DESC);
CREATE INDEX idx_log_hasil_json ON log_aktivitas_5w1h USING gin(hasil_json);

-- Comments
COMMENT ON TABLE log_aktivitas_5w1h IS 'Jejak Digital 5W1H - Aktivitas Lapangan';
COMMENT ON COLUMN log_aktivitas_5w1h.id_tugas IS 'WHAT - Tugas yang dikerjakan';
COMMENT ON COLUMN log_aktivitas_5w1h.id_petugas IS 'WHO - Petugas yang mengerjakan';
COMMENT ON COLUMN log_aktivitas_5w1h.id_npokok IS 'WHERE - ID pohon';
COMMENT ON COLUMN log_aktivitas_5w1h.gps_eksekusi IS 'WHERE - GPS {lat, lon}';
COMMENT ON COLUMN log_aktivitas_5w1h.hasil_json IS 'HOW - Hasil eksekusi';

-- Verify table created
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'log_aktivitas_5w1h'
ORDER BY ordinal_position;

-- Success
SELECT 'Table log_aktivitas_5w1h created successfully!' AS status,
       COUNT(*) AS column_count
FROM information_schema.columns
WHERE table_name = 'log_aktivitas_5w1h';
