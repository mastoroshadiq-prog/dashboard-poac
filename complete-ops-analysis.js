/**
 * COMPLETE OPS_* ANALYSIS & DOCUMENTATION
 * 
 * Found tables:
 * 1. ops_fase_besar - Main lifecycle phases (Pembibitan, TBM, TM, Pemanenan, Replanting)
 * 2. ops_sub_tindakan - Sub-actions for each phase
 * 3. ops_jadwal_tindakan - Schedules for actions
 * 4. ops_spk_tindakan - SPK documents
 */

const { supabase } = require('./config/supabase');

async function completeOpsAnalysis() {
  console.log('\n========================================');
  console.log('  COMPLETE OPS_* SYSTEM ANALYSIS');
  console.log('========================================\n');

  // 1. Get full data from all tables
  const [faseResult, subTindakanResult, jadwalResult, spkResult] = await Promise.all([
    supabase.from('ops_fase_besar').select('*').order('umur_mulai'),
    supabase.from('ops_sub_tindakan').select('*').order('nama_sub'),
    supabase.from('ops_jadwal_tindakan').select('*'),
    supabase.from('ops_spk_tindakan').select('*').order('tanggal_terbit', { ascending: false })
  ]);

  const faseData = faseResult.data || [];
  const subTindakanData = subTindakanResult.data || [];
  const jadwalData = jadwalResult.data || [];
  const spkData = spkResult.data || [];

  // 2. Build complete relationship map
  console.log('='.repeat(70));
  console.log('COMPLETE RELATIONSHIP HIERARCHY');
  console.log('='.repeat(70));
  console.log('');

  faseData.forEach(fase => {
    console.log(`📌 FASE: ${fase.nama_fase} (Umur ${fase.umur_mulai}-${fase.umur_selesai} tahun)`);
    console.log(`   ID: ${fase.id_fase_besar}`);
    console.log(`   ${fase.deskripsi}`);
    console.log('');

    // Get sub-tindakan for this fase
    const subTindakan = subTindakanData.filter(st => st.id_fase_besar === fase.id_fase_besar);
    
    if (subTindakan.length > 0) {
      console.log(`   Sub-Tindakan (${subTindakan.length}):`);
      subTindakan.forEach((sub, idx) => {
        console.log(`   ${idx + 1}. ${sub.nama_sub}`);
        console.log(`      ID: ${sub.id_sub_tindakan}`);
        console.log(`      ${sub.deskripsi}`);

        // Get jadwal for this sub-tindakan
        const jadwal = jadwalData.filter(j => j.id_sub_tindakan === sub.id_sub_tindakan);
        if (jadwal.length > 0) {
          console.log(`      Jadwal (${jadwal.length}):`);
          jadwal.forEach(j => {
            console.log(`        - Frekuensi: ${j.frekuensi}, Interval: ${j.interval_hari} hari`);
            
            // Get SPK for this jadwal
            const spk = spkData.filter(s => s.id_jadwal_tindakan === j.id_jadwal_tindakan);
            if (spk.length > 0) {
              console.log(`        - SPK (${spk.length} dokumen):`);
              spk.forEach(s => {
                console.log(`          • ${s.nomor_spk} - ${s.status}`);
                console.log(`            Lokasi: ${s.lokasi}`);
                console.log(`            PJ: ${s.penanggung_jawab}`);
                console.log(`            Mandor: ${s.mandor}`);
              });
            }
          });
        }
        console.log('');
      });
    } else {
      console.log('   ⚠️  No sub-tindakan defined for this fase');
    }
    console.log('');
  });

  // 3. Statistics
  console.log('\n='.repeat(70));
  console.log('STATISTICS');
  console.log('='.repeat(70));
  console.log('');
  console.log(`Total Fase Besar: ${faseData.length}`);
  console.log(`Total Sub-Tindakan: ${subTindakanData.length}`);
  console.log(`Total Jadwal Tindakan: ${jadwalData.length}`);
  console.log(`Total SPK Tindakan: ${spkData.length}`);
  console.log('');

  // 4. Sub-tindakan distribution by fase
  console.log('Sub-Tindakan per Fase:');
  faseData.forEach(fase => {
    const count = subTindakanData.filter(st => st.id_fase_besar === fase.id_fase_besar).length;
    console.log(`  ${fase.nama_fase}: ${count} sub-tindakan`);
  });
  console.log('');

  // 5. SPK status distribution
  const statusCount = {};
  spkData.forEach(spk => {
    statusCount[spk.status] = (statusCount[spk.status] || 0) + 1;
  });
  console.log('SPK Status Distribution:');
  Object.entries(statusCount).forEach(([status, count]) => {
    console.log(`  ${status}: ${count} SPK`);
  });
  console.log('');

  // 6. Schema documentation
  console.log('\n='.repeat(70));
  console.log('SCHEMA DOCUMENTATION');
  console.log('='.repeat(70));
  console.log('');

  console.log('TABLE: ops_fase_besar');
  console.log('  Purpose: Define main lifecycle phases of oil palm');
  console.log('  Columns:');
  console.log('    - id_fase_besar (UUID PK)');
  console.log('    - nama_fase (VARCHAR) - Phase name');
  console.log('    - umur_mulai (INTEGER) - Start age in years');
  console.log('    - umur_selesai (INTEGER) - End age in years');
  console.log('    - deskripsi (TEXT)');
  console.log('  Sample values: Pembibitan, TBM, TM, Pemanenan, Replanting');
  console.log('');

  console.log('TABLE: ops_sub_tindakan');
  console.log('  Purpose: Define specific actions/activities for each phase');
  console.log('  Columns:');
  console.log('    - id_sub_tindakan (UUID PK)');
  console.log('    - id_fase_besar (UUID FK → ops_fase_besar)');
  console.log('    - nama_sub (VARCHAR) - Action name');
  console.log('    - deskripsi (TEXT)');
  console.log('  Sample: "Panen TBS Rotasi Rutin", "Pemupukan NPK", etc.');
  console.log('');

  console.log('TABLE: ops_jadwal_tindakan');
  console.log('  Purpose: Schedule configuration for each sub-tindakan');
  console.log('  Columns:');
  console.log('    - id_jadwal_tindakan (UUID PK)');
  console.log('    - id_sub_tindakan (UUID FK → ops_sub_tindakan)');
  console.log('    - id_tanaman (UUID FK - optional, for specific plant)');
  console.log('    - frekuensi (VARCHAR) - e.g., "2x per minggu", "Bulanan"');
  console.log('    - interval_hari (INTEGER)');
  console.log('    - tanggal_mulai (TIMESTAMP)');
  console.log('    - tanggal_selesai (TIMESTAMP - nullable)');
  console.log('');

  console.log('TABLE: ops_spk_tindakan');
  console.log('  Purpose: Actual SPK documents issued for scheduled actions');
  console.log('  Columns:');
  console.log('    - id_spk (UUID PK)');
  console.log('    - id_jadwal_tindakan (UUID FK → ops_jadwal_tindakan)');
  console.log('    - nomor_spk (VARCHAR) - e.g., "SPK/PANEN/2025/001"');
  console.log('    - tanggal_terbit (DATE)');
  console.log('    - tanggal_mulai (DATE)');
  console.log('    - tanggal_selesai (DATE)');
  console.log('    - status (VARCHAR) - e.g., SELESAI, DALAM_PROSES, PENDING');
  console.log('    - penanggung_jawab (VARCHAR) - PIC name');
  console.log('    - mandor (VARCHAR) - Mandor name');
  console.log('    - lokasi (TEXT) - Work location');
  console.log('    - uraian_pekerjaan (TEXT)');
  console.log('    - catatan (TEXT)');
  console.log('');

  // 7. API Design Recommendations
  console.log('\n='.repeat(70));
  console.log('API DESIGN RECOMMENDATIONS');
  console.log('='.repeat(70));
  console.log('');

  console.log('For Multi-Purpose SPK System, create these endpoints:');
  console.log('');
  console.log('1. GET /api/v1/ops/fase');
  console.log('   → List all lifecycle phases with sub-tindakan count');
  console.log('');
  console.log('2. GET /api/v1/ops/fase/:id_fase/sub-tindakan');
  console.log('   → List all sub-tindakan for a specific phase');
  console.log('');
  console.log('3. GET /api/v1/ops/sub-tindakan/:id/jadwal');
  console.log('   → Get schedule configuration for a sub-tindakan');
  console.log('');
  console.log('4. POST /api/v1/ops/spk/create');
  console.log('   → Create SPK from jadwal_tindakan (generic SPK creation)');
  console.log('   Body: {');
  console.log('     id_jadwal_tindakan: UUID,');
  console.log('     tanggal_mulai: DATE,');
  console.log('     tanggal_selesai: DATE,');
  console.log('     penanggung_jawab: STRING,');
  console.log('     mandor: STRING,');
  console.log('     lokasi: STRING,');
  console.log('     uraian_pekerjaan: TEXT,');
  console.log('     catatan: TEXT (optional)');
  console.log('   }');
  console.log('');
  console.log('5. GET /api/v1/ops/spk');
  console.log('   → List all SPK with filters (status, fase, date range)');
  console.log('');
  console.log('6. PUT /api/v1/ops/spk/:id_spk/status');
  console.log('   → Update SPK status (PENDING → DALAM_PROSES → SELESAI)');
  console.log('');

  // 8. Key differences from Drone Validation SPK
  console.log('\n='.repeat(70));
  console.log('DIFFERENCES: ops_spk_tindakan vs spk_header/spk_tugas');
  console.log('='.repeat(70));
  console.log('');

  console.log('ops_spk_tindakan (Operational SPK):');
  console.log('  ✓ Single document (no separate header/tasks)');
  console.log('  ✓ References jadwal_tindakan (scheduled recurring work)');
  console.log('  ✓ Text-based fields (penanggung_jawab, mandor as strings)');
  console.log('  ✓ Location-based (blok/afdeling focus)');
  console.log('  ✓ Status tracking: SELESAI, etc.');
  console.log('');

  console.log('spk_header + spk_tugas (Validation SPK):');
  console.log('  ✓ Split into header + tasks (many-to-one)');
  console.log('  ✓ Tree-specific (each task = 1 tree validation)');
  console.log('  ✓ UUID-based assignments (id_asisten_pembuat, id_pelaksana)');
  console.log('  ✓ JSONB target_json (flexible data per task)');
  console.log('  ✓ Priority-based (URGENT/HIGH/NORMAL)');
  console.log('  ✓ Auto-status updates (PENDING → DIKERJAKAN → SELESAI)');
  console.log('');

  console.log('Recommendation:');
  console.log('  → Keep both SPK systems (different use cases)');
  console.log('  → ops_spk_tindakan: Routine operational work (panen, pupuk, etc.)');
  console.log('  → spk_header/spk_tugas: Specific tree-level tasks (validation, treatment)');
  console.log('');
}

completeOpsAnalysis().catch(console.error);
