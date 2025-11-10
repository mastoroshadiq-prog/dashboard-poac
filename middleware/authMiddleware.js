/**
 * AUTH MIDDLEWARE - Supabase JWT Authentication
 * 
 * KATEGORI: Tuntunan Keamanan (WAJIB untuk Platform A & B)
 * 
 * RBAC FASE 3 (Revised): Using Supabase Auth
 * - Verify JWT token dari Supabase Auth
 * - Extract user role dari user_metadata atau master_pihak
 * - Support production-grade authentication
 * 
 * Filosofi MPP - Prinsip TEPAT:
 * - JANGAN PERCAYA input dari client (HP/Browser)
 * - Ambil user ID (WHO) dari Supabase JWT token
 * - Timestamp dari server, bukan dari client
 * 
 * TUJUAN:
 * - Verifikasi Supabase JWT token dari header Authorization
 * - Extract user data (id, role, email) dari Supabase Auth
 * - Inject user data ke req.user untuk dipakai di endpoint
 * 
 * USAGE:
 * router.get('/protected-endpoint', authenticateJWT, async (req, res) => {
 *   const userId = req.user.id_pihak; // Dari Supabase JWT
 *   const role = req.user.role; // Dari user_metadata atau master_pihak
 *   // ...
 * });
 */

const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');

/**
 * Middleware: Authenticate Supabase JWT Token
 * 
 * FLOW:
 * 1. Extract token dari header "Authorization: Bearer <token>"
 * 2. Verify token dengan Supabase Auth
 * 3. Get user role dari user_metadata atau master_pihak table
 * 4. Inject user data ke req.user
 * 5. Call next() jika valid, return 401 jika invalid
 * 
 * SUPABASE JWT PAYLOAD:
 * {
 *   sub: "auth-user-uuid",          // Supabase Auth User ID
 *   email: "user@example.com",
 *   role: "authenticated",          // Supabase role (not our business role)
 *   user_metadata: {
 *     role: "ASISTEN",              // Our custom role
 *     id_pihak: "uuid",             // Link to master_pihak
 *     nama_pihak: "Name"
 *   }
 * }
 */
async function authenticateJWT(req, res, next) {
  try {
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
    
    // 2. Verify token dengan Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.warn('⚠️  [AUTH] Supabase auth failed:', error?.message || 'User not found');
      
      // Fallback: Try legacy JWT verification (for backward compatibility)
      try {
        const secret = process.env.JWT_SECRET || 'default-secret-key-CHANGE-THIS';
        const decoded = jwt.verify(token, secret);
        
        if (!decoded.id_pihak) {
          return res.status(403).json({
            success: false,
            error: 'Invalid token payload',
            message: 'Token tidak valid: id_pihak tidak ditemukan'
          });
        }
        
        // Use legacy JWT
        req.user = {
          id_pihak: decoded.id_pihak,
          nama_pihak: decoded.nama_pihak || null,
          role: (decoded.role || 'VIEWER').toUpperCase(),
          email: decoded.email || null,
          auth_type: 'legacy_jwt'
        };
        
        console.log('✅ [AUTH] Legacy JWT authenticated:', req.user.role);
        return next();
        
      } catch (legacyError) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired token',
          message: 'Token tidak valid atau kadaluarsa. Silakan login ulang.'
        });
      }
    }
    
    // 3. Get user role from user_metadata or master_pihak table
    let role = user.user_metadata?.role;
    let id_pihak = user.user_metadata?.id_pihak;
    let nama_pihak = user.user_metadata?.nama_pihak;
    
    // If not in metadata, query master_pihak table
    if (!role || !id_pihak) {
      const { data: pihak, error: pihakError } = await supabase
        .from('master_pihak')
        .select('id_pihak, role, nama_pihak, is_active')
        .eq('email', user.email)
        .single();
      
      if (pihakError) {
        console.warn('⚠️  [AUTH] master_pihak query failed:', pihakError.message);
      }
      
      if (pihak) {
        role = pihak.role;
        id_pihak = pihak.id_pihak;
        nama_pihak = pihak.nama_pihak;
        
        // Check if account is active
        if (pihak.is_active === false) {
          return res.status(403).json({
            success: false,
            error: 'Account inactive',
            message: 'Akun tidak aktif. Hubungi administrator.'
          });
        }
      }
    }
    
    // Validate role
    const validRoles = ['ADMIN', 'ASISTEN', 'MANDOR', 'PELAKSANA', 'VIEWER'];
    const userRole = (role || 'VIEWER').toUpperCase();
    
    if (!validRoles.includes(userRole)) {
      console.warn(`⚠️  [AUTH] Invalid role: ${userRole}`);
      return res.status(403).json({
        success: false,
        error: 'Invalid user role',
        message: 'Role pengguna tidak valid'
      });
    }
    
    // 4. Inject user data ke req.user
    req.user = {
      auth_user_id: user.id,
      id_pihak: id_pihak || user.id, // Fallback to auth user ID
      nama_pihak: nama_pihak || user.email,
      role: userRole,
      email: user.email,
      auth_type: 'supabase'
    };
    
    // Log untuk audit trail
    console.log(`✅ [AUTH] User authenticated: ${req.user.email} (${req.user.role})`);
    
    // 5. Lanjutkan ke next middleware/endpoint
    next();
    
  } catch (error) {
    console.error('❌ [AUTH] Authentication error:', error.message);
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
