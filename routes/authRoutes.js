/**
 * AUTHENTICATION ROUTES
 * =====================
 * Endpoints for user authentication
 * 
 * Routes:
 * - POST /api/v1/auth/login - User login
 * - POST /api/v1/auth/change-password - Change password (authenticated)
 * - POST /api/v1/auth/logout - Logout (client-side token removal)
 * - GET /api/v1/auth/me - Get current user info
 * 
 * Author: Backend Team
 * Date: November 19, 2025
 */

const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { authenticateJWT } = require('../middleware/authMiddleware');
const verifySupabaseAuth = require('../middleware/supabaseAuthMiddleware');

/**
 * POST /api/v1/auth/login
 * 
 * Request Body:
 * {
 *   "username": "agus.mandor",
 *   "password": "mandor123"
 * }
 * 
 * Response 200:
 * {
 *   "success": true,
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "user": {
 *     "id_pihak": "uuid",
 *     "nama": "Agus (Mandor Sensus)",
 *     "username": "agus.mandor",
 *     "role": "MANDOR",
 *     "tipe": "INTERNAL"
 *   },
 *   "message": "Login berhasil"
 * }
 * 
 * Response 400/401:
 * {
 *   "success": false,
 *   "message": "Username atau password salah"
 * }
 */
router.post('/login', async (req, res) => {
  try {
    // Accept both 'username' and 'email' field for backward compatibility
    const { username, email, password } = req.body;
    const loginIdentifier = username || email;

    console.log('🔐 [Auth] Login attempt:', loginIdentifier);

    const result = await authService.login(loginIdentifier, password);

    if (!result.success) {
      return res.status(401).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ [Auth] Login route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem'
    });
  }
});

/**
 * POST /api/v1/auth/change-password
 * 
 * Headers:
 * Authorization: Bearer <token>
 * 
 * Request Body:
 * {
 *   "old_password": "current_password",
 *   "new_password": "new_password",
 *   "confirm_password": "new_password"
 * }
 * 
 * Response 200:
 * {
 *   "success": true,
 *   "message": "Password berhasil diubah"
 * }
 */
router.post('/change-password', authenticateJWT, async (req, res) => {
  try {
    const { old_password, new_password, confirm_password } = req.body;
    const userId = req.user.id_pihak;

    // Validation
    if (!old_password || !new_password || !confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'Semua field harus diisi'
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        message: 'Password baru dan konfirmasi tidak cocok'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password baru minimal 6 karakter'
      });
    }

    console.log('🔐 [Auth] Change password request:', userId);

    const result = await authService.changePassword(userId, old_password, new_password);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ [Auth] Change password route error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem'
    });
  }
});

/**
 * GET /api/v1/auth/me
 * 
 * Headers:
 * Authorization: Bearer <token>
 * 
 * Response 200:
 * {
 *   "success": true,
 *   "user": {
 *     "id_pihak": "uuid",
 *     "nama": "Agus (Mandor Sensus)",
 *     "username": "agus.mandor",
 *     "role": "MANDOR",
 *     "tipe": "INTERNAL"
 *   }
 * }
 */
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    // User info already in req.user from authenticateJWT middleware
    return res.status(200).json({
      success: true,
      user: {
        id_pihak: req.user.id_pihak,
        nama: req.user.nama_pihak,
        username: req.user.username,
        role: req.user.role,
        tipe: req.user.tipe
      }
    });
  } catch (error) {
    console.error('❌ [Auth] Get me error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem'
    });
  }
});

/**
 * POST /api/v1/auth/logout
 * 
 * Note: JWT is stateless, so logout is handled client-side by removing token.
 * This endpoint is just for logging purposes.
 * 
 * Response 200:
 * {
 *   "success": true,
 *   "message": "Logout berhasil"
 * }
 */
router.post('/logout', authenticateJWT, async (req, res) => {
  try {
    console.log('🔐 [Auth] Logout:', req.user.username || req.user.id_pihak);
    
    return res.status(200).json({
      success: true,
      message: 'Logout berhasil. Hapus token dari client.'
    });
  } catch (error) {
    console.error('❌ [Auth] Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem'
    });
  }
});

// ============================================================
// PROTECTED ROUTES (Supabase Auth required)
// ============================================================

/**
 * GET /api/v1/auth/profile
 * Get current user profile (from Supabase Auth token)
 * 
 * Response:
 * {
 *   success: true,
 *   user: {
 *     id: "uuid",
 *     email: "agus.mandor@keboen.com",
 *     role: "MANDOR",
 *     username: "agus.mandor",
 *     id_pihak: "uuid",
 *     pihak: { ... }
 *   }
 * }
 */
router.get('/profile', verifySupabaseAuth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('❌ [Auth] Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil profil user'
    });
  }
});

module.exports = router;
