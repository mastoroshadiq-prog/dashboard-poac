# 📡 API ENDPOINTS REFERENCE - FLUTTER

> **Backend:** Node.js + Express  
> **Base URL:** `http://localhost:3000/api/v1`  
> **Authentication:** JWT Bearer Token  
> **Version:** 1.0.0  
> **Date:** November 19, 2025

---

## 🔐 AUTHENTICATION ENDPOINTS

### 1. POST /auth/login
**Login dengan username dan password**

**Request:**
```dart
POST http://localhost:3000/api/v1/auth/login
Headers:
  Content-Type: application/json

Body:
{
  "username": "agus.mandor",
  "password": "mandor123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id_pihak": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "nama": "Agus (Mandor Sensus)",
    "username": "agus.mandor",
    "role": "MANDOR",
    "kode_unik": "AGUS_MANDOR",
    "tipe": "INTERNAL"
  },
  "message": "Login berhasil"
}
```

**Response Error (401):**
```json
{
  "success": false,
  "message": "Username atau password salah"
}
```

**Test Credentials:**
| Username | Password | Role | Expected Navigation |
|----------|----------|------|---------------------|
| `agus.mandor` | `mandor123` | MANDOR | `/mandor/dashboard` |
| `eko.mandor` | `mandor123` | MANDOR | `/mandor/dashboard` |
| `asisten.budi` | `asisten123` | ASISTEN | `/asisten/dashboard` |
| `admin` | `admin123` | ADMIN | `/admin/dashboard` |

---

### 2. POST /auth/logout
**Logout user (optional - dapat dilakukan client-side saja)**

**Request:**
```dart
POST http://localhost:3000/api/v1/auth/logout
Headers:
  Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout berhasil"
}
```

---

### 3. GET /auth/me
**Get current user info**

**Request:**
```dart
GET http://localhost:3000/api/v1/auth/me
Headers:
  Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id_pihak": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "nama": "Agus (Mandor Sensus)",
    "username": "agus.mandor",
    "role": "MANDOR"
  }
}
```

---

### 4. POST /auth/change-password
**Change user password**

**Request:**
```dart
POST http://localhost:3000/api/v1/auth/change-password
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "old_password": "mandor123",
  "new_password": "newpassword123",
  "confirm_password": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password berhasil diubah"
}
```

---

## 🔔 NOTIFICATION ENDPOINTS

### 5. GET /notifications
**Get user notifications**

**Request:**
```dart
GET http://localhost:3000/api/v1/notifications?read=false&limit=20&offset=0
Headers:
  Authorization: Bearer <token>

Query Parameters:
  - read (optional): true/false - filter by read status
  - type (optional): string - filter by notification type
  - limit (optional): number - default 20
  - offset (optional): number - default 0
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "type": "SPK_ASSIGNMENT",
        "title": "SPK Baru Ditugaskan",
        "message": "Anda mendapat SPK baru: SPK01A - Validasi Drone",
        "data": {
          "spk_id": "uuid",
          "spk_name": "SPK01A",
          "priority": "HIGH"
        },
        "priority": "NORMAL",
        "read": false,
        "created_at": "2025-11-19T10:30:00Z"
      }
    ],
    "unread_count": 5,
    "total": 25
  }
}
```

**Notification Types:**
- `SPK_ASSIGNMENT` - SPK ditugaskan
- `URGENT_TASK` - Tugas urgent
- `ANOMALY_DETECTED` - Anomali terdeteksi
- `SYSTEM` - Pesan sistem
- `INFO` - Informasi umum

**Priority Levels:**
- `URGENT` - 🔴 Merah
- `HIGH` - 🟠 Orange
- `NORMAL` - 🔵 Biru
- `LOW` - ⚪ Abu-abu

---

### 6. PUT /notifications/:id/read
**Mark single notification as read**

**Request:**
```dart
PUT http://localhost:3000/api/v1/notifications/<notification_id>/read
Headers:
  Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### 7. PUT /notifications/mark-all-read
**Mark all user notifications as read**

**Request:**
```dart
PUT http://localhost:3000/api/v1/notifications/mark-all-read
Headers:
  Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "count": 5
}
```

---

### 8. DELETE /notifications/:id
**Delete notification**

**Request:**
```dart
DELETE http://localhost:3000/api/v1/notifications/<notification_id>
Headers:
  Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

---

## 🔍 ANOMALY DETECTION ENDPOINTS

### 9. GET /analytics/anomaly-detection
**Get anomaly detection results**

**Required Role:** ASISTEN, ADMIN

