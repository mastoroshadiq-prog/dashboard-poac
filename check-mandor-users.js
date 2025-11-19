/**
 * CHECK MANDOR USERS IN DATABASE
 * Query all mandor users from kebun_pihak table
 */
const { supabase } = require('./config/supabase');

async function checkMandorUsers() {
  try {
    console.log('\n=== CHECKING MANDOR USERS IN DATABASE ===\n');
    
    // Query INTERNAL users (mandor users are stored as INTERNAL type)
    const { data: allInternal, error } = await supabase
      .from('master_pihak')
      .select('id_pihak, nama, tipe, kode_unik')
      .eq('tipe', 'INTERNAL')
      .order('nama');
    
    // Filter for mandor users (kode_unik contains 'MANDOR')
    const data = allInternal?.filter(u => 
      u.kode_unik?.toUpperCase().includes('MANDOR')
    );
    
    if (error) {
      console.error('❌ Error querying database:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️  No MANDOR users found in database\n');
      console.log('💡 Note: Current master_pihak table uses `tipe` column (not `role`)');
      console.log('   To add MANDOR users:');
      console.log('   INSERT INTO master_pihak (id_pihak, nama, tipe, kode_unik)');
      console.log('   VALUES (gen_random_uuid(), \'Mandor 1\', \'MANDOR\', \'MAN001\');\n');
      return;
    }
    
    console.log(`✅ Found ${data.length} MANDOR user(s):\n`);
    
    data.forEach((mandor, index) => {
      console.log(`${index + 1}. ${mandor.nama || 'Unnamed'}`);
      console.log(`   UUID: ${mandor.id_pihak}`);
      console.log(`   Tipe: ${mandor.tipe}`);
      console.log(`   Kode: ${mandor.kode_unik || 'N/A'}`);
      console.log('');
    });
    
    console.log('─'.repeat(60));
    console.log(`Total MANDOR users: ${data.length}\n`);
    
    // Generate test tokens
    console.log('🔑 GENERATE TEST JWT TOKENS:\n');
    data.forEach((mandor, index) => {
      console.log(`${index + 1}. node generate-token-only.js MANDOR ${mandor.id_pihak}`);
    });
    console.log('');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkMandorUsers();
