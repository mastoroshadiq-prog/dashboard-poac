// List all tables
const { supabase } = require('./config/supabase');

async function listTables() {
  // Try common SPK-related table names
  const tables = ['spk', 'spk_kebun', 'spk_tugas', 'ops_spk', 'spk_header'];
  
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
    
    if (!error) {
      console.log(`✅ Table '${table}' exists`);
      if (data && data.length > 0) {
        console.log('   Columns:', Object.keys(data[0]).join(', '));
      }
    } else {
      console.log(`❌ Table '${table}' not found or error:`, error.message);
    }
  }
}

listTables();
