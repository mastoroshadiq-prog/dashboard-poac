# Dashboard 4-Tier: API Endpoints Mapping

**Document Version:** 1.0.0  
**Date:** November 13, 2025  
**Purpose:** Complete mapping of API endpoints to dashboard tiers

---

## Overview

Dokumen ini memetakan **semua API endpoints** ke **4 dashboard tiers** berdasarkan:
- Role yang mengakses
- Use case & context
- Data granularity level
- Action permissions

---

## API Endpoint Categories

### 1. Existing Endpoints (Complete - Point 1-6)
### 2. New Endpoints Required (Confusion Matrix, Analytics)
### 3. Enhancement Needed (Additional filters, metrics)

---

## TIER 1: Corporate Dashboard

**Target Users:** Direktur Utama, Direktur Operasional, GM Multi-Estate  
**URL:** `/api/v1/dashboard/corporate`

### Endpoints

| Endpoint | Method | Status | Purpose | Data Level |
|----------|--------|--------|---------|------------|
| `/dashboard/corporate` | GET | ⏳ NEW | Aggregated business metrics | Estate-level |
| `/dashboard/corporate/financial` | GET | ⏳ NEW | Revenue, cost, ROI | Estate-level |
| `/dashboard/corporate/production` | GET | ⏳ NEW | Production trend (YoY, MoM) | Estate-level |
| `/analytics/roi` | GET | ⏳ NEW | ROI per investment (drone, mech) | Multi-estate |
| `/analytics/market-trend` | GET | ⏳ NEW | CPO price, forecast | Market-level |
| `/lifecycle/overview` | GET | ✅ Existing | Lifecycle phase summary | Estate-level |

### Response Structure Example

```javascript
GET /api/v1/dashboard/corporate

Response:
{
  "success": true,
  "data": {
    "summary": {
      "total_production_ton": 15240,
      "production_growth_yoy": 0.12,  // +12%
      "cost_per_kg": 4200,
      "target_cost_per_kg": 4500,
      "cost_efficiency": 0.93,  // 93% of target (better)
      "revenue_ytd": 305000000000,  // Rp 305M
      "ebitda_margin": 0.28  // 28%
    },
    "compliance": {
      "rspo_score": 0.94,
      "ispo_score": 0.96,
      "sustainability_grade": "A"
    },
    "investments": [
      {
        "name": "Drone Technology",
        "cost": 500000000,  // Rp 500jt
        "roi": 0.18,  // 18%
        "payback_period_months": 14
      }
    ],
    "trend": {
      "last_6_months": [
        { "month": "May 2025", "production": 2400, "cost": 4250 },
        { "month": "June 2025", "production": 2550, "cost": 4200 }
      ]
    }
  },
  "timestamp": "2025-11-13T08:00:00Z"
}
```

---

## TIER 2: Manager Dashboard

**Target Users:** Estate Manager, Deputy Manager, Kepala Kebun  
**URL:** `/api/v1/dashboard/manager`

### Endpoints

| Endpoint | Method | Status | Purpose | Data Level |
|----------|--------|--------|---------|------------|
| `/dashboard/manager` | GET | ⏳ RENAME | Estate KPI, afdeling comparison | Afdeling-level |
| `/dashboard/manager/production` | GET | ⏳ NEW | Productivity per afdeling | Afdeling-level |
| `/dashboard/manager/labor` | GET | ⏳ NEW | Labor cost & efficiency | Afdeling-level |
| `/dashboard/manager/quality` | GET | ⏳ NEW | TBS quality metrics | Afdeling-level |
| `/dashboard/manager/sop-compliance` | GET | ⏳ NEW | SOP adherence per divisi | Divisi-level |
| `/lifecycle/phase/:name` | GET | ✅ Existing | Specific phase metrics | Phase-level |

### Response Structure Example

