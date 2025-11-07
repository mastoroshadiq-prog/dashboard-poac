/**
 * Simple Test Script for Platform A Endpoints
 * Tests endpoint functionality WITHOUT requiring real database data
 */

const { generateToken } = require('./middleware/authMiddleware');

// Generate token dengan ID yang kita buat sendiri
const testUser = {
  id_pihak: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', // UUID yang sama dengan SQL
  nama_pihak: 'Test Mandor Agus',
  role: 'MANDOR'
};

const token = generateToken(testUser);

console.log('='.repeat(60));
console.log('🧪 SIMPLE TEST - PLATFORM A ENDPOINTS');
console.log('='.repeat(60));
console.log('\n📋 Test User:');
console.log(JSON.stringify(testUser, null, 2));
console.log('\n🔑 Generated JWT Token:');
console.log(token);
console.log('\n' + '='.repeat(60));
console.log('📝 HOW TO TEST:');
console.log('='.repeat(60));
console.log('\n1️⃣  TEST GET /api/v1/spk/tugas/saya:');
console.log('   PowerShell:');
console.log(`   $token = "${token}"`);
console.log('   Invoke-RestMethod -Uri "http://localhost:3000/api/v1/spk/tugas/saya" -Headers @{Authorization="Bearer $token"}');
console.log('\n2️⃣  TEST POST /api/v1/spk/log_aktivitas:');
console.log('   PowerShell:');
console.log(`   $token = "${token}"`);
console.log('   $body = @{');
console.log('     log_aktivitas = @(');
console.log('       @{');
console.log('         id_tugas = "c2ffbc99-9c0b-4ef8-bb6d-6bb9bd380c01"');
console.log('         id_npokok = "b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380b01"');
console.log('         timestamp_eksekusi = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss")');
console.log('         gps_eksekusi = @{ lat = -6.2088; lon = 106.8456 }');
console.log('         hasil_json = @{');
console.log('           status_aktual = "G1"');
console.log('           kondisi = "Baik"');
console.log('           catatan = "Test dari PowerShell"');
console.log('         }');
console.log('       }');
console.log('     )');
console.log('   } | ConvertTo-Json -Depth 5');
console.log('   Invoke-RestMethod -Uri "http://localhost:3000/api/v1/spk/log_aktivitas" -Method POST -Headers @{Authorization="Bearer $token"; "Content-Type"="application/json"} -Body $body');
console.log('\n' + '='.repeat(60));
console.log('⚠️  NOTE:');
console.log('   - Make sure server is running: node index.js');
console.log('   - Endpoint will fail if id_tugas/id_npokok not exist in DB');
console.log('   - Use real IDs from database for actual testing');
console.log('='.repeat(60));
