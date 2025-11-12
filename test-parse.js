// Quick test parseStringSafe function

function parseStringSafe(value) {
  console.log('Input:', JSON.stringify(value), 'Type:', typeof value);
  
  if (value === undefined || value === null) {
    console.log('  => null (undefined/null)');
    return null;
  }
  if (typeof value !== 'string') value = String(value);
  const trimmed = value.trim();
  console.log('  Trimmed:', JSON.stringify(trimmed));
  
  if (trimmed === '' || trimmed.toLowerCase() === 'nan' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') {
    console.log('  => null (empty/nan/null/undefined)');
    return null;
  }
  console.log('  => Result:', JSON.stringify(trimmed));
  return trimmed;
}

// Test
console.log('\nTest 1: "AME II"');
parseStringSafe("AME II");

console.log('\nTest 2: "D01"');
parseStringSafe("D01");

console.log('\nTest 3: ""');
parseStringSafe("");

console.log('\nTest 4: "Pokok Utama"');
parseStringSafe("Pokok Utama");
