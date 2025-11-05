/**
 * DEBUG HELPER - Database Connection & Data Verification
 * 
 * Gunakan file ini untuk troubleshooting koneksi dan data
 */

const { supabase } = require('./config/supabase');

async function checkDatabaseConnection() {
  console.log('='.repeat(60));
  console.log('🔍 DATABASE CONNECTION & DATA VERIFICATION');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Cek tabel spk_header
    console.log('\n📋 Test 1: Checking table spk_header...');
    const { data: spkHeader, error: error1 } = await supabase
      .from('spk_header')
      .select('*')
      .limit(5);
    
    if (error1) {
      console.log('❌ Error:', error1.message);
    } else {
      console.log(`✅ Found ${spkHeader?.length || 0} rows in spk_header`);
      if (spkHeader && spkHeader.length > 0) {
        console.log('   Sample:', JSON.stringify(spkHeader[0], null, 2));
      }
    }
    
    // Test 2: Cek tabel spk_tugas
    console.log('\n📋 Test 2: Checking table spk_tugas...');
    const { data: spkTugas, error: error2 } = await supabase
      .from('spk_tugas')
      .select('*')
      .limit(5);
    
    if (error2) {
      console.log('❌ Error:', error2.message);
    } else {
      console.log(`✅ Found ${spkTugas?.length || 0} rows in spk_tugas`);
      if (spkTugas && spkTugas.length > 0) {
        console.log('   Sample:', JSON.stringify(spkTugas[0], null, 2));
      }
    }
    
    // Test 3: Cek tabel log_aktivitas_5w1h
    console.log('\n📋 Test 3: Checking table log_aktivitas_5w1h...');
    const { data: logAktivitas, error: error3 } = await supabase
      .from('log_aktivitas_5w1h')
      .select('*')
      .limit(5);
    
    if (error3) {
      console.log('❌ Error:', error3.message);
    } else {
      console.log(`✅ Found ${logAktivitas?.length || 0} rows in log_aktivitas_5w1h`);
      if (logAktivitas && logAktivitas.length > 0) {
        console.log('   Sample:', JSON.stringify(logAktivitas[0], null, 2));
      }
    }
    
    // Test 4: List all tables
    console.log('\n📋 Test 4: Listing all available tables...');
    const { data: tables, error: error4 } = await supabase
      .rpc('get_all_tables');
    
    if (error4) {
      console.log('⚠️  Cannot list tables (RPC not available)');
      console.log('   This is normal - try manual query in Supabase SQL Editor:');
      console.log('   SELECT tablename FROM pg_tables WHERE schemaname = \'public\';');
    } else {
      console.log('✅ Available tables:', tables);
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log('='.repeat(60));
    console.log(`spk_header:          ${spkHeader?.length || 0} rows`);
    console.log(`spk_tugas:           ${spkTugas?.length || 0} rows`);
    console.log(`log_aktivitas_5w1h:  ${logAktivitas?.length || 0} rows`);
    
    if ((spkHeader?.length || 0) === 0 && 
        (spkTugas?.length || 0) === 0 && 
        (logAktivitas?.length || 0) === 0) {
      console.log('\n⚠️  WARNING: All tables are empty!');
      console.log('   Please insert dummy data to Supabase.');
      console.log('   See: docs/TESTING_GUIDE.md for SQL scripts.');
    } else {
      console.log('\n✅ Database has data!');
    }
    
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Fatal Error:', error.message);
  }
}

// Run verification
checkDatabaseConnection()
  .then(() => {
    console.log('\n✅ Verification complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
