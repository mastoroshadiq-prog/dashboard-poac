/**
 * Query information_schema to get kebun_observasi DDL
 */

require('dotenv').config();
const { supabase } = require('./config/supabase');

async function getTableSchema() {
  console.log('🔍 Querying information_schema for kebun_observasi...\n');
  
  try {
    // Query column information using service role (bypass RLS)
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'kebun_observasi'
        ORDER BY ordinal_position;
      `
    });
    
    if (error) {
      console.log('❌ RPC not available, trying direct query...\n');
      
      // Alternative: Try to get schema via REST API metadata
      const response = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/?apikey=${process.env.SUPABASE_KEY}`,
        {
          headers: {
            'apikey': process.env.SUPABASE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_KEY}`
          }
        }
      );
      
      const schema = await response.json();
      console.log('📋 API Schema response:');
      console.log(JSON.stringify(schema, null, 2));
      
      return;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Table columns:\n');
      data.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        console.log(`   ${col.column_name.padEnd(25)} ${col.data_type}${length} ${nullable}`);
        if (col.column_default) {
          console.log(`      DEFAULT: ${col.column_default}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
}

getTableSchema();
