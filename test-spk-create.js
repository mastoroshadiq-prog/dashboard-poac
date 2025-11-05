/**
 * TEST SCRIPT - Fitur M-4.1: Create SPK Header
 * 
 * Cara menjalankan:
 * node test-spk-create.js
 * 
 * Prasyarat:
 * 1. Server harus running (node index.js)
 * 2. Tabel spk_header harus sudah dibuat di Supabase
 * 3. Harus ada minimal 1 data di master_pihak untuk id_asisten_pembuat
 */

require('dotenv').config();

async function testCreateSpkHeader() {
  console.log('🧪 TEST: Fitur M-4.1 - Create SPK Header');
  console.log('='.repeat(60));
  
  const baseUrl = 'http://localhost:3000';
  
  // Test 1: SUCCESS - Valid data
  console.log('\n📝 Test 1: Valid SPK Header');
  try {
    const validData = {
      nama_spk: 'SPK Validasi Drone Blok A1 - November 2025',
      id_asisten_pembuat: 'uuid-asisten-agus', // Sesuaikan dengan data di master_pihak Anda
      tanggal_target_selesai: '2025-11-15',
      keterangan: 'SPK untuk validasi hasil deteksi drone di Blok A1'
    };
    
    console.log('   Request:', JSON.stringify(validData, null, 2));
    
    const response = await fetch(`${baseUrl}/api/v1/spk/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(validData)
    });
    
    const result = await response.json();
    console.log('   Status:', response.status);
    console.log('   Response:', JSON.stringify(result, null, 2));
    
    if (response.status === 201 && result.success) {
      console.log('   ✅ Test 1 PASSED - SPK Header berhasil dibuat!');
      console.log('   ID SPK:', result.data.id_spk);
    } else {
      console.log('   ❌ Test 1 FAILED');
    }
    
  } catch (error) {
    console.log('   ❌ Test 1 ERROR:', error.message);
  }
  
  // Test 2: VALIDATION ERROR - Missing required field
  console.log('\n📝 Test 2: Missing required field (nama_spk)');
  try {
    const invalidData = {
      id_asisten_pembuat: 'uuid-asisten-agus'
      // nama_spk tidak ada - harusnya error
    };
    
    console.log('   Request:', JSON.stringify(invalidData, null, 2));
    
    const response = await fetch(`${baseUrl}/api/v1/spk/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidData)
    });
    
    const result = await response.json();
    console.log('   Status:', response.status);
    console.log('   Response:', JSON.stringify(result, null, 2));
    
    if (response.status === 400 && !result.success) {
      console.log('   ✅ Test 2 PASSED - Validasi error berhasil ditangkap!');
    } else {
      console.log('   ❌ Test 2 FAILED - Harusnya return 400');
    }
    
  } catch (error) {
    console.log('   ❌ Test 2 ERROR:', error.message);
  }
  
  // Test 3: VALIDATION ERROR - Invalid date format
  console.log('\n📝 Test 3: Invalid date format');
  try {
    const invalidData = {
      nama_spk: 'SPK Test',
      id_asisten_pembuat: 'uuid-asisten-agus',
      tanggal_target_selesai: '15-11-2025' // Format salah, harusnya YYYY-MM-DD
    };
    
    console.log('   Request:', JSON.stringify(invalidData, null, 2));
    
    const response = await fetch(`${baseUrl}/api/v1/spk/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidData)
    });
    
    const result = await response.json();
    console.log('   Status:', response.status);
    console.log('   Response:', JSON.stringify(result, null, 2));
    
    if (response.status === 400 && !result.success) {
      console.log('   ✅ Test 3 PASSED - Validasi format tanggal berhasil!');
    } else {
      console.log('   ❌ Test 3 FAILED - Harusnya return 400');
    }
    
  } catch (error) {
    console.log('   ❌ Test 3 ERROR:', error.message);
  }
  
  // Test 4: VALIDATION ERROR - Invalid ID Asisten (not found)
  console.log('\n📝 Test 4: ID Asisten tidak ditemukan');
  try {
    const invalidData = {
      nama_spk: 'SPK Test',
      id_asisten_pembuat: 'uuid-tidak-ada-12345'
    };
    
    console.log('   Request:', JSON.stringify(invalidData, null, 2));
    
    const response = await fetch(`${baseUrl}/api/v1/spk/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidData)
    });
    
    const result = await response.json();
    console.log('   Status:', response.status);
    console.log('   Response:', JSON.stringify(result, null, 2));
    
    if (response.status === 400 && !result.success) {
      console.log('   ✅ Test 4 PASSED - Validasi ID Asisten berhasil!');
    } else {
      console.log('   ❌ Test 4 FAILED - Harusnya return 400');
    }
    
  } catch (error) {
    console.log('   ❌ Test 4 ERROR:', error.message);
  }
  
  // Test 5: VALIDATION ERROR - Tanggal target di masa lalu
  console.log('\n📝 Test 5: Tanggal target di masa lalu');
  try {
    const invalidData = {
      nama_spk: 'SPK Test',
      id_asisten_pembuat: 'uuid-asisten-agus',
      tanggal_target_selesai: '2020-01-01' // Masa lalu
    };
    
    console.log('   Request:', JSON.stringify(invalidData, null, 2));
    
    const response = await fetch(`${baseUrl}/api/v1/spk/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidData)
    });
    
    const result = await response.json();
    console.log('   Status:', response.status);
    console.log('   Response:', JSON.stringify(result, null, 2));
    
    if (response.status === 400 && !result.success) {
      console.log('   ✅ Test 5 PASSED - Validasi tanggal masa lalu berhasil!');
    } else {
      console.log('   ❌ Test 5 FAILED - Harusnya return 400');
    }
    
  } catch (error) {
    console.log('   ❌ Test 5 ERROR:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 Test selesai!');
  console.log('');
  console.log('📝 CATATAN:');
  console.log('   - Jika Test 1 FAILED karena ID Asisten tidak ditemukan,');
  console.log('     sesuaikan nilai id_asisten_pembuat dengan data di master_pihak Anda');
  console.log('   - Jika Test 4 PASSED, berarti validasi FK berjalan dengan baik');
  console.log('   - Semua test lainnya HARUS PASSED untuk validasi yang proper');
}

// Jalankan test
testCreateSpkHeader().catch(err => {
  console.error('💥 Fatal error:', err);
});
