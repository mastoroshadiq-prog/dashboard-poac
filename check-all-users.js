// ============================================================================
// CHECK ALL USERS AND THEIR TYPES
// ============================================================================
require('dotenv').config();
const { supabase } = require('./config/supabase');

(async () => {
  try {
    console.log('=== CHECKING ALL USERS IN DATABASE ===\n');

    // Get all users
    const { data, error } = await supabase
      .from('master_pihak')
      .select('id_pihak, nama, tipe, kode_unik')
      .order('tipe', { ascending: true })
      .order('nama', { ascending: true });

    if (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }

    if (!data || data.length === 0) {
      console.log('⚠️  No users found in database');
      process.exit(0);
    }

    // Count by type
    const typeCounts = {};
    data.forEach(user => {
      typeCounts[user.tipe] = (typeCounts[user.tipe] || 0) + 1;
    });

    console.log('📊 User counts by tipe:');
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    console.log('\n📋 All users:\n');
    
    let currentType = null;
    data.forEach(user => {
      if (user.tipe !== currentType) {
        currentType = user.tipe;
        console.log(`\n=== ${currentType} ===`);
      }
      console.log(`  - ${user.nama} (${user.kode_unik})`);
      console.log(`    UUID: ${user.id_pihak}`);
    });

    console.log('\n✅ Query completed\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
