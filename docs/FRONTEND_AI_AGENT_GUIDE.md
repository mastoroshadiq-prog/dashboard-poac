# 🤖 FRONTEND AI AGENT - IMPLEMENTATION GUIDE

**Target:** AI Agent (Claude, GPT, etc.) building frontend dashboard  
**Style:** Pin-point, substantial, actionable  
**Date:** November 10, 2025

---

## 🎯 QUICK START

### **Your Mission:**
Build **Dashboard Operasional** UI that consumes PANEN harvest tracking data from backend API.

### **What You Get:**
- ✅ Backend API endpoint: `GET /api/v1/dashboard/panen`
- ✅ Complete data structure (see below)
- ✅ 885.3 ton TBS harvest data (4 SPKs, 8 executions)

### **What You Build:**
- Dashboard page with charts, tables, and KPI cards
- Responsive design (desktop + mobile)
- Interactive drill-down features

---

## 📡 API ENDPOINTS

### **PRIMARY ENDPOINT (RECOMMENDED)**

```http
GET /api/v1/dashboard/panen
Authorization: Bearer {jwt_token}
```

**Response Structure:**
```json
{
  "success": true,
  "data": {
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
  },
  "message": "Data KPI Hasil Panen berhasil diambil"
}
```

### **ALTERNATIVE ENDPOINT (Full Dashboard)**

```http
GET /api/v1/dashboard/operasional
Authorization: Bearer {jwt_token}
```

**Response:** Includes `kpi_hasil_panen` + old features (Validasi, APH, Sanitasi)

**⚠️ Note:** May log spk_header errors (safe to ignore for PANEN)

---

## 🎨 UI COMPONENTS TO BUILD

### **1. SUMMARY KPI CARDS (Top Row)**

**Data Source:** `data.summary`

**4 Cards Layout:**

```jsx
<div className="grid grid-cols-4 gap-4">
  {/* Card 1: Total TBS */}
  <KPICard
    title="Total Panen"
    value={`${summary.total_ton_tbs} ton`}
    subtitle="TBS Harvested"
    icon="📦"
    trend="+15% vs last month"
    color="blue"
  />
  
  {/* Card 2: Reject Rate */}
  <KPICard
    title="Reject Rate"
    value={`${summary.avg_reject_persen}%`}
    subtitle="Quality Control"
    icon="✅"
    status={summary.avg_reject_persen < 3 ? "good" : "warning"}
    color={summary.avg_reject_persen < 3 ? "green" : "yellow"}
  />
  
  {/* Card 3: Total SPK */}
  <KPICard
    title="Total SPK"
    value={summary.total_spk}
    subtitle="Work Orders"
    icon="📋"
    badge="All Complete"
    color="purple"
  />
  
  {/* Card 4: Executions */}
  <KPICard
    title="Harvest Events"
    value={summary.total_executions}
    subtitle="2x per week"
    icon="🌾"
    color="orange"
  />
</div>
```

**Styling Tips:**
- Large number: 32-40px font size
- Subtitle: 14px, gray color
- Icon: 24px emoji or SVG
- Card shadow: subtle elevation
- Hover: slight scale up (1.02x)

---

### **2. WEEKLY TREND CHART**

**Data Source:** `data.weekly_breakdown`

**Chart Type:** Combination (Bar + Line)

**Implementation (Chart.js):**

```javascript
const chartData = {
  labels: weekly_breakdown.map(w => 
    new Date(w.week_start).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })
  ),
  datasets: [
    {
      type: 'bar',
      label: 'Total TBS (ton)',
      data: weekly_breakdown.map(w => w.total_ton),
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      yAxisID: 'y',
    },
    {
      type: 'line',
      label: 'Reject Rate (%)',
      data: weekly_breakdown.map(w => w.avg_reject),
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      yAxisID: 'y1',
    }
  ]
};

const chartOptions = {
  responsive: true,
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: { display: true, text: 'TBS (ton)' }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      title: { display: true, text: 'Reject (%)' },
      grid: { drawOnChartArea: false }
    }
  }
};
```

