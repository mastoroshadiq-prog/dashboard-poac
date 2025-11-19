# FRONTEND INTEGRATION CHECKLIST - MANDOR DASHBOARD
> **Panduan Penyesuaian untuk Tim Frontend**  
> **Date**: November 18, 2025  
> **Version**: 2.0.0 (Corrected SPK Assignment Architecture)

---

## ⚠️ PERUBAHAN PENTING DARI ARSITEKTUR SEBELUMNYA

### ❌ Asumsi LAMA yang SALAH:
```javascript
// JANGAN seperti ini lagi!
if (user.profile === 'Mandor APH') {
  // Hanya tampilkan SPK tipe APH
  fetchSPKList({ tipe: 'APH' });
}

if (user.profile === 'Mandor Sensus') {
  // Hanya tampilkan SPK tipe Sensus
  fetchSPKList({ tipe: 'SENSUS' });
}
```

### ✅ Konsep BARU yang BENAR:
```javascript
// Yang BENAR: Filter berdasarkan assignment
// Mandor bisa dapat SPK apa saja yang di-assign ke mereka
const mandorId = user.id_pihak; // Dari JWT token
fetchDashboard(mandorId); // Backend otomatis filter by assignment

// Response akan berisi SEMUA SPK yang di-assign ke mandor ini
// Tidak peduli tipe (APH, Sensus, Sanitasi, Pupuk, dll)
```

---

## 📋 CHECKLIST PENYESUAIAN FRONTEND

### 1. ✅ Authentication & Token Management

#### A. Login Response
**Pastikan backend mengembalikan:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id_pihak": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "nama": "Agus (Mandor Sensus)",
    "role": "MANDOR",
    "tipe": "INTERNAL"
  }
}
```

**Frontend harus simpan:**
```javascript
// LocalStorage atau State Management
localStorage.setItem('jwt_token', response.data.token);
localStorage.setItem('user_id', response.data.user.id_pihak);
localStorage.setItem('user_name', response.data.user.nama);
localStorage.setItem('user_role', response.data.user.role);

// PENTING: Jangan simpan atau filter berdasarkan label "Mandor APH" / "Mandor Sensus"
// Label ini hanya deskriptif, bukan role berbeda!
```

---

### 2. ✅ Dashboard API Call

#### A. Endpoint URL (UPDATED)
```javascript
// BENAR
const mandorId = localStorage.getItem('user_id');
const endpoint = `/api/v1/mandor/${mandorId}/dashboard`;

// SALAH - jangan hardcode atau filter by tipe
const endpoint = `/api/v1/mandor/dashboard?tipe=APH`; // ❌ JANGAN!
```

#### B. Request Headers
```javascript
const config = {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
    'Content-Type': 'application/json'
  }
};

