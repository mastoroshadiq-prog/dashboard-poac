# HANDOVER KE TIM FRONTEND FLUTTER WEB

## ✅ CREDENTIALS SUPABASE AUTH (SUDAH DIBUAT)

```
agus.mandor@keboen.com / mandor123 → MANDOR
eko.mandor@keboen.com / mandor123 → MANDOR  
asisten.budi@keboen.com / asisten123 → ASISTEN
admin@keboen.com / admin123 → ADMIN
```

---

## 📡 BACKEND API ENDPOINTS (READY TO USE)

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Header
```dart
final token = Supabase.instance.client.auth.currentSession?.accessToken;

dio.options.headers = {
  'Authorization': 'Bearer $token',
  'Content-Type': 'application/json',
};
```

---

## 🎯 ROUTING SETELAH LOGIN

### Login Success → Get Role → Navigate

```dart
// 1. Login
final response = await Supabase.instance.client.auth.signInWithPassword(
  email: 'agus.mandor@keboen.com',
  password: 'mandor123',
);

// 2. Get user profile & role
final userId = response.user!.id;
final profileResponse = await dio.get(
  'http://localhost:3000/api/v1/auth/profile',
  options: Options(headers: {
    'Authorization': 'Bearer ${response.session!.accessToken}',
  }),
);

final role = profileResponse.data['user']['role'];

// 3. Navigate based on role
switch (role) {
  case 'MANDOR':
    Navigator.pushReplacementNamed(context, '/mandor/dashboard');
    break;
  case 'ASISTEN':
    Navigator.pushReplacementNamed(context, '/asisten/dashboard');
    break;
  case 'ADMIN':
    Navigator.pushReplacementNamed(context, '/admin/dashboard');
    break;
}
```

---

## 📊 DASHBOARD ENDPOINTS

### 1. Mandor Dashboard (OTOMATIS FILTERED PER USER)

**⚠️ PENTING:** Backend OTOMATIS filter SPK berdasarkan user yang login!

```dart
// GET /api/v1/mandor/dashboard
// Token berisi id_pihak → Backend otomatis filter SPK untuk user ini saja
final response = await dio.get('/mandor/dashboard', options: Options(
  headers: {
    'Authorization': 'Bearer ${Supabase.instance.client.auth.currentSession?.accessToken}',
  }
));

// Response untuk agus.mandor@keboen.com:
{
  "success": true,
  "data": {
    "mandor": {
      "id_pihak": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "nama": "Agus (Mandor Sensus)",
      "username": "agus.mandor",
      "email": "agus.mandor@keboen.com"
    },
    "metrics": {
      "total_spk": 5,          // SPK yang ditugaskan ke Agus
      "spk_aktif": 3,           // SPK status PENDING/DIKERJAKAN
      "total_tugas": 12,        // Total tugas Agus
      "tugas_pending": 4,
      "tugas_dikerjakan": 5,
      "tugas_selesai": 3
    },
    "recent_spk": [
      {
        "id_spk": "SPK-2025-001",
        "nama_spk": "Sensus Pokok Blok A1-A5",
        "status_spk": "DIKERJAKAN",
        "risk_level": "LOW",
        "tanggal_target_selesai": "2025-11-25"
      },
      // ... SPK lain yang ditugaskan ke Agus
    ],
    "recent_tasks": [
      {
        "id_tugas": "...",
        "tipe_tugas": "SENSUS_POKOK",
        "status_tugas": "DIKERJAKAN",
        "target_json": {
          "blok_code": "A1",
          "target_count": 500
        }
      }
    ]
  }
}

// Response untuk eko.mandor@keboen.com BERBEDA:
// - Data SPK yang ditugaskan ke Eko
// - Metrics hitung dari tugas Eko
// - TIDAK ADA data SPK Agus
```

**Cara Kerja Pemisahan Data:**

1. **Login Agus:**
   - Token → `id_pihak: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"`
   - Backend query: `WHERE id_pelaksana = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'`
   - Return: SPK Agus saja

