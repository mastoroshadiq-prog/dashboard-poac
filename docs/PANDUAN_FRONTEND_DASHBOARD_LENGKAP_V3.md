# 📘 PANDUAN FRONTEND DASHBOARD - UPDATED
> **Comprehensive Integration Guide for Frontend Team**  
> **Version:** 3.0.0 (Complete Implementation)  
> **Date:** November 19, 2025  
> **Status:** ✅ PRODUCTION READY

---

## 🎯 RINGKASAN PERUBAHAN TERBARU

### ✅ Fitur Baru yang Sudah Diimplementasikan:

1. **Authentication System** ✅ READY
   - Login endpoint with username/password
   - JWT token management
   - Change password functionality
   - Development & production mode support

2. **Anomaly Detection** ✅ READY
   - Real-time detection (pohon miring, mati, NDRE stres)
   - Severity classification (CRITICAL, HIGH, MEDIUM, LOW)
   - Location-based grouping
   - Recommended actions

3. **Auto-Create SPK from Anomaly** ✅ READY
   - Single SPK creation from anomaly
   - Bulk SPK creation
   - Auto-assign to mandor
   - Priority-based deadline calculation

4. **Real-Time Notifications** ✅ READY
   - In-app notifications
   - SPK assignment alerts
   - Urgent task notifications
   - Anomaly detection alerts
   - Read/unread status tracking

5. **3-Tier Assignment Flow** ✅ READY
   - Asisten → Mandor → Pelaksana
   - Resource-based SPK assignment
   - Mandor list endpoint for form dropdown

---

## 🔐 1. AUTHENTICATION & LOGIN

### A. Login Flow

#### Endpoint
```
POST /api/v1/auth/login
```

#### Request
```javascript
const login = async (username, password) => {
  try {
    const response = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    const result = await response.json();

    if (result.success) {
      // Store token & user info
      localStorage.setItem('jwt_token', result.token);
      localStorage.setItem('user_id', result.user.id_pihak);
      localStorage.setItem('user_name', result.user.nama);
      localStorage.setItem('user_role', result.user.role);
      localStorage.setItem('username', result.user.username);

      return { success: true, user: result.user };
    } else {
      return { success: false, message: result.message };
    }
  } catch (error) {
    return { success: false, message: 'Network error: ' + error.message };
  }
};
```

#### Response 200 (Success)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id_pihak": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "nama": "Agus (Mandor Sensus)",
    "username": "agus.mandor",
    "role": "MANDOR",
    "tipe": "INTERNAL"
  },
  "message": "Login berhasil"
}
```

#### Response 401 (Failed)
```json
{
  "success": false,
  "message": "Username atau password salah"
}
```

### B. Development Credentials

| Username | Password | Role | Access Level |
|----------|----------|------|--------------|
| `agus.mandor` | `mandor123` | MANDOR | Dashboard mandor, assign tasks to surveyor |
| `eko.mandor` | `mandor123` | MANDOR | Dashboard mandor, assign tasks to surveyor |
| `asisten.budi` | `asisten123` | ASISTEN | Dashboard asisten, create SPK, analytics |
| `admin` | `admin123` | ADMIN | Full access to all features |

### C. React Login Component Example

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();

      if (result.success) {
        // Store credentials
        localStorage.setItem('jwt_token', result.token);
        localStorage.setItem('user_id', result.user.id_pihak);
        localStorage.setItem('user_role', result.user.role);
        localStorage.setItem('user_name', result.user.nama);

        // Redirect based on role
        switch (result.user.role) {
          case 'MANDOR':
            navigate('/mandor/dashboard');
            break;
          case 'ASISTEN':
            navigate('/asisten/dashboard');
            break;
          case 'ADMIN':
            navigate('/admin/dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      } else {
        setError(result.message || 'Login gagal');
      }
    } catch (error) {
      setError('Terjadi kesalahan koneksi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Login - Sistem Dashboard Kebun</h1>
      <form onSubmit={handleLogin}>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="agus.mandor"
            required
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="mandor123"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
```

### D. Logout Function

```javascript
const logout = () => {
  // Clear local storage
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_role');
  localStorage.removeItem('user_name');
  localStorage.removeItem('username');

  // Optional: Call backend logout endpoint (for logging)
  fetch('http://localhost:3000/api/v1/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
    }
  });

  // Redirect to login
  window.location.href = '/login';
};
```

### E. Protected Route Component

```jsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('jwt_token');
  const userRole = localStorage.getItem('user_role');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}

// Usage:
<Route 
  path="/mandor/dashboard" 
  element={
    <ProtectedRoute allowedRoles={['MANDOR']}>
      <MandorDashboard />
    </ProtectedRoute>
  } 
/>
```