```javascript
GET /api/v1/dashboard/manager

Response:
{
  "success": true,
  "data": {
    "estate_summary": {
      "total_area_ha": 2500,
      "productive_area_ha": 2200,
      "avg_productivity_ton_per_ha": 20.5,
      "total_phl": 450,
      "labor_ratio": 5.5  // PHL per productive ha
    },
    "per_afdeling": [
      {
        "afdeling": "Afdeling 1",
        "area_ha": 500,
        "production_ton": 11250,
        "productivity_ton_per_ha": 22.5,
        "labor_cost_per_kg": 1100,
        "sop_compliance_pct": 0.92,
        "status": "above_target"
      },
      {
        "afdeling": "Afdeling 2",
        "area_ha": 480,
        "production_ton": 9120,
        "productivity_ton_per_ha": 19.0,
        "labor_cost_per_kg": 1200,
        "sop_compliance_pct": 0.87,
        "status": "below_target"
      }
    ],
    "quality_metrics": {
      "avg_brondolan_pct": 4.2,  // Target: < 5%
      "matang_panen_pct": 0.92,  // Target: > 90%
      "tbs_rejected_pct": 0.03   // Target: < 5%
    }
  }
}
```

---

## TIER 3: Asisten Dashboard ⭐ (MOST IMPORTANT)

**Target Users:** Asisten Manager, Kepala Afdeling, Asisten Afdeling  
**URL:** `/api/v1/dashboard/asisten`

### A. Existing Endpoints (From Point 1-5)

| Endpoint | Method | Status | Purpose | Data Level |
|----------|--------|--------|---------|------------|
| **Drone NDRE (Point 1)** |
| `/drone/ndre` | GET | ✅ Complete | List trees dengan NDRE data | Tree-level |
| `/drone/ndre/statistics` | GET | ✅ Complete | Aggregated NDRE stats | Estate/Divisi |
| `/drone/ndre/filters` | GET | ✅ Complete | Available filter values | - |
| `/drone/ndre/tree/:id` | GET | ✅ Complete | Single tree detail | Tree-level |
| **SPK Validasi (Point 2-3)** |
| `/spk/validasi-drone` | POST | ✅ Complete | Create SPK for validation | - |
| `/spk/mandor/:id` | GET | ✅ Complete | List SPK for mandor | SPK-level |
| `/spk/:id` | GET | ✅ Complete | SPK detail with tasks | SPK-level |
| `/spk/:id/assign-surveyor` | POST | ✅ Complete | Assign tasks to surveyor | Task-level |
| **OPS SPK (Point 5)** |
| `/ops/fase` | GET | ✅ Complete | List lifecycle phases | Phase-level |
| `/ops/fase/:id/sub-tindakan` | GET | ✅ Complete | Sub-actions per phase | Sub-action-level |
| `/ops/sub-tindakan/:id/jadwal` | GET | ✅ Complete | Schedules for sub-action | Schedule-level |
| `/ops/spk/create` | POST | ✅ Complete | Create OPS SPK | - |
| `/ops/spk` | GET | ✅ Complete | List OPS SPK (with filters) | SPK-level |
| `/ops/spk/:id/status` | PUT | ✅ Complete | Update SPK status | SPK-level |

### B. New Endpoints Required (Priority)

| Endpoint | Method | Priority | Purpose | Data Level |
|----------|--------|----------|---------|------------|
| **Confusion Matrix & Validation** |
| `/validation/confusion-matrix` | GET | 🔴 HIGH | TP/FP/TN/FN metrics | Estate/Divisi/Blok |
| `/validation/field-vs-drone` | GET | 🔴 HIGH | Distribution analysis | Tree-level |
| `/validation/:id/override` | PUT | 🟡 MEDIUM | Manual correction | Tree-level |
| `/audit/validation-overrides` | GET | 🟢 LOW | Audit trail | Log-level |
| **Anomaly Detection** |
| `/analytics/anomaly-detection` | GET | 🔴 HIGH | Detect operational issues | Tree/Blok-level |
| `/analytics/anomaly/:type` | GET | 🟡 MEDIUM | Specific anomaly type | Tree-level |
| **Performance & Analytics** |
| `/analytics/mandor-performance` | GET | 🔴 HIGH | Mandor KPI tracking | Mandor-level |
| `/analytics/surveyor-workload` | GET | 🟡 MEDIUM | Workload distribution | Surveyor-level |
| **Configuration** |
| `/config/ndre-threshold` | GET | 🟡 MEDIUM | Get current thresholds | Divisi/Blok |
| `/config/ndre-threshold` | PUT | 🟡 MEDIUM | Adjust thresholds | Divisi/Blok |

