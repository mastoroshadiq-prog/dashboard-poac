/**
 * AUTH MIDDLEWARE - JWT Authentication
 * 
 * KATEGORI: Tuntunan Keamanan (WAJIB untuk Platform A & B)
 * 
 * Filosofi MPP - Prinsip TEPAT:
 * - JANGAN PERCAYA input dari client (HP/Browser)
 * - Ambil user ID (WHO) dari JWT token, bukan dari request body
 * - Timestamp dari server, bukan dari client
 * 
 * TUJUAN:
 * - Verifikasi JWT token dari header Authorization
 * - Extract user data (id_petugas/id_pelaksana) dari token
 * - Inject user data ke req.user untuk dipakai di endpoint
 * 
 * USAGE:
 * router.get('/protected-endpoint', authenticateJWT, async (req, res) => {
 *   const userId = req.user.id_pihak; // Dari JWT token
 *   // ...
 * });
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware: Authenticate JWT Token
 * 
 * FLOW:
 * 1. Extract token dari header "Authorization: Bearer <token>"
 * 2. Verify token dengan secret key
 * 3. Decode token payload dan inject ke req.user
 * 4. Call next() jika valid, return 401/403 jika invalid
 * 
 * EXPECTED TOKEN PAYLOAD:
 * {
 *   id_pihak: "uuid-mandor-agus",  // WHO (WAJIB)
 *   nama_pihak: "Agus Mandor",      // Optional
 *   role: "MANDOR",                 // Optional
 *   iat: 1234567890,                // Issued At (auto by JWT)
 *   exp: 1234567890                 // Expiration (auto by JWT)
 * }
 * 
 * ENV REQUIREMENTS:
 * - JWT_SECRET: Secret key untuk sign/verify token (wajib di .env)
 * - JWT_EXPIRES_IN: Token expiration time (default: '7d')
 */
function authenticateJWT(req, res, next) {
  // 1. Extract token dari Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Token tidak ditemukan. Silakan login terlebih dahulu.'
    });
  }
  
  // Format header: "Bearer <token>"
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token format',
      message: 'Format token harus: "Bearer <token>"'
    });
  }
  
  const token = parts[1];
  
  // 2. Verify token dengan secret key
  const secret = process.env.JWT_SECRET || 'default-secret-key-CHANGE-THIS';
  
  if (secret === 'default-secret-key-CHANGE-THIS') {
    console.warn('⚠️  WARNING: Using default JWT secret! Set JWT_SECRET in .env for production!');
  }
  
  try {
    // Prinsip TEPAT: Verify token signature & expiration
    const decoded = jwt.verify(token, secret);
    
    // 3. Validasi payload wajib (id_pihak)
    if (!decoded.id_pihak) {
      return res.status(403).json({
        success: false,
        error: 'Invalid token payload',
        message: 'Token tidak valid: id_pihak tidak ditemukan'
      });
    }
    
    // 4. Inject user data ke req.user
    req.user = {
      id_pihak: decoded.id_pihak,
      nama_pihak: decoded.nama_pihak || null,
      role: decoded.role || null,
      // Simpan juga raw decoded untuk debugging
      _raw: decoded
    };
    
    // Log untuk audit trail (optional, disable di production untuk performa)
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔐 [Auth] User authenticated:', {
        id_pihak: req.user.id_pihak,
        role: req.user.role,
        endpoint: req.path
      });
    }
    
    // 5. Lanjutkan ke next middleware/endpoint
    next();
    
  } catch (err) {
    // JWT verification failed
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
        message: 'Token sudah kadaluarsa. Silakan login ulang.'
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        error: 'Invalid token',
        message: 'Token tidak valid. Silakan login ulang.'
      });
    }
    
    // Unknown error
    console.error('❌ [Auth] JWT verification error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: 'Gagal memverifikasi token'
    });
  }
}

/**
 * Middleware: Optional JWT Authentication
 * 
 * Sama seperti authenticateJWT, tapi TIDAK memblokir request jika token tidak ada.
 * Berguna untuk endpoint yang bisa diakses public ATAU authenticated user.
 * 
 * Jika token valid, req.user akan di-set.
 * Jika token invalid/tidak ada, req.user = null dan request tetap dilanjutkan.
 */
function optionalAuthenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    req.user = null;
    return next();
  }
  
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    req.user = null;
    return next();
  }
  
  const token = parts[1];
  const secret = process.env.JWT_SECRET || 'default-secret-key-CHANGE-THIS';
  
  try {
    const decoded = jwt.verify(token, secret);
    
    if (decoded.id_pihak) {
      req.user = {
        id_pihak: decoded.id_pihak,
        nama_pihak: decoded.nama_pihak || null,
        role: decoded.role || null,
        _raw: decoded
      };
    } else {
      req.user = null;
    }
    
  } catch (err) {
    req.user = null;
  }
  
  next();
}

