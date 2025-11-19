# 🚀 QUICK START GUIDE - Testing New Features

> **Quick guide untuk test semua fitur baru yang sudah diimplementasikan**  
> **Version:** 1.0.0  
> **Date:** November 19, 2025

---

## ⚡ SETUP CEPAT (5 Menit)

### 1. Setup Database (WAJIB!)

```bash
# Login ke Supabase SQL Editor (https://supabase.com/dashboard)
# Copy-paste dan run script berikut:
```

```sql
-- Script 1: Setup User Credentials
-- Copy dari: sql/setup_user_credentials.sql
-- Run di Supabase SQL Editor

-- Script 2: Create Notifications Table
-- Copy dari: sql/create_notifications_table.sql
-- Run di Supabase SQL Editor
```

### 2. Start Backend Server

```bash
cd d:\backend-keboen
node index.js
```

**Expected output:**
```
🚀 BACKEND API - SISTEM SARAF DIGITAL KEBUN
📡 Server running on: http://localhost:3000
✅ Supabase connection established
```

---

## 🧪 TEST AUTHENTICATION (1 Menit)

### Login as Mandor Agus

```bash
# Test login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"agus.mandor\",\"password\":\"mandor123\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id_pihak": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "nama": "Agus (Mandor Sensus)",
    "username": "agus.mandor",
    "role": "MANDOR"
  }
}
```

### Test All Users

| Username | Password | Role | Test Command |
|----------|----------|------|--------------|
| `agus.mandor` | `mandor123` | MANDOR | See above |
| `eko.mandor` | `mandor123` | MANDOR | Change username to `eko.mandor` |
| `asisten.budi` | `asisten123` | ASISTEN | Change username to `asisten.budi` |
| `admin` | `admin123` | ADMIN | Change username to `admin` |

---

## 🔍 TEST ANOMALY DETECTION (2 Menit)

### 1. Generate ASISTEN Token

```bash
node generate-asisten-token.js
```

Copy token dari output.

### 2. Test Anomaly Detection Endpoint

```bash
# Replace <ASISTEN_TOKEN> with actual token
curl -X GET http://localhost:3000/api/v1/analytics/anomaly-detection \
  -H "Authorization: Bearer <ASISTEN_TOKEN>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "anomalies": [
      {
        "type": "POHON_MIRING",
        "severity": "HIGH",
        "count": 12,
        "locations": ["A1-D001A (3 pohon)", "..."],
        "description": "Pohon miring >30 derajat, risiko tumbang",
        "recommended_action": "Prioritas APH segera...",
        "details": [...]
      }
    ],
    "summary": {
      "total_anomalies": 35,
      "critical": 8,
      "high": 27,
      "medium": 0,
      "low": 0
    }
  }
}
```

---

## 🔧 TEST AUTO-CREATE SPK FROM ANOMALY (1 Menit)

### Create SPK from POHON_MIRING Anomaly

```bash
# Replace <ASISTEN_TOKEN> with actual token
curl -X POST http://localhost:3000/api/v1/analytics/create-spk-from-anomaly \
  -H "Authorization: Bearer <ASISTEN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{
    \"anomaly_type\": \"POHON_MIRING\",
    \"mandor_id\": \"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11\",
    \"priority\": \"HIGH\",
    \"notes\": \"Test create SPK from anomaly detection\"
  }"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "spk": {
      "id_spk": "uuid-generated",
      "nomor_spk": "SPK-POH-123456",
      "nama_spk": "SPK APH - Pohon Miring - 19/11/2025",
      "jenis_kegiatan": "APH",
      "status": "BARU",
      "prioritas": "HIGH",
      "deadline": "2025-11-26T00:00:00Z"
    },
    "tugas": {
      "id_tugas": "uuid-generated",
      "assigned_to_mandor": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "status": "PENDING"
    }
  },
  "message": "SPK berhasil dibuat dari anomaly detection"
}
```

### Verify SPK Created

```bash
# Login as Mandor Agus to see the new SPK
# 1. Get Mandor Agus token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"agus.mandor\",\"password\":\"mandor123\"}"

# 2. Get dashboard (should show new SPK)
curl -X GET http://localhost:3000/api/v1/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/dashboard \
  -H "Authorization: Bearer <MANDOR_AGUS_TOKEN>"
```

---

## 🔔 TEST NOTIFICATIONS (1 Menit)

### Get Notifications

```bash
# Replace <USER_TOKEN> with any user token
curl -X GET "http://localhost:3000/api/v1/notifications?read=false&limit=10" \
  -H "Authorization: Bearer <USER_TOKEN>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [],
    "unread_count": 0,
    "total": 0
  }
}
```

### Manually Create Test Notification (via Database)

```sql
-- Run in Supabase SQL Editor
INSERT INTO notifications (user_id, type, title, message, data, priority, read)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- Mandor Agus
  'SPK_ASSIGNMENT',
  'SPK Baru Ditugaskan',
  'Anda mendapat SPK baru: SPK01A - Validasi Drone',
  '{"spk_id":"test-uuid","spk_name":"SPK01A","priority":"HIGH"}',
  'NORMAL',
  FALSE
);
```

Then test GET notifications again - should return 1 notification.

### Mark Notification as Read

