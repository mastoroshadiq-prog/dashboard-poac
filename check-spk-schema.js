// Check spk_kebun table schema
const { supabase } = require('./config/supabase');

async function checkSchema() {
  // Try insert with minimal data to see required fields
  const testData = {
    no_spk: 'TEST-001',
    jenis_kegiatan: 'TEST',
    prioritas: 'NORMAL',
    status: 'DRAFT',
    catatan: 'Test',
    created_by: 'test-user',
    assigned_to: 'test-mandor',
    target_selesai: '2025-12-31'
  };

  const { data, error } = await supabase
    .from('spk_kebun')
    .insert(testData)
    .select();

  console.log('Insert result:', { data, error });
  
  if (error) {
    console.error('Error details:', JSON.stringify(error, null, 2));
  }

  // Clean up if successful
  if (data && data.length > 0) {
    await supabase.from('spk_kebun').delete().eq('no_spk', 'TEST-001');
    console.log('Test data cleaned up');
  }
}

checkSchema();
