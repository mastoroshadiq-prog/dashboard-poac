# 📊 DASHBOARD OPERASIONAL - ENHANCEMENT GUIDE

**Date:** November 10, 2025  
**Audience:** Product Manager, UX Designer, Frontend Team  
**Goal:** Maximize dashboard comprehensiveness with PANEN data model

---

## 🎯 OVERVIEW

Dashboard Operasional sekarang memiliki **2 data sources**:

1. **OLD Schema** (spk_header, spk_tugas)
   - Validasi Drone
   - APH (Aplikasi Pupuk Hayati)
   - Sanitasi

2. **NEW Schema** (ops_*, sop_*) - **Tahap 6 Model**
   - ✨ PANEN (Harvest Tracking) - **BARU!**

---

## 📋 INFORMASI YANG BISA DITAMPILKAN

### **SECTION 1: CORONG ALUR KERJA (Funnel Chart)** - EXISTING

**Data Source:** OLD schema  
**Endpoint:** `GET /api/v1/dashboard/operasional`

**Metrics Available:**
```json
{
  "data_corong": {
    // Base metrics
    "target_validasi": 2,
    "validasi_selesai": 2,
    "target_aph": 1,
    "aph_selesai": 1,
    "target_sanitasi": 2,
    "sanitasi_selesai": 1,
    
    // Enhancement metrics (added previously)
    "deadline_validasi": "2025-12-01",
    "deadline_aph": "2025-12-15",
    "deadline_sanitasi": "2025-11-30",
    
    "risk_level_validasi": "LOW",
    "risk_level_aph": "MEDIUM",
    "risk_level_sanitasi": "CRITICAL",
    
    "pelaksana_assigned_validasi": 2,
    "pelaksana_assigned_aph": 1,
    "pelaksana_assigned_sanitasi": 1,
    
    "blockers_validasi": ["No blockers"],
    "blockers_aph": ["Waiting equipment"],
    "blockers_sanitasi": ["Deadline passed by 3 days"]
  }
}
```

**UI Recommendations:**

1. **Main Funnel Chart** (Visual)
   - 3 stages: Validasi → APH → Sanitasi
   - Show: target vs selesai (completion rate %)
   - Color coding: Green (>80%), Yellow (50-80%), Red (<50%)

2. **Risk Indicators** (Icons)
   - 🟢 LOW: No action needed
   - 🟡 MEDIUM: Monitor closely
   - 🔴 CRITICAL: Immediate action required
   - Display next to each funnel stage

3. **Resource Allocation** (Mini bar chart)
   - Show pelaksana count per category
   - Warning if 0 pelaksana assigned

4. **Deadlines** (Timeline)
   - Visual timeline showing upcoming deadlines
   - Highlight overdue in red

5. **Blockers Panel** (Expandable list)
   - Click funnel stage → show blocker details
   - Severity badges (HIGH/MEDIUM/LOW)

---

### **SECTION 2: PAPAN PERINGKAT TIM (Leaderboard)** - EXISTING

**Data Source:** OLD schema  
**Endpoint:** `GET /api/v1/dashboard/operasional`

**Metrics Available:**
```json
{
  "data_papan_peringkat": [
    {
      "id_pelaksana": "uuid-mandor-agus",
      "selesai": 2,
      "total": 2,
      "rate": 100.0
    },
    {
      "id_pelaksana": "uuid-mandor-eko",
      "selesai": 1,
      "total": 1,
      "rate": 100.0
    }
  ]
}
```

**UI Recommendations:**

1. **Ranked Table**
   - Columns: Rank | Name | Completed | Total | Rate %
   - Sort by rate DESC (auto-ranked)
   - Top 3 highlighted (gold/silver/bronze badges)

2. **Visual Rate Indicator**
   - Progress bar per pelaksana
   - Color: Green (100%), Yellow (50-99%), Red (<50%)

3. **Filters**
   - By date range
   - By task type (Validasi/APH/Sanitasi)

---

### **✨ SECTION 3: KPI HASIL PANEN (NEW!)** - PANEN TRACKING

**Data Source:** NEW schema (ops_*, sop_*)  
**Endpoint:** `GET /api/v1/dashboard/panen`

