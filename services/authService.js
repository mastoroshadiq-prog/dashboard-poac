/**
 * AUTHENTICATION SERVICE
 * 
 * RBAC FASE 3: Authentication Logic
 * Tujuan: Handle login, password verification, JWT generation
 * 
 * Security Features:
 * - Password hashing with bcrypt
 * - JWT token generation
 * - User validation from database
 * - Role assignment
 */

const { supabase } = require('../config/supabase');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * LOGIN: Authenticate user and return JWT token
 * 
 * @param {string} username - Username from login form
 * @param {string} password - Plain text password from login form
 * @returns {Object} { token, user, expires_in }
 * @throws {Error} If authentication fails
 */
async function login(username, password) {
  try {
    console.log(`🔍 [AUTH] Login attempt for username: ${username}`);
    
    // Step 1: Query user from master_pihak table
    // Assuming username is stored in a field (e.g., email, or custom username field)
    // TODO: Adjust query based on actual database schema
    const { data: users, error } = await supabase
      .from('master_pihak')
      .select('id_pihak, nama_pihak, role, password_hash, is_active, username, email')
      .or(`username.eq.${username},email.eq.${username}`)
      .limit(1);
    
    if (error) {
      console.error('❌ [AUTH] Database error:', error.message);
      throw new Error('Database error during authentication');
    }
    
    // Step 2: Check if user exists
    if (!users || users.length === 0) {
      console.warn(`⚠️  [AUTH] User not found: ${username}`);
      throw new Error('Invalid username or password');
    }
    
    const user = users[0];
    
    // Step 3: Check if account is active
    if (user.is_active === false) {
      console.warn(`⚠️  [AUTH] Inactive account: ${username}`);
      throw new Error('User account is inactive');
    }
    
    // Step 4: Verify password
    // If password_hash exists, verify with bcrypt
    // If not, use temporary hardcoded passwords for development
    let isPasswordValid = false;
    
    if (user.password_hash) {
      // Production: Use bcrypt to compare hashed password
      isPasswordValid = await bcrypt.compare(password, user.password_hash);
    } else {
      // Development: Temporary hardcoded passwords (REMOVE IN PRODUCTION!)
      console.warn('⚠️  [AUTH] Using temporary hardcoded passwords (DEV ONLY)');
      
      const devPasswords = {
        'admin': 'admin123',
        'asisten001': 'asisten123',
        'mandor001': 'mandor123',
        'pelaksana001': 'pelaksana123'
      };
      
      isPasswordValid = (password === devPasswords[username]);
    }
    
    if (!isPasswordValid) {
      console.warn(`⚠️  [AUTH] Invalid password for: ${username}`);
      throw new Error('Invalid username or password');
    }
    
    // Step 5: Validate role
    const validRoles = ['ADMIN', 'ASISTEN', 'MANDOR', 'PELAKSANA', 'VIEWER'];
    const userRole = (user.role || 'VIEWER').toUpperCase();
    
    if (!validRoles.includes(userRole)) {
      console.warn(`⚠️  [AUTH] Invalid role for user ${username}: ${userRole}`);
      throw new Error('Invalid user role');
    }
    
    // Step 6: Generate JWT token
    const tokenPayload = {
      id_pihak: user.id_pihak,
      nama_pihak: user.nama_pihak,
      role: userRole
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const decoded = jwt.decode(token);
    
    // Step 7: Return token and user info
    return {
      token: token,
      user: {
        id_pihak: user.id_pihak,
        nama_pihak: user.nama_pihak,
        role: userRole,
        username: user.username || user.email,
        email: user.email
      },
      expires_in: JWT_EXPIRES_IN,
      expires_at: new Date(decoded.exp * 1000).toISOString()
    };
    
  } catch (error) {
    // Re-throw error to be handled by controller
    throw error;
  }
}

/**
 * HASH PASSWORD: Generate bcrypt hash for password
 * 
 * @param {string} plainPassword - Plain text password
 * @returns {string} Hashed password
 */
async function hashPassword(plainPassword) {
  const saltRounds = 10;
  return await bcrypt.hash(plainPassword, saltRounds);
}

/**
 * VERIFY PASSWORD: Compare plain password with hash
 * 
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Bcrypt hashed password
 * @returns {boolean} True if password matches
 */
async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = {
  login,
  hashPassword,
  verifyPassword
};