**Alternative (Recharts for React):**

```jsx
<ComposedChart data={weekly_breakdown} width={800} height={400}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="week_start" />
  <YAxis yAxisId="left" />
  <YAxis yAxisId="right" orientation="right" />
  <Tooltip />
  <Legend />
  <Bar yAxisId="left" dataKey="total_ton" fill="#3b82f6" name="TBS (ton)" />
  <Line yAxisId="right" dataKey="avg_reject" stroke="#ef4444" name="Reject (%)" />
</ComposedChart>
```

**Chart Insights:**
- Show threshold line at 3% for reject rate
- Highlight highest/lowest week
- Add trend arrow (↗️ increasing, ↘️ decreasing)

---

### **3. SPK PERFORMANCE TABLE**

**Data Source:** `data.by_spk`

**Table Component:**

```jsx
<table className="w-full">
  <thead>
    <tr>
      <th>SPK Number</th>
      <th>Periode</th>
      <th>Lokasi</th>
      <th>Mandor</th>
      <th>Actual (ton)</th>
      <th>Reject %</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {by_spk.map((spk, idx) => (
      <tr key={idx} className="hover:bg-gray-50">
        <td className="font-mono">{spk.nomor_spk}</td>
        <td>{spk.periode}</td>
        <td>{spk.lokasi}</td>
        <td>{spk.mandor}</td>
        <td className="font-bold">{spk.total_ton}</td>
        <td>
          <Badge color={spk.avg_reject < 3 ? 'green' : 'yellow'}>
            {spk.avg_reject}%
          </Badge>
        </td>
        <td>
          <Badge color="green">✅ {spk.status}</Badge>
        </td>
        <td>
          <button onClick={() => showDetails(spk)}>
            Details →
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

**Interactive Features:**
- Sortable columns (click header to sort)
- Row click → expand to show executions
- Hover → highlight row
- Responsive: convert to cards on mobile

---

### **4. EXECUTION DETAILS MODAL (Drill-Down)**

**Triggered By:** Click row in SPK table

**Data Source:** `spk.executions` array

**Modal Component:**

```jsx
<Modal isOpen={showModal} onClose={() => setShowModal(false)}>
  <h2>{selectedSPK.nomor_spk} - Detailed Executions</h2>
  
  <div className="info-grid">
    <InfoRow label="Periode" value={selectedSPK.periode} />
    <InfoRow label="Lokasi" value={selectedSPK.lokasi} />
    <InfoRow label="Mandor" value={selectedSPK.mandor} />
    <InfoRow label="Status" value={selectedSPK.status} />
  </div>
  
  <div className="summary">
    <h3>Summary</h3>
    <p>Total: {selectedSPK.total_ton} ton</p>
    <p>Avg Reject: {selectedSPK.avg_reject}%</p>
    <p>Executions: {selectedSPK.execution_count}</p>
  </div>
  
  <div className="timeline">
    <h3>Execution Timeline</h3>
    {selectedSPK.executions.map((exec, idx) => (
      <TimelineItem key={idx}>
        <div className="date">{exec.tanggal}</div>
        <div className="details">
          <p><strong>Tim:</strong> {exec.petugas}</p>
          <p><strong>Hasil:</strong> {exec.ton_tbs} ton TBS</p>
          <p><strong>Reject:</strong> {exec.reject_persen}%</p>
        </div>
      </TimelineItem>
    ))}
  </div>
