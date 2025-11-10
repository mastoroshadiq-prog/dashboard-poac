# API SPECIFICATION - ENHANCEMENT PLAN QUADRANT
**Tanggal:** 9 November 2025  
**Versi:** 1.0  
**Status:** Request to Backend Team  
**Priority:** HIGH  
**Target Implementation:** 11-12 November 2025

---

## 📋 EXECUTIVE SUMMARY

Dokumen ini berisi spesifikasi enhancement API untuk **Dashboard Eksekutif - Kuadran PLAN**. Enhancement ini bertujuan membuat kuadran PLAN lebih **informatif, actionable, dan intelligent** dengan menambahkan:

1. ✅ Tren Kepatuhan SOP (time series)
2. ✅ Target Deadline per kategori SPK
3. ✅ Risk Level & Blockers identification
4. ✅ Historical Planning Accuracy

**Impact:** Mengubah kuadran PLAN dari "static target display" menjadi "intelligent planning dashboard" dengan forecasting, risk alerts, dan actionable insights.

---

## 🎯 OBJECTIVE & BUSINESS VALUE

### Current State (Before Enhancement)
```
Kuadran PLAN hanya menampilkan:
- Kepatuhan SOP: 27.3% (single point)
- Target: 90.0% (hardcoded)
- Progress bars: Validasi, APH, Sanitasi (completion %)

Limitations:
❌ Tidak ada konteks trajectory (naik/turun?)
❌ Tidak ada urgency indicator (deadline?)
❌ Tidak ada risk assessment (blocker?)
❌ Tidak bisa forecasting (kapan target tercapai?)
```

### Target State (After Enhancement)
```
Kuadran PLAN akan menampilkan:
✅ Kepatuhan SOP dengan trend line (↗️/↘️)
✅ Velocity calculation & ETA to target
✅ Deadline countdown per kategori
✅ Risk indicators (🟢🟡🔴)
✅ Blocker identification
✅ Historical planning accuracy

Result: Executive dapat:
1. Melihat trajectory (improving/declining)
2. Mengetahui urgency (deadline approaching)
3. Identify risks early (sebelum jadi crisis)
4. Forecast completion date
5. Evaluate planning accuracy
```

---

## 🔌 API ENDPOINT CHANGES

### **ENDPOINT 1: GET /api/v1/dashboard/kpi-eksekutif**
**Status:** EXISTING - Need Enhancement  
**Method:** GET  
**Auth:** JWT Bearer Token  
**Role Access:** ASISTEN, ADMIN

#### **CURRENT RESPONSE STRUCTURE**
```json
{
  "success": true,
  "data": {
    "kri_lead_time_aph": 2.5,
    "kri_kepatuhan_sop": 27.3,
    "tren_insidensi_baru": [
      {"periode": "Week 1", "nilai": 5},
      {"periode": "Week 2", "nilai": 3}
    ],
    "tren_g4_aktif": [
      {"periode": "Week 1", "nilai": 12},
      {"periode": "Week 2", "nilai": 10}
    ]
  }
}
```

#### **ENHANCED RESPONSE STRUCTURE (NEW)**
```json
{
  "success": true,
  "data": {
    // EXISTING FIELDS (keep as is)
    "kri_lead_time_aph": 2.5,
    "kri_kepatuhan_sop": 27.3,
    "tren_insidensi_baru": [...],
    "tren_g4_aktif": [...],
    
    // ⭐ NEW FIELD #1: Tren Kepatuhan SOP (Time Series)
    "tren_kepatuhan_sop": [
      {"periode": "Week 1", "nilai": 15.0},
      {"periode": "Week 2", "nilai": 18.5},
      {"periode": "Week 3", "nilai": 22.0},
      {"periode": "Week 4", "nilai": 25.2},
      {"periode": "Week 5", "nilai": 27.3}
    ],
    
    // ⭐ NEW FIELD #2: Planning Accuracy History
    "planning_accuracy": {
      "last_month": {
        "target_completion": 85,
        "actual_completion": 72,
        "accuracy_percentage": 84.7
      },
      "current_month": {
        "target_completion": 20,
        "actual_completion": 7,
        "accuracy_percentage": 35.0,
        "projected_final_accuracy": 42.5  // Based on current velocity
      }
    }
  }
}
```

