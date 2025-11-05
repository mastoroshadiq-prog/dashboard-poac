# TESTING GUIDE - API Dashboard KPI Eksekutif

## 🎯 Tujuan
Panduan testing untuk endpoint `GET /api/v1/dashboard/kpi_eksekutif`

## ✅ Pre-requisites

1. **Server running:**
   ```bash
   npm run dev
   ```

2. **Environment configured:**
   - File `.env` sudah dibuat dan diisi
   - Supabase connection berhasil (test via `/health`)

3. **Dummy data inserted:**
   - Run `dummy_data_v1_2.sql` di Supabase SQL Editor

## 🧪 Test Scenarios

### Test 1: Health Check

**Command:**
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server healthy",
  "database": "Connected",
  "timestamp": "2025-11-05T12:34:56.789Z"
}
```

**Status Code:** `200 OK`

---

### Test 2: Basic KPI Request (No Filters)

**Command:**
```bash
curl http://localhost:3000/api/v1/dashboard/kpi_eksekutif
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "kri_lead_time_aph": 2.0,
    "kri_kepatuhan_sop": 75.0,
    "tren_insidensi_baru": [
      {
        "date": "2025-10-28",
        "count": 1
      }
    ],
    "tren_g4_aktif": 2,
    "generated_at": "2025-11-05T12:34:56.789Z",
    "filters": {}
  },
  "message": "Data KPI Eksekutif berhasil diambil"
}
```

**Status Code:** `200 OK`

**Validation Points:**
- ✅ `kri_lead_time_aph` adalah number (float)
- ✅ `kri_kepatuhan_sop` adalah number 0-100 (percentage)
- ✅ `tren_insidensi_baru` adalah array
- ✅ `tren_g4_aktif` adalah number (integer)

---

### Test 3: With Estate Filter

**Command:**
```bash
curl "http://localhost:3000/api/v1/dashboard/kpi_eksekutif?estate=EST001"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "kri_lead_time_aph": 2.0,
    "kri_kepatuhan_sop": 75.0,
    "tren_insidensi_baru": [...],
    "tren_g4_aktif": 2,
    "generated_at": "2025-11-05T12:34:56.789Z",
    "filters": {
      "estate": "EST001"
    }
  },
  "message": "Data KPI Eksekutif berhasil diambil"
}
```

**Status Code:** `200 OK`

---

### Test 4: With Date Range

**Command:**
```bash
curl "http://localhost:3000/api/v1/dashboard/kpi_eksekutif?date_from=2025-10-01&date_to=2025-11-05"
```

**Expected Response:**
Similar to Test 2, but with filters applied:
```json
{
  "success": true,
  "data": {
    ...
    "filters": {
      "date_from": "2025-10-01T00:00:00.000Z",
      "date_to": "2025-11-05T00:00:00.000Z"
    }
  },
  "message": "Data KPI Eksekutif berhasil diambil"
}
```

**Status Code:** `200 OK`

---

### Test 5: Invalid Estate Parameter

**Command:**
```bash
curl "http://localhost:3000/api/v1/dashboard/kpi_eksekutif?estate=INVALID@CHARS!"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Invalid estate parameter format",
  "message": "Parameter estate harus alphanumeric (max 50 karakter)"
}
```

**Status Code:** `400 Bad Request`

**Validation:** Server-side validation bekerja dengan benar

---

### Test 6: Invalid Date Format

**Command:**
```bash
curl "http://localhost:3000/api/v1/dashboard/kpi_eksekutif?date_from=invalid-date"
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Invalid date_from parameter",
  "message": "Parameter date_from harus format ISO 8601 (YYYY-MM-DD)"
}
```

**Status Code:** `400 Bad Request`

---

### Test 7: 404 Not Found

**Command:**
```bash
curl http://localhost:3000/api/v1/dashboard/tidak-ada
```

**Expected Response:**
```json
{
  "success": false,
  "error": "Endpoint not found",
  "message": "Endpoint GET /api/v1/dashboard/tidak-ada tidak ditemukan"
}
```

**Status Code:** `404 Not Found`

---

## 🔍 Manual Verification

### 1. Verify KRI Lead Time APH

**SQL Query di Supabase:**
```sql
WITH g1_detections AS (
  SELECT 
    id_npokok,
    timestamp_eksekusi as detected_at
  FROM log_aktivitas_5w1h
  WHERE hasil_json->>'status_aktual' = 'G1 (Ganoderma Awal)'
),
aph_executions AS (
  SELECT 
    id_npokok,
    timestamp_eksekusi as executed_at
  FROM log_aktivitas_5w1h
  WHERE hasil_json->>'tipe_aplikasi' = 'APH'
)
SELECT 
  g1.id_npokok,
  g1.detected_at,
  aph.executed_at,
  EXTRACT(EPOCH FROM (aph.executed_at - g1.detected_at)) / 86400 as days_diff
