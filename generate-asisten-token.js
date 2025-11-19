/**
 * HELPER SCRIPT - Generate Authentication Token for Testing
 * 
 * Purpose: Generate JWT token untuk testing endpoint yang butuh authentication
 * Usage: node generate-asisten-token.js [role]
 * 
 * Examples:
 *   node generate-asisten-token.js              # Default: ASISTEN token
 *   node generate-asisten-token.js MANDOR_AGUS  # Generate token for Mandor Agus
 *   node generate-asisten-token.js MANDOR_EKO   # Generate token for Mandor Eko
 *   node generate-asisten-token.js ADMIN        # Generate token for Admin
 */

const jwt = require('jsonwebtoken');

// JWT Secret (MUST match index.js)
const JWT_SECRET = process.env.JWT_SECRET || 'keboen-saraf-digital-secret-2024-v1';

// User data for token generation
const USERS = {
  ASISTEN: {
    id_pihak: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20',
    nama: 'Budi (Asisten Afdeling)',
    username: 'asisten.budi',
    kode_unik: 'ASISTEN_BUDI',
    role: 'ASISTEN',
    tipe: 'INTERNAL'
  },
  MANDOR_AGUS: {
    id_pihak: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    nama: 'Agus (Mandor Sensus)',
    username: 'agus.mandor',
    kode_unik: 'AGUS_MANDOR',
    role: 'MANDOR',
    tipe: 'INTERNAL'
  },
  MANDOR_EKO: {
    id_pihak: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    nama: 'Eko (Mandor APH)',
    username: 'eko.mandor',
    kode_unik: 'EKO_MANDOR',
    role: 'MANDOR',
    tipe: 'INTERNAL'
  },
  ADMIN: {
    id_pihak: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a30',
    nama: 'Admin System',
    username: 'admin',
    kode_unik: 'ADMIN',
    role: 'ADMIN',
    tipe: 'INTERNAL'
  }
};

// Get role from command line argument
const role = process.argv[2] ? process.argv[2].toUpperCase() : 'ASISTEN';

// Validate role
if (!USERS[role]) {
  console.error('❌ Invalid role. Available roles:');
  Object.keys(USERS).forEach(r => console.log(`   - ${r}`));
  process.exit(1);
}

// Generate token
const user = USERS[role];
const token = jwt.sign(
  {
    id_pihak: user.id_pihak,
    nama: user.nama,
    username: user.username,
    kode_unik: user.kode_unik,
    role: user.role,
    tipe: user.tipe
  },
  JWT_SECRET,
  { expiresIn: '24h' }
);

// Output
console.log('\n🔑 TOKEN GENERATED SUCCESSFULLY\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('User Info:');
console.log(`  Name:     ${user.nama}`);
console.log(`  Username: ${user.username}`);
console.log(`  Role:     ${user.role}`);
console.log(`  ID:       ${user.id_pihak}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('Token (valid for 24 hours):');
console.log(token);
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Usage examples
console.log('Usage Examples:\n');
console.log('1. Test Anomaly Detection:');
console.log(`   curl -X GET http://localhost:3000/api/v1/analytics/anomaly-detection \\`);
console.log(`     -H "Authorization: Bearer ${token.substring(0, 30)}..."\n`);

console.log('2. Create SPK from Anomaly:');
console.log(`   curl -X POST http://localhost:3000/api/v1/analytics/create-spk-from-anomaly \\`);
console.log(`     -H "Authorization: Bearer ${token.substring(0, 30)}..." \\`);
console.log(`     -H "Content-Type: application/json" \\`);
console.log(`     -d '{"anomaly_type":"POHON_MIRING","mandor_id":"${USERS.MANDOR_AGUS.id_pihak}","priority":"HIGH"}'\n`);

console.log('3. Get Notifications:');
console.log(`   curl -X GET http://localhost:3000/api/v1/notifications \\`);
console.log(`     -H "Authorization: Bearer ${token.substring(0, 30)}..."\n`);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📋 Copy token above and use in Authorization header');
console.log('⏰ Token expires in 24 hours\n');
