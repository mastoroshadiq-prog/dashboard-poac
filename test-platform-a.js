/**
 * TEST SCRIPT: Platform A Endpoints (JWT Required)
 * 
 * Tests untuk:
 * 1. GET /api/v1/spk/tugas/saya (dengan JWT)
 * 2. POST /api/v1/log_aktivitas (dengan JWT + auto-trigger)
 * 
 * REQUIREMENT:
 * - Server harus running (node index.js) di terminal lain
 * - JWT_SECRET harus di-set di .env
 * - Table log_aktivitas_5w1h sudah dibuat di Supabase
 */

require('dotenv').config();

// Import JWT helper (inline untuk avoid server startup)
const jwt = require('jsonwebtoken');
function generateToken(payload) {
  const secret = process.env.JWT_SECRET || 'default-secret-key-CHANGE-THIS';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  if (!payload.id_pihak) {
    throw new Error('id_pihak wajib ada di payload token');
  }
  return jwt.sign(payload, secret, { expiresIn });
}

// Config
const BASE_URL = 'http://localhost:3000/api/v1';

// Sample user (sesuaikan dengan master_pihak Anda)
const testUser = {
  id_pihak: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', // UUID Mandor Agus
  nama_pihak: 'Mandor Agus',
  role: 'MANDOR'
};