### C. Detailed Endpoint Specifications

#### 1. GET `/api/v1/validation/confusion-matrix`

**Purpose:** Calculate drone accuracy metrics (TP/FP/TN/FN)

**Query Parameters:**
```javascript
{
  "divisi": "Divisi 1",        // Optional: Filter by divisi
  "blok": "A5",                // Optional: Filter by blok
  "date_range": {              // Optional: Time period
    "start": "2025-11-01",
    "end": "2025-11-13"
  }
}
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "summary": {
      "total_validated": 910,
      "validation_date_range": {
        "start": "2025-11-01",
        "end": "2025-11-13"
      }
    },
    "matrix": {
      "true_positive": 118,      // Drone: stres, Field: stres ✅
      "false_positive": 23,      // Drone: stres, Field: sehat ❌
      "true_negative": 745,      // Drone: sehat, Field: sehat ✅
      "false_negative": 24       // Drone: sehat, Field: stres ❌
    },
    "metrics": {
      "accuracy": 0.948,         // (TP+TN) / Total
      "precision": 0.837,        // TP / (TP+FP)
      "recall": 0.831,           // TP / (TP+FN)
      "f1_score": 0.834,         // Harmonic mean
      "fpr": 0.025,              // FP / (FP+TN)
      "fnr": 0.169               // FN / (TP+FN)
    },
    "per_divisi": [
      {
        "divisi": "Divisi 1",
        "accuracy": 0.92,
        "precision": 0.85,
        "total_trees": 350,
        "blok_terburuk": {
          "blok": "A5",
          "accuracy": 0.62,
          "issue": "High false positive rate"
        }
      }
    ],
    "recommendations": [
      "Adjust NDRE threshold untuk Blok A5 dari 0.30 → 0.25",
      "Recalibrate drone sensor (FN rate 16.9% > target 10%)",
      "Review validation SOP dengan Mandor Joko (low accuracy)"
    ]
  }
}
```

**Implementation Notes:**
```javascript
// services/validationService.js
async function getConfusionMatrix(filters) {
  // 1. Get all validated trees (with both drone NDRE + field actual)
  const validatedTrees = await supabase
    .from('spk_tugas')
    .select(`
      id_tugas,
      tree_data,
      status_tugas,
      kebun_observasi!inner (
        id_npokok,
        ndre_value,
        stress_level
      )
    `)
    .eq('status_tugas', 'SELESAI')
    .not('tree_data->field_actual', 'is', null);

  // 2. Classify each tree into TP/FP/TN/FN
  const matrix = { tp: 0, fp: 0, tn: 0, fn: 0 };
  
  validatedTrees.forEach(tree => {
    const dronePrediction = tree.kebun_observasi.stress_level;
    const fieldActual = tree.tree_data.field_actual;
    
    if (dronePrediction === 'Stres Berat' && fieldActual === 'Stres Berat') {
      matrix.tp++;
    } else if (dronePrediction === 'Stres Berat' && fieldActual !== 'Stres Berat') {
      matrix.fp++;
    } else if (dronePrediction !== 'Stres Berat' && fieldActual !== 'Stres Berat') {
      matrix.tn++;
    } else {
      matrix.fn++;
    }
  });

  // 3. Calculate metrics
  const total = matrix.tp + matrix.fp + matrix.tn + matrix.fn;
  const metrics = {
    accuracy: (matrix.tp + matrix.tn) / total,
    precision: matrix.tp / (matrix.tp + matrix.fp),
    recall: matrix.tp / (matrix.tp + matrix.fn),
    // ... other metrics
  };

  return { matrix, metrics };
}
```

---

#### 2. GET `/api/v1/validation/field-vs-drone`

**Purpose:** Analyze distribution of field validation vs drone prediction

