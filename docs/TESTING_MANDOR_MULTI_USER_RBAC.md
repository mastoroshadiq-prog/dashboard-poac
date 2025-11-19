# TESTING GUIDE: MANDOR DASHBOARD - MULTI-USER RBAC
> Platform B: Keboen Backend API  
> Date: January 2025  
> Version: 1.0.0

## 📋 EXECUTIVE SUMMARY

**RBAC Status**: ✅ **FULLY IMPLEMENTED** (Fase 1 & 2 Complete - Nov 7, 2025)
- JWT authentication middleware: `authenticateJWT()`
- Role-based authorization: `authorizeRole(allowedRoles)`
- All Platform B endpoints protected

**Current Mandor Users**: 2 users available for testing
- Agus (Mandor Sensus) - `AGUS_MANDOR` - UUID: `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`
- Eko (Mandor APH) - `EKO_MANDOR` - UUID: `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12`

**⚠️ IMPORTANT CLARIFICATION**:
- "Mandor Sensus" / "Mandor APH" adalah hanya **nama/label**, BUKAN role berbeda
- Semua mandor memiliki role yang sama: `MANDOR`
- Yang membedakan adalah **SPK mana yang di-assign** ke mandor mana
- Satu mandor bisa handle **multiple SPK** dengan tipe berbeda (APH, Sensus, Sanitasi, dll)

**Database Schema Note**:
- Table: `master_pihak`
- Mandor users stored with `tipe='INTERNAL'`
- Identified by `kode_unik` containing 'MANDOR'
- SPK assignment tracked in `spk_tugas.id_pelaksana` (FK ke `master_pihak.id_pihak`)

---

## 🔑 JWT TOKENS FOR TESTING

### 1. Agus (Mandor Sensus)
```
UUID: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
Kode: AGUS_MANDOR
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9waWhhayI6ImEwZWViYzk5LTljMGItNGVmOC1iYjZkLTZiYjliZDM4MGExMSIsInJvbGUiOiJNQU5ET1IiLCJuYW1hX3BpaGFrIjoiQWd1cyAoTWFuZG9yIFNlbnN1cykiLCJpYXQiOjE3NjM0NzU5OTIsImV4cCI6MTc2MzU2MjM5Mn0.KHa6ItgX7b_Hte9_kVSaXwYr4eX9vwENCU1MC7TSeF4
Expires: 24 hours from generation
```

### 2. Eko (Mandor APH)
```
UUID: a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12
Kode: EKO_MANDOR
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9waWhhayI6ImEwZWViYzk5LTljMGItNGVmOC1iYjZkLTZiYjliZDM4MGExMiIsInJvbGUiOiJNQU5ET1IiLCJuYW1hX3BpaGFrIjoiRWtvIChNYW5kb3IgQVBIKSIsImlhdCI6MTc2MzQ3NTk5MiwiZXhwIjoxNzYzNTYyMzkyfQ.iOzvbw37dhlI0-8U-aUShp4cNrxsWJ0_RIIHaYjwccs
Expires: 24 hours from generation
```

### 🔄 Regenerate Tokens (After Expiration)
```bash
node generate-mandor-tokens.js
```

---

## 🧪 TEST SCENARIOS

### Scenario 1: Mandor Agus Accesses Own Dashboard ✅ EXPECTED TO PASS

**Endpoint**: `GET /api/v1/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/dashboard`