**Request:**
```dart
GET http://localhost:3000/api/v1/analytics/anomaly-detection
Headers:
  Authorization: Bearer <token>

Query Parameters (all optional):
  - divisi: string
  - afdeling: string
  - blok: string
  - severity: CRITICAL|HIGH|MEDIUM|LOW
  - date_from: ISO date string
  - date_to: ISO date string
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "anomalies": [
      {
        "type": "POHON_MIRING",
        "severity": "HIGH",
        "count": 12,
        "locations": [
          "A1-D001A (3 pohon)",
          "A1-D001B (2 pohon)",
          "A2-D002C (7 pohon)"
        ],
        "description": "Pohon miring >30 derajat, risiko tumbang",
        "recommended_action": "Prioritas APH segera untuk evaluasi kondisi pohon",
        "details": [
          {
            "id_pokok": "uuid",
            "no_pokok": "001",
            "afdeling": "A1",
            "blok": "D001A",
            "angle": 35.2,
            "metadata": {...}
          }
        ]
      },
      {
        "type": "POHON_MATI",
        "severity": "CRITICAL",
        "count": 8,
        "locations": ["A1-D003A (3 pohon)", "A2-D001A (5 pohon)"],
        "description": "Pohon mati perlu segera sanitasi",
        "recommended_action": "Sanitasi immediate, risiko penyebaran penyakit"
      },
      {
        "type": "NDRE_STRES_BERAT",
        "severity": "HIGH",
        "count": 15,
        "locations": ["A1-D001A (5 pohon)", "A1-D002B (10 pohon)"],
        "description": "NDRE menunjukkan stres berat pada tanaman",
        "recommended_action": "Validasi lapangan NDRE drone untuk konfirmasi kondisi"
      }
    ],
    "summary": {
      "total_anomalies": 35,
      "by_severity": {
        "critical": 8,
        "high": 27,
        "medium": 0,
        "low": 0
      },
      "by_type": {
        "POHON_MIRING": 12,
        "POHON_MATI": 8,
        "NDRE_STRES_BERAT": 15
      }
    },
    "filters_applied": {
      "date_range": "Last 30 days",
      "afdeling": "All",
      "severity": "All"
    }
  }
}
```

**Anomaly Types:**
- `POHON_MIRING` → SPK APH
- `POHON_MATI` → SPK SANITASI
- `NDRE_STRES_BERAT` → SPK VALIDASI_DRONE
- `GAMBUT_AMBLAS` → SPK INFRASTRUCTURE
- `SPACING_ISSUE` → SPK SENSUS

---

### 10. POST /analytics/create-spk-from-anomaly
**Create SPK from detected anomaly**

**Required Role:** ASISTEN, ADMIN

**Request:**
```dart
POST http://localhost:3000/api/v1/analytics/create-spk-from-anomaly
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "anomaly_type": "POHON_MIRING",
  "anomaly_ids": ["uuid1", "uuid2", "uuid3"],  // optional
  "mandor_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "asisten_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20",
  "priority": "HIGH",
  "notes": "Prioritas tinggi - area rawan tumbang"  // optional
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "spk": {
      "id_spk": "uuid-generated",
      "nomor_spk": "SPK-APH-1732012345",
      "nama_spk": "SPK APH - Pohon Miring - 19/11/2025",
      "jenis_kegiatan": "APH",
      "status": "BARU",
      "prioritas": "HIGH",
      "tanggal_mulai": "2025-11-19T00:00:00.000Z",
      "tanggal_deadline": "2025-11-26T00:00:00.000Z",
      "keterangan": "Auto-generated dari deteksi anomali",
      "metadata_json": {
        "created_from": "ANOMALY_DETECTION",
        "anomaly_type": "POHON_MIRING",
        "anomaly_ids": ["uuid1", "uuid2", "uuid3"],
        "auto_generated": true
      }
    },
    "tugas": {
      "id_tugas": "uuid-generated",
      "id_spk": "uuid-generated",
      "id_pelaksana": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "status": "PENDING",
      "assigned_at": "2025-11-19T10:30:00.000Z"
    }
  },
  "message": "SPK berhasil dibuat dari anomaly detection"
}
```

**Priority to Deadline Mapping:**
- `URGENT` → 3 days
- `HIGH` → 7 days
- `NORMAL` → 14 days
- `LOW` → 21 days

---

### 11. POST /analytics/bulk-create-spk-from-anomalies
**Create multiple SPKs from anomalies**

**Required Role:** ASISTEN, ADMIN

