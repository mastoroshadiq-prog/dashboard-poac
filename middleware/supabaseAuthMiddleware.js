/**
 * Supabase Auth Middleware
 * Verify Supabase JWT token dan extract user info
 */

const { supabase } = require('../config/supabase');

async function verifySupabaseAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token dengan Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('❌ [Auth] Token verification failed:', error?.message);
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid atau expired'
      });
    }

    // Get user details from master_pihak via auth_user_id
    const { data: userData, error: userError } = await supabase
      .from('master_pihak')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (userError) {
      console.error('❌ [Auth] User not found in master_pihak:', userError.message);
      // Fallback: use metadata if master_pihak link not found
      req.user = {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || 'UNKNOWN',
        username: user.user_metadata?.username,
        pihak: null
      };
    } else {
      // Success: combine Supabase Auth + master_pihak data
      req.user = {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role || userData.kode_unik,
        username: user.user_metadata?.username || userData.username,
        id_pihak: userData.id_pihak,
        pihak: userData
      };
    }

    console.log(`✅ [Auth] User authenticated: ${req.user.email} (${req.user.role})`);
    next();

  } catch (error) {
    console.error('❌ [Auth] Middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Autentikasi gagal',
      error: error.message
    });
  }
}

module.exports = verifySupabaseAuth;
