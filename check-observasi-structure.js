/**
 * Check kebun_observasi existing structure
 */

require('dotenv').config();
const { supabase } = require('./config/supabase');

async function checkStructure() {
  console.log('🔍 Checking kebun_observasi structure...\n');
  
  try {
    // Method 1: Try to select with limit 0 to get column info
    const { data, error } = await supabase
      .from('kebun_observasi')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error querying table:', error.message);
      return;
    }
    
    console.log('✅ Table exists!');
    console.log(`   Rows: ${data.length}`);
    
    if (data.length > 0) {
      console.log('\n📋 Existing columns:');
      Object.keys(data[0]).forEach(col => {
        console.log(`   - ${col}: ${typeof data[0][col]}`);
      });
    } else {
      console.log('\n⚠️  Table is empty, attempting to infer structure...');
      
      // Try inserting then immediately deleting to see error
      const testInsert = await supabase
        .from('kebun_observasi')
        .insert({})
        .select();
      
      if (testInsert.error) {
        console.log('\n📋 Required columns (from error):');
        console.log(testInsert.error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }
}

checkStructure();
