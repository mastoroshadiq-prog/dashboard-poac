# SPK ASSIGNMENT FLOW - MANDOR DASHBOARD
> **Klarifikasi Arsitektur**: SPK Assignment bukan Role-based, tapi Resource-based
> **Date**: November 18, 2025
> **Version**: 2.0.0 (CORRECTED)

---

## 🎯 KONSEP YANG BENAR

### ❌ SALAH PEMAHAMAN (Sebelumnya):
- Mandor APH hanya bisa lihat data APH
- Mandor Sensus hanya bisa lihat data Sensus
- **Role-based separation** berdasarkan spesialisasi

### ✅ PEMAHAMAN YANG BENAR (Sekarang):
- **Mandor = Mandor** (tidak dibedakan APH vs Sensus)
- Label "Mandor APH" / "Mandor Sensus" hanya nama/deskripsi, **bukan role berbeda**
- Yang membedakan adalah **SPK mana yang di-assign** ke mandor mana oleh Asisten Manager
- **Satu mandor bisa handle multiple SPK** dengan detail penugasan berbeda

---

## 📊 ALUR KERJA SPK ASSIGNMENT

### 1. Asisten Manager Membuat SPK

```http
POST /api/v1/spk/
Authorization: Bearer <asisten_token>

{
  "nama_spk": "SPK01A - Validasi Drone Area D001",
  "id_asisten_pembuat": "uuid-asisten-agus",
  "tanggal_target_selesai": "2025-12-01",
  "keterangan": "Validasi area stress tinggi"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id_spk": "spk-uuid-01a",
    "nama_spk": "SPK01A - Validasi Drone Area D001",
    "status_spk": "BARU"
  }
}
```

---

### 2. Asisten Manager Assign SPK ke Mandor (via Tugas)

**Scenario A: Assign SPK01A ke Mandor Agus**

```http
POST /api/v1/spk/spk-uuid-01a/tugas
Authorization: Bearer <asisten_token>

{
  "tugas": [
    {
      "id_pelaksana": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",  // Mandor Agus
      "tipe_tugas": "VALIDASI_DRONE",
      "target_json": {
        "blok": "D001A",
        "id_pohon": ["pohon-1", "pohon-2", "pohon-3"]
      },
      "prioritas": 1
    },
    {
      "id_pelaksana": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",  // Mandor Agus (lagi)
      "tipe_tugas": "VALIDASI_DRONE",
      "target_json": {
        "blok": "D001B",
        "id_pohon": ["pohon-4", "pohon-5"]
      },
      "prioritas": 2
    }
  ]
}
```

**Scenario B: Assign SPK02B ke Mandor Agus juga**

```http
POST /api/v1/spk/
{
  "nama_spk": "SPK02B - APH Blok E002"
}
```

**Kemudian:**
```http
POST /api/v1/spk/spk-uuid-02b/tugas
{
  "tugas": [
    {
      "id_pelaksana": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",  // Mandor Agus
      "tipe_tugas": "APH",
      "target_json": {
        "blok": "E002",
        "pohon_target": ["pohon-10", "pohon-11", "pohon-12"]
      },
      "prioritas": 1
    }
  ]
}
```

**Scenario C: Assign SPK02X ke Mandor Eko**

```http
POST /api/v1/spk/spk-uuid-02x/tugas
{
  "tugas": [
    {
      "id_pelaksana": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",  // Mandor Eko
      "tipe_tugas": "SANITASI",
      "target_json": {
        "area": "X001",
        "g4_count": 5
      },
      "prioritas": 3
    }
  ]
}
```

---

### 3. Mandor Agus Login dan Melihat Dashboard