/**
 * Helper: Generate JWT Token (untuk testing atau endpoint login)
 * 
 * USAGE:
 * const token = generateToken({ id_pihak: 'uuid-123', role: 'MANDOR' });
 * 
 * INPUT:
 * {
 *   id_pihak: string (WAJIB),
 *   nama_pihak: string (optional),
 *   role: string (optional)
 * }
 * 
 * OUTPUT: JWT token string
 */
function generateToken(payload) {
  const secret = process.env.JWT_SECRET || 'default-secret-key-CHANGE-THIS';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'; // Default 7 hari
  
  if (!payload.id_pihak) {
    throw new Error('id_pihak wajib ada di payload token');
  }
  
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Middleware: Authorize by Role (RBAC - Role-Based Access Control)
 * 
 * TUJUAN:
 * - Memastikan hanya role tertentu yang bisa akses endpoint
 * - Implementasi granular permission control
 * - Security logging untuk audit trail
 * 
 * USAGE:
 * router.post('/admin-only', 
 *   authenticateJWT,                      // Step 1: Verify JWT token
 *   authorizeRole(['ADMIN']),              // Step 2: Check user role
 *   async (req, res) => { ... }
 * );
 * 
 * router.post('/spk/', 
 *   authenticateJWT, 
 *   authorizeRole(['ASISTEN', 'ADMIN']),   // Only ASISTEN or ADMIN
 *   handler
 * );
 * 
 * ROLE HIERARCHY (MPP - Prinsip TEPAT):
 * - ADMIN: Super user, full access
 * - ASISTEN: Estate manager, create/update SPK
 * - MANDOR: Field supervisor, assign tugas
 * - PELAKSANA: Field worker, execute tugas
 * - VIEWER: Read-only access
 * 
 * @param {string[]} allowedRoles - Array of allowed roles (e.g., ['ADMIN', 'ASISTEN'])
 * @returns {Function} Express middleware function
 */
function authorizeRole(allowedRoles) {
  // Validasi parameter
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    throw new Error('authorizeRole: allowedRoles must be a non-empty array');
  }
  
  // Return middleware function
  return (req, res, next) => {
    // 1. Check if user is authenticated (req.user should be set by authenticateJWT)
    if (!req.user) {
      console.warn('⚠️  [RBAC] Authorization failed: User not authenticated');
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required. Please login first.'
      });
    }
    
    // 2. Check if role exists in token payload
    if (!req.user.role) {
      console.error('❌ [RBAC] Authorization failed: Role not found in token', {
        user_id: req.user.id_pihak,
        endpoint: req.path,
        method: req.method
      });
      
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'User role not found in token. Contact administrator.'
      });
    }
    
    // 3. Check if user's role is in the allowed list
    const userRole = req.user.role.toUpperCase(); // Normalize to uppercase
    const normalizedAllowedRoles = allowedRoles.map(r => r.toUpperCase());
    
    if (!normalizedAllowedRoles.includes(userRole)) {
      // 4. SECURITY LOGGING: Log failed authorization attempt (audit trail)
      console.warn('🚫 [RBAC] Access denied:', {
        user_id: req.user.id_pihak,
        user_name: req.user.nama_pihak || 'Unknown',
        user_role: userRole,
        required_roles: allowedRoles,
        endpoint: req.path,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });
      
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: `Access denied. This endpoint requires one of these roles: ${allowedRoles.join(', ')}. Your role: ${userRole}`
      });
    }
    
    // 5. Authorization successful - log for audit trail (optional, can be disabled in production)
    if (process.env.NODE_ENV !== 'production') {
      console.log('✅ [RBAC] Access granted:', {
        user_id: req.user.id_pihak,
        role: userRole,
        endpoint: req.path,
        method: req.method
      });
    }
    
    // 6. Proceed to next middleware/handler
    next();
  };
}

/**
 * Helper: Decode JWT Token (tanpa verifikasi)
 * 
 * Berguna untuk debugging/testing.
 * WARNING: Jangan gunakan untuk authentication, karena tidak verify signature!
 */
function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (err) {
    return null;
  }
}

module.exports = {
  authenticateJWT,
  optionalAuthenticateJWT,
  authorizeRole,  // 🆕 NEW: RBAC middleware
  generateToken,
  decodeToken
};
