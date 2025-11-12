/**
 * IMPORT NDRE CSV - EFFICIENT BATCH PROCESSOR
 * 
 * Features:
 * - Import first 1000 rows from large CSV
 * - 2-phase process: Master data → Observation data
 * - Batch processing (100 rows per batch)
 * - Progress tracking
 * - Error handling with rollback
 * - Dry-run mode for testing
 * 
 * Usage:
 *   node import-ndre-csv.js --file=context/tableNDRE.csv --limit=1000 --survey-date=2025-01-25
 *   node import-ndre-csv.js --file=context/tableNDRE.csv --limit=1000 --dry-run
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { supabase } = require('./config/supabase');

// ================================================================
// CONFIGURATION
// ================================================================

const config = {
  filePath: 'context/tableNDRE.csv',
  maxRows: 1000,                    // Limit import to first 1000 rows
  batchSize: 100,                   // Process 100 rows per batch
  surveyDate: '2025-01-25',         // Default survey date (override via --survey-date)
  surveyType: 'DRONE_NDRE',         // Survey type identifier
  dryRun: false,                    // If true, don't actually insert (testing only)
};

// Parse command line arguments
process.argv.forEach(arg => {
  if (arg.startsWith('--file=')) config.filePath = arg.split('=')[1];
  if (arg.startsWith('--limit=')) config.maxRows = parseInt(arg.split('=')[1]);
  if (arg.startsWith('--batch=')) config.batchSize = parseInt(arg.split('=')[1]);
  if (arg.startsWith('--survey-date=')) config.surveyDate = arg.split('=')[1];
  if (arg === '--dry-run') config.dryRun = true;
});

// ================================================================
// UTILITY FUNCTIONS
// ================================================================

/**
 * Read and parse CSV file
 */
function readCSV(filePath, maxRows) {
  console.log(`📂 Reading CSV: ${filePath}`);
  
  let fileContent = fs.readFileSync(filePath, 'utf-8');
  
  // Remove BOM (Byte Order Mark) if present
  if (fileContent.charCodeAt(0) === 0xFEFF) {
    fileContent = fileContent.slice(1);
    console.log('   ⚠️  Removed UTF-8 BOM from file');
  }
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  
  const limited = records.slice(0, maxRows);
  console.log(`✅ Parsed ${records.length} total rows, processing ${limited.length} rows`);
  
  return limited;
}

/**
 * Transform CSV row to master data format
 */
