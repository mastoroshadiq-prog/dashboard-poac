# 📚 DOKUMENTASI LENGKAP - FLUTTER DASHBOARD INTEGRATION

> **Project:** Dashboard POAC - Sistem Saraf Digital Kebun  
> **Platform:** Flutter/Dart  
> **Backend:** Node.js + Express + Supabase  
> **Version:** 1.0.0  
> **Date:** November 19, 2025

---

## 🎯 OVERVIEW

Dokumentasi lengkap untuk integrasi Flutter dengan Backend API. Semua dokumentasi menggunakan **FLUTTER/DART**, bukan React.

**Status:** ✅ **PRODUCTION READY**

---

## 📖 DAFTAR DOKUMENTASI

### 1. 🔐 Authentication (LOGIN SYSTEM)
**File:** [`PANDUAN_FLUTTER_AUTHENTICATION_COMPLETE.md`](./PANDUAN_FLUTTER_AUTHENTICATION_COMPLETE.md)

**Isi:**
- Setup dependencies (dio, flutter_secure_storage, go_router)
- AuthService implementation (login, logout, token management)
- LoginPage widget (complete UI dengan validation)
- Token storage (secure, persistent)
- Protected routes (role-based access control)
- Error handling
- Testing checklist

**Gunakan ini untuk:**
- ✅ Implement login page
- ✅ Setup token management
- ✅ Configure protected routes
- ✅ Handle authentication flow

---

### 2. 🔔 Features (NOTIFICATIONS, ANOMALY, SPK)
**File:** [`PANDUAN_FLUTTER_FEATURES_COMPLETE.md`](./PANDUAN_FLUTTER_FEATURES_COMPLETE.md)

**Isi:**
- NotificationService (get, mark as read, delete)
- NotificationBell widget (real-time polling, badge count)
- AnomalyService (detect anomalies, create SPK)
- AnomalyDashboardPage (complete UI dengan filters)
- CreateSPKDialog (mandor selection, priority)
- MandorService (get mandor list)

**Gunakan ini untuk:**
- ✅ Implement notification bell di AppBar
- ✅ Create anomaly detection dashboard
- ✅ Build "Create SPK from Anomaly" feature
- ✅ Fix "Assign to Mandor" dropdown

---

### 3. 📡 API Endpoints Reference
**File:** [`API_ENDPOINTS_FLUTTER_REFERENCE.md`](./API_ENDPOINTS_FLUTTER_REFERENCE.md)

**Isi:**
- Complete API endpoints (12 endpoints total)
- Request/response examples
- Error handling guide
- Base URL configuration (Android/iOS/Physical device)
- Test credentials
- Quick test script

**Gunakan ini untuk:**
- ✅ Reference saat implementasi service
- ✅ Troubleshoot API calls
- ✅ Configure base URL untuk testing
- ✅ Verify response format

---

## 🚀 QUICK START

### Step 1: Read Authentication Guide
```
docs/PANDUAN_FLUTTER_AUTHENTICATION_COMPLETE.md
```
Implement login page terlebih dahulu.

### Step 2: Read Features Guide
```
docs/PANDUAN_FLUTTER_FEATURES_COMPLETE.md
```
Implement notification bell dan anomaly dashboard.

### Step 3: Reference API Endpoints
```
docs/API_ENDPOINTS_FLUTTER_REFERENCE.md
```
Gunakan sebagai reference saat coding.

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Authentication (HIGH PRIORITY)
- [ ] Install dependencies (`dio`, `flutter_secure_storage`, `provider`/`riverpod`/`bloc`)
- [ ] Create `lib/services/auth_service.dart`
- [ ] Create `lib/pages/login_page.dart`
- [ ] Create `lib/utils/auth_guard.dart`
- [ ] Configure base URL untuk testing environment
- [ ] Test login dengan username `agus.mandor` / password `mandor123`
- [ ] Verify token tersimpan dan persist setelah restart
- [ ] Test protected routes

### Phase 2: Notifications (HIGH PRIORITY)
- [ ] Create `lib/services/notification_service.dart`
- [ ] Create `lib/widgets/notification_bell.dart`
- [ ] Add NotificationBell ke AppBar
- [ ] Test polling every 30 seconds
- [ ] Test mark as read functionality
- [ ] Verify unread count badge

