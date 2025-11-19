# FIX: TypeError null is not a subtype of String

## ❌ ERROR YANG TERJADI

```
TypeError: null: type 'Null' is not a subtype of type 'String'
```

**Penyebab:** Flutter code expect `String` tapi API/Supabase return `null`

---

## ✅ SOLUSI

### 1. Fix Login Response Handling

**File:** `lib/pages/login_page.dart`

**Problem Code:**
```dart
// ❌ SALAH - Crash kalau null
final role = profileResponse.data['user']['role'];
final username = profileResponse.data['user']['username'];
```

**Fixed Code:**
```dart
// ✅ BENAR - Handle null dengan operator ??
final userData = profileResponse.data['user'];
final role = userData['role'] as String? ?? 'UNKNOWN';
final username = userData['username'] as String? ?? '';
final email = userData['email'] as String? ?? '';
final idPihak = userData['id_pihak'] as String?;

// Validate role
if (role == 'UNKNOWN' || role.isEmpty) {
  throw Exception('Role user tidak valid. Hubungi administrator.');
}

print('User: $email, Role: $role, Username: $username');

// Navigate based on role
switch (role) {
  case 'MANDOR':
    Navigator.pushReplacementNamed(context, '/mandor/dashboard');
    break;
  case 'ASISTEN':
    Navigator.pushReplacementNamed(context, '/asisten/dashboard');
    break;
  case 'ADMIN':
    Navigator.pushReplacementNamed(context, '/admin/dashboard');
    break;
  default:
    throw Exception('Role "$role" tidak dikenal');
}
```

---

### 2. Fix Login Method (Full Code)

```dart
// File: lib/pages/login_page.dart

Future<void> _handleLogin() async {
  // Validate form
  if (!_formKey.currentState!.validate()) {
    return;
  }

  setState(() {
    _isLoading = true;
    _errorMessage = null;
  });

  try {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    // 1. Login dengan Supabase Auth
    final authResponse = await Supabase.instance.client.auth.signInWithPassword(
      email: email,
      password: password,
    );

    if (authResponse.user == null) {
      throw Exception('Login gagal. User tidak ditemukan.');
    }

    print('✅ Login success: ${authResponse.user!.email}');

    // 2. Get user profile dari backend
    final dio = Dio(BaseOptions(
      baseUrl: 'http://localhost:3000/api/v1',
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ));

    final token = authResponse.session?.accessToken;
    
    if (token == null) {
      throw Exception('Token tidak ditemukan');
    }

    print('Token: ${token.substring(0, 20)}...');

    final profileResponse = await dio.get(
      '/auth/profile',
      options: Options(
        headers: {'Authorization': 'Bearer $token'},
      ),
    );

    print('Profile response: ${profileResponse.data}');

    // 3. Extract user data dengan null safety
    if (profileResponse.data['success'] != true) {
      throw Exception(
        profileResponse.data['message'] ?? 'Gagal mendapatkan profil user'
      );
    }

    final userData = profileResponse.data['user'];
    
    if (userData == null) {
      throw Exception('Data user tidak ditemukan');
    }

    final role = userData['role'] as String? ?? '';
    final username = userData['username'] as String? ?? '';
    final idPihak = userData['id_pihak'] as String?;

    print('User data: role=$role, username=$username, id_pihak=$idPihak');

    // Validate role
    if (role.isEmpty) {
      throw Exception(
        'Role user tidak ditemukan. Pastikan user metadata sudah diset di Supabase Auth.\n\n'
        'Jalankan SQL: sql/fix_user_metadata_role.sql'
      );
    }

    // 4. Navigate based on role
    if (!mounted) return;

    switch (role.toUpperCase()) {
      case 'MANDOR':
        Navigator.pushReplacementNamed(context, '/mandor/dashboard');
        break;
        
      case 'ASISTEN':
        Navigator.pushReplacementNamed(context, '/asisten/dashboard');
        break;
        
      case 'ADMIN':
        Navigator.pushReplacementNamed(context, '/admin/dashboard');
        break;
        
      default:
        throw Exception(
          'Role "$role" tidak dikenal.\n\n'
          'Role yang valid: MANDOR, ASISTEN, ADMIN'
        );
    }

  } on DioException catch (e) {
    print('❌ Dio error: ${e.message}');
    print('Response: ${e.response?.data}');
    
    String errorMsg = 'Gagal terhubung ke server';
    
    if (e.type == DioExceptionType.connectionTimeout) {
      errorMsg = 'Koneksi timeout. Pastikan backend running di localhost:3000';
    } else if (e.type == DioExceptionType.receiveTimeout) {
      errorMsg = 'Server tidak merespon';
    } else if (e.response != null) {
      errorMsg = e.response!.data['message'] ?? e.message ?? 'Error tidak diketahui';
    }
    
    setState(() {
      _errorMessage = errorMsg;
      _isLoading = false;
    });
    
  } on AuthException catch (e) {
    print('❌ Auth error: ${e.message}');
    setState(() {
      _errorMessage = 'Login gagal: ${e.message}';
      _isLoading = false;
    });
    
  } catch (e) {
    print('❌ Error: $e');
    setState(() {
      _errorMessage = e.toString();
      _isLoading = false;
    });
  }
}
```

