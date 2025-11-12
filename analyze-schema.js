/**
 * ANALYZE EXISTING SCHEMA - kebun_n_pokok & kebun_observasi
 */

require('dotenv').config();
const { supabase } = require('./config/supabase');

async function analyzeSchema() {
  console.log('='.repeat(70));
  console.log('🔍 ANALYZING EXISTING SCHEMA - kebun_n_pokok & kebun_observasi');
  console.log('='.repeat(70));

  try {
    // 1. Analyze kebun_n_pokok
    console.log('\n📊 TABLE 1: kebun_n_pokok');
    console.log('-'.repeat(70));
    
    const { data: npokok, error: npokokError } = await supabase
      .from('kebun_n_pokok')
      .select('*')
      .limit(3);

    if (npokokError) {
      console.log('❌ Error:', npokokError.message);
    } else {
      console.log('✅ Table exists!');
      console.log('Sample data count:', npokok.length);
      
      if (npokok.length > 0) {
        console.log('\nColumns detected:');
        Object.keys(npokok[0]).forEach(col => {
          const value = npokok[0][col];
          const type = typeof value;
          console.log(`  • ${col}: ${type} (example: ${JSON.stringify(value)})`);
        });
        
        console.log('\nSample rows:');
        npokok.forEach((row, idx) => {
          console.log(`\nRow ${idx + 1}:`, JSON.stringify(row, null, 2));
        });
      } else {
        console.log('⚠️  Table is empty');
      }
    }

    // 2. Analyze kebun_observasi
    console.log('\n' + '='.repeat(70));
    console.log('📊 TABLE 2: kebun_observasi');
    console.log('-'.repeat(70));
    
    const { data: observasi, error: observasiError } = await supabase
      .from('kebun_observasi')
      .select('*')
      .limit(3);

    if (observasiError) {
      console.log('❌ Error:', observasiError.message);
    } else {
      console.log('✅ Table exists!');
      console.log('Sample data count:', observasi.length);
      
      if (observasi.length > 0) {
        console.log('\nColumns detected:');
        Object.keys(observasi[0]).forEach(col => {
          const value = observasi[0][col];
          const type = typeof value;
          console.log(`  • ${col}: ${type} (example: ${JSON.stringify(value)})`);
        });
        
        console.log('\nSample rows:');
        observasi.forEach((row, idx) => {
          console.log(`\nRow ${idx + 1}:`, JSON.stringify(row, null, 2));
        });
      } else {
        console.log('⚠️  Table is empty');
      }
    }

    // 3. Analyze tableNDRE.csv structure
    console.log('\n' + '='.repeat(70));
    console.log('📊 REFERENCE: tableNDRE.csv Structure');
    console.log('-'.repeat(70));
    console.log(`
Columns in tableNDRE.csv:
  • DIVISI: "AME II" (text)
  • Blok: "D01" (text)
  • BLOK_B: "D001A" (text - detailed block code)
  • T_TANAM: 2009 (integer - year planted)
  • N_BARIS: 1 (integer - row number)
  • N_POKOK: 1-17 (integer - tree number in row)
  • OBJECTID: 167903, 167913... (integer - unique tree ID)
  • NDRE125: 0.386189026 (float - NDRE sensor value)
  • KlassNDRE12025: "Stres Berat", "Stres Sedang" (text - classification)
  • Ket: "Pokok Utama" (text - notes)

Sample data (first 3 rows):
  1. DIVISI=AME II, Blok=D01, N_BARIS=1, N_POKOK=1, OBJECTID=167903, NDRE125=0.386, Klass="Stres Berat"
  2. DIVISI=AME II, Blok=D01, N_BARIS=1, N_POKOK=2, OBJECTID=167913, NDRE125=0.423, Klass="Stres Sedang"
  3. DIVISI=AME II, Blok=D01, N_BARIS=1, N_POKOK=3, OBJECTID=167935, NDRE125=0.460, Klass="Stres Sedang"
`);

    console.log('\n' + '='.repeat(70));
    console.log('✅ SCHEMA ANALYSIS COMPLETE');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ ANALYSIS FAILED');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }

  process.exit(0);
}

analyzeSchema();