</Modal>
```

**Timeline Styling:**
- Vertical line connecting items
- Date on left, details on right
- Icon marker per item (✅ completed)
- Alternate background colors

---

### **5. MANDOR PERFORMANCE COMPARISON**

**Data Processing:**

```javascript
// Group by mandor
const mandorStats = by_spk.reduce((acc, spk) => {
  const mandor = spk.mandor;
  if (!acc[mandor]) {
    acc[mandor] = { name: mandor, total_ton: 0, avg_reject: 0, count: 0 };
  }
  acc[mandor].total_ton += spk.total_ton;
  acc[mandor].avg_reject += spk.avg_reject;
  acc[mandor].count += 1;
  return acc;
}, {});

// Calculate averages
const mandorArray = Object.values(mandorStats).map(m => ({
  name: m.name,
  total_ton: m.total_ton,
  avg_reject: (m.avg_reject / m.count).toFixed(2)
}));
```

**Bar Chart:**

```jsx
<BarChart data={mandorArray} width={600} height={300}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Bar dataKey="total_ton" fill="#3b82f6" name="Total TBS (ton)" />
  <Bar dataKey="avg_reject" fill="#ef4444" name="Avg Reject (%)" />
</BarChart>
```

---

### **6. AFDELING PRODUCTIVITY**

**Data Processing:**

```javascript
// Extract afdeling from lokasi
const afdelingStats = by_spk.map(spk => {
  const afdelingMatch = spk.lokasi.match(/Afdeling (\d+)/);
  const afdeling = afdelingMatch ? `Afd ${afdelingMatch[1]}` : spk.lokasi;
  return {
    afdeling,
    total_ton: spk.total_ton,
    percentage: ((spk.total_ton / summary.total_ton_tbs) * 100).toFixed(1)
  };
});
```

**Progress Bars:**

```jsx
<div className="productivity-list">
  {afdelingStats.map((afd, idx) => (
    <div key={idx} className="productivity-item">
      <div className="label">
        {afd.afdeling}: {afd.total_ton} ton
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${afd.percentage}%` }}
        />
      </div>
      <div className="percentage">{afd.percentage}%</div>
    </div>
  ))}
</div>
```

---

## 🎨 STYLING RECOMMENDATIONS

### **Color Palette**

```css
/* Primary */
--blue-500: #3b82f6;    /* TBS data */
--green-500: #10b981;   /* Success, good metrics */
--yellow-500: #f59e0b;  /* Warning */
--red-500: #ef4444;     /* Reject rate, critical */
--purple-500: #8b5cf6;  /* SPK count */
--orange-500: #f97316;  /* Executions */

/* Neutral */
--gray-100: #f3f4f6;    /* Background */
--gray-800: #1f2937;    /* Text */
```

### **Component Spacing**

```css
.kpi-card { padding: 1.5rem; margin-bottom: 1rem; }
.chart-container { margin: 2rem 0; }
.table { margin-top: 2rem; }
.modal { padding: 2rem; max-width: 800px; }
```

### **Responsive Breakpoints**

```css
/* Mobile */
@media (max-width: 768px) {
  .grid-4 { grid-template-columns: 1fr 1fr; } /* 2 columns */
  .chart { height: 300px; }
  table { display: none; } /* Use cards instead */
}

/* Tablet */
@media (max-width: 1024px) {
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop */
@media (min-width: 1025px) {
  .grid-4 { grid-template-columns: repeat(4, 1fr); }
}
```

---

## 🔧 STATE MANAGEMENT

### **React Example (Hooks)**

```jsx
import { useState, useEffect } from 'react';

function DashboardPanen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSPK, setSelectedSPK] = useState(null);
  
  useEffect(() => {
    fetchPanenData();
  }, []);
  
  const fetchPanenData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/dashboard/panen', {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch');
      
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage message={error} onRetry={fetchPanenData} />;
  if (!data) return <EmptyState />;
  
  return (
    <div className="dashboard-panen">
      <SummaryCards data={data.summary} />
      <WeeklyTrend data={data.weekly_breakdown} />
      <SPKTable 
        data={data.by_spk} 
        onRowClick={setSelectedSPK}
      />
      {selectedSPK && (
        <ExecutionModal 
          spk={selectedSPK}
          onClose={() => setSelectedSPK(null)}
        />
      )}
    </div>
  );
}
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### **1. Lazy Loading**
```jsx
// Load charts only when visible
import { lazy, Suspense } from 'react';

const WeeklyChart = lazy(() => import('./WeeklyChart'));

<Suspense fallback={<ChartSkeleton />}>
  <WeeklyChart data={weekly_breakdown} />
</Suspense>
```

### **2. Memoization**
```jsx
import { useMemo } from 'react';

const mandorStats = useMemo(() => {
  return calculateMandorStats(by_spk);
}, [by_spk]);
```

### **3. Virtual Scrolling (for large tables)**
```jsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={400}
  itemCount={by_spk.length}
  itemSize={60}
>
  {({ index, style }) => (
    <div style={style}>
      <SPKRow data={by_spk[index]} />
    </div>
  )}
</FixedSizeList>
```

---

## 🚨 ERROR HANDLING

### **Loading States**

```jsx
function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-32 bg-gray-200 rounded mb-4" />
      <div className="h-64 bg-gray-200 rounded mb-4" />
      <div className="h-96 bg-gray-200 rounded" />
    </div>
  );
}
```

### **Error States**

```jsx
function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h3>Failed to load data</h3>
      <p>{message}</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  );
}
```

### **Empty States**

```jsx
function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-icon">📭</div>
      <h3>No harvest data available</h3>
      <p>Data will appear here once harvest executions are recorded.</p>
    </div>
  );
}
```

---

## 🧪 TESTING CHECKLIST

### **Data Validation**
- [ ] All 4 summary cards display correct values
- [ ] Weekly chart shows 4 weeks of data
- [ ] SPK table shows 4 rows
- [ ] Each SPK has 2 executions
- [ ] Total TBS = 885.3 ton
- [ ] Avg reject = 2.18%

### **Interactivity**
- [ ] Click SPK row → modal opens
- [ ] Modal shows execution timeline
- [ ] Close modal → returns to table
- [ ] Hover SPK row → highlight effect
- [ ] Sort table columns → data reorders

### **Responsiveness**
- [ ] Desktop: 4-column card grid
- [ ] Tablet: 2-column card grid
- [ ] Mobile: single column
- [ ] Charts resize smoothly
- [ ] Table → cards on mobile

### **Error Scenarios**
- [ ] Network error → show error message
- [ ] Invalid token → redirect to login
- [ ] Empty data → show empty state
- [ ] Loading → show skeleton UI

---

## 📦 RECOMMENDED LIBRARIES

### **React Ecosystem**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.8.0",          // Charts
    "chart.js": "^4.4.0",          // Alternative charts
    "react-chartjs-2": "^5.2.0",   // Chart.js for React
    "tailwindcss": "^3.3.0",       // Styling
    "axios": "^1.5.0",             // HTTP client
    "date-fns": "^2.30.0",         // Date formatting
    "react-window": "^1.8.9"       // Virtual scrolling
  }
}
```

