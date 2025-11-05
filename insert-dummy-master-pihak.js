/**
 * SCRIPT: Insert Dummy Data ke master_pihak
 * 
 * Tujuan: Membuat data dummy untuk testing API SPK
 */

require('dotenv').config();
const { supabase } = require('./config/supabase');

async function insertDummyMasterPihak() {
  console.log('📝 Insert Dummy Data ke master_pihak');
  console.log('='.repeat(60));
  
  // Data dummy untuk testing
  // Menggunakan UUID yang valid (generated dari uuidgenerator.net)
  const dummyData = [
    {
      id_pihak: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d' // Asisten Agus
    },
    {
      id_pihak: 'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e' // Mandor Budi
    },
    {
      id_pihak: 'c3d4e5f6-a7b8-4c7d-0e1f-2a3b4c5d6e7f' // Mandor Citra
    }
  ];
  
  console.log('\n📋 Data yang akan di-insert:');
  dummyData.forEach((pihak, idx) => {
    console.log(`   ${idx + 1}. ID: ${pihak.id_pihak}`);
  });
  
  console.log('\n⏳ Inserting...');
  
  try {
    const { data, error } = await supabase
      .from('master_pihak')
      .insert(dummyData)
      .select();
    
    if (error) {
      console.log('❌ INSERT GAGAL:', error.message);
      console.log('Error Details:', JSON.stringify(error, null, 2));
      
      // Cek apakah RLS yang blocking
      if (error.code === '42501' || error.message.includes('policy')) {
        console.log('\n💡 KEMUNGKINAN: Row Level Security (RLS) blocking!');
        console.log('   SOLUSI: Disable RLS atau buat policy di Supabase:');
        console.log('   ALTER TABLE master_pihak DISABLE ROW LEVEL SECURITY;');
      }
      
      // Cek apakah kolom tidak cocok
      if (error.message.includes('column') || error.message.includes('does not exist')) {
        console.log('\n💡 KEMUNGKINAN: Struktur kolom tidak sesuai!');
        console.log('   Cek struktur tabel master_pihak di Supabase.');
      }
    } else {
      console.log('✅ INSERT BERHASIL!');
      console.log(`   ${data.length} record berhasil ditambahkan.`);
      
      console.log('\n📊 Data yang berhasil di-insert:');
      data.forEach((pihak, idx) => {
        console.log(`   ${idx + 1}. ID: ${pihak.id_pihak}`);
      });
      
      console.log('\n🎉 Sekarang Anda bisa test API SPK dengan ID:');
      console.log('   id_asisten_pembuat: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"');
      console.log('\n📝 Contoh cURL:');
      console.log('   curl -X POST http://localhost:3000/api/v1/spk/ \\');
      console.log('     -H "Content-Type: application/json" \\');
      console.log('     -d \'{"nama_spk":"Test SPK","id_asisten_pembuat":"a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"}\'');
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 Selesai!');
}

// Jalankan script
insertDummyMasterPihak().catch(err => {
  console.error('💥 Fatal error:', err);
});
