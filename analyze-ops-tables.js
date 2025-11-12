/**
 * ANALYZE OPS_* TABLES FOR MULTI-PURPOSE SPK SYSTEM
 * 
 * Goal: Understand the schema of ops_kegiatan, ops_fase, ops_tindakan
 * to build a generic SPK creation system
 */

const { supabase } = require('./config/supabase');

async function analyzeOpsTables() {
  console.log('\n========================================');
  console.log('  ANALYZING OPS_* TABLES');
  console.log('========================================\n');

  // 1. List all ops_* tables
  console.log('[1] Discovering ops_* tables...\n');
  
  const opsTableNames = [
    'ops_kegiatan',
    'ops_fase',
    'ops_tindakan',
    'ops_spk',
    'ops_work_order'
  ];

  for (const tableName of opsTableNames) {
    console.log(`\n--- Table: ${tableName} ---`);
    
    // Get sample data
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(3);

    if (error) {
      console.log(`❌ Table '${tableName}' not found or error:`, error.message);
      continue;
    }

    if (!data || data.length === 0) {
      console.log(`⚠️  Table '${tableName}' exists but is empty`);
      continue;
    }

    console.log(`✅ Table '${tableName}' found with ${data.length} sample rows`);
    
    // Display column structure
    if (data[0]) {
      console.log('\nColumns:');
      Object.keys(data[0]).forEach(col => {
        const value = data[0][col];
        const type = typeof value;
        const sample = value !== null ? 
          (type === 'object' ? JSON.stringify(value).substring(0, 50) : String(value).substring(0, 50)) : 
          'NULL';
        console.log(`  - ${col}: ${type} (sample: ${sample})`);
      });
    }

    // Display sample data
    console.log('\nSample Data:');
    data.forEach((row, i) => {
      console.log(`\n  Row ${i + 1}:`);
      Object.keys(row).forEach(col => {
        if (row[col] !== null && row[col] !== '') {
          const value = typeof row[col] === 'object' ? JSON.stringify(row[col]) : row[col];
          console.log(`    ${col}: ${value}`);
        }
      });
    });
  }

  // 2. Analyze ops_kegiatan (Activities/Operations)
  console.log('\n\n========================================');
  console.log('  DETAILED ANALYSIS: ops_kegiatan');
  console.log('========================================\n');

  const { data: kegiatanData, error: kegiatanError } = await supabase
    .from('ops_kegiatan')
    .select('*')
    .limit(10);

  if (!kegiatanError && kegiatanData) {
    console.log(`Total sample rows: ${kegiatanData.length}\n`);
    
    // Group by jenis_kegiatan or kategori if exists
    const groupedByType = {};
    kegiatanData.forEach(row => {
      const key = row.jenis_kegiatan || row.kategori || row.nama_kegiatan || 'unknown';
      if (!groupedByType[key]) groupedByType[key] = [];
      groupedByType[key].push(row);
    });

    console.log('Activity Types:');
    Object.keys(groupedByType).forEach(type => {
      console.log(`  - ${type}: ${groupedByType[type].length} records`);
    });
  }

  // 3. Analyze ops_fase (Phases/Lifecycle stages)
  console.log('\n\n========================================');
  console.log('  DETAILED ANALYSIS: ops_fase');
  console.log('========================================\n');

  const { data: faseData, error: faseError } = await supabase
    .from('ops_fase')
    .select('*')
    .limit(10);

  if (!faseError && faseData) {
    console.log(`Total sample rows: ${faseData.length}\n`);
    
    console.log('Sample Phases:');
    faseData.forEach((fase, i) => {
      console.log(`\n  ${i + 1}. ${fase.nama_fase || fase.fase || 'Phase ' + (i+1)}`);
      if (fase.deskripsi) console.log(`     Description: ${fase.deskripsi}`);
      if (fase.urutan) console.log(`     Order: ${fase.urutan}`);
    });
  }

  // 4. Analyze ops_tindakan (Actions/Tasks)
  console.log('\n\n========================================');
  console.log('  DETAILED ANALYSIS: ops_tindakan');
  console.log('========================================\n');

  const { data: tindakanData, error: tindakanError } = await supabase
    .from('ops_tindakan')
    .select('*')
    .limit(10);

  if (!tindakanError && tindakanData) {
    console.log(`Total sample rows: ${tindakanData.length}\n`);
    
    // Group by tipe_tindakan or kategori
    const groupedByAction = {};
    tindakanData.forEach(row => {
      const key = row.tipe_tindakan || row.kategori || row.nama_tindakan || 'unknown';
      if (!groupedByAction[key]) groupedByAction[key] = [];
      groupedByAction[key].push(row);
    });

    console.log('Action Types:');
    Object.keys(groupedByAction).forEach(type => {
      console.log(`  - ${type}: ${groupedByAction[type].length} records`);
    });
  }

  // 5. Check relationships
  console.log('\n\n========================================');
  console.log('  ANALYZING RELATIONSHIPS');
  console.log('========================================\n');

  // Check if ops_kegiatan references ops_fase
  if (kegiatanData && kegiatanData.length > 0) {
    const hasIdFase = 'id_fase' in kegiatanData[0];
    const hasFaseField = 'fase' in kegiatanData[0];
    console.log(`ops_kegiatan → ops_fase relationship:`);
    console.log(`  - Has id_fase field: ${hasIdFase}`);
    console.log(`  - Has fase field: ${hasFaseField}`);
  }

  // Check if ops_tindakan references ops_kegiatan
  if (tindakanData && tindakanData.length > 0) {
    const hasIdKegiatan = 'id_kegiatan' in tindakanData[0];
    const hasKegiatanField = 'kegiatan' in tindakanData[0];
    console.log(`\nops_tindakan → ops_kegiatan relationship:`);
    console.log(`  - Has id_kegiatan field: ${hasIdKegiatan}`);
    console.log(`  - Has kegiatan field: ${hasKegiatanField}`);
  }

  // 6. Summary & Recommendations
  console.log('\n\n========================================');
  console.log('  SUMMARY & RECOMMENDATIONS');
  console.log('========================================\n');

  console.log('Based on the analysis, we can build a multi-purpose SPK system with:');
  console.log('');
  console.log('1. Dynamic Form Generation:');
  console.log('   - Query ops_kegiatan for available activity types');
  console.log('   - Each activity type has specific required fields');
  console.log('   - Generate form fields based on activity metadata');
  console.log('');
  console.log('2. Phase-based Workflow:');
  console.log('   - Each SPK belongs to a specific ops_fase (lifecycle stage)');
  console.log('   - Phase determines available actions and validations');
  console.log('');
  console.log('3. Action Templates:');
  console.log('   - ops_tindakan contains predefined action templates');
  console.log('   - SPK can be created from these templates');
  console.log('   - Each action has specific parameters and checklists');
  console.log('');
  console.log('Next steps:');
  console.log('  → Create generic SPK creation endpoint');
  console.log('  → Support multiple SPK types (not just drone validation)');
  console.log('  → Dynamic task generation based on activity type');
  console.log('');
}

analyzeOpsTables().catch(console.error);