```http
GET /api/v1/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/dashboard
Authorization: Bearer <mandor_agus_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "active_spk": 2,              // SPK01A dan SPK02B
      "total_spk": 2,
      "pending_tasks": 3,
      "in_progress_tasks": 0,
      "completed_today": 0
    },
    "spk_list": [
      {
        "id_spk": "spk-uuid-01a",
        "nama_spk": "SPK01A - Validasi Drone Area D001",
        "status": "BARU",
        "risk_level": "HIGH",
        "deadline": "2025-12-01",
        "task_count": 2               // 2 tugas di blok D001A & D001B
      },
      {
        "id_spk": "spk-uuid-02b",
        "nama_spk": "SPK02B - APH Blok E002",
        "status": "BARU",
        "risk_level": "MEDIUM",
        "deadline": "2025-12-05",
        "task_count": 1               // 1 tugas di blok E002
      }
    ],
    "urgent_items": [
      {
        "id_tugas": "tugas-uuid-1",
        "id_spk": "spk-uuid-01a",
        "spk_name": "SPK01A - Validasi Drone Area D001",
        "tipe_tugas": "VALIDASI_DRONE",
        "status": "PENDING",
        "prioritas": 1,
        "target": {
          "blok": "D001A",
          "id_pohon": ["pohon-1", "pohon-2", "pohon-3"]
        }
      }
    ]
  }
}
```

**Kesimpulan**: Mandor Agus bisa lihat **SPK01A dan SPK02B** karena kedua SPK tersebut punya tugas yang di-assign ke dia.

---

### 4. Mandor Agus Lihat Detail SPK01A

```http
GET /api/v1/spk/mandor/a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11?status=PENDING
Authorization: Bearer <mandor_agus_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "spk_list": [
      {
        "id_spk": "spk-uuid-01a",
        "nama_spk": "SPK01A - Validasi Drone Area D001",
        "status": "BARU",
        "tasks_summary": {
          "total": 2,
          "pending": 2,
          "completed": 0
        },
        "tasks": [
          {
            "id_tugas": "tugas-uuid-1",
            "tipe_tugas": "VALIDASI_DRONE",
            "status_tugas": "PENDING",
            "target_json": {
              "blok": "D001A",
              "id_pohon": ["pohon-1", "pohon-2", "pohon-3"]
            },
            "prioritas": 1
          },
          {
            "id_tugas": "tugas-uuid-2",
            "tipe_tugas": "VALIDASI_DRONE",
            "status_tugas": "PENDING",
            "target_json": {
              "blok": "D001B",
              "id_pohon": ["pohon-4", "pohon-5"]
            },
            "prioritas": 2
          }
        ]
      }
    ]
  }
}
```

---

### 5. Mandor Agus Assign Tugas ke Surveyor

**Mandor Agus memilih tugas mana yang akan dia tugaskan ke surveyor:**

```http
POST /api/v1/spk/spk-uuid-01a/assign-surveyor
Authorization: Bearer <mandor_agus_token>

{
  "id_tugas_list": ["tugas-uuid-1"],  // Pilih tugas blok D001A
  "surveyor_id": "11111111-1111-1111-1111-000000000001",  // Ahmad Fauzi (Surveyor)
  "mandor_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "notes": "Prioritaskan pohon dengan stress level tinggi"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully assigned 1 task(s) to surveyor",
  "data": {
    "assigned_tasks": [
      {
        "id_tugas": "tugas-uuid-1",
        "id_pelaksana": "11111111-1111-1111-1111-000000000001",
        "status_tugas": "ASSIGNED",
        "surveyor_name": "Ahmad Fauzi"
      }
    ],
    "spk_status_updated": true
  }
}
```

---

## 🔑 DATABASE SCHEMA UNTUK SPK ASSIGNMENT

### Tabel: `spk_header` (SPK Induk)
```sql
CREATE TABLE spk_header (
  id_spk UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_spk VARCHAR(255) NOT NULL,
  id_asisten_pembuat UUID NOT NULL,  -- FK ke master_pihak (Asisten yang buat SPK)
  status_spk VARCHAR(20) DEFAULT 'BARU',  -- BARU, DIKERJAKAN, SELESAI
  tanggal_dibuat TIMESTAMP DEFAULT NOW(),
  tanggal_target_selesai DATE,
  keterangan TEXT,
  FOREIGN KEY (id_asisten_pembuat) REFERENCES master_pihak(id_pihak)
);
```

