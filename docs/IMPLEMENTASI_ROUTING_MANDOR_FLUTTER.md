# IMPLEMENTASI ROUTING MANDOR - FLUTTER WEB

## ❌ MASALAH SAAT INI

**Screenshot menunjukkan:**
- User: `agus.mandor@keboen.com` (MANDOR)
- Tampilan: "Pilih dashboard yang ingin Anda akses"
- Options: Dashboard Operasional, Dashboard Teknis
- **SALAH!** Mandor tidak boleh akses dashboard umum

**Dashboard yang benar:**
- ❌ Dashboard Operasional → Untuk ASISTEN MANAGER
- ❌ Dashboard Teknis → Untuk ASISTEN MANAGER / ADMIN
- ✅ **Dashboard Mandor** → Untuk MANDOR (SPK & Tugas mandor tersebut)

---

## ✅ ROUTING YANG BENAR

### Login Flow (FIXED)

```dart
// File: lib/pages/login_page.dart

Future<void> _handleLogin() async {
  try {
    // 1. Login via Supabase Auth
    final response = await Supabase.instance.client.auth.signInWithPassword(
      email: _emailController.text,  // agus.mandor@keboen.com
      password: _passwordController.text,
    );

    if (response.user == null) {
      throw Exception('Login gagal');
    }

    // 2. Get user profile & role dari backend
    final dio = Dio(BaseOptions(baseUrl: 'http://localhost:3000/api/v1'));
    final token = response.session!.accessToken;
    
    final profileResponse = await dio.get(
      '/auth/profile',
      options: Options(headers: {'Authorization': 'Bearer $token'}),
    );

    final role = profileResponse.data['user']['role'];
    final username = profileResponse.data['user']['username'];

    // 3. Navigate berdasarkan role (FIXED)
    if (!mounted) return;
    
    switch (role) {
      case 'MANDOR':
        // ✅ MANDOR → Dashboard Mandor (SPK mereka)
        Navigator.pushReplacementNamed(context, '/mandor/dashboard');
        break;
        
      case 'ASISTEN':
        // ✅ ASISTEN → Dashboard Asisten (overview semua mandor)
        Navigator.pushReplacementNamed(context, '/asisten/dashboard');
        break;
        
      case 'ADMIN':
        // ✅ ADMIN → Dashboard Admin (full access)
        Navigator.pushReplacementNamed(context, '/admin/dashboard');
        break;
        
      default:
        throw Exception('Role tidak dikenal: $role');
    }

  } catch (e) {
    // Handle error
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Login gagal: ${e.toString()}')),
    );
  }
}
```

---

## 📱 DASHBOARD MANDOR (NEW PAGE)

### File: `lib/pages/mandor/mandor_dashboard_page.dart`