**Query Parameters:**
```javascript
{
  "divisi": "Divisi 1",
  "blok": "A5",
  "stress_level": "Stres Berat",  // Filter by prediction
  "date_range": { ... }
}
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "distribution": [
      {
        "drone_prediction": "Stres Berat",
        "field_actual": "Stres Berat",
        "count": 118,
        "percentage": 12.97,
        "category": "True Positive",
        "avg_ndre": 0.23,
        "trees": [
          {
            "id_npokok": "uuid-1",
            "tree_id": "P-D001A-16-11",
            "ndre_value": 0.25,
            "field_status": "Stres Berat",
            "surveyor": "Ahmad",
            "validation_date": "2025-11-10",
            "gps": { "lat": -2.xxx, "lng": 110.xxx },
            "photo_url": "https://..."
          }
          // ... 117 more trees
        ]
      },
      {
        "drone_prediction": "Stres Berat",
        "field_actual": "Sehat",
        "count": 23,
        "percentage": 2.53,
        "category": "False Positive",
        "avg_ndre": 0.28,
        "common_causes": [
          {
            "cause": "Bayangan awan",
            "count": 12,
            "percentage": 52.17
          },
          {
            "cause": "Embun pagi",
            "count": 7,
            "percentage": 30.43
          },
          {
            "cause": "Kamera angle tidak optimal",
            "count": 4,
            "percentage": 17.39
          }
        ],
        "trees": [ ... ]
      }
      // ... TN, FN categories
    ],
    "recommendations": [
      "Reschedule drone survey: Avoid 06:00-09:00 (embun)",
      "Update pilot SOP: Camera angle consistency",
      "Threshold adjustment: 0.30 → 0.25 for Blok A5"
    ]
  }
}
```

---

#### 3. GET `/api/v1/analytics/anomaly-detection`

**Purpose:** Detect operational anomalies (pohon miring, mati, gambut, spacing)

**Query Parameters:**
```javascript
{
  "divisi": "Divisi 1",
  "blok": "A5",
  "anomaly_type": "miring",  // Options: miring, mati, gambut, spacing, ndre
  "severity": "high",        // Options: high, medium, low
  "date_range": { ... }
}
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "summary": {
      "total_anomalies": 35,
      "high_severity": 20,
      "medium_severity": 12,
      "low_severity": 3
    },
    "anomalies": [
      {
        "type": "pohon_miring",
        "severity": "high",
        "count": 12,
        "criteria": "Kemiringan > 30 derajat",
        "trees": [
          {
            "id_npokok": "uuid-1",
            "tree_id": "P-D001A-16-11",
            "angle_degree": 35,
            "location": {
              "divisi": "Divisi 1",
              "afdeling": "Afdeling 1",
              "blok": "A5",
              "row": 10,
              "position": 15
            },
            "gps": { "lat": -2.xxx, "lng": 110.xxx },
            "photo_url": "https://...",
            "detected_date": "2025-11-12"
          }
          // ... 11 more trees
        ],
        "recommended_action": "Create SPK penegakan pohon + penyangga",
        "estimated_cost": 1800000,  // Rp 1.8jt (12 × 150k)
        "priority": "urgent",
        "due_date": "2025-11-20"
      },
      {
        "type": "pohon_mati",
        "severity": "high",
        "count": 8,
        "criteria": "Tidak ada tanda kehidupan, daun kering",
        "trees": [ ... ],
        "recommended_action": "Create SPK eradikasi + karantina area",
        "estimated_cost": 4000000,  // Rp 4jt
        "priority": "critical",
        "due_date": "2025-11-15"
      },
      {
        "type": "gambut_amblas",
        "severity": "medium",
        "count": 5,  // 5 blok affected
        "criteria": "Permukaan tanah turun >20cm",
        "bloks": ["A3", "A4", "A5", "B2", "C1"],
        "trees_affected": 125,
        "recommended_action": "Create SPK pembenahan drainase",
        "estimated_cost": 15000000,  // Rp 15jt
        "priority": "high",
        "due_date": "2025-11-25"
      }
    ]
  }
}
```

---

#### 4. GET `/api/v1/analytics/mandor-performance`

**Purpose:** Track mandor KPI (completion rate, speed, quality)