### **Vue Ecosystem**
```json
{
  "dependencies": {
    "vue": "^3.3.0",
    "vue-chartjs": "^5.2.0",
    "chart.js": "^4.4.0",
    "tailwindcss": "^3.3.0",
    "axios": "^1.5.0"
  }
}
```

---

## 🎯 IMPLEMENTATION PRIORITY

### **Phase 1: MVP (Day 1-2)**
1. ✅ Summary KPI cards (4 cards)
2. ✅ SPK performance table (basic)
3. ✅ Data fetching + error handling

### **Phase 2: Visualization (Day 3-4)**
4. ✅ Weekly trend chart
5. ✅ Mandor comparison chart
6. ✅ Responsive layout

### **Phase 3: Enhancement (Day 5)**
7. ✅ Execution details modal
8. ✅ Afdeling productivity
9. ✅ Loading/empty states
10. ✅ Polish + animations

---

## 💡 PRO TIPS

### **1. Use TypeScript (Optional but Recommended)**
```typescript
interface PanenSummary {
  total_ton_tbs: number;
  avg_reject_persen: number;
  total_spk: number;
  total_executions: number;
}

interface SPKData {
  nomor_spk: string;
  lokasi: string;
  mandor: string;
  status: string;
  periode: string;
  total_ton: number;
  avg_reject: number;
  execution_count: number;
  executions: Execution[];
}
```