#### **FIELD SPECIFICATIONS**

##### **NEW FIELD: `tren_kepatuhan_sop`**
| Property | Type | Required | Description | Calculation |
|----------|------|----------|-------------|-------------|
| `tren_kepatuhan_sop` | Array | ✅ Yes | Time series of SOP compliance over last 4-8 weeks | `SELECT WEEK(created_at) as periode, AVG(kepatuhan_sop) as nilai FROM ... GROUP BY WEEK` |
| `tren_kepatuhan_sop[].periode` | String | ✅ Yes | Period label (e.g., "Week 1", "Nov W1") | ISO week number or custom label |
| `tren_kepatuhan_sop[].nilai` | Number | ✅ Yes | SOP compliance percentage for that period | Float (0-100) |

**Business Logic:**
```javascript
// Pseudocode for calculating tren_kepatuhan_sop
const trenKepatuhanSop = await db.query(`
  SELECT 
    DATE_TRUNC('week', tanggal_laporan) as periode,
    AVG(
      (tugas_sesuai_sop::float / NULLIF(tugas_sesuai_sop + tugas_tidak_sesuai_sop, 0)) * 100
    ) as nilai
  FROM log_aktivitas
  WHERE tanggal_laporan >= NOW() - INTERVAL '8 weeks'
  GROUP BY DATE_TRUNC('week', tanggal_laporan)
  ORDER BY periode ASC
  LIMIT 8
`);

// Format output
return trenKepatuhanSop.map((row, idx) => ({
  periode: `Week ${idx + 1}`,
  nilai: parseFloat(row.nilai.toFixed(1))
}));
```

**Sample Output:**
```json
[
  {"periode": "Week 1", "nilai": 15.0},
  {"periode": "Week 2", "nilai": 18.5},
  {"periode": "Week 3", "nilai": 22.0},
  {"periode": "Week 4", "nilai": 25.2},
  {"periode": "Week 5", "nilai": 27.3}
]
```

##### **NEW FIELD: `planning_accuracy`**
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `planning_accuracy` | Object | ✅ Yes | Historical planning accuracy metrics |
| `planning_accuracy.last_month` | Object | ✅ Yes | Previous month's data |
| `planning_accuracy.last_month.target_completion` | Integer | ✅ Yes | Total tasks planned last month |
| `planning_accuracy.last_month.actual_completion` | Integer | ✅ Yes | Total tasks completed last month |
| `planning_accuracy.last_month.accuracy_percentage` | Float | ✅ Yes | (actual / target) * 100 |
| `planning_accuracy.current_month` | Object | ✅ Yes | Current month's data |
| `planning_accuracy.current_month.target_completion` | Integer | ✅ Yes | Total tasks planned this month |
| `planning_accuracy.current_month.actual_completion` | Integer | ✅ Yes | Total tasks completed so far |
| `planning_accuracy.current_month.accuracy_percentage` | Float | ✅ Yes | Current completion rate |
| `planning_accuracy.current_month.projected_final_accuracy` | Float | ⚠️ Optional | Forecasted accuracy based on velocity |

**Business Logic:**
```javascript
// Pseudocode for calculating planning_accuracy
const lastMonth = await db.query(`
  SELECT 
    COUNT(*) FILTER (WHERE status = 'TARGET') as target_completion,
    COUNT(*) FILTER (WHERE status = 'SELESAI') as actual_completion
  FROM tugas_spk
  WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW() - INTERVAL '1 month')
`);

const currentMonth = await db.query(`
  SELECT 
    COUNT(*) FILTER (WHERE status = 'TARGET') as target_completion,
    COUNT(*) FILTER (WHERE status = 'SELESAI') as actual_completion
  FROM tugas_spk
  WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM NOW())
