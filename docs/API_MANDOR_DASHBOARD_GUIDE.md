# 📋 API MANDOR DASHBOARD - PANDUAN FRONTEND INTEGRATION

> **Dokumentasi Lengkap untuk Tim Frontend**  
> Backend API untuk Dashboard Mandor - Task Execution & Team Management

---

## 📌 OVERVIEW

Dashboard Mandor menyediakan 4 endpoint utama untuk monitoring dan manajemen tugas surveyor secara real-time. Semua endpoint menggunakan RESTful API dengan response format JSON.

**Base URL:** `http://localhost:3000/api/v1/mandor`  
**Authentication:** JWT Token (akan ditambahkan di fase berikutnya)  
**Content-Type:** `application/json`

---

## 📋 SPK MANAGEMENT ENDPOINTS

**PENTING:** Selain 4 endpoint dashboard di bawah, Mandor juga memiliki akses ke **SPK Management endpoints** untuk mengelola SPK secara komprehensif:

### 🔍 SPK List & Filtering
- `GET /api/v1/spk/mandor/:mandor_id` - List SPK assigned to mandor with filters
- Support filtering by: status, priority, date range, pagination

### 📖 SPK Detail & Task Management  
- `GET /api/v1/spk/:spk_id` - Full SPK detail with task breakdown
- View all tasks, assignments, progress per SPK

### 👥 Task Assignment to Surveyor
- `POST /api/v1/spk/:spk_id/assign-surveyor` - Assign specific tasks to surveyor
- Bulk assignment, status tracking, assignment validation

**📚 Dokumentasi lengkap:** Lihat `docs/API_SPK_VALIDASI_DRONE_GUIDE.md` untuk detail implementasi SPK Management.

---

## 🎯 ENDPOINT 1: DASHBOARD OVERVIEW

**Fungsi:** Menampilkan ringkasan statistik dashboard mandor dengan informasi SPK, tugas, dan target harian.

### Request

```http
GET /api/v1/mandor/:mandor_id/dashboard
```

**Path Parameters:**
- `mandor_id` (string, required) - UUID mandor yang sedang login

**Example:**
```bash
curl -X GET "http://localhost:3000/api/v1/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/dashboard"
```

### Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": {
    "summary": {
      "active_spk": 6,
      "pending_tasks": 13,
      "in_progress_tasks": 0,
      "completed_today": 0,
      "urgent_count": 0,
      "overdue_count": 0
    },
    "today_targets": {
      "trees_to_validate": 55,
      "completed": 0,
      "remaining": 55,
      "progress_percentage": 0.0
    },
    "surveyor_workload": [],
    "urgent_items": []
  }
}
```

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `summary.active_spk` | integer | Jumlah SPK yang aktif (PENDING/DIKERJAKAN) |
| `summary.pending_tasks` | integer | Jumlah tugas berstatus PENDING |
| `summary.in_progress_tasks` | integer | Jumlah tugas sedang dikerjakan |
| `summary.completed_today` | integer | Jumlah tugas selesai hari ini |
| `summary.urgent_count` | integer | Jumlah item mendesak |
| `summary.overdue_count` | integer | Jumlah tugas yang terlambat |
| `today_targets.trees_to_validate` | integer | Total pohon target hari ini |
| `today_targets.completed` | integer | Jumlah validasi selesai |
| `today_targets.remaining` | integer | Sisa pohon yang belum divalidasi |
| `today_targets.progress_percentage` | float | Persentase progress (0-100) |
| `surveyor_workload` | array | Array beban kerja surveyor (future) |
| `urgent_items` | array | Array item mendesak (future) |

### UI Implementation Tips

**Untuk Card Summary:**
```javascript
// React/Vue example
<div className="summary-cards">
  <Card title="Active SPK" value={data.summary.active_spk} />
  <Card title="Pending Tasks" value={data.summary.pending_tasks} />
  <Card title="In Progress" value={data.summary.in_progress_tasks} />
  <Card title="Completed Today" value={data.summary.completed_today} />
</div>
```

**Untuk Progress Bar:**
```javascript
// Progress bar dengan percentage
<ProgressBar 
  value={data.today_targets.completed} 
  max={data.today_targets.trees_to_validate}
  percentage={data.today_targets.progress_percentage}
  label={`${data.today_targets.completed}/${data.today_targets.trees_to_validate} trees`}
/>
```

---

## 👥 ENDPOINT 2: SURVEYOR LIST & AVAILABILITY

**Fungsi:** Menampilkan daftar surveyor dengan status ketersediaan, beban kerja, dan performa.

### Request

```http
GET /api/v1/mandor/:mandor_id/surveyors
```

**Path Parameters:**
- `mandor_id` (string, required) - UUID mandor

**Example:**
```bash
curl -X GET "http://localhost:3000/api/v1/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/surveyors"
```

### Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": {
    "surveyors": [
      {
        "surveyor_id": "uuid-surveyor-1",
        "name": "John Doe",
        "status": "AVAILABLE",
        "current_workload": {
          "active_tasks": 3,
          "pending_tasks": 2,
          "completed_today": 5
        },
        "performance": {
          "completion_rate": 95.5,
          "avg_time_per_task": 25,
          "quality_score": 88.0
        }
      }
    ],
    "summary": {
      "total_surveyors": 5,
      "available": 3,
      "working": 2,
      "off_duty": 0
    }
  }
}
```

### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `surveyors[].surveyor_id` | string | UUID surveyor |
| `surveyors[].name` | string | Nama lengkap surveyor |
| `surveyors[].status` | enum | Status: `AVAILABLE`, `WORKING`, `OFF_DUTY` |
| `surveyors[].current_workload.active_tasks` | integer | Jumlah tugas aktif |
| `surveyors[].current_workload.pending_tasks` | integer | Jumlah tugas pending |
| `surveyors[].current_workload.completed_today` | integer | Tugas selesai hari ini |
| `surveyors[].performance.completion_rate` | float | Tingkat penyelesaian (%) |
| `surveyors[].performance.avg_time_per_task` | integer | Rata-rata waktu per tugas (menit) |
| `surveyors[].performance.quality_score` | float | Skor kualitas (0-100) |
| `summary.total_surveyors` | integer | Total surveyor |
| `summary.available` | integer | Surveyor tersedia |
| `summary.working` | integer | Surveyor sedang bekerja |
| `summary.off_duty` | integer | Surveyor off duty |