### Tabel: `spk_tugas` (Detail Tugas)
```sql
CREATE TABLE spk_tugas (
  id_tugas UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_spk UUID NOT NULL,               -- FK ke spk_header
  id_pelaksana UUID NOT NULL,         -- FK ke master_pihak (Mandor/Surveyor yang eksekusi)
  tipe_tugas VARCHAR(15) NOT NULL,    -- VALIDASI_DRONE, APH, SANITASI, PUPUK
  target_json JSONB NOT NULL,         -- Detail target (blok, pohon, dll)
  status_tugas VARCHAR(20) DEFAULT 'BARU',  -- BARU, PENDING, DIKERJAKAN, SELESAI
  prioritas INTEGER DEFAULT 2,        -- 1=Tinggi, 2=Sedang, 3=Rendah
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (id_spk) REFERENCES spk_header(id_spk),
  FOREIGN KEY (id_pelaksana) REFERENCES master_pihak(id_pihak)
);
```

### Query: Cari SPK untuk Mandor Agus

```sql
-- Cari semua SPK yang punya tugas di-assign ke Mandor Agus
SELECT DISTINCT
  h.id_spk,
  h.nama_spk,
  h.status_spk,
  h.tanggal_target_selesai,
  COUNT(t.id_tugas) AS task_count
FROM spk_header h
INNER JOIN spk_tugas t ON h.id_spk = t.id_spk
WHERE t.id_pelaksana = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'  -- Mandor Agus
GROUP BY h.id_spk, h.nama_spk, h.status_spk, h.tanggal_target_selesai
ORDER BY h.tanggal_target_selesai ASC;
```

**Result:**
```
id_spk              | nama_spk                           | status_spk | task_count
--------------------|------------------------------------|------------|------------
spk-uuid-01a        | SPK01A - Validasi Drone Area D001  | BARU       | 2
spk-uuid-02b        | SPK02B - APH Blok E002             | BARU       | 1
```

---

## 🔒 AUTHORIZATION LOGIC (CORRECTED)

### ❌ SALAH (Role-based per SPK type):
```javascript
// JANGAN seperti ini
if (user.role === 'MANDOR_APH') {
  // Hanya boleh akses SPK tipe APH
  query.eq('tipe_tugas', 'APH');
}
```

### ✅ BENAR (Resource-based - SPK assignment):
```javascript
// Yang benar: Filter berdasarkan assignment
router.get('/mandor/:mandor_id/dashboard', async (req, res) => {
  const { mandor_id } = req.params;
  
  // Get SPKs where this mandor has tasks
  const { data: spkData } = await supabase
    .from('spk_header')
    .select(`
      *,
      spk_tugas!inner(id_tugas, status_tugas, id_pelaksana)
    `)
    .eq('spk_tugas.id_pelaksana', mandor_id);  // Filter by assignment
  
  // Mandor bisa lihat SEMUA SPK yang di-assign ke dia,
  // tidak peduli tipe tugas (APH, Sensus, Sanitasi, dll)
});
```

### Middleware Authorization (Updated):

```javascript
// middleware/authMiddleware.js
const checkMandorAccess = (req, res, next) => {
  const { mandor_id } = req.params;
  const { id_pihak, role } = req.user;
  
  // Admin and Asisten can access any mandor's data
  if (role === 'ADMIN' || role === 'ASISTEN') {
    return next();
  }
  
  // Mandor can only access their own data
  if (role === 'MANDOR') {
    if (id_pihak !== mandor_id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied: You can only access your own dashboard'
      });
    }
    return next();
  }
  
  return res.status(403).json({
    status: 'error',
    message: 'Access denied: Insufficient permissions'
  });
};
```