2. **Login Eko:**
   - Token → `id_pihak: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12"`
   - Backend query: `WHERE id_pelaksana = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'`
   - Return: SPK Eko saja

**Keamanan (RLS + Backend Filter):**
```dart
// ❌ TIDAK BISA akses SPK mandor lain
// Token Agus → Backend otomatis reject data Eko
// RLS Policy di Supabase juga block di database level

// ✅ FRONTEND tidak perlu filter manual
// Backend sudah handle semua filtering
```

### 2. Dashboard Operasional (All Roles)
```dart
// GET /api/v1/dashboard/operasional
final response = await dio.get('/dashboard/operasional');

// Response: Grafik panen, produksi, mutu TBS
```

### 3. Dashboard Teknis (All Roles)
```dart
// GET /api/v1/dashboard/teknis
final response = await dio.get('/dashboard/teknis');

// Response: Kesehatan kebun, NDRE, anomali
```

---

## 🔔 NOTIFICATIONS

```dart
// GET /api/v1/notifications?user_id={id_pihak}
final response = await dio.get('/notifications?user_id=$userId');

// Response:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "SPK Baru Ditugaskan",
      "message": "Anda mendapat SPK Sensus Blok A1",
      "type": "SPK_ASSIGNED",
      "is_read": false,
      "created_at": "2025-11-19T10:00:00Z"
    }
  ]
}
```

---

## 🔐 DATA ISOLATION (OTOMATIS)

### Backend Filter (Middleware Level)
```javascript
// routes/mandorRoutes.js - line 11
const mandor_id = req.user.id_pihak;  // Dari token Supabase

// Query SPK dengan filter
.eq('spk_tugas.id_pelaksana', mandor_id)
```

**Hasil:**
- Agus login → hanya lihat SPK Agus
- Eko login → hanya lihat SPK Eko
- **TIDAK MUNGKIN** Agus lihat data Eko (atau sebaliknya)

### RLS Policy (Database Level - Double Protection)
```sql
-- spk_tugas: Mandor hanya query tugas mereka
CREATE POLICY "mandor_own_tasks" ON spk_tugas
FOR SELECT USING (
  id_pelaksana IN (
    SELECT id_pihak FROM master_pihak WHERE auth_user_id = auth.uid()
  )
);

-- log_aktivitas_5w1h: Mandor hanya submit log untuk tugas mereka
CREATE POLICY "mandor_own_logs" ON log_aktivitas_5w1h
FOR INSERT WITH CHECK (
  id_tugas IN (
    SELECT id_tugas FROM spk_tugas WHERE id_pelaksana IN (
      SELECT id_pihak FROM master_pihak WHERE auth_user_id = auth.uid()
    )
  )
);
```

**2 Layer Security:**
1. **Backend Middleware:** Filter by `req.user.id_pihak`
2. **RLS Policy:** Filter by `auth.uid()` di database

**Frontend tidak perlu worry tentang data leak!**

---

## 📋 FLUTTER ROUTES CONFIG

```dart
final routes = {
  '/': (context) => LoginPage(),
  
  // Mandor Routes
  '/mandor/dashboard': (context) => MandorDashboardPage(),
  '/mandor/spk': (context) => MandorSpkListPage(),  // List SPK mandor ini
  '/mandor/spk/:id': (context) => MandorSpkDetailPage(),
  '/mandor/tasks': (context) => MandorTasksPage(),  // List tugas mandor ini
  '/mandor/notifications': (context) => NotificationsPage(),
  
  // Asisten Routes
  '/asisten/dashboard': (context) => AsistenDashboardPage(),
  
  // Admin Routes
  '/admin/dashboard': (context) => AdminDashboardPage(),
};
```

### Contoh MandorDashboardPage Implementation

