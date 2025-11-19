/**
 * AUTHENTICATION SERVICE
 * ======================
 * Purpose: Handle user authentication (login, password verification, token generation)
 * 
 * Features:
 * - Login with username/password
 * - Bcrypt password hashing & verification
 * - JWT token generation
 * - Support for development mode (hardcoded passwords)
 * 
 * Author: Backend Team
 * Date: November 19, 2025
 */

require('dotenv').config();
const { supabase } = require('../config/supabase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'keboen-saraf-digital-secret-2024-v1';
const JWT_EXPIRY = process.env.JWT_EXPIRES_IN || '24h';
const SALT_ROUNDS = 10;

// Development mode passwords (when password_hash is NULL)
const DEV_PASSWORDS = {
  'agus.mandor': 'mandor123',
  'eko.mandor': 'mandor123',
  'asisten.budi': 'asisten123',
  'admin': 'admin123'
};

/**
 * Login User
 * @param {string} username - Username
 * @param {string} password - Plain text password
 * @returns {Object} { success, token, user, message }
 */
async function login(username, password) {
  try {
    // Validation
    if (!username || !password) {
      return {
        success: false,
        message: 'Username dan password harus diisi'
      };
    }

    // Query user by username
    const { data: users, error } = await supabase
      .from('master_pihak')
      .select('id_pihak, nama, tipe, kode_unik, username, password_hash, is_active')
      .eq('username', username)
      .limit(1);

    if (error) {
      console.error('❌ [Auth] Database error:', error);
      return {
        success: false,
        message: 'Terjadi kesalahan sistem'
      };
    }

    if (!users || users.length === 0) {
      return {
        success: false,
        message: 'Username atau password salah'
      };
    }

    const user = users[0];

    // Check if user is active
    if (user.is_active === false) {
      return {
        success: false,
        message: 'Akun Anda telah dinonaktifkan. Hubungi administrator.'
      };
    }

    // Verify password
    let passwordValid = false;

    if (user.password_hash) {
      // Production mode: verify bcrypt hash
      passwordValid = await bcrypt.compare(password, user.password_hash);
    } else {
      // Development mode: check hardcoded password
      const devPassword = DEV_PASSWORDS[username];
      if (devPassword && devPassword === password) {
        passwordValid = true;
        console.log('⚠️  [Auth] DEV MODE: Using hardcoded password for', username);
      }
    }

    if (!passwordValid) {
      return {
        success: false,
        message: 'Username atau password salah'
      };
    }

    // Determine role based on kode_unik and tipe
    let role = 'VIEWER'; // Default role
    
    if (user.kode_unik?.toUpperCase().includes('ADMIN')) {
      role = 'ADMIN';
    } else if (user.kode_unik?.toUpperCase().includes('ASISTEN')) {
      role = 'ASISTEN';
    } else if (user.kode_unik?.toUpperCase().includes('MANDOR')) {
      role = 'MANDOR';
    } else if (user.tipe === 'PEKERJA') {
      role = 'PELAKSANA';
    }

    // Generate JWT token
    const tokenPayload = {
      id_pihak: user.id_pihak,
      role: role,
      nama_pihak: user.nama,
      username: user.username,
      tipe: user.tipe
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    console.log('✅ [Auth] Login successful:', username, '- Role:', role);

    return {
      success: true,
      token: token,
      user: {
        id_pihak: user.id_pihak,
        nama: user.nama,
        username: user.username,
        role: role,
        tipe: user.tipe
      },
      message: 'Login berhasil'
    };

  } catch (error) {
    console.error('❌ [Auth] Login error:', error);
    return {
      success: false,
      message: 'Terjadi kesalahan sistem'
    };
  }
}

/**
 * Hash Password with Bcrypt
 * @param {string} plainPassword - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(plainPassword) {
  return await bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Verify Password with Bcrypt
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Bcrypt hashed password
 * @returns {Promise<boolean>} True if match
 */
async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Generate JWT Token
 * @param {Object} payload - Token payload
 * @returns {string} JWT token
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify JWT Token
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload or null if invalid
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Change Password
 * @param {string} userId - User ID (UUID)
 * @param {string} oldPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Object} { success, message }
 */
async function changePassword(userId, oldPassword, newPassword) {
  try {
    // Get user
    const { data: users } = await supabase
      .from('master_pihak')
      .select('id_pihak, username, password_hash')
      .eq('id_pihak', userId)
      .limit(1);

    if (!users || users.length === 0) {
      return { success: false, message: 'User tidak ditemukan' };
    }

    const user = users[0];

    // Verify old password
    if (user.password_hash) {
      const valid = await bcrypt.compare(oldPassword, user.password_hash);
      if (!valid) {
        return { success: false, message: 'Password lama salah' };
      }
    } else {
      // Dev mode check
      const devPassword = DEV_PASSWORDS[user.username];
      if (!devPassword || devPassword !== oldPassword) {
        return { success: false, message: 'Password lama salah' };
      }
    }

    // Hash new password
    const newHash = await hashPassword(newPassword);

    // Update password
    const { error } = await supabase
      .from('master_pihak')
      .update({ password_hash: newHash })
      .eq('id_pihak', userId);

    if (error) {
      console.error('❌ [Auth] Password update error:', error);
      return { success: false, message: 'Gagal mengubah password' };
    }

    console.log('✅ [Auth] Password changed for user:', userId);
    return { success: true, message: 'Password berhasil diubah' };

  } catch (error) {
    console.error('❌ [Auth] Change password error:', error);
    return { success: false, message: 'Terjadi kesalahan sistem' };
  }
}

module.exports = {
  login,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  changePassword
};