`);

return {
  last_month: {
    target_completion: lastMonth.target_completion,
    actual_completion: lastMonth.actual_completion,
    accuracy_percentage: (lastMonth.actual_completion / lastMonth.target_completion * 100)
  },
  current_month: {
    target_completion: currentMonth.target_completion,
    actual_completion: currentMonth.actual_completion,
    accuracy_percentage: (currentMonth.actual_completion / currentMonth.target_completion * 100),
    projected_final_accuracy: calculateProjection() // Based on daily velocity
  }
};
```

---

### **ENDPOINT 2: GET /api/v1/dashboard/operasional**
**Status:** EXISTING - Need Enhancement  
**Method:** GET  
**Auth:** JWT Bearer Token  
**Role Access:** ASISTEN, ADMIN, MANDOR

#### **CURRENT RESPONSE STRUCTURE**
```json
{
  "success": true,
  "data": {
    "data_corong": {
      "target_validasi": 2,
      "selesai_validasi": 2,
      "target_aph": 10,
      "selesai_aph": 5,
      "target_sanitasi": 8,
      "selesai_sanitasi": 0
    },
    "data_papan_peringkat": [...]
  }
}
```

#### **ENHANCED RESPONSE STRUCTURE (NEW)**
```json
{
  "success": true,
  "data": {
    "data_corong": {
      // EXISTING FIELDS (keep as is)
      "target_validasi": 2,
      "selesai_validasi": 2,
      "target_aph": 10,
      "selesai_aph": 5,
      "target_sanitasi": 8,
      "selesai_sanitasi": 0,
      
      // ⭐ NEW FIELD #3: Target Deadlines
      "deadline_validasi": "2025-11-15",
      "deadline_aph": "2025-11-20",
      "deadline_sanitasi": "2025-11-18",
      
      // ⭐ NEW FIELD #4: Risk Levels
      "risk_level_validasi": "LOW",
      "risk_level_aph": "MEDIUM",
      "risk_level_sanitasi": "CRITICAL",
      
      // ⭐ NEW FIELD #5: Blockers
      "blockers_validasi": [],
      "blockers_aph": [
        "Pelaksana shortage (need 3 more workers)"
      ],
      "blockers_sanitasi": [
        "No pelaksana assigned yet",
        "Deadline already passed by 2 days"
      ],
      
      // ⭐ NEW FIELD #6: Resource Allocation
      "pelaksana_assigned_validasi": 2,
      "pelaksana_assigned_aph": 5,
      "pelaksana_assigned_sanitasi": 0
    },
    "data_papan_peringkat": [...]
  }
}
```

#### **FIELD SPECIFICATIONS**

##### **NEW FIELD: Deadline Fields**
| Property | Type | Required | Description | Source |
|----------|------|----------|-------------|--------|
| `deadline_validasi` | String (ISO 8601) | ✅ Yes | Target completion date for Validasi category | `spk.tanggal_target_selesai` where tipe = 'VALIDASI' |
| `deadline_aph` | String (ISO 8601) | ✅ Yes | Target completion date for APH category | `spk.tanggal_target_selesai` where tipe IN ('PANEN_APH', 'RAWAT_APH') |
| `deadline_sanitasi` | String (ISO 8601) | ✅ Yes | Target completion date for Sanitasi category | `spk.tanggal_target_selesai` where tipe = 'SANITASI' |

**Business Logic:**
```javascript
// Pseudocode for calculating deadlines
const deadlineValidasi = await db.query(`
  SELECT MIN(tanggal_target_selesai) as deadline
  FROM spk s
  JOIN tugas_spk t ON s.id_spk = t.id_spk
  WHERE t.tipe_tugas = 'VALIDASI'
    AND t.status != 'SELESAI'
`);

// Format: YYYY-MM-DD
return deadlineValidasi.deadline.toISOString().split('T')[0];
```

