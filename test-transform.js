// Test transform function with real CSV data

function parseIntSafe(value) {
  if (!value || value === '' || value === 'NaN' || value === 'null') return null;
  const parsed = parseInt(value);
  return isNaN(parsed) ? null : parsed;
}

function parseStringSafe(value) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') value = String(value);
  const trimmed = value.trim();
  if (trimmed === '' || trimmed.toLowerCase() === 'nan' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') return null;
  return trimmed;
}

function transformToMasterData(row) {
  console.log('RAW row:', JSON.stringify(row, null, 2));
  console.log('\nProcessing each field:');
  console.log('  row.objectid:', JSON.stringify(row.objectid));
  console.log('  row.divisi:', JSON.stringify(row.divisi));
  console.log('  row.blok:', JSON.stringify(row.blok));
  
  const result = {
    object_id: parseIntSafe(row.objectid),
    divisi: parseStringSafe(row.divisi),
    blok: parseStringSafe(row.blok),
    blok_detail: parseStringSafe(row.blok_b),
    n_baris: parseIntSafe(row.n_baris),
    n_pokok: parseIntSafe(row.n_pokok),
    tgl_tanam: row.t_tanam ? `${row.t_tanam}-01-01` : null,
    id_tipe: 'SAWIT',
    kode: parseStringSafe(row.blok_b),
    catatan: parseStringSafe(row.ket),
  };
  
  console.log('\nResult:', JSON.stringify(result, null, 2));
  return result;
}

// Test with real data
const testRow = {
  "divisi": "AME II",
  "blok": "D01",
  "blok_b": "D001A",
  "t_tanam": "2009",
  "n_baris": "1",
  "n_pokok": "1",
  "objectid": "167903",
  "ndre125": "0.386189026",
  "klassndre12025": "Stres Berat",
  "ket": "Pokok Utama"
};

transformToMasterData(testRow);