**Query Parameters:**
```javascript
{
  "mandor_id": "uuid-mandor-1",  // Optional: specific mandor
  "date_range": {
    "start": "2025-11-01",
    "end": "2025-11-13"
  }
}
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "summary": {
      "total_mandors": 7,
      "avg_completion_rate": 0.82,
      "avg_quality_score": 0.91
    },
    "mandors": [
      {
        "mandor_id": "uuid-1",
        "name": "Joko Susilo",
        "afdeling": "Afdeling 1",
        "performance": {
          "spk_assigned": 5,
          "spk_completed": 4,
          "spk_overdue": 1,
          "completion_rate": 0.80,
          "avg_completion_days": 2.3,
          "quality_score": 0.92
        },
        "breakdown": {
          "validation_accuracy": 0.94,   // % correct field assessment
          "sop_compliance": 0.90,         // % tasks with photo+GPS+timestamp
          "speed_score": 0.85,            // Completion speed vs target
          "surveyor_rating": 4.6          // Avg rating from surveyor (1-5)
        },
        "issues": [
          {
            "type": "overdue_spk",
            "spk_id": "uuid-spk-1",
            "nomor_spk": "SPK/VAL/2025/005",
            "days_overdue": 3,
            "reason": "Surveyor sakit"
          }
        ],
        "recommendations": [
          "Reallocate SPK/VAL/2025/005 to Siti Aminah (available)",
          "Provide recognition for high quality score (92%)"
        ]
      },
      {
        "mandor_id": "uuid-2",
        "name": "Siti Aminah",
        "afdeling": "Afdeling 2",
        "performance": {
          "spk_assigned": 4,
          "spk_completed": 4,
          "spk_overdue": 0,
          "completion_rate": 1.00,
          "avg_completion_days": 1.8,
          "quality_score": 0.95
        },
        "breakdown": { ... },
        "issues": [],
        "recommendations": [
          "Top performer - assign high-priority tasks",
          "Consider as mentor for low-performing mandor"
        ]
      }
    ],
    "rankings": {
      "by_completion_rate": [
        { "mandor_id": "uuid-2", "name": "Siti Aminah", "rate": 1.00 },
        { "mandor_id": "uuid-1", "name": "Joko Susilo", "rate": 0.80 }
      ],
      "by_quality": [ ... ],
      "by_speed": [ ... ]
    }
  }
}
```

---

## TIER 4: Mandor Dashboard

**Target Users:** Mandor, Surveyor, Krani  
**URL:** `/api/v1/dashboard/mandor`

### Endpoints

| Endpoint | Method | Status | Purpose | Data Level |
|----------|--------|--------|---------|------------|
| `/dashboard/mandor/:id` | GET | ⏳ NEW | My dashboard summary | Mandor-specific |
| `/spk/mandor/:id` | GET | ✅ Complete | My SPK list (from Point 3) | SPK-level |
| `/spk/:id` | GET | ✅ Complete | SPK detail | Task-level |
| `/spk/:id/assign-surveyor` | POST | ✅ Complete | Assign tasks | Task-level |
| `/ops/spk?mandor=:name` | GET | ✅ Complete | My OPS SPK | SPK-level |
| `/tasks/my-tasks` | GET | ⏳ NEW | Today's task list | Task-level |
| `/tasks/:id/update` | PUT | ⏳ NEW | Update task status | Task-level |
| `/tasks/:id/upload-photo` | POST | ⏳ NEW | Upload field photo | Task-level |

### Response Structure Example

```javascript
GET /api/v1/dashboard/mandor/:id

Response:
{
  "success": true,
  "data": {
    "mandor": {
      "id": "uuid-1",
      "name": "Joko Susilo",
      "afdeling": "Afdeling 1",
      "contact": "+62812xxx"
    },
    "summary": {
      "active_spk": 7,
      "pending_tasks": 15,
      "completed_today": 12,
      "completion_rate_this_week": 0.85
    },
    "spk_list": [
      {
        "id_spk": "uuid-spk-1",
        "nomor_spk": "SPK/VAL/2025/032",
        "jenis": "Validasi Drone",
        "status": "DIKERJAKAN",
        "priority": "URGENT",
        "tanggal_mulai": "2025-11-10",
        "tanggal_selesai": "2025-11-15",
        "days_remaining": 2,
        "progress": {
          "total_tasks": 12,
          "completed": 8,
          "pending": 4,
          "percentage": 0.67
        }
      }
    ],
    "today_tasks": [
      {
        "id_tugas": "uuid-task-1",
        "tree_id": "P-D001A-16-11",
        "location": "Blok A5, Row 10",
        "task_type": "Validasi NDRE",
        "assigned_to": "Surveyor Ahmad",
        "status": "IN_PROGRESS",
        "gps": { "lat": -2.xxx, "lng": 110.xxx }
      }
    ],
    "surveyor_workload": [
      {
        "surveyor_name": "Ahmad",
        "assigned_tasks": 8,
        "completed": 6,
        "pending": 2,
        "availability": "available"
      }
    ]
  }
}
```