##### **NEW FIELD: Risk Level Fields**
| Property | Type | Required | Description | Allowed Values |
|----------|------|----------|-------------|----------------|
| `risk_level_validasi` | String (Enum) | ✅ Yes | Risk assessment for Validasi | "LOW", "MEDIUM", "CRITICAL" |
| `risk_level_aph` | String (Enum) | ✅ Yes | Risk assessment for APH | "LOW", "MEDIUM", "CRITICAL" |
| `risk_level_sanitasi` | String (Enum) | ✅ Yes | Risk assessment for Sanitasi | "LOW", "MEDIUM", "CRITICAL" |

**Business Logic (Risk Calculation):**
```javascript
// Pseudocode for risk level calculation
function calculateRiskLevel(category) {
  const progress = selesai / target;
  const daysToDeadline = (deadline - NOW()) / (1000 * 60 * 60 * 24);
  const pelaksanaAssigned = getPelaksanaCount(category);
  
  // Rule 1: Already overdue
  if (daysToDeadline < 0) return "CRITICAL";
  
  // Rule 2: No workers assigned
  if (pelaksanaAssigned === 0 && progress < 1.0) return "CRITICAL";
  
  // Rule 3: Low progress with approaching deadline
  if (progress < 0.3 && daysToDeadline < 7) return "CRITICAL";
  
  // Rule 4: Medium progress with some time left
  if (progress < 0.7 && daysToDeadline < 14) return "MEDIUM";
  
  // Rule 5: On track
  if (progress >= 0.7 || daysToDeadline > 14) return "LOW";
  
  return "MEDIUM"; // Default
}
```

**Risk Level Matrix:**
| Condition | Risk Level | Icon | Color |
|-----------|------------|------|-------|
| Overdue OR No workers assigned | CRITICAL | 🔴 | Red |
| Progress < 30% AND < 7 days left | CRITICAL | 🔴 | Red |
| Progress < 70% AND < 14 days left | MEDIUM | 🟡 | Orange |
| Progress ≥ 70% OR > 14 days left | LOW | 🟢 | Green |

##### **NEW FIELD: Blockers Fields**
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `blockers_validasi` | Array<String> | ✅ Yes | List of blocking issues for Validasi |
| `blockers_aph` | Array<String> | ✅ Yes | List of blocking issues for APH |
| `blockers_sanitasi` | Array<String> | ✅ Yes | List of blocking issues for Sanitasi |

**Business Logic (Blocker Detection):**
```javascript
// Pseudocode for blocker detection
function detectBlockers(category) {
  const blockers = [];
  
  // Check 1: Overdue
  if (daysToDeadline < 0) {
    blockers.push(`Deadline passed by ${Math.abs(daysToDeadline)} days`);
  }
  
  // Check 2: No pelaksana assigned
  if (pelaksanaAssigned === 0 && target > 0) {
    blockers.push(`No pelaksana assigned yet`);
  }
  
  // Check 3: Insufficient workers
  const requiredWorkers = Math.ceil(target / 3); // Assume 3 tasks per worker
  if (pelaksanaAssigned < requiredWorkers && progress < 0.5) {
    const shortage = requiredWorkers - pelaksanaAssigned;
    blockers.push(`Pelaksana shortage (need ${shortage} more workers)`);
  }
  
  // Check 4: Stalled progress (no update in 3 days)
  const lastUpdate = getLastUpdateDate(category);
  if ((NOW() - lastUpdate) > 3 * 24 * 60 * 60 * 1000 && progress < 1.0) {
    blockers.push(`No progress update in 3 days`);
  }
  
  return blockers;
}
```

**Sample Blockers:**
```json
// Example 1: On track
"blockers_validasi": []

// Example 2: Worker shortage
"blockers_aph": [
  "Pelaksana shortage (need 3 more workers)"
]

// Example 3: Multiple issues
"blockers_sanitasi": [
  "No pelaksana assigned yet",
  "Deadline already passed by 2 days",
  "No progress update in 5 days"
]
```

