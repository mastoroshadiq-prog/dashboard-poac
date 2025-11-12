/**
 * DISCOVER ALL TABLES IN DATABASE
 */

const { supabase } = require('./config/supabase');

async function discoverAllTables() {
  console.log('🔍 Discovering all tables in database...\n');

  // Try to get information from information_schema
  // Since Supabase doesn't directly expose this, we'll try common table prefixes
  
  const prefixes = ['spk', 'kebun', 'ops', 'log', 'user', 'work', 'task', 'activity'];
  const foundTables = [];

  for (const prefix of prefixes) {
    console.log(`\nSearching for tables with prefix '${prefix}_*'...`);
    
    // Try common naming patterns
    const patterns = [
      `${prefix}_header`,
      `${prefix}_detail`,
      `${prefix}_tugas`,
      `${prefix}_log`,
      `${prefix}_aktivitas`,
      `${prefix}_kegiatan`,
      `${prefix}_fase`,
      `${prefix}_tindakan`,
      `${prefix}`,
    ];

    for (const tableName of patterns) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (!error) {
          console.log(`  ✅ ${tableName}`);
          foundTables.push(tableName);
          
          // Get column info
          if (data && data.length > 0) {
            const columns = Object.keys(data[0]);
            console.log(`     Columns (${columns.length}): ${columns.slice(0, 10).join(', ')}${columns.length > 10 ? '...' : ''}`);
          }
        }
      } catch (e) {
        // Ignore errors
      }
    }
  }

  console.log('\n\n========================================');
  console.log('  SUMMARY: FOUND TABLES');
  console.log('========================================\n');
  
  if (foundTables.length > 0) {
    foundTables.forEach(table => console.log(`  - ${table}`));
  } else {
    console.log('  No tables found with common prefixes');
  }

  // Now check the tables we know exist
  console.log('\n\n========================================');
  console.log('  ANALYZING KNOWN TABLES');
  console.log('========================================\n');

  const knownTables = ['spk_header', 'spk_tugas', 'kebun_n_pokok', 'kebun_observasi'];
  
  for (const tableName of knownTables) {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (!error) {
      console.log(`\n${tableName}:`);
      console.log(`  Total rows: ${count || 'Unknown'}`);
      
      // Get actual data to see columns
      const { data: sampleData } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (sampleData && sampleData.length > 0) {
        const columns = Object.keys(sampleData[0]);
        console.log(`  Columns (${columns.length}):`);
        columns.forEach(col => {
          const value = sampleData[0][col];
          const type = value === null ? 'null' : typeof value;
          console.log(`    - ${col}: ${type}`);
        });
      }
    }
  }
}

discoverAllTables().catch(console.error);