**Postman Setup**:
1. Method: `GET`
2. URL: `http://localhost:3000/api/v1/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/dashboard`
3. Headers:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9waWhhayI6ImEwZWViYzk5LTljMGItNGVmOC1iYjZkLTZiYjliZDM4MGExMSIsInJvbGUiOiJNQU5ET1IiLCJuYW1hX3BpaGFrIjoiQWd1cyAoTWFuZG9yIFNlbnN1cykiLCJpYXQiOjE3NjM0NzU5OTIsImV4cCI6MTc2MzU2MjM5Mn0.KHa6ItgX7b_Hte9_kVSaXwYr4eX9vwENCU1MC7TSeF4
   ```

**Expected Result**:
- Status: `200 OK`
- Response: Dashboard overview with statistics

**curl Command**:
```bash
curl -X GET "http://localhost:3000/api/v1/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/dashboard" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9waWhhayI6ImEwZWViYzk5LTljMGItNGVmOC1iYjZkLTZiYjliZDM4MGExMSIsInJvbGUiOiJNQU5ET1IiLCJuYW1hX3BpaGFrIjoiQWd1cyAoTWFuZG9yIFNlbnN1cykiLCJpYXQiOjE3NjM0NzU5OTIsImV4cCI6MTc2MzU2MjM5Mn0.KHa6ItgX7b_Hte9_kVSaXwYr4eX9vwENCU1MC7TSeF4"
```

---

### Scenario 2: Mandor Eko Accesses Own Dashboard ✅ EXPECTED TO PASS

**Endpoint**: `GET /api/v1/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/dashboard`

**Postman Setup**:
1. Method: `GET`
2. URL: `http://localhost:3000/api/v1/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/dashboard`
3. Headers:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9waWhhayI6ImEwZWViYzk5LTljMGItNGVmOC1iYjZkLTZiYjliZDM4MGExMiIsInJvbGUiOiJNQU5ET1IiLCJuYW1hX3BpaGFrIjoiRWtvIChNYW5kb3IgQVBIKSIsImlhdCI6MTc2MzQ3NTk5MiwiZXhwIjoxNzYzNTYyMzkyfQ.iOzvbw37dhlI0-8U-aUShp4cNrxsWJ0_RIIHaYjwccs
   ```

**Expected Result**:
- Status: `200 OK`
- Response: Dashboard overview with statistics

---

### ⚠️ Scenario 3: SECURITY ISSUE - Mandor Agus Accesses Mandor Eko's Dashboard

**Endpoint**: `GET /api/v1/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/dashboard`  
**Using**: Agus's token (not Eko's)

**Postman Setup**:
1. Method: `GET`
2. URL: `http://localhost:3000/api/v1/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/dashboard` (Eko's UUID)
3. Headers:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9waWhhayI6ImEwZWViYzk5LTljMGItNGVmOC1iYjZkLTZiYjliZDM4MGExMSIsInJvbGUiOiJNQU5ET1IiLCJuYW1hX3BpaGFrIjoiQWd1cyAoTWFuZG9yIFNlbnN1cykiLCJpYXQiOjE3NjM0NzU5OTIsImV4cCI6MTc2MzU2MjM5Mn0.KHa6ItgX7b_Hte9_kVSaXwYr4eX9vwENCU1MC7TSeF4
   ```
   (Agus's token)

**Current Behavior**: ⚠️ **SECURITY ISSUE**
- Status: `200 OK` (SHOULD BE 403 FORBIDDEN)
- Mandor Agus can view Mandor Eko's private dashboard data

**Expected Behavior** (After Fix):
- Status: `403 Forbidden`
- Error: "Access denied: You can only access your own dashboard"

**Root Cause**: Missing data isolation check
- Current RBAC only checks `role='MANDOR'`
- Missing check: `req.user.id_pihak === req.params.mandor_id`

**Fix Required**: Add `checkMandorAccess` middleware (see Section: SECURITY FIX)

**📝 NOTE**: Meskipun ini security issue, dalam prakteknya dashboard mandor akan menampilkan SPK yang berbeda berdasarkan assignment. Mandor Agus yang akses dashboard Eko akan melihat SPK milik Eko (bukan milik Agus), jadi tidak ada data leak yang signifikan. Namun tetap sebaiknya ditambahkan authorization check untuk best practice.

---

### Scenario 4: Unauthorized Access (No Token) ✅ EXPECTED TO FAIL

**Endpoint**: `GET /api/v1/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/dashboard`  
**Headers**: None

**Expected Result**:
- Status: `401 Unauthorized`
- Error: "Access token missing"

---

### Scenario 5: Invalid Token ✅ EXPECTED TO FAIL

**Endpoint**: `GET /api/v1/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/dashboard`  
**Headers**:
```
Authorization: Bearer invalid_token_12345
```

**Expected Result**:
- Status: `401 Unauthorized`
- Error: "Invalid or expired token"

---

### Scenario 6: SPK List - Mandor Agus Filters Own SPKs ✅ EXPECTED TO PASS

**Endpoint**: `GET /api/v1/spk/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`

**Query Parameters**:
```
status=PENDING
priority=HIGH
page=1
limit=10
```

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9waGhhayI6ImEwZWViYzk5LTljMGItNGVmOC1iYjZkLTZiYjliZDM4MGExMSIsInJvbGUiOiJNQU5ET1IiLCJuYW1hX3BpaGFrIjoiQWd1cyAoTWFuZG9yIFNlbnN1cykiLCJpYXQiOjE3NjM0NzU5OTIsImV4cCI6MTc2MzU2MjM5Mn0.KHa6ItgX7b_Hte9_kVSaXwYr4eX9vwENCU1MC7TSeF4
```

