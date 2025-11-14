-- SOP SEED DATA
INSERT INTO public.sop_master (sop_code, sop_version, jenis_kegiatan, sop_name, sop_description, checklist_items, mandatory_photos, estimated_time_mins, safety_requirements, tools_required, status, is_active)
VALUES
('SOP-VAL-001', 'v1.0', 'VALIDASI_DRONE_NDRE', 'SOP Validasi Lapangan Ground Truth v1.0',
'Prosedur validasi lapangan untuk konfirmasi hasil prediksi drone NDRE',
'[{"id":1,"item":"Cek visual kondisi daun","is_mandatory":true,"guidance":"Periksa warna daun: hijau/kuning/coklat","photo_required":true,"estimated_time_mins":3},{"id":2,"item":"Cek kondisi batang dan grading Ganoderma","is_mandatory":true,"guidance":"Hitung jamur: G0=0, G1=1-2, G2=3-5, G3=6-10, G4>10","photo_required":true,"estimated_time_mins":4},{"id":3,"item":"Cek kondisi tanah","is_mandatory":true,"guidance":"Kelembaban, drainase, busuk akar","photo_required":false,"estimated_time_mins":2},{"id":4,"item":"Foto 4 arah (UTSB)","is_mandatory":true,"guidance":"Utara, Timur, Selatan, Barat","photo_required":true,"estimated_time_mins":3},{"id":5,"item":"Verifikasi prediksi drone","is_mandatory":true,"guidance":"Cocokkan hasil drone vs lapangan","photo_required":false,"estimated_time_mins":2},{"id":6,"item":"Catat penyebab stress","is_mandatory":false,"guidance":"Ganoderma, kekeringan, hama, dll","photo_required":false,"estimated_time_mins":1}]'::jsonb,
4, 15,
ARRAY['Gunakan APD', 'Bawa P3K kit', 'Waspadai ular'],
ARRAY['Smartphone dengan GPS', 'Camera min 12MP', 'Form checklist'],
'ACTIVE', true)
ON CONFLICT (sop_code, sop_version) DO NOTHING;

SELECT 'SOP Seed Data Inserted' as status, COUNT(*) as count FROM sop_master WHERE is_active = true;
