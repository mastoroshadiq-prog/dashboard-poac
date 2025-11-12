const { supabase } = require('./config/supabase');

async function testPelaksanaNull() {
  // Create SPK
  const { data: spk, error: spkError } = await supabase
    .from('spk_header')
    .insert({
      nama_spk: 'Test NULL Pelaksana',
      id_asisten_pembuat: '00000000-0000-0000-0000-000000000001',
      tanggal_dibuat: new Date().toISOString(),
      tanggal_target_selesai: '2025-12-31',
      status_spk: 'PENDING',
      keterangan: 'Test',
      risk_level: 'NORMAL',
      week_number: 46,
    })
    .select()
    .single();

  if (spkError) {
    console.error('SPK Error:', spkError);
    return;
  }

  console.log('✅ SPK Created:', spk.id_spk);

  // Test 1: id_pelaksana = NULL
  console.log('\n🧪 Test 1: id_pelaksana = NULL');
  const { data: task1, error: error1 } = await supabase
    .from('spk_tugas')
    .insert({
      id_spk: spk.id_spk,
      id_pelaksana: null,
      tipe_tugas: 'VALIDASI_NDRE',
      status_tugas: 'PENDING',
      target_json: { test: 'data' },
      prioritas: 1,
      task_priority: 'URGENT',
    })
    .select();

  if (error1) {
    console.error('❌ Error:', error1.message);
  } else {
    console.log('✅ Success! Task ID:', task1[0].id_tugas);
    await supabase.from('spk_tugas').delete().eq('id_tugas', task1[0].id_tugas);
  }

  // Test 2: id_pelaksana with valid UUID
  console.log('\n🧪 Test 2: id_pelaksana = valid UUID');
  const { data: task2, error: error2 } = await supabase
    .from('spk_tugas')
    .insert({
      id_spk: spk.id_spk,
      id_pelaksana: '00000000-0000-0000-0000-000000000002',
      tipe_tugas: 'VALIDASI_NDRE',
      status_tugas: 'PENDING',
      target_json: { test: 'data' },
      prioritas: 1,
      task_priority: 'URGENT',
    })
    .select();

  if (error2) {
    console.error('❌ Error:', error2.message);
  } else {
    console.log('✅ Success! Task ID:', task2[0].id_tugas);
    await supabase.from('spk_tugas').delete().eq('id_tugas', task2[0].id_tugas);
  }

  // Cleanup
  await supabase.from('spk_header').delete().eq('id_spk', spk.id_spk);
  console.log('\n✅ Cleaned up');
}

testPelaksanaNull();
