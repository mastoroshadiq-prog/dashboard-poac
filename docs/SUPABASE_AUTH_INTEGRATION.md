# INTEGRASI SUPABASE AUTH - FINAL SOLUTION

## SITUASI SAAT INI

**Frontend:** Sudah pakai **Supabase Auth** (bukan custom backend JWT)  
**Problem:** Login dengan username `agus.mandor` gagal karena Supabase Auth butuh **EMAIL**  
**Error di screenshot:** "Login Gagal: Email atau password salah"

---

## CREDENTIALS YANG HARUS DIBUAT DI SUPABASE AUTH

### 1. Buat User di Supabase Auth Dashboard

**Akses:** https://supabase.com/dashboard → Authentication → Users → Add user

**Mandor Accounts:**
```
Email: agus.mandor@keboen.com
Password: mandor123
User Metadata: { "username": "agus.mandor", "role": "MANDOR" }

Email: eko.mandor@keboen.com  
Password: mandor123
User Metadata: { "username": "eko.mandor", "role": "MANDOR" }
```

**Asisten Account:**
```
Email: asisten.budi@keboen.com
Password: asisten123
User Metadata: { "username": "asisten.budi", "role": "ASISTEN" }
```

**Admin Account:**
```
Email: admin@keboen.com
Password: admin123
User Metadata: { "username": "admin", "role": "ADMIN" }
```

---

## 2. LINK SUPABASE AUTH ↔ MASTER_PIHAK

Tambahkan kolom `auth_user_id` di `master_pihak`:

```sql
-- Add Supabase Auth ID column
ALTER TABLE master_pihak 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

-- Link existing users (setelah create users di Supabase Auth Dashboard)
UPDATE master_pihak 
SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'agus.mandor@keboen.com')
WHERE username = 'agus.mandor';

UPDATE master_pihak 
SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'eko.mandor@keboen.com')
WHERE username = 'eko.mandor';

UPDATE master_pihak 
SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'asisten.budi@keboen.com')
WHERE username = 'asisten.budi';

UPDATE master_pihak 
SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'admin@keboen.com')
WHERE username = 'admin';
```

---

## 3. FLUTTER LOGIN CODE (SUDAH BENAR)

```dart
import 'package:supabase_flutter/supabase_flutter.dart';

// Login
final response = await Supabase.instance.client.auth.signInWithPassword(
  email: 'agus.mandor@keboen.com',  // ✅ PAKAI EMAIL
  password: 'mandor123',
);

if (response.user != null) {
  // Get user metadata
  final role = response.user!.userMetadata?['role'];
  final username = response.user!.userMetadata?['username'];
  
  // Navigate based on role
  if (role == 'MANDOR') {
    Navigator.pushReplacementNamed(context, '/mandor/dashboard');
  }
}
```

---

## 4. FORM LOGIN - UBAH LABEL

**File:** `lib/pages/login_page.dart`

```dart
TextFormField(
  controller: _emailController,
  decoration: InputDecoration(
    labelText: 'Email',  // Tetap "Email" karena Supabase butuh email
    hintText: 'agus.mandor@keboen.com',  // ✅ Hint pakai format email
  ),
  keyboardType: TextInputType.emailAddress,  // ✅ Email keyboard
  validator: (value) {
    if (value == null || value.isEmpty) {
      return 'Email harus diisi';
    }
    if (!value.contains('@')) {
      return 'Format email tidak valid';
    }
    return null;
  },
),
```

---

## 5. BACKEND MIDDLEWARE - VERIFY SUPABASE TOKEN

**File:** `middleware/supabaseAuthMiddleware.js`

```javascript
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

    // Verify token dengan Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid'
      });
    }

    // Get user details from master_pihak
    const { data: userData } = await supabase
      .from('master_pihak')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    // Attach to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || userData?.kode_unik,
      username: user.user_metadata?.username || userData?.username,
      pihak: userData
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Autentikasi gagal'
    });
  }
}

module.exports = verifySupabaseAuth;
```

---

## 6. UPDATE index.js - GANTI MIDDLEWARE

```javascript
// Ganti authMiddleware dengan supabaseAuthMiddleware
const supabaseAuthMiddleware = require('./middleware/supabaseAuthMiddleware');

// Protect routes
app.use('/api/v1/dashboard', supabaseAuthMiddleware, dashboardRoutes);
app.use('/api/v1/spk', supabaseAuthMiddleware, spkRoutes);
// ... dst
```

---

## 7. CHECKLIST IMPLEMENTASI

- [ ] **STEP 1:** Buat 4 users di Supabase Auth Dashboard (agus.mandor@keboen.com, eko.mandor@keboen.com, asisten.budi@keboen.com, admin@keboen.com)
- [ ] **STEP 2:** Set user metadata untuk setiap user: `{ "username": "agus.mandor", "role": "MANDOR" }`
- [ ] **STEP 3:** Run SQL script untuk add `auth_user_id` column dan link users
- [ ] **STEP 4:** Update Flutter login form hint text ke format email
- [ ] **STEP 5:** Create `middleware/supabaseAuthMiddleware.js`
- [ ] **STEP 6:** Update `index.js` - ganti middleware
- [ ] **STEP 7:** Test login dengan `agus.mandor@keboen.com` / `mandor123`

---

## 8. TEST CREDENTIALS

```
Email: agus.mandor@keboen.com
Password: mandor123
Expected: Login berhasil → Navigate ke /mandor/dashboard

Email: eko.mandor@keboen.com
Password: mandor123
Expected: Login berhasil → Navigate ke /mandor/dashboard

Email: asisten.budi@keboen.com
Password: asisten123
Expected: Login berhasil → Navigate ke /asisten/dashboard

Email: admin@keboen.com
Password: admin123
Expected: Login berhasil → Navigate ke /admin/dashboard
```

---

## SUMMARY

**SEBELUM:** Backend custom JWT + username login (SALAH - tidak dipakai frontend!)  
**SESUDAH:** Supabase Auth + email login (BENAR - sesuai frontend!)

**Key Changes:**
1. ✅ Credentials pakai **EMAIL** format: `agus.mandor@keboen.com`
2. ✅ Password tetap sama: `mandor123`
3. ✅ Frontend **tidak perlu ubah** - sudah benar pakai Supabase Auth
4. ✅ Backend **ubah middleware** - verify Supabase token instead of custom JWT
5. ✅ Link Supabase Auth ↔ master_pihak via `auth_user_id`

**Priority:** URGENT - blocking login functionality!
