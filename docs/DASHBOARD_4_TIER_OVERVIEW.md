# Dashboard 4-Tier Architecture - Overview

**Document Version:** 1.0.0  
**Date:** November 13, 2025  
**Status:** Design Approved  
**Author:** Backend Development Team

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Solution: 4-Tier Dashboard Architecture](#solution-4-tier-dashboard-architecture)
4. [Management Hierarchy](#management-hierarchy)
5. [Dashboard Tier Overview](#dashboard-tier-overview)
6. [Benefits & Rationale](#benefits--rationale)
7. [Related Documents](#related-documents)

---

## Executive Summary

### Current Situation
Backend API sudah implement 6 major points (Drone NDRE, SPK Validasi, Mandor Workflow, OPS SPK) tetapi dashboard structure masih ambiguous:
- "Dashboard Eksekutif" → Terlalu umum, untuk siapa?
- "Dashboard Operasional" → Metrics terlalu detail untuk eksekutif
- "Dashboard Teknis" → Tidak jelas scope-nya

### Proposed Solution
**4-Tier Dashboard Architecture** yang aligned dengan organizational hierarchy:

```
┌─────────────────────────────────────────────────┐
│ TIER 1: CORPORATE (Strategic)                   │
│ → Direktur Utama, Direktur Ops, GM              │
│ → Focus: ROI, Portfolio, Business Strategy      │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│ TIER 2: MANAGER (Managerial)                    │
│ → Estate Manager, Deputy Manager                │
│ → Focus: Estate KPI, Resource Allocation        │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│ TIER 3: ASISTEN (Tactical)                      │
│ → Asisten Manager, Kepala Afdeling              │
│ → Focus: Operational Excellence, QC, SPK        │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│ TIER 4: MANDOR (Execution)                      │
│ → Mandor, Surveyor                              │
│ → Focus: Task Execution, Daily Operations       │
└─────────────────────────────────────────────────┘
```

### Key Insight
**Confusion Matrix & NDRE Analysis → Dashboard Asisten (Tactical)**

**Why?**
- ✅ Asisten Manager adalah orchestrator workflow (Drone → SPK → Mandor → Surveyor)
- ✅ Confusion matrix butuh decision maker (adjust threshold, create SPK, override)
- ✅ Operational details (pohon mati, miring, gambut) adalah tactical concerns
- ❌ Terlalu detail untuk Corporate/Manager
- ❌ Terlalu kompleks untuk Mandor (execution-only)

---

## Problem Statement

### 1. Ambiguous Dashboard Naming
**Current routes:**
```javascript
GET /api/v1/dashboard/kpi-eksekutif   // Untuk siapa? Direktur atau Manager?
GET /api/v1/dashboard/operasional     // Metrics terlalu detail untuk eksekutif
GET /api/v1/dashboard/teknis          // Scope tidak jelas
```

**Issues:**
- Tidak jelas role mana yang mengakses dashboard mana
- Metrics tidak sesuai dengan cognitive load per level
- Confusion matrix & NDRE analysis ada di "operasional" → Terlalu detail untuk eksekutif

---

### 2. Misalignment dengan Workflow yang Sudah Dibangun

**Point 1-5 yang sudah complete:**
```
Drone NDRE (910 trees) 
    ↓
SPK Validasi Drone (141 stres berat, 763 sedang)
    ↓ (Created by: Asisten Manager)
Mandor Assignment (7 SPK to mandor)
    ↓ (Delegated by: Asisten Manager)
Surveyor Execution (48 tasks)
    ↓ (Monitored by: Asisten Manager)
Validation Result → Confusion Matrix
    ↓ (Analyzed by: Asisten Manager)
```

**Siapa yang mengorkestra workflow ini?** → **ASISTEN MANAGER**

**Tapi confusion matrix ada di "Dashboard Operasional" yang seharusnya untuk eksekutif?** → **MISMATCH!**

---

### 3. Cognitive Load & Information Density

| Current Dashboard | Metrics Count | Appropriate For | Issue |
|-------------------|---------------|-----------------|-------|
| KPI Eksekutif | ~30 metrics | Direktur? Manager? | Terlalu banyak untuk Direktur |
| Operasional | ~50+ metrics | Asisten? Eksekutif? | Terlalu detail untuk Eksekutif |
| Teknis | ~40 metrics | ??? | Tidak jelas user-nya |

**Problem:** Information density tidak match dengan decision-making level.

---

## Solution: 4-Tier Dashboard Architecture

### Design Principles

#### 1. **Separation of Concerns**
Setiap tier punya scope yang jelas:
- **Corporate:** Business strategy (What & Why)
- **Manager:** Operational strategy (How much & Where)
- **Asisten:** Tactical execution (How & When)
- **Mandor:** Operational execution (Do & Report)

#### 2. **Appropriate Cognitive Load**
```
Corporate:  10-15 KPI  (aggregated, high-level)
Manager:    20-30 KPI  (divisi comparison, moderate detail)
Asisten:    50-100 KPI (blok/pohon detail, full analysis)
Mandor:     15-25 KPI  (task-oriented, execution focus)
```

#### 3. **Aligned with Org Hierarchy**
Dashboard structure follows real-world organizational structure di perkebunan kelapa sawit.

#### 4. **Role-Based Access Control (RBAC)**
Clear permission mapping:
- Corporate → Direktur, GM
- Manager → Estate Manager, Deputy Manager
- Asisten → Asisten Manager, Kepala Afdeling
- Mandor → Mandor, Surveyor

---

## Management Hierarchy

### Organizational Structure (Real World)

```
┌────────────────────────────────────────────────────┐
│ LEVEL 1: CORPORATE / STRATEGIC                     │
│ ─────────────────────────────────────────────────  │
│ • Direktur Utama / Owner / Komisaris              │
│ • Direktur Operasional                             │
│ • General Manager (multi-estate)                   │
│                                                     │
│ Focus: Portfolio performance, ROI, ekspansi        │
│ Time horizon: Quarterly, Yearly                    │
│ Decision: Investasi, strategi bisnis, M&A          │
│ Location: Head office / Regional office            │
└────────────────────────────────────────────────────┘
              ↓
┌────────────────────────────────────────────────────┐
│ LEVEL 2: ESTATE / MANAGERIAL                       │
│ ─────────────────────────────────────────────────  │
│ • Estate Manager / Kebun Manager                   │
│ • Deputy Manager / Wakil Manager                   │
│                                                     │
│ Focus: Estate KPI, produktivitas, cost efficiency  │
│ Time horizon: Weekly, Monthly                      │
│ Decision: Resource allocation, SOP compliance      │
│ Location: Estate office                            │
└────────────────────────────────────────────────────┘
              ↓
┌────────────────────────────────────────────────────┐
│ LEVEL 3: DIVISIONAL / TACTICAL                     │
│ ─────────────────────────────────────────────────  │
│ • Kepala Afdeling (KA) / Head of Division         │
│ • Asisten Manager (AM) / Assistant Manager         │
│ • Asisten Afdeling / Division Assistant            │
│                                                     │
│ Focus: Operational excellence, quality control     │
│ Time horizon: Daily, Weekly                        │
│ Decision: SPK creation, task assignment, QC        │
│ Location: Afdeling office / Field                  │
└────────────────────────────────────────────────────┘
              ↓
┌────────────────────────────────────────────────────┐
│ LEVEL 4: OPERATIONAL / EXECUTION                   │
│ ─────────────────────────────────────────────────  │
│ • Mandor / Foreman / Supervisor                    │
│ • Krani / Admin / Clerk                            │
│ • Surveyor / Checker / Inspector                   │
│ • Pekerja Harian Lepas (PHL) / Daily Worker        │
│                                                     │
│ Focus: Task execution, daily operations            │
│ Time horizon: Real-time, Daily                     │
│ Decision: Work distribution, immediate action      │
│ Location: Field / TPH / Nursery                    │
└────────────────────────────────────────────────────┘
```

---

## Dashboard Tier Overview

### TIER 1: Corporate Dashboard

**Target Users:** Direktur Utama, Direktur Operasional, GM Multi-Estate

**URL:** `/api/v1/dashboard/corporate`

**Focus:** Business Intelligence, Portfolio Performance, Strategic Decision

**Key Characteristics:**
- ✅ Aggregated metrics (estate-level)
- ✅ Financial KPI (revenue, EBITDA, ROI)
- ✅ Trend analysis (YoY, MoM, forecast)
- ✅ Multi-estate comparison (jika ada)
- ❌ Tidak ada detail divisi/afdeling
- ❌ Tidak ada tree-level data

**Update Frequency:** Weekly / Monthly

**Visualization:** Executive summary (1 page), trend lines, simple charts

**Example Metrics:**
- Total Produksi: 15,240 ton (↑12% vs Q3)
- Cost Efficiency: Rp 4,200/kg (target: Rp 4,500)
- RSPO Compliance: 94% (target: 95%)
- ROI Drone Technology: 18% (vs manual: 12%)

---

### TIER 2: Manager Dashboard

**Target Users:** Estate Manager, Deputy Manager, Kepala Kebun

**URL:** `/api/v1/dashboard/manager`

**Focus:** Estate Performance, Resource Management, Operational Strategy

**Key Characteristics:**
- ✅ Afdeling-level comparison
- ✅ Productivity metrics (ton/ha per afdeling)
- ✅ Cost breakdown per divisi
- ✅ Labor efficiency & utilization
- ❌ Tidak sampai detail blok/pohon
- ❌ Tidak perlu confusion matrix

**Update Frequency:** Daily / Weekly

**Visualization:** Divisi comparison, heatmap per afdeling, bar charts

**Example Metrics:**
- Afdeling 1: 22.5 ton/ha (↑ vs avg 20 ton/ha)
- Labor Cost Divisi 2: Rp 1,200/kg (highest)
- SOP Compliance Afd 3: 87% (perlu improvement)
- Asset Utilization: Truck 85%, TPH 92%

---

### TIER 3: Asisten Dashboard ⭐ (MOST IMPORTANT)

**Target Users:** Asisten Manager, Kepala Afdeling, Asisten Afdeling

**URL:** `/api/v1/dashboard/asisten`

**Focus:** Operational Excellence, Quality Control, Tactical Decision Making

**Key Characteristics:**
- ✅ **Drone NDRE Analysis** (141 stres berat, 763 sedang)
- ✅ **Confusion Matrix Akurasi Drone** (TP/FP/TN/FN) ← KEY!
- ✅ **Distribusi Validasi Lapangan vs Prediksi** ← KEY!
- ✅ SPK Validasi Status (31 SPK, 48 tasks)
- ✅ Mandor Performance (completion rate)
- ✅ Anomaly Detection per Blok (NDRE, spacing, miring)
- ✅ Kondisi Detail: Pohon mati, miring, gambut, reposisi
- ✅ OPS SPK Tracking (pemupukan, panen, perawatan)
- ✅ Tree-level detail (GPS, foto, history)

**Update Frequency:** Real-time / Hourly

**Visualization:** Heatmap, scatter plot, confusion matrix, box plot

**Action Buttons:**
- Create SPK Validasi Drone
- Create OPS SPK (panen, pupuk, dll)
- Assign to Mandor
- Override drone prediction
- Adjust NDRE threshold

**Example Metrics:**
- Confusion Matrix: Accuracy 94.8%, Precision 83.7%
- False Positive Rate: 2.5% (23 pohon, cause: bayangan awan)
- Blok A5: Drone accuracy 62% (need recalibration)
- Pohon Miring >30°: 12 pohon (butuh SPK penegakan)

---

### TIER 4: Mandor Dashboard

**Target Users:** Mandor, Surveyor, Krani

**URL:** `/api/v1/dashboard/mandor`

**Focus:** Task Execution, Daily Operations, Field Work

**Key Characteristics:**
- ✅ My SPK List (active, pending, completed)
- ✅ Tasks to Assign (48 pending)
- ✅ Daily Progress (trees validated, tons harvested)
- ✅ Surveyor Workload (balanced distribution)
- ✅ Location Map (GPS routing)
- ❌ Tidak ada analysis/metrics kompleks
- ❌ Tidak perlu confusion matrix

**Update Frequency:** Real-time

**Visualization:** List view, kanban board, map, simple charts

**Action Buttons:**
- Assign task to surveyor
- Update task status
- Upload foto + GPS
- Mark SPK complete

**Example Metrics:**
- My Active SPK: 7 (2 urgent, 5 normal)
- Today's Tasks: 15 trees to validate
- Surveyor Ahmad: 8 tasks (70% done)
- Completion Rate: 85% (this week)

---

## Benefits & Rationale

### 1. Clear Role Separation

| Question | Before (3-Tier) | After (4-Tier) |
|----------|-----------------|----------------|
| Siapa lihat confusion matrix? | "Operasional" (ambiguous) | **Asisten** (clear) |
| Siapa yang butuh ROI analysis? | "Eksekutif" (Direktur atau Manager?) | **Corporate** (clear) |
| Siapa yang create SPK? | Tidak jelas | **Asisten** (clear) |
| Siapa yang execute task? | Tidak jelas | **Mandor** (clear) |

---

### 2. Aligned dengan Workflow (Point 1-5)

```
Point 1: Drone NDRE API
   ↓ (Asisten Manager analyze)
Point 2: SPK Validasi Drone
   ↓ (Asisten Manager create)
Point 3: Mandor Assignment
   ↓ (Asisten Manager delegate)
Point 4-5: OPS SPK + Validation
   ↓ (Asisten Manager monitor & analyze)
Confusion Matrix
   ↓ (Asisten Manager use for decision)
```

**Conclusion:** Asisten Manager adalah **orchestrator** → Butuh dashboard dengan **full analytics**.

---

### 3. Appropriate Cognitive Load

```
Corporate:   Simple, aggregated (30 seconds to understand)
Manager:     Moderate detail (5 minutes analysis)
Asisten:     Full detail + analysis (15-30 minutes deep dive)
Mandor:      Task-focused (immediate action)
```

**Confusion Matrix Analysis:**
- Butuh waktu: 10-15 menit
- Butuh pemahaman: Statistik (TP/FP/TN/FN)
- Butuh action: Adjust threshold, create SPK, override
- **Perfect fit:** Asisten Dashboard ✅

---

### 4. Scalability

Jika expand ke multi-estate:
- ✅ Corporate Dashboard: Easy to add estate comparison
- ✅ Manager Dashboard: Isolated per estate (no change needed)
- ✅ Asisten Dashboard: Same structure, different data source
- ✅ Mandor Dashboard: Same structure, different SPK list

---

### 5. RBAC Simplicity

```javascript
// Clear permission mapping
const dashboardAccess = {
  'direktur_utama': ['corporate'],
  'direktur_ops': ['corporate', 'manager'],
  'gm': ['corporate', 'manager'],
  'estate_manager': ['manager', 'asisten'],
  'deputy_manager': ['manager', 'asisten'],
  'kepala_afdeling': ['asisten', 'mandor'],
  'asisten_manager': ['asisten', 'mandor'],
  'mandor': ['mandor']
};
```

---

## Related Documents

### Implementation Guides
- **[DASHBOARD_4_TIER_TIER1_CORPORATE.md](./DASHBOARD_4_TIER_TIER1_CORPORATE.md)** - Corporate Dashboard Detail
- **[DASHBOARD_4_TIER_TIER2_MANAGER.md](./DASHBOARD_4_TIER_TIER2_MANAGER.md)** - Manager Dashboard Detail
- **[DASHBOARD_4_TIER_TIER3_ASISTEN.md](./DASHBOARD_4_TIER_TIER3_ASISTEN.md)** - Asisten Dashboard Detail (MOST IMPORTANT)
- **[DASHBOARD_4_TIER_TIER4_MANDOR.md](./DASHBOARD_4_TIER_TIER4_MANDOR.md)** - Mandor Dashboard Detail

### Technical Docs
- **[DASHBOARD_4_TIER_API_MAPPING.md](./DASHBOARD_4_TIER_API_MAPPING.md)** - API Endpoints Mapping
- **[DASHBOARD_4_TIER_RBAC.md](./DASHBOARD_4_TIER_RBAC.md)** - RBAC Implementation Guide
- **[DASHBOARD_4_TIER_IMPLEMENTATION.md](./DASHBOARD_4_TIER_IMPLEMENTATION.md)** - Implementation Roadmap

### Backend API Docs (Already Complete)
- **[API_OPS_SPK.md](./API_OPS_SPK.md)** - OPS SPK API (Point 5)
- **[POINT_5_COMPLETE.md](./POINT_5_COMPLETE.md)** - Point 5 Summary

---

## Approval & Sign-off

**Design Review:**
- ✅ Backend Team: Approved
- ⏳ Frontend Team: Pending review
- ⏳ Product Owner: Pending approval
- ⏳ Estate Manager: Pending UAT

**Next Steps:**
1. Frontend team review this architecture
2. Create wireframe/mockup per tier
3. Implement RBAC policies
4. Develop endpoints (confusion matrix, field vs drone)
5. UAT with real users (Asisten Manager, Mandor)

---

**Document Status:** ✅ COMPLETE  
**Last Updated:** November 13, 2025  
**Version:** 1.0.0