```dart
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:dio/dio.dart';

class MandorDashboardPage extends StatefulWidget {
  const MandorDashboardPage({Key? key}) : super(key: key);

  @override
  State<MandorDashboardPage> createState() => _MandorDashboardPageState();
}

class _MandorDashboardPageState extends State<MandorDashboardPage> {
  final dio = Dio(BaseOptions(baseUrl: 'http://localhost:3000/api/v1'));
  
  Map<String, dynamic>? dashboardData;
  bool isLoading = true;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    _loadDashboard();
  }

  Future<void> _loadDashboard() async {
    try {
      setState(() {
        isLoading = true;
        errorMessage = null;
      });

      final token = Supabase.instance.client.auth.currentSession?.accessToken;
      
      if (token == null) {
        throw Exception('Token tidak ditemukan. Silakan login kembali.');
      }

      // Call backend API - OTOMATIS filter by user yang login
      final response = await dio.get(
        '/mandor/dashboard',
        options: Options(headers: {'Authorization': 'Bearer $token'}),
      );

      if (response.data['success'] == true) {
        setState(() {
          dashboardData = response.data['data'];
          isLoading = false;
        });
      } else {
        throw Exception(response.data['message'] ?? 'Gagal load dashboard');
      }

    } catch (e) {
      setState(() {
        errorMessage = e.toString();
        isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          dashboardData != null 
            ? 'Dashboard ${dashboardData!['mandor']['nama']}' 
            : 'Dashboard Mandor'
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadDashboard,
            tooltip: 'Refresh',
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await Supabase.instance.client.auth.signOut();
              if (mounted) {
                Navigator.pushReplacementNamed(context, '/');
              }
            },
            tooltip: 'Logout',
          ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text('Error: $errorMessage'),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadDashboard,
              child: const Text('Coba Lagi'),
            ),
          ],
        ),
      );
    }

    if (dashboardData == null) {
      return const Center(child: Text('Tidak ada data'));
    }

    final metrics = dashboardData!['metrics'];
    final mandor = dashboardData!['mandor'];
    final recentSpk = dashboardData!['recent_spk'] as List? ?? [];
    final recentTasks = dashboardData!['recent_tasks'] as List? ?? [];

    return RefreshIndicator(
      onRefresh: _loadDashboard,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header - Info Mandor
            _buildMandorInfoCard(mandor),
            const SizedBox(height: 24),

            // Metrics Cards
            Text(
              'Ringkasan',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            _buildMetricsGrid(metrics),
            const SizedBox(height: 24),

            // Recent SPK
            Text(
              'SPK Saya',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            if (recentSpk.isEmpty)
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(24),
                  child: Center(
                    child: Text('Belum ada SPK yang ditugaskan'),
                  ),
                ),
              )
            else
              ...recentSpk.map((spk) => _buildSpkCard(spk)).toList(),

            const SizedBox(height: 24),

            // Recent Tasks
            Text(
              'Tugas Terbaru',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            if (recentTasks.isEmpty)
              const Card(
                child: Padding(
                  padding: EdgeInsets.all(24),
                  child: Center(
                    child: Text('Belum ada tugas'),
                  ),
                ),
              )
            else
              ...recentTasks.map((task) => _buildTaskCard(task)).toList(),
          ],
        ),
      ),
    );
  }

  Widget _buildMandorInfoCard(Map<String, dynamic> mandor) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            CircleAvatar(
              radius: 32,
              backgroundColor: Colors.green,
              child: Text(
                mandor['nama']?.toString().substring(0, 1).toUpperCase() ?? 'M',
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    mandor['nama'] ?? 'Mandor',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    mandor['email'] ?? mandor['username'] ?? '',
                    style: TextStyle(
                      color: Colors.grey[600],
                    ),
                  ),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.green[100],
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'MANDOR',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.green,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricsGrid(Map<String, dynamic> metrics) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: [
        _buildMetricCard(
          title: 'SPK Aktif',
          value: '${metrics['spk_aktif'] ?? 0}',
          icon: Icons.assignment,
          color: Colors.blue,
        ),
        _buildMetricCard(
          title: 'Total SPK',
          value: '${metrics['total_spk'] ?? 0}',
          icon: Icons.folder,
          color: Colors.orange,
        ),
        _buildMetricCard(
          title: 'Tugas Pending',
          value: '${metrics['tugas_pending'] ?? 0}',
          icon: Icons.pending_actions,
          color: Colors.amber,
        ),
        _buildMetricCard(
          title: 'Tugas Selesai',
          value: '${metrics['tugas_selesai'] ?? 0}',
          icon: Icons.check_circle,
          color: Colors.green,
        ),
      ],
    );
  }

  Widget _buildMetricCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 32, color: color),
            const SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSpkCard(Map<String, dynamic> spk) {
    final status = spk['status_spk'] ?? 'UNKNOWN';
    final statusColor = _getStatusColor(status);

    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: statusColor.withOpacity(0.2),
          child: Icon(Icons.assignment, color: statusColor),
        ),
        title: Text(
          spk['nama_spk'] ?? 'SPK',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text('ID: ${spk['id_spk']}'),
            Text('Deadline: ${spk['tanggal_target_selesai'] ?? '-'}'),
          ],
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: statusColor.withOpacity(0.2),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            status,
            style: TextStyle(
              color: statusColor,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ),
        onTap: () {
          // Navigate ke detail SPK
          Navigator.pushNamed(context, '/mandor/spk/${spk['id_spk']}');
        },
      ),
    );
  }

  Widget _buildTaskCard(Map<String, dynamic> task) {
    final status = task['status_tugas'] ?? 'UNKNOWN';
    final statusColor = _getStatusColor(status);

    return Card(
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: statusColor.withOpacity(0.2),
          child: Icon(Icons.task, color: statusColor),
        ),
        title: Text(
          task['tipe_tugas'] ?? 'Tugas',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Text('ID: ${task['id_tugas']}'),
            if (task['spk_header'] != null)
              Text('SPK: ${task['spk_header']['nama_spk']}'),
          ],
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: statusColor.withOpacity(0.2),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            status,
            style: TextStyle(
              color: statusColor,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'BARU':
      case 'PENDING':
        return Colors.orange;
      case 'DIKERJAKAN':
      case 'IN_PROGRESS':
        return Colors.blue;
      case 'SELESAI':
      case 'COMPLETED':
        return Colors.green;
      case 'DIBATALKAN':
      case 'CANCELLED':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}
```

---

## 🛣️ ROUTES CONFIGURATION

### File: `lib/main.dart`

