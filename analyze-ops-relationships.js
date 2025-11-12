/**
 * DEEP DIVE: OPS_* TABLE RELATIONSHIPS
 * 
 * Found so far:
 * - ops_fase_besar (5 rows) - Main lifecycle phases
 * - ops_spk_tindakan (11 rows) - SPK documents for actions
 * - ops_jadwal_tindakan (5 rows) - Schedule for actions, references id_sub_tindakan
 * 
 * Need to find:
 * - Table containing id_sub_tindakan (referenced by ops_jadwal_tindakan)
 * - Other ops_* tables
 */

const { supabase } = require('./config/supabase');

async function deepDiveOpsRelationships() {
  console.log('\n========================================');
  console.log('  DEEP DIVE: OPS_* RELATIONSHIPS');
  console.log('========================================\n');

  // More comprehensive ops_* table patterns
  const moreOpsTables = [
    // Sub-tindakan related (referenced by ops_jadwal_tindakan)
    'ops_sub_tindakan',
    'ops_tindakan_detail',
    'ops_tindakan_kategori',
    
    // Main tindakan
    'ops_tindakan',
    'ops_tindakan_utama',
    'ops_tindakan_jenis',
    
    // Fase related
    'ops_fase_kecil',
    'ops_sub_fase',
    
    // SOP/Checklist
    'ops_sop',
    'ops_sop_tindakan',
    'ops_checklist',
    'ops_parameter',
    
    // Master data
    'ops_kategori',
    'ops_jenis_kegiatan',
    'ops_master_tindakan',
    
    // Execution
    'ops_realisasi',
    'ops_log_aktivitas',
    'ops_progress'
  ];

  const foundTables = [];

  console.log('Searching for additional ops_* tables...\n');

  for (const tableName of moreOpsTables) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(1);

      if (!error && data !== null) {
        foundTables.push({ name: tableName, count: count || 0 });
        console.log(`✅ ${tableName} - ${count || 0} rows`);
      }
    } catch (e) {
      // Skip
    }
  }

  if (foundTables.length === 0) {
    console.log('No additional ops_* tables found with these patterns.');
  }

  // Analyze the critical id_sub_tindakan reference
  console.log('\n\n========================================');
  console.log('  ANALYZING id_sub_tindakan REFERENCE');
  console.log('========================================\n');

  const { data: jadwalData } = await supabase
    .from('ops_jadwal_tindakan')
    .select('id_sub_tindakan')
    .limit(5);

  if (jadwalData && jadwalData.length > 0) {
    const subTindakanIds = jadwalData.map(j => j.id_sub_tindakan).filter(id => id);
    console.log(`Found ${subTindakanIds.length} id_sub_tindakan references:`);
    subTindakanIds.forEach(id => console.log(`  - ${id}`));

    // Try to find which table contains these IDs
    console.log('\nSearching for table containing these IDs...\n');

    for (const tableName of foundTables.map(t => t.name)) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .in('id', subTindakanIds)
          .limit(1);

        if (!error && data && data.length > 0) {
          console.log(`✅ FOUND! ${tableName} contains id_sub_tindakan records`);
          console.log('Sample record:');
          console.log(JSON.stringify(data[0], null, 2));
        }
      } catch (e) {
        // Try with different ID column names
        try {
          const idColName = 'id_' + tableName.replace('ops_', '');
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .in(idColName, subTindakanIds)
            .limit(1);

          if (!error && data && data.length > 0) {
            console.log(`✅ FOUND! ${tableName}.${idColName} contains records`);
          }
        } catch (e2) {
          // Skip
        }
      }
    }
  }

  // Detailed analysis of newly found tables
  console.log('\n\n========================================');
  console.log('  DETAILED ANALYSIS OF NEW TABLES');
  console.log('========================================\n');

  for (const table of foundTables) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`TABLE: ${table.name} (${table.count} rows)`);
    console.log('='.repeat(60));

    const { data, error } = await supabase
      .from(table.name)
      .select('*')
      .limit(3);

    if (error || !data || data.length === 0) {
      console.log('⚠️  No data available');
      continue;
    }

    // Show columns and sample
    console.log('\nColumns:');
    Object.keys(data[0]).forEach(col => {
      const value = data[0][col];
      const type = value === null ? 'null' : typeof value;
      console.log(`  ${col}: ${type}`);
    });

    console.log('\nSample data (first record):');
    Object.entries(data[0]).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        const display = typeof value === 'object' ? 
          JSON.stringify(value).substring(0, 100) : 
          String(value).substring(0, 100);
        console.log(`  ${key}: ${display}`);
      }
    });
  }

  // Build relationship map
  console.log('\n\n========================================');
  console.log('  RELATIONSHIP MAP');
  console.log('========================================\n');

  console.log('Discovered Structure:');
  console.log('');
  console.log('ops_fase_besar (Lifecycle Phases)');
  console.log('  - 5 main phases: Pembibitan, TBM, TM, Pemanenan, Replanting');
  console.log('  - Each phase has age range (umur_mulai - umur_selesai)');
  console.log('  ↓');
  console.log('  [Missing link - need ops_tindakan or ops_sub_tindakan]');
  console.log('  ↓');
  console.log('ops_jadwal_tindakan (Action Schedule)');
  console.log('  - References: id_sub_tindakan');
  console.log('  - Defines: frekuensi, interval_hari, tanggal_mulai/selesai');
  console.log('  ↓');
  console.log('ops_spk_tindakan (SPK Documents)');
  console.log('  - References: id_jadwal_tindakan');
  console.log('  - Contains: nomor_spk, penanggung_jawab, mandor, lokasi');
  console.log('  - Status: SELESAI, etc.');
  console.log('');

  // Summary
  console.log('\n========================================');
  console.log('  SUMMARY');
  console.log('========================================\n');

  console.log('Total ops_* tables found: ' + (3 + foundTables.length));
  console.log('');
  console.log('Complete list:');
  console.log('  1. ops_fase_besar (5 rows)');
  console.log('  2. ops_spk_tindakan (11 rows)');
  console.log('  3. ops_jadwal_tindakan (5 rows)');
  foundTables.forEach((t, i) => {
    console.log(`  ${i + 4}. ${t.name} (${t.count} rows)`);
  });

  console.log('\n⚠️  MISSING KEY TABLE:');
  console.log('  - Table containing id_sub_tindakan (referenced by ops_jadwal_tindakan)');
  console.log('  - Likely names: ops_sub_tindakan, ops_tindakan, ops_tindakan_detail');
  console.log('');
  console.log('Recommendation: Check database schema directly or ask admin for complete table list');
}

deepDiveOpsRelationships().catch(console.error);
