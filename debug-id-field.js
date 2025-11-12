const { supabase } = require('./config/supabase');

async function testIdNpokok() {
  const { data, error } = await supabase
    .from('kebun_observasi')
    .select(`
      id_observasi,
      id_npokok,
      ndre_classification,
      kebun_n_pokok (id_tanaman)
    `)
    .eq('jenis_survey', 'DRONE_NDRE')
    .eq('ndre_classification', 'Stres Berat')
    .limit(3);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Query result:');
  data.forEach((obs, i) => {
    console.log(`\n[${i + 1}]`);
    console.log('  id_observasi:', obs.id_observasi);
    console.log('  id_npokok:', obs.id_npokok);
    console.log('  tree_id:', obs.kebun_n_pokok?.id_tanaman);
    console.log('  classification:', obs.ndre_classification);
  });

  // Test mapping
  console.log('\n\nTest mapping (like in service):');
  const mapData = data.map(obs => ({
    id: obs.id_npokok,
    tree_id: obs.kebun_n_pokok?.id_tanaman,
    classification: obs.ndre_classification
  }));

  console.log(JSON.stringify(mapData, null, 2));
}

testIdNpokok();