**Metrics Available:**
```json
{
  "summary": {
    "total_ton_tbs": 885.3,
    "avg_reject_persen": 2.18,
    "total_spk": 4,
    "total_executions": 8
  },
  "by_spk": [
    {
      "nomor_spk": "SPK/PANEN/2025/001",
      "lokasi": "Blok A1-A10 (Afdeling 1)",
      "mandor": "Mandor Panen - Joko Susilo",
      "status": "SELESAI",
      "periode": "2025-10-14 s/d 2025-10-18",
      "total_ton": 200.8,
      "avg_reject": 1.95,
      "execution_count": 2,
      "executions": [
        {
          "tanggal": "2025-10-14",
          "ton_tbs": 102.5,
          "reject_persen": 2.0,
          "petugas": "Tim Panen 1 - 12 orang (Ketua: Agus Prasetyo)"
        }
      ]
    }
  ],
  "weekly_breakdown": [
    {
      "week_start": "2025-10-12",
      "total_ton": 200.8,
      "avg_reject": 1.95,
      "execution_count": 2
    }
  ]
}
```

**UI Recommendations:**

#### **3.1 Summary Cards (Top Row)**

```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│  Total Panen    │  Reject Rate    │  Total SPK      │  Harvest Events │
│  885.3 ton TBS  │  2.18%          │  4 documents    │  8 executions   │
│  📈 +15% MoM    │  ✅ <3% target  │  🟢 All done    │  2x per week    │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

**KPI Details:**
- **Total TBS:** Large number, show trend (vs last month)
- **Reject Rate:** Color-coded (Green <3%, Yellow 3-5%, Red >5%)
- **Total SPK:** Count with status badge
- **Executions:** Frequency indicator

#### **3.2 Weekly Trend Chart (Line/Bar Chart)**

**Chart Type:** Combination (Line + Bar)
- **Bar:** Total ton TBS per week
- **Line:** Reject rate % per week

**Data:**
```javascript
{
  x: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  bars: [200.8, 214.0, 228.0, 242.5],  // Total TBS
  line: [1.95, 1.95, 2.30, 2.50]       // Reject %
}
```

**Insights to Show:**
- 📈 Progressive increase (200.8 → 242.5 ton)
- ⚠️ Reject rate trending up (1.95% → 2.50%, but still <3%)
- 🎯 Target line at 3% (visual threshold)

#### **3.3 SPK Performance Table**

**Columns:**
| No | SPK Number | Periode | Lokasi | Mandor | Target | Actual | Reject % | Status |
|----|------------|---------|--------|--------|--------|--------|----------|--------|
| 1  | SPK/PANEN/2025/001 | Oct 14-18 | Afdeling 1 | Joko | 200 | 200.8 ✅ | 1.95% 🟢 | ✅ SELESAI |
| 2  | SPK/PANEN/2025/002 | Oct 21-25 | Afdeling 2 | Siti | 210 | 214.0 ✅ | 1.95% 🟢 | ✅ SELESAI |
| 3  | SPK/PANEN/2025/003 | Oct 28-Nov 1 | Afdeling 3 | Joko | 225 | 228.0 ✅ | 2.30% 🟢 | ✅ SELESAI |
| 4  | SPK/PANEN/2025/004 | Nov 4-8 | Afdeling 4 | Siti | 240 | 242.5 ✅ | 2.50% 🟢 | ✅ SELESAI |

**Interactive Features:**
- Click row → expand to show detailed executions
- Sort by: SPK number, periode, reject rate, actual ton
- Filter by: mandor, afdeling, status

#### **3.4 Drill-Down: Execution Details (Modal/Expandable)**

When user clicks SPK row, show:

```
SPK/PANEN/2025/001 - Detailed Executions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Periode: Oct 14-18, 2025
Lokasi: Blok A1-A10 (Afdeling 1)
Penanggung Jawab: Asisten Kebun - Budi Santoso
Mandor: Mandor Panen - Joko Susilo
Status: ✅ SELESAI

📊 Summary:
   Target: 200 ton
   Actual: 200.8 ton (+0.4% ✅)
   Reject: 1.95% (threshold <3% ✅)

📅 Execution Timeline:

Oct 14, 2025:
   ├─ Tim: Tim Panen 1 (12 orang, Ketua: Agus Prasetyo)
   ├─ Hasil: 102.5 ton TBS
   ├─ Reject: 2.1 ton (2.0%)
   └─ Catatan: Blok A1-A5 selesai. Kondisi buah sangat bagus,
               quality score: 98%