### Status Badge Colors

```javascript
const statusColors = {
  AVAILABLE: 'green',    // Surveyor siap menerima tugas baru
  WORKING: 'blue',       // Surveyor sedang mengerjakan tugas
  OFF_DUTY: 'gray'       // Surveyor tidak aktif/libur
};
```

### UI Implementation Tips

**Surveyor Table:**
```javascript
<Table>
  {surveyors.map(s => (
    <tr key={s.surveyor_id}>
      <td>{s.name}</td>
      <td><Badge color={statusColors[s.status]}>{s.status}</Badge></td>
      <td>{s.current_workload.active_tasks} active</td>
      <td>{s.performance.completion_rate}%</td>
      <td>{s.performance.quality_score}/100</td>
    </tr>
  ))}
</Table>
```

**Surveyor Cards:**
```javascript
<div className="surveyor-grid">
  {surveyors.map(s => (
    <SurveyorCard
      key={s.surveyor_id}
      name={s.name}
      status={s.status}
      workload={s.current_workload}
      performance={s.performance}
    />
  ))}
</div>
```

---

## ⚡ ENDPOINT 3: REAL-TIME TASK PROGRESS

**Fungsi:** Monitoring tugas yang sedang berlangsung dan penyelesaian terbaru (2 jam terakhir).

### Request

```http
GET /api/v1/mandor/:mandor_id/tasks/realtime
```

**Path Parameters:**
- `mandor_id` (string, required) - UUID mandor

**Example:**
```bash
curl -X GET "http://localhost:3000/api/v1/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/tasks/realtime"
```

### Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": {
    "active_tasks": [
      {
        "task_id": "task-uuid-1",
        "surveyor_name": "John Doe",
        "tree_id": "TREE-001",
        "location": "Block A-12",
        "status": "IN_PROGRESS",
        "elapsed_time_mins": 15,
        "photos_uploaded": 2,
        "checklist_completed": 3
      }
    ],
    "recent_completions": [
      {
        "task_id": "task-uuid-2",
        "surveyor_name": "Jane Smith",
        "tree_id": "TREE-002",
        "completed_at": "2025-11-14T08:30:00Z",
        "time_taken_mins": 20,
        "result": "SEHAT"
      }
    ]
  }
}
```

### Response Schema

**Active Tasks:**
| Field | Type | Description |
|-------|------|-------------|
| `active_tasks[].task_id` | string | UUID tugas |
| `active_tasks[].surveyor_name` | string | Nama surveyor yang mengerjakan |
| `active_tasks[].tree_id` | string | ID pohon yang divalidasi |
| `active_tasks[].location` | string | Lokasi pohon (blok/koordinat) |
| `active_tasks[].status` | string | Status (selalu `IN_PROGRESS`) |
| `active_tasks[].elapsed_time_mins` | integer | Waktu yang sudah berjalan (menit) |
| `active_tasks[].photos_uploaded` | integer | Jumlah foto yang sudah diupload |
| `active_tasks[].checklist_completed` | integer | Item checklist yang selesai |

**Recent Completions:**
| Field | Type | Description |
|-------|------|-------------|
| `recent_completions[].task_id` | string | UUID tugas |
| `recent_completions[].surveyor_name` | string | Nama surveyor |
| `recent_completions[].tree_id` | string | ID pohon |
| `recent_completions[].completed_at` | string | Timestamp selesai (ISO 8601) |
| `recent_completions[].time_taken_mins` | integer | Durasi pengerjaan (menit) |
| `recent_completions[].result` | string | Hasil validasi (SEHAT/SAKIT/dll) |

### UI Implementation Tips

**Live Task Monitor:**
```javascript
// Auto-refresh setiap 10 detik untuk real-time feel
useEffect(() => {
  const interval = setInterval(() => {
    fetchRealtimeTasks();
  }, 10000); // 10 seconds
  
  return () => clearInterval(interval);
}, []);

// Display active tasks with timer
<div className="active-tasks">
  {activeTasks.map(task => (
    <TaskCard key={task.task_id}>
      <h3>{task.surveyor_name}</h3>
      <p>Tree: {task.tree_id}</p>
      <Timer value={task.elapsed_time_mins} /> {/* Live counting timer */}
      <Progress photos={task.photos_uploaded} checklist={task.checklist_completed} />
    </TaskCard>
  ))}
</div>
```

**Recent Completions Feed:**
```javascript
<Timeline>
  {recentCompletions.map(task => (
    <TimelineItem key={task.task_id}>
      <Badge>{task.result}</Badge>
      <span>{task.surveyor_name} completed {task.tree_id}</span>
      <small>{formatTime(task.completed_at)}</small>
      <small>Duration: {task.time_taken_mins} mins</small>
    </TimelineItem>
  ))}
</Timeline>
```

---

## 📈 ENDPOINT 4: DAILY PERFORMANCE REPORT

**Fungsi:** Laporan performa harian dengan breakdown per surveyor, achievement rate, dan rekomendasi.

### Request

```http
GET /api/v1/mandor/:mandor_id/performance/daily?date=YYYY-MM-DD
```

**Path Parameters:**
- `mandor_id` (string, required) - UUID mandor

**Query Parameters:**
- `date` (string, optional) - Tanggal laporan (format: `YYYY-MM-DD`)
  - Default: hari ini
  - Example: `?date=2025-11-14`

**Example:**
```bash
# Today's report
curl -X GET "http://localhost:3000/api/v1/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/performance/daily"