### **2. Cache API Responses**
```javascript
// Use SWR (React) or VueQuery (Vue)
import useSWR from 'swr';

const { data, error } = useSWR('/api/v1/dashboard/panen', fetcher, {
  refreshInterval: 300000, // Auto-refresh every 5 min
  revalidateOnFocus: true
});
```

### **3. Add Download/Export**
```jsx
<button onClick={() => exportToCSV(by_spk)}>
  Export to CSV
</button>

function exportToCSV(data) {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `panen_${new Date().toISOString()}.csv`;
  a.click();
}
```

### **4. Print-Friendly View**
```css
@media print {
  .no-print { display: none; } /* Hide buttons, nav */
  .chart { page-break-inside: avoid; }
  .table { font-size: 10pt; }
}
```

---

## 📖 QUICK REFERENCE

### **Data Access Patterns**

```javascript
// Summary metrics
const totalTBS = data.summary.total_ton_tbs;
const avgReject = data.summary.avg_reject_persen;

// Loop SPKs
data.by_spk.forEach(spk => {
  console.log(spk.nomor_spk, spk.total_ton);
});

// Loop weeks
data.weekly_breakdown.forEach(week => {
  console.log(week.week_start, week.total_ton);
});

// Loop executions within SPK
const firstSPK = data.by_spk[0];
firstSPK.executions.forEach(exec => {
  console.log(exec.tanggal, exec.ton_tbs);
});
```

### **Common Calculations**

```javascript
// Target achievement
const target = 200; // from SPK
const actual = spk.total_ton;
const achievement = ((actual / target) * 100).toFixed(1);

// Quality status
const isGoodQuality = spk.avg_reject < 3;

// Weekly growth
const weeklyGrowth = ((week2.total_ton - week1.total_ton) / week1.total_ton * 100).toFixed(1);
```

---

## ✅ COMPLETION CHECKLIST

Before marking as done:

- [ ] All API calls use correct endpoint
- [ ] JWT token included in Authorization header
- [ ] Error handling implemented
- [ ] Loading states visible
- [ ] All 4 summary cards displayed
- [ ] Weekly chart renders correctly
- [ ] SPK table shows 4 rows
- [ ] Modal opens/closes smoothly
- [ ] Mobile responsive (tested on phone)
- [ ] Colors follow brand guidelines
- [ ] Tooltips show helpful info
- [ ] Print view works
- [ ] No console errors
- [ ] Performance optimized (< 2s load time)

---

## 🎓 LEARNING RESOURCES

- **Chart.js Docs:** https://www.chartjs.org/docs/
- **Recharts Docs:** https://recharts.org/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **React Best Practices:** https://react.dev/learn
- **API Integration:** Use `fetch` or `axios`

---

## 🆘 TROUBLESHOOTING

**Issue:** Data not loading  
**Fix:** Check console for CORS errors, verify token is valid

**Issue:** Charts not rendering  
**Fix:** Ensure chart library is installed, check data format

**Issue:** Modal not closing  
**Fix:** Check state management, ensure onClick handler is correct

**Issue:** Mobile layout broken  
**Fix:** Add responsive classes, test with Chrome DevTools mobile view

---

## 🎉 YOU'RE READY!

**Time Estimate:** 2-3 days for full implementation  
**Difficulty:** Intermediate  
**Result:** Production-ready dashboard with harvest tracking

**Go build! 🚀**