FROM g1_detections g1
INNER JOIN aph_executions aph ON g1.id_npokok = aph.id_npokok
WHERE aph.executed_at > g1.detected_at;
```

**Expected Result:** Should show ~2.0 days difference

---

### 2. Verify KRI Kepatuhan SOP

**SQL Query di Supabase:**
```sql
SELECT 
  status_tugas,
  COUNT(*) as count
FROM spk_tugas
WHERE status_tugas IN ('SELESAI', 'DIKERJAKAN')
GROUP BY status_tugas;
```

**Expected Result:**
```
status_tugas | count
-------------|------
SELESAI      | 3
DIKERJAKAN   | 1
```

**Calculation:** 3 / (3 + 1) = 75.0%

---

### 3. Verify Tren Insidensi G1

**SQL Query di Supabase:**
```sql
SELECT 
  DATE(timestamp_eksekusi) as date,
  COUNT(*) as count
FROM log_aktivitas_5w1h
WHERE hasil_json->>'status_aktual' = 'G1 (Ganoderma Awal)'
  AND timestamp_eksekusi >= NOW() - INTERVAL '30 days'
GROUP BY DATE(timestamp_eksekusi)
ORDER BY date;
```

**Expected Result:** Should show daily counts

---

### 4. Verify G4 Aktif

**SQL Query di Supabase:**
```sql
SELECT COUNT(*) 
FROM spk_tugas
WHERE tipe_tugas = 'SANITASI'
  AND status_tugas IN ('BARU', 'DIKERJAKAN');
```

**Expected Result:** `2`

---

## 🐛 Common Issues & Solutions

### Issue 1: All values are 0 or empty array

**Cause:** Dummy data not inserted

**Solution:**
1. Open Supabase SQL Editor
2. Run `dummy_data_v1_2.sql`
3. Verify dengan manual queries di atas

---

### Issue 2: Database connection failed

**Cause:** Invalid credentials in `.env`

**Solution:**
1. Check `SUPABASE_URL` dan `SUPABASE_KEY`
2. Get correct values from Supabase Dashboard → Settings → API
3. Restart server: `npm run dev`

---

### Issue 3: CORS error from browser

**Cause:** Frontend di domain berbeda

**Solution:**
1. Update `.env`: `CORS_ORIGIN=https://your-dashboard-domain.com`
2. Restart server

---

## ✅ Test Checklist

Sebelum deploy ke production:

- [ ] Health check returns "Connected"
- [ ] KPI endpoint returns correct data structure
- [ ] All 4 KPI/KRI values are calculated correctly
- [ ] Server-side validation works (invalid params return 400)
- [ ] 404 handler works for unknown endpoints
- [ ] Error logging visible in console
- [ ] Response time < 2 seconds
- [ ] No sensitive data in response (no credentials)

---

## 📊 Performance Benchmark

**Expected Response Times:**

| Endpoint | Expected Time | Max Acceptable |
|----------|--------------|----------------|
| `/health` | < 100ms | 500ms |
| `/api/v1/dashboard/kpi_eksekutif` | < 1s | 2s |

**Test Command:**
```bash
# Measure response time
curl -w "\nTime: %{time_total}s\n" http://localhost:3000/api/v1/dashboard/kpi_eksekutif
```

---

*Testing guide ini mengikuti Filosofi TEPAT: Data harus akurat dan tervalidasi*