##### **NEW FIELD: Resource Allocation Fields**
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `pelaksana_assigned_validasi` | Integer | ✅ Yes | Count of unique pelaksana assigned to Validasi tasks |
| `pelaksana_assigned_aph` | Integer | ✅ Yes | Count of unique pelaksana assigned to APH tasks |
| `pelaksana_assigned_sanitasi` | Integer | ✅ Yes | Count of unique pelaksana assigned to Sanitasi tasks |

**Business Logic:**
```javascript
// Pseudocode for pelaksana count
const pelaksanaValidasi = await db.query(`
  SELECT COUNT(DISTINCT id_pelaksana) as count
  FROM tugas_spk
  WHERE tipe_tugas = 'VALIDASI'
    AND status != 'SELESAI'
    AND id_pelaksana IS NOT NULL
`);

return pelaksanaValidasi.count;
```

---

## 📊 SAMPLE COMPLETE RESPONSE (AFTER ENHANCEMENT)

### **GET /api/v1/dashboard/kpi-eksekutif**
```json
{
  "success": true,
  "data": {
    "kri_lead_time_aph": 2.5,
    "kri_kepatuhan_sop": 27.3,
    "tren_insidensi_baru": [
      {"periode": "Week 1", "nilai": 5},
      {"periode": "Week 2", "nilai": 3},
      {"periode": "Week 3", "nilai": 2}
    ],
    "tren_g4_aktif": [
      {"periode": "Week 1", "nilai": 12},
      {"periode": "Week 2", "nilai": 10},
      {"periode": "Week 3", "nilai": 8}
    ],
    "tren_kepatuhan_sop": [
      {"periode": "Week 1", "nilai": 15.0},
      {"periode": "Week 2", "nilai": 18.5},
      {"periode": "Week 3", "nilai": 22.0},
      {"periode": "Week 4", "nilai": 25.2},
      {"periode": "Week 5", "nilai": 27.3}
    ],
    "planning_accuracy": {
      "last_month": {
        "target_completion": 85,
        "actual_completion": 72,
        "accuracy_percentage": 84.7
      },
      "current_month": {
        "target_completion": 20,
        "actual_completion": 7,
        "accuracy_percentage": 35.0,
        "projected_final_accuracy": 42.5
      }
    }
  }
}
```

### **GET /api/v1/dashboard/operasional**
```json
{
  "success": true,
  "data": {
    "data_corong": {
      "target_validasi": 2,
      "selesai_validasi": 2,
      "deadline_validasi": "2025-11-15",
      "risk_level_validasi": "LOW",
      "blockers_validasi": [],
      "pelaksana_assigned_validasi": 2,
      
      "target_aph": 10,
      "selesai_aph": 5,
      "deadline_aph": "2025-11-20",
      "risk_level_aph": "MEDIUM",
      "blockers_aph": [
        "Pelaksana shortage (need 3 more workers)"
      ],
      "pelaksana_assigned_aph": 5,
      
      "target_sanitasi": 8,
      "selesai_sanitasi": 0,
      "deadline_sanitasi": "2025-11-07",
      "risk_level_sanitasi": "CRITICAL",
      "blockers_sanitasi": [
        "No pelaksana assigned yet",
        "Deadline already passed by 2 days"
      ],
      "pelaksana_assigned_sanitasi": 0
    },
    "data_papan_peringkat": [
      {"id_pelaksana": "PLK-001", "selesai": 10, "total": 12, "rate": 83.3},
      {"id_pelaksana": "PLK-002", "selesai": 8, "total": 12, "rate": 66.7}
    ]
  }
}
```

---

## 🧪 TEST CASES

### **Test Case 1: Normal Operation**
**Request:**
```bash
curl -X GET http://localhost:3000/api/v1/dashboard/kpi-eksekutif \
  -H "Authorization: Bearer <valid_jwt_token>"
```

