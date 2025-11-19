// ============================================================================
// GENERATE JWT TOKENS FOR MANDOR USERS
// ============================================================================
// Purpose: Generate JWT tokens for each mandor user to test RBAC
// Usage: node generate-mandor-tokens.js
// Output: JWT tokens ready to use in Postman/curl
// ============================================================================

require('dotenv').config();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET not found in .env file');
  process.exit(1);
}

// Define actual mandor users (from database - tipe='INTERNAL', kode_unik contains MANDOR)
const mandorUsers = [
  {
    id_pihak: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    nama: 'Agus (Mandor Sensus)',
    role: 'MANDOR',
    kode_unik: 'AGUS_MANDOR'
  },
  {
    id_pihak: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    nama: 'Eko (Mandor APH)',
    role: 'MANDOR',
    kode_unik: 'EKO_MANDOR'
  }
];

console.log('\n=== GENERATING JWT TOKENS FOR MANDOR USERS ===\n');

mandorUsers.forEach((user, index) => {
  const payload = {
    id_pihak: user.id_pihak,
    role: user.role,
    nama_pihak: user.nama
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

  console.log(`${index + 1}. ${user.nama} (${user.kode_unik})`);
  console.log(`   UUID: ${user.id_pihak}`);
  console.log(`   Token: ${token}`);
  console.log('');
});

console.log('✅ Tokens generated successfully!');
console.log('📋 Tokens expire in 24 hours');
console.log('💡 Use these tokens in Authorization: Bearer <token>');
console.log('\n=== POSTMAN TEST EXAMPLE ===');
console.log('GET http://localhost:3000/api/v1/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10/dashboard');
console.log('Authorization: Bearer <token_for_mandor_agus>');
console.log('');