---

## 📱 FRONTEND IMPLEMENTATION EXAMPLES

### React: Mandor Dashboard Component

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MandorDashboard = () => {
  const [spkList, setSpkList] = useState([]);
  const [selectedSPK, setSelectedSPK] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const mandorId = localStorage.getItem('user_id'); // From JWT after login
  const token = localStorage.getItem('jwt_token');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/mandor/${mandorId}/dashboard`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setSpkList(response.data.data.spk_list);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      setLoading(false);
    }
  };

  const viewSPKDetail = async (spkId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/v1/spk/${spkId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setSelectedSPK(response.data.data);
    } catch (error) {
      console.error('Error fetching SPK detail:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="mandor-dashboard">
      <h1>Dashboard Mandor</h1>
      
      <div className="spk-cards">
        <h2>SPK Saya ({spkList.length})</h2>
        {spkList.map(spk => (
          <div key={spk.id_spk} className="spk-card">
            <h3>{spk.nama_spk}</h3>
            <p>Status: <span className={`status-${spk.status.toLowerCase()}`}>
              {spk.status}
            </span></p>
            <p>Total Tugas: {spk.task_count}</p>
            <p>Deadline: {new Date(spk.deadline).toLocaleDateString('id-ID')}</p>
            <button onClick={() => viewSPKDetail(spk.id_spk)}>
              Lihat Detail & Tugaskan Surveyor
            </button>
          </div>
        ))}
      </div>

      {selectedSPK && (
        <SPKDetailModal 
          spk={selectedSPK} 
          onClose={() => setSelectedSPK(null)}
          onAssign={assignTaskToSurveyor}
        />
      )}
    </div>
  );
};

const assignTaskToSurveyor = async (spkId, taskIds, surveyorId) => {
  const mandorId = localStorage.getItem('user_id');
  const token = localStorage.getItem('jwt_token');
  
  try {
    const response = await axios.post(
      `http://localhost:3000/api/v1/spk/${spkId}/assign-surveyor`,
      {
        id_tugas_list: taskIds,
        surveyor_id: surveyorId,
        mandor_id: mandorId,
        notes: 'Assigned via dashboard'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    alert('Tasks assigned successfully!');
    return response.data;
  } catch (error) {
    console.error('Error assigning tasks:', error);
    alert('Failed to assign tasks');
  }
};

export default MandorDashboard;
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] Asisten Manager bisa buat SPK01A
- [ ] Asisten Manager bisa assign tugas SPK01A ke Mandor Agus
- [ ] Asisten Manager bisa buat SPK02B
- [ ] Asisten Manager bisa assign tugas SPK02B ke Mandor Agus juga
- [ ] Mandor Agus login dan melihat **2 SPK** (SPK01A dan SPK02B)
- [ ] Mandor Agus bisa lihat detail masing-masing SPK
- [ ] Mandor Agus bisa assign tugas dari SPK01A ke surveyor
- [ ] Mandor Agus bisa assign tugas dari SPK02B ke surveyor lain
- [ ] Mandor Eko login dan hanya melihat SPK02X (tidak melihat SPK01A/SPK02B)
- [ ] Database query `spk_tugas` WHERE `id_pelaksana = mandor_id` bekerja correct

---

## 📚 RELATED FILES

- `routes/mandorRoutes.js` - Dashboard endpoints (UPDATED)
- `routes/spkValidasiDroneRoutes.js` - SPK list & assignment endpoints
- `services/spkValidasiDroneService.js` - SPK business logic
- `docs/API_MANDOR_DASHBOARD_GUIDE.md` - Frontend integration guide
- `docs/TESTING_MANDOR_MULTI_USER_RBAC.md` - Testing guide

---

**Generated**: November 18, 2025  
**Author**: GitHub Copilot  
**Version**: 2.0.0 (CORRECTED - SPK Assignment Flow)  
**Status**: Ready for implementation & testing