---

### 3. Add Debug Info

**Tambahkan di build method:**

```dart
@override
Widget build(BuildContext context) {
  return Scaffold(
    appBar: AppBar(
      title: const Text('Login'),
    ),
    body: Padding(
      padding: const EdgeInsets.all(24),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // ... Email & Password fields ...

            if (_errorMessage != null)
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red[100],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error, color: Colors.red),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _errorMessage!,
                        style: const TextStyle(color: Colors.red),
                      ),
                    ),
                  ],
                ),
              ),

            ElevatedButton(
              onPressed: _isLoading ? null : _handleLogin,
              child: _isLoading
                  ? const CircularProgressIndicator()
                  : const Text('Login'),
            ),

            // Debug info (hapus di production)
            if (kDebugMode) ...[
              const SizedBox(height: 24),
              const Divider(),
              const Text('Debug Info:', style: TextStyle(fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text('Backend: http://localhost:3000/api/v1'),
              Text('Current user: ${Supabase.instance.client.auth.currentUser?.email ?? "None"}'),
            ],
          ],
        ),
      ),
    ),
  );
}
```

---

## 🧪 DEBUG STEPS

### Step 1: Check Backend Response

Buka browser console atau terminal backend, cari log:

```
✅ [Auth] User authenticated: agus.mandor@keboen.com (MANDOR)
```

Kalau ada → Backend OK.

### Step 2: Check Flutter Console

Setelah klik login, lihat Flutter console output:

```dart
✅ Login success: agus.mandor@keboen.com
Token: eyJhbGciOiJIUzI1NiIs...
Profile response: {...}
User data: role=MANDOR, username=agus.mandor, id_pihak=a0eebc99...
```

Kalau ada field yang `null`, itu masalahnya.

### Step 3: Verify User Metadata

Jalankan SQL di Supabase:

```sql
SELECT 
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'username' as username
FROM auth.users
WHERE email = 'agus.mandor@keboen.com';
```

Expected result:
```
email                      | role   | username
---------------------------|--------|------------
agus.mandor@keboen.com    | MANDOR | agus.mandor
```

Kalau `role` atau `username` NULL → Run `sql/fix_user_metadata_role.sql`

---

## 🔍 COMMON ISSUES

### Issue 1: role = null
**Cause:** User metadata tidak diset
**Fix:** Run `sql/fix_user_metadata_role.sql`

### Issue 2: id_pihak = null
**Cause:** User belum di-link ke master_pihak
**Fix:** Run `sql/link_supabase_auth.sql`

### Issue 3: Backend tidak running
**Cause:** Server belum start
**Fix:** Run `node index.js` di terminal terpisah

### Issue 4: CORS error
**Cause:** Flutter web tidak bisa akses localhost:3000
**Fix:** Backend sudah enable CORS, tapi pastikan URL benar: `http://localhost:3000` (bukan https)

---

## ✅ FINAL CHECKLIST

- [ ] Backend running: `node index.js` → Server running di port 3000
- [ ] User metadata complete: Run `sql/fix_user_metadata_role.sql`
- [ ] User linked: Run `sql/link_supabase_auth.sql`
- [ ] Flutter code updated: Null safety di `_handleLogin()`
- [ ] Test login: `agus.mandor@keboen.com` / `mandor123`
- [ ] Expected: Navigate ke `/mandor/dashboard`

---

## 📞 JIKA MASIH ERROR

**Kirim screenshot:**
1. Flutter console output (semua log dari `_handleLogin`)
2. Backend terminal output (log request `/auth/profile`)
3. Error message lengkap

**Test backend manual:**
```powershell
# PowerShell - Test backend tanpa Flutter
$token = "PASTE_TOKEN_DARI_SUPABASE"
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/profile" -Headers @{Authorization="Bearer $token"}
```

Expected response:
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "agus.mandor@keboen.com",
    "role": "MANDOR",
    "username": "agus.mandor",
    "id_pihak": "a0eebc99-...",
    "pihak": { ... }
  }
}
```
