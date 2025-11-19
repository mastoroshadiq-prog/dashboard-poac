# 🚨 QUICK FIX - "Format email tidak valid" Error

> **Issue:** Login form menolak username `agus.mandor`  
> **Error:** "Format email tidak valid"  
> **Platform:** Flutter WEB  
> **Date:** November 19, 2025

---

## ❌ MASALAH

Flutter form validation menolak `agus.mandor` karena:
1. Form field label "Email" → user think it's email
2. TextFormField validator check email format (`contains('@')`)
3. Backend expect **username** bukan email
4. Credentials: `agus.mandor` (username) bukan `mandor@keboen.com`

---

## ✅ SOLUSI CEPAT (3 MENIT)

### Option 1: Ubah Validator (RECOMMENDED)

**File:** `lib/pages/login_page.dart`

**Cari:**
```dart
TextFormField(
  controller: _emailController,  // atau _usernameController
  decoration: InputDecoration(
    labelText: 'Email',  // ← Ini yang bikin bingung!
    ...
  ),
  keyboardType: TextInputType.emailAddress,  // ← Ini salah!
  validator: (value) {
    if (!value.contains('@')) {  // ← Ini yang reject 'agus.mandor'
      return 'Format email tidak valid';
    }
    ...
  },
)
```

**Ganti dengan:**
```dart
TextFormField(
  controller: _usernameController,  // Rename jika perlu
  decoration: InputDecoration(
    labelText: 'Username',  // ✅ UBAH ke "Username"
    hintText: 'agus.mandor',  // ✅ Kasih hint
    prefixIcon: const Icon(Icons.person),  // ✅ Icon person, bukan email
    ...
  ),
  keyboardType: TextInputType.text,  // ✅ UBAH ke text (bukan emailAddress)
  validator: (value) {
    if (value == null || value.isEmpty) {  // ✅ Cukup cek empty
      return 'Username harus diisi';
    }
    // ✅ HAPUS email validation!
    return null;
  },
)
```

---

### Option 2: Backend Accept 'email' Field (SUDAH DONE!)

Backend sekarang accept **both** `username` dan `email` field:

```dart
// Auth Service - login method
final response = await _dio.post(
  '/auth/login',
  data: {
    'email': username,  // ✅ Bisa pakai 'email' atau 'username'
    'password': password,
  },
);
```

**Tapi validator tetap harus diubah!** Karena `agus.mandor` bukan format email yang valid.

---

## 🔑 CREDENTIALS YANG BENAR

```
Username: agus.mandor     ✅ BENAR (bukan email!)
Password: mandor123

❌ SALAH: mandor@keboen.com
❌ SALAH: agus@keboen.com
```

---

## 📝 CHECKLIST

- [ ] Ubah label "Email" menjadi "Username"
- [ ] Ubah `keyboardType` dari `emailAddress` ke `text`
- [ ] Hapus email validator (`contains('@')`)
- [ ] Ubah hint text ke `agus.mandor`
- [ ] Test login dengan username `agus.mandor` password `mandor123`
- [ ] Verify: "Format email tidak valid" error HILANG
- [ ] Verify: Login berhasil, dapat token, navigate ke dashboard

---

## 🧪 TEST SEKARANG

1. Buka Flutter WEB dev tools (F12)
2. Ketik username: `agus.mandor`
3. Ketik password: `mandor123`
4. Klik Login
5. **Expected:** Login berhasil, navigate ke `/mandor/dashboard`
6. **Jika error:** Check browser console untuk error detail

---

## 🔧 BASE URL (Flutter WEB)

```dart
// AuthService.dart
static const String baseUrl = 'http://localhost:3000/api/v1';

// Atau jika backend di komputer lain:
// static const String baseUrl = 'http://192.168.1.100:3000/api/v1';
```

**TIDAK PERLU** konfigurasi Android Emulator atau iOS Simulator karena ini **Flutter WEB**!

---

## 🚨 JIKA MASIH ERROR

### Error: "Connection refused"
- Backend tidak running → Run `node index.js` di terminal backend
- Port salah → Verify backend running di port 3000
- CORS error → Backend sudah enable CORS, tapi cek browser console

### Error: "Username atau password salah"
- SQL script belum dirun → Run `sql/setup_user_credentials.sql` di Supabase
- Username salah → Harus `agus.mandor` (bukan `agus` atau `mandor`)
- Password salah → Harus `mandor123` (case-sensitive!)

### Error: "Token tidak valid"
- Cek JWT_SECRET di backend `.env` file
- Restart backend server setelah update `.env`

---

## 📞 SUPPORT

**Backend Server Status:**
```bash
# Check backend running
curl http://localhost:3000/health

# Expected response:
# { "status": "OK", "message": "Backend is running" }
```

**Test Login via cURL:**
```bash
# Windows PowerShell
$body = @{ username = "agus.mandor"; password = "mandor123" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/v1/auth/login" -Method POST -Body $body -ContentType "application/json"

# Expected response:
# success: True
# token: eyJ...
# user: @{id_pihak=...; nama=Agus (Mandor Sensus); username=agus.mandor; role=MANDOR}
```

---

## ✅ AFTER FIX

Setelah fix:
1. ✅ Form accept `agus.mandor`
2. ✅ No more "Format email tidak valid" error
3. ✅ Login berhasil
4. ✅ Token tersimpan
5. ✅ Navigate ke dashboard yang sesuai role

---

**Estimasi waktu fix:** 3-5 menit  
**Impact:** HIGH - blocking login functionality  
**Priority:** URGENT 🔥

---

**Version:** 1.0.0  
**Last Updated:** November 19, 2025  
**Status:** 🚨 URGENT FIX NEEDED
