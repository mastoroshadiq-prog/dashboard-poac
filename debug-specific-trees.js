// Test with specific tree IDs from test-spk-simple.js
const { supabase } = require('./config/supabase');

const treeIds = [
  '62b9b7d9-9a38-4768-b6e7-c791dcdf98a4', // P-D001A-16-11
  '4cebaeda-ce88-49aa-8caa-c79c2c1e2d5f', // P-D001A-32-18
  'c9d62502-abb2-4d74-b46b-4b39bf0ebbee'  // P-D001A-16-14
];

async function testQuery() {
  console.log('Testing with tree IDs:', treeIds);
  
  const { data, error } = await supabase
    .from('kebun_n_pokok')
    .select(`
      *,
      kebun_observasi!inner (
        id_observasi,
        tanggal_survey,
        ndre_value,
        ndre_classification,
        jenis_survey
      )
    `)
    .in('id_npokok', treeIds)
    .eq('kebun_observasi.jenis_survey', 'DRONE_NDRE');
  
  console.log('\nQuery result:');
  console.log('- Count:', data?.length);
  console.log('- Error:', error);
  console.log('- Data:', data);
}

testQuery();
