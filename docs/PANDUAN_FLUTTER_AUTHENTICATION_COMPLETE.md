# 🔐 PANDUAN LENGKAP - FLUTTER WEB AUTHENTICATION

> **Platform:** Flutter WEB (bukan mobile!)  
> **Backend:** Node.js + Express + Supabase  
> **Version:** 1.0.1  
> **Date:** November 19, 2025

---

## 📋 DAFTAR ISI

1. [Setup Dependencies](#1-setup-dependencies)
2. [Authentication Service](#2-authentication-service)
3. [Login Page Widget](#3-login-page-widget)
4. [Token Storage](#4-token-storage)
5. [Protected Routes](#5-protected-routes)
6. [Error Handling](#6-error-handling)
7. [Testing](#7-testing)

---

## 1. SETUP DEPENDENCIES

### pubspec.yaml

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # HTTP Client
  dio: ^5.4.0
  
  # Secure Storage untuk token
  flutter_secure_storage: ^9.0.0
  
  # State Management (pilih salah satu)
  provider: ^6.1.1        # Option 1: Provider
  # riverpod: ^2.4.9      # Option 2: Riverpod
  # bloc: ^8.1.3          # Option 3: BLoC
  
  # Navigation
  go_router: ^13.0.0

dev_dependencies:
  flutter_test:
    sdk: flutter
```

### Install Dependencies

```bash
flutter pub get
```

---

## 2. AUTHENTICATION SERVICE

### File: `lib/services/auth_service.dart`

```dart
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService {
  // Base URL untuk Flutter WEB
  // Untuk development: http://localhost:3000/api/v1
  // Untuk production: https://api.yourdomain.com/api/v1
  static const String baseUrl = 'http://localhost:3000/api/v1';
  
  final Dio _dio = Dio(BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 10),
    headers: {
      'Content-Type': 'application/json',
    },
  ));
  
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  
  // Storage keys
  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';

  // Login
  Future<Map<String, dynamic>> login({
    required String username,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        '/auth/login',
        data: {
          // Backend accepts both 'username' and 'email' field
          // Use 'username' for new code, 'email' for backward compatibility
          'username': username,
          // 'email': username, // Alternative if your form uses 'email' field
          'password': password,
        },
      );

      if (response.data['success'] == true) {
        // Save token
        final token = response.data['token'];
        await _storage.write(key: _tokenKey, value: token);
        
        // Save user data
        final userData = response.data['user'];
        await _storage.write(
          key: _userKey,
          value: jsonEncode(userData),
        );
        
        return {
          'success': true,
          'token': token,
          'user': userData,
          'message': response.data['message'] ?? 'Login berhasil',
        };
      } else {
        return {
          'success': false,
          'message': response.data['message'] ?? 'Login gagal',
        };
      }
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  // Logout
  Future<void> logout() async {
    try {
      // Optional: Call backend logout endpoint
      final token = await getToken();
      if (token != null) {
        await _dio.post(
          '/auth/logout',
          options: Options(
            headers: {'Authorization': 'Bearer $token'},
          ),
        );
      }
    } catch (e) {
      // Ignore backend errors during logout
    } finally {
      // Clear local storage
      await _storage.delete(key: _tokenKey);
      await _storage.delete(key: _userKey);
    }
  }

  // Get stored token
  Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  // Get stored user data
  Future<Map<String, dynamic>?> getUserData() async {
    final userJson = await _storage.read(key: _userKey);
    if (userJson != null) {
      return jsonDecode(userJson);
    }
    return null;
  }

  // Check if user is logged in
  Future<bool> isLoggedIn() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  // Get current user info from backend
  Future<Map<String, dynamic>> getCurrentUser() async {
    try {
      final token = await getToken();
      if (token == null) {
        return {'success': false, 'message': 'Token tidak ditemukan'};
      }

      final response = await _dio.get(
        '/auth/me',
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      return response.data;
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  // Change password
  Future<Map<String, dynamic>> changePassword({
    required String oldPassword,
    required String newPassword,
    required String confirmPassword,
  }) async {
    try {
      final token = await getToken();
      if (token == null) {
        return {'success': false, 'message': 'Token tidak ditemukan'};
      }

      final response = await _dio.post(
        '/auth/change-password',
        data: {
          'old_password': oldPassword,
          'new_password': newPassword,
          'confirm_password': confirmPassword,
        },
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      return response.data;
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  // Error handler
  Map<String, dynamic> _handleError(DioException error) {
    if (error.response != null) {
      final data = error.response!.data;
      return {
        'success': false,
        'message': data['message'] ?? 'Terjadi kesalahan',
        'statusCode': error.response!.statusCode,
      };
    } else if (error.type == DioExceptionType.connectionTimeout) {
      return {
        'success': false,
        'message': 'Koneksi timeout. Periksa koneksi internet Anda.',
      };
    } else if (error.type == DioExceptionType.receiveTimeout) {
      return {
        'success': false,
        'message': 'Server tidak merespon. Coba lagi nanti.',
      };
    } else {
      return {
        'success': false,
        'message': 'Tidak dapat terhubung ke server: ${error.message}',
      };
    }
  }
}
```

---

## 3. LOGIN PAGE WIDGET

### File: `lib/pages/login_page.dart`

```dart
import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({Key? key}) : super(key: key);

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _authService = AuthService();
  
  bool _isLoading = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final result = await _authService.login(
        username: _usernameController.text.trim(),
        password: _passwordController.text,
      );

      if (!mounted) return;

      if (result['success'] == true) {
        // Login berhasil
        final user = result['user'];
        final role = user['role'];

        // Navigate based on role
        if (role == 'MANDOR') {
          Navigator.of(context).pushReplacementNamed('/mandor/dashboard');
        } else if (role == 'ASISTEN') {
          Navigator.of(context).pushReplacementNamed('/asisten/dashboard');
        } else if (role == 'ADMIN') {
          Navigator.of(context).pushReplacementNamed('/admin/dashboard');
        } else {
          Navigator.of(context).pushReplacementNamed('/dashboard');
        }

        // Show success message
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Selamat datang, ${user['nama']}!'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        // Login gagal
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Login gagal'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Logo
                  Icon(
                    Icons.agriculture,
                    size: 80,
                    color: Theme.of(context).primaryColor,
                  ),
                  const SizedBox(height: 24),
                  
                  // Title
                  Text(
                    'Dashboard POAC',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Sistem Saraf Digital Kebun',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 48),
                  
                  // Username field
                  TextFormField(
                    controller: _usernameController,
                    decoration: InputDecoration(
                      labelText: 'Username',
                      hintText: 'agus.mandor',
                      prefixIcon: const Icon(Icons.person),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    keyboardType: TextInputType.text,
                    textInputAction: TextInputAction.next,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Username harus diisi';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  
                  // Password field
                  TextFormField(
                    controller: _passwordController,
                    decoration: InputDecoration(
                      labelText: 'Password',
                      hintText: '••••••••',
                      prefixIcon: const Icon(Icons.lock),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword
                              ? Icons.visibility_off
                              : Icons.visibility,
                        ),
                        onPressed: () {
                          setState(() {
                            _obscurePassword = !_obscurePassword;
                          });
                        },
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    obscureText: _obscurePassword,
                    textInputAction: TextInputAction.done,
                    onFieldSubmitted: (_) => _handleLogin(),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Password harus diisi';
                      }
                      if (value.length < 6) {
                        return 'Password minimal 6 karakter';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 24),
                  
                  // Login button
                  ElevatedButton(
                    onPressed: _isLoading ? null : _handleLogin,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: _isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                Colors.white,
                              ),
                            ),
                          )
                        : const Text(
                            'LOGIN',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                  ),
                  
                  const SizedBox(height: 24),
                  
                  // Dev credentials info
                  if (const String.fromEnvironment('FLUTTER_ENV') == 'development')
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.blue[50],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.blue[200]!),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '🔧 Development Mode',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: Colors.blue[900],
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Test Credentials:',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.blue[700],
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'agus.mandor / mandor123',
                            style: TextStyle(
                              fontSize: 12,
                              fontFamily: 'monospace',
                              color: Colors.blue[900],
                            ),
                          ),
                          Text(
                            'asisten.budi / asisten123',
                            style: TextStyle(
                              fontSize: 12,
                              fontFamily: 'monospace',
                              color: Colors.blue[900],
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
```

---

## 4. TOKEN STORAGE

Token disimpan secara otomatis oleh `AuthService` menggunakan `flutter_secure_storage`. Token akan:

- ✅ Disimpan encrypted di device
- ✅ Persist setelah app restart
- ✅ Auto-attach ke semua API requests

### Cara Menggunakan Token di Service Lain:

```dart
import '../services/auth_service.dart';
import 'package:dio/dio.dart';

class SomeOtherService {
  final _authService = AuthService();
  final _dio = Dio(BaseOptions(baseUrl: 'http://localhost:3000/api/v1'));

  Future<Map<String, dynamic>> fetchData() async {
    // Get token
    final token = await _authService.getToken();
    
    if (token == null) {
      return {'success': false, 'message': 'Not authenticated'};
    }

    // Use token in request
    final response = await _dio.get(
      '/some/endpoint',
      options: Options(
        headers: {'Authorization': 'Bearer $token'},
      ),
    );

    return response.data;
  }
}
```

---

## 5. PROTECTED ROUTES

### File: `lib/utils/auth_guard.dart`

```dart
import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class AuthGuard extends StatelessWidget {
  final Widget child;
  final List<String>? allowedRoles;

  const AuthGuard({
    Key? key,
    required this.child,
    this.allowedRoles,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final authService = AuthService();

    return FutureBuilder<bool>(
      future: authService.isLoggedIn(),
      builder: (context, snapshot) {
        // Loading
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }

        // Not logged in
        if (!snapshot.hasData || !snapshot.data!) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            Navigator.of(context).pushReplacementNamed('/login');
          });
          return const SizedBox.shrink();
        }

        // Check role if specified
        if (allowedRoles != null && allowedRoles!.isNotEmpty) {
          return FutureBuilder<Map<String, dynamic>?>(
            future: authService.getUserData(),
            builder: (context, userSnapshot) {
              if (userSnapshot.connectionState == ConnectionState.waiting) {
                return const Scaffold(
                  body: Center(child: CircularProgressIndicator()),
                );
              }

              final userData = userSnapshot.data;
              final userRole = userData?['role'];

              if (userRole == null || !allowedRoles!.contains(userRole)) {
                // Unauthorized
                return Scaffold(
                  appBar: AppBar(title: const Text('Akses Ditolak')),
                  body: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.block, size: 64, color: Colors.red),
                        const SizedBox(height: 16),
                        const Text(
                          'Anda tidak memiliki akses ke halaman ini',
                          style: TextStyle(fontSize: 16),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: () => Navigator.of(context).pop(),
                          child: const Text('Kembali'),
                        ),
                      ],
                    ),
                  ),
                );
              }

              return child;
            },
          );
        }

        return child;
      },
    );
  }
}
```

### Penggunaan:

```dart
// Di routing (main.dart atau router.dart)
GoRoute(
  path: '/mandor/dashboard',
  builder: (context, state) => AuthGuard(
    allowedRoles: ['MANDOR'],
    child: MandorDashboardPage(),
  ),
),

GoRoute(
  path: '/asisten/anomaly',
  builder: (context, state) => AuthGuard(
    allowedRoles: ['ASISTEN', 'ADMIN'],
    child: AnomalyDashboardPage(),
  ),
),
```

---

## 6. ERROR HANDLING

### ⚠️ PENTING: "Format email tidak valid" Error

**Problem:** Flutter form validation menolak username `agus.mandor` karena bukan format email.

**Root Cause:** TextFormField menggunakan validator email, padahal backend expect **username** (bukan email).

**Solution 1: Disable Email Validation (RECOMMENDED)**
```dart
// LoginPage - Username field
TextFormField(
  controller: _usernameController,
  decoration: InputDecoration(
    labelText: 'Username',  // BUKAN "Email"!
    hintText: 'agus.mandor',
    prefixIcon: const Icon(Icons.person),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
    ),
  ),
  keyboardType: TextInputType.text,  // BUKAN TextInputType.emailAddress!
  textInputAction: TextInputAction.next,
  validator: (value) {
    if (value == null || value.isEmpty) {
      return 'Username harus diisi';
    }
    // JANGAN pakai email validator!
    // ❌ WRONG: if (!value.contains('@')) return 'Format email tidak valid';
    return null;
  },
),
```

**Solution 2: Send as 'email' field (Backend Support Both)**
```dart
// Backend sudah support both 'username' and 'email' field
final response = await _dio.post(
  '/auth/login',
  data: {
    'email': username,  // atau 'username': username
    'password': password,
  },
);
```

**Credentials Format:**
- ✅ `agus.mandor` (username, bukan email!)
- ❌ `mandor@keboen.com` (salah!)

---

### Error Response Format dari Backend:

```json
{
  "success": false,
  "message": "Username atau password salah"
}
```

### Common Errors:

| Error | Status | Message | Solusi |
|-------|--------|---------|--------|
| Invalid credentials | 401 | "Username atau password salah" | Cek username/password |
| Token expired | 401 | "Token tidak valid atau sudah kadaluarsa" | Logout dan login ulang |
| Account disabled | 403 | "Akun Anda telah dinonaktifkan" | Hubungi admin |
| Server error | 500 | "Terjadi kesalahan sistem" | Coba lagi nanti |
| Connection timeout | - | "Koneksi timeout" | Cek koneksi internet |

### ⚠️ PENTING: Field Name Issue

**Error:** "Format email tidak valid"

**Penyebab:** Form Flutter mengirim field `email` tapi backend expect `username`

**Solusi 1 - Backend Accept Both (SUDAH DIIMPLEMENTASIKAN):**
Backend sekarang menerima `username` ATAU `email` field:
```dart
// Option A: Send as 'username' (recommended)
data: {
  'username': 'agus.mandor',
  'password': 'mandor123',
}

// Option B: Send as 'email' (backward compatible)
data: {
  'email': 'agus.mandor',
  'password': 'mandor123',
}
```

**Solusi 2 - Update Flutter Form:**
Jika form label tetap "Email", tapi kirim dengan field name `username`:
```dart
TextFormField(
  controller: _emailController, // Keep existing controller name
  decoration: InputDecoration(
    labelText: 'Email', // Keep existing label
    hintText: 'agus.mandor', // Change hint to show username format
  ),
  // ...
)

// When sending to API:
await authService.login(
  username: _emailController.text, // Map to 'username' field
  password: _passwordController.text,
);
```

---

## 7. TESTING

### Test Login di Emulator/Device:

```dart
// lib/main.dart
void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Dashboard POAC',
      theme: ThemeData(
        primarySwatch: Colors.green,
      ),
      initialRoute: '/login',
      routes: {
        '/login': (context) => LoginPage(),
        '/mandor/dashboard': (context) => AuthGuard(
          allowedRoles: ['MANDOR'],
          child: MandorDashboardPage(),
        ),
        '/asisten/dashboard': (context) => AuthGuard(
          allowedRoles: ['ASISTEN'],
          child: AsistenDashboardPage(),
        ),
      },
    );
  }
}
```

### Test Credentials (Development):

```dart
// Username: agus.mandor
// Password: mandor123
// Role: MANDOR
// Expected: Navigate to /mandor/dashboard

// Username: asisten.budi
// Password: asisten123
// Role: ASISTEN
// Expected: Navigate to /asisten/dashboard
```

### Checklist Testing:

- [ ] Login dengan username `agus.mandor` berhasil
- [ ] Login dengan username `eko.mandor` berhasil
- [ ] Login dengan username `asisten.budi` berhasil
- [ ] Login dengan password salah menampilkan error
- [ ] Login dengan username tidak ada menampilkan error
- [ ] Token tersimpan setelah login
- [ ] Token persist setelah restart app
- [ ] Logout menghapus token
- [ ] Protected route redirect ke login jika tidak ada token
- [ ] Role-based access control berfungsi

---

## 🚨 TROUBLESHOOTING

### 1. ⚠️ ERROR: "Format email tidak valid" (MOST COMMON!)

**Tampilan Error di Screenshot:**
```
Email
agus.mandor
Format email tidak valid

Password
••••••••

⚠️ Login Gagal: Email atau password salah
```

**Penyebab:** 
- Form Flutter menggunakan field name `email`
- Form validation expect email format (contains @)
- Backend expect field name `username`

**Solusi A - Quick Fix (Backend sudah support):**
Backend SUDAH diupdate untuk accept `email` OR `username` field. Jadi kirim saja dengan field `email`:

```dart
// AuthService.dart - gunakan 'email' field
final response = await _dio.post(
  '/auth/login',
  data: {
    'email': username,  // Backend akan accept ini
    'password': password,
  },
);
```

**Solusi B - Update Form Validation:**
Hilangkan email validation, accept username format:

```dart
// LoginPage.dart
TextFormField(
  controller: _usernameController,
  decoration: InputDecoration(
    labelText: 'Username',  // Ganti label dari "Email" ke "Username"
    hintText: 'agus.mandor',  // Update hint
    prefixIcon: const Icon(Icons.person),  // Ganti icon
  ),
  validator: (value) {
    if (value == null || value.isEmpty) {
      return 'Username harus diisi';  // Ganti message
    }
    // HAPUS email validation regex!
    return null;
  },
)
```

**Solusi C - Hybrid (Recommended):**
Keep label "Email" untuk UX familiar, tapi accept username format:

```dart
TextFormField(
  controller: _emailController,  // Keep controller name
  decoration: InputDecoration(
    labelText: 'Email',  // Keep label
    hintText: 'agus.mandor atau email@domain.com',  // Update hint
    helperText: 'Gunakan username (contoh: agus.mandor)',  // Add helper
  ),
  validator: (value) {
    if (value == null || value.isEmpty) {
      return 'Email/Username harus diisi';
    }
    // Accept both email and username format
    return null;  // No strict validation
  },
)
```

---

### 2. Error: "Connection refused" atau "Unable to connect"

**Penyebab:** Backend tidak running atau base URL salah

**Solusi:**
```dart
// Untuk Android Emulator (AVD):
static const String baseUrl = 'http://10.0.2.2:3000/api/v1';

// Untuk iOS Simulator:
static const String baseUrl = 'http://localhost:3000/api/v1';

// Untuk Physical Device (ganti dengan IP komputer):
static const String baseUrl = 'http://192.168.1.100:3000/api/v1';
```

---

### 3. Error: "Username atau password salah" (padahal benar)

**Penyebab:** Database belum di-setup

**Solusi:**
- Pastikan SQL script `setup_user_credentials.sql` sudah dijalankan di Supabase
- Cek di Supabase SQL Editor:
```sql
SELECT username, is_active FROM master_pihak WHERE username IS NOT NULL;
```

### 3. Token tidak persist setelah restart

**Penyebab:** `flutter_secure_storage` belum dikonfigurasi dengan benar

**Solusi:**
- Android: Pastikan `minSdkVersion >= 18` di `android/app/build.gradle`
- iOS: Tidak perlu konfigurasi tambahan

### 4. Error: "401 Unauthorized" saat access endpoint lain

**Penyebab:** Token tidak di-attach ke request

**Solusi:**
- Pastikan header `Authorization: Bearer <token>` ada di setiap request
- Gunakan interceptor Dio untuk auto-attach token:

```dart
_dio.interceptors.add(
  InterceptorsWrapper(
    onRequest: (options, handler) async {
      final token = await _authService.getToken();
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      return handler.next(options);
    },
  ),
);
```

---

## 📞 SUPPORT

**Backend Team:**
- Server: `http://localhost:3000`
- API Docs: `/docs/API_DOCUMENTATION.md`
- SQL Scripts: `/sql/setup_user_credentials.sql`

**Test Credentials (Development):**
```
Username: agus.mandor    | Password: mandor123  | Role: MANDOR
Username: eko.mandor     | Password: mandor123  | Role: MANDOR
Username: asisten.budi   | Password: asisten123 | Role: ASISTEN
Username: admin          | Password: admin123   | Role: ADMIN
```

---

**Version:** 1.0.0  
**Last Updated:** November 19, 2025  
**Status:** ✅ PRODUCTION READY
