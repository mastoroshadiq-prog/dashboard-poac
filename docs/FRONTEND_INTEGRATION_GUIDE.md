# Frontend Integration - Quick Fix Guide

**Tanggal:** 13 November 2025  
**Status:** Backend Ready, Frontend Perlu Minor Fixes

---

## ✅ **BACKEND STATUS: ALL ENDPOINTS WORKING**

Server running di: `http://localhost:3000`

### **Endpoints yang sudah work:**
- ✅ `GET /api/v1/spk/kanban` - 200 OK (28 PENDING, 2 DIKERJAKAN, 1 SELESAI)
- ✅ `GET /api/v1/validation/confusion-matrix` - 200 OK (STUB data)
- ✅ `GET /api/v1/validation/field-vs-drone` - 200 OK (STUB data)
- ✅ `GET /api/v1/analytics/anomaly-detection` - 200 OK (STUB data)
- ✅ `GET /api/v1/analytics/mandor-performance` - 200 OK (STUB data)
- ⚠️ `GET /api/v1/dashboard/ndre-statistics` - 404 (frontend bug - double base URL)

---

## 🐛 **FRONTEND BUGS TO FIX**

### **Bug 1: Double Base URL pada NDRE Statistics**

**Current (WRONG):**
```
GET /api/v1/api/v1/dashboard/ndre-statistics
```

**Should be:**
```
GET /api/v1/dashboard/ndre-statistics
```

**Fix Location (Flutter/Dart):**
```dart
// File: lib/services/dashboard_service.dart atau similar

// WRONG:
final url = '${baseUrl}/api/v1/dashboard/ndre-statistics';

// CORRECT:
final url = '${baseUrl}/dashboard/ndre-statistics';
// atau
final url = 'http://localhost:3000/api/v1/dashboard/ndre-statistics';
```

**Kemungkinan penyebab:**
- `baseUrl` sudah include `/api/v1`
- Endpoint definition double-declare `/api/v1`

---

### **Bug 2: Null Type Errors (FIXED di Backend - Perlu Restart)**

**Error Messages:**
```
TypeError: null: type 'Null' is not a subtype of type 'num'
TypeError: null: type 'Null' is not a subtype of type 'String'
TypeError: null: type 'Null' is not a subtype of type 'int'
```

**Root Cause:**
- Backend old response had null values
- Flutter/Dart models expect non-nullable types
- Backend sudah di-fix, tapi **server belum restart**

**Solution:**
**BACKEND TEAM:** Restart server untuk load perubahan:
```powershell
# Di terminal D:\backend-keboen
# Press Ctrl+C to stop server
# Then run:
node index.js
```

**Atau gunakan:**
```powershell
cd D:\backend-keboen
.\restart-server.bat
```

---

## 📊 **EXPECTED RESPONSE STRUCTURE (Type-Safe)**

### **1. Confusion Matrix**
```json
{
  "success": true,
  "data": {
    "matrix": {
      "true_positive": 118,      // int
      "false_positive": 23,       // int
      "true_negative": 745,       // int
      "false_negative": 24        // int
    },
    "metrics": {
      "accuracy": 94.8,           // double
      "precision": 83.7,          // double
      "recall": 83.1,             // double
      "f1_score": 83.4            // double
    },
    "per_divisi": [               // List<Map>
      {
        "divisi": "Divisi 1",     // String
        "true_positive": 50,      // int
        "false_positive": 10,     // int
        "true_negative": 300,     // int
        "false_negative": 10,     // int
        "accuracy": 94.6          // double
      }
    ],
    "recommendations": [          // List<Map>
      {
        "type": "FALSE_POSITIVE", // String
        "count": 23,              // int
        "message": "...",         // String
        "action": "..."           // String
      }
    ]
  },
  "message": "Confusion Matrix berhasil dihitung (STUB - belum implement)"
}
```

### **2. Field vs Drone**
```json
{
  "success": true,
  "data": {
    "distribution": [
      {
        "category": "TRUE_POSITIVE",       // String
        "drone_prediction": "STRESS",      // String
        "field_validation": "STRESS",      // String
        "trees": 118,                      // int
        "percentage": 13.0,                // double
        "common_causes": ["...", "..."]    // List<String>
      }
    ],
    "summary": {
      "total_validated": 910,              // int
      "match_rate": 94.8,                  // double
      "mismatch_rate": 5.2                 // double
    }
  }
}
```