# Specific date
curl -X GET "http://localhost:3000/api/v1/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/performance/daily?date=2025-11-13"
```

### Response

**Status:** `200 OK`

```json
{
  "success": true,
  "data": {
    "date": "2025-11-14",
    "targets": {
      "planned_tasks": 55,
      "completed": 42,
      "in_progress": 5,
      "pending": 8,
      "achievement_rate": 76.4
    },
    "by_surveyor": [
      {
        "surveyor_id": "uuid-1",
        "surveyor_name": "John Doe",
        "assigned_tasks": 12,
        "completed_tasks": 10,
        "completion_rate": 83.3,
        "avg_time_per_task": 22,
        "quality_score": 92.5
      }
    ],
    "issues": [
      {
        "type": "DELAYED",
        "severity": "medium",
        "description": "3 tasks delayed more than 30 minutes",
        "affected_tasks": ["task-1", "task-2", "task-3"]
      }
    ],
    "recommendations": [
      {
        "priority": "high",
        "action": "Redistribute 3 pending tasks from Surveyor A to available surveyors",
        "reason": "Workload imbalance detected"
      }
    ]
  }
}
```

### Response Schema

**Targets:**
| Field | Type | Description |
|-------|------|-------------|
| `targets.planned_tasks` | integer | Total tugas yang direncanakan |
| `targets.completed` | integer | Jumlah tugas selesai |
| `targets.in_progress` | integer | Jumlah tugas dalam proses |
| `targets.pending` | integer | Jumlah tugas pending |
| `targets.achievement_rate` | float | Tingkat pencapaian (%) |

**By Surveyor:**
| Field | Type | Description |
|-------|------|-------------|
| `by_surveyor[].surveyor_id` | string | UUID surveyor |
| `by_surveyor[].surveyor_name` | string | Nama surveyor |
| `by_surveyor[].assigned_tasks` | integer | Tugas yang ditugaskan |
| `by_surveyor[].completed_tasks` | integer | Tugas yang diselesaikan |
| `by_surveyor[].completion_rate` | float | Tingkat penyelesaian (%) |
| `by_surveyor[].avg_time_per_task` | integer | Rata-rata waktu (menit) |
| `by_surveyor[].quality_score` | float | Skor kualitas (0-100) |

**Issues:**
| Field | Type | Description |
|-------|------|-------------|
| `issues[].type` | enum | Tipe: `DELAYED`, `QUALITY`, `BOTTLENECK` |
| `issues[].severity` | enum | Tingkat: `low`, `medium`, `high`, `critical` |
| `issues[].description` | string | Deskripsi masalah |
| `issues[].affected_tasks` | array | Array UUID tugas terdampak |

**Recommendations:**
| Field | Type | Description |
|-------|------|-------------|
| `recommendations[].priority` | enum | Prioritas: `low`, `medium`, `high` |
| `recommendations[].action` | string | Aksi yang disarankan |
| `recommendations[].reason` | string | Alasan rekomendasi |

### UI Implementation Tips

**Performance Dashboard:**
```javascript
// Achievement gauge/chart
<GaugeChart 
  value={data.targets.achievement_rate}
  title="Daily Achievement"
  subtitle={`${data.targets.completed}/${data.targets.planned_tasks} tasks`}
/>

// Surveyor performance table
<Table>
  <thead>
    <tr>
      <th>Surveyor</th>
      <th>Completion Rate</th>
      <th>Avg Time</th>
      <th>Quality</th>
    </tr>
  </thead>
  <tbody>
    {data.by_surveyor.map(s => (
      <tr key={s.surveyor_id}>
        <td>{s.surveyor_name}</td>
        <td>{s.completion_rate}%</td>
        <td>{s.avg_time_per_task} min</td>
        <td><ProgressBar value={s.quality_score} max={100} /></td>
      </tr>
    ))}
  </tbody>
</Table>
```

**Issues & Recommendations:**
```javascript
// Issues alert panel
<AlertPanel>
  {data.issues.map((issue, idx) => (
    <Alert key={idx} severity={issue.severity}>
      <AlertTitle>{issue.type}</AlertTitle>
      {issue.description}
    </Alert>
  ))}
</AlertPanel>

// Recommendations action cards
<ActionCards>
  {data.recommendations.map((rec, idx) => (
    <ActionCard key={idx} priority={rec.priority}>
      <h4>{rec.action}</h4>
      <p>{rec.reason}</p>
      <Button>Take Action</Button>
    </ActionCard>
  ))}
</ActionCards>
```

---

## 📋 SPK MANAGEMENT API REFERENCE

> **Catatan:** Dokumentasi lengkap SPK Management ada di `docs/API_SPK_VALIDASI_DRONE_GUIDE.md`. Berikut ringkasan untuk implementasi frontend.

### 🔍 ENDPOINT: GET SPK LIST FOR MANDOR

```http
GET /api/v1/spk/mandor/:mandor_id
```

**Query Parameters:**
- `status` - Filter by SPK status (`PENDING`, `DIKERJAKAN`, `COMPLETED`)
- `priority` - Filter by priority (`NORMAL`, `HIGH`, `URGENT`)
- `date_from` - Filter from date (`YYYY-MM-DD`)
- `date_to` - Filter to date (`YYYY-MM-DD`)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id_spk": "uuid-spk-1",
      "no_spk": "SPK-DRONE-1731380000000",
      "nama_spk": "Validasi Drone Area D001A",
      "jenis_kegiatan": "VALIDASI_DRONE_NDRE",
      "status": "PENDING",
      "prioritas": "URGENT",
      "catatan": "Validasi 15 pohon berdasarkan survey drone NDRE",
      "created_at": "2025-01-25T10:00:00Z",
      "target_selesai": "2025-01-27",
      "completion_percentage": 60.5,
      "task_statistics": {
        "total": 15,
        "pending": 5,
        "assigned": 3,
        "in_progress": 2,
        "completed": 5,
        "urgent": 8
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total_pages": 3,
    "total_items": 45
  }
}
```

**Frontend Implementation:**
```javascript
// SPK List with filters
const fetchSPKList = async (mandorId, filters = {}) => {
  const params = new URLSearchParams({
    status: filters.status || '',
    priority: filters.priority || '',
    date_from: filters.dateFrom || '',
    date_to: filters.dateTo || '',
    page: filters.page || 1,
    limit: filters.limit || 20
  });
  
  const response = await fetch(
    `http://localhost:3000/api/v1/spk/mandor/${mandorId}?${params}`
  );
  return response.json();
};

