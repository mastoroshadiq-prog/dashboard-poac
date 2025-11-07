/**
 * AUTHENTICATION ROUTES - LOGIN & TOKEN MANAGEMENT
 * 
 * RBAC FASE 3: Authentication Endpoints
 * Tujuan: Menyediakan endpoint login untuk Frontend Dashboard
 * 
 * Endpoints:
 * - POST /auth/login - Login dengan username/password, return JWT token
 * - POST /auth/refresh - Refresh JWT token (future)
 * - POST /auth/logout - Logout dan invalidate token (future)
 */

const express = require('express');
const router = express.Router();
const authService = require('../services/authService');

/**
 * POST /api/v1/auth/login
 * 
 * TUJUAN: Authenticate user dan return JWT token
 * 
 * REQUEST BODY:
 * {
 *   "username": "asisten001",
 *   "password": "password123"
 * }
 * 
 * RESPONSE (SUCCESS):
 * {
 *   "success": true,
 *   "data": {
 *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *     "user": {
 *       "id_pihak": "22222222-2222-2222-2222-222222222222",
 *       "nama_pihak": "Asisten Kebun",
 *       "role": "ASISTEN",
 *       "username": "asisten001"
 *     },
 *     "expires_in": "7d"
 *   },
 *   "message": "Login berhasil"
 * }
 * 
 * RESPONSE (ERROR - Invalid Credentials):
 * {
 *   "success": false,
 *   "error": "Invalid username or password",
 *   "message": "Username atau password salah"
 * }
 * 
 * RESPONSE (ERROR - Missing Fields):
 * {
 *   "success": false,
 *   "error": "Username and password are required",
 *   "message": "Username dan password harus diisi"
 * }
 */
router.post('/login', async (req, res) => {
  try {
    // Validasi input
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required',
        message: 'Username dan password harus diisi'
      });
    }
    
    // Validasi format username (alphanumeric, 3-50 chars)
    if (!/^[a-zA-Z0-9_-]{3,50}$/.test(username)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid username format',
        message: 'Username harus alphanumeric (3-50 karakter)'
      });
    }
    
    // Validasi password length (minimum 6 chars)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password too short',
        message: 'Password minimal 6 karakter'
      });
    }
    
    // Authenticate user
    const result = await authService.login(username, password);
    
    // Log successful login
    console.log(`✅ [AUTH] Login successful: ${username} (${result.user.role})`);
    
    return res.status(200).json({
      success: true,
      data: result,
      message: 'Login berhasil'
    });
    
  } catch (error) {
    console.error('❌ [AUTH] Login error:', error.message);
    
    // Handle specific error types
    if (error.message === 'Invalid username or password') {
      return res.status(401).json({
        success: false,
        error: error.message,
        message: 'Username atau password salah'
      });
    }
    
    if (error.message === 'User account is inactive') {
      return res.status(403).json({
        success: false,
        error: error.message,
        message: 'Akun tidak aktif. Hubungi administrator'
      });
    }
    
    // Generic error
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Gagal melakukan login'
    });
  }
});

/**
 * POST /api/v1/auth/refresh
 * 
 * TUJUAN: Refresh JWT token (extend expiration)
 * FUTURE IMPLEMENTATION: Implement refresh token mechanism
 */
router.post('/refresh', async (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Not implemented',
    message: 'Fitur refresh token belum diimplementasikan'
  });
});

/**
 * POST /api/v1/auth/logout
 * 
 * TUJUAN: Logout user dan invalidate token
 * FUTURE IMPLEMENTATION: Implement token blacklist
 */
router.post('/logout', async (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Not implemented',
    message: 'Fitur logout belum diimplementasikan'
  });
});

module.exports = router;
