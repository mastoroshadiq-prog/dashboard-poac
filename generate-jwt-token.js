/**
 * JWT TOKEN GENERATOR - Helper untuk Testing
 * 
 * TUJUAN: Generate JWT token untuk testing endpoint yang butuh authentication
 * 
 * USAGE:
 * 1. Set JWT_SECRET di .env
 * 2. Run: node generate-jwt-token.js
 * 3. Copy token dan gunakan di header: "Authorization: Bearer <token>"
 */

require('dotenv').config();
const { generateToken } = require('./middleware/authMiddleware');

// Sample user data (sesuaikan dengan data di master_pihak Anda)
const sampleUsers = [
  {
    id_pihak: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10',
    nama_pihak: 'Mandor Agus',
    role: 'MANDOR'
  },
  {
    id_pihak: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    nama_pihak: 'Mandor Budi',
    role: 'MANDOR'
  },
  {
    id_pihak: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    nama_pihak: 'Asisten Citra',
    role: 'ASISTEN'
  }
];

console.log('🔐 JWT TOKEN GENERATOR');
console.log('=' .repeat(80));
console.log('');

// Check JWT_SECRET
const secret = process.env.JWT_SECRET;
if (!secret || secret === 'your-secret-key-here-min-32-characters') {
  console.log('⚠️  WARNING: JWT_SECRET not set or using default value!');
  console.log('   Set JWT_SECRET in .env file for production.');
  console.log('');
}

// Generate tokens untuk setiap sample user
sampleUsers.forEach((user, index) => {
  console.log(`${index + 1}. ${user.nama_pihak} (${user.role})`);
  console.log('   ID Pihak:', user.id_pihak);
  
  try {
    const token = generateToken({
      id_pihak: user.id_pihak,
      nama_pihak: user.nama_pihak,
      role: user.role
    });
    
    console.log('   Token:', token);
    console.log('');
    console.log('   COPY THIS FOR TESTING:');
    console.log('   Authorization: Bearer ' + token);
    console.log('');
    
    // Decode untuk verify
    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token);
    console.log('   Decoded Payload:', JSON.stringify(decoded, null, 2));
    console.log('   Expires:', new Date(decoded.exp * 1000).toLocaleString());
    
  } catch (err) {
    console.log('   ❌ Error:', err.message);
  }
  
  console.log('');
  console.log('-'.repeat(80));
  console.log('');
});

console.log('✅ Tokens generated successfully!');
console.log('');
console.log('📝 USAGE IN CURL:');
console.log('   curl -X GET http://localhost:3000/api/v1/spk/tugas/saya \\');
console.log('     -H "Authorization: Bearer <token>"');
console.log('');
console.log('📝 USAGE IN POSTMAN:');
console.log('   1. Go to "Authorization" tab');
console.log('   2. Type: Bearer Token');
console.log('   3. Paste token in "Token" field');
console.log('');