// Usage in component
const [spkList, setSpkList] = useState([]);
const [filters, setFilters] = useState({ status: 'PENDING', priority: 'URGENT' });

useEffect(() => {
  fetchSPKList(mandorId, filters).then(data => {
    if (data.success) {
      setSpkList(data.data);
    }
  });
}, [mandorId, filters]);
```

### 📖 ENDPOINT: GET SPK DETAIL

```http
GET /api/v1/spk/:spk_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "spk": {
      "id_spk": "uuid-spk-1",
      "nama_spk": "Validasi Drone Area D001A",
      "status": "DIKERJAKAN",
      "keterangan": "Validasi area dengan stress level tinggi",
      "tanggal_dibuat": "2025-01-25T08:00:00Z",
      "tanggal_target_selesai": "2025-01-27T17:00:00Z"
    },
    "tugas": [
      {
        "id_tugas": "uuid-tugas-1",
        "status_tugas": "ASSIGNED",
        "prioritas": 1,
        "target_json": {
          "tree_id": "P-D001A-01-01",
          "id_npokok": "uuid-tree-1",
          "coordinates": [106.123, -6.456]
        },
        "pic_name": "Assigned to John Doe",
        "tanggal_dibuat": "2025-01-25T08:30:00Z"
      }
    ],
    "completion_percentage": 73.33,
    "summary": {
      "total_tugas": 15,
      "pending": 2,
      "assigned": 4,
      "in_progress": 3,
      "completed": 6
    }
  }
}
```

**Frontend Implementation:**
```javascript
// SPK Detail with task breakdown
const fetchSPKDetail = async (spkId) => {
  const response = await fetch(`http://localhost:3000/api/v1/spk/${spkId}`);
  return response.json();
};

// Task status colors
const getTaskStatusColor = (status) => {
  const colors = {
    PENDING: '#F59E0B',      // Orange
    ASSIGNED: '#3B82F6',     // Blue  
    IN_PROGRESS: '#10B981',  // Green
    COMPLETED: '#6B7280'     // Gray
  };
  return colors[status] || '#6B7280';
};

// Task priority indicators
const getPriorityIcon = (priority) => {
  return priority === 1 ? '🔥' : priority === 2 ? '⚡' : '📝';
};
```

### 👥 ENDPOINT: ASSIGN TASKS TO SURVEYOR

```http
POST /api/v1/spk/:spk_id/assign-surveyor
```

**Request Body:**
```json
{
  "id_tugas_list": [
    "uuid-tugas-1",
    "uuid-tugas-2",
    "uuid-tugas-3"
  ],
  "surveyor_id": "uuid-surveyor-123",
  "mandor_id": "uuid-mandor-456",
  "notes": "Prioritaskan area D001A terlebih dahulu"
}
```

**Response:**
```json
{
  "success": true,
  "message": "3 tugas berhasil ditugaskan ke surveyor",
  "data": {
    "assigned_count": 3,
    "failed_count": 0,
    "tugas_list": [
      {
        "id_tugas": "uuid-tugas-1",
        "id_npokok": "uuid-tree-1",
        "tree_id": "P-D001A-01-01",
        "status": "ASSIGNED",
        "assigned_to": "uuid-surveyor-123",
        "assigned_at": "2025-01-25T11:00:00Z"
      }
    ]
  }
}
```

**Frontend Implementation:**
```javascript
// Task assignment with validation
const assignTasksToSurveyor = async (spkId, taskIds, surveyorId, mandorId, notes) => {
  // Validation
  if (!taskIds || taskIds.length === 0) {
    throw new Error('Please select at least one task');
  }
  if (!surveyorId) {
    throw new Error('Please select a surveyor');
  }
  
  const response = await fetch(
    `http://localhost:3000/api/v1/spk/${spkId}/assign-surveyor`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_tugas_list: taskIds,
        surveyor_id: surveyorId,
        mandor_id: mandorId,
        notes: notes || ''
      })
    }
  );
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Assignment failed');
  }
  
  return data;
};

// Usage with error handling
const handleTaskAssignment = async () => {
  try {
    setLoading(true);
    
    const result = await assignTasksToSurveyor(
      selectedSPK.spk.id_spk,
      selectedTasks,
      selectedSurveyor,
      mandorId,
      assignmentNotes
    );
    
    if (result.success) {
      // Show success message
      showNotification(
        `${result.data.assigned_count} tasks assigned successfully!`,
        'success'
      );
      
      // Refresh data
      await Promise.all([
        refreshSPKDetail(),
        refreshSPKList(),
        refreshDashboard()
      ]);
      
      // Clear form
      setSelectedTasks([]);
      setAssignmentNotes('');
    }
  } catch (error) {
    showNotification(error.message, 'error');
  } finally {
    setLoading(false);
  }
};
```

### 🎯 SPK Management UI Flow

```
┌─────────────────────────────────────────────────────────┐
│  MANDOR SPK MANAGEMENT DASHBOARD                        │
├─────────────────────────────────────────────────────────┤
│  [Filter: Status ▼] [Priority ▼] [Date Range]           │
├─────────────────────────────────────────────────────────┤
│  SPK LIST (Left Panel)          │  SPK DETAIL (Right)   │
│  ┌─────────────────────────────┐ │ ┌─────────────────────┐ │
│  │ □ SPK-001 | URGENT | 60%   │ │ │ SPK-001 Detail      │ │
│  │   15 tasks (5 pending)     │ │ │ Status: DIKERJAKAN  │ │
│  │ □ SPK-002 | HIGH   | 80%   │ │ │ Progress: 60%       │ │
│  │   8 tasks (2 pending)      │ │ │                     │ │
│  │ ✓ SPK-003 | NORMAL | 100%  │ │ │ TASK LIST:          │ │
│  │   12 tasks (completed)     │ │ │ ☐ Tree-001 PENDING  │ │
│  └─────────────────────────────┘ │ │ ☐ Tree-002 PENDING  │ │
│                                 │ │ ✓ Tree-003 ASSIGNED │ │
│                                 │ │ ◷ Tree-004 PROGRESS │ │
│                                 │ │                     │ │
│                                 │ │ [Assign Selected]   │ │
│                                 │ │ Surveyor: [John ▼]  │ │
│                                 │ │ Notes: [_________]   │ │
│                                 │ └─────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 🔄 State Management Recommendations