**Request:**
```dart
POST http://localhost:3000/api/v1/analytics/bulk-create-spk-from-anomalies
Headers:
  Authorization: Bearer <token>
  Content-Type: application/json

Body:
{
  "anomalies": [
    {
      "anomaly_type": "POHON_MIRING",
      "mandor_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "priority": "HIGH"
    },
    {
      "anomaly_type": "POHON_MATI",
      "mandor_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
      "priority": "URGENT"
    }
  ],
  "asisten_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "created": [
      {
        "spk": {...},
        "tugas": {...}
      },
      {
        "spk": {...},
        "tugas": {...}
      }
    ],
    "failed": [],
    "summary": {
      "total": 2,
      "created": 2,
      "failed": 0
    }
  },
  "message": "2 SPK berhasil dibuat"
}
```

---

## 👥 MANDOR ENDPOINTS

### 12. GET /mandor/list
**Get list of all mandor users**

**Required Role:** ASISTEN, ADMIN

**Request:**
```dart
GET http://localhost:3000/api/v1/mandor/list
Headers:
  Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "mandor_list": [
      {
        "id_pihak": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "nama": "Agus (Mandor Sensus)",
        "kode_unik": "AGUS_MANDOR",
        "tipe": "INTERNAL"
      },
      {
        "id_pihak": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
        "nama": "Eko (Mandor APH)",
        "kode_unik": "EKO_MANDOR",
        "tipe": "INTERNAL"
      }
    ],
    "total": 2
  }
}
```

**✅ VERIFIED:** List HANYA berisi Agus & Eko (MANDOR), TIDAK ada Ahmad/Budi/Cahyo (PEKERJA)

---

## 🚨 ERROR RESPONSES

### Common Error Format:
```json
{
  "success": false,
  "message": "Error description in Bahasa Indonesia",
  "error": "Technical error details (optional)"
}
```

### HTTP Status Codes:

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Request berhasil |
| 400 | Bad Request | Validasi input gagal |
| 401 | Unauthorized | Token tidak valid/expired |
| 403 | Forbidden | Role tidak memiliki akses |
| 404 | Not Found | Resource tidak ditemukan |
| 500 | Server Error | Internal server error |

### Example Error Responses:

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Token tidak valid atau sudah kadaluarsa"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Anda tidak memiliki akses ke resource ini"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Username dan password harus diisi"
}
```

---

## 🔧 BASE URL CONFIGURATION

### Android Emulator (AVD):
```dart
static const String baseUrl = 'http://10.0.2.2:3000/api/v1';
```

### iOS Simulator:
```dart
static const String baseUrl = 'http://localhost:3000/api/v1';
```

### Physical Device (Replace dengan IP komputer):
```dart
static const String baseUrl = 'http://192.168.1.100:3000/api/v1';
```

### Production:
```dart
static const String baseUrl = 'https://api.yourdomain.com/api/v1';
```

---

## 📝 QUICK TEST SCRIPT

```dart
// Test semua endpoints
Future<void> testAllEndpoints() async {
  final authService = AuthService();
  
  // 1. Login
  print('Testing login...');
  final loginResult = await authService.login(
    username: 'agus.mandor',
    password: 'mandor123',
  );
  print('Login: ${loginResult['success']}');
  
  // 2. Get notifications
  print('Testing notifications...');
  final notifService = NotificationService();
  final notifResult = await notifService.getNotifications();
  print('Notifications: ${notifResult['success']}');
  
  // 3. Get anomalies
  print('Testing anomaly detection...');
  final anomalyService = AnomalyService();
  final anomalyResult = await anomalyService.detectAnomalies();
  print('Anomalies: ${anomalyResult['success']}');
  
  // 4. Get mandor list
  print('Testing mandor list...');
  final mandorService = MandorService();
  final mandorResult = await mandorService.getMandorList();
  print('Mandor list: ${mandorResult['success']}');
  
  print('All tests completed!');
}
```

---

## 📞 SUPPORT

**Backend Server:**
- URL: `http://localhost:3000`
- Health Check: `GET /health`
- API Info: `GET /`

**Test Credentials:**
```
agus.mandor / mandor123 (MANDOR)
eko.mandor / mandor123 (MANDOR)
asisten.budi / asisten123 (ASISTEN)
admin / admin123 (ADMIN)
```

**Documentation:**
- Authentication: `/docs/PANDUAN_FLUTTER_AUTHENTICATION_COMPLETE.md`
- Features: `/docs/PANDUAN_FLUTTER_FEATURES_COMPLETE.md`
- SQL Setup: `/sql/setup_user_credentials.sql`

---

**Version:** 1.0.0  
**Last Updated:** November 19, 2025  
**Status:** ✅ COMPLETE API REFERENCE