**Expected Result**:
- Status: `200 OK`
- Response: List of SPKs assigned to Mandor Agus, filtered by status and priority
- **IMPORTANT**: SPK muncul di list jika ada minimal 1 tugas dengan `id_pelaksana = mandor_id`
- Mandor Agus bisa melihat SPK01A, SPK02B, SPK03C, dll yang punya tugas assigned ke dia
- Tidak peduli tipe tugas (APH, Sensus, Sanitasi) - semua SPK yang di-assign akan muncul

**Full URL**:
```
http://localhost:3000/api/v1/spk/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11?status=PENDING&priority=HIGH&page=1&limit=10
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "spk_list": [
      {
        "id_spk": "spk-uuid-01a",
        "nama_spk": "SPK01A - Validasi Drone Area D001",
        "status": "PENDING",
        "risk_level": "HIGH",
        "tasks_summary": {
          "total": 2,
          "pending": 2,
          "completed": 0
        }
      },
      {
        "id_spk": "spk-uuid-02b",
        "nama_spk": "SPK02B - APH Blok E002",
        "status": "PENDING",
        "risk_level": "HIGH",
        "tasks_summary": {
          "total": 1,
          "pending": 1,
          "completed": 0
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total_count": 2
    }
  }
}
```

---

### Scenario 7: Task Assignment - Mandor Eko Assigns Tasks ✅ EXPECTED TO PASS

**Endpoint**: `POST /api/v1/spk/:spk_id/assign-surveyor`

**Postman Setup**:
1. Method: `POST`
2. URL: `http://localhost:3000/api/v1/spk/123e4567-e89b-12d3-a456-426614174000/assign-surveyor`
3. Headers:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9waWhhayI6ImEwZWViYzk5LTljMGItNGVmOC1iYjZkLTZiYjliZDM4MGExMiIsInJvbGUiOiJNQU5ET1IiLCJuYW1hX3BpaGFrIjoiRWtvIChNYW5kb3IgQVBIKSIsImlhdCI6MTc2MzQ3NTk5MiwiZXhwIjoxNzYzNTYyMzkyfQ.iOzvbw37dhlI0-8U-aUShp4cNrxsWJ0_RIIHaYjwccs
   Content-Type: application/json
   ```
4. Body (JSON):
   ```json
   {
     "id_surveyor": "44444444-4444-4444-4444-444444444444",
     "task_ids": [
       "task-001",
       "task-002",
       "task-003"
     ]
   }
   ```

**Expected Result**:
- Status: `200 OK`
- Response: Confirmation of task assignment with updated SPK status

---

## 🔒 SECURITY FIX REQUIRED

### Issue: Data Isolation Not Enforced
Current mandor endpoints only check role (`MANDOR`), not ownership. This allows any mandor to access other mandors' data.

### Solution: Add Data Isolation Middleware

**File**: `middleware/authMiddleware.js`

```javascript
/**
 * Verify user can only access their own mandor data
 * Usage: Use after authenticateJWT and authorizeRole
 */
const checkMandorAccess = (req, res, next) => {
  const { mandor_id } = req.params;
  const { id_pihak, role } = req.user;
  
  // Admin and Asisten can access any mandor's data
  if (role === 'ADMIN' || role === 'ASISTEN') {
    return next();
  }
  
  // Mandor can only access their own data
  if (role === 'MANDOR') {
    if (id_pihak !== mandor_id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied: You can only access your own dashboard'
      });
    }
    return next();
  }
  
  // Other roles denied
  return res.status(403).json({
    status: 'error',
    message: 'Access denied: Insufficient permissions'
  });
};

module.exports = {
  authenticateJWT,
  authorizeRole,
  checkMandorAccess,  // NEW export
  generateToken
};
```

### Update Mandor Routes

**File**: `routes/mandorRoutes.js`

```javascript
const { 
  authenticateJWT, 
  authorizeRole, 
  checkMandorAccess  // NEW import
} = require('../middleware/authMiddleware');

// Protect all mandor endpoints with data isolation
router.get('/:mandor_id/dashboard', 
  authenticateJWT,
  authorizeRole(['MANDOR', 'ASISTEN', 'ADMIN']),
  checkMandorAccess,  // NEW: Verify ownership
  async (req, res) => {
    // ... existing code
  }
);

router.get('/:mandor_id/surveyors', 
  authenticateJWT,
  authorizeRole(['MANDOR', 'ASISTEN', 'ADMIN']),
  checkMandorAccess,  // NEW: Verify ownership
  async (req, res) => {
    // ... existing code
  }
);