```javascript
// Complete state management for SPK Management
const useMandorSPKManagement = (mandorId) => {
  const [state, setState] = useState({
    // Dashboard data
    dashboard: null,
    
    // SPK Management
    spkList: [],
    selectedSPK: null,
    spkFilters: {
      status: '',
      priority: '',
      dateFrom: '',
      dateTo: '',
      page: 1,
      limit: 20
    },
    
    // Task Assignment
    selectedTasks: [],
    assignmentData: {
      surveyorId: '',
      notes: ''
    },
    
    // UI State
    loading: {
      dashboard: false,
      spkList: false,
      spkDetail: false,
      assignment: false
    },
    errors: {}
  });
  
  // Actions
  const actions = {
    // Fetch data
    fetchDashboard: () => { /* implementation */ },
    fetchSPKList: (filters) => { /* implementation */ },
    fetchSPKDetail: (spkId) => { /* implementation */ },
    
    // SPK Management
    filterSPK: (filters) => { /* implementation */ },
    selectSPK: (spkId) => { /* implementation */ },
    
    // Task Assignment
    selectTasks: (taskIds) => { /* implementation */ },
    assignTasks: () => { /* implementation */ },
    
    // UI actions
    clearErrors: () => { /* implementation */ },
    resetForm: () => { /* implementation */ }
  };
  
  return { state, actions };
};
```

---

## 🔧 ERROR HANDLING

Semua endpoint menggunakan format error standar:

### Error Response Format

```json
{
  "success": false,
  "error": "Error message here",
  "message": "Detailed error description"
}
```

### HTTP Status Codes

| Code | Description | Handling |
|------|-------------|----------|
| `200` | Success | Parse data normally |
| `400` | Bad Request | Validate input parameters |
| `401` | Unauthorized | Redirect to login |
| `404` | Not Found | Show "endpoint not found" |
| `500` | Server Error | Show error message, retry option |

### Error Handling Example