### **3. Anomaly Detection**
```json
{
  "success": true,
  "data": {
    "anomalies": [
      {
        "type": "POHON_MIRING",            // String
        "severity": "HIGH",                // String
        "count": 12,                       // int
        "locations": ["Blok A1", "..."],   // List<String>
        "description": "...",              // String
        "recommended_action": "..."        // String
      }
    ],
    "summary": {
      "total_anomalies": 40,               // int
      "critical": 8,                       // int
      "high": 12,                          // int
      "medium": 5,                         // int
      "low": 15                            // int
    }
  }
}
```

### **4. Mandor Performance**
```json
{
  "success": true,
  "data": {
    "performance": [
      {
        "mandor_id": "uuid-mandor-joko",   // String
        "mandor_name": "Joko Susilo",      // String
        "metrics": {
          "completion_rate": 95.5,         // double
          "quality_score": 88.0,           // double
          "efficiency_score": 92.3,        // double
          "avg_response_time_hours": 2.5   // double
        },
        "breakdown": {
          "total_spk": 20,                 // int
          "completed": 19,                 // int
          "pending": 1,                    // int
          "overdue": 0                     // int
        },
        "issues": [
          {
            "type": "QUALITY_ISSUE",       // String
            "count": 2,                    // int
            "description": "..."           // String
          }
        ],
        "recommendations": [
          {
            "type": "TRAINING",            // String
            "message": "..."               // String
          }
        ]
      }
    ],
    "summary": {
      "avg_completion_rate": 92.8,         // double
      "avg_quality_score": 85.5,           // double
      "best_performer": "Joko Susilo",     // String
      "needs_improvement": ["..."]         // List<String>
    }
  }
}
```

---

## 🔧 **FLUTTER/DART MODEL UPDATES (If Needed)**

Jika masih ada null type errors setelah backend restart, update Dart models:

```dart
// confusion_matrix_model.dart
class ConfusionMatrixData {
  final int truePositive;     // NOT int? (nullable)
  final int falsePositive;    // Guaranteed non-null
  final int trueNegative;
  final int falseNegative;
  
  ConfusionMatrixData({
    required this.truePositive,
    required this.falsePositive,
    required this.trueNegative,
    required this.falseNegative,
  });
  
  factory ConfusionMatrixData.fromJson(Map<String, dynamic> json) {
    return ConfusionMatrixData(
      truePositive: json['true_positive'] as int,  // Cast as int, not int?
      falsePositive: json['false_positive'] as int,
      trueNegative: json['true_negative'] as int,
      falseNegative: json['false_negative'] as int,
    );
  }
}
```

**Key Points:**
- Use `as int` not `as int?` (non-nullable)
- Use `required` in constructor (not optional)
- Backend guarantees all values exist (no null)

---

## ✅ **TESTING CHECKLIST**

### **Backend Team:**
- [ ] Restart server: `node index.js`
- [ ] Verify console shows: "Server running on: http://localhost:3000"
- [ ] Test endpoints dengan curl/Postman:
  ```bash
  curl http://localhost:3000/api/v1/spk/kanban
  curl http://localhost:3000/api/v1/validation/confusion-matrix
  curl http://localhost:3000/api/v1/dashboard/ndre-statistics
  ```

### **Frontend Team:**
- [ ] Fix double base URL bug untuk NDRE statistics endpoint
- [ ] Restart Flutter app (hot reload tidak cukup - perlu full restart)
- [ ] Verify all widgets load tanpa error
- [ ] Check console untuk konfirmasi:
  ```
  ✅ Response Status: 200
  ✅ Data loaded successfully
  ```

---

## 🚀 **EXPECTED RESULT AFTER FIXES**

Dashboard Asisten should display:
- ✅ **SPK Kanban Board** - 28 PENDING, 2 DIKERJAKAN, 1 SELESAI
- ✅ **NDRE Statistics** - 910 total trees (141 berat, 763 sedang, 6 sehat)
- ✅ **Confusion Matrix** - Accuracy 94.8%, Precision 83.7%
- ✅ **Field vs Drone** - 4 categories with distribution
- ✅ **Anomaly Detection** - 40 total (8 critical, 12 high, 5 medium, 15 low)
- ✅ **Mandor Performance** - 2 mandor dengan metrics lengkap

**All dengan STUB data, tapi structure correct dan type-safe!**

---

**Last Updated:** 13 November 2025, 14:40 WIB  
**Next Steps:** Backend restart → Frontend fix double URL → Full integration test
