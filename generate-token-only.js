/**
 * Generate JWT Token ONLY (no server import)
 * 
 * Usage: node generate-token-only.js [role]
 * Example: node generate-token-only.js ASISTEN
 */
require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Get role from command line argument (default: MANDOR)
const requestedRole = (process.argv[2] || 'MANDOR').toUpperCase();

// Test users untuk berbagai role
const testUsers = {
  ADMIN: {
    id_pihak: '11111111-1111-1111-1111-111111111111',
    nama_pihak: 'Test Admin User',
    role: 'ADMIN'
  },
  ASISTEN: {
    id_pihak: '22222222-2222-2222-2222-222222222222',
    nama_pihak: 'Test Asisten Kebun',
    role: 'ASISTEN'
  },
  MANDOR: {
    id_pihak: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10',
    nama_pihak: 'Test Mandor Agus',
    role: 'MANDOR'
  },
  PELAKSANA: {
    id_pihak: '44444444-4444-4444-4444-444444444444',
    nama_pihak: 'Test Pelaksana Field',
    role: 'PELAKSANA'
  },
  VIEWER: {
    id_pihak: '55555555-5555-5555-5555-555555555555',
    nama_pihak: 'Test Viewer Only',
    role: 'VIEWER'
  }
};

// Validate role
if (!testUsers[requestedRole]) {
  console.error('❌ Invalid role:', requestedRole);
  console.log('\n📋 Available roles:');
  Object.keys(testUsers).forEach(role => {
    console.log(`   - ${role}`);
  });
  console.log('\n💡 Usage: node generate-token-only.js [ROLE]');
  console.log('   Example: node generate-token-only.js ASISTEN');
  process.exit(1);
}

const testUser = testUsers[requestedRole];

// Generate token
const token = jwt.sign(testUser, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
const decoded = jwt.decode(token);

console.log('='.repeat(80));
console.log('🔑 JWT TOKEN FOR TESTING');
console.log('='.repeat(80));
console.log('\n📋 User Info:');
console.log('   ID Pihak:', testUser.id_pihak);
console.log('   Nama:', testUser.nama_pihak);
console.log('   Role:', testUser.role);
console.log('\n🎫 Token (copy this):');
console.log(token);
console.log('\n⏰ Expires:', new Date(decoded.exp * 1000).toLocaleString());
console.log('\n' + '='.repeat(80));
console.log('📝 POWERSHELL USAGE:');
console.log('='.repeat(80));
console.log('\n$asistenToken = "' + token + '"');
console.log('\n# Test Dashboard KPI Eksekutif (ASISTEN/ADMIN only)');
console.log('Invoke-RestMethod -Uri "http://localhost:3000/api/v1/dashboard/kpi-eksekutif" `');
console.log('  -Headers @{Authorization="Bearer $asistenToken"} | ConvertTo-Json -Depth 5');
console.log('\n# Test Dashboard Operasional (MANDOR/ASISTEN/ADMIN)');
console.log('Invoke-RestMethod -Uri "http://localhost:3000/api/v1/dashboard/operasional" `');
console.log('  -Headers @{Authorization="Bearer $asistenToken"} | ConvertTo-Json -Depth 5');
console.log('\n# Test Dashboard Teknis (MANDOR/ASISTEN/ADMIN)');
console.log('Invoke-RestMethod -Uri "http://localhost:3000/api/v1/dashboard/teknis" `');
console.log('  -Headers @{Authorization="Bearer $asistenToken"} | ConvertTo-Json -Depth 5');
console.log('\n' + '='.repeat(80));
