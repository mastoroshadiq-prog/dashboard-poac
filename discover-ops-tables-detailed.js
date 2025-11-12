/**
 * COMPREHENSIVE TABLE DISCOVERY - OPS_* TABLES
 * 
 * Based on user feedback:
 * - ops_fase_besar exists
 * - ops_spk_tindakan exists  
 * - ops_jadwal_tindakan exists
 */

const { supabase } = require('./config/supabase');

async function comprehensiveTableDiscovery() {
  console.log('\n========================================');
  console.log('  COMPREHENSIVE OPS_* TABLE DISCOVERY');
  console.log('========================================\n');

  // Known ops_* tables from user
  const knownOpsTables = [
    'ops_fase_besar',
    'ops_spk_tindakan',
    'ops_jadwal_tindakan'
  ];

  // Additional possible ops_* table patterns
  const possibleOpsTables = [
    // Fase related
    'ops_fase',
    'ops_fase_kecil',
    'ops_fase_detail',
    
    // SPK related
    'ops_spk',
    'ops_spk_header',
    'ops_spk_detail',
    'ops_spk_tugas',
    
    // Tindakan related
    'ops_tindakan',
    'ops_tindakan_detail',
    
    // Kegiatan related
    'ops_kegiatan',
    'ops_kegiatan_detail',
    
    // Jadwal related
    'ops_jadwal',
    'ops_jadwal_detail',
    
    // Other operations
    'ops_work_order',
    'ops_log',
    'ops_monitoring',
    'ops_sop',
    'ops_checklist'
  ];

  const allTablesToCheck = [...knownOpsTables, ...possibleOpsTables];
  const foundTables = [];

  console.log('Checking tables...\n');

  for (const tableName of allTablesToCheck) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(1);

      if (!error && data !== null) {
        foundTables.push(tableName);
        console.log(`✅ ${tableName} - ${count || 0} rows`);
      }
    } catch (e) {
      // Table doesn't exist, skip
    }
  }

  if (foundTables.length === 0) {
    console.log('\n❌ No ops_* tables found!');
    console.log('This might be a schema access issue or tables are in different schema.');
    return;
  }

  // Detailed analysis of found tables
  console.log('\n\n========================================');
  console.log('  DETAILED SCHEMA ANALYSIS');
  console.log('========================================\n');

  for (const tableName of foundTables) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`TABLE: ${tableName}`);
    console.log('='.repeat(60));

    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .limit(5);

    if (error) {
      console.log(`Error: ${error.message}`);
      continue;
    }

    console.log(`\nTotal Rows: ${count || 0}`);

    if (!data || data.length === 0) {
      console.log('⚠️  Table is empty - no data to analyze');
      continue;
    }

    // Column analysis
    console.log('\n--- COLUMNS ---');
    const columns = Object.keys(data[0]);
    columns.forEach(col => {
      const sampleValue = data[0][col];
      const valueType = sampleValue === null ? 'null' : typeof sampleValue;
      const displayValue = sampleValue === null ? 'NULL' : 
                          typeof sampleValue === 'object' ? JSON.stringify(sampleValue).substring(0, 50) + '...' :
                          String(sampleValue).substring(0, 50);
      
      console.log(`  ${col}:`);
      console.log(`    Type: ${valueType}`);
      console.log(`    Sample: ${displayValue}`);
    });

    // Sample data
    console.log('\n--- SAMPLE DATA (first 3 rows) ---');
    data.slice(0, 3).forEach((row, idx) => {
      console.log(`\nRow ${idx + 1}:`);
      Object.entries(row).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          const displayValue = typeof value === 'object' ? 
            JSON.stringify(value).substring(0, 80) : 
            String(value).substring(0, 80);
          console.log(`  ${key}: ${displayValue}`);
        }
      });
    });

    // Data patterns analysis
    if (data.length > 1) {
      console.log('\n--- DATA PATTERNS ---');
      
      // Find potential category/type columns
      const categoryColumns = columns.filter(col => 
        col.includes('jenis') || col.includes('tipe') || col.includes('kategori') || 
        col.includes('nama') || col.includes('status')
      );

      for (const col of categoryColumns) {
        const uniqueValues = [...new Set(data.map(row => row[col]).filter(v => v !== null))];
        if (uniqueValues.length > 0 && uniqueValues.length <= 10) {
          console.log(`\n  ${col} - ${uniqueValues.length} unique values:`);
          uniqueValues.forEach(val => {
            const count = data.filter(row => row[col] === val).length;
            console.log(`    - ${val}: ${count} records`);
          });
        }
      }
    }
  }

  // Relationship analysis
  console.log('\n\n========================================');
  console.log('  RELATIONSHIP ANALYSIS');
  console.log('========================================\n');

  foundTables.forEach(tableName => {
    console.log(`\n${tableName}:`);
    
    // Get sample to check foreign key columns
    supabase
      .from(tableName)
      .select('*')
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const columns = Object.keys(data[0]);
          const fkColumns = columns.filter(col => 
            col.startsWith('id_') && col !== 'id_' + tableName.replace('ops_', '')
          );
          
          if (fkColumns.length > 0) {
            console.log(`  Potential FK columns: ${fkColumns.join(', ')}`);
          } else {
            console.log(`  No obvious FK columns detected`);
          }
        }
      });
  });

  // Wait for async relationship queries
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Summary
  console.log('\n\n========================================');
  console.log('  DISCOVERY SUMMARY');
  console.log('========================================\n');
  
  console.log(`Found ${foundTables.length} ops_* tables:\n`);
  foundTables.forEach(table => console.log(`  ✅ ${table}`));

  console.log('\n\nNext steps:');
  console.log('  1. Analyze table relationships (fase → kegiatan → tindakan)');
  console.log('  2. Identify SPK creation patterns');
  console.log('  3. Design generic SPK API based on discovered schema');
  console.log('');
}

comprehensiveTableDiscovery().catch(console.error);
