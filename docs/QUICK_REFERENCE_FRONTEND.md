# 🎯 Quick Reference - Backend Endpoints (Frontend Team)

**Status:** ✅ READY | **Date:** 13 Nov 2025, 15:30 WIB | **Server:** http://localhost:3000

---

## ✅ All Endpoints Tested & Working

| # | Endpoint | Method | Status | Key Data |
|---|----------|--------|--------|----------|
| 0 | `/health` OR `/api/v1/health` | GET | ✅ 200 | Server healthy, database connected |
| 1 | `/api/v1/spk/kanban` | GET | ✅ 200 | 28 PENDING + 2 DIKERJAKAN + 1 SELESAI |
| 2 | `/api/v1/validation/confusion-matrix` | GET | ✅ 200 | per_divisi: 2 entries (NOT empty) |
| 3 | `/api/v1/validation/field-vs-drone` | GET | ✅ 200 | 4 categories, 910 trees validated |
| 4 | `/api/v1/analytics/anomaly-detection` | GET | ✅ 200 | 40 anomalies (8 critical, 12 high) |
| 5 | `/api/v1/analytics/mandor-performance` | GET | ✅ 200 | 2 mandor with metrics |
| 6 | `/api/v1/dashboard/ndre-statistics` | GET | ✅ 200 | 910 trees (141 berat, 763 sedang, 6 sehat) |

**Auth Required:** ❌ NO (disabled for testing)  
**Null Type Errors:** ✅ ZERO

---

## 🚀 Quick Test Commands

```bash
# Test health check (both URLs work):
curl http://localhost:3000/health
curl http://localhost:3000/api/v1/health

# Test all endpoints:
curl http://localhost:3000/api/v1/spk/kanban
curl http://localhost:3000/api/v1/validation/confusion-matrix
curl http://localhost:3000/api/v1/validation/field-vs-drone
curl http://localhost:3000/api/v1/analytics/anomaly-detection
curl http://localhost:3000/api/v1/analytics/mandor-performance
curl http://localhost:3000/api/v1/dashboard/ndre-statistics
```

---

## ⚠️ Common Frontend Bugs (FIX THESE!)

### 1. Double Base URL → 404 Error
```dart
// ❌ WRONG:
final url = '$baseUrl/api/v1/dashboard/ndre-statistics';
// Result: /api/v1/api/v1/dashboard/ndre-statistics (404!)

// ✅ CORRECT:
final url = '$baseUrl/dashboard/ndre-statistics';
// Result: /api/v1/dashboard/ndre-statistics ✅
```

### 2. Wrong Dart Type → Type Error
```dart
// ❌ WRONG:
final int? truePositive = json['true_positive'];  // Use int? (nullable)

// ✅ CORRECT:
final int truePositive = json['true_positive'] as int;  // NON-NULLABLE
```

### 3. Not Restarting App → Cached Data
```bash
# ❌ WRONG: Hot reload (F5)
# ✅ CORRECT: Full restart
flutter clean && flutter pub get && flutter run
```

---

## 📋 Response Type Reference

### Confusion Matrix
```json
{
  "data": {
    "matrix": { 
      "true_positive": 118,      // int (NOT int?)
      "false_positive": 23       // int (NOT int?)
    },
    "metrics": {
      "accuracy": 94.8,          // double (NOT double?)
      "precision": 83.7          // double (NOT double?)
    },
    "per_divisi": [              // Array (NOT empty!)
      {
        "divisi": "Divisi 1",    // String (NOT String?)
        "true_positive": 50,     // int
        "accuracy": 94.6         // double
      }
    ]
  }
}
```

### NDRE Statistics
```json
{
  "data": {
    "total_trees": 910,          // int
    "distribution": {
      "stres_berat": 141,        // int
      "stres_sedang": 763,       // int
      "sehat": 6                 // int
    },
    "percentage": {
      "stres_berat": 15.49,      // double
      "stres_sedang": 83.85,     // double
      "sehat": 0.66              // double
    }
  }
}
```

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| **Connection refused** | Check server: `Get-Process node` |
| **404 Not Found** | Fix double `/api/v1` in URL |
| **Null type error** | Full restart app + check Dart model types |
| **Type mismatch** | Use `as int` (not `as int?`) for required fields |

---

## ✅ Backend Verification Proof

**Server Status:** RUNNING ✅  
**Processes Killed:** 5 zombie nodes cleared  
**Code Version:** Latest (all null-type fixes applied)  
**Tests Passed:** 6/6 (100%)  

**Test Results:** See `TESTING_RESULTS_ENDPOINT_VERIFICATION.md` for full details.

---

**🎯 Backend READY - No Excuses!**
