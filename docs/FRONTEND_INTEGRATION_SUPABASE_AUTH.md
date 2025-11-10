# 🔐 Frontend Integration Guide: Supabase Auth

**RBAC FASE 3 (Revised): Supabase Auth Integration**

Backend sekarang menggunakan **Supabase Auth** untuk authentication. Panduan ini menjelaskan cara frontend (Dashboard Web) mengintegrasikan login dengan backend.

---

## 📋 Prerequisites

1. **Supabase Project Setup:**
   - Project URL: `https://YOUR_PROJECT.supabase.co`
   - Anon Key: `eyJhbGci...` (dari Supabase Dashboard)

2. **Users Created in Supabase:**
   - Run SQL migration: `sql/migration_supabase_auth_integration.sql`
   - Create users via Supabase Dashboard atau API

3. **Backend Running:**
   - `npm start` di `http://localhost:3000`
   - Middleware `authenticateJWT` sudah support Supabase JWT

---

## 🚀 Quick Start: Frontend Login Flow

### **Step 1: Install Supabase Client**

```bash
# For React/Next.js/Vite
npm install @supabase/supabase-js

# For vanilla HTML/JavaScript
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

---

### **Step 2: Initialize Supabase Client**

```javascript
// config/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://YOUR_PROJECT.supabase.co'
const supabaseAnonKey = 'YOUR_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

### **Step 3: Create Login Function**

```javascript
// services/authService.js
import { supabase } from '../config/supabase'

export async function login(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    })
    
    if (error) {
      console.error('Login failed:', error.message)
      throw new Error(error.message)
    }
    
    // Extract user info
    const { user, session } = data
    const role = user.user_metadata?.role || 'VIEWER'
    const id_pihak = user.user_metadata?.id_pihak
    const nama_pihak = user.user_metadata?.nama_pihak || user.email
    
    console.log('✅ Login success:', {
      email: user.email,
      role: role,
      id_pihak: id_pihak
    })
    
    // Store session (optional, Supabase auto-manages in localStorage)
    localStorage.setItem('user_role', role)
    localStorage.setItem('user_email', user.email)
    
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: role,
        id_pihak: id_pihak,
        nama_pihak: nama_pihak
      },
      session: {
        access_token: session.access_token,
        expires_at: session.expires_at
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  
  if (!error) {
    localStorage.clear()
    console.log('✅ Logout success')
  }
  
  return { success: !error }
}

export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return null
  }
  
  const { user } = session
  const role = user.user_metadata?.role || 'VIEWER'
  
  return {
    id: user.id,
    email: user.email,
    role: role,
    id_pihak: user.user_metadata?.id_pihak,
    nama_pihak: user.user_metadata?.nama_pihak || user.email
  }
}
```

---

### **Step 4: Create Login UI Component**

```javascript
// components/Login.jsx (React example)
import { useState } from 'react'
import { login } from '../services/authService'
import { useNavigate } from 'react-router-dom'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  
  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    const result = await login(email, password)
    
    if (result.success) {
      // Redirect based on role
      if (result.user.role === 'ADMIN' || result.user.role === 'ASISTEN') {
        navigate('/dashboard/kpi-eksekutif')
      } else if (result.user.role === 'MANDOR') {
        navigate('/dashboard/operasional')
      } else {
        navigate('/dashboard')
      }
    } else {
      setError(result.error || 'Login gagal. Periksa email dan password.')
    }
    
    setLoading(false)
  }
  
  return (
    <div className="login-container">
      <h2>Login Dashboard POAC</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="asisten@keboen.com"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
    </div>
  )
}
```

---

### **Step 5: Call Backend API with Supabase Token**

```javascript
// services/dashboardService.js
import { supabase } from '../config/supabase'

const API_BASE_URL = 'http://localhost:3000/api/v1'

async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('Not authenticated')
  }
  
  return session.access_token
}

export async function fetchKPIEksekutif() {
  try {
    const token = await getAuthToken()
    
    const response = await fetch(`${API_BASE_URL}/dashboard/kpi-eksekutif`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token expired. Please login again.')
      }
      if (response.status === 403) {
        throw new Error('Access forbidden. Insufficient permissions.')
      }
      throw new Error('Failed to fetch data')
    }
    
    const data = await response.json()
    return data
    
  } catch (error) {
    console.error('API Error:', error.message)
    throw error
  }
}

export async function fetchDashboardOperasional() {
  const token = await getAuthToken()
  
  const response = await fetch(`${API_BASE_URL}/dashboard/operasional`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  return response.json()
}

export async function fetchDashboardTeknis() {
  const token = await getAuthToken()
  
  const response = await fetch(`${API_BASE_URL}/dashboard/teknis`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  
  return response.json()
}
```

