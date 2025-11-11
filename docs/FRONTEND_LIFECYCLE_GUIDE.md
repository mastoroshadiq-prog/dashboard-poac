# FRONTEND GUIDE - LIFECYCLE PHASE 2

**Date:** November 11, 2025  
**Status:** Backend Complete ✅ Ready for Frontend

---

## 🎯 OBJECTIVE

Build **Multi-Phase Lifecycle Dashboard** (Pembibitan → TBM → TM → Pemanenan → Replanting)

**Deliverables:**
- 3 New Dashboard Widgets
- 1 Lifecycle Detail Page

---

## 📡 NEW APIs

### 1. Overview
```
GET /api/v1/lifecycle/overview
```
Returns: 5 phases summary, health index (76), total SPKs (11), total executions (22)

### 2. Phase Detail
```
GET /api/v1/lifecycle/phase/:phase_name
```
Params: Pembibitan, TBM, TM, Pemanenan, Replanting  
Returns: Phase info, SPKs, executions, weekly breakdown

### 3. SOP Compliance
```
GET /api/v1/lifecycle/sop-compliance
```
Returns: Compliance by phase, compliant/non-compliant status

---

## 🎨 TASKS

### TASK 1: Lifecycle Widget (Operasional Dashboard)

**Component:** `LifecycleOverviewWidget.vue`  
**API:** `/api/v1/lifecycle/overview`  
**Location:** Operasional Dashboard (6 columns)

**UI:**
- 5 phase cards horizontal
- Each shows: nama, SPK count, completion %
- Color: Green (>80%), Yellow (40-80%), Red (<40%)
- Click → navigate to detail page
- Auto-refresh: 5 minutes

**Data:**
```json
{
  "health_index": 76,
  "phases": [
    {
      "nama_fase": "Pembibitan",
      "total_spks": 2,
      "total_executions": 4,
      "completion_rate": 100
    }
  ]
}
```

---

### TASK 2: SOP Compliance Widget (Executive Dashboard)

**Component:** `SOPComplianceWidget.vue`  
**Location:** Executive Dashboard (4 columns)

**UI:**
- Overall compliance: 50% (large number)
- Compliant phases: 2/5
- Alert list: Needs Attention phases
- Horizontal bar chart (compliance ratio)

**Data:**
```json
{
  "overall_compliance": 50,
  "compliant_phases": 2,
  "total_phases": 5,
  "needs_attention": ["Panen", "Pembibitan", "Replanting"]
}
```

---

### TASK 3: Health Index Widget (Technical Dashboard)

**Component:** `PlantationHealthWidget.vue`  
**Location:** Technical Dashboard (6 columns)

**UI:**
- Gauge chart: Overall health (0-100)
- Phase breakdown table: nama, score, status
- Critical alert if any phase < 40%

**Data:**
```json
{
  "overall_health": 76,
  "by_phase": [
    {
      "nama_fase": "Pembibitan",
      "health_score": 100,
      "status": "EXCELLENT"
    }
  ],
  "critical_phases": ["Replanting"]
}
```

---

### TASK 4: Lifecycle Detail Page

**Component:** `LifecycleDetailPage.vue`  
**Route:** `/lifecycle/:phase_name`

**Sections:**

**A. Phase Selector (Top Tabs)**
- 5 tabs: Pembibitan | TBM | TM | Pemanenan | Replanting
- Badge: SPK count + completion %

**B. Phase Info Card**
- Display: nama_fase, age range (0-1 tahun), description

**C. Summary Metrics (4 KPI Cards)**
- Sub Activities count
- Schedules count
- SPKs count (selesai/total)
- Executions count

**D. SPK Table (Expandable)**
Columns: Nomor SPK, Status, Tanggal, Lokasi, Mandor, Exec Count

Expandable row shows:
- Execution list: tanggal, hasil, petugas

**E. Weekly Breakdown Chart**
- Line chart: X=weeks, Y=executions
- Tooltip: Week, SPK count, Execution count

---

## 📐 DESIGN

### Colors
```css
--excellent: #10b981  /* >80% */
--good: #3b82f6       /* 60-80% */
--fair: #f59e0b       /* 40-60% */
--critical: #ef4444   /* <40% */
```

### Typography
- Widget Title: 18px Bold
- Metric Value: 24px Bold
- Table Text: 14px Regular

---

## 🧪 TEST DATA

**Available:**
- Pembibitan: 2 SPKs, 4 exec, 100%
- TBM: 3 SPKs, 6 exec, 100%
- TM: 2 SPKs, 4 exec, 100%
- Pemanenan: 4 SPKs, 8 exec, 100%
- Replanting: 0 SPKs, 0 exec, 0%

**Health Index:** 76  
**Overall Compliance:** 50%

---

## ✅ CHECKLIST

- [ ] 3 widgets render correctly
- [ ] Detail page with phase selector works
- [ ] SPK table expand/collapse functional
- [ ] Charts display correctly
- [ ] Auto-refresh implemented
- [ ] Responsive design (mobile/tablet)
- [ ] Error handling for API calls
- [ ] Empty state for 0 SPKs (Replanting)

---

## 🚀 PRIORITY

**Week 1:** TASK 4 (Detail Page) + TASK 1 (Widget)  
**Week 2:** TASK 2 + TASK 3

---

## 📦 DELIVERABLES

1. `LifecycleOverviewWidget.vue`
2. `SOPComplianceWidget.vue`
3. `PlantationHealthWidget.vue`
4. `LifecycleDetailPage.vue`
5. Store module: `lifecycle.js`
6. Routes: `/lifecycle`, `/lifecycle/:phase`

---

**Backend Ready ✅**  
**Documentation:** `docs/API_LIFECYCLE.md`  
**Test:** All APIs verified

**GO BUILD! 🚀**