**Expected Response:**
- Status: 200 OK
- Body: Contains all fields including new `tren_kepatuhan_sop` and `planning_accuracy`
- `tren_kepatuhan_sop` array has 4-8 elements
- All `nilai` fields are valid floats (0-100)

### **Test Case 2: No Historical Data**
**Scenario:** Database has less than 4 weeks of data

**Expected Response:**
```json
{
  "tren_kepatuhan_sop": [
    {"periode": "Week 1", "nilai": 27.3}
  ],
  "planning_accuracy": {
    "last_month": {
      "target_completion": 0,
      "actual_completion": 0,
      "accuracy_percentage": 0.0
    }
  }
}
```

### **Test Case 3: Risk Level Calculation**
**Scenario:** Sanitasi category is overdue

**Expected Response:**
```json
{
  "deadline_sanitasi": "2025-11-07",  // 2 days ago
  "risk_level_sanitasi": "CRITICAL",
  "blockers_sanitasi": [
    "Deadline already passed by 2 days",
    "No pelaksana assigned yet"
  ]
}
```

### **Test Case 4: Invalid Token**
**Request:** Missing or invalid JWT

**Expected Response:**
- Status: 401 Unauthorized
- Body: `{"success": false, "message": "Silakan login terlebih dahulu"}`

---

## 🔄 BACKWARD COMPATIBILITY

**Important:** All existing fields MUST remain unchanged. New fields are ADDITIVE ONLY.

✅ **Safe Changes:**
- Adding new fields to existing objects
- Adding new calculated metrics
- Extending arrays with additional elements

❌ **Breaking Changes (DO NOT DO):**
- Renaming existing fields
- Changing data types of existing fields
- Removing fields
- Changing response structure

**Compatibility Check:**
```javascript
// Frontend can safely ignore new fields if not needed
const { kri_kepatuhan_sop } = response.data; // Still works

// New frontend can use enhanced fields
const { tren_kepatuhan_sop } = response.data; // New feature
```

---

## 📅 IMPLEMENTATION TIMELINE

| Phase | Task | Owner | Duration | Target Date |
|-------|------|-------|----------|-------------|
| 1 | Review & approve spec | Backend Team Lead | 2 hours | Nov 9, 2025 (Today) |
| 2 | Database schema check | Backend Developer | 1 hour | Nov 9, 2025 |
| 3 | Implement `tren_kepatuhan_sop` | Backend Developer | 3 hours | Nov 10, 2025 |
| 4 | Implement deadline fields | Backend Developer | 2 hours | Nov 10, 2025 |
| 5 | Implement risk calculation logic | Backend Developer | 4 hours | Nov 10, 2025 |
| 6 | Implement blockers detection | Backend Developer | 3 hours | Nov 11, 2025 |
| 7 | Implement resource allocation | Backend Developer | 2 hours | Nov 11, 2025 |
| 8 | Implement planning accuracy | Backend Developer | 3 hours | Nov 11, 2025 |
| 9 | Unit testing | Backend Developer | 3 hours | Nov 11, 2025 |
| 10 | Integration testing | QA Team | 2 hours | Nov 12, 2025 |
| 11 | Deploy to staging | DevOps | 1 hour | Nov 12, 2025 |
| 12 | Frontend integration | Frontend Team | 2 hours | Nov 12, 2025 |

**Total Estimated Effort:** 26 hours (~3.5 days)  
**Target Go-Live:** November 12, 2025 (EOD)

---

## 🎯 ACCEPTANCE CRITERIA

### **Functional Requirements**
- [ ] All new fields present in API response
- [ ] `tren_kepatuhan_sop` contains 4-8 data points
- [ ] Risk levels calculated correctly based on business rules
- [ ] Blockers array identifies real issues
- [ ] Deadline dates in ISO 8601 format
- [ ] Planning accuracy shows last month vs current month