---

### **Step 6: Protected Routes (React Router example)**

```javascript
// components/ProtectedRoute.jsx
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getCurrentUser } from '../services/authService'

export function ProtectedRoute({ children, allowedRoles = [] }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function checkAuth() {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setLoading(false)
    }
    
    checkAuth()
  }, [])
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  if (!user) {
    return <Navigate to="/login" />
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" />
  }
  
  return children
}

// App.jsx - Route configuration
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Login } from './components/Login'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardKPIEksekutif } from './pages/DashboardKPIEksekutif'
import { DashboardOperasional } from './pages/DashboardOperasional'
import { DashboardTeknis } from './pages/DashboardTeknis'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/dashboard/kpi-eksekutif" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ASISTEN']}>
              <DashboardKPIEksekutif />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard/operasional" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ASISTEN', 'MANDOR']}>
              <DashboardOperasional />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard/teknis" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'ASISTEN', 'MANDOR']}>
              <DashboardTeknis />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}
```

---

## 🔑 Test Users

After running SQL migration and creating users in Supabase Dashboard:

| Email | Password (set in Supabase) | Role | Access |
|-------|---------------------------|------|--------|
| `admin@keboen.com` | (your choice) | ADMIN | All endpoints |
| `asisten@keboen.com` | (your choice) | ASISTEN | KPI + Ops + Teknis + SPK |
| `mandor@keboen.com` | (your choice) | MANDOR | Ops + Teknis + SPK + Platform A |
| `pelaksana@keboen.com` | (your choice) | PELAKSANA | Platform A only |

---

## 🧪 Testing

### **Manual Test (Browser Console)**

```javascript
// 1. Login
const result = await login('asisten@keboen.com', 'your-password')
console.log('Login result:', result)

// 2. Check session
const user = await getCurrentUser()
console.log('Current user:', user)

// 3. Fetch dashboard
const kpiData = await fetchKPIEksekutif()
console.log('KPI Data:', kpiData)

// 4. Logout
await logout()
```

---

## 📚 Additional Features

### **Auto Token Refresh**

Supabase automatically refreshes tokens:

```javascript
// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event) // 'SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED'
  
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed automatically')
  }
  
  if (event === 'SIGNED_OUT') {
    window.location.href = '/login'
  }
})
```

### **Password Reset**

```javascript
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://your-app.com/reset-password'
  })
  
  if (error) {
    throw new Error(error.message)
  }
  
  return { success: true, message: 'Check your email for reset link' }
}
```

---

## 🚀 Summary

**Authentication Flow:**
1. Frontend: `supabase.auth.signInWithPassword()` → Get JWT token
2. Frontend: Store session (auto-managed by Supabase)
3. Frontend: Call backend API dengan `Authorization: Bearer <token>`
4. Backend: `authenticateJWT` middleware verify token dengan Supabase
5. Backend: Get role dari `user_metadata` atau `master_pihak`
6. Backend: `authorizeRole` check access permissions
7. Backend: Return data jika authorized

**Benefits:**
- ✅ Production-grade security (Supabase Auth)
- ✅ Auto token refresh
- ✅ Password reset built-in
- ✅ Email verification ready
- ✅ Social login ready (Google, GitHub, etc.)
- ✅ RBAC granular tetap terjaga

---

## 📞 Support

**Questions?**
- Supabase Auth Docs: https://supabase.com/docs/guides/auth
- Backend Docs: `docs/VERIFICATION_RBAC_FASE3_SUPABASE.md`
- Test with: `generate-token-only.js` (legacy JWT for testing)

**Troubleshooting:**
1. **401 Unauthorized:** Token expired atau tidak valid → Re-login
2. **403 Forbidden:** Insufficient role → Check user role di `user_metadata`
3. **CORS Error:** Configure CORS di backend `.env`: `CORS_ORIGIN=http://localhost:5173`
