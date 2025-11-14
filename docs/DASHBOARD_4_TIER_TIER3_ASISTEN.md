# Dashboard Tier 3: ASISTEN (Tactical Operations)

**Target Users:** Asisten Manager, Kepala Afdeling, Asisten Afdeling  
**URL:** `/api/v1/dashboard/asisten`  
**Focus:** Operational Excellence, Quality Control, Tactical Decision Making  
**Update Frequency:** Real-time / Hourly

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Key Characteristics](#key-characteristics)
3. [Metrics & KPIs](#metrics--kpis)
4. [Confusion Matrix Analysis](#confusion-matrix-analysis)
5. [Field Validation vs Drone Prediction](#field-validation-vs-drone-prediction)
6. [SPK Management](#spk-management)
7. [Anomaly Detection](#anomaly-detection)
8. [Mandor Performance Tracking](#mandor-performance-tracking)
9. [Action Buttons](#action-buttons)
10. [API Endpoints](#api-endpoints)
11. [UI/UX Specifications](#uiux-specifications)

---

## Overview

### Why Asisten Dashboard is Critical?

**Asisten Manager adalah ORCHESTRATOR dari seluruh workflow operasional:**

```
Drone Scan (910 trees)
    ↓ (Analyze NDRE data)
Identify Anomalies (141 stres berat, 763 sedang)
    ↓ (Create SPK Validasi)
Assign to Mandor (31 SPK created)
    ↓ (Monitor progress)
Mandor → Surveyor (48 tasks assigned)
    ↓ (Track completion)
Validation Results (field data collected)
    ↓ (Analyze accuracy)
Confusion Matrix (TP/FP/TN/FN calculated)
    ↓ (Decision making)
Actions: Adjust threshold, Create remedial SPK, Update SOP
```

**Key Insight:** Asisten Manager butuh **full visibility + full control** untuk tactical decision making.

---

## Key Characteristics

### 1. **Full Analytical Capability**
- ✅ Tree-level detail (individual pohon dengan GPS, foto, history)
- ✅ Statistical analysis (confusion matrix, distribution, correlation)
- ✅ Drill-down capability (dari divisi → afdeling → blok → pohon)
- ✅ Real-time monitoring (NDRE data, SPK status, mandor progress)

### 2. **Decision Making Tools**
- ✅ Confusion matrix → Adjust NDRE threshold
- ✅ False positive analysis → Update drone calibration
- ✅ Anomaly detection → Create remedial SPK
- ✅ Mandor performance → Reallocate workload

### 3. **Operational Control**
- ✅ Create SPK (Validasi Drone + OPS SPK)
- ✅ Assign SPK to Mandor
- ✅ Override drone prediction (manual correction)
- ✅ Approve/reject validation results

### 4. **Quality Control Focus**
- ✅ Monitor validation accuracy
- ✅ Track SOP compliance per mandor
- ✅ Identify systematic errors (pattern recognition)
- ✅ Continuous improvement (feedback loop)

---

## Metrics & KPIs

### A. Drone NDRE Analysis (From Point 1)

**Primary Metrics:**

| Metric | Value | Status | Interpretation |
|--------|-------|--------|----------------|
| Total Trees Scanned | 910 | ✅ Complete | Full coverage achieved |
| Stres Berat (NDRE < 0.3) | 141 (15.49%) | ⚠️ Alert | High priority validation |
| Stres Sedang (0.3-0.5) | 763 (83.85%) | 🔍 Monitor | Medium priority |
| Sehat (NDRE > 0.5) | 6 (0.66%) | ✅ Good | Normal condition |

**API Endpoint:**
```
GET /api/v1/drone/ndre/statistics
```

**Visualization:**
- Pie chart: Distribution (Stres Berat, Sedang, Sehat)
- Bar chart: Count per stress level
- Heatmap: NDRE value per blok
- Trend line: NDRE over time (weekly)

---

### B. Confusion Matrix Akurasi Drone ⭐ (NEW - PRIORITY)

**Why This is Critical for Asisten Manager:**
- Validate drone reliability per blok/divisi
- Identify systematic errors (false positives, false negatives)
- Make data-driven decisions: "Apakah drone bisa dipercaya untuk blok ini?"
- Adjust NDRE threshold per kondisi lapangan

**Confusion Matrix Structure:**

```
                 Prediksi Drone (NDRE-based)
                 Stres Berat    Normal
Aktual   Stres   TP: 118        FN: 24      } Recall = 83.1%
(Lapang) Normal  FP: 23         TN: 745     } Precision = 83.7%
```

**Calculated Metrics:**

| Metric | Formula | Value | Interpretation |
|--------|---------|-------|----------------|
| **Accuracy** | (TP+TN) / Total | **94.8%** | Overall correctness |
| **Precision** | TP / (TP+FP) | **83.7%** | Positive prediction reliability |
| **Recall** | TP / (TP+FN) | **83.1%** | Detection completeness |
| **F1-Score** | 2 × (P×R)/(P+R) | **83.4%** | Balanced performance |
| **False Positive Rate** | FP / (FP+TN) | **2.5%** | False alarm rate |
| **False Negative Rate** | FN / (TP+FN) | **16.9%** | Missed detection rate |

**API Endpoint (NEW):**
```
GET /api/v1/validation/confusion-matrix
Query params:
  - divisi (optional): Filter by divisi
  - blok (optional): Filter by blok
  - date_range (optional): Time period

Response:
{
  "success": true,
  "data": {
    "matrix": {
      "true_positive": 118,
      "false_positive": 23,
      "true_negative": 745,
      "false_negative": 24
    },
    "metrics": {
      "accuracy": 0.948,
      "precision": 0.837,
      "recall": 0.831,
      "f1_score": 0.834,
      "fpr": 0.025,
      "fnr": 0.169
    },
    "total_validated": 910,
    "per_divisi": [
      {
        "divisi": "Divisi 1",
        "accuracy": 0.92,
        "precision": 0.85,
        "blok_terburuk": "A5 (accuracy: 62%)"
      }
    ]
  }
}
```

**Visualization:**
- Confusion matrix heatmap (2×2 grid dengan warna)
- Metrics card (Accuracy, Precision, Recall, F1)
- Per-divisi comparison (bar chart)
- Per-blok heatmap (identify problematic areas)

**Action Items Based on Confusion Matrix:**

| Condition | Action |
|-----------|--------|
| FP rate > 5% | Adjust NDRE threshold (terlalu sensitif) |
| FN rate > 20% | Increase survey coverage (missed detection) |
| Accuracy < 80% per blok | Recalibrate drone sensor |
| Precision < 75% | Review validation SOP |

---

### C. Field Validation vs Drone Prediction ⭐ (NEW - PRIORITY)

**Distribution Analysis:**

| Drone Prediction | Field Actual | Count | % | Category | Common Causes |
|------------------|--------------|-------|---|----------|---------------|
| Stres Berat | Stres Berat | 118 | 12.97% | ✅ **True Positive** | Drone correct |
| Stres Berat | Normal/Sehat | 23 | 2.53% | ❌ **False Positive** | Bayangan awan, embun pagi, angle |
| Normal | Stres Berat | 24 | 2.64% | ❌ **False Negative** | Stress baru muncul, sensor issue |
| Normal | Normal | 745 | 81.87% | ✅ **True Negative** | Drone correct |

**API Endpoint (NEW):**
```
GET /api/v1/validation/field-vs-drone
Query params:
  - divisi, blok, date_range (optional)
  - stress_level (optional): Filter by prediction level

Response:
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
        "trees": [
          {
            "id_npokok": "uuid-1",
            "tree_id": "P-D001A-16-11",
            "ndre_value": 0.25,
            "field_status": "Stres Berat",
            "surveyor": "Ahmad",
            "validation_date": "2025-11-10"
          }
        ]
      },
      {
        "drone_prediction": "Stres Berat",
        "field_actual": "Sehat",
        "count": 23,
        "percentage": 2.53,
        "category": "False Positive",
        "common_causes": [
          "Bayangan awan (12 pohon)",
          "Embun pagi (7 pohon)",
          "Kamera angle tidak optimal (4 pohon)"
        ],
        "trees": [ ... ]
      }
    ],
    "recommendations": [
      "Adjust NDRE threshold untuk Blok A5 dari 0.3 → 0.25",
      "Survey drone di pagi hari setelah embun hilang (>09:00)",
      "Kalibrasi sensor drone setiap 2 minggu",
      "Review pohon False Negative: 24 pohon (missed detection)"
    ]
  }
}
```

**Visualization:**
- Scatter plot: NDRE value vs Field stress level
- Sankey diagram: Flow dari prediksi → aktual
- Box plot: NDRE distribution per kategori (TP/FP/TN/FN)
- Table: Tree-level detail dengan drill-down

**Decision Support:**

**Scenario 1: High False Positive Rate (FP > 5%)**
```
Analysis: 23 pohon predicted stres, tapi sehat
Root cause: Bayangan awan (12), Embun (7), Angle (4)
Decision: 
  1. Adjust NDRE threshold: 0.3 → 0.25 (less sensitive)
  2. Reschedule drone survey: 09:00-15:00 (avoid embun)
  3. Update pilot SOP: angle consistency
Action: Update config via dashboard
```

**Scenario 2: High False Negative Rate (FN > 20%)**
```
Analysis: 24 pohon predicted sehat, tapi stres
Root cause: Stress muncul setelah survey, Sensor calibration issue
Decision:
  1. Increase survey frequency: weekly → bi-weekly
  2. Recalibrate drone sensor
  3. Create SPK manual inspection untuk pohon borderline (NDRE 0.48-0.52)
Action: Create SPK via dashboard
```

---

### D. SPK Management (From Point 2-3-5)

**SPK Validasi Drone:**

| Metric | Value | Status |
|--------|-------|--------|
| Total SPK Created | 31 | ✅ Active |
| Total Tasks | 48 | In Progress |
| Assigned to Mandor | 7 mandors | Distributed |
| Pending Tasks | 12 | 🔍 Monitor |
| Completed Tasks | 36 (75%) | On Track |

**API Endpoints:**
```
POST /api/v1/spk/validasi-drone        # Create SPK
GET /api/v1/spk/mandor/:id             # View SPK assigned to mandor
POST /api/v1/spk/:id/assign-surveyor   # Assign tasks to surveyor
```

**OPS SPK (Multi-Purpose):**

| Metric | Value | Status |
|--------|-------|--------|
| Total OPS SPK | 12 | Active |
| Status: PENDING | 1 | Waiting |
| Status: DIKERJAKAN | 0 | - |
| Status: SELESAI | 11 | ✅ Done |

**API Endpoints:**
```
GET /api/v1/ops/spk                    # List all OPS SPK
POST /api/v1/ops/spk/create            # Create OPS SPK
PUT /api/v1/ops/spk/:id/status         # Update status
```

**Visualization:**
- Kanban board: PENDING → DIKERJAKAN → SELESAI
- Timeline: SPK creation → assignment → completion
- Mandor workload: Bar chart (SPK count per mandor)
- Completion rate: Progress bar per SPK

---

### E. Anomaly Detection per Blok

**Operational Issues Requiring Tactical Decision:**

| Anomaly Type | Count | Severity | Action Required |
|--------------|-------|----------|-----------------|
| **Pohon Miring >30°** | 12 | 🔴 High | SPK penegakan + penyangga |
| **Pohon Mati** | 8 | 🔴 High | SPK eradikasi + karantina |
| **Gambut Amblas** | 5 blok | 🟡 Medium | SPK pembenahan drainase |
| **Spacing Tidak Standar** | 3 blok | 🟡 Medium | SPK reposisi/marking |
| **NDRE Rendah (Sehat)** | 23 pohon | 🟢 Low | Update threshold config |

**API Endpoint (Enhancement needed):**
```
GET /api/v1/analytics/anomaly-detection
Query params:
  - divisi, blok, date_range
  - anomaly_type: miring, mati, gambut, spacing, ndre

Response:
{
  "success": true,
  "data": {
    "anomalies": [
      {
        "type": "pohon_miring",
        "severity": "high",
        "count": 12,
        "trees": [
          {
            "id_npokok": "uuid-1",
            "tree_id": "P-D001A-16-11",
            "angle": 35,
            "location": "Blok A5-Row 10",
            "gps": {...},
            "photo_url": "..."
          }
        ],
        "recommended_action": "Create SPK penegakan pohon",
        "estimated_cost": "Rp 150,000 per pohon"
      }
    ]
  }
}
```

**Decision Flow:**

```
Detect Anomaly
    ↓
Analyze Severity (Auto-calculated)
    ↓
Generate Recommendation (AI/Rule-based)
    ↓
Asisten Manager Review
    ↓
Decision: Create SPK / Monitor / Ignore
    ↓
If Create SPK:
  → Select: Validasi Drone / OPS SPK (Penegakan/Eradikasi/Drainase)
  → Assign to Mandor
  → Set Priority & Deadline
  → Track Progress
```

---

### F. Mandor Performance Tracking

**Metrics per Mandor:**

| Mandor Name | SPK Assigned | Completed | Completion Rate | Avg Time | Quality Score |
|-------------|--------------|-----------|-----------------|----------|---------------|
| Joko Susilo | 5 | 4 | 80% | 2.3 days | 92% |
| Siti Aminah | 4 | 4 | 100% | 1.8 days | 95% |
| Ahmad Yani | 3 | 2 | 67% | 3.1 days | 88% |

**Quality Score Calculation:**
```
Quality Score = (
  Validation Accuracy × 40% +      // Seberapa akurat hasil validasi
  SOP Compliance × 30% +           // Kepatuhan SOP (foto, GPS, timestamp)
  Completion Speed × 20% +         // Kecepatan selesai (vs target)
  Surveyor Satisfaction × 10%      // Feedback dari surveyor
)
```

**API Endpoint:**
```
GET /api/v1/analytics/mandor-performance
Query params:
  - mandor_id (optional): Specific mandor
  - date_range: Performance period

Response:
{
  "success": true,
  "data": {
    "mandors": [
      {
        "mandor_id": "uuid-1",
        "name": "Joko Susilo",
        "spk_assigned": 5,
        "spk_completed": 4,
        "completion_rate": 0.80,
        "avg_completion_days": 2.3,
        "quality_score": 0.92,
        "breakdown": {
          "validation_accuracy": 0.94,
          "sop_compliance": 0.90,
          "speed_score": 0.85,
          "surveyor_rating": 4.6
        },
        "issues": [
          "1 SPK overdue (SPK/VAL/2025/005)"
        ],
        "recommendations": [
          "Reallocate overdue SPK to Siti Aminah"
        ]
      }
    ]
  }
}
```

**Visualization:**
- Leaderboard: Top performers
- Radar chart: Multi-dimensional performance (accuracy, speed, SOP, rating)
- Timeline: Task completion history
- Workload distribution: Balance check

**Action Based on Performance:**

| Condition | Action |
|-----------|--------|
| Completion rate < 70% | Investigate bottleneck, reassign tasks |
| Quality score < 80% | Provide training, review SOP |
| Overdue SPK > 2 | Escalate to Kepala Afdeling |
| Top performer | Reward/incentive, assign high-priority tasks |

---

## Action Buttons

### 1. Create SPK Validasi Drone

**Trigger:** Dari NDRE analysis atau anomaly detection

**Flow:**
```
Select Trees (dari tabel/map)
    ↓
Set Priority (URGENT/HIGH/NORMAL)
    ↓
Auto-populate SPK details:
  - Judul: "Validasi Drone - [Stress Level] - [Count] pohon"
  - Trees: Selected trees with NDRE data
  - Priority: Based on stress level
    ↓
Select Mandor (dari dropdown)
    ↓
Review & Submit
    ↓
API: POST /api/v1/spk/validasi-drone
    ↓
Redirect to SPK Detail page
```

**UI Component:**
```html
<button class="btn-primary" @click="createSPKValidasi">
  ➕ Create SPK Validasi Drone
</button>

<!-- Modal popup -->
<modal v-if="showCreateSPK">
  <h3>Create SPK Validasi Drone</h3>
  <tree-selector :trees="selectedTrees" />
  <priority-selector v-model="priority" />
  <mandor-selector v-model="mandor_id" />
  <button @click="submitSPK">Create SPK</button>
</modal>
```

---

### 2. Create OPS SPK

**Trigger:** Dari anomaly detection atau scheduled maintenance

**Flow:**
```
Select Fase & Sub-Tindakan
  → Pembibitan: Perawatan Bibit
  → TBM: Pemupukan TBM
  → TM: Pemupukan TM
  → Pemanenan: Panen TBS Rotasi
  → Replanting: Survey Replanting
    ↓
Select Jadwal (dari dropdown: frekuensi, interval)
    ↓
Fill SPK Details:
  - Nomor SPK: Auto-generated
  - Tanggal mulai/selesai
  - Penanggung jawab: Auto-fill (Asisten Manager)
  - Mandor: Select from dropdown
  - Lokasi: Afdeling, Blok
  - Uraian pekerjaan: Text area
    ↓
Review & Submit
    ↓
API: POST /api/v1/ops/spk/create
    ↓
Redirect to OPS SPK tracking page
```

---

### 3. Assign to Mandor

**Context:** From SPK detail page

**Flow:**
```
View SPK Detail (tasks breakdown)
    ↓
Select Mandor (from available mandors list)
    ↓
Review workload balance (show current load)
    ↓
Confirm assignment
    ↓
API: POST /api/v1/spk/:id/assign-surveyor
    ↓
Notification sent to Mandor
    ↓
SPK status: PENDING → DIKERJAKAN (auto-update)
```

---

### 4. Override Drone Prediction

**Trigger:** False positive/negative identified

**Flow:**
```
Tree Detail Page
    ↓
View: Drone Prediction vs Field Actual (mismatch)
    ↓
Click "Override Prediction"
    ↓
Select Correct Status:
  - Stres Berat
  - Stres Sedang
  - Sehat
    ↓
Add Reason (text area):
  "Bayangan awan saat survey, pohon sebenarnya sehat"
    ↓
API: PUT /api/v1/validation/:id/override
    ↓
Update confusion matrix calculation
    ↓
Log audit trail (who, when, why)
```

---

### 5. Adjust NDRE Threshold

**Trigger:** Confusion matrix analysis shows systematic bias

**Flow:**
```
Confusion Matrix Page
    ↓
Identify: FP rate > 5% untuk Blok A5
    ↓
Click "Adjust Threshold for Blok A5"
    ↓
Current threshold: 0.30
Recommended: 0.25 (based on analysis)
    ↓
Slider adjustment + preview impact:
  "With 0.25 threshold:
   - Stres Berat: 118 → 95 (-23 FP)
   - Precision: 83.7% → 89.2% (+5.5%)"
    ↓
Confirm & Apply
    ↓
API: PUT /api/v1/config/ndre-threshold
    ↓
Re-run NDRE classification with new threshold
    ↓
Update dashboard with new results
```

---

## API Endpoints

### Existing (From Point 1-5)

```javascript
// Drone NDRE (Point 1)
GET /api/v1/drone/ndre                 // List trees dengan filters
GET /api/v1/drone/ndre/statistics      // Aggregated stats
GET /api/v1/drone/ndre/filters         // Available filter values
GET /api/v1/drone/ndre/tree/:id        // Tree detail

// SPK Validasi (Point 2-3)
POST /api/v1/spk/validasi-drone        // Create SPK
GET /api/v1/spk/mandor/:id             // Mandor SPK list
GET /api/v1/spk/:id                    // SPK detail
POST /api/v1/spk/:id/assign-surveyor   // Assign tasks

// OPS SPK (Point 5)
GET /api/v1/ops/fase                   // List phases
GET /api/v1/ops/fase/:id/sub-tindakan  // Sub-actions
GET /api/v1/ops/sub-tindakan/:id/jadwal // Schedules
POST /api/v1/ops/spk/create            // Create OPS SPK
GET /api/v1/ops/spk                    // List OPS SPK
PUT /api/v1/ops/spk/:id/status         // Update status
```

---

### NEW - Required for Asisten Dashboard

```javascript
// Confusion Matrix & Validation Analysis
GET /api/v1/validation/confusion-matrix
  Query: divisi, blok, date_range
  Response: { matrix, metrics, per_divisi, recommendations }

GET /api/v1/validation/field-vs-drone
  Query: divisi, blok, stress_level, date_range
  Response: { distribution, common_causes, trees, recommendations }

// Anomaly Detection
GET /api/v1/analytics/anomaly-detection
  Query: divisi, blok, anomaly_type, date_range
  Response: { anomalies, severity, recommended_actions }

// Mandor Performance
GET /api/v1/analytics/mandor-performance
  Query: mandor_id, date_range
  Response: { mandors, performance_metrics, issues, recommendations }

// Configuration Management
GET /api/v1/config/ndre-threshold
  Query: divisi, blok
  Response: { current_threshold, recommended, history }

PUT /api/v1/config/ndre-threshold
  Body: { divisi, blok, new_threshold, reason }
  Response: { success, impact_analysis }

// Override & Audit
PUT /api/v1/validation/:id/override
  Body: { correct_status, reason, overridden_by }
  Response: { success, audit_log }

GET /api/v1/audit/validation-overrides
  Query: date_range, overridden_by
  Response: { overrides, summary }
```

---

## UI/UX Specifications

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ Header: Dashboard Asisten - [User Name] - [Afdeling]   │
├─────────────────────────────────────────────────────────┤
│ Quick Stats Cards (Row 1)                               │
│ [Total Trees] [Stres Berat] [SPK Active] [Completion%] │
├─────────────────────────────────────────────────────────┤
│ Main Content (3 columns)                                │
│ ┌─────────────┬─────────────────┬──────────────────┐   │
│ │ Column 1    │ Column 2        │ Column 3         │   │
│ │ (30%)       │ (40%)           │ (30%)            │   │
│ │             │                 │                  │   │
│ │ - NDRE      │ - Confusion     │ - SPK            │   │
│ │   Stats     │   Matrix        │   Management     │   │
│ │             │ - Field vs      │ - Mandor         │   │
│ │ - Anomaly   │   Drone         │   Performance    │   │
│ │   Alerts    │                 │                  │   │
│ │             │ - Threshold     │ - Quick          │   │
│ │ - Actions   │   Config        │   Actions        │   │
│ └─────────────┴─────────────────┴──────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

### Component Specifications

#### 1. Confusion Matrix Heatmap

```javascript
<ConfusionMatrix
  :data="confusionData"
  :colorScheme="['#e8f5e9', '#4caf50', '#2e7d32']"
  @cell-click="drillDown"
/>

// Props:
confusionData = {
  matrix: { TP, FP, TN, FN },
  metrics: { accuracy, precision, recall },
  labels: ["Stres", "Normal"]
}

// Visual:
        Prediksi Stres    Prediksi Normal
Aktual  ┌────────────────┬────────────────┐
Stres   │ TP: 118 █████  │ FN: 24 ██      │
        │ (83.7%)        │ (16.9%)        │
        ├────────────────┼────────────────┤
Normal  │ FP: 23 ██      │ TN: 745 █████  │
        │ (2.5%)         │ (97.5%)        │
        └────────────────┴────────────────┘

// Interaction:
- Hover: Show count + percentage
- Click: Drill-down to tree list (e.g., click TP → show 118 trees)
```

---

#### 2. Field vs Drone Scatter Plot

```javascript
<ScatterPlot
  :data="validationData"
  xAxis="ndre_value"
  yAxis="field_stress_score"
  :colorBy="category"  // TP=green, FP=red, TN=blue, FN=orange
  @point-click="showTreeDetail"
/>

// Visual:
Field Stress Score (0-10)
    10 │           ● FN
       │        ●     ●
     8 │     ● TP     ●
       │   ●   ●   ●
     6 │ ●   ●   ●   ●
       │   ●   ●       ● FP
     4 │ ●       ●   ●
       │   ● TN   ●
     2 │ ●   ●   ●
       │   ●   ●
     0 └─────────────────────── NDRE Value
       0   0.2  0.4  0.6  0.8

// Interaction:
- Hover: Show tree_id, NDRE, Field score
- Click: Open tree detail modal
- Select region: Bulk operations (e.g., select all FP → adjust threshold)
```

---

#### 3. SPK Kanban Board

```javascript
<KanbanBoard
  :columns="['PENDING', 'DIKERJAKAN', 'SELESAI']"
  :cards="spkList"
  @card-click="openSPKDetail"
  @card-drag="updateSPKStatus"
/>

// Visual:
┌────────────┬────────────┬────────────┐
│ PENDING    │ DIKERJAKAN │ SELESAI    │
│ (1 SPK)    │ (0 SPK)    │ (11 SPK)   │
├────────────┼────────────┼────────────┤
│ ┌────────┐ │            │ ┌────────┐ │
│ │SPK/VAL │ │            │ │SPK/OPS │ │
│ │/2025/  │ │            │ │/2025/  │ │
│ │032     │ │            │ │001     │ │
│ │━━━━━━━━│ │            │ │━━━━━━━━│ │
│ │12 trees│ │            │ │Panen   │ │
│ │URGENT  │ │            │ │TBS     │ │
│ │Mandor: │ │            │ │✓ Done  │ │
│ │Joko    │ │            │ └────────┘ │
│ └────────┘ │            │            │
│            │            │ ┌────────┐ │
│            │            │ │SPK/...│  │
│            │            │ └────────┘ │
└────────────┴────────────┴────────────┘

// Interaction:
- Drag card to change status (PENDING → DIKERJAKAN)
- Click card: Open detail modal
- Filter: By mandor, priority, date
```

---

#### 4. Anomaly Alert Widget

```javascript
<AnomalyAlerts
  :anomalies="anomalyList"
  :severity="['high', 'medium', 'low']"
  @alert-click="openAnomalyDetail"
  @action-click="createRemedialSPK"
/>

// Visual:
┌──────────────────────────────────┐
│ 🚨 Anomaly Alerts                │
├──────────────────────────────────┤
│ 🔴 High (2)                       │
│ • Pohon Miring >30°: 12 pohon    │
│   [View] [Create SPK]            │
│ • Pohon Mati: 8 pohon            │
│   [View] [Create SPK]            │
├──────────────────────────────────┤
│ 🟡 Medium (2)                     │
│ • Gambut Amblas: 5 blok          │
│   [View] [Create SPK]            │
│ • Spacing Issue: 3 blok          │
│   [View] [Monitor]               │
└──────────────────────────────────┘

// Interaction:
- [View]: Open detail modal with tree list + map
- [Create SPK]: Open SPK creation form (pre-filled)
- [Monitor]: Add to watchlist
```

---

### Color Scheme & Design Tokens

```css
/* Severity Colors */
--color-high:   #f44336;  /* Red */
--color-medium: #ff9800;  /* Orange */
--color-low:    #4caf50;  /* Green */

/* Status Colors */
--color-pending:    #ffc107;  /* Amber */
--color-dikerjakan: #2196f3;  /* Blue */
--color-selesai:    #4caf50;  /* Green */
--color-ditunda:    #9e9e9e;  /* Grey */

/* Confusion Matrix */
--color-tp: #4caf50;  /* True Positive - Green */
--color-fp: #f44336;  /* False Positive - Red */
--color-tn: #2196f3;  /* True Negative - Blue */
--color-fn: #ff9800;  /* False Negative - Orange */

/* Typography */
--font-size-h1: 24px;
--font-size-h2: 20px;
--font-size-body: 14px;
--font-size-small: 12px;

/* Spacing */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
```

---

## Implementation Priority

### Phase 1: Core Metrics (Week 1-2)
1. ✅ NDRE Statistics (Already done - Point 1)
2. ⏳ Confusion Matrix endpoint + visualization
3. ⏳ Field vs Drone distribution endpoint + scatter plot
4. ✅ SPK Management (Already done - Point 2-3-5)

### Phase 2: Analytics & Actions (Week 3-4)
5. ⏳ Anomaly detection endpoint + alert widget
6. ⏳ Mandor performance tracking
7. ⏳ Action buttons (Create SPK, Assign, Override)
8. ⏳ Threshold configuration UI

### Phase 3: Advanced Features (Week 5-6)
9. ⏳ Drill-down capability (divisi → blok → pohon)
10. ⏳ Bulk operations (select multiple trees → create SPK)
11. ⏳ Export reports (PDF, Excel)
12. ⏳ Audit trail & history

---

## Success Metrics

**KPI untuk Asisten Dashboard:**

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Dashboard load time | < 2 seconds | TBD | ⏳ |
| Confusion matrix update | Real-time | TBD | ⏳ |
| SPK creation time | < 2 minutes | TBD | ⏳ |
| False positive rate | < 3% | 2.5% | ✅ |
| User satisfaction | > 4.0/5.0 | TBD | ⏳ |

**Adoption Metrics:**

| Metric | Target | Measurement |
|--------|--------|-------------|
| Daily active users (Asisten) | 100% | Login frequency |
| SPK created via dashboard | > 90% | vs manual creation |
| Override rate | < 5% | Manual corrections |
| Threshold adjustments | 2-3 per month | Config changes |

---

## Support & Documentation

**User Guides:**
- Dashboard navigation (video tutorial)
- Confusion matrix interpretation
- SPK creation workflow
- Anomaly response procedures

**Technical Docs:**
- API endpoint documentation
- Database schema
- RBAC policies
- Troubleshooting guide

**Training Materials:**
- Asisten Manager onboarding
- Best practices for threshold adjustment
- Case studies: False positive/negative handling

---

**Document Status:** ✅ COMPLETE  
**Last Updated:** November 13, 2025  
**Version:** 1.0.0