### **Non-Functional Requirements**
- [ ] API response time < 500ms (with new calculations)
- [ ] No breaking changes to existing fields
- [ ] All new fields documented in API docs
- [ ] Backward compatible with old frontend versions
- [ ] Error handling for edge cases (no data, division by zero)

### **Test Coverage**
- [ ] Unit tests for risk calculation logic
- [ ] Unit tests for blocker detection
- [ ] Unit tests for trend aggregation
- [ ] Integration tests for complete endpoint
- [ ] Edge case tests (empty data, overdue, etc.)

---

## 📞 CONTACT & COORDINATION

**Frontend Team Lead:** [Your Name]  
**Backend Team Lead:** [Backend Team Lead Name]  
**Slack Channel:** #dashboard-poac-dev  
**JIRA Epic:** POAC-123 (Dashboard Enhancement)

**Questions?** Please ping on Slack or create a comment in JIRA ticket.

---

## 📎 APPENDIX

### **A. Database Tables Involved**
```sql
-- Tables used for calculations
- tugas_spk (for task counts, status, deadlines)
- spk (for SPK header info, target dates)
- log_aktivitas (for SOP compliance history)
- pelaksana (for resource allocation)
```

### **B. SQL Query Examples**

**Tren Kepatuhan SOP:**
```sql
SELECT 
  TO_CHAR(DATE_TRUNC('week', tanggal_laporan), 'YYYY-MM-DD') as periode,
  ROUND(
    AVG(
      (tugas_sesuai_sop::float / NULLIF(tugas_sesuai_sop + tugas_tidak_sesuai_sop, 0)) * 100
    )::numeric, 
    1
  ) as nilai
FROM log_aktivitas
WHERE tanggal_laporan >= NOW() - INTERVAL '8 weeks'
GROUP BY DATE_TRUNC('week', tanggal_laporan)
ORDER BY periode ASC;
```

**Risk Level Calculation:**
```sql
SELECT 
  tipe_tugas,
  COUNT(*) FILTER (WHERE status = 'SELESAI') as selesai,
  COUNT(*) as target,
  MIN(tanggal_target_selesai) as deadline,
  COUNT(DISTINCT id_pelaksana) FILTER (WHERE id_pelaksana IS NOT NULL) as pelaksana_assigned,
  CASE
    WHEN MIN(tanggal_target_selesai) < NOW() THEN 'CRITICAL'
    WHEN COUNT(DISTINCT id_pelaksana) = 0 AND COUNT(*) FILTER (WHERE status != 'SELESAI') > 0 THEN 'CRITICAL'
    WHEN (COUNT(*) FILTER (WHERE status = 'SELESAI')::float / COUNT(*)) < 0.3 
         AND MIN(tanggal_target_selesai) < NOW() + INTERVAL '7 days' THEN 'CRITICAL'
    WHEN (COUNT(*) FILTER (WHERE status = 'SELESAI')::float / COUNT(*)) < 0.7 
         AND MIN(tanggal_target_selesai) < NOW() + INTERVAL '14 days' THEN 'MEDIUM'
    ELSE 'LOW'
  END as risk_level
FROM tugas_spk
GROUP BY tipe_tugas;
```

### **C. Error Codes**
| Code | Message | HTTP Status | Action |
|------|---------|-------------|--------|
| AUTH_001 | Token tidak valid | 401 | Re-authenticate |
| AUTH_002 | Akses ditolak (role tidak sesuai) | 403 | Check user role |
| DATA_001 | Tidak ada data tersedia | 200 | Return empty arrays |
| SRV_001 | Internal server error | 500 | Contact backend team |

---

**Document Version:** 1.0  
**Last Updated:** November 9, 2025  
**Prepared By:** Frontend Development Team  
**Approved By:** _Pending Backend Team Review_

---

## ✅ SIGN-OFF

**Backend Team Lead:** _________________ Date: _________  
**Frontend Team Lead:** _________________ Date: _________  
**Product Owner:** _________________ Date: _________