```javascript
async function fetchMandorDashboard(mandorId) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/v1/mandor/${mandorId}/dashboard`
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || data.error);
    }
    
    if (!data.success) {
      throw new Error(data.error);
    }
    
    return data.data;
    
  } catch (error) {
    console.error('Failed to fetch dashboard:', error);
    
    // Show user-friendly error
    if (error.message.includes('not found')) {
      showNotification('Endpoint tidak ditemukan', 'error');
    } else if (error.message.includes('network')) {
      showNotification('Koneksi ke server gagal', 'error');
    } else {
      showNotification(error.message, 'error');
    }
    
    throw error;
  }
}
```

---

## 🚀 INTEGRATION EXAMPLES

### Complete Mandor Dashboard with SPK Management

```javascript
import axios from 'axios';
import { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:3000/api/v1';

function CompleteMandorDashboard({ mandorId }) {
  const [dashboard, setDashboard] = useState(null);
  const [spkList, setSpkList] = useState([]);
  const [selectedSPK, setSelectedSPK] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard overview
  const fetchDashboard = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/mandor/${mandorId}/dashboard`);
      if (data.success) setDashboard(data.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    }
  };

  // Fetch SPK list with filters
  const fetchSPKList = async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const { data } = await axios.get(`${API_BASE}/spk/mandor/${mandorId}?${params}`);
      if (data.success) setSpkList(data.data);
    } catch (err) {
      console.error('SPK list fetch error:', err);
    }
  };

  // Fetch SPK detail
  const fetchSPKDetail = async (spkId) => {
    try {
      const { data } = await axios.get(`${API_BASE}/spk/${spkId}`);
      if (data.success) setSelectedSPK(data.data);
    } catch (err) {
      console.error('SPK detail fetch error:', err);
    }
  };

  // Assign tasks to surveyor
  const assignTasks = async (spkId, taskIds, surveyorId, notes) => {
    try {
      const { data } = await axios.post(`${API_BASE}/spk/${spkId}/assign-surveyor`, {
        id_tugas_list: taskIds,
        surveyor_id: surveyorId,
        mandor_id: mandorId,
        notes: notes
      });
      
      if (data.success) {
        alert(`${data.data.assigned_count} tasks assigned successfully!`);
        // Refresh data
        fetchSPKDetail(spkId);
        fetchSPKList();
        fetchDashboard();
      }
    } catch (err) {
      console.error('Task assignment error:', err);
      alert('Failed to assign tasks');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboard(),
        fetchSPKList({ status: 'PENDING', limit: 10 })
      ]);
      setLoading(false);
    };
    
    loadData();
  }, [mandorId]);

  if (loading) return <Spinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="mandor-dashboard">
      {/* Dashboard Overview */}
      <section className="dashboard-overview">
        <h2>Dashboard Overview</h2>
        <SummaryCards data={dashboard?.summary} />
        <TargetsProgress data={dashboard?.today_targets} />
      </section>

      {/* SPK Management */}
      <section className="spk-management">
        <h2>SPK Management</h2>
        
        {/* SPK Filters */}
        <SPKFilters onFilter={fetchSPKList} />
        
        {/* SPK List */}
        <SPKList 
          spks={spkList} 
          onSelectSPK={fetchSPKDetail}
          selectedSPK={selectedSPK}
        />
        
        {/* SPK Detail & Task Assignment */}
        {selectedSPK && (
          <SPKDetail 
            spk={selectedSPK}
            onAssignTasks={assignTasks}
            mandorId={mandorId}
          />
        )}
      </section>

      {/* Real-time Monitoring */}
      <section className="realtime-monitoring">
        <h2>Real-time Activity</h2>
        <RealtimeTasks mandorId={mandorId} />
      </section>
    </div>
  );
}

// SPK Management Components
function SPKFilters({ onFilter }) {
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    date_from: '',
    date_to: ''
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  return (
    <div className="spk-filters">
      <select 
        value={filters.status} 
        onChange={(e) => handleFilterChange('status', e.target.value)}
      >
        <option value="">All Status</option>
        <option value="PENDING">Pending</option>
        <option value="DIKERJAKAN">In Progress</option>
        <option value="COMPLETED">Completed</option>
      </select>
      
      <select 
        value={filters.priority} 
        onChange={(e) => handleFilterChange('priority', e.target.value)}
      >
        <option value="">All Priority</option>
        <option value="URGENT">Urgent</option>
        <option value="HIGH">High</option>
        <option value="NORMAL">Normal</option>
      </select>
      
      <input 
        type="date" 
        value={filters.date_from}
        onChange={(e) => handleFilterChange('date_from', e.target.value)}
        placeholder="From Date"
      />
      
      <input 
        type="date" 
        value={filters.date_to}
        onChange={(e) => handleFilterChange('date_to', e.target.value)}
        placeholder="To Date"
      />
    </div>
  );
}

function SPKList({ spks, onSelectSPK, selectedSPK }) {
  return (
    <div className="spk-list">
      {spks.map(spk => (
        <div 
          key={spk.id_spk}
          className={`spk-card ${
            selectedSPK?.spk?.id_spk === spk.id_spk ? 'selected' : ''
          }`}
          onClick={() => onSelectSPK(spk.id_spk)}
        >
          <h3>{spk.nama_spk}</h3>
          <div className="spk-meta">
            <Badge status={spk.status}>{spk.status}</Badge>
            <Badge priority={spk.prioritas}>{spk.prioritas}</Badge>
          </div>
          <div className="task-stats">
            <span>Total: {spk.task_statistics.total}</span>
            <span>Pending: {spk.task_statistics.pending}</span>
            <span>Progress: {spk.completion_percentage}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SPKDetail({ spk, onAssignTasks, mandorId }) {
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [selectedSurveyor, setSelectedSurveyor] = useState('');
  const [notes, setNotes] = useState('');

  const handleTaskSelection = (taskId, checked) => {
    if (checked) {
      setSelectedTasks([...selectedTasks, taskId]);
    } else {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    }
  };

  const handleAssignment = () => {
    if (selectedTasks.length === 0) {
      alert('Please select at least one task');
      return;
    }
    if (!selectedSurveyor) {
      alert('Please select a surveyor');
      return;
    }
    
    onAssignTasks(
      spk.spk.id_spk, 
      selectedTasks, 
      selectedSurveyor, 
      notes
    );
    
    // Reset form
    setSelectedTasks([]);
    setSelectedSurveyor('');
    setNotes('');
  };

  return (
    <div className="spk-detail">
      <h3>SPK Detail: {spk.spk.nama_spk}</h3>
      
      {/* SPK Info */}
      <div className="spk-info">
        <p>Status: <Badge>{spk.spk.status}</Badge></p>
        <p>Priority: <Badge>{spk.spk.risk_level}</Badge></p>
        <p>Progress: {spk.completion_percentage}%</p>
      </div>

      {/* Task List */}
      <div className="task-list">
        <h4>Tasks ({spk.tugas.length})</h4>
        {spk.tugas.map(task => (
          <div key={task.id_tugas} className="task-item">
            <input 
              type="checkbox"
              checked={selectedTasks.includes(task.id_tugas)}
              onChange={(e) => handleTaskSelection(task.id_tugas, e.target.checked)}
              disabled={task.status_tugas !== 'PENDING'}
            />
            <span className="tree-id">{task.target_json?.tree_id}</span>
            <Badge status={task.status_tugas}>{task.status_tugas}</Badge>
            {task.status_tugas === 'ASSIGNED' && (
              <span className="assigned-to">→ {task.pic_name}</span>
            )}
          </div>
        ))}
      </div>

      {/* Assignment Form */}
      {selectedTasks.length > 0 && (
        <div className="assignment-form">
          <h4>Assign {selectedTasks.length} task(s) to Surveyor</h4>
          
          <select 
            value={selectedSurveyor}
            onChange={(e) => setSelectedSurveyor(e.target.value)}
          >
            <option value="">Select Surveyor</option>
            <option value="surveyor-1">John Doe</option>
            <option value="surveyor-2">Jane Smith</option>
            <option value="surveyor-3">Bob Wilson</option>
          </select>
          
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Assignment notes (optional)"
          />
          
          <button onClick={handleAssignment}>Assign Tasks</button>
        </div>
      )}
    </div>
  );
}
```

### Vue 3 + Fetch Example

```javascript
<template>
  <div class="mandor-surveyors">
    <div v-if="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <SurveyorCard 
        v-for="surveyor in surveyors" 
        :key="surveyor.surveyor_id"
        :data="surveyor"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps(['mandorId']);
const surveyors = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/v1/mandor/${props.mandorId}/surveyors`
    );
    const data = await response.json();
    
    if (data.success) {
      surveyors.value = data.data.surveyors;
    } else {
      throw new Error(data.error);
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>
```

### Angular Service Example

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class MandorService {
  private apiBase = 'http://localhost:3000/api/v1/mandor';

  constructor(private http: HttpClient) {}

  getDashboard(mandorId: string): Observable<any> {
    return this.http
      .get<ApiResponse<any>>(`${this.apiBase}/${mandorId}/dashboard`)
      .pipe(map(response => {
        if (!response.success) {
          throw new Error(response.error);
        }
        return response.data;
      }));
  }

  getSurveyors(mandorId: string): Observable<any> {
    return this.http
      .get<ApiResponse<any>>(`${this.apiBase}/${mandorId}/surveyors`)
      .pipe(map(response => {
        if (!response.success) {
          throw new Error(response.error);
        }
        return response.data;
      }));
  }

  getRealtimeTasks(mandorId: string): Observable<any> {
    return this.http
      .get<ApiResponse<any>>(`${this.apiBase}/${mandorId}/tasks/realtime`)
      .pipe(map(response => {
        if (!response.success) {
          throw new Error(response.error);
        }
        return response.data;
      }));
  }

  getDailyPerformance(mandorId: string, date?: string): Observable<any> {
    const url = date 
      ? `${this.apiBase}/${mandorId}/performance/daily?date=${date}`
      : `${this.apiBase}/${mandorId}/performance/daily`;
    
    return this.http
      .get<ApiResponse<any>>(url)
      .pipe(map(response => {
        if (!response.success) {
          throw new Error(response.error);
        }
        return response.data;
      }));
  }
}
```

---

## 🎨 UI/UX RECOMMENDATIONS

### Dashboard Layout Suggestion

```
┌─────────────────────────────────────────────────────┐
│  MANDOR DASHBOARD                                   │
├─────────────────────────────────────────────────────┤
│  [Active SPK: 6]  [Pending: 13]  [Progress: 0]     │
│  [Completed: 0]   [Urgent: 0]    [Overdue: 0]      │
├─────────────────────────────────────────────────────┤
│  TODAY'S TARGET                                     │
│  ████████░░░░░░░░░░░ 0/55 trees (0%)               │
├─────────────────────────────────────────────────────┤
│  SURVEYOR STATUS                                    │
│  ┌─────────────┬─────────────┬─────────────┐       │
│  │ John Doe    │ Jane Smith  │ Bob Wilson  │       │
│  │ AVAILABLE   │ WORKING     │ AVAILABLE   │       │
│  │ 3 tasks     │ 5 tasks     │ 2 tasks     │       │
│  └─────────────┴─────────────┴─────────────┘       │
├─────────────────────────────────────────────────────┤
│  REAL-TIME ACTIVITY                                 │
│  • John Doe - TREE-001 (15 mins elapsed)           │
│  • Jane Smith - TREE-002 (8 mins elapsed)          │
│                                                     │
│  RECENT COMPLETIONS                                 │
│  ✓ Bob Wilson completed TREE-003 (20 mins)         │
│  ✓ John Doe completed TREE-004 (18 mins)           │
└─────────────────────────────────────────────────────┘
```

### Color Scheme Recommendations

```javascript
const colors = {
  status: {
    AVAILABLE: '#10B981',   // Green
    WORKING: '#3B82F6',     // Blue
    OFF_DUTY: '#6B7280',    // Gray
  },
  severity: {
    low: '#10B981',         // Green
    medium: '#F59E0B',      // Orange
    high: '#EF4444',        // Red
    critical: '#DC2626',    // Dark Red
  },
  priority: {
    low: '#6B7280',         // Gray
    medium: '#F59E0B',      // Orange
    high: '#EF4444',        // Red
  }
};
```

### Refresh Intervals

```javascript
const refreshIntervals = {
  dashboard: 30000,        // 30 seconds
  surveyors: 60000,        // 1 minute
  realtimeTasks: 10000,    // 10 seconds (real-time feel)
  performance: 300000,     // 5 minutes
};
```

---

## 📝 TESTING ENDPOINTS

### Test Script

Gunakan script yang sudah disediakan:

```bash
# Test all endpoints
node test-mandor.js
```

### Manual Testing with cURL

**Dashboard Endpoints:**
```bash
# Test Dashboard Overview
curl -X GET "http://localhost:3000/api/v1/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/dashboard"

# Test Surveyors
curl -X GET "http://localhost:3000/api/v1/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/surveyors"

# Test Real-time
curl -X GET "http://localhost:3000/api/v1/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/tasks/realtime"

# Test Performance (today)
curl -X GET "http://localhost:3000/api/v1/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/performance/daily"

# Test Performance (specific date)
curl -X GET "http://localhost:3000/api/v1/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12/performance/daily?date=2025-11-13"
```

**SPK Management Endpoints:**
```bash
# Test SPK List (all)
curl -X GET "http://localhost:3000/api/v1/spk/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12"

# Test SPK List with filters
curl -X GET "http://localhost:3000/api/v1/spk/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12?status=PENDING&priority=URGENT&limit=5"

# Test SPK Detail
curl -X GET "http://localhost:3000/api/v1/spk/your-spk-id-here"

# Test Task Assignment
curl -X POST "http://localhost:3000/api/v1/spk/your-spk-id-here/assign-surveyor" \
  -H "Content-Type: application/json" \
  -d '{
    "id_tugas_list": ["task-id-1", "task-id-2"],
    "surveyor_id": "surveyor-uuid",
    "mandor_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "notes": "Testing assignment"
  }'
```

**Complete Workflow Test:**
```bash
# Run complete mandor workflow test
node test-mandor-workflow.js

# This will test:
# 1. View SPK list
# 2. View SPK detail  
# 3. Filter SPK by status/priority
# 4. Assign tasks to surveyor
# 5. Verify assignment
```

### Complete Postman Collection

Import collection lengkap untuk Dashboard + SPK Management:

```json
{
  "info": {
    "name": "Mandor Complete Dashboard & SPK Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Dashboard Endpoints",
      "item": [
        {
          "name": "Dashboard Overview",
          "request": {
            "method": "GET",
            "url": {
              "raw": "http://localhost:3000/api/v1/mandor/{{mandor_id}}/dashboard",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "v1", "mandor", "{{mandor_id}}", "dashboard"]
            }
          }
        },
        {
          "name": "Surveyor List",
          "request": {
            "method": "GET",
            "url": {
              "raw": "http://localhost:3000/api/v1/mandor/{{mandor_id}}/surveyors",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "v1", "mandor", "{{mandor_id}}", "surveyors"]
            }
          }
        },
        {
          "name": "Real-time Tasks",
          "request": {
            "method": "GET",
            "url": {
              "raw": "http://localhost:3000/api/v1/mandor/{{mandor_id}}/tasks/realtime",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "v1", "mandor", "{{mandor_id}}", "tasks", "realtime"]
            }
          }
        },
        {
          "name": "Daily Performance",
          "request": {
            "method": "GET",
            "url": {
              "raw": "http://localhost:3000/api/v1/mandor/{{mandor_id}}/performance/daily",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "v1", "mandor", "{{mandor_id}}", "performance", "daily"]
            }
          }
        }
      ]
    },
    {
      "name": "SPK Management",
      "item": [
        {
          "name": "Get SPK List (All)",
          "request": {
            "method": "GET",
            "url": {
              "raw": "http://localhost:3000/api/v1/spk/mandor/{{mandor_id}}",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "v1", "spk", "mandor", "{{mandor_id}}"]
            }
          }
        },
        {
          "name": "Get SPK List (Filtered)",
          "request": {
            "method": "GET",
            "url": {
              "raw": "http://localhost:3000/api/v1/spk/mandor/{{mandor_id}}?status=PENDING&priority=URGENT&limit=10",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "v1", "spk", "mandor", "{{mandor_id}}"],
              "query": [
                {
                  "key": "status",
                  "value": "PENDING"
                },
                {
                  "key": "priority", 
                  "value": "URGENT"
                },
                {
                  "key": "limit",
                  "value": "10"
                }
              ]
            }
          }
        },
        {
          "name": "Get SPK Detail",
          "request": {
            "method": "GET",
            "url": {
              "raw": "http://localhost:3000/api/v1/spk/{{spk_id}}",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "v1", "spk", "{{spk_id}}"]
            }
          }
        },
        {
          "name": "Assign Tasks to Surveyor",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"id_tugas_list\": [\"{{task_id_1}}\", \"{{task_id_2}}\"],\n  \"surveyor_id\": \"{{surveyor_id}}\",\n  \"mandor_id\": \"{{mandor_id}}\",\n  \"notes\": \"Testing task assignment from Postman\"\n}"
            },
            "url": {
              "raw": "http://localhost:3000/api/v1/spk/{{spk_id}}/assign-surveyor",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3000",
              "path": ["api", "v1", "spk", "{{spk_id}}", "assign-surveyor"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "mandor_id",
      "value": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
      "type": "string"
    },
    {
      "key": "spk_id",
      "value": "your-spk-id-here",
      "type": "string"
    },
    {
      "key": "surveyor_id",
      "value": "your-surveyor-id-here",
      "type": "string"
    },
    {
      "key": "task_id_1",
      "value": "your-task-id-1-here",
      "type": "string"
    },
    {
      "key": "task_id_2",
      "value": "your-task-id-2-here",
      "type": "string"
    }
  ]
}
```

---

## 🔐 AUTHENTICATION (Coming Soon)

> **Note:** Saat ini endpoint belum dilindungi JWT. Authentication akan ditambahkan di fase berikutnya.

### Future Authentication Flow

```javascript
// 1. Login to get JWT token
const { token } = await login(username, password);

// 2. Include token in requests
const response = await fetch(
  `${API_BASE}/${mandorId}/dashboard`,
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
);
```

---

## 📊 DATA FLOW DIAGRAM

```
┌──────────────┐
│   Frontend   │
│   Dashboard  │
└──────┬───────┘
       │ HTTP GET Request
       │ /api/v1/mandor/:id/dashboard
       ▼
┌──────────────┐
│   Express    │
│   Router     │────────┐
│ mandorRoutes │        │
└──────┬───────┘        │
       │                │ Query
       │                ▼
       │         ┌──────────────┐
       │         │   Supabase   │
       │         │  PostgreSQL  │
       │         └──────┬───────┘
       │                │ Result
       │                │
       ▼                ▼
┌──────────────────────────┐
│  JSON Response           │
│  { success, data }       │
└──────────────────────────┘
```

---

## 🐛 TROUBLESHOOTING

### Issue: 404 Not Found

**Problem:** Endpoint mengembalikan 404  
**Solution:**
1. Verifikasi server sudah running: `curl http://localhost:3000/health`
2. Check URL path benar: `/api/v1/mandor/...` (bukan `/api/mandor/...`)
3. Restart server jika baru deploy

### Issue: Empty Data

**Problem:** Endpoint return `success: true` tapi data kosong  
**Solution:**
- Normal behavior jika database belum ada data
- Check `summary.total_surveyors`, `active_tasks.length` untuk validasi
- Gunakan dummy data untuk testing UI

### Issue: CORS Error

**Problem:** Browser block request dari origin berbeda  
**Solution:**
```javascript
// Server sudah config CORS, pastikan frontend URL di whitelist
// Jika masih error, tambahkan di index.js:
app.use(cors({
  origin: 'http://localhost:3001', // Your frontend URL
  credentials: true
}));
```

### Issue: Server Crash

**Problem:** Server mati saat hit endpoint  
**Solution:**
1. Check server logs untuk error stack trace
2. Verifikasi Supabase connection aktif
3. Restart server: `node index.js`

---

## 📞 SUPPORT & CONTACT

**Backend Team:**
- Developer: Backend Team Dashboard POAC
- Repository: `mastoroshadiq-prog/dashboard-poac`
- Branch: `main`

**Latest Commit:**
- Commit ID: `f63cba9`
- Message: "feat: Implement Priority 1 Mandor Dashboard Endpoints"

**Files:**
- Dashboard Routes: `routes/mandorRoutes.js`
- SPK Management Routes: `routes/spkValidasiDroneRoutes.js`
- SPK Services: `services/spkValidasiDroneService.js`
- Dashboard Tests: `test-mandor.js`
- SPK Workflow Tests: `test-mandor-workflow.js`
- Documentation: 
  - `docs/API_MANDOR_DASHBOARD_GUIDE.md` (this file)
  - `docs/API_SPK_VALIDASI_DRONE_GUIDE.md` (SPK Management detailed guide)

---

## 📅 VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-14 | Initial release: 4 Priority 1 endpoints |

---

**Last Updated:** November 14, 2025  
**Status:** ✅ Production Ready  
**Backend Readiness:** 100%
