# 🔔 PANDUAN LENGKAP - FLUTTER NOTIFICATIONS & FEATURES

> **Platform:** Flutter/Dart  
> **Backend:** Node.js + Express + Supabase  
> **Version:** 1.0.0  
> **Date:** November 19, 2025

---

## 📋 DAFTAR ISI

1. [Notification Service](#1-notification-service)
2. [Notification Bell Widget](#2-notification-bell-widget)
3. [Anomaly Detection Service](#3-anomaly-detection-service)
4. [Anomaly Dashboard Page](#4-anomaly-dashboard-page)
5. [Create SPK from Anomaly](#5-create-spk-from-anomaly)
6. [Mandor List Service](#6-mandor-list-service)

---

## 1. NOTIFICATION SERVICE

### File: `lib/services/notification_service.dart`

```dart
import 'package:dio/dio.dart';
import 'auth_service.dart';

class NotificationService {
  static const String baseUrl = 'http://localhost:3000/api/v1';
  
  final Dio _dio = Dio(BaseOptions(baseUrl: baseUrl));
  final AuthService _authService = AuthService();

  // Get notifications
  Future<Map<String, dynamic>> getNotifications({
    bool? read,
    String? type,
    int limit = 20,
    int offset = 0,
  }) async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        return {'success': false, 'message': 'Token tidak ditemukan'};
      }

      final queryParams = <String, dynamic>{
        'limit': limit,
        'offset': offset,
      };
      
      if (read != null) queryParams['read'] = read.toString();
      if (type != null) queryParams['type'] = type;

      final response = await _dio.get(
        '/notifications',
        queryParameters: queryParams,
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      return response.data;
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  // Mark notification as read
  Future<Map<String, dynamic>> markAsRead(String notificationId) async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        return {'success': false, 'message': 'Token tidak ditemukan'};
      }

      final response = await _dio.put(
        '/notifications/$notificationId/read',
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      return response.data;
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  // Mark all as read
  Future<Map<String, dynamic>> markAllAsRead() async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        return {'success': false, 'message': 'Token tidak ditemukan'};
      }

      final response = await _dio.put(
        '/notifications/mark-all-read',
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      return response.data;
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  // Delete notification
  Future<Map<String, dynamic>> deleteNotification(String notificationId) async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        return {'success': false, 'message': 'Token tidak ditemukan'};
      }

      final response = await _dio.delete(
        '/notifications/$notificationId',
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      return response.data;
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  Map<String, dynamic> _handleError(DioException error) {
    if (error.response != null) {
      return {
        'success': false,
        'message': error.response!.data['message'] ?? 'Terjadi kesalahan',
      };
    }
    return {
      'success': false,
      'message': 'Tidak dapat terhubung ke server',
    };
  }
}
```

---

## 2. NOTIFICATION BELL WIDGET

### File: `lib/widgets/notification_bell.dart`

```dart
import 'package:flutter/material.dart';
import 'dart:async';
import '../services/notification_service.dart';

class NotificationBell extends StatefulWidget {
  const NotificationBell({Key? key}) : super(key: key);

  @override
  State<NotificationBell> createState() => _NotificationBellState();
}

class _NotificationBellState extends State<NotificationBell> {
  final _notificationService = NotificationService();
  int _unreadCount = 0;
  Timer? _pollingTimer;

  @override
  void initState() {
    super.initState();
    _fetchUnreadCount();
    _startPolling();
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    super.dispose();
  }

  void _startPolling() {
    _pollingTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) => _fetchUnreadCount(),
    );
  }

  Future<void> _fetchUnreadCount() async {
    final result = await _notificationService.getNotifications(
      read: false,
      limit: 1,
    );

    if (result['success'] == true && mounted) {
      setState(() {
        _unreadCount = result['data']?['unread_count'] ?? 0;
      });
    }
  }

  void _showNotifications() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => NotificationList(
        onNotificationRead: () {
          _fetchUnreadCount();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        IconButton(
          icon: const Icon(Icons.notifications),
          onPressed: _showNotifications,
        ),
        if (_unreadCount > 0)
          Positioned(
            right: 8,
            top: 8,
            child: Container(
              padding: const EdgeInsets.all(4),
              decoration: const BoxDecoration(
                color: Colors.red,
                shape: BoxShape.circle,
              ),
              constraints: const BoxConstraints(
                minWidth: 16,
                minHeight: 16,
              ),
              child: Text(
                _unreadCount > 99 ? '99+' : '$_unreadCount',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
      ],
    );
  }
}

class NotificationList extends StatefulWidget {
  final VoidCallback onNotificationRead;

  const NotificationList({
    Key? key,
    required this.onNotificationRead,
  }) : super(key: key);

  @override
  State<NotificationList> createState() => _NotificationListState();
}

class _NotificationListState extends State<NotificationList> {
  final _notificationService = NotificationService();
  List<dynamic> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() {
      _isLoading = true;
    });

    final result = await _notificationService.getNotifications(limit: 50);

    if (mounted) {
      setState(() {
        _isLoading = false;
        if (result['success'] == true) {
          _notifications = result['data']?['notifications'] ?? [];
        }
      });
    }
  }

  Future<void> _markAsRead(String notificationId, int index) async {
    await _notificationService.markAsRead(notificationId);
    
    setState(() {
      _notifications[index]['read'] = true;
    });
    
    widget.onNotificationRead();
  }

  Future<void> _markAllAsRead() async {
    await _notificationService.markAllAsRead();
    await _loadNotifications();
    widget.onNotificationRead();
  }

  Color _getPriorityColor(String priority) {
    switch (priority.toUpperCase()) {
      case 'URGENT':
        return Colors.red;
      case 'HIGH':
        return Colors.orange;
      case 'NORMAL':
        return Colors.blue;
      case 'LOW':
        return Colors.grey;
      default:
        return Colors.blue;
    }
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(color: Colors.grey[300]!),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Notifikasi',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    TextButton(
                      onPressed: _markAllAsRead,
                      child: const Text('Tandai Semua Dibaca'),
                    ),
                  ],
                ),
              ),

              // Notifications list
              Expanded(
                child: _isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : _notifications.isEmpty
                        ? const Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.notifications_none, size: 64, color: Colors.grey),
                                SizedBox(height: 16),
                                Text('Tidak ada notifikasi'),
                              ],
                            ),
                          )
                        : ListView.builder(
                            controller: scrollController,
                            itemCount: _notifications.length,
                            itemBuilder: (context, index) {
                              final notification = _notifications[index];
                              final isRead = notification['read'] == true;

                              return ListTile(
                                leading: Container(
                                  width: 4,
                                  height: 50,
                                  decoration: BoxDecoration(
                                    color: _getPriorityColor(notification['priority'] ?? 'NORMAL'),
                                    borderRadius: BorderRadius.circular(2),
                                  ),
                                ),
                                title: Text(
                                  notification['title'] ?? '',
                                  style: TextStyle(
                                    fontWeight: isRead ? FontWeight.normal : FontWeight.bold,
                                  ),
                                ),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const SizedBox(height: 4),
                                    Text(notification['message'] ?? ''),
                                    const SizedBox(height: 4),
                                    Text(
                                      _formatDate(notification['created_at']),
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.grey[600],
                                      ),
                                    ),
                                  ],
                                ),
                                trailing: isRead
                                    ? null
                                    : Container(
                                        width: 12,
                                        height: 12,
                                        decoration: const BoxDecoration(
                                          color: Colors.blue,
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                tileColor: isRead ? null : Colors.blue[50],
                                onTap: () {
                                  if (!isRead) {
                                    _markAsRead(notification['id'], index);
                                  }
                                },
                              );
                            },
                          ),
              ),
            ],
          ),
        );
      },
    );
  }

  String _formatDate(String? dateString) {
    if (dateString == null) return '';
    
    try {
      final date = DateTime.parse(dateString);
      final now = DateTime.now();
      final difference = now.difference(date);

      if (difference.inMinutes < 1) {
        return 'Baru saja';
      } else if (difference.inMinutes < 60) {
        return '${difference.inMinutes} menit yang lalu';
      } else if (difference.inHours < 24) {
        return '${difference.inHours} jam yang lalu';
      } else if (difference.inDays < 7) {
        return '${difference.inDays} hari yang lalu';
      } else {
        return '${date.day}/${date.month}/${date.year}';
      }
    } catch (e) {
      return '';
    }
  }
}
```

---

## 3. ANOMALY DETECTION SERVICE

### File: `lib/services/anomaly_service.dart`

```dart
import 'package:dio/dio.dart';
import 'auth_service.dart';

class AnomalyService {
  static const String baseUrl = 'http://localhost:3000/api/v1';
  
  final Dio _dio = Dio(BaseOptions(baseUrl: baseUrl));
  final AuthService _authService = AuthService();

  // Get anomaly detection results
  Future<Map<String, dynamic>> detectAnomalies({
    String? divisi,
    String? afdeling,
    String? blok,
    String? severity,
    DateTime? dateFrom,
    DateTime? dateTo,
  }) async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        return {'success': false, 'message': 'Token tidak ditemukan'};
      }

      final queryParams = <String, dynamic>{};
      if (divisi != null) queryParams['divisi'] = divisi;
      if (afdeling != null) queryParams['afdeling'] = afdeling;
      if (blok != null) queryParams['blok'] = blok;
      if (severity != null) queryParams['severity'] = severity;
      if (dateFrom != null) {
        queryParams['date_from'] = dateFrom.toIso8601String();
      }
      if (dateTo != null) {
        queryParams['date_to'] = dateTo.toIso8601String();
      }

      final response = await _dio.get(
        '/analytics/anomaly-detection',
        queryParameters: queryParams,
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      return response.data;
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  // Create SPK from anomaly
  Future<Map<String, dynamic>> createSPKFromAnomaly({
    required String anomalyType,
    List<String>? anomalyIds,
    required String mandorId,
    required String asistenId,
    required String priority,
    String? notes,
  }) async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        return {'success': false, 'message': 'Token tidak ditemukan'};
      }

      final response = await _dio.post(
        '/analytics/create-spk-from-anomaly',
        data: {
          'anomaly_type': anomalyType,
          if (anomalyIds != null) 'anomaly_ids': anomalyIds,
          'mandor_id': mandorId,
          'asisten_id': asistenId,
          'priority': priority,
          if (notes != null) 'notes': notes,
        },
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      return response.data;
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  // Bulk create SPK from anomalies
  Future<Map<String, dynamic>> bulkCreateSPKFromAnomalies({
    required List<Map<String, dynamic>> anomalies,
    required String asistenId,
  }) async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        return {'success': false, 'message': 'Token tidak ditemukan'};
      }

      final response = await _dio.post(
        '/analytics/bulk-create-spk-from-anomalies',
        data: {
          'anomalies': anomalies,
          'asisten_id': asistenId,
        },
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      return response.data;
    } on DioException catch (e) {
      return _handleError(e);
    }
  }

  Map<String, dynamic> _handleError(DioException error) {
    if (error.response != null) {
      return {
        'success': false,
        'message': error.response!.data['message'] ?? 'Terjadi kesalahan',
      };
    }
    return {
      'success': false,
      'message': 'Tidak dapat terhubung ke server',
    };
  }
}
```

---

## 4. ANOMALY DASHBOARD PAGE

### File: `lib/pages/anomaly_dashboard_page.dart`

```dart
import 'package:flutter/material.dart';
import '../services/anomaly_service.dart';
import '../services/auth_service.dart';

class AnomalyDashboardPage extends StatefulWidget {
  const AnomalyDashboardPage({Key? key}) : super(key: key);

  @override
  State<AnomalyDashboardPage> createState() => _AnomalyDashboardPageState();
}

class _AnomalyDashboardPageState extends State<AnomalyDashboardPage> {
  final _anomalyService = AnomalyService();
  final _authService = AuthService();
  
  Map<String, dynamic>? _anomalyData;
  bool _isLoading = true;
  String? _userRole;
  String? _userId;

  @override
  void initState() {
    super.initState();
    _loadUserData();
    _loadAnomalies();
  }

  Future<void> _loadUserData() async {
    final userData = await _authService.getUserData();
    if (mounted) {
      setState(() {
        _userRole = userData?['role'];
        _userId = userData?['id_pihak'];
      });
    }
  }

  Future<void> _loadAnomalies() async {
    setState(() {
      _isLoading = true;
    });

    final result = await _anomalyService.detectAnomalies();

    if (mounted) {
      setState(() {
        _isLoading = false;
        if (result['success'] == true) {
          _anomalyData = result['data'];
        }
      });
    }
  }

  Color _getSeverityColor(String severity) {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return Colors.red;
      case 'HIGH':
        return Colors.orange;
      case 'MEDIUM':
        return Colors.yellow[700]!;
      case 'LOW':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  void _showCreateSPKDialog(Map<String, dynamic> anomaly) {
    showDialog(
      context: context,
      builder: (context) => CreateSPKDialog(
        anomaly: anomaly,
        userId: _userId!,
        onCreated: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('SPK berhasil dibuat!'),
              backgroundColor: Colors.green,
            ),
          );
          _loadAnomalies();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Deteksi Anomali'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadAnomalies,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _anomalyData == null
              ? const Center(child: Text('Gagal memuat data anomali'))
              : RefreshIndicator(
                  onRefresh: _loadAnomalies,
                  child: SingleChildScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Summary cards
                        _buildSummaryCards(),
                        const SizedBox(height: 24),
                        
                        // Anomaly list
                        const Text(
                          'Daftar Anomali',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 12),
                        _buildAnomalyList(),
                      ],
                    ),
                  ),
                ),
    );
  }

  Widget _buildSummaryCards() {
    final summary = _anomalyData?['summary'] ?? {};
    
    return Row(
      children: [
        Expanded(
          child: _buildSummaryCard(
            'Total',
            '${summary['total_anomalies'] ?? 0}',
            Colors.blue,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildSummaryCard(
            'Critical',
            '${summary['critical'] ?? 0}',
            Colors.red,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildSummaryCard(
            'High',
            '${summary['high'] ?? 0}',
            Colors.orange,
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryCard(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
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
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[700],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnomalyList() {
    final anomalies = _anomalyData?['anomalies'] as List? ?? [];

    if (anomalies.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: Column(
            children: [
              Icon(Icons.check_circle, size: 64, color: Colors.green),
              SizedBox(height: 16),
              Text('Tidak ada anomali terdeteksi'),
            ],
          ),
        ),
      );
    }

    return Column(
      children: anomalies.map((anomaly) {
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ExpansionTile(
            leading: Container(
              width: 4,
              height: 50,
              decoration: BoxDecoration(
                color: _getSeverityColor(anomaly['severity'] ?? ''),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            title: Text(
              _getAnomalyTitle(anomaly['type'] ?? ''),
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 4),
                Text('Jumlah: ${anomaly['count']} kasus'),
                Text(
                  'Severity: ${anomaly['severity']}',
                  style: TextStyle(
                    color: _getSeverityColor(anomaly['severity'] ?? ''),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(anomaly['description'] ?? ''),
                    const SizedBox(height: 12),
                    Text(
                      'Lokasi:',
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    ...((anomaly['locations'] as List?) ?? []).map((loc) {
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: Row(
                          children: [
                            const Icon(Icons.location_on, size: 16),
                            const SizedBox(width: 4),
                            Text(loc.toString()),
                          ],
                        ),
                      );
                    }).toList(),
                    const SizedBox(height: 16),
                    if (_userRole == 'ASISTEN' || _userRole == 'ADMIN')
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () => _showCreateSPKDialog(anomaly),
                          icon: const Icon(Icons.add_task),
                          label: const Text('Buat SPK'),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  String _getAnomalyTitle(String type) {
    switch (type) {
      case 'POHON_MIRING':
        return 'Pohon Miring';
      case 'POHON_MATI':
        return 'Pohon Mati';
      case 'NDRE_STRES_BERAT':
        return 'NDRE Stres Berat';
      case 'GAMBUT_AMBLAS':
        return 'Gambut Amblas';
      case 'SPACING_ISSUE':
        return 'Masalah Jarak Tanam';
      default:
        return type;
    }
  }
}

// Create SPK Dialog
class CreateSPKDialog extends StatefulWidget {
  final Map<String, dynamic> anomaly;
  final String userId;
  final VoidCallback onCreated;

  const CreateSPKDialog({
    Key? key,
    required this.anomaly,
    required this.userId,
    required this.onCreated,
  }) : super(key: key);

  @override
  State<CreateSPKDialog> createState() => _CreateSPKDialogState();
}

class _CreateSPKDialogState extends State<CreateSPKDialog> {
  final _anomalyService = AnomalyService();
  
  String? _selectedMandorId;
  String _selectedPriority = 'HIGH';
  final _notesController = TextEditingController();
  bool _isLoading = false;

  // Dummy mandor list - replace with actual API call
  final List<Map<String, String>> _mandorList = [
    {'id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'name': 'Agus (Mandor Sensus)'},
    {'id': 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'name': 'Eko (Mandor APH)'},
  ];

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _handleCreateSPK() async {
    if (_selectedMandorId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Pilih mandor terlebih dahulu'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    final result = await _anomalyService.createSPKFromAnomaly(
      anomalyType: widget.anomaly['type'],
      mandorId: _selectedMandorId!,
      asistenId: widget.userId,
      priority: _selectedPriority,
      notes: _notesController.text.isNotEmpty ? _notesController.text : null,
    );

    if (mounted) {
      setState(() {
        _isLoading = false;
      });

      if (result['success'] == true) {
        Navigator.of(context).pop();
        widget.onCreated();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Gagal membuat SPK'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Buat SPK dari Anomali'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Mandor dropdown
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(
                labelText: 'Pilih Mandor',
                border: OutlineInputBorder(),
              ),
              value: _selectedMandorId,
              items: _mandorList.map((mandor) {
                return DropdownMenuItem(
                  value: mandor['id'],
                  child: Text(mandor['name']!),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _selectedMandorId = value;
                });
              },
            ),
            const SizedBox(height: 16),

            // Priority dropdown
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(
                labelText: 'Prioritas',
                border: OutlineInputBorder(),
              ),
              value: _selectedPriority,
              items: ['URGENT', 'HIGH', 'NORMAL', 'LOW'].map((priority) {
                return DropdownMenuItem(
                  value: priority,
                  child: Text(priority),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _selectedPriority = value!;
                });
              },
            ),
            const SizedBox(height: 16),

            // Notes field
            TextField(
              controller: _notesController,
              decoration: const InputDecoration(
                labelText: 'Catatan (Opsional)',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: _isLoading ? null : () => Navigator.of(context).pop(),
          child: const Text('Batal'),
        ),
        ElevatedButton(
          onPressed: _isLoading ? null : _handleCreateSPK,
          child: _isLoading
              ? const SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Text('Buat SPK'),
        ),
      ],
    );
  }
}
```

---

## 5. CREATE SPK FROM ANOMALY

Sudah included di Anomaly Dashboard Page (#4) - lihat `CreateSPKDialog` widget.

---

## 6. MANDOR LIST SERVICE

### File: `lib/services/mandor_service.dart`

```dart
import 'package:dio/dio.dart';
import 'auth_service.dart';

class MandorService {
  static const String baseUrl = 'http://localhost:3000/api/v1';
  
  final Dio _dio = Dio(BaseOptions(baseUrl: baseUrl));
  final AuthService _authService = AuthService();

  // Get mandor list
  Future<Map<String, dynamic>> getMandorList() async {
    try {
      final token = await _authService.getToken();
      if (token == null) {
        return {'success': false, 'message': 'Token tidak ditemukan'};
      }

      final response = await _dio.get(
        '/mandor/list',
        options: Options(
          headers: {'Authorization': 'Bearer $token'},
        ),
      );

      return response.data;
    } on DioException catch (e) {
      if (e.response != null) {
        return {
          'success': false,
          'message': e.response!.data['message'] ?? 'Terjadi kesalahan',
        };
      }
      return {
        'success': false,
        'message': 'Tidak dapat terhubung ke server',
      };
    }
  }
}
```

### Penggunaan di Form:

```dart
import '../services/mandor_service.dart';

class AssignSPKForm extends StatefulWidget {
  const AssignSPKForm({Key? key}) : super(key: key);

  @override
  State<AssignSPKForm> createState() => _AssignSPKFormState();
}

class _AssignSPKFormState extends State<AssignSPKForm> {
  final _mandorService = MandorService();
  List<dynamic> _mandorList = [];
  String? _selectedMandorId;
  bool _isLoadingMandor = true;

  @override
  void initState() {
    super.initState();
    _loadMandorList();
  }

  Future<void> _loadMandorList() async {
    setState(() {
      _isLoadingMandor = true;
    });

    final result = await _mandorService.getMandorList();

    if (mounted) {
      setState(() {
        _isLoadingMandor = false;
        if (result['success'] == true) {
          _mandorList = result['data']?['mandor_list'] ?? [];
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Assign SPK')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Mandor dropdown
            _isLoadingMandor
                ? const CircularProgressIndicator()
                : DropdownButtonFormField<String>(
                    decoration: const InputDecoration(
                      labelText: 'Pilih Mandor',
                      border: OutlineInputBorder(),
                    ),
                    value: _selectedMandorId,
                    items: _mandorList.map((mandor) {
                      return DropdownMenuItem<String>(
                        value: mandor['id_pihak'],
                        child: Text(mandor['nama']),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() {
                        _selectedMandorId = value;
                      });
                    },
                  ),
            
            // Verify: Hanya tampil Agus & Eko (MANDOR), tidak ada Ahmad/Budi/Cahyo (PEKERJA)
          ],
        ),
      ),
    );
  }
}
```

---

## 📱 INTEGR ATION CHECKLIST

- [ ] Authentication service implemented
- [ ] Login page implemented
- [ ] Notification bell widget added to AppBar
- [ ] Notification service implemented
- [ ] Anomaly dashboard page implemented
- [ ] Create SPK from anomaly dialog implemented
- [ ] Mandor list service implemented
- [ ] Protected routes configured
- [ ] Error handling implemented
- [ ] Base URL configured for Android/iOS/Physical device

---

**Version:** 1.0.0  
**Last Updated:** November 19, 2025  
**Status:** ✅ COMPLETE FLUTTER INTEGRATION GUIDE
