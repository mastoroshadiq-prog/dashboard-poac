/**
 * QUERY KEBUN_OBSERVASI SCHEMA DETAIL
 */

require('dotenv').config();
const { supabase } = require('./config/supabase');

async function queryObservasiSchema() {
  console.log('='.repeat(70));
  console.log('🔍 QUERYING kebun_observasi SCHEMA DETAIL');
  console.log('='.repeat(70));

  try {
    // Query 1: Get column definitions from information_schema
    console.log('\n📊 Query 1: Column Definitions');
    console.log('-'.repeat(70));
    
    const { data: columns, error: colError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT 
            column_name, 
            data_type, 
            is_nullable, 
            column_default,
            character_maximum_length,
            numeric_precision,
            numeric_scale
          FROM information_schema.columns
          WHERE table_schema = 'public' 
            AND table_name = 'kebun_observasi'
          ORDER BY ordinal_position;
        `
      });

    if (colError) {
      console.log('❌ RPC Error:', colError.message);
      console.log('⚠️  Trying alternative method...\n');
      
      // Alternative: Try direct query
      const { data: altData, error: altError } = await supabase
        .from('kebun_observasi')
        .select('*')
        .limit(0);
      
      if (altError) {
        console.log('❌ Alternative Error:', altError.message);
      } else {
        console.log('✅ Table structure inferred from query metadata');
        console.log('(Column names only, types unknown)');
      }
    } else {
      console.log('✅ SUCCESS\n');
      console.log('Columns found:', columns?.length || 0);
      
      if (columns && columns.length > 0) {
        console.log('\nColumn Details:');
        columns.forEach(col => {
          console.log(`
  • ${col.column_name}
    - Type: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}
    - Nullable: ${col.is_nullable}
    - Default: ${col.column_default || 'none'}
          `);
        });
      }
    }

    // Query 2: Foreign Keys
    console.log('\n' + '='.repeat(70));
    console.log('📊 Query 2: Foreign Key Constraints');
    console.log('-'.repeat(70));
    
    const { data: fks, error: fkError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT
            tc.constraint_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
          WHERE tc.table_name = 'kebun_observasi'
            AND tc.constraint_type = 'FOREIGN KEY';
        `
      });

    if (fkError) {
      console.log('❌ Error:', fkError.message);
    } else {
      console.log('✅ SUCCESS\n');
      console.log('Foreign Keys found:', fks?.length || 0);
      
      if (fks && fks.length > 0) {
        fks.forEach(fk => {
          console.log(`  • ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
        });
      } else {
        console.log('  ⚠️  No foreign keys defined');
      }
    }

    // Query 3: Indexes
    console.log('\n' + '='.repeat(70));
    console.log('📊 Query 3: Indexes');
    console.log('-'.repeat(70));
    
    const { data: indexes, error: idxError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT
            indexname,
            indexdef
          FROM pg_indexes
          WHERE tablename = 'kebun_observasi'
            AND schemaname = 'public';
        `
      });

    if (idxError) {
      console.log('❌ Error:', idxError.message);
    } else {
      console.log('✅ SUCCESS\n');
      console.log('Indexes found:', indexes?.length || 0);
      
      if (indexes && indexes.length > 0) {
        indexes.forEach(idx => {
          console.log(`  • ${idx.indexname}`);
          console.log(`    ${idx.indexdef}\n`);
        });
      } else {
        console.log('  ⚠️  No indexes defined (only PK)');
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ SCHEMA QUERY COMPLETE');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ QUERY FAILED');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }

  process.exit(0);
}

queryObservasiSchema();
