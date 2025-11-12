// Debug query to check if kebun_observasi has data with jenis_survey = 'DRONE_NDRE'
const { supabase } = require('./config/supabase');

async function debug() {
  // Check 1: Count observasi with DRONE_NDRE
  const { count, error } = await supabase
    .from('kebun_observasi')
    .select('*', { count: 'exact', head: true })
    .eq('jenis_survey', 'DRONE_NDRE');
  
  console.log('Total observasi dengan DRONE_NDRE:', count, error);

  // Check 2: Get sample observasi
  const { data, error: err2 } = await supabase
    .from('kebun_observasi')
    .select('*')
    .eq('jenis_survey', 'DRONE_NDRE')
    .limit(3);
  
  console.log('\nSample observasi:', data, err2);

  // Check 3: Try join query
  const { data: joinData, error: err3 } = await supabase
    .from('kebun_n_pokok')
    .select(`
      id_npokok,
      id_tanaman,
      kebun_observasi!inner (
        id_observasi,
        jenis_survey,
        ndre_classification
      )
    `)
    .eq('kebun_observasi.jenis_survey', 'DRONE_NDRE')
    .limit(3);
  
  console.log('\nJoin query result:', joinData, err3);
}

debug();