Oct 18, 2025:
   ├─ Tim: Tim Panen 2 (12 orang, Ketua: Bambang Sutejo)
   ├─ Hasil: 98.3 ton TBS
   ├─ Reject: 1.9 ton (1.9%)
   └─ Catatan: Blok A6-A10 selesai tepat waktu.
               Reject rate improvement!
```

**UI Components:**
- Timeline view with date markers
- Expandable catatan (field notes)
- Team composition (hover to see full team)
- Weather/condition indicators from catatan

#### **3.5 Mandor Performance Comparison**

**Chart Type:** Grouped Bar Chart

```javascript
{
  categories: ['Joko Susilo', 'Siti Aminah'],
  data: [
    { 
      name: 'Total TBS (ton)',
      values: [428.8, 456.5]  // Joko: SPK 001+003, Siti: SPK 002+004
    },
    {
      name: 'Avg Reject %',
      values: [2.13, 2.23]
    }
  ]
}
```

**Insights:**
- Who harvested more TBS?
- Who maintained better quality (lower reject)?
- Balanced workload?

#### **3.6 Afdeling Productivity Map**

**Chart Type:** Heat Map or Bar Chart

```
Afdeling 1: 200.8 ton ████████░░ 22.7%
Afdeling 2: 214.0 ton █████████░ 24.2%
Afdeling 3: 228.0 ton ██████████ 25.8%
Afdeling 4: 242.5 ton ███████████ 27.4%
```

**Insights:**
- Which afdeling is most productive?
- Progressive yield increase (A1 → A4)
- Future planning: prioritize high-yield areas

---

## 🎨 RECOMMENDED DASHBOARD LAYOUT

### **Desktop View (1920x1080)**

```
┌─────────────────────────────────────────────────────────────┐
│ DASHBOARD OPERASIONAL                        [Filter] [Date] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌───────────────────────────┬─────────────────────────────┐ │
│ │ SECTION 1: CORONG ALUR    │  SECTION 2: PAPAN PERINGKAT │ │
│ │                           │                             │ │
│ │  Validasi → APH → Sanitasi│  Rank | Name      | Rate    │ │
│ │  [Funnel Chart]           │   1.  | Agus      | 100%    │ │
│ │                           │   2.  | Eko       | 100%    │ │
│ │  Risk: 🟢 🟡 🔴          │   3.  | Sanitasi A| 50%     │ │
│ │  Deadlines: [Timeline]    │                             │ │
│ └───────────────────────────┴─────────────────────────────┘ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ✨ SECTION 3: KPI HASIL PANEN (NEW!)                    │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │                                                         │ │
│ │ [Summary Cards: Total TBS | Reject | SPK | Events]     │ │
│ │                                                         │ │
│ │ ┌─────────────────────┬─────────────────────────────┐  │ │
│ │ │ Weekly Trend Chart  │  SPK Performance Table      │  │ │
│ │ │ [Combo: Bar + Line] │  [4 rows, expandable]       │  │ │
│ │ └─────────────────────┴─────────────────────────────┘  │ │
│ │                                                         │ │
│ │ ┌─────────────────────┬─────────────────────────────┐  │ │
│ │ │ Mandor Comparison   │  Afdeling Productivity      │  │ │
│ │ │ [Grouped Bar]       │  [Heat Map]                 │  │ │
│ │ └─────────────────────┴─────────────────────────────┘  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### **Mobile View (Responsive)**

Stack sections vertically:
1. Summary Cards (2x2 grid)
2. Weekly Trend Chart (full width)
3. SPK Performance (swipeable cards)
4. Corong Alur Kerja (vertical funnel)
5. Papan Peringkat (top 5 only)

---

## 📊 ADDITIONAL INSIGHTS TO DISPLAY

### **AI-Generated Insights (Optional Enhancement)**

**Example Smart Insights:**

1. **Performance Trend**
   > "📈 Produktivitas panen meningkat 20% dari Week 1 ke Week 4 (200.8 → 242.5 ton)"

2. **Quality Alert**
   > "⚠️ Reject rate trending naik dari 1.95% ke 2.50%. Masih aman (<3%), tapi perlu dimonitor."

3. **Team Performance**
   > "⭐ Tim Siti Aminah menghasilkan 456.5 ton (51.6% total), 6% lebih tinggi dari Tim Joko."

4. **Forecast**
   > "🔮 Prediksi Week 5: ~255 ton TBS (berdasarkan trend +6.5% per minggu)"

5. **Resource Optimization**
   > "💡 Afdeling 4 paling produktif (27.4%). Rekomendasi: alokasi lebih banyak tim ke area ini."

