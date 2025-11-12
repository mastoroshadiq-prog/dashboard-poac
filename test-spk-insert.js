const { supabase } = require('./config/supabase');

async function testInsert() {
  const testData = {
    nama_spk: 'Test SPK',
    id_asisten_pembuat: '00000000-0000-0000-0000-000000000001',
    tanggal_dibuat: new Date().toISOString(),
    tanggal_target_selesai: '2025-12-31',
    status_spk: 'PENDING',
    keterangan: 'Test keterangan',
    risk_level: 'NORMAL',
    week_number: 46,
  };

  console.log('Testing insert with data:', testData);

  const { data, error } = await supabase
    .from('spk_header')
    .insert(testData)
    .select();

  console.log('\nResult:', { data, error });

  if (error) {
    console.error('\nDetailed error:', JSON.stringify(error, null, 2));
  }

  // Cleanup
  if (data && data[0]) {
    await supabase.from('spk_header').delete().eq('id_spk', data[0].id_spk);
    console.log('\nCleaned up test data');
  }
}

testInsert();