```dart
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'pages/login_page.dart';
import 'pages/mandor/mandor_dashboard_page.dart';
import 'pages/asisten/asisten_dashboard_page.dart';
import 'pages/admin/admin_dashboard_page.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await Supabase.initialize(
    url: 'https://wwbibxdhawlrhmvukovs.supabase.co',
    anonKey: 'YOUR_ANON_KEY',
  );

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Keboen Dashboard',
      theme: ThemeData(
        primarySwatch: Colors.green,
        useMaterial3: true,
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const LoginPage(),
        
        // MANDOR ROUTES
        '/mandor/dashboard': (context) => const MandorDashboardPage(),
        // TODO: Tambahkan route lain untuk mandor
        // '/mandor/spk/:id': ...
        // '/mandor/tasks': ...
        
        // ASISTEN ROUTES
        '/asisten/dashboard': (context) => const AsistenDashboardPage(),
        
        // ADMIN ROUTES
        '/admin/dashboard': (context) => const AdminDashboardPage(),
      },
    );
  }
}
```

---

## ✅ CHECKLIST IMPLEMENTASI

### 1. Backend (SUDAH READY)
- [x] Endpoint `/api/v1/auth/profile` - Get user role
- [x] Endpoint `/api/v1/mandor/dashboard` - Dashboard mandor (auto-filtered)
- [x] Middleware `verifySupabaseAuth` - Extract user dari token
- [x] RLS Policy - Mandor hanya lihat SPK mereka

### 2. Frontend (PERLU DIBUAT/DIUBAH)
- [ ] **CRITICAL:** Update `login_page.dart` - Fix routing by role
- [ ] **CRITICAL:** Buat `mandor_dashboard_page.dart` - Dashboard mandor
- [ ] **CRITICAL:** Update `main.dart` - Register route `/mandor/dashboard`
- [ ] Hapus/Hide "Dashboard Operasional" & "Dashboard Teknis" untuk mandor
- [ ] Test: Login sebagai `agus.mandor@keboen.com` → Langsung ke dashboard mandor

---

## 🧪 TESTING

### Test Case 1: Login Mandor Agus
```
1. Login: agus.mandor@keboen.com / mandor123
2. Expected: Langsung navigate ke /mandor/dashboard
3. Dashboard menampilkan:
   - Nama: Agus (Mandor Sensus)
   - SPK yang ditugaskan ke Agus SAJA
   - Tugas Agus SAJA
   - Metrics Agus (total SPK, tugas pending, dll)
4. TIDAK BOLEH ada pilihan "Dashboard Operasional" atau "Dashboard Teknis"
```

### Test Case 2: Login Mandor Eko
```
1. Login: eko.mandor@keboen.com / mandor123
2. Expected: Langsung navigate ke /mandor/dashboard
3. Dashboard menampilkan:
   - Nama: Eko (Mandor APH)
   - SPK yang ditugaskan ke Eko SAJA (BERBEDA dari Agus)
   - Tugas Eko SAJA
   - Metrics Eko
```

### Test Case 3: Data Isolation
```
1. Login sebagai Agus → Lihat dashboard → Note jumlah SPK
2. Logout
3. Login sebagai Eko → Lihat dashboard → Note jumlah SPK
4. Expected: Jumlah SPK BERBEDA (each mandor lihat SPK mereka sendiri)
```

---

## ⚠️ CATATAN PENTING

1. **JANGAN** tampilkan "Pilih Dashboard" untuk mandor
2. **JANGAN** beri akses Dashboard Operasional/Teknis ke mandor
3. Mandor **LANGSUNG** ke `/mandor/dashboard` setelah login
4. Backend **OTOMATIS** filter SPK by `id_pihak` dari token
5. Frontend **TIDAK PERLU** kirim `mandor_id` sebagai parameter

---

## 📞 API ENDPOINT YANG DIPAKAI

```dart
// 1. Get Profile (after login)
GET /api/v1/auth/profile
Headers: { Authorization: Bearer <token> }
Response: { user: { role, username, id_pihak, pihak } }

// 2. Get Mandor Dashboard (auto-filtered by token)
GET /api/v1/mandor/dashboard
Headers: { Authorization: Bearer <token> }
Response: { 
  data: { 
    mandor: {...}, 
    metrics: {...}, 
    recent_spk: [...], 
    recent_tasks: [...] 
  } 
}
```

---

## 🚀 NEXT STEPS

1. **SEKARANG:** Buat file `lib/pages/mandor/mandor_dashboard_page.dart`
2. **SEKARANG:** Update `lib/pages/login_page.dart` - Fix routing
3. **SEKARANG:** Update `lib/main.dart` - Register route
4. **TEST:** Login agus.mandor@keboen.com → Verify dashboard mandor muncul
5. **TEST:** Login eko.mandor@keboen.com → Verify data berbeda dari Agus

**Estimasi:** 30-60 menit implementasi
**Priority:** URGENT - Blocking mandor workflow