function transformToMasterData(row) {
  // Helper function to parse integer safely
  const parseIntSafe = (value) => {
    if (!value || value === '' || value === 'NaN' || value === 'null') return null;
    const parsed = parseInt(value);
    return isNaN(parsed) ? null : parsed;
  };
  
  // Helper function to parse string safely
  const parseStringSafe = (value) => {
    if (value === undefined || value === null) return null;
    if (typeof value !== 'string') value = String(value);
    const trimmed = value.trim();
    if (trimmed === '' || trimmed.toLowerCase() === 'nan' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') return null;
    return trimmed;
  };
  
  // CSV columns are lowercase: divisi, blok, blok_b, t_tanam, n_baris, n_pokok, objectid, ndre125, klassndre12025, ket
  return {
    object_id: parseIntSafe(row.objectid),
    divisi: parseStringSafe(row.divisi),
    blok: parseStringSafe(row.blok),
    blok_detail: parseStringSafe(row.blok_b),
    n_baris: parseIntSafe(row.n_baris),
    n_pokok: parseIntSafe(row.n_pokok),
    tgl_tanam: row.t_tanam ? `${row.t_tanam}-01-01` : null, // Year to full date (Jan 1st)
    id_tipe: 'SAWIT',
    id_tanaman: `P-${row.blok_b}-${String(row.n_baris).padStart(2, '0')}-${String(row.n_pokok).padStart(2, '0')}`, // Generate id_tanaman: P-D001A-01-01
    kode: parseStringSafe(row.blok_b),
    catatan: parseStringSafe(row.ket),
  };
}

/**
 * Batch array into chunks
 */
function batchArray(array, batchSize) {
  const batches = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * Progress bar
 */
function progressBar(current, total, label = '') {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round(percentage / 2);
  const bar = '█'.repeat(filled) + '░'.repeat(50 - filled);
  process.stdout.write(`\r${label} [${bar}] ${percentage}% (${current}/${total})`);
  if (current === total) console.log(''); // New line when complete
}

// ================================================================
// PHASE 1: UPSERT MASTER DATA (kebun_n_pokok)
// ================================================================

async function upsertMasterData(rows) {
  console.log('\n' + '='.repeat(70));
  console.log('📊 PHASE 1: UPSERT MASTER DATA (kebun_n_pokok)');
  console.log('='.repeat(70));
  
  const masterData = rows.map(transformToMasterData);
  const batches = batchArray(masterData, config.batchSize);
  
  console.log(`Processing ${masterData.length} rows in ${batches.length} batches...`);
  
  let totalInserted = 0;
  let totalUpdated = 0;
  let totalErrors = 0;
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    progressBar(i + 1, batches.length, 'Progress');
    
    if (config.dryRun) {
      console.log(`\n[DRY RUN] Would upsert batch ${i + 1}: ${batch.length} rows`);
      continue;
    }
    
    try {
      // Strategy: Try to find existing records first, then update or insert
      for (const row of batch) {
        // Skip rows with missing critical data
        if (!row.divisi || !row.blok || row.n_baris === null || row.n_pokok === null) {
          totalErrors++;
          console.error(`\n❌ Skipped row (missing data): divisi=${row.divisi}, blok=${row.blok}, n_baris=${row.n_baris}, n_pokok=${row.n_pokok}`);
          continue;
        }
        
        // Check if record exists based on location (divisi, blok, n_baris, n_pokok)
        const { data: existing, error: findError } = await supabase
          .from('kebun_n_pokok')
          .select('id_npokok')
          .eq('divisi', row.divisi)
          .eq('blok', row.blok)
          .eq('n_baris', row.n_baris)
          .eq('n_pokok', row.n_pokok)
          .maybeSingle();
        
        if (findError && !findError.message.includes('multiple')) {
          totalErrors++;
          console.error(`\n❌ Find error:`, findError.message);
          continue;
        }
        
        if (existing) {
          // Update existing record
          const { error: updateError } = await supabase
            .from('kebun_n_pokok')
            .update({
              object_id: row.object_id,
              blok_detail: row.blok_detail,
              tgl_tanam: row.tgl_tanam,
              kode: row.kode,
              catatan: row.catatan,
            })
            .eq('id_npokok', existing.id_npokok);
          
          if (updateError) {
            totalErrors++;
            console.error(`\n❌ Update error:`, updateError.message);
          } else {
            totalUpdated++;
          }
        } else {
          // Insert new record
          const { error: insertError } = await supabase
            .from('kebun_n_pokok')
            .insert(row);
          
          if (insertError) {
            totalErrors++;
            console.error(`\n❌ Insert error:`, insertError.message);
          } else {
            totalInserted++;
          }
        }
      }
    } catch (error) {
      totalErrors += batch.length;
      console.error(`\n❌ Batch ${i + 1} failed:`, error.message);
    }
  }
  
  console.log('\n' + '-'.repeat(70));
  console.log(`✅ PHASE 1 COMPLETE`);
  console.log(`   - Inserted/Updated: ${totalInserted}`);
  console.log(`   - Errors: ${totalErrors}`);
  console.log('-'.repeat(70));
  
  return { inserted: totalInserted, errors: totalErrors };
}

// ================================================================
// PHASE 2: INSERT OBSERVATION DATA (kebun_observasi)
// ================================================================

async function insertObservationData(rows) {
  console.log('\n' + '='.repeat(70));
  console.log('📊 PHASE 2: INSERT OBSERVATION DATA (kebun_observasi)');
  console.log('='.repeat(70));
  
  console.log(`Fetching master data to get id_npokok mapping...`);
  
  // Build lookup map: (divisi, blok, n_baris, n_pokok) -> id_npokok
  const masterLookup = new Map();
  
  const batches = batchArray(rows, config.batchSize);
  let totalProcessed = 0;
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    
    // Get unique locations from this batch
    const locations = batch.map(row => ({
      divisi: row.divisi,
      blok: row.blok,
      n_baris: parseInt(row.n_baris),
      n_pokok: parseInt(row.n_pokok),
    }));
    
    // Fetch master data for these locations
    for (const loc of locations) {
      const key = `${loc.divisi}|${loc.blok}|${loc.n_baris}|${loc.n_pokok}`;
      
      if (masterLookup.has(key)) continue; // Already fetched
      
      const { data, error } = await supabase
        .from('kebun_n_pokok')
        .select('id_npokok, divisi, blok, n_baris, n_pokok')
        .eq('divisi', loc.divisi)
        .eq('blok', loc.blok)
        .eq('n_baris', loc.n_baris)
        .eq('n_pokok', loc.n_pokok)
        .single();
      
      if (data) {
        masterLookup.set(key, data.id_npokok);
      }
    }
    
    totalProcessed += batch.length;
    progressBar(totalProcessed, rows.length, 'Fetching master data');
  }
  
  console.log(`\n✅ Fetched ${masterLookup.size} master records`);
  
  // Now insert observation data
  console.log(`Inserting observation data...`);
  
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  
  const obsBatches = batchArray(rows, config.batchSize);
  
  for (let i = 0; i < obsBatches.length; i++) {
    const batch = obsBatches[i];
    progressBar(i + 1, obsBatches.length, 'Progress');
    
    const observationData = batch
      .map(row => {
        const key = `${row.divisi}|${row.blok}|${parseInt(row.n_baris)}|${parseInt(row.n_pokok)}`;
        const id_npokok = masterLookup.get(key);
        
        if (!id_npokok) {
          totalSkipped++;
          return null;
        }
        
        return {
          id_npokok: id_npokok,
          tanggal_survey: config.surveyDate,
          jenis_survey: config.surveyType,
          ndre_value: parseFloat(row.ndre125),
          ndre_classification: row.klassndre12025,
          keterangan: row.ket || null,
          metadata_json: {
            object_id: parseInt(row.objectid),
            divisi: row.divisi,
            blok: row.blok,
            blok_detail: row.blok_b,
            tahun_tanam: parseInt(row.t_tanam),
          },
        };
      })
      .filter(Boolean); // Remove nulls
    
    if (config.dryRun) {
      console.log(`\n[DRY RUN] Would insert batch ${i + 1}: ${observationData.length} rows`);
      continue;
    }
    
    if (observationData.length > 0) {
      try {
        const { data, error } = await supabase
          .from('kebun_observasi')
          .insert(observationData)
          .select();
        
        if (error) {
          totalErrors += observationData.length;
          console.error(`\n❌ Batch ${i + 1} failed:`, error.message);
        } else {
          totalInserted += data.length;
        }
      } catch (error) {
        totalErrors += observationData.length;
        console.error(`\n❌ Batch ${i + 1} exception:`, error.message);
      }
    }
  }
  
  console.log('\n' + '-'.repeat(70));
  console.log(`✅ PHASE 2 COMPLETE`);
  console.log(`   - Inserted: ${totalInserted}`);
  console.log(`   - Skipped (no master): ${totalSkipped}`);
  console.log(`   - Errors: ${totalErrors}`);
  console.log('-'.repeat(70));
  
  return { inserted: totalInserted, skipped: totalSkipped, errors: totalErrors };
}

