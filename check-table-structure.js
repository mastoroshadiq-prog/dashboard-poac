/**
 * SCRIPT: Cek Struktur Tabel master_pihak
 */

require('dotenv').config();
const { supabase } = require('./config/supabase');

async function checkTableStructure() {
  console.log('🔍 Cek Struktur Tabel master_pihak');
  console.log('='.repeat(60));
  
  try {
    // Cara 1: Coba insert dengan minimal data untuk lihat error
    const { data, error } = await supabase
      .from('master_pihak')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error:', error.message);
    } else {
      if (data && data.length > 0) {
        console.log('✅ Sample Data dari master_pihak:');
        console.log(JSON.stringify(data[0], null, 2));
        
        console.log('\n📋 Kolom yang tersedia:');
        Object.keys(data[0]).forEach((key, idx) => {
          console.log(`   ${idx + 1}. ${key}`);
        });
      } else {
        console.log('⚠️  Tabel kosong. Mencoba describe structure...');
        
        // Try to get any columns info from error
        const { error: insertError } = await supabase
          .from('master_pihak')
          .insert([{ test: 'test' }]);
        
        if (insertError) {
          console.log('Error message:', insertError.message);
        }
      }
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
  
  console.log('\n' + '='.repeat(60));
}

checkTableStructure().catch(err => console.error(err));
