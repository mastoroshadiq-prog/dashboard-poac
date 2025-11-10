# 📱 Flutter Integration Guide - Dashboard Enhancement

**Target Audience:** Flutter Developers (Dart)  
**Backend API Version:** 2.0 (Enhanced)  
**Last Updated:** November 10, 2025  
**Difficulty:** ⭐⭐ Intermediate  
**Flutter Version:** 3.0+

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Dependencies](#dependencies)
3. [API Service Setup](#api-service-setup)
4. [Data Models](#data-models)
5. [API Client Implementation](#api-client-implementation)
6. [Flutter Widgets](#flutter-widgets)
7. [Chart Integration](#chart-integration)
8. [State Management](#state-management)
9. [UI Components](#ui-components)
10. [Error Handling](#error-handling)

---

## 🚀 Quick Start

### **1. Dependencies**

Update `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # HTTP Client
  http: ^1.1.0
  dio: ^5.3.3  # Recommended for better features
  
  # State Management (pilih salah satu)
  provider: ^6.1.0
  # riverpod: ^2.4.0
  # bloc: ^8.1.0
  
  # Charts
  fl_chart: ^0.65.0  # Recommended
  # syncfusion_flutter_charts: ^23.1.36  # Alternative
  
  # Date formatting
  intl: ^0.18.1
  
  # Loading indicators
  shimmer: ^3.0.0
  
dev_dependencies:
  flutter_test:
    sdk: flutter
  mockito: ^5.4.0
  build_runner: ^2.4.0
```

### **2. Environment Configuration**

```dart
// lib/config/environment.dart
class Environment {
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:3000/api/v1',
  );
  
  static const String supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://your-project.supabase.co',
  );
  
  static const String supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue: 'your-anon-key',
  );
}
```

---

## 📦 Data Models

### **Model 1: KPI Eksekutif**

```dart
// lib/models/kpi_eksekutif_model.dart
import 'package:json_annotation/json_annotation.dart';

part 'kpi_eksekutif_model.g.dart';

@JsonSerializable()
class TrenKepatuhanSOP {
  final String periode;
  final double nilai;

  TrenKepatuhanSOP({
    required this.periode,
    required this.nilai,
  });

  factory TrenKepatuhanSOP.fromJson(Map<String, dynamic> json) =>
      _$TrenKepatuhanSOPFromJson(json);

  Map<String, dynamic> toJson() => _$TrenKepatuhanSOPToJson(this);
}

@JsonSerializable()
class PlanningAccuracyMonth {
  @JsonKey(name: 'target_completion')
  final int targetCompletion;

  @JsonKey(name: 'actual_completion')
  final int actualCompletion;

  @JsonKey(name: 'accuracy_percentage')
  final double accuracyPercentage;

  @JsonKey(name: 'projected_final_accuracy')
  final double? projectedFinalAccuracy;

  PlanningAccuracyMonth({
    required this.targetCompletion,
    required this.actualCompletion,
    required this.accuracyPercentage,
    this.projectedFinalAccuracy,
  });

  factory PlanningAccuracyMonth.fromJson(Map<String, dynamic> json) =>
      _$PlanningAccuracyMonthFromJson(json);

  Map<String, dynamic> toJson() => _$PlanningAccuracyMonthToJson(this);
}

@JsonSerializable()
class PlanningAccuracy {
  @JsonKey(name: 'last_month')
  final PlanningAccuracyMonth lastMonth;

  @JsonKey(name: 'current_month')
  final PlanningAccuracyMonth currentMonth;

  PlanningAccuracy({
    required this.lastMonth,
    required this.currentMonth,
  });

  factory PlanningAccuracy.fromJson(Map<String, dynamic> json) =>
      _$PlanningAccuracyFromJson(json);

  Map<String, dynamic> toJson() => _$PlanningAccuracyToJson(this);
}

@JsonSerializable()
class TrenInsidensi {
  final String date;
  final int count;

  TrenInsidensi({required this.date, required this.count});

  factory TrenInsidensi.fromJson(Map<String, dynamic> json) =>
      _$TrenInsidensiFromJson(json);

  Map<String, dynamic> toJson() => _$TrenInsidensiToJson(this);
}

@JsonSerializable()
class KPIEksekutifData {
  @JsonKey(name: 'kri_lead_time_aph')
  final double kriLeadTimeAph;

  @JsonKey(name: 'kri_kepatuhan_sop')
  final double kriKepatuhanSop;

  @JsonKey(name: 'tren_insidensi_baru')
  final List<TrenInsidensi> trenInsidensiBaru;

  @JsonKey(name: 'tren_g4_aktif')
  final int trenG4Aktif;

  // ⭐ NEW Enhancement fields
  @JsonKey(name: 'tren_kepatuhan_sop')
  final List<TrenKepatuhanSOP> trenKepatuhanSop;

  @JsonKey(name: 'planning_accuracy')
  final PlanningAccuracy planningAccuracy;

  @JsonKey(name: 'generated_at')
  final String generatedAt;

  final Map<String, dynamic> filters;

  KPIEksekutifData({
    required this.kriLeadTimeAph,
    required this.kriKepatuhanSop,
    required this.trenInsidensiBaru,
    required this.trenG4Aktif,
    required this.trenKepatuhanSop,
    required this.planningAccuracy,
    required this.generatedAt,
    required this.filters,
  });

  factory KPIEksekutifData.fromJson(Map<String, dynamic> json) =>
      _$KPIEksekutifDataFromJson(json);

  Map<String, dynamic> toJson() => _$KPIEksekutifDataToJson(this);
}

@JsonSerializable()
class KPIEksekutifResponse {
  final bool success;
  final KPIEksekutifData data;
  final String message;

  KPIEksekutifResponse({
    required this.success,
    required this.data,
    required this.message,
  });

  factory KPIEksekutifResponse.fromJson(Map<String, dynamic> json) =>
      _$KPIEksekutifResponseFromJson(json);

  Map<String, dynamic> toJson() => _$KPIEksekutifResponseToJson(this);
}
```

### **Model 2: Dashboard Operasional**

```dart
// lib/models/dashboard_operasional_model.dart
import 'package:json_annotation/json_annotation.dart';

part 'dashboard_operasional_model.g.dart';

enum RiskLevel {
  @JsonValue('LOW')
  low,
  @JsonValue('MEDIUM')
  medium,
  @JsonValue('CRITICAL')
  critical,
}

extension RiskLevelExtension on RiskLevel {
  String get displayName {
    switch (this) {
      case RiskLevel.low:
        return 'Low';
      case RiskLevel.medium:
        return 'Medium';
      case RiskLevel.critical:
        return 'Critical';
    }
  }

  String get icon {
    switch (this) {
      case RiskLevel.low:
        return '🟢';
      case RiskLevel.medium:
        return '🟡';
      case RiskLevel.critical:
        return '🔴';
    }
  }

  Color get color {
    switch (this) {
      case RiskLevel.low:
        return Colors.green;
      case RiskLevel.medium:
        return Colors.orange;
      case RiskLevel.critical:
        return Colors.red;
    }
  }
}

@JsonSerializable()
class DataCorong {
  @JsonKey(name: 'target_validasi')
  final int targetValidasi;

  @JsonKey(name: 'validasi_selesai')
  final int validasiSelesai;

  @JsonKey(name: 'target_aph')
  final int targetAph;

  @JsonKey(name: 'aph_selesai')
  final int aphSelesai;

  @JsonKey(name: 'target_sanitasi')
  final int targetSanitasi;

  @JsonKey(name: 'sanitasi_selesai')
  final int sanitasiSelesai;

  // ⭐ NEW Enhancement fields - Deadlines
  @JsonKey(name: 'deadline_validasi')
  final String? deadlineValidasi;

  @JsonKey(name: 'deadline_aph')
  final String? deadlineAph;

  @JsonKey(name: 'deadline_sanitasi')
  final String? deadlineSanitasi;

  // ⭐ NEW Enhancement fields - Risk Levels
  @JsonKey(name: 'risk_level_validasi')
  final RiskLevel riskLevelValidasi;

  @JsonKey(name: 'risk_level_aph')
  final RiskLevel riskLevelAph;

  @JsonKey(name: 'risk_level_sanitasi')
  final RiskLevel riskLevelSanitasi;

  // ⭐ NEW Enhancement fields - Blockers
  @JsonKey(name: 'blockers_validasi')
  final List<String> blockersValidasi;

  @JsonKey(name: 'blockers_aph')
  final List<String> blockersAph;

  @JsonKey(name: 'blockers_sanitasi')
  final List<String> blockersSanitasi;

  // ⭐ NEW Enhancement fields - Resource Allocation
  @JsonKey(name: 'pelaksana_assigned_validasi')
  final int pelaksanaAssignedValidasi;

  @JsonKey(name: 'pelaksana_assigned_aph')
  final int pelaksanaAssignedAph;

  @JsonKey(name: 'pelaksana_assigned_sanitasi')
  final int pelaksanaAssignedSanitasi;

  DataCorong({
    required this.targetValidasi,
    required this.validasiSelesai,
    required this.targetAph,
    required this.aphSelesai,
    required this.targetSanitasi,
    required this.sanitasiSelesai,
    this.deadlineValidasi,
    this.deadlineAph,
    this.deadlineSanitasi,
    required this.riskLevelValidasi,
    required this.riskLevelAph,
    required this.riskLevelSanitasi,
    required this.blockersValidasi,
    required this.blockersAph,
    required this.blockersSanitasi,
    required this.pelaksanaAssignedValidasi,
    required this.pelaksanaAssignedAph,
    required this.pelaksanaAssignedSanitasi,
  });

  factory DataCorong.fromJson(Map<String, dynamic> json) =>
      _$DataCorongFromJson(json);

  Map<String, dynamic> toJson() => _$DataCorongToJson(this);

  // Helper methods
  double get validasiProgress =>
      targetValidasi > 0 ? (validasiSelesai / targetValidasi) * 100 : 0;

  double get aphProgress =>
      targetAph > 0 ? (aphSelesai / targetAph) * 100 : 0;

  double get sanitasiProgress =>
      targetSanitasi > 0 ? (sanitasiSelesai / targetSanitasi) * 100 : 0;
}

@JsonSerializable()
class PapanPeringkat {
  @JsonKey(name: 'id_pelaksana')
  final String idPelaksana;

  final int selesai;
  final int total;
  final double rate;

  PapanPeringkat({
    required this.idPelaksana,
    required this.selesai,
    required this.total,
    required this.rate,
  });

  factory PapanPeringkat.fromJson(Map<String, dynamic> json) =>
      _$PapanPeringkatFromJson(json);

  Map<String, dynamic> toJson() => _$PapanPeringkatToJson(this);
}

@JsonSerializable()
class DashboardOperasionalData {
  @JsonKey(name: 'data_corong')
  final DataCorong dataCorong;

  @JsonKey(name: 'data_papan_peringkat')
  final List<PapanPeringkat> dataPapanPeringkat;

  @JsonKey(name: 'generated_at')
  final String generatedAt;

  final Map<String, dynamic> filters;

  DashboardOperasionalData({
    required this.dataCorong,
    required this.dataPapanPeringkat,
    required this.generatedAt,
    required this.filters,
  });

  factory DashboardOperasionalData.fromJson(Map<String, dynamic> json) =>
      _$DashboardOperasionalDataFromJson(json);

  Map<String, dynamic> toJson() => _$DashboardOperasionalDataToJson(this);
}

@JsonSerializable()
class DashboardOperasionalResponse {
  final bool success;
  final DashboardOperasionalData data;
  final String message;

  DashboardOperasionalResponse({
    required this.success,
    required this.data,
    required this.message,
  });

  factory DashboardOperasionalResponse.fromJson(Map<String, dynamic> json) =>
      _$DashboardOperasionalResponseFromJson(json);

  Map<String, dynamic> toJson() => _$DashboardOperasionalResponseToJson(this);
}
```

**Generate Models:**
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

---

## 🔌 API Client Implementation

### **Dio HTTP Client Setup**

```dart
// lib/services/api_client.dart
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../config/environment.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  late final Dio _dio;

  ApiClient._internal() {
    _dio = Dio(
      BaseOptions(
        baseUrl: Environment.apiBaseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Request Interceptor (Add Auth Token)
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Get token from secure storage
          final token = await _getAuthToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }

          if (kDebugMode) {
            print('🌐 REQUEST: ${options.method} ${options.path}');
          }

          return handler.next(options);
        },
        onResponse: (response, handler) {
          if (kDebugMode) {
            print('✅ RESPONSE: ${response.statusCode} ${response.requestOptions.path}');
          }
          return handler.next(response);
        },
        onError: (error, handler) {
          if (kDebugMode) {
            print('❌ ERROR: ${error.response?.statusCode} ${error.requestOptions.path}');
            print('   Message: ${error.message}');
          }
          return handler.next(error);
        },
      ),
    );
  }

  Dio get dio => _dio;

  Future<String?> _getAuthToken() async {
    // TODO: Implement secure storage (flutter_secure_storage)
    // For now, return from SharedPreferences or similar
    return null;
  }

  // Helper method for error handling
  ApiException handleError(DioException error) {
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout) {
      return ApiException(
        message: 'Connection timeout. Please check your internet.',
        statusCode: 0,
      );
    }

    if (error.type == DioExceptionType.connectionError) {
      return ApiException(
        message: 'No internet connection.',
        statusCode: 0,
      );
    }

    final statusCode = error.response?.statusCode ?? 0;
    final data = error.response?.data;

    String message = 'An error occurred';

    if (data is Map<String, dynamic>) {
      message = data['message'] ?? data['error'] ?? message;
    }

    return ApiException(
      message: message,
      statusCode: statusCode,
    );
  }
}

class ApiException implements Exception {
  final String message;
  final int statusCode;

  ApiException({
    required this.message,
    required this.statusCode,
  });

  @override
  String toString() => message;
}
```

### **Dashboard Service**

```dart
// lib/services/dashboard_service.dart
import 'package:dio/dio.dart';
import '../models/kpi_eksekutif_model.dart';
import '../models/dashboard_operasional_model.dart';
import 'api_client.dart';

class DashboardService {
  final ApiClient _apiClient = ApiClient();

  /// Fetch KPI Eksekutif Dashboard Data
  Future<KPIEksekutifData> fetchKPIEksekutif() async {
    try {
      final response = await _apiClient.dio.get('/dashboard/kpi-eksekutif');

      final apiResponse = KPIEksekutifResponse.fromJson(response.data);

      if (!apiResponse.success) {
        throw ApiException(
          message: apiResponse.message,
          statusCode: response.statusCode ?? 0,
        );
      }

      return apiResponse.data;
    } on DioException catch (e) {
      throw _apiClient.handleError(e);
    }
  }

  /// Fetch Dashboard Operasional Data
  Future<DashboardOperasionalData> fetchDashboardOperasional() async {
    try {
      final response = await _apiClient.dio.get('/dashboard/operasional');

      final apiResponse = DashboardOperasionalResponse.fromJson(response.data);

      if (!apiResponse.success) {
        throw ApiException(
          message: apiResponse.message,
          statusCode: response.statusCode ?? 0,
        );
      }

      return apiResponse.data;
    } on DioException catch (e) {
      throw _apiClient.handleError(e);
    }
  }
}
```

---

## 📊 Chart Integration (FL Chart)

### **Tren Kepatuhan SOP Line Chart**

```dart
// lib/widgets/charts/tren_kepatuhan_sop_chart.dart
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import '../../models/kpi_eksekutif_model.dart';

class TrenKepatuhanSOPChart extends StatelessWidget {
  final List<TrenKepatuhanSOP> data;

  const TrenKepatuhanSOPChart({
    Key? key,
    required this.data,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) {
      return const Center(
        child: Text('No data available'),
      );
    }

    return Container(
      height: 300,
      padding: const EdgeInsets.all(16),
      child: LineChart(
        LineChartData(
          gridData: FlGridData(
            show: true,
            drawVerticalLine: false,
            horizontalInterval: 20,
            getDrawingHorizontalLine: (value) {
              return FlLine(
                color: Colors.grey.shade300,
                strokeWidth: 1,
              );
            },
          ),
          titlesData: FlTitlesData(
            show: true,
            rightTitles: AxisTitles(
              sideTitles: SideTitles(showTitles: false),
            ),
            topTitles: AxisTitles(
              sideTitles: SideTitles(showTitles: false),
            ),
            bottomTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 30,
                interval: 1,
                getTitlesWidget: (double value, TitleMeta meta) {
                  final index = value.toInt();
                  if (index < 0 || index >= data.length) {
                    return const Text('');
                  }
                  return Text(
                    data[index].periode,
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  );
                },
              ),
            ),
            leftTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                interval: 20,
                reservedSize: 42,
                getTitlesWidget: (double value, TitleMeta meta) {
                  return Text(
                    '${value.toInt()}%',
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  );
                },
              ),
            ),
          ),
          borderData: FlBorderData(
            show: true,
            border: Border.all(color: Colors.grey.shade300),
          ),
          minX: 0,
          maxX: (data.length - 1).toDouble(),
          minY: 0,
          maxY: 100,
          lineBarsData: [
            // Actual SOP Compliance Line
            LineChartBarData(
              spots: data
                  .asMap()
                  .entries
                  .map((e) => FlSpot(e.key.toDouble(), e.value.nilai))
                  .toList(),
              isCurved: true,
              color: Colors.blue,
              barWidth: 3,
              isStrokeCapRound: true,
              dotData: FlDotData(
                show: true,
                getDotPainter: (spot, percent, barData, index) {
                  return FlDotCirclePainter(
                    radius: 4,
                    color: Colors.blue,
                    strokeWidth: 2,
                    strokeColor: Colors.white,
                  );
                },
              ),
              belowBarData: BarAreaData(
                show: true,
                color: Colors.blue.withOpacity(0.1),
              ),
            ),
            // Target Line (90%)
            LineChartBarData(
              spots: List.generate(
                data.length,
                (index) => FlSpot(index.toDouble(), 90),
              ),
              isCurved: false,
              color: Colors.green,
              barWidth: 2,
              dashArray: [5, 5],
              dotData: FlDotData(show: false),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 🎨 UI Components

### **Category Card Widget**

```dart
// lib/widgets/cards/category_card.dart
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../models/dashboard_operasional_model.dart';

class CategoryCard extends StatelessWidget {
  final String title;
  final int target;
  final int selesai;
  final String? deadline;
  final RiskLevel riskLevel;
  final List<String> blockers;
  final int pelaksanaAssigned;

  const CategoryCard({
    Key? key,
    required this.title,
    required this.target,
    required this.selesai,
    this.deadline,
    required this.riskLevel,
    required this.blockers,
    required this.pelaksanaAssigned,
  }) : super(key: key);

  double get progress => target > 0 ? (selesai / target) * 100 : 0;

  String get deadlineText {
    if (deadline == null) return 'No deadline set';

    try {
      final deadlineDate = DateTime.parse(deadline!);
      final now = DateTime.now();
      final difference = deadlineDate.difference(now).inDays;

      final formatter = DateFormat('dd MMM yyyy', 'id_ID');
      final formattedDate = formatter.format(deadlineDate);

      if (difference < 0) {
        return '$formattedDate (Overdue ${difference.abs()} days)';
      } else if (difference == 0) {
        return '$formattedDate (Today!)';
      } else if (difference <= 7) {
        return '$formattedDate ($difference days left) ⚠️';
      } else {
        return '$formattedDate ($difference days left)';
      }
    } catch (e) {
      return deadline!;
    }
  }

  Color get progressColor {
    if (progress >= 70) return Colors.green;
    if (progress >= 30) return Colors.orange;
    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with Title and Risk Badge
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: riskLevel.color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: riskLevel.color,
                      width: 1,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        riskLevel.icon,
                        style: const TextStyle(fontSize: 12),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        riskLevel.displayName,
                        style: TextStyle(
                          color: riskLevel.color,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Progress Stats
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '$selesai Selesai',
                  style: const TextStyle(
                    color: Colors.green,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '/ $target Total',
                  style: TextStyle(color: Colors.grey.shade600),
                ),
                Text(
                  '${progress.toStringAsFixed(1)}%',
                  style: const TextStyle(
                    color: Colors.blue,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Progress Bar
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: progress / 100,
                backgroundColor: Colors.grey.shade200,
                valueColor: AlwaysStoppedAnimation<Color>(progressColor),
                minHeight: 8,
              ),
            ),
            const SizedBox(height: 16),

            // Deadline
            _buildInfoRow(
              icon: Icons.calendar_today,
              label: 'Deadline:',
              value: deadlineText,
            ),
            const SizedBox(height: 8),

            // Workers Assigned
            _buildInfoRow(
              icon: Icons.people,
              label: 'Workers Assigned:',
              value: '$pelaksanaAssigned pelaksana',
            ),
            const SizedBox(height: 16),

            // Blockers
            if (blockers.isNotEmpty) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.orange.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border(
                    left: BorderSide(color: Colors.orange, width: 4),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.warning_amber, color: Colors.orange, size: 20),
                        SizedBox(width: 8),
                        Text(
                          'Blockers:',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.orange,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ...blockers.map(
                      (blocker) => Padding(
                        padding: const EdgeInsets.only(left: 28, top: 4),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('• ', style: TextStyle(fontSize: 16)),
                            Expanded(
                              child: Text(
                                blocker,
                                style: TextStyle(color: Colors.orange.shade900),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ] else ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border(
                    left: BorderSide(color: Colors.green, width: 4),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(Icons.check_circle, color: Colors.green, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      'No blockers - On track!',
                      style: TextStyle(
                        color: Colors.green.shade900,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      children: [
        Icon(icon, size: 16, color: Colors.grey.shade600),
        const SizedBox(width: 8),
        Text(
          label,
          style: TextStyle(
            fontSize: 14,
            color: Colors.grey.shade700,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(fontSize: 14),
          ),
        ),
      ],
    );
  }
}
```

### **Planning Accuracy Card**

```dart
// lib/widgets/cards/planning_accuracy_card.dart
import 'package:flutter/material.dart';
import '../../models/kpi_eksekutif_model.dart';

class PlanningAccuracyCard extends StatelessWidget {
  final PlanningAccuracy accuracy;

  const PlanningAccuracyCard({
    Key? key,
    required this.accuracy,
  }) : super(key: key);

  bool get isImproving =>
      accuracy.currentMonth.accuracyPercentage >
      accuracy.lastMonth.accuracyPercentage;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      margin: const EdgeInsets.all(16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Planning Accuracy',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),

            // Last Month
            _buildMonthSection(
              title: 'Last Month',
              month: accuracy.lastMonth,
            ),
            const Divider(height: 32),

            // Current Month
            _buildMonthSection(
              title: 'Current Month',
              month: accuracy.currentMonth,
              showProjected: true,
            ),
            const SizedBox(height: 16),

            // Trend Indicator
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isImproving
                    ? Colors.green.shade50
                    : Colors.red.shade50,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(
                    isImproving
                        ? Icons.trending_up
                        : Icons.trending_down,
                    color: isImproving ? Colors.green : Colors.red,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'Trend: ${isImproving ? "Improving 📈" : "Declining 📉"}',
                    style: TextStyle(
                      color: isImproving ? Colors.green.shade900 : Colors.red.shade900,
                      fontWeight: FontWeight.bold,
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

  Widget _buildMonthSection({
    required String title,
    required PlanningAccuracyMonth month,
    bool showProjected = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 12),
        _buildStatRow('Target:', '${month.targetCompletion} tasks'),
        _buildStatRow('Completed:', '${month.actualCompletion} tasks'),
        _buildStatRow(
          'Accuracy:',
          '${month.accuracyPercentage.toStringAsFixed(1)}%',
          highlighted: true,
        ),
        if (showProjected && month.projectedFinalAccuracy != null)
          _buildStatRow(
            'Projected Final:',
            '${month.projectedFinalAccuracy!.toStringAsFixed(1)}%',
            color: Colors.blue,
          ),
      ],
    );
  }

  Widget _buildStatRow(
    String label,
    String value, {
    bool highlighted = false,
    Color? color,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade700,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 14,
              fontWeight: highlighted ? FontWeight.bold : FontWeight.normal,
              color: color ?? (highlighted ? Colors.blue : Colors.black87),
            ),
          ),
        ],
      ),
    );
  }
}
```

---

## 🔄 State Management (Provider Example)

```dart
// lib/providers/dashboard_provider.dart
import 'package:flutter/foundation.dart';
import '../models/kpi_eksekutif_model.dart';
import '../models/dashboard_operasional_model.dart';
import '../services/dashboard_service.dart';
import '../services/api_client.dart';

class DashboardProvider with ChangeNotifier {
  final DashboardService _dashboardService = DashboardService();

  // KPI Eksekutif State
  KPIEksekutifData? _kpiData;
  bool _kpiLoading = false;
  String? _kpiError;

  // Dashboard Operasional State
  DashboardOperasionalData? _operasionalData;
  bool _operasionalLoading = false;
  String? _operasionalError;

  DateTime? _lastUpdated;

  // Getters
  KPIEksekutifData? get kpiData => _kpiData;
  bool get kpiLoading => _kpiLoading;
  String? get kpiError => _kpiError;

  DashboardOperasionalData? get operasionalData => _operasionalData;
  bool get operasionalLoading => _operasionalLoading;
  String? get operasionalError => _operasionalError;

  DateTime? get lastUpdated => _lastUpdated;

  /// Fetch KPI Eksekutif
  Future<void> fetchKPIEksekutif() async {
    _kpiLoading = true;
    _kpiError = null;
    notifyListeners();

    try {
      _kpiData = await _dashboardService.fetchKPIEksekutif();
      _lastUpdated = DateTime.now();
      _kpiError = null;
    } on ApiException catch (e) {
      _kpiError = e.message;
    } catch (e) {
      _kpiError = 'An unexpected error occurred';
    } finally {
      _kpiLoading = false;
      notifyListeners();
    }
  }

  /// Fetch Dashboard Operasional
  Future<void> fetchDashboardOperasional() async {
    _operasionalLoading = true;
    _operasionalError = null;
    notifyListeners();

    try {
      _operasionalData = await _dashboardService.fetchDashboardOperasional();
      _lastUpdated = DateTime.now();
      _operasionalError = null;
    } on ApiException catch (e) {
      _operasionalError = e.message;
    } catch (e) {
      _operasionalError = 'An unexpected error occurred';
    } finally {
      _operasionalLoading = false;
      notifyListeners();
    }
  }

  /// Refresh all dashboard data
  Future<void> refreshAll() async {
    await Future.wait([
      fetchKPIEksekutif(),
      fetchDashboardOperasional(),
    ]);
  }
}
```

---

## 📱 Screen Examples

### **KPI Eksekutif Screen**

```dart
// lib/screens/kpi_eksekutif_screen.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/dashboard_provider.dart';
import '../widgets/charts/tren_kepatuhan_sop_chart.dart';
import '../widgets/cards/planning_accuracy_card.dart';

class KPIEksekutifScreen extends StatefulWidget {
  const KPIEksekutifScreen({Key? key}) : super(key: key);

  @override
  State<KPIEksekutifScreen> createState() => _KPIEksekutifScreenState();
}

class _KPIEksekutifScreenState extends State<KPIEksekutifScreen> {
  @override
  void initState() {
    super.initState();
    // Fetch data on init
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DashboardProvider>().fetchKPIEksekutif();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard KPI Eksekutif'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<DashboardProvider>().fetchKPIEksekutif();
            },
          ),
        ],
      ),
      body: Consumer<DashboardProvider>(
        builder: (context, provider, child) {
          if (provider.kpiLoading && provider.kpiData == null) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.kpiError != null && provider.kpiData == null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 64, color: Colors.red),
                  const SizedBox(height: 16),
                  Text(
                    provider.kpiError!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 16),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () {
                      provider.fetchKPIEksekutif();
                    },
                    icon: const Icon(Icons.refresh),
                    label: const Text('Retry'),
                  ),
                ],
              ),
            );
          }

          final data = provider.kpiData;
          if (data == null) return const SizedBox();

          return RefreshIndicator(
            onRefresh: () => provider.fetchKPIEksekutif(),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // KPI Cards Row
                Row(
                  children: [
                    Expanded(
                      child: _buildKPICard(
                        title: 'Lead Time APH',
                        value: '${data.kriLeadTimeAph.toStringAsFixed(1)} hari',
                        icon: Icons.access_time,
                        color: Colors.blue,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _buildKPICard(
                        title: 'Kepatuhan SOP',
                        value: '${data.kriKepatuhanSop.toStringAsFixed(1)}%',
                        icon: Icons.checklist,
                        color: Colors.green,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                _buildKPICard(
                  title: 'G4 Aktif (Belum Disanitasi)',
                  value: '${data.trenG4Aktif} pohon',
                  icon: Icons.park,
                  color: Colors.orange,
                ),
                const SizedBox(height: 24),

                // Tren Kepatuhan SOP Chart
                const Text(
                  'Tren Kepatuhan SOP (8 Minggu)',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Card(
                  child: TrenKepatuhanSOPChart(data: data.trenKepatuhanSop),
                ),
                const SizedBox(height: 24),

                // Planning Accuracy
                PlanningAccuracyCard(accuracy: data.planningAccuracy),

                // Last Updated
                if (provider.lastUpdated != null)
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Text(
                      'Last updated: ${_formatDateTime(provider.lastUpdated!)}',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildKPICard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: color, size: 24),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    title,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey.shade700,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              value,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDateTime(DateTime dateTime) {
    return '${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
  }
}
```

---

## 🧪 Testing

```dart
// test/services/dashboard_service_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';

@GenerateMocks([DashboardService])
void main() {
  group('DashboardService', () {
    test('fetchKPIEksekutif returns data successfully', () async {
      // TODO: Implement test
    });

    test('fetchKPIEksekutif handles error correctly', () async {
      // TODO: Implement test
    });
  });
}
```

---

## ⚡ Quick Implementation Checklist

### **Phase 1: Setup (1 hour)**
- [ ] Add dependencies to `pubspec.yaml`
- [ ] Run `flutter pub get`
- [ ] Create folder structure (`models/`, `services/`, `widgets/`, `screens/`)

### **Phase 2: Models (1 hour)**
- [ ] Create data models with `json_serializable`
- [ ] Run `build_runner` to generate `.g.dart` files
- [ ] Test model serialization

### **Phase 3: API Integration (2 hours)**
- [ ] Setup Dio client with interceptors
- [ ] Create `DashboardService`
- [ ] Test API connectivity

### **Phase 4: State Management (1 hour)**
- [ ] Setup Provider (or Riverpod/Bloc)
- [ ] Create `DashboardProvider`
- [ ] Test state updates

### **Phase 5: UI Widgets (3 hours)**
- [ ] Create `CategoryCard` widget
- [ ] Create `PlanningAccuracyCard` widget
- [ ] Create chart widgets
- [ ] Test with mock data

### **Phase 6: Screens (2 hours)**
- [ ] Create `KPIEksekutifScreen`
- [ ] Create `DashboardOperasionalScreen`
- [ ] Add pull-to-refresh
- [ ] Add error handling UI

**Total Time:** ~10 hours

---

## 📚 Additional Resources

- **FL Chart:** https://pub.dev/packages/fl_chart
- **Dio:** https://pub.dev/packages/dio
- **Provider:** https://pub.dev/packages/provider
- **JSON Serializable:** https://pub.dev/packages/json_serializable

---

**Document Version:** 1.0  
**Last Updated:** November 10, 2025  
**Flutter Ready:** ✅ **YES** - Complete Dart/Flutter implementation!