### Phase 3: Anomaly Detection (MEDIUM PRIORITY)
- [ ] Create `lib/services/anomaly_service.dart`
- [ ] Create `lib/pages/anomaly_dashboard_page.dart`
- [ ] Test anomaly detection endpoint
- [ ] Verify 3 anomaly types displayed correctly
- [ ] Test severity colors (CRITICAL=red, HIGH=orange)

### Phase 4: Create SPK from Anomaly (MEDIUM PRIORITY)
- [ ] Create `CreateSPKDialog` widget
- [ ] Create `lib/services/mandor_service.dart`
- [ ] Test mandor dropdown shows Agus & Eko ONLY
- [ ] Test create SPK functionality
- [ ] Verify SPK appears in mandor dashboard

### Phase 5: Testing & Polish (LOW PRIORITY)
- [ ] Test all features end-to-end
- [ ] Handle edge cases (no internet, timeout)
- [ ] Add loading states
- [ ] Add error messages
- [ ] Polish UI/UX

---

## 🔑 TEST CREDENTIALS

| Username | Password | Role | Dashboard |
|----------|----------|------|-----------|
| `agus.mandor` | `mandor123` | MANDOR | `/mandor/dashboard` |
| `eko.mandor` | `mandor123` | MANDOR | `/mandor/dashboard` |
| `asisten.budi` | `asisten123` | ASISTEN | `/asisten/dashboard` |
| `admin` | `admin123` | ADMIN | `/admin/dashboard` |

---

## 🔧 BASE URL CONFIGURATION

**Android Emulator:**
```dart
static const String baseUrl = 'http://10.0.2.2:3000/api/v1';
```

**iOS Simulator:**
```dart
static const String baseUrl = 'http://localhost:3000/api/v1';
```

**Physical Device (ganti dengan IP komputer):**
```dart
static const String baseUrl = 'http://192.168.1.100:3000/api/v1';
```

**Cara cek IP komputer:**
```bash
# Windows PowerShell
ipconfig | findstr IPv4

# Mac/Linux
ifconfig | grep inet
```

---

## 🚨 TROUBLESHOOTING

### 1. Error: "Connection refused" atau "Unable to connect"

**Solusi:**
- Pastikan backend server running (`node index.js` di terminal backend)
- Ganti base URL sesuai platform (Android/iOS/Physical device)
- Cek firewall Windows tidak block port 3000

### 2. Error: "Username atau password salah" (padahal benar)

**Solusi:**
- Pastikan SQL script `sql/setup_user_credentials.sql` sudah dijalankan di Supabase
- Cek username menggunakan format `agus.mandor` (bukan email!)
- Verify database setup:
```sql
SELECT username, is_active FROM master_pihak WHERE username IS NOT NULL;
```

### 3. Token tidak persist setelah restart app

**Solusi:**
- Pastikan `flutter_secure_storage` sudah di-install
- Android: Cek `minSdkVersion >= 18` di `android/app/build.gradle`
- iOS: No configuration needed

### 4. Notifications tidak muncul

**Solusi:**
- Pastikan SQL script `sql/create_notifications_table.sql` sudah dijalankan
- Test create notification manual via SQL:
```sql
INSERT INTO notifications (user_id, type, title, message, priority, read)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'SPK_ASSIGNMENT',
  'Test Notification',
  'This is a test',
  'NORMAL',
  FALSE
);
```

### 5. Anomaly detection returns empty array

**Solusi:**
- Database belum ada data observasi
- Use fallback dummy data untuk testing
- Atau contact backend team untuk insert test data

---

## 📞 SUPPORT & CONTACT

### Backend Team
- Server: `http://localhost:3000`
- Health Check: `GET http://localhost:3000/health`
- API Info: `GET http://localhost:3000/`

### SQL Scripts (Run di Supabase SQL Editor)
1. `sql/setup_user_credentials.sql` - Setup login credentials
2. `sql/create_notifications_table.sql` - Create notifications table

### Additional Documentation
- **Implementation Summary:** `docs/IMPLEMENTATION_SUMMARY_COMPLETE.md`
- **Backend Verification:** `docs/RESPONSE_BACKEND_VERIFICATION_V3.md`
- **Quick Start Testing:** `QUICK_START_TESTING.md`