```dart
class MandorDashboardPage extends StatefulWidget {
  @override
  State<MandorDashboardPage> createState() => _MandorDashboardPageState();
}

class _MandorDashboardPageState extends State<MandorDashboardPage> {
  final dio = Dio(BaseOptions(baseUrl: 'http://localhost:3000/api/v1'));
  Map<String, dynamic>? dashboardData;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadDashboard();
  }

  Future<void> _loadDashboard() async {
    try {
      final token = Supabase.instance.client.auth.currentSession?.accessToken;
      
      final response = await dio.get(
        '/mandor/dashboard',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      setState(() {
        dashboardData = response.data['data'];
        isLoading = false;
      });
    } catch (e) {
      print('Error loading dashboard: $e');
      // Handle error
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) return LoadingScreen();

    final metrics = dashboardData!['metrics'];
    final mandor = dashboardData!['mandor'];
    final recentSpk = dashboardData!['recent_spk'] as List;

    return Scaffold(
      appBar: AppBar(
        title: Text('Dashboard ${mandor['nama']}'),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Metrics Cards
            Row(
              children: [
                MetricCard(
                  title: 'SPK Aktif',
                  value: '${metrics['spk_aktif']}',
                  icon: Icons.assignment,
                ),
                MetricCard(
                  title: 'Tugas Pending',
                  value: '${metrics['tugas_pending']}',
                  icon: Icons.pending_actions,
                ),
                MetricCard(
                  title: 'Tugas Selesai',
                  value: '${metrics['tugas_selesai']}',
                  icon: Icons.check_circle,
                ),
              ],
            ),
            
            // Recent SPK List
            ListView.builder(
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              itemCount: recentSpk.length,
              itemBuilder: (context, index) {
                final spk = recentSpk[index];
                return SpkCard(
                  title: spk['nama_spk'],
                  status: spk['status_spk'],
                  deadline: spk['tanggal_target_selesai'],
                  onTap: () {
                    Navigator.pushNamed(
                      context, 
                      '/mandor/spk/${spk['id_spk']}'
                    );
                  },
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
```

**⚠️ CATATAN PENTING:**
- Dashboard page **TIDAK perlu** pass `mandor_id` sebagai parameter
- Backend **OTOMATIS** detect user dari token
- Setiap mandor **OTOMATIS** lihat data mereka sendiri saja

---

## 🛡️ AUTH GUARD

```dart
class AuthGuard extends StatelessWidget {
  final Widget child;
  final List<String> allowedRoles;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: _checkAuth(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return LoadingScreen();
        }
        
        if (!snapshot.hasData) {
          Navigator.pushReplacementNamed(context, '/');
          return Container();
        }
        
        final role = snapshot.data!['role'];
        if (!allowedRoles.contains(role)) {
          return UnauthorizedPage();
        }
        
        return child;
      },
    );
  }

  Future<Map<String, dynamic>> _checkAuth() async {
    final session = Supabase.instance.client.auth.currentSession;
    if (session == null) return {};
    
    final response = await dio.get('/auth/profile');
    return response.data['user'];
  }
}
```

---

## 📦 PACKAGES YANG DIBUTUHKAN

```yaml
dependencies:
  flutter:
    sdk: flutter
  supabase_flutter: ^2.0.0
  dio: ^5.0.0
  flutter_secure_storage: ^9.0.0
  provider: ^6.0.0  # atau riverpod/bloc
```

---

## 🚀 QUICK START

1. **Install packages:** `flutter pub get`
2. **Init Supabase:**
```dart
await Supabase.initialize(
  url: 'https://wwbibxdhawlrhmvukovs.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
);
```
3. **Test login:** `agus.mandor@keboen.com` / `mandor123`
4. **Check profile endpoint:** GET `/api/v1/auth/profile`
5. **Navigate ke dashboard sesuai role**

---

## ⚠️ YANG HARUS DICEK BACKEND

- [ ] Endpoint `/api/v1/auth/profile` (get user role & data)
- [ ] Endpoint `/api/v1/mandor/dashboard` (mandor dashboard data)
- [ ] RLS policy untuk mandor (sudah ada tapi perlu verify)
- [ ] Supabase Auth middleware di semua protected routes

**File yang perlu dibuat/update:**
1. `routes/authRoutes.js` - tambah GET `/profile`
2. `routes/mandorRoutes.js` - tambah GET `/dashboard` 
3. `middleware/supabaseAuthMiddleware.js` - verify token & extract role