axios.get(`${BASE_URL}/mandor/${mandorId}/dashboard`, config);
```

#### C. Response Structure (UPDATED)
```javascript
{
  "success": true,
  "data": {
    "summary": {
      "active_spk": 2,              // Total SPK aktif
      "total_spk": 2,               // Total semua SPK
      "pending_tasks": 3,
      "in_progress_tasks": 1,
      "completed_today": 0
    },
    "spk_list": [                   // ✨ NEW: List semua SPK
      {
        "id_spk": "uuid-spk-01a",
        "nama_spk": "SPK01A - Validasi Drone D001",
        "status": "BARU",
        "risk_level": "HIGH",
        "deadline": "2025-12-01",
        "task_count": 2             // Jumlah tugas di SPK ini
      },
      {
        "id_spk": "uuid-spk-02b",
        "nama_spk": "SPK02B - APH Blok E002",
        "status": "DIKERJAKAN",
        "risk_level": "MEDIUM",
        "deadline": "2025-12-05",
        "task_count": 1
      }
    ],
    "today_targets": {
      "trees_to_validate": 3,
      "completed": 0,
      "remaining": 3,
      "progress_percentage": 0.0
    },
    "urgent_items": [               // ✨ NEW: Tugas urgent
      {
        "id_tugas": "uuid-tugas-1",
        "id_spk": "uuid-spk-01a",
        "spk_name": "SPK01A - Validasi Drone D001",
        "tipe_tugas": "VALIDASI_DRONE",
        "status": "PENDING",
        "prioritas": 1,
        "target": {
          "blok": "D001A",
          "id_pohon": ["pohon-1", "pohon-2"]
        }
      }
    ]
  }
}
```

---

### 3. ✅ UI Components yang Perlu Disesuaikan

#### A. Dashboard Card - SPK List (NEW)
**Tambahkan component untuk menampilkan semua SPK:**

```jsx
// React Example
const SPKListCard = ({ spkList }) => {
  return (
    <div className="spk-list-card">
      <h3>SPK Saya ({spkList.length})</h3>
      {spkList.map(spk => (
        <div key={spk.id_spk} className="spk-item">
          <div className="spk-header">
            <h4>{spk.nama_spk}</h4>
            <span className={`badge status-${spk.status.toLowerCase()}`}>
              {spk.status}
            </span>
          </div>
          <div className="spk-details">
            <p>📋 {spk.task_count} tugas</p>
            <p>🚨 Risk: {spk.risk_level}</p>
            <p>📅 Deadline: {formatDate(spk.deadline)}</p>
          </div>
          <button onClick={() => viewSPKDetail(spk.id_spk)}>
            Lihat Detail & Tugaskan
          </button>
        </div>
      ))}
    </div>
  );
};
```

#### B. Summary Cards (UPDATED)
```jsx
const SummaryCards = ({ summary }) => {
  return (
    <div className="summary-grid">
      <div className="card">
        <h4>SPK Aktif</h4>
        <p className="number">{summary.active_spk}</p>
        <small>dari {summary.total_spk} total SPK</small>
      </div>
      <div className="card">
        <h4>Tugas Pending</h4>
        <p className="number">{summary.pending_tasks}</p>
      </div>
      <div className="card">
        <h4>Dalam Pengerjaan</h4>
        <p className="number">{summary.in_progress_tasks}</p>
      </div>
      <div className="card">
        <h4>Selesai Hari Ini</h4>
        <p className="number">{summary.completed_today}</p>
      </div>
    </div>
  );
};
```

#### C. Urgent Items Component (NEW)
```jsx
const UrgentItems = ({ urgentItems }) => {
  return (
    <div className="urgent-items">
      <h3>🚨 Tugas Urgent</h3>
      {urgentItems.length === 0 ? (
        <p>Tidak ada tugas urgent</p>
      ) : (
        <ul>
          {urgentItems.map(item => (
            <li key={item.id_tugas} className="urgent-item">
              <span className="priority-badge">P{item.prioritas}</span>
              <div>
                <strong>{item.spk_name}</strong>
                <p>{item.tipe_tugas} - {item.target.blok}</p>
              </div>
              <button onClick={() => assignTask(item)}>Tugaskan</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

---

### 4. ✅ SPK Detail & Task Assignment

#### A. View SPK Detail API Call
```javascript
const viewSPKDetail = async (spkId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/spk/${spkId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    // Response structure
    const { spk, tugas } = response.data.data;
    
    // spk = { id_spk, nama_spk, status, keterangan, tanggal_dibuat, ... }
    // tugas = [{ id_tugas, status_tugas, target_json, prioritas, ... }]
    
    setSelectedSPK(spk);
    setTaskList(tugas);
    setShowDetailModal(true);
    
  } catch (error) {
    showError('Gagal mengambil detail SPK');
  }
};
```

#### B. Task Assignment Modal
```jsx
const TaskAssignmentModal = ({ spk, tasks, surveyors, onClose, onAssign }) => {
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [selectedSurveyor, setSelectedSurveyor] = useState(null);
  const [notes, setNotes] = useState('');
  
  const handleAssign = async () => {
    if (selectedTasks.length === 0 || !selectedSurveyor) {
      alert('Pilih tugas dan surveyor');
      return;
    }
    
    const payload = {
      id_tugas_list: selectedTasks,
      surveyor_id: selectedSurveyor,
      mandor_id: localStorage.getItem('user_id'),
      notes: notes
    };
    
    try {
      await axios.post(
        `${BASE_URL}/spk/${spk.id_spk}/assign-surveyor`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      alert('Tugas berhasil ditugaskan!');
      onAssign(); // Refresh dashboard
      onClose();
      
    } catch (error) {
      alert('Gagal menugaskan: ' + error.response?.data?.message);
    }
  };
  
  return (
    <div className="modal">
      <h2>{spk.nama_spk}</h2>
      
      <div className="task-selection">
        <h3>Pilih Tugas ({tasks.length})</h3>
        {tasks.map(task => (
          <label key={task.id_tugas} className="task-checkbox">
            <input
              type="checkbox"
              checked={selectedTasks.includes(task.id_tugas)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedTasks([...selectedTasks, task.id_tugas]);
                } else {
                  setSelectedTasks(selectedTasks.filter(id => id !== task.id_tugas));
                }
              }}
            />
            <span>
              {task.tipe_tugas} - {task.target_json.blok}
              <span className={`badge priority-${task.prioritas}`}>
                P{task.prioritas}
              </span>
            </span>
          </label>
        ))}
      </div>
      
      <div className="surveyor-selection">
        <h3>Pilih Surveyor</h3>
        <select 
          value={selectedSurveyor || ''} 
          onChange={(e) => setSelectedSurveyor(e.target.value)}
        >
          <option value="">-- Pilih Surveyor --</option>
          {surveyors
            .filter(s => s.status === 'AVAILABLE' || s.status === 'WORKING')
            .map(surveyor => (
              <option key={surveyor.surveyor_id} value={surveyor.surveyor_id}>
                {surveyor.name} - {surveyor.status} 
                ({surveyor.current_workload.active_tasks} tasks)
              </option>
            ))}
        </select>
      </div>
      
      <textarea
        placeholder="Catatan tambahan..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      
      <div className="modal-actions">
        <button onClick={onClose}>Batal</button>
        <button onClick={handleAssign} className="btn-primary">
          Tugaskan ({selectedTasks.length} tugas)
        </button>
      </div>
    </div>
  );
};
```

---

### 5. ✅ Surveyor List API Call

```javascript
const fetchSurveyors = async () => {
  const mandorId = localStorage.getItem('user_id');
  
  try {
    const response = await axios.get(
      `${BASE_URL}/mandor/${mandorId}/surveyors`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    // Response structure
    const { surveyors, summary } = response.data.data;
    
    // surveyors = [
    //   {
    //     surveyor_id, name, kode, status,
    //     current_workload: { active_tasks, pending_tasks, completed_today },
    //     performance: { completion_rate, avg_time_per_task, quality_score }
    //   }
    // ]
    
    setSurveyorList(surveyors);
    
  } catch (error) {
    showError('Gagal mengambil data surveyor');
  }
};
```

---

### 6. ✅ Filters & Search (OPTIONAL)

Jika frontend ingin filter SPK (misal by status):

```javascript
// Client-side filtering (data sudah di-filter by assignment di backend)
const filteredSPKs = spkList.filter(spk => {
  // Filter by status
  if (filterStatus && spk.status !== filterStatus) return false;
  
  // Search by name
  if (searchQuery && !spk.nama_spk.toLowerCase().includes(searchQuery.toLowerCase())) {
    return false;
  }
  
  return true;
});
```

**ATAU gunakan server-side filtering:**
```javascript
const fetchSPKListWithFilter = async (filters) => {
  const mandorId = localStorage.getItem('user_id');
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  
  const response = await axios.get(
    `${BASE_URL}/spk/mandor/${mandorId}?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  
  return response.data.data;
};
```

---

### 7. ✅ Error Handling

```javascript
// Axios interceptor untuk handle 401/403
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired atau invalid
      localStorage.clear();
      window.location.href = '/login';
      alert('Sesi habis. Silakan login kembali.');
    } else if (error.response?.status === 403) {
      // Forbidden - tidak punya akses
      alert('Anda tidak memiliki akses ke resource ini');
    }
    return Promise.reject(error);
  }
);
```

---

## 🧪 TESTING CHECKLIST UNTUK FRONTEND

### A. Manual Testing Steps

1. **Login sebagai Mandor Agus**
   ```
   - [ ] Token tersimpan di localStorage
   - [ ] user_id tersimpan (UUID mandor)
   - [ ] Redirect ke dashboard
   ```

2. **Dashboard Loading**
   ```
   - [ ] Summary cards tampil (SPK aktif, tugas pending, dll)
   - [ ] SPK list tampil (bisa 0, 1, atau lebih SPK)
   - [ ] Jika ada SPK, tampilkan nama, status, task count, deadline
   - [ ] Urgent items tampil (jika ada tugas prioritas tinggi)
   ```

3. **View SPK Detail**
   ```
   - [ ] Klik salah satu SPK dari list
   - [ ] Modal/page detail terbuka
   - [ ] Tampil informasi SPK (nama, status, keterangan)
   - [ ] Tampil list tugas (target_json, prioritas, status)
   - [ ] Checkbox untuk select tugas muncul
   ```

4. **Assign Task to Surveyor**
   ```
   - [ ] Pilih 1 atau lebih tugas (checkbox)
   - [ ] Dropdown surveyor tampil
   - [ ] Surveyor list sorted by availability
   - [ ] Submit assignment berhasil (HTTP 200)
   - [ ] Dashboard refresh otomatis setelah assign
   - [ ] Task status berubah menjadi "ASSIGNED"
   ```

5. **Logout & Login sebagai Mandor Eko**
   ```
   - [ ] Mandor Eko lihat SPK list BERBEDA dari Mandor Agus
   - [ ] Jika Eko belum di-assign SPK, list kosong
   - [ ] Jika Eko punya SPK, tampil SPK miliknya
   ```

### B. Automated Testing (Jest/Cypress)

```javascript
// Example: Cypress E2E Test
describe('Mandor Dashboard', () => {
  before(() => {
    cy.login('mandor_agus', 'password'); // Custom command
  });
  
  it('should display dashboard summary', () => {
    cy.visit('/mandor/dashboard');
    cy.get('.summary-cards').should('be.visible');
    cy.get('.spk-list').should('be.visible');
  });
  
  it('should display assigned SPKs only', () => {
    cy.get('.spk-item').each($spk => {
      cy.wrap($spk).should('contain', 'SPK');
      cy.wrap($spk).find('.task-count').should('exist');
    });
  });
  
  it('should allow task assignment', () => {
    cy.get('.spk-item').first().find('button').click();
    cy.get('.modal').should('be.visible');
    cy.get('input[type="checkbox"]').first().check();
    cy.get('select[name="surveyor"]').select('Ahmad Fauzi');
    cy.get('button.btn-primary').click();
    cy.contains('berhasil').should('be.visible');
  });
});
```

---

## 📱 RESPONSIVE DESIGN CONSIDERATIONS

### Mobile Layout
```css
/* Mobile-first approach */
.spk-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.spk-item {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

@media (min-width: 768px) {
  .spk-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .spk-list {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## 🔄 STATE MANAGEMENT RECOMMENDATIONS

### Redux/Zustand Store Structure
```javascript
// store/mandorSlice.js
const mandorSlice = createSlice({
  name: 'mandor',
  initialState: {
    dashboard: {
      summary: null,
      spkList: [],
      urgentItems: [],
      loading: false,
      error: null
    },
    surveyors: {
      list: [],
      loading: false
    },
    selectedSPK: null,
    taskList: []
  },
  reducers: {
    setDashboard: (state, action) => {
      state.dashboard = { ...action.payload, loading: false };
    },
    setSurveyors: (state, action) => {
      state.surveyors = { list: action.payload, loading: false };
    },
    setSelectedSPK: (state, action) => {
      state.selectedSPK = action.payload.spk;
      state.taskList = action.payload.tasks;
    }
  }
});
```

---

## 📊 PERFORMANCE OPTIMIZATION

1. **Caching Strategy**
   ```javascript
   // Cache dashboard data for 5 minutes
   const CACHE_DURATION = 5 * 60 * 1000;
   
   const fetchDashboard = async (force = false) => {
     const cached = localStorage.getItem('dashboard_cache');
     const cacheTime = localStorage.getItem('dashboard_cache_time');
     
     if (!force && cached && cacheTime) {
       const age = Date.now() - parseInt(cacheTime);
       if (age < CACHE_DURATION) {
         return JSON.parse(cached);
       }
     }
     
     // Fetch fresh data
     const response = await axios.get(...);
     localStorage.setItem('dashboard_cache', JSON.stringify(response.data));
     localStorage.setItem('dashboard_cache_time', Date.now().toString());
     
     return response.data;
   };
   ```

2. **Lazy Loading**
   ```javascript
   // Load surveyor list only when needed
   const [surveyors, setSurveyors] = useState(null);
   
   const openAssignmentModal = async (spk) => {
     setSelectedSPK(spk);
     
     if (!surveyors) {
       // Load surveyors on-demand
       const data = await fetchSurveyors();
       setSurveyors(data);
     }
     
     setShowModal(true);
   };
   ```

---

## ✅ FINAL CHECKLIST UNTUK TIM FRONTEND

- [ ] **Remove hard-coded SPK type filters** (APH vs Sensus)
- [ ] **Update dashboard API endpoint** ke `/api/v1/mandor/${mandorId}/dashboard`
- [ ] **Add SPK List component** untuk tampilkan semua SPK assigned
- [ ] **Add Urgent Items component** untuk prioritas tinggi
- [ ] **Update task assignment modal** dengan multi-select
- [ ] **Add surveyor dropdown** dengan availability status
- [ ] **Implement JWT token management** (store, refresh, logout)
- [ ] **Add error handling** untuk 401/403
- [ ] **Test with 2 mandor users** (Agus & Eko) untuk verify data isolation
- [ ] **Mobile responsive** untuk tablet/phone
- [ ] **Loading states** untuk API calls
- [ ] **Success/error notifications** setelah assign tasks

---

## 🚀 DEPLOYMENT NOTES

### Environment Variables
```env
# .env.frontend
REACT_APP_API_BASE_URL=http://localhost:3000/api/v1
REACT_APP_JWT_EXPIRY=24h
REACT_APP_CACHE_DURATION=300000
```

### Build & Deploy
```bash
# Development
npm run dev

# Production build
npm run build

# Test production build locally
npm run preview
```

---

**Generated**: November 18, 2025  
**Author**: GitHub Copilot  
**Version**: 2.0.0  
**Status**: Ready for Frontend Team Implementation
