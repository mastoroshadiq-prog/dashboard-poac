/**
 * TEST SCRIPT - M-4.2: Add Tugas ke SPK (Batch Insert)
 * 
 * Direct service test - bypassing API (server not needed)
 * Cara menjalankan: node test-add-tugas.js
 */

require('dotenv').config();
const { supabase } = require('./config/supabase');
const spkService = require('./services/spkService');

async function runTest() {
  console.log('🧪 TEST: M-4.2 - Add Tugas ke SPK (Batch)');
  console.log('='.repeat(60));
  
  try {
    // Step 1: Get latest SPK ID
    console.log('\n1️⃣ Fetching latest SPK...');
    const { data: spk, error: spkError } = await supabase
      .from('spk_header')
      .select('id_spk, nama_spk, status_spk')
      .order('tanggal_dibuat', { ascending: false })
      .limit(1)
      .single();

    if (spkError || !spk) {
      console.error('❌ Failed to get latest SPK:', spkError ? spkError.message : 'No SPK found');
      console.log('\n💡 TIP: Buat SPK dulu dengan `node test-post-spk.ps1` atau manual di Supabase');
      process.exit(1);
    }

    const id_spk = spk.id_spk;
    console.log('✅ Latest SPK found:');
    console.log('   ID:', id_spk);
    console.log('   Nama:', spk.nama_spk);
    console.log('   Status:', spk.status_spk);

    // Step 2: Get sample pelaksana IDs
    console.log('\n2️⃣ Fetching sample pelaksana IDs...');
    const { data: pelaksana, error: pelaksanaError } = await supabase
      .from('master_pihak')
      .select('id_pihak')
      .limit(3);

    if (pelaksanaError || !pelaksana || pelaksana.length === 0) {
      console.error('❌ Failed to fetch pelaksana:', pelaksanaError ? pelaksanaError.message : 'No pelaksana found');
      console.log('\n💡 TIP: Pastikan tabel master_pihak ada data');
      process.exit(1);
    }

    console.log('✅ Found', pelaksana.length, 'pelaksana:');
    pelaksana.forEach((p, i) => console.log(`   ${i + 1}. ${p.id_pihak}`));

    // Step 3: Prepare batch tugas
    const tugasArray = [
      {
        id_pelaksana: pelaksana[0].id_pihak,
        tipe_tugas: 'VALIDASI_DRONE',
        target_json: { 
          blok: 'A1', 
          id_pohon: ['pohon-001', 'pohon-002', 'pohon-003'] 
        },
        prioritas: 1 // Tinggi
      },
      {
        id_pelaksana: pelaksana[1] ? pelaksana[1].id_pihak : pelaksana[0].id_pihak,
        tipe_tugas: 'VALIDASI_DRONE',
        target_json: { 
          blok: 'A2', 
          id_pohon: ['pohon-004', 'pohon-005'] 
        },
        prioritas: 2 // Sedang
      },
      {
        id_pelaksana: pelaksana[2] ? pelaksana[2].id_pihak : pelaksana[0].id_pihak,
        tipe_tugas: 'APH',
        target_json: { 
          blok: 'B1', 
          id_pohon: ['pohon-006'] 
        },
        prioritas: 1 // Tinggi
      }
    ];

    console.log('\n3️⃣ Prepared batch tugas:');
    tugasArray.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.tipe_tugas} - Blok ${t.target_json.blok} (${t.target_json.id_pohon.length} pohon) - Priority ${t.prioritas}`);
    });

    // Step 4: Call service function (direct test)
    console.log('\n4️⃣ Calling service: addTugasKeSpk()...');
    
    const result = await spkService.addTugasKeSpk(id_spk, tugasArray);
    
    console.log('\n✅ SERVICE CALL SUCCESSFUL!');
    console.log('='.repeat(60));
    console.log('📊 Result:');
    console.log('   ID SPK:', result.id_spk);
    console.log('   Jumlah Tugas Ditambahkan:', result.jumlah_tugas_ditambahkan);
    console.log('\n📋 Created Tugas:');
    result.tugas.forEach((t, i) => {
      console.log(`\n   ${i + 1}. ID Tugas: ${t.id_tugas}`);
      console.log(`      Tipe: ${t.tipe_tugas}`);
      console.log(`      Status: ${t.status_tugas}`);
      console.log(`      Pelaksana: ${t.id_pelaksana}`);
      console.log(`      Priority: ${t.prioritas}`);
      console.log(`      Target: Blok ${t.target_json.blok} (${t.target_json.id_pohon.length} pohon)`);
    });

    // Step 5: Verify in database
    console.log('\n5️⃣ Verifying in database...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('spk_tugas')
      .select('*')
      .eq('id_spk', id_spk)
      .order('prioritas', { ascending: true });

    if (verifyError) {
      console.error('⚠️  Verification query failed:', verifyError.message);
    } else {
      console.log('✅ Database verification:');
      console.log('   Total tugas for this SPK:', verifyData.length);
      console.log('   Tugas by priority:');
      const byPriority = verifyData.reduce((acc, t) => {
        acc[t.prioritas] = (acc[t.prioritas] || 0) + 1;
        return acc;
      }, {});
      Object.entries(byPriority).forEach(([pri, count]) => {
        const label = pri === '1' ? 'Tinggi' : pri === '2' ? 'Sedang' : 'Rendah';
        console.log(`      Priority ${pri} (${label}): ${count} tugas`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 TEST PASSED - Data berhasil masuk ke spk_tugas!');
    console.log('');
    
    process.exit(0);

  } catch (err) {
    console.error('\n💥 TEST FAILED!');
    console.error('Error:', err.message);
    console.error('\nStack:', err.stack);
    process.exit(1);
  }
}

runTest();