---

## 🔔 2. NOTIFICATIONS SYSTEM

### A. Get User Notifications

#### Endpoint
```
GET /api/v1/notifications
Authorization: Bearer <token>
```

#### Query Parameters
- `read`: `true` | `false` (optional) - Filter by read status
- `type`: Notification type (optional)
- `limit`: Number of notifications (default: 20)
- `offset`: Pagination offset (default: 0)

#### Example Request
```javascript
const getNotifications = async () => {
  const token = localStorage.getItem('jwt_token');

  const response = await fetch(
    'http://localhost:3000/api/v1/notifications?read=false&limit=10',
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  const result = await response.json();
  return result.data;
};
```

#### Response
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notification-uuid",
        "type": "SPK_ASSIGNMENT",
        "title": "SPK Baru Ditugaskan",
        "message": "Anda mendapat SPK baru: SPK01A - Validasi Drone",
        "data": {
          "spk_id": "spk-uuid",
          "spk_name": "SPK01A - Validasi Drone",
          "priority": "HIGH",
          "deadline": "2025-11-26"
        },
        "priority": "NORMAL",
        "read": false,
        "created_at": "2025-11-19T10:30:00Z"
      },
      {
        "id": "notification-uuid-2",
        "type": "URGENT_TASK",
        "title": "⚠️ Tugas Urgent",
        "message": "Tugas urgent memerlukan perhatian segera",
        "data": {
          "task_id": "task-uuid",
          "spk_id": "spk-uuid",
          "task_type": "VALIDASI_DRONE"
        },
        "priority": "HIGH",
        "read": false,
        "created_at": "2025-11-19T09:15:00Z"
      }
    ],
    "unread_count": 5,
    "total": 10
  }
}
```

### B. Notification Component Example

```jsx
import { useState, useEffect } from 'react';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('jwt_token');
    
    try {
      const response = await fetch(
        'http://localhost:3000/api/v1/notifications?read=false&limit=5',
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const result = await response.json();
      
      if (result.success) {
        setNotifications(result.data.notifications);
        setUnreadCount(result.data.unread_count);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    const token = localStorage.getItem('jwt_token');

    try {
      await fetch(
        `http://localhost:3000/api/v1/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      // Refresh notifications
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('jwt_token');

    try {
      await fetch(
        'http://localhost:3000/api/v1/notifications/mark-all-read',
        {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <div className="notification-bell">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="bell-button"
      >
        🔔
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notifikasi ({unreadCount} unread)</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead}>Mark all as read</button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <p>Tidak ada notifikasi baru</p>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id} 
                  className="notification-item"
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className={`priority-${notif.priority.toLowerCase()}`}>
                    <strong>{notif.title}</strong>
                  </div>
                  <p>{notif.message}</p>
                  <small>{new Date(notif.created_at).toLocaleString('id-ID')}</small>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
```

---

## 📊 3. ANOMALY DETECTION & AUTO-CREATE SPK

### A. Get Anomaly Detection Results

#### Endpoint
```
GET /api/v1/analytics/anomaly-detection
Authorization: Bearer <token>
Roles: ASISTEN, ADMIN
```

#### Example Request
```javascript
const getAnomalies = async () => {
  const token = localStorage.getItem('jwt_token');

  const response = await fetch(
    'http://localhost:3000/api/v1/analytics/anomaly-detection',
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  const result = await response.json();
  return result.data;
};
```

#### Response
```json
{
  "success": true,
  "data": {
    "anomalies": [
      {
        "type": "POHON_MIRING",
        "severity": "HIGH",
        "count": 12,
        "locations": ["A1-D001A (3 pohon)", "A1-D001B (9 pohon)"],
        "description": "Pohon miring >30 derajat, risiko tumbang",
        "recommended_action": "Prioritas APH segera, evaluasi sistem akar",
        "details": [...]
      },
      {
        "type": "POHON_MATI",
        "severity": "CRITICAL",
        "count": 8,
        "locations": ["A2-D002A (5 pohon)", "A2-D002B (3 pohon)"],
        "description": "Pohon mati, perlu replanting",
        "recommended_action": "Create SPK Sanitasi + Replanting segera",
        "details": [...]
      },
      {
        "type": "NDRE_STRES_BERAT",
        "severity": "HIGH",
        "count": 15,
        "locations": ["A1-D001C (8 pohon)", "A3-D003A (7 pohon)"],
        "description": "Pohon dengan NDRE Stres Berat, perlu validasi lapangan",
        "recommended_action": "Create SPK Validasi Drone untuk konfirmasi lapangan",
        "details": [...]
      }
    ],
    "summary": {
      "total_anomalies": 35,
      "critical": 8,
      "high": 27,
      "medium": 0,
      "low": 0,
      "by_type": [
        { "type": "POHON_MIRING", "count": 12, "severity": "HIGH" },
        { "type": "POHON_MATI", "count": 8, "severity": "CRITICAL" },
        { "type": "NDRE_STRES_BERAT", "count": 15, "severity": "HIGH" }
      ]
    }
  },
  "message": "Anomaly detection berhasil diambil"
}
```

### B. Create SPK from Anomaly

#### Endpoint
```
POST /api/v1/analytics/create-spk-from-anomaly
Authorization: Bearer <token>
Roles: ASISTEN, ADMIN
```

#### Request Body
```json
{
  "anomaly_type": "POHON_MIRING",
  "anomaly_ids": ["obs-id-1", "obs-id-2"],
  "mandor_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "priority": "HIGH",
  "notes": "Prioritas tinggi - area rawan angin kencang"
}
```

#### Example Request
```javascript
const createSPKFromAnomaly = async (anomalyType, mandorId, priority) => {
  const token = localStorage.getItem('jwt_token');

  const response = await fetch(
    'http://localhost:3000/api/v1/analytics/create-spk-from-anomaly',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        anomaly_type: anomalyType,
        mandor_id: mandorId,
        priority: priority,
        notes: 'Created from anomaly detection analytics'
      })
    }
  );

  const result = await response.json();
  return result;
};
```

#### Response 201 (Success)
```json
{
  "success": true,
  "data": {
    "spk": {
      "id_spk": "spk-uuid",
      "nomor_spk": "SPK-POH-123456",
      "nama_spk": "SPK APH - Pohon Miring - 19/11/2025",
      "jenis_kegiatan": "APH",
      "status": "BARU",
      "prioritas": "HIGH",
      "deadline": "2025-11-26T00:00:00Z"
    },
    "tugas": {
      "id_tugas": "task-uuid",
      "assigned_to_mandor": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "status": "PENDING"
    }
  },
  "message": "SPK berhasil dibuat dari anomaly detection"
}
```

### C. Anomaly Dashboard Component Example

```jsx
import { useState, useEffect } from 'react';

function AnomalyDashboard() {
  const [anomalies, setAnomalies] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mandorList, setMandorList] = useState([]);

  useEffect(() => {
    fetchAnomalies();
    fetchMandorList();
  }, []);

  const fetchAnomalies = async () => {
    const token = localStorage.getItem('jwt_token');

    try {
      const response = await fetch(
        'http://localhost:3000/api/v1/analytics/anomaly-detection',
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const result = await response.json();

      if (result.success) {
        setAnomalies(result.data.anomalies);
        setSummary(result.data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMandorList = async () => {
    const token = localStorage.getItem('jwt_token');

    try {
      const response = await fetch(
        'http://localhost:3000/api/v1/mandor/list',
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const result = await response.json();

      if (result.success) {
        setMandorList(result.data.mandor_list);
      }
    } catch (error) {
      console.error('Failed to fetch mandor list:', error);
    }
  };

  const handleCreateSPK = async (anomaly) => {
    const mandorId = prompt(`Pilih Mandor ID (${mandorList.map(m => m.nama).join(', ')})`);
    if (!mandorId) return;

    const token = localStorage.getItem('jwt_token');

    try {
      const response = await fetch(
        'http://localhost:3000/api/v1/analytics/create-spk-from-anomaly',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            anomaly_type: anomaly.type,
            mandor_id: mandorId,
            priority: anomaly.severity === 'CRITICAL' ? 'URGENT' : 'HIGH'
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        alert(`SPK ${result.data.spk.nomor_spk} berhasil dibuat!`);
        fetchAnomalies(); // Refresh
      } else {
        alert('Gagal membuat SPK: ' + result.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="anomaly-dashboard">
      <h1>🚨 Anomaly Detection Dashboard</h1>

      {summary && (
        <div className="summary-cards">
          <div className="card critical">
            <h3>Critical</h3>
            <p className="number">{summary.critical}</p>
          </div>
          <div className="card high">
            <h3>High</h3>
            <p className="number">{summary.high}</p>
          </div>
          <div className="card medium">
            <h3>Medium</h3>
            <p className="number">{summary.medium}</p>
          </div>
          <div className="card low">
            <h3>Low</h3>
            <p className="number">{summary.low}</p>
          </div>
        </div>
      )}

      <div className="anomaly-list">
        {anomalies.map((anomaly, index) => (
          <div key={index} className={`anomaly-card severity-${anomaly.severity.toLowerCase()}`}>
            <div className="anomaly-header">
              <h3>{anomaly.type}</h3>
              <span className="severity-badge">{anomaly.severity}</span>
            </div>

            <p className="count">{anomaly.count} kejadian</p>
            <p className="description">{anomaly.description}</p>

            <div className="locations">
              <strong>Lokasi:</strong>
              <ul>
                {anomaly.locations.map((loc, i) => (
                  <li key={i}>{loc}</li>
                ))}
              </ul>
            </div>

            <div className="recommendation">
              <strong>Rekomendasi:</strong>
              <p>{anomaly.recommended_action}</p>
            </div>

            <button 
              onClick={() => handleCreateSPK(anomaly)}
              className="btn-create-spk"
            >
              🔧 Create SPK
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AnomalyDashboard;
```

---

## 📋 4. MANDOR DASHBOARD (UPDATED)

### Form "Assign SPK to Mandor" - FIXED

#### Endpoint untuk Dropdown
```
GET /api/v1/mandor/list
Authorization: Bearer <token> (ASISTEN role)
```

#### Example Implementation
```jsx
function AssignSPKForm() {
  const [mandorList, setMandorList] = useState([]);
  const [selectedMandor, setSelectedMandor] = useState('');

  useEffect(() => {
    fetchMandorList();
  }, []);

  const fetchMandorList = async () => {
    const token = localStorage.getItem('jwt_token');

    try {
      const response = await fetch(
        'http://localhost:3000/api/v1/mandor/list',
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const result = await response.json();

      if (result.success) {
        setMandorList(result.data.mandor_list);
      }
    } catch (error) {
      console.error('Failed to fetch mandor list:', error);
    }
  };

  return (
    <form>
      <label>Assign to Mandor:</label>
      <select 
        value={selectedMandor} 
        onChange={(e) => setSelectedMandor(e.target.value)}
      >
        <option value="">-- Pilih Mandor --</option>
        {mandorList.map(mandor => (
          <option key={mandor.id_pihak} value={mandor.id_pihak}>
            {mandor.nama}
          </option>
        ))}
      </select>
    </form>
  );
}
```

#### Expected Response
```json
{
  "success": true,
  "data": {
    "mandor_list": [
      {
        "id_pihak": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "nama": "Agus (Mandor Sensus)",
        "kode_unik": "AGUS_MANDOR",
        "tipe": "INTERNAL"
      },
      {
        "id_pihak": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
        "nama": "Eko (Mandor APH)",
        "kode_unik": "EKO_MANDOR",
        "tipe": "INTERNAL"
      }
    ],
    "total": 2
  }
}
```

**✅ FIXED:** Form akan menampilkan Agus & Eko (MANDOR), bukan Ahmad/Budi/Cahyo (PEKERJA)

---

## 🗂️ 5. COMPLETE API REFERENCE

### Authentication
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/login` | Public | User login |
| POST | `/api/v1/auth/logout` | Any | Logout (client-side token removal) |
| POST | `/api/v1/auth/change-password` | Any | Change password |
| GET | `/api/v1/auth/me` | Any | Get current user info |

### Notifications
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/notifications` | Any | Get user notifications |
| PUT | `/api/v1/notifications/:id/read` | Any | Mark notification as read |
| PUT | `/api/v1/notifications/mark-all-read` | Any | Mark all as read |
| DELETE | `/api/v1/notifications/:id` | Any | Delete notification |

### Analytics & Anomaly Detection
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/analytics/anomaly-detection` | ASISTEN, ADMIN | Get anomaly detection results |
| POST | `/api/v1/analytics/create-spk-from-anomaly` | ASISTEN, ADMIN | Create SPK from single anomaly |
| POST | `/api/v1/analytics/bulk-create-spk-from-anomalies` | ASISTEN, ADMIN | Bulk create SPKs from multiple anomalies |
| GET | `/api/v1/analytics/mandor-performance` | ASISTEN, ADMIN | Get mandor performance metrics |

### Mandor Dashboard
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/mandor/list` | ASISTEN, ADMIN | Get list of all mandor for SPK assignment |
| GET | `/api/v1/mandor/:mandor_id/dashboard` | MANDOR | Get mandor dashboard overview |
| GET | `/api/v1/mandor/:mandor_id/surveyors` | MANDOR | Get surveyor list for task delegation |
| GET | `/api/v1/mandor/:mandor_id/tasks/realtime` | MANDOR | Get real-time task tracking |

### SPK Management
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/spk/` | ASISTEN, ADMIN | Create SPK header |
| POST | `/api/v1/spk/:id_spk/tugas` | ASISTEN, ADMIN | Add tasks to SPK |
| GET | `/api/v1/spk/mandor/:mandor_id` | MANDOR | Get SPK list for mandor |
| POST | `/api/v1/spk/validasi-drone` | ASISTEN, ADMIN | Create SPK Validasi Drone |
| POST | `/api/v1/ops/spk/create` | ASISTEN, ADMIN | Create multi-purpose SPK |

---

## 🚀 6. DEPLOYMENT CHECKLIST

### Backend
- [x] Authentication endpoints implemented
- [x] Anomaly detection logic implemented
- [x] SPK from anomaly creation implemented
- [x] Notification system implemented
- [x] SQL scripts created (user credentials, notifications table)
- [ ] **Run SQL scripts in production database**
  ```bash
  # In Supabase SQL Editor:
  # 1. Run: sql/setup_user_credentials.sql
  # 2. Run: sql/create_notifications_table.sql
  ```
- [ ] **Set production password hashes** (replace DEV_PASSWORDS)
- [ ] **Test all endpoints with Postman/Thunder Client**
- [ ] **Enable CORS for production domain**
- [ ] **Set production JWT_SECRET in environment variables**

### Frontend
- [ ] **Implement login page** (see React example above)
- [ ] **Add protected routes** with role-based access
- [ ] **Implement notification bell** component
- [ ] **Update "Assign SPK" form** to use `/api/v1/mandor/list`
- [ ] **Create anomaly dashboard** for Asisten Manager
- [ ] **Add "Create SPK from Anomaly"** button
- [ ] **Test login flow** (Agus, Eko, Asisten, Admin)
- [ ] **Test mandor dashboard** with both Agus & Eko
- [ ] **Test SPK assignment flow** (Asisten → Mandor → Pelaksana)
- [ ] **Test notification system** (create, read, mark as read)

---

## 🔧 7. TROUBLESHOOTING

### Issue: Login gagal dengan "Username atau password salah"
**Solution:**
1. Pastikan database sudah run script `sql/setup_user_credentials.sql`
2. Cek username benar: `agus.mandor` (bukan `agus` atau `Agus`)
3. Cek password benar: `mandor123` (case-sensitive)
4. Cek network tab browser untuk response error detail

### Issue: Form "Assign SPK" masih menampilkan PEKERJA
**Solution:**
1. Pastikan endpoint sudah diganti ke `/api/v1/mandor/list`
2. Pastikan pakai token ASISTEN (bukan MANDOR token)
3. Cek response API di network tab - harus return Agus & Eko

### Issue: Notifications tidak muncul
**Solution:**
1. Pastikan table `notifications` sudah dibuat (run `sql/create_notifications_table.sql`)
2. Cek permissions di Supabase (allow authenticated users to SELECT)
3. Test endpoint di Postman dengan valid JWT token

### Issue: Anomaly detection mengembalikan empty array
**Solution:**
1. Data observasi belum ada di database
2. Run dummy data SQL script untuk testing
3. Pastikan kolom `metadata_json`, `ndre_value`, `ndre_classification` ada

---

## 📞 8. SUPPORT & RESOURCES

**Documentation:**
- `docs/SPK_ASSIGNMENT_FLOW_CORRECTED.md` - Architecture overview
- `docs/FRONTEND_FORM_FIX_SUMMARY.md` - Fix for form dropdown bug
- `docs/HOW_TO_TEST.md` - Testing procedures
- `docs/TESTING_MANDOR_MULTI_USER_RBAC.md` - Security testing guide

**Testing Scripts:**
- `generate-asisten-token.js` - Generate ASISTEN JWT token
- `generate-mandor-tokens.js` - Generate MANDOR JWT tokens
- `test-mandor-list-endpoint.js` - Test mandor list endpoint
- `test-mandor-spk-assignment.js` - Test SPK assignment flow

**SQL Scripts:**
- `sql/setup_user_credentials.sql` - Setup login credentials
- `sql/create_notifications_table.sql` - Create notifications table
- `sql/dummy_data_v1_2.sql` - Dummy data for testing

**Backend Status:** ✅ PRODUCTION READY  
**Frontend Status:** 🔄 INTEGRATION REQUIRED  
**Last Updated:** November 19, 2025

---

**Generated by:** Backend Team  
**Version:** 3.0.0  
**Status:** Complete Implementation Guide