async function runTests() {
  console.log('🧪 TEST: Platform A Endpoints (JWT Authentication)');
  console.log('=' .repeat(80));
  console.log('');
  
  // Generate JWT token
  console.log('🔐 1. Generating JWT Token...');
  const token = generateToken(testUser);
  console.log('   User:', testUser.nama_pihak, '(' + testUser.role + ')');
  console.log('   Token:', token.substring(0, 50) + '...');
  console.log('✅ Token generated\n');
  
  // Test 1: GET /api/v1/spk/tugas/saya
  console.log('📱 2. Testing GET /api/v1/spk/tugas/saya...');
  console.log('   Endpoint: ' + BASE_URL + '/spk/tugas/saya?page=1&limit=10');
  
  try {
    const response1 = await fetch(BASE_URL + '/spk/tugas/saya?page=1&limit=10&status=BARU,DIKERJAKAN', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    });
    
    const result1 = await response1.json();
    
    if (response1.ok) {
      console.log('✅ Response:', response1.status);
      console.log('   Success:', result1.success);
      console.log('   Message:', result1.message);
      console.log('   Tugas ditemukan:', result1.data.tugas.length);
      console.log('   Pagination:', JSON.stringify(result1.data.pagination, null, 2));
      
      if (result1.data.tugas.length > 0) {
        console.log('');
        console.log('   Sample Tugas (first):');
        const firstTugas = result1.data.tugas[0];
        console.log('   - ID Tugas:', firstTugas.id_tugas);
        console.log('   - Tipe Tugas:', firstTugas.tipe_tugas);
        console.log('   - Status:', firstTugas.status_tugas);
        console.log('   - Prioritas:', firstTugas.prioritas);
        console.log('   - Target:', JSON.stringify(firstTugas.target_json));
      }
    } else {
      console.log('❌ Response:', response1.status);
      console.log('   Error:', JSON.stringify(result1, null, 2));
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
    console.log('   Apakah server sudah running? (node index.js)');
  }
  
  console.log('');
  console.log('-'.repeat(80));
  console.log('');
  
  // Test 2: POST /api/v1/log_aktivitas (dengan auto-trigger)
  console.log('📱 3. Testing POST /api/v1/log_aktivitas...');
  console.log('   Endpoint: ' + BASE_URL + '/spk/log_aktivitas');
  
  try {
    // Prepare sample log data
    // CATATAN: Sesuaikan id_tugas & id_npokok dengan data real di database Anda
    const sampleLogs = [
      {
        id_tugas: 'c51e1625-abdc-4118-8b2a-5913b934da93', // Ganti dengan id_tugas real
        id_npokok: 'pohon-001',
        timestamp_eksekusi: new Date().toISOString(),
        gps_eksekusi: {
          lat: -6.123456,
          lon: 106.789012
        },
        hasil_json: {
          status_aktual: 'G1', // Trigger APH
          tipe_kejadian: 'VALIDASI_DRONE',
          blok: 'A1',
          keterangan: 'Pohon sakit berat, perlu APH segera',
          foto_url: 'https://example.com/foto1.jpg'
        }
      },
      {
        id_tugas: 'c51e1625-abdc-4118-8b2a-5913b934da93', // Same tugas, different pohon
        id_npokok: 'pohon-002',
        timestamp_eksekusi: new Date().toISOString(),
        gps_eksekusi: {
          lat: -6.123457,
          lon: 106.789013
        },
        hasil_json: {
          status_aktual: 'G2', // Normal, tidak trigger
          tipe_kejadian: 'VALIDASI_DRONE',
          blok: 'A1',
          keterangan: 'Pohon sehat',
          foto_url: 'https://example.com/foto2.jpg'
        }
      },
      {
        id_tugas: 'c51e1625-abdc-4118-8b2a-5913b934da93',
        id_npokok: 'pohon-003',
        timestamp_eksekusi: new Date().toISOString(),
        gps_eksekusi: {
          lat: -6.123458,
          lon: 106.789014
        },
        hasil_json: {
          status_aktual: 'G4', // Trigger SANITASI
          tipe_kejadian: 'VALIDASI_DRONE',
          blok: 'A1',
          keterangan: 'Pohon perlu sanitasi',
          foto_url: 'https://example.com/foto3.jpg'
        }
      }
    ];
    
    console.log('   Log count:', sampleLogs.length);
    console.log('   Expected triggers: 2 Work Orders (1 APH, 1 SANITASI)');
    console.log('');
    
    const response2 = await fetch(BASE_URL + '/spk/log_aktivitas', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        log_aktivitas: sampleLogs
      })
    });
    
    const result2 = await response2.json();
    
    if (response2.ok || response2.status === 207) {
      console.log('✅ Response:', response2.status, response2.status === 207 ? '(Multi-Status)' : '');
      console.log('   Success:', result2.success);
      console.log('   Message:', result2.message);
      console.log('');
      console.log('   Log Summary:');
      console.log('   - Diterima:', result2.data.log_diterima);
      console.log('   - Berhasil:', result2.data.log_berhasil);
      console.log('   - Gagal:', result2.data.log_gagal);
      
      if (result2.data.errors && result2.data.errors.length > 0) {
        console.log('');
        console.log('   Errors:');
        result2.data.errors.forEach(err => {
          console.log('   - Index', err.index + ':', err.error);
        });
      }
      
      console.log('');
      console.log('   Auto-Trigger Results:');
      console.log('   - Work Orders Created:', result2.data.auto_trigger.work_order_created);
      console.log('   - Tugas Status Updated:', result2.data.auto_trigger.tugas_updated);
      
      if (result2.data.auto_trigger.work_order_created > 0) {
        console.log('');
        console.log('🎉 SUCCESS: Auto-trigger Work Order berhasil!');
        console.log('   Check spk_tugas table untuk WO APH/SANITASI yang baru dibuat.');
      }
    } else {
      console.log('❌ Response:', response2.status);
      console.log('   Error:', JSON.stringify(result2, null, 2));
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
    console.log('');
    console.log('⚠️  Kemungkinan penyebab:');
    console.log('   1. Server tidak running');
    console.log('   2. id_tugas tidak exist (sesuaikan dengan data real)');
    console.log('   3. Tabel log_aktivitas_5w1h belum dibuat');
  }
  
  console.log('');
  console.log('=' .repeat(80));
  console.log('✅ Test selesai!');
  console.log('');
  console.log('📝 NEXT STEPS:');
  console.log('   1. Cek database untuk verify:');
  console.log('      - log_aktivitas_5w1h (3 rows baru)');
  console.log('      - spk_tugas (status updated + 2 WO baru)');
  console.log('   2. Cek console.log server untuk detail proses');
  console.log('   3. Buat verification doc jika semua berhasil');
}

// Run tests
runTests().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