**Where to Show:**
- Top banner (rotating insights)
- Tooltip on chart hover
- Dedicated "Insights" panel (expandable)

---

## 🎯 KEY PERFORMANCE INDICATORS (KPIs) - SUMMARY

### **Existing KPIs (OLD Schema):**
1. **Lead Time APH:** Average days
2. **Kepatuhan SOP:** Percentage
3. **Insidensi Baru:** Daily trend
4. **G4 Aktif:** Count
5. **Completion Rate:** Per task category
6. **Team Performance:** Leaderboard ranking

### **✨ NEW KPIs (PANEN - NEW Schema):**
1. **Total TBS Production:** Ton (monthly/weekly)
2. **Reject Rate:** Percentage (target <3%)
3. **SPK Completion:** Count & status
4. **Execution Frequency:** Events per period
5. **Mandor Productivity:** TBS per mandor
6. **Afdeling Yield:** TBS per location
7. **Quality Trend:** Reject rate over time
8. **Target Achievement:** Actual vs target %

---

## 🔄 INTEGRATION STRATEGY

### **Option 1: Unified Dashboard** (Recommended)
- Combine OLD + NEW metrics in single view
- Endpoint: `GET /api/v1/dashboard/operasional` (includes kpi_hasil_panen)
- **Risk:** May show spk_header errors in console (harmless)

### **Option 2: Separate Tabs**
- Tab 1: "Work Orders" (Validasi, APH, Sanitasi) - OLD schema
- Tab 2: "Harvest Tracking" (Panen) - NEW schema
- **Benefit:** Complete isolation, no errors

### **Option 3: Progressive Enhancement**
- Show OLD metrics first (fast load)
- Load PANEN metrics async (lazy load)
- **Benefit:** Better perceived performance

---

## 📈 FUTURE ENHANCEMENTS (Roadmap)

### **Phase 2 (Q1 2026):**
- Migrate Validasi to NEW schema
- Add: Validasi metrics to PANEN-style dashboard
- Unified workflow tracking

### **Phase 3 (Q2 2026):**
- Migrate APH & Sanitasi
- Full Tahap 6 model coverage
- Deprecate spk_header completely

### **Advanced Analytics:**
- Predictive models (yield forecasting)
- Anomaly detection (sudden drop in quality)
- Correlation analysis (weather vs reject rate)
- Mobile app integration (field data entry)

---

## 🎨 DESIGN PRINCIPLES

### **1. Information Hierarchy**
- **Primary:** Total TBS, Reject Rate (large, prominent)
- **Secondary:** SPK count, executions (medium)
- **Tertiary:** Detailed breakdowns (expandable)

### **2. Color Coding**
- **Green:** Good performance (>target, <threshold)
- **Yellow:** Warning (approaching threshold)
- **Red:** Critical (over threshold, overdue)
- **Blue:** Neutral info

### **3. Interactivity**
- Click chart → filter table
- Hover → show tooltip details
- Expand row → show execution timeline
- Toggle view: Table ↔ Chart

### **4. Responsiveness**
- Desktop: Multi-column layout
- Tablet: 2-column layout
- Mobile: Single column, swipeable cards

---

## 📚 DATA FRESHNESS

**Update Frequency:**
- **Real-time:** When user clicks "Refresh" button
- **Auto-refresh:** Every 5 minutes (configurable)
- **Cache:** Use SWR (stale-while-revalidate) pattern

**Loading States:**
- Show skeleton UI while loading
- Progressive enhancement (show cached data first)
- Error fallback with retry button

---

## 🎯 SUMMARY: COMPREHENSIVE DASHBOARD

**What to Show:**
1. ✅ **Work Order Progress** (Funnel)
2. ✅ **Team Performance** (Leaderboard)
3. ✅ **Harvest Summary** (Cards)
4. ✅ **Harvest Trend** (Charts)
5. ✅ **SPK Performance** (Table)
6. ✅ **Mandor Comparison** (Bar chart)
7. ✅ **Afdeling Productivity** (Heat map)
8. ✅ **Risk Indicators** (Icons)
9. ✅ **Deadlines** (Timeline)
10. ✅ **AI Insights** (Smart recommendations)

**Total Information Density:** 10 KPIs + 7 visualizations + drill-down details

**User Value:**
- **Planners:** Forecast future harvests
- **Supervisors:** Monitor team performance
- **Managers:** Track SPK completion
- **Executives:** High-level summary view