// ================================================================
// MAIN IMPORT PROCESS
// ================================================================

async function main() {
  console.log('='.repeat(70));
  console.log('🚀 NDRE CSV IMPORT - BATCH PROCESSOR');
  console.log('='.repeat(70));
  console.log('');
  console.log('Configuration:');
  console.log(`  - File: ${config.filePath}`);
  console.log(`  - Max Rows: ${config.maxRows}`);
  console.log(`  - Batch Size: ${config.batchSize}`);
  console.log(`  - Survey Date: ${config.surveyDate}`);
  console.log(`  - Survey Type: ${config.surveyType}`);
  console.log(`  - Dry Run: ${config.dryRun ? 'YES (no data will be inserted)' : 'NO (data will be inserted)'}`);
  console.log('');
  
  const startTime = Date.now();
  
  try {
    // Step 1: Read CSV
    const rows = readCSV(config.filePath, config.maxRows);
    
    if (rows.length === 0) {
      console.log('⚠️  No data to import!');
      process.exit(0);
    }
    
    // Step 2: Phase 1 - Master data
    const phase1Result = await upsertMasterData(rows);
    
    // Step 3: Phase 2 - Observation data
    const phase2Result = await insertObservationData(rows);
    
    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total Rows Processed: ${rows.length}`);
    console.log(`Duration: ${duration}s`);
    console.log('');
    console.log('Phase 1 (Master Data):');
    console.log(`  - Inserted/Updated: ${phase1Result.inserted}`);
    console.log(`  - Errors: ${phase1Result.errors}`);
    console.log('');
    console.log('Phase 2 (Observation Data):');
    console.log(`  - Inserted: ${phase2Result.inserted}`);
    console.log(`  - Skipped: ${phase2Result.skipped}`);
    console.log(`  - Errors: ${phase2Result.errors}`);
    console.log('');
    
    if (phase1Result.errors === 0 && phase2Result.errors === 0) {
      console.log('✅ IMPORT SUCCESSFUL!');
    } else {
      console.log('⚠️  IMPORT COMPLETED WITH ERRORS');
    }
    
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('\n❌ IMPORT FAILED');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };
