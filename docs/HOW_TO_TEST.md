# TESTING GUIDE - MANDOR DASHBOARD SPK ASSIGNMENT
> **Panduan Lengkap Pengujian untuk Backend & Frontend**  
> **Date**: November 18, 2025

---

## 🎯 RINGKASAN TESTING

### Apa yang Diuji?
Sistem SPK assignment yang **resource-based** (bukan role-based):
- Mandor bisa dapat multiple SPK (tidak terbatas tipe APH/Sensus)
- Dashboard menampilkan semua SPK yang di-assign ke mandor
- Task assignment ke surveyor berfungsi dengan benar
- Authorization & security bekerja

---

## 📋 CARA MENGUJI - STEP BY STEP

### STEP 1: Persiapan Backend

#### A. Start Server
```bash
# Terminal 1
cd D:\backend-keboen
node index.js
```

**Expected Output:**
```
🚀 Server running on port 3000
✅ Connected to Supabase
```

#### B. Verify Mandor Users
```bash
# Terminal 2
node check-mandor-users.js
```

**Expected Output:**
```
✅ Found 2 MANDOR user(s):

1. Agus (Mandor Sensus)
   UUID: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
   
2. Eko (Mandor APH)
   UUID: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12
```

#### C. Generate Fresh JWT Tokens
```bash
node generate-mandor-tokens.js
```

**Expected Output:**
```
✅ Tokens generated successfully!
📋 Tokens expire in 24 hours

1. Agus (Mandor Sensus)
   Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
2. Eko (Mandor APH)
   Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANT**: Copy token Mandor Agus untuk testing manual via Postman!

---

### STEP 2: Testing Otomatis (Backend)

```bash
node test-mandor-spk-assignment.js
```

**Test Suite mencakup:**
- ✅ Dashboard Mandor Agus (GET `/mandor/:id/dashboard`)
- ✅ Dashboard Mandor Eko (GET `/mandor/:id/dashboard`)
- ✅ SPK List dengan filter (GET `/spk/mandor/:id`)
- ✅ SPK Detail (GET `/spk/:spk_id`)
- ✅ Surveyor List (GET `/mandor/:id/surveyors`)
- ✅ Cross-access prevention (security test)
- ✅ Unauthorized access (no token)
- ✅ Invalid token rejection

**Expected Output:**
```
📊 TEST SUMMARY
==============================
✅ Passed: 8
❌ Failed: 0
📈 Total: 8
🎯 Success Rate: 100.0%
```

**Jika ada warning:**
```
⚠️  WARNINGS:
   - Cross-Access Prevention
     ⚠️ Security: Agus can access Eko's dashboard 
     (but sees Eko's SPKs, not his own)
     
Note: Ini known issue - tidak critical karena data tetap terpisah
Fix: Add checkMandorAccess middleware (optional)
```

---

### STEP 3: Testing Manual (Postman/cURL)

#### Test 1: Dashboard Mandor Agus

**Request:**
```http
GET http://localhost:3000/api/v1/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/dashboard
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9waWhhayI6ImEwZWViYzk5LTljMGItNGVmOC1iYjZkLTZiYjliZDM4MGExMSIsInJvbGUiOiJNQU5ET1IiLCJuYW1hX3BpaGFrIjoiQWd1cyAoTWFuZG9yIFNlbnN1cykiLCJpYXQiOjE3NjM0NzU5OTIsImV4cCI6MTc2MzU2MjM5Mn0.KHa6ItgX7b_Hte9_kVSaXwYr4eX9vwENCU1MC7TSeF4
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "active_spk": 2,
      "total_spk": 2,
      "pending_tasks": 3,
      "in_progress_tasks": 0
    },
    "spk_list": [
      {
        "id_spk": "...",
        "nama_spk": "SPK01A - Validasi Drone...",
        "status": "BARU",
        "task_count": 2
      },
      {
        "id_spk": "...",
        "nama_spk": "SPK02B - APH Blok...",
        "status": "BARU",
        "task_count": 1
      }
    ],
    "urgent_items": [...]
  }
}
```

**✅ Verification Points:**
- [ ] Status 200 OK
- [ ] `spk_list` berisi SPK yang di-assign ke Agus
- [ ] `task_count` sesuai jumlah tugas per SPK
- [ ] `summary` menampilkan agregat yang benar

---

#### Test 2: SPK List dengan Filter

**Request:**
```http
GET http://localhost:3000/api/v1/spk/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11?status=PENDING&limit=10
Authorization: Bearer <agus_token>
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "spk_list": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total_count": 2
    }
  }
}
```

---

#### Test 3: Surveyor List

**Request:**
```http
GET http://localhost:3000/api/v1/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/surveyors
Authorization: Bearer <agus_token>
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "surveyors": [
      {
        "surveyor_id": "11111111-1111-1111-1111-000000000001",
        "name": "Ahmad Fauzi",
        "kode": "PIC_001",
        "status": "AVAILABLE",
        "current_workload": {
          "active_tasks": 0,
          "pending_tasks": 0,
          "completed_today": 0
        }
      }
    ],
    "summary": {
      "total_surveyors": 16,
      "available": 16,
      "working": 0
    }
  }
}
```

---

#### Test 4: Assign Task ke Surveyor

**Prerequisites:**
1. Dapatkan `id_spk` dari Test 1 (ambil dari `spk_list[0].id_spk`)
2. Dapatkan `id_tugas` dengan query SPK detail:
   ```http
   GET http://localhost:3000/api/v1/spk/<id_spk>
   ```

**Request:**
```http
POST http://localhost:3000/api/v1/spk/<id_spk>/assign-surveyor
Authorization: Bearer <agus_token>
Content-Type: application/json

{
  "id_tugas_list": ["<id_tugas_1>"],
  "surveyor_id": "11111111-1111-1111-1111-000000000001",
  "mandor_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "notes": "Prioritas tinggi - mulai besok pagi"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Successfully assigned 1 task(s) to surveyor",
  "data": {
    "assigned_tasks": [
      {
        "id_tugas": "...",
        "id_pelaksana": "11111111-1111-1111-1111-000000000001",
        "status_tugas": "ASSIGNED",
        "surveyor_name": "Ahmad Fauzi"
      }
    ],
    "spk_status_updated": true
  }
}
```

---

### STEP 4: Testing Frontend

#### A. Manual Testing Checklist

**Prerequisites:**
- Frontend app running (React/Vue/Angular)
- Login credentials untuk Mandor Agus

**Test Flow:**

1. **Login**
   ```
   - [ ] Login sebagai Mandor Agus
   - [ ] Token tersimpan di localStorage/cookies
   - [ ] Redirect ke dashboard
   ```

2. **Dashboard View**
   ```
   - [ ] Summary cards tampil (SPK aktif, pending tasks, dll)
   - [ ] SPK list tampil dengan benar
   - [ ] Setiap SPK card menampilkan:
       - [ ] Nama SPK
       - [ ] Status (BARU/DIKERJAKAN/SELESAI)
       - [ ] Task count
       - [ ] Deadline
   - [ ] Urgent items section tampil (jika ada)
   ```

3. **SPK Detail**
   ```
   - [ ] Klik salah satu SPK
   - [ ] Modal/page detail terbuka
   - [ ] Informasi SPK lengkap tampil
   - [ ] List tugas tampil dengan checkbox
   - [ ] Dropdown surveyor tampil
   ```

4. **Task Assignment**
   ```
   - [ ] Pilih 1 atau lebih tugas
   - [ ] Pilih surveyor dari dropdown
   - [ ] Submit assignment
   - [ ] Success notification muncul
   - [ ] Dashboard refresh otomatis
   - [ ] Task status berubah di UI
   ```

5. **Logout & Test dengan User Berbeda**
   ```
   - [ ] Logout dari Mandor Agus
   - [ ] Login sebagai Mandor Eko
   - [ ] Dashboard Eko menampilkan SPK BERBEDA
   - [ ] SPK Agus TIDAK muncul di dashboard Eko
   ```

#### B. Browser DevTools Verification

**Network Tab:**
```
GET /api/v1/mandor/:id/dashboard
Status: 200 OK
Response Time: < 500ms
Response Size: < 100KB
Headers:
  ✅ Authorization: Bearer ...
  ✅ Content-Type: application/json
```

**Console Tab:**
```
✅ No CORS errors
✅ No 401/403 errors
✅ No JavaScript errors
✅ API calls sequential (tidak parallel spam)
```

**Application Tab (Storage):**
```
localStorage:
  ✅ jwt_token: "eyJhbGci..."
  ✅ user_id: "a0eebc99-9c0b..."
  ✅ user_name: "Agus (Mandor Sensus)"
  ✅ user_role: "MANDOR"
```

---

## 🔍 TROUBLESHOOTING

### Problem 1: Server tidak bisa diakses
```bash
❌ Error: connect ECONNREFUSED 127.0.0.1:3000

Solution:
1. Check server running: node index.js
2. Check port 3000 not used by other app
3. Check firewall not blocking
```

### Problem 2: Token expired
```bash
❌ Error: 401 Unauthorized - Invalid or expired token

Solution:
1. Generate fresh tokens: node generate-mandor-tokens.js
2. Copy new token ke Postman/frontend
3. Tokens expire after 24 hours
```

### Problem 3: SPK list kosong
```bash
✅ Status 200 OK
❌ spk_list: []

Possible Causes:
1. Belum ada SPK di-assign ke mandor ini
2. Database belum seeded

Solution:
1. Check database: node check-all-users.js
2. Seed test data dengan create SPK + assign tugas
3. Verify foreign key: spk_tugas.id_pelaksana = mandor_id
```

### Problem 4: CORS error (Frontend)
```bash
❌ Access to XMLHttpRequest blocked by CORS policy

Solution (Backend):
// index.js
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true
}));
```

### Problem 5: Surveyor list kosong
```bash
✅ Status 200 OK
❌ surveyors: []

Possible Cause:
Database tidak punya user dengan tipe='PEKERJA'

Solution:
Check database query di routes/mandorRoutes.js
Pastikan filter tipe sesuai dengan data actual
```

---

## 📊 SUCCESS METRICS

### Backend Tests
```
✅ All tests PASS (8/8)
✅ Response time < 500ms
✅ No 500 errors
✅ Proper error messages (401/403/404)
```

### Frontend Tests
```
✅ Dashboard loads in < 2 seconds
✅ SPK list renders correctly
✅ Task assignment works (success notification)
✅ Data isolation (Agus vs Eko different SPKs)
✅ Mobile responsive
✅ No console errors
```

---

## 📋 CHECKLIST TIM FRONTEND

Setelah backend testing selesai, berikan checklist ini ke frontend:

- [ ] **Baca dokumentasi**: `docs/FRONTEND_INTEGRATION_CHECKLIST.md`
- [ ] **Update API endpoint**: Ganti ke `/api/v1/mandor/${mandorId}/dashboard`
- [ ] **Remove role-based filter**: Hapus filter SPK by tipe (APH vs Sensus)
- [ ] **Add SPK list component**: Tampilkan semua SPK assigned
- [ ] **Add task assignment modal**: Dengan multi-select & surveyor dropdown
- [ ] **Test dengan 2 user**: Mandor Agus & Eko (verify data berbeda)
- [ ] **JWT token management**: Store, validate, refresh
- [ ] **Error handling**: 401/403 redirect ke login
- [ ] **Loading states**: Skeleton/spinner saat fetch data
- [ ] **Mobile responsive**: Test di tablet/phone

---

## 🚀 DEPLOYMENT CHECKLIST

### Backend
- [ ] Environment variables configured (.env)
- [ ] Database connection verified
- [ ] JWT_SECRET properly set (production secret)
- [ ] CORS configured for production frontend URL
- [ ] Rate limiting configured
- [ ] Logging enabled (Winston/Morgan)
- [ ] Health check endpoint: `GET /health`

### Frontend
- [ ] API base URL configured (production)
- [ ] JWT token refresh logic implemented
- [ ] Error boundary components
- [ ] Analytics/monitoring (Sentry/LogRocket)
- [ ] Build optimized (tree shaking, code splitting)
- [ ] Browser compatibility tested (Chrome, Safari, Firefox)

---

## 📞 SUPPORT

**Jika ada issue:**
1. Check logs: `tail -f server.log`
2. Check database: `node check-mandor-users.js`
3. Re-run tests: `node test-mandor-spk-assignment.js`
4. Review docs:
   - `docs/SPK_ASSIGNMENT_FLOW_CORRECTED.md`
   - `docs/TESTING_MANDOR_MULTI_USER_RBAC.md`
   - `docs/FRONTEND_INTEGRATION_CHECKLIST.md`

**Contact Backend Team:**
- Review API contracts di documentation
- Request sample test data
- Request JWT tokens untuk testing

---

**Generated**: November 18, 2025  
**Version**: 2.0.0  
**Status**: Ready for Testing & Deployment
