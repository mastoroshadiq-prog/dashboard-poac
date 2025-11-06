/**
 * Generate JWT Token ONLY (no server import)
 */
require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Test user: Mandor Agus
const testUser = {
  id_pihak: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10',
  nama_pihak: 'Test Mandor Agus',
  role: 'MANDOR'
};

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
console.log('📝 USAGE:');
console.log('='.repeat(80));
console.log('\n$token = "' + token + '"');
console.log('\nInvoke-RestMethod -Uri "http://localhost:3000/api/v1/spk/tugas/saya" `');
console.log('  -Headers @{Authorization="Bearer $token"} | ConvertTo-Json -Depth 5');
console.log('\n' + '='.repeat(80));
