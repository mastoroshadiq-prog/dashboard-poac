/**
 * SIMPLE LOGIN TEST
 * Test login dengan username agus.mandor (BUKAN email)
 */

async function testLogin() {
  try {
    console.log('\n🔐 Testing Login...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Username: agus.mandor');
    console.log('Password: mandor123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const axios = require('axios');
    
    const response = await axios.post('http://localhost:3000/api/v1/auth/login', {
      username: 'agus.mandor',
      password: 'mandor123'
    });

    const data = response.data;

    console.log('Response Status:', response.status);
    console.log('\nResponse Data:');
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ LOGIN BERHASIL!\n');
      console.log('Token:', data.token.substring(0, 50) + '...');
      console.log('\nUser Info:');
      console.log('  ID:', data.user.id_pihak);
      console.log('  Nama:', data.user.nama);
      console.log('  Username:', data.user.username);
      console.log('  Role:', data.user.role);
    } else {
      console.log('\n❌ LOGIN GAGAL!');
      console.log('Error:', data.message);
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.response?.data || error.message);
  }
}

testLogin();
