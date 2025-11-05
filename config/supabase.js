/**
 * SUPABASE CLIENT CONFIGURATION
 * 
 * Filosofi TEPAT (Akurat): Koneksi database yang aman dan reliable
 * Tuntunan Keamanan: Credentials disimpan di environment variables
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Validasi environment variables (Prinsip: Jangan percaya konfigurasi)
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error(
    '❌ SUPABASE_URL dan SUPABASE_KEY harus diset di file .env!\n' +
    'Silakan buat file .env berdasarkan .env.example'
  );
}

// Inisialisasi Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false // Backend tidak perlu persist session
    }
  }
);

// Test koneksi (optional - untuk debugging)
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('spk_header')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Supabase connection established');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
};

module.exports = {
  supabase,
  testConnection
};