---

## Cross-Dashboard Shared Endpoints

Some endpoints are used by multiple dashboards with different access levels:

| Endpoint | Corporate | Manager | Asisten | Mandor | Access Control |
|----------|-----------|---------|---------|--------|----------------|
| `/lifecycle/overview` | ✅ | ✅ | ✅ | ❌ | Read: All except Mandor |
| `/lifecycle/phase/:name` | ❌ | ✅ | ✅ | ❌ | Read: Manager, Asisten |
| `/ops/spk` | ❌ | ✅ | ✅ | ✅ (filtered) | Read: All (RBAC filter) |
| `/drone/ndre` | ❌ | ❌ | ✅ | ❌ | Read: Asisten only |
| `/spk/:id` | ❌ | ✅ (summary) | ✅ (full) | ✅ (own only) | Read: RBAC filter |

**Implementation:**
```javascript
// Middleware: RBAC filter based on user role
async function filterByRole(req, res, next) {
  const userRole = req.user.role;
  const endpoint = req.path;
  
  // Example: /ops/spk endpoint
  if (endpoint === '/ops/spk') {
    if (userRole === 'mandor') {
      // Mandor: hanya SPK yang assigned ke dia
      req.query.mandor = req.user.name;
    } else if (userRole === 'asisten_manager') {
      // Asisten: semua SPK di afdeling-nya
      req.query.afdeling = req.user.afdeling;
    } else if (userRole === 'estate_manager') {
      // Manager: semua SPK di estate
      // No filter needed
    }
  }
  
  next();
}
```

---

## Implementation Checklist

### Phase 1: Existing Endpoints (✅ Complete)
- [x] Drone NDRE API (4 endpoints) - Point 1
- [x] SPK Validasi API (4 endpoints) - Point 2-3
- [x] OPS SPK API (6 endpoints) - Point 5

### Phase 2: New Critical Endpoints (Priority)
- [ ] `/validation/confusion-matrix` - 🔴 HIGH
- [ ] `/validation/field-vs-drone` - 🔴 HIGH
- [ ] `/analytics/anomaly-detection` - 🔴 HIGH
- [ ] `/analytics/mandor-performance` - 🔴 HIGH

### Phase 3: Dashboard-Specific Endpoints
- [ ] `/dashboard/corporate` - 🟡 MEDIUM
- [ ] `/dashboard/manager` (rename from kpi-eksekutif) - 🟡 MEDIUM
- [ ] `/dashboard/asisten` (rename from operasional) - 🟡 MEDIUM
- [ ] `/dashboard/mandor` - 🟡 MEDIUM

### Phase 4: Configuration & Utils
- [ ] `/config/ndre-threshold` (GET, PUT) - 🟡 MEDIUM
- [ ] `/validation/:id/override` - 🟡 MEDIUM
- [ ] `/audit/validation-overrides` - 🟢 LOW

---

## Testing Strategy

### Unit Tests
- Test each endpoint with valid/invalid inputs
- Mock Supabase responses
- Validate response structure

### Integration Tests
- Test RBAC filters (different roles accessing same endpoint)
- Test cross-endpoint data consistency
- Test pagination & filters

### Load Tests
- Confusion matrix calculation (910 trees)
- Field vs drone distribution (heavy query)
- Real-time dashboard updates

### UAT
- Test with real users (Asisten Manager, Mandor)
- Validate business logic
- Collect feedback for improvement

---

**Document Status:** ✅ COMPLETE  
**Last Updated:** November 13, 2025  
**Version:** 1.0.0
