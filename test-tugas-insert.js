const { supabase } = require('./config/supabase');

async function testTugasInsert() {
  // First create a test SPK
  const spkData = {
    nama_spk: 'Test SPK for Tugas',
    id_asisten_pembuat: '00000000-0000-0000-0000-000000000001',
    tanggal_dibuat: new Date().toISOString(),
    tanggal_target_selesai: '2025-12-31',
    status_spk: 'PENDING',
    keterangan: 'Test',
    risk_level: 'NORMAL',
    week_number: 46,
  };

  const { data: spk, error: spkError } = await supabase
    .from('spk_header')
    .insert(spkData)
    .select()
    .single();

  if (spkError) {
    console.error('Failed to create SPK:', spkError);
    return;
  }

  console.log('✅ SPK Created:', spk.id_spk);

  // Now try to create a task (simulating real data from service)
  const taskData = {
    id_spk: spk.id_spk,
    id_pelaksana: '00000000-0000-0000-0000-000000000002',
    tipe_tugas: 'VALIDASI_DRONE_NDRE',
    status_tugas: 'PENDING',
    target_json: {
      id_npokok: '62b9b7d9-9a38-4768-b6e7-c791dcdf98a4',
      tree_id: 'P-D001A-16-11',
      tree_location: {
        divisi: 'AME II',
        blok: 'D01',
        blok_detail: 'D001A',
        n_baris: 16,
        n_pokok: 11,
      },
      drone_data: {
        id_observasi: 'some-uuid',
        tanggal_survey: '2025-01-25',
        ndre_value: 0.32138186,
        ndre_classification: 'Stres Berat',
      },
      validation_checklist: [
        'Cek visual kondisi daun',
        'Cek kondisi batang',
      ],
    },
    prioritas: 1, // INTEGER: 1=URGENT, 2=HIGH, 3=NORMAL
    task_priority: 'URGENT', // VARCHAR
    task_description: 'Validasi pohon P-D001A-16-11 - NDRE: 0.32 (Stres Berat)',
    deadline: '2025-12-31',
    pic_name: null,
  };

  console.log('\nTrying to insert task:', taskData);

  const { data: task, error: taskError } = await supabase
    .from('spk_tugas')
    .insert(taskData)
    .select();

  if (taskError) {
    console.error('\n❌ Task Insert Error:', JSON.stringify(taskError, null, 2));
  } else {
    console.log('\n✅ Task Created:', task[0].id_tugas);
  }

  // Cleanup
  if (task) {
    await supabase.from('spk_tugas').delete().eq('id_spk', spk.id_spk);
  }
  await supabase.from('spk_header').delete().eq('id_spk', spk.id_spk);
  console.log('\n✅ Cleaned up test data');
}

testTugasInsert();
