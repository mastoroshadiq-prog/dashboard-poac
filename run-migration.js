/**
 * RUN MIGRATION: Add Authentication Fields
 * 
 * This script runs the migration directly using Supabase client
 */

require('dotenv').config();
const { supabase } = require('./config/supabase');
const fs = require('fs');

async function runMigration() {
  console.log('🔧 Running authentication migration...\n');
  
  try {
    // Read SQL file
    const sqlContent = fs.readFileSync('./sql/migration_auth_fields.sql', 'utf8');
    
    // Split by semicolon and filter out comments
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));
    
    console.log(`📝 Found ${statements.length} SQL statements\n`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      
      // Skip comments
      if (stmt.startsWith('COMMENT') || stmt.includes('Success message')) {
        console.log(`⏩ Skipping: ${stmt.substring(0, 50)}...`);
        continue;
      }
      
      console.log(`▶️  Executing statement ${i + 1}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: stmt });
      
      if (error) {
        console.error(`❌ Error:`, error.message);
        
        // Try direct query for ALTER TABLE
        if (stmt.includes('ALTER TABLE') || stmt.includes('CREATE INDEX')) {
          console.log('   ℹ️  This is expected - Supabase doesn\'t support RPC for DDL');
          console.log('   ℹ️  Please run this statement manually in Supabase SQL Editor:');
          console.log(`   ${stmt}`);
          console.log('');
        }
      } else {
        console.log(`✅ Success\n`);
      }
    }
    
    console.log('='.repeat(60));
    console.log('⚠️  IMPORTANT: DDL statements (ALTER TABLE, CREATE INDEX) must be run manually!');
    console.log('Please copy sql/migration_auth_fields.sql to Supabase SQL Editor');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Migration error:', error.message);
  }
}

runMigration();