```bash
# Get notification ID from previous GET request
curl -X PUT http://localhost:3000/api/v1/notifications/<NOTIFICATION_ID>/read \
  -H "Authorization: Bearer <MANDOR_AGUS_TOKEN>"
```

---

## 📋 TEST MANDOR LIST ENDPOINT (30 Seconds)

### Get List of All Mandor (for SPK Assignment Form)

```bash
# Use ASISTEN token
curl -X GET http://localhost:3000/api/v1/mandor/list \
  -H "Authorization: Bearer <ASISTEN_TOKEN>"
```

**Expected Response:**
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

**✅ VERIFIED:** Form will show Agus & Eko (MANDOR), NOT Ahmad/Budi/Cahyo (PEKERJA)

---

## 🎯 COMPLETE TEST FLOW (End-to-End)

### Scenario: Asisten Detects Anomaly → Create SPK → Mandor Receives Notification

#### Step 1: Login as Asisten
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"asisten.budi\",\"password\":\"asisten123\"}"

# Save token as ASISTEN_TOKEN
```

#### Step 2: Check Anomalies
```bash
curl -X GET http://localhost:3000/api/v1/analytics/anomaly-detection \
  -H "Authorization: Bearer <ASISTEN_TOKEN>"

# Note the anomaly types available
```

#### Step 3: Create SPK from Anomaly
```bash
curl -X POST http://localhost:3000/api/v1/analytics/create-spk-from-anomaly \
  -H "Authorization: Bearer <ASISTEN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{
    \"anomaly_type\": \"POHON_MIRING\",
    \"mandor_id\": \"a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11\",
    \"priority\": \"HIGH\"
  }"

# Save spk.id_spk from response
```

#### Step 4: Login as Mandor Agus
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"agus.mandor\",\"password\":\"mandor123\"}"

# Save token as MANDOR_TOKEN
```

#### Step 5: Check Dashboard (Should See New SPK)
```bash
curl -X GET http://localhost:3000/api/v1/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/dashboard \
  -H "Authorization: Bearer <MANDOR_TOKEN>"

# Verify spk_list contains the new SPK
```

#### Step 6: Check Notifications
```bash
curl -X GET http://localhost:3000/api/v1/notifications \
  -H "Authorization: Bearer <MANDOR_TOKEN>"

# Should see notification about new SPK assignment (if notification service called during SPK creation)
```

**✅ SUCCESS:** Complete flow tested!

---

## 🐛 TROUBLESHOOTING

### Error: "Username atau password salah"
**Fix:**
1. Pastikan database script `setup_user_credentials.sql` sudah dirun
2. Cek username: `agus.mandor` (bukan `agus` atau `Agus`)
3. Cek password: `mandor123` (case-sensitive)

### Error: "Endpoint not found" or 404
**Fix:**
1. Pastikan server running: `node index.js`
2. Cek port: `http://localhost:3000` (bukan 8000 atau lainnya)
3. Cek endpoint spelling (case-sensitive)

### Error: "Unauthorized" or 401
**Fix:**
1. Pastikan token valid (belum expired - 24h)
2. Format header: `Authorization: Bearer <token>` (ada spasi setelah Bearer)
3. Generate token baru jika expired

### Error: "Forbidden" or 403
**Fix:**
1. Cek role: endpoint ini butuh role apa? (ASISTEN/ADMIN/MANDOR)
2. Pastikan login dengan user yang benar
3. Token role tidak sesuai dengan required role

### Anomaly Detection returns empty array
**Fix:**
1. Database belum ada data observasi
2. Run dummy data script untuk testing
3. Cek kolom `metadata_json`, `ndre_value`, `ndre_classification` ada di `kebun_observasi`

---

## 📚 DOKUMENTASI LENGKAP

Untuk panduan detail, lihat:

1. **Authentication:** `docs/PANDUAN_FRONTEND_DASHBOARD_LENGKAP_V3.md` - Section 1
2. **Notifications:** `docs/PANDUAN_FRONTEND_DASHBOARD_LENGKAP_V3.md` - Section 2
3. **Anomaly Detection:** `docs/PANDUAN_FRONTEND_DASHBOARD_LENGKAP_V3.md` - Section 3
4. **Complete API Reference:** `docs/PANDUAN_FRONTEND_DASHBOARD_LENGKAP_V3.md` - Section 5
5. **Implementation Summary:** `docs/IMPLEMENTATION_SUMMARY_COMPLETE.md`

---

## ✅ CHECKLIST TESTING

- [ ] Database scripts executed successfully
- [ ] Server starts without errors
- [ ] Login dengan 4 users berhasil (agus, eko, asisten, admin)
- [ ] Anomaly detection returns data
- [ ] Create SPK from anomaly berhasil
- [ ] SPK muncul di dashboard mandor
- [ ] Notifications endpoint works
- [ ] Mandor list returns Agus & Eko (not PEKERJA)
- [ ] Change password works
- [ ] Logout works (token removed)

---

**Total Testing Time:** ~10 menit  
**Prerequisites:** Database scripts executed, server running  
**Status:** ✅ ALL ENDPOINTS READY FOR TESTING

**Next:** Frontend team implement integration using `PANDUAN_FRONTEND_DASHBOARD_LENGKAP_V3.md`