---

## 🎯 SUCCESS CRITERIA

### Phase 1: Authentication ✅
- [x] Login page implemented
- [x] Token storage working
- [x] Protected routes configured
- [x] Role-based navigation

### Phase 2: Notifications ⏳
- [ ] Notification bell showing in AppBar
- [ ] Real-time polling working
- [ ] Mark as read functionality
- [ ] Unread count badge

### Phase 3: Anomaly Detection ⏳
- [ ] Anomaly dashboard page created
- [ ] 3 anomaly types displayed
- [ ] Severity colors correct
- [ ] Location breakdown shown

### Phase 4: Create SPK ⏳
- [ ] Create SPK dialog implemented
- [ ] Mandor dropdown shows correct users
- [ ] SPK created successfully
- [ ] SPK appears in mandor dashboard

---

## 📝 NOTES PENTING

### ⚠️ INGAT: Platform adalah FLUTTER
- ❌ **JANGAN** gunakan React/JSX code
- ❌ **JANGAN** gunakan `fetch()` atau `axios` tanpa Dart package
- ✅ **GUNAKAN** Dart/Flutter code dari dokumentasi ini
- ✅ **GUNAKAN** `dio` package untuk HTTP requests
- ✅ **GUNAKAN** `flutter_secure_storage` untuk token storage

### 🔐 Credentials Format
- ✅ **Username:** `agus.mandor` (bukan email!)
- ❌ **BUKAN:** `mandor@keboen.com`
- ❌ **BUKAN:** `agus@keboen.com`

### 📡 API Authentication
- Semua endpoint (kecuali `/auth/login`) require JWT token
- Token format: `Authorization: Bearer <token>`
- Token expires in 24 hours (configurable di backend)

### 🎨 UI/UX Guidelines
- Use Material Design 3
- Primary color: Green (agriculture theme)
- Loading states: `CircularProgressIndicator`
- Error messages: `SnackBar` with red background
- Success messages: `SnackBar` with green background

---

## 🚀 DEPLOYMENT CHECKLIST

### Before Production:
- [ ] Change base URL to production URL
- [ ] Remove development credentials display
- [ ] Enable ProGuard/R8 (Android)
- [ ] Configure App Transport Security (iOS)
- [ ] Test on physical devices
- [ ] Setup error tracking (Sentry/Firebase Crashlytics)
- [ ] Configure push notifications (Firebase Cloud Messaging)

### Backend Requirements:
- [ ] SQL scripts executed in production database
- [ ] Production JWT secret configured
- [ ] Production password hashes set (bcrypt)
- [ ] CORS configured for production domain
- [ ] SSL/TLS certificate installed
- [ ] Rate limiting configured

---

## 📊 PROJECT STRUCTURE

```
lib/
├── main.dart
├── services/
│   ├── auth_service.dart          # ✅ Authentication
│   ├── notification_service.dart  # ✅ Notifications
│   ├── anomaly_service.dart       # ✅ Anomaly detection
│   └── mandor_service.dart        # ✅ Mandor list
├── pages/
│   ├── login_page.dart            # ✅ Login UI
│   ├── anomaly_dashboard_page.dart # ✅ Anomaly dashboard
│   └── ...
├── widgets/
│   ├── notification_bell.dart     # ✅ Notification bell
│   └── ...
├── utils/
│   ├── auth_guard.dart            # ✅ Protected routes
│   └── ...
└── models/
    ├── notification_model.dart
    └── ...
```

---

## 🎉 NEXT STEPS

1. **READ** dokumentasi authentication terlebih dahulu
2. **IMPLEMENT** login page dan test dengan credentials
3. **VERIFY** token storage working
4. **PROCEED** ke dokumentasi features untuk notification & anomaly
5. **TEST** end-to-end flow
6. **REPORT** any issues ke backend team

---

**Good luck with integration!** 🚀

Jika ada pertanyaan atau issues, hubungi Backend Team.

---

**Version:** 1.0.0  
**Last Updated:** November 19, 2025  
**Status:** ✅ COMPLETE DOCUMENTATION FOR FLUTTER