router.get('/:mandor_id/tasks/realtime', 
  authenticateJWT,
  authorizeRole(['MANDOR', 'ASISTEN', 'ADMIN']),
  checkMandorAccess,  // NEW: Verify ownership
  async (req, res) => {
    // ... existing code
  }
);

router.get('/:mandor_id/performance/daily', 
  authenticateJWT,
  authorizeRole(['MANDOR', 'ASISTEN', 'ADMIN']),
  checkMandorAccess,  // NEW: Verify ownership
  async (req, res) => {
    // ... existing code
  }
);
```

### Verify Fix

After implementing the fix, re-test **Scenario 3**:
- Mandor Agus tries to access Mandor Eko's dashboard
- Expected: `403 Forbidden`
- Message: "Access denied: You can only access your own dashboard"

---

## 📊 RBAC PERMISSION MATRIX

| Role      | Own Dashboard | Other Mandor's Dashboard | SPK List (Own) | SPK List (All) | Assign Tasks |
|-----------|---------------|--------------------------|----------------|----------------|--------------|
| MANDOR    | ✅ Yes        | ❌ No (403)              | ✅ Yes         | ❌ No          | ✅ Yes       |
| ASISTEN   | ✅ Yes        | ✅ Yes                   | ✅ Yes         | ✅ Yes         | ✅ Yes       |
| ADMIN     | ✅ Yes        | ✅ Yes                   | ✅ Yes         | ✅ Yes         | ✅ Yes       |
| PELAKSANA | ❌ No         | ❌ No                    | ❌ No          | ❌ No          | ❌ No        |

---

## 🛠️ TROUBLESHOOTING

### Issue: "Access token missing"
- **Cause**: No Authorization header
- **Fix**: Add header `Authorization: Bearer <token>`

### Issue: "Invalid or expired token"
- **Cause**: Token expired (24h) or malformed
- **Fix**: Regenerate token with `node generate-mandor-tokens.js`

### Issue: "Insufficient permissions"
- **Cause**: Wrong role in JWT payload
- **Fix**: Verify token payload with jwt.io, ensure `role='MANDOR'`

### Issue: No data returned (200 OK but empty array)
- **Cause**: No SPKs or tasks assigned to that mandor in database
- **Fix**: Check database with `SELECT * FROM spk WHERE id_mandor = '<uuid>'`

### Issue: 500 Internal Server Error
- **Cause**: Database connection issue or missing environment variables
- **Fix**: 
  1. Check `.env` has `JWT_SECRET` and `SUPABASE_URL`
  2. Verify server is running: `node index.js`
  3. Check logs in terminal

---

## 📚 RELATED DOCUMENTATION

- `docs/API_MANDOR_DASHBOARD_GUIDE.md` - Complete frontend integration guide (v1.1.0)
- `docs/API_SPK_VALIDASI_DRONE_GUIDE.md` - SPK Management API specification
- `docs/VERIFICATION_RBAC_FASE1.md` - RBAC implementation verification (Nov 7, 2025)
- `docs/VERIFICATION_RBAC_FASE2.md` - Dashboard RBAC verification (Nov 7, 2025)

---

## 🎯 QUICK START TESTING

1. **Start Server**:
   ```bash
   node index.js
   ```

2. **Verify Mandor Users**:
   ```bash
   node check-mandor-users.js
   ```

3. **Generate Fresh Tokens**:
   ```bash
   node generate-mandor-tokens.js
   ```

4. **Test in Postman**:
   - Import endpoints from this guide
   - Use tokens from Step 3
   - Follow Scenario 1-7 test cases

5. **Verify RBAC Works**:
   - Scenario 1 & 2 should pass (200 OK)
   - Scenario 3 should FAIL (currently passes - security issue)
   - Scenario 4 & 5 should fail (401 Unauthorized)

---

## ✅ VERIFICATION CHECKLIST

- [ ] Both mandor users found in database (Agus & Eko)
- [ ] JWT tokens generated successfully
- [ ] Scenario 1: Agus accesses own dashboard (200 OK)
- [ ] Scenario 2: Eko accesses own dashboard (200 OK)
- [ ] Scenario 3: Agus CANNOT access Eko's dashboard (403 Forbidden) - **REQUIRES FIX**
- [ ] Scenario 4: No token results in 401 Unauthorized
- [ ] Scenario 5: Invalid token results in 401 Unauthorized
- [ ] Scenario 6: SPK filtering works correctly
- [ ] Scenario 7: Task assignment works correctly

---

**Generated**: January 2025  
**Author**: GitHub Copilot  
**Version**: 1.0.0  
**Status**: Ready for testing (Security fix required for data isolation)
