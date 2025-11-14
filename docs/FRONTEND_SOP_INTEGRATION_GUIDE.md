#  Frontend Integration Guide - SOP Integration v1.3

**Tanggal**: 14 November 2025  
**Backend Version**: v1.3  
**Breaking Changes**:  TIDAK ADA  

---

##  Table of Contents

1. [Overview Perubahan](#1-overview-perubahan)
2. [API Changes Summary](#2-api-changes-summary)
3. [UI/UX Recommendations](#3-uiux-recommendations)
4. [Mobile App Integration](#4-mobile-app-integration)
5. [TypeScript Interfaces](#5-typescript-interfaces)
6. [Breaking Changes](#6-breaking-changes)
7. [Migration Path](#7-migration-path)
8. [Testing Guide](#8-testing-guide)
9. [Support & Questions](#9-support--questions)

---

## 1. Overview Perubahan

Backend v1.3 menambahkan **2 enhancement utama** pada SPK Validasi Drone:

### Enhancement 1: Detail Lokasi Pohon (Baris & Pokok)
**Sebelumnya**: Hanya menampilkan `blok_detail` di `task_description`  
**Sekarang**: 
-  Field baru `tree_location` langsung di level `tugas[]`
-  Field baru `locations[]` di `summary` dengan breakdown per blok

**Benefit untuk Frontend**:
- Tidak perlu parsing `target_json` lagi untuk akses lokasi
- Display lokasi lebih mudah: "Blok D001A, Baris 1, Pokok 5"
- Grouping per blok otomatis dari backend

### Enhancement 2: Integrasi SOP (Standard Operating Procedures)
**Sebelumnya**: Checklist hardcoded di backend  
**Sekarang**:
-  Field baru `sop_reference` di level `spk` dan `tugas.target_json`
-  Checklist dinamis dari database (SOP versioning support)
-  Metadata lengkap: `is_mandatory`, `photo_required`, `guidance`, `estimated_time_mins`

**Benefit untuk Frontend**:
- Display SOP code & version di header SPK
- Show mandatory items dengan icon 
- Show guidance text untuk surveyor
- Estimasi waktu pengerjaan per item
- Future-proof untuk SOP versioning

---

## 2. API Changes Summary

### Endpoint: `POST /api/v1/spk/validasi-drone`

#### Request Body (TIDAK BERUBAH )
```json
{
  "created_by": "uuid-user",
  "assigned_to": "uuid-surveyor",
  "trees": ["uuid-tree-1", "uuid-tree-2"],
  "priority": "HIGH",
  "deadline": "2025-11-25",
  "notes": "Optional notes"
}
```

#### Response Body v1.3 - NEW FIELDS 

**A. Level `spk` - Tambahan field `sop_reference`**

```json
{
  "success": true,
  "data": {
    "spk": {
      "id_spk": "uuid",
      "no_spk": "SPK-xxxxx",
      "nama_spk": "Validasi Drone NDRE - 14/11/2025",
      "jenis_kegiatan": "VALIDASI_DRONE_NDRE",
      "status": "PENDING",
      "prioritas": "URGENT",
      "created_by": "uuid",
      "assigned_to": "uuid",
      "target_selesai": "2025-11-25",
      "catatan": "Notes here",
      "created_at": "2025-11-14T13:19:23.515+00:00",
      
      //  NEW: SOP Reference
      "sop_reference": {
        "id_sop": "438900f8-32e1-4a17-aec2-7efdd3645b7c",
        "sop_code": "SOP-VAL-001",
        "sop_version": "v1.0",
        "sop_name": "SOP Validasi Lapangan Ground Truth v1.0"
      }
    }
  }
}
```

**B. Level `tugas[]` - Tambahan field `tree_location`**

```json
{
  "tugas": [
    {
      "id_tugas": "uuid",
      "id_spk": "uuid",
      "id_pelaksana": "uuid",
      "tipe_tugas": "VALIDASI_NDRE",
      "status_tugas": "PENDING",
      "prioritas": 1,
      "task_priority": "URGENT",
      "task_description": "Validasi pohon P-D001A-01-05 - NDRE: 0.38 (Stres Berat). Lokasi: AME II, D001A, Baris 1, Pokok 5",
      "deadline": "2025-11-25",
      "pic_name": null,
      
      //  NEW: Tree Location (shortcut field - no need to parse target_json!)
      "tree_location": {
        "divisi": "AME II",
        "blok": "D01",
        "blok_detail": "D001A",
        "n_baris": 1,
        "n_pokok": 5
      },
      
      "target_json": {
        // ... existing fields (see section D)
      }
    }
  ]
}
```

**C. Level `summary` - Tambahan field `locations[]`**

```json
{
  "summary": {
    "total_trees": 10,
    "stress_levels": {
      "stres_berat": 3,
      "stres_sedang": 5,
      "sehat": 2
    },
    "priority": "URGENT",
    "deadline": "2025-11-25",
    
    //  NEW: Location Breakdown (auto-grouped by blok)
    "locations": [
      {
        "divisi": "AME II",
        "blok": "D01",
        "blok_detail": "D001A",
        "tree_count": 5,
        "trees": [
          { "n_baris": 1, "n_pokok": 1, "id_tugas": "uuid-1" },
          { "n_baris": 1, "n_pokok": 2, "id_tugas": "uuid-2" },
          { "n_baris": 2, "n_pokok": 1, "id_tugas": "uuid-3" },
          { "n_baris": 2, "n_pokok": 3, "id_tugas": "uuid-4" },
          { "n_baris": 3, "n_pokok": 1, "id_tugas": "uuid-5" }
        ]
      },
      {
        "divisi": "AME II",
        "blok": "D02",
        "blok_detail": "D002B",
        "tree_count": 5,
        "trees": [
          { "n_baris": 1, "n_pokok": 1, "id_tugas": "uuid-6" },
          { "n_baris": 1, "n_pokok": 2, "id_tugas": "uuid-7" }
        ]
      }
    ]
  }
}
```

**D. Level `tugas[].target_json` - Enhanced Checklist **

```json
{
  "target_json": {
    "id_npokok": "uuid",
    "tree_id": "P-D001A-01-05",
    
    //  Enhanced: Now includes tree_location for backward compat
    "tree_location": {
      "divisi": "AME II",
      "blok": "D01",
      "blok_detail": "D001A",
      "n_baris": 1,
      "n_pokok": 5
    },
    
    "drone_data": {
      "id_observasi": "uuid",
      "tanggal_survey": "2025-01-25",
      "ndre_value": 0.38618903,
      "ndre_classification": "Stres Berat"
    },
    
    //  NEW: Dynamic checklist with rich metadata
    "validation_checklist": [
      {
        "id": 1,
        "item": "Cek visual kondisi daun",
        "is_mandatory": true,           //  NEW: Wajib atau tidak
        "photo_required": true,         //  NEW: Perlu foto atau tidak
        "guidance": "Perhatikan warna daun (kuning, coklat, hijau tua), ukuran daun (kecil/normal), dan jumlah daun yang menguning. Bandingkan dengan pohon sehat di sekitarnya.",  //  NEW: Panduan detail
        "estimated_time_mins": 3        //  NEW: Estimasi waktu
      },
      {
        "id": 2,
        "item": "Cek kondisi batang dan grading Ganoderma",
        "is_mandatory": true,
        "photo_required": true,
        "guidance": "Lihat tabel grading Ganoderma (G0-G4). Periksa adanya jamur, busuk batang, atau tanda penyakit lain. Foto bagian batang yang terinfeksi.",
        "estimated_time_mins": 4
      },
      {
        "id": 3,
        "item": "Cek kondisi tanah",
        "is_mandatory": true,
        "photo_required": false,
        "guidance": "Perhatikan kelembaban tanah (kering/lembab/basah), warna tanah, dan ada tidaknya genangan air atau retakan.",
        "estimated_time_mins": 2
      },
      {
        "id": 4,
        "item": "Foto 4 arah (UTSB)",
        "is_mandatory": true,
        "photo_required": true,
        "guidance": "Ambil foto dari 4 arah: Utara, Timur, Selatan, Barat. Pastikan pohon target ada di tengah frame. Foto landscape mode.",
        "estimated_time_mins": 3
      },
      {
        "id": 5,
        "item": "Verifikasi prediksi drone",
        "is_mandatory": true,
        "photo_required": false,
        "guidance": "Bandingkan kondisi lapangan dengan hasil NDRE drone. Apakah sesuai (match) atau berbeda? Catat tingkat kesesuaian (0-100%).",
        "estimated_time_mins": 2
      },
      {
        "id": 6,
        "item": "Catat penyebab stress",
        "is_mandatory": false,          //  Optional item
        "photo_required": false,
        "guidance": "Jika pohon stress, catat penyebab utama: Penyakit (Ganoderma/lainnya), Kekeringan, Hama, Nutrisi, atau lainnya. Bisa pilih lebih dari 1.",
        "estimated_time_mins": 1
      }
    ],
    
    //  NEW: SOP Reference (same as spk level + extra totals)
    "sop_reference": {
      "id_sop": "438900f8-32e1-4a17-aec2-7efdd3645b7c",
      "sop_code": "SOP-VAL-001",
      "sop_version": "v1.0",
      "sop_name": "SOP Validasi Lapangan Ground Truth v1.0",
      "mandatory_photos": 4,           //  Total foto wajib
      "estimated_time_mins": 15        //  Total estimasi waktu
    }
  }
}
```

**Summary of Changes**:

| Level | Field | Type | Description |
|-------|-------|------|-------------|
| `spk` | `sop_reference` | Object | SOP info (code, version, name) |
| `tugas[]` | `tree_location` | Object | Shortcut lokasi (divisi, blok, baris, pokok) |
| `summary` | `locations[]` | Array | Grouping per blok dengan tree count |
| `target_json` | `validation_checklist[].is_mandatory` | Boolean | Item wajib atau tidak |
| `target_json` | `validation_checklist[].photo_required` | Boolean | Perlu foto atau tidak |
| `target_json` | `validation_checklist[].guidance` | String | Panduan untuk surveyor |
| `target_json` | `validation_checklist[].estimated_time_mins` | Number | Estimasi waktu pengerjaan |
| `target_json` | `sop_reference` | Object | Full SOP info + totals |

---

## 3. UI/UX Recommendations

### A. SPK Header - Display SOP Badge

**React/TypeScript Example**:

```tsx
interface SPKHeaderProps {
  spk: {
    no_spk: string;
    nama_spk: string;
    jenis_kegiatan: string;
    status: string;
    sop_reference?: {
      sop_code: string;
      sop_version: string;
      sop_name: string;
    };
  };
}

function SPKHeader({ spk }: SPKHeaderProps) {
  return (
    <div className="spk-header">
      <div className="spk-title">
        <h2>{spk.no_spk}</h2>
        <span className="spk-name">{spk.nama_spk}</span>
      </div>
      
      <div className="spk-metadata">
        <span className={`status-badge status-${spk.status.toLowerCase()}`}>
          {spk.status}
        </span>
        
        {/*  NEW: SOP Badge */}
        {spk.sop_reference && (
          <div className="sop-badge-container">
            <span className="badge badge-info sop-badge">
               {spk.sop_reference.sop_code} {spk.sop_reference.sop_version}
            </span>
            <Tooltip content={spk.sop_reference.sop_name} placement="bottom">
              <InfoIcon className="info-icon" />
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Vue 3 Example**:

```vue
<template>
  <div class="spk-header">
    <div class="spk-title">
      <h2>{{ spk.no_spk }}</h2>
      <span class="spk-name">{{ spk.nama_spk }}</span>
    </div>
    
    <div class="spk-metadata">
      <el-tag :type="getStatusType(spk.status)">{{ spk.status }}</el-tag>
      
      <!--  NEW: SOP Badge -->
      <el-tooltip 
        v-if="spk.sop_reference" 
        :content="spk.sop_reference.sop_name"
        placement="bottom"
      >
        <el-tag type="info" size="small" class="sop-badge">
           {{ spk.sop_reference.sop_code }} {{ spk.sop_reference.sop_version }}
        </el-tag>
      </el-tooltip>
    </div>
  </div>
</template>

<style scoped>
.sop-badge {
  margin-left: 8px;
  cursor: help;
}
</style>
```

### B. Task List - Location Breakdown

**React Example with Grouping**:

```tsx
interface LocationBreakdown {
  divisi: string;
  blok: string;
  blok_detail: string;
  tree_count: number;
  trees: Array<{
    n_baris: number;
    n_pokok: number;
    id_tugas: string;
  }>;
}

function TaskLocationSummary({ summary }: { summary: { locations: LocationBreakdown[] } }) {
  return (
    <div className="location-breakdown">
      <h4> Lokasi Tugas ({summary.locations.reduce((sum, loc) => sum + loc.tree_count, 0)} pohon)</h4>
      
      {summary.locations.map(loc => (
        <div key={`${loc.divisi}-${loc.blok_detail}`} className="location-group">
          <div className="location-header">
            <strong>{loc.divisi} - Blok {loc.blok_detail}</strong>
            <span className="badge badge-secondary">{loc.tree_count} pohon</span>
          </div>
          
          {/*  Show tree details as tags */}
          <div className="tree-list">
            {loc.trees.map(tree => (
              <Link 
                key={tree.id_tugas} 
                to={`/task/${tree.id_tugas}`}
                className="tree-tag"
              >
                B{tree.n_baris}-P{tree.n_pokok}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

**CSS Suggestions**:

```css
.location-breakdown {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 16px 0;
}

.location-group {
  margin-bottom: 12px;
  padding: 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.location-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.tree-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tree-tag {
  display: inline-block;
  padding: 4px 8px;
  background: #e3f2fd;
  border: 1px solid #90caf9;
  border-radius: 4px;
  font-size: 12px;
  text-decoration: none;
  color: #1976d2;
  transition: all 0.2s;
}

.tree-tag:hover {
  background: #90caf9;
  color: white;
}
```

### C. Task Detail - Enhanced Checklist Display

**React Component with All Metadata**:

```tsx
interface ChecklistItem {
  id: number;
  item: string;
  is_mandatory: boolean;
  photo_required: boolean;
  guidance: string;
  estimated_time_mins: number;
  // Runtime state (not from API)
  completed?: boolean;
  photo_url?: string;
  notes?: string;
}

function EnhancedChecklistItem({ 
  item, 
  onCheck, 
  onPhotoCapture 
}: { 
  item: ChecklistItem; 
  onCheck: (id: number, checked: boolean) => void;
  onPhotoCapture: (id: number) => void;
}) {
  const [showGuidance, setShowGuidance] = useState(false);
  
  return (
    <div className={`checklist-item ${item.is_mandatory ? 'mandatory' : 'optional'}`}>
      <div className="checklist-header">
        <input 
          type="checkbox" 
          checked={item.completed || false}
          onChange={(e) => onCheck(item.id, e.target.checked)}
          id={`check-${item.id}`}
        />
        
        <label htmlFor={`check-${item.id}`} className="item-text">
          {item.item}
        </label>
        
        {/*  Mandatory indicator */}
        {item.is_mandatory && (
          <span className="badge badge-danger mandatory-badge" title="Item wajib">
             Wajib
          </span>
        )}
      </div>
      
      <div className="checklist-metadata">
        {/*  Photo required indicator */}
        {item.photo_required && (
          <button 
            className="btn-icon photo-button"
            onClick={() => onPhotoCapture(item.id)}
            title="Foto diperlukan"
          >
             Foto {item.photo_url ? '' : 'diperlukan'}
          </button>
        )}
        
        {/*  Time estimate */}
        <span className="time-estimate" title="Estimasi waktu">
           ~{item.estimated_time_mins} menit
        </span>
        
        {/*  Guidance tooltip */}
        {item.guidance && (
          <button 
            className="btn-icon guidance-button"
            onClick={() => setShowGuidance(!showGuidance)}
            title="Lihat panduan"
          >
            <InfoIcon /> Panduan
          </button>
        )}
      </div>
      
      {/*  Expandable guidance text */}
      {showGuidance && item.guidance && (
        <div className="guidance-panel">
          <p>{item.guidance}</p>
        </div>
      )}
      
      {/* Photo preview if uploaded */}
      {item.photo_url && (
        <div className="photo-preview">
          <img src={item.photo_url} alt={`Foto ${item.item}`} />
        </div>
      )}
    </div>
  );
}

function ChecklistProgress({ 
  checklist, 
  sopRef 
}: { 
  checklist: ChecklistItem[];
  sopRef?: { mandatory_photos: number; estimated_time_mins: number };
}) {
  const completed = checklist.filter(item => item.completed).length;
  const mandatory = checklist.filter(item => item.is_mandatory).length;
  const mandatoryCompleted = checklist.filter(
    item => item.is_mandatory && item.completed
  ).length;
  const photosUploaded = checklist.filter(
    item => item.photo_required && item.photo_url
  ).length;
  
  const progress = (completed / checklist.length) * 100;
  const mandatoryProgress = (mandatoryCompleted / mandatory) * 100;
  
  return (
    <div className="progress-tracker">
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="progress-text">{Math.round(progress)}%</span>
      </div>
      
      <div className="progress-stats">
        <div className="stat-item">
          <span className="stat-label">Items Selesai:</span>
          <span className="stat-value">{completed}/{checklist.length}</span>
        </div>
        
        <div className="stat-item mandatory-stat">
          <span className="stat-label">
            {mandatoryCompleted === mandatory ? '' : ''} Mandatory:
          </span>
          <span className={`stat-value ${mandatoryCompleted === mandatory ? 'complete' : 'incomplete'}`}>
            {mandatoryCompleted}/{mandatory}
          </span>
        </div>
        
        {sopRef && (
          <>
            <div className="stat-item">
              <span className="stat-label"> Foto:</span>
              <span className="stat-value">{photosUploaded}/{sopRef.mandatory_photos}</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label"> Estimasi:</span>
              <span className="stat-value">{sopRef.estimated_time_mins} menit</span>
            </div>
          </>
        )}
      </div>
      
      {/*  Warning if mandatory items not complete */}
      {mandatoryCompleted < mandatory && (
        <div className="alert alert-warning">
           Perhatian: {mandatory - mandatoryCompleted} mandatory items belum selesai.
          Compliance rate akan dibatasi maksimal 70%.
        </div>
      )}
    </div>
  );
}
```

---

## 4. Mobile App Integration (Platform A)

### Flutter/Dart Models

```dart
// ============================================
// Response Models
// ============================================

class CreateSPKResponse {
  final bool success;
  final String message;
  final SPKData data;
  
  CreateSPKResponse.fromJson(Map<String, dynamic> json)
      : success = json['success'],
        message = json['message'],
        data = SPKData.fromJson(json['data']);
}

class SPKData {
  final SPKDetail spk;
  final List<TaskDetail> tugas;
  final SPKSummary summary;
  
  SPKData.fromJson(Map<String, dynamic> json)
      : spk = SPKDetail.fromJson(json['spk']),
        tugas = (json['tugas'] as List)
            .map((t) => TaskDetail.fromJson(t))
            .toList(),
        summary = SPKSummary.fromJson(json['summary']);
}

class SPKDetail {
  final String idSpk;
  final String noSpk;
  final String namaSpk;
  final String jenisKegiatan;
  final String status;
  final String prioritas;
  final SOPReference? sopReference;  //  NEW
  
  SPKDetail.fromJson(Map<String, dynamic> json)
      : idSpk = json['id_spk'],
        noSpk = json['no_spk'],
        namaSpk = json['nama_spk'],
        jenisKegiatan = json['jenis_kegiatan'],
        status = json['status'],
        prioritas = json['prioritas'],
        sopReference = json['sop_reference'] != null
            ? SOPReference.fromJson(json['sop_reference'])
            : null;
}

class SOPReference {
  final String idSop;
  final String sopCode;
  final String sopVersion;
  final String sopName;
  final int? mandatoryPhotos;
  final int? estimatedTimeMins;
  
  SOPReference.fromJson(Map<String, dynamic> json)
      : idSop = json['id_sop'],
        sopCode = json['sop_code'],
        sopVersion = json['sop_version'],
        sopName = json['sop_name'],
        mandatoryPhotos = json['mandatory_photos'],
        estimatedTimeMins = json['estimated_time_mins'];
  
  String get displayName => '$sopCode $sopVersion';
}

class TaskDetail {
  final String idTugas;
  final String taskDescription;
  final TreeLocation? treeLocation;  //  NEW: Shortcut field
  final TargetJson targetJson;
  
  TaskDetail.fromJson(Map<String, dynamic> json)
      : idTugas = json['id_tugas'],
        taskDescription = json['task_description'],
        treeLocation = json['tree_location'] != null
            ? TreeLocation.fromJson(json['tree_location'])
            : null,
        targetJson = TargetJson.fromJson(json['target_json']);
}

class TreeLocation {
  final String divisi;
  final String blok;
  final String blokDetail;
  final int nBaris;
  final int nPokok;
  
  TreeLocation.fromJson(Map<String, dynamic> json)
      : divisi = json['divisi'] ?? '',
        blok = json['blok'] ?? '',
        blokDetail = json['blok_detail'] ?? '',
        nBaris = json['n_baris'] ?? 0,
        nPokok = json['n_pokok'] ?? 0;
  
  String get displayName => 'Blok $blokDetail, Baris $nBaris, Pokok $nPokok';
  String get shortName => 'B$nBaris-P$nPokok';
}

class TargetJson {
  final String idNpokok;
  final String treeId;
  final TreeLocation? treeLocation;
  final DroneData droneData;
  final List<ChecklistItem> validationChecklist;
  final SOPReference? sopReference;  //  NEW
  
  TargetJson.fromJson(Map<String, dynamic> json)
      : idNpokok = json['id_npokok'],
        treeId = json['tree_id'],
        treeLocation = json['tree_location'] != null
            ? TreeLocation.fromJson(json['tree_location'])
            : null,
        droneData = DroneData.fromJson(json['drone_data']),
        validationChecklist = (json['validation_checklist'] as List)
            .map((c) => ChecklistItem.fromJson(c))
            .toList(),
        sopReference = json['sop_reference'] != null
            ? SOPReference.fromJson(json['sop_reference'])
            : null;
}

class ChecklistItem {
  final int id;
  final String item;
  final bool isMandatory;        //  NEW
  final bool photoRequired;      //  NEW
  final String guidance;         //  NEW
  final int estimatedTimeMins;   //  NEW
  
  // Runtime state
  bool completed;
  String? photoUrl;
  String? notes;
  
  ChecklistItem.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        item = json['item'],
        isMandatory = json['is_mandatory'] ?? false,
        photoRequired = json['photo_required'] ?? false,
        guidance = json['guidance'] ?? '',
        estimatedTimeMins = json['estimated_time_mins'] ?? 0,
        completed = false,
        photoUrl = null,
        notes = null;
  
  Map<String, dynamic> toSubmitJson() => {
    'id': id,
    'completed': completed,
    'photo_url': photoUrl,
    'notes': notes,
  };
}

class SPKSummary {
  final int totalTrees;
  final List<LocationBreakdown> locations;  //  NEW
  
  SPKSummary.fromJson(Map<String, dynamic> json)
      : totalTrees = json['total_trees'],
        locations = (json['locations'] as List?)
                ?.map((l) => LocationBreakdown.fromJson(l))
                .toList() ?? [];
}

class LocationBreakdown {
  final String divisi;
  final String blok;
  final String blokDetail;
  final int treeCount;
  final List<TreeRef> trees;
  
  LocationBreakdown.fromJson(Map<String, dynamic> json)
      : divisi = json['divisi'],
        blok = json['blok'],
        blokDetail = json['blok_detail'],
        treeCount = json['tree_count'],
        trees = (json['trees'] as List)
            .map((t) => TreeRef.fromJson(t))
            .toList();
}

class TreeRef {
  final int nBaris;
  final int nPokok;
  final String idTugas;
  
  TreeRef.fromJson(Map<String, dynamic> json)
      : nBaris = json['n_baris'],
        nPokok = json['n_pokok'],
        idTugas = json['id_tugas'];
}
```

### Flutter UI Widgets

```dart
// ============================================
// SPK Header with SOP Badge
// ============================================

class SPKHeaderWidget extends StatelessWidget {
  final SPKDetail spk;
  
  const SPKHeaderWidget({required this.spk});
  
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  spk.noSpk,
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                _buildStatusChip(spk.status),
              ],
            ),
            SizedBox(height: 8),
            Text(spk.namaSpk, style: TextStyle(fontSize: 14, color: Colors.grey[700])),
            
            //  NEW: SOP Badge
            if (spk.sopReference != null) ...[
              SizedBox(height: 12),
              _buildSOPBadge(context, spk.sopReference!),
            ],
          ],
        ),
      ),
    );
  }
  
  Widget _buildSOPBadge(BuildContext context, SOPReference sop) {
    return InkWell(
      onTap: () {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: Text('Info SOP'),
            content: Text(sop.sopName),
            actions: [
              TextButton(
                child: Text('OK'),
                onPressed: () => Navigator.pop(ctx),
              ),
            ],
          ),
        );
      },
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.blue[50],
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.blue[300]!),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(' ', style: TextStyle(fontSize: 14)),
            Text(
              sop.displayName,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: Colors.blue[800],
              ),
            ),
            SizedBox(width: 4),
            Icon(Icons.info_outline, size: 14, color: Colors.blue[600]),
          ],
        ),
      ),
    );
  }
  
  Widget _buildStatusChip(String status) {
    Color color;
    switch (status) {
      case 'PENDING':
        color = Colors.orange;
        break;
      case 'IN_PROGRESS':
        color = Colors.blue;
        break;
      case 'COMPLETED':
        color = Colors.green;
        break;
      default:
        color = Colors.grey;
    }
    
    return Chip(
      label: Text(status, style: TextStyle(fontSize: 12)),
      backgroundColor: color.withOpacity(0.2),
      labelStyle: TextStyle(color: color[800]),
    );
  }
}

// ============================================
// Task Card with Tree Location
// ============================================

class TaskCard extends StatelessWidget {
  final TaskDetail task;
  final VoidCallback onTap;
  
  const TaskCard({required this.task, required this.onTap});
  
  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                task.taskDescription,
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
              ),
              SizedBox(height: 8),
              
              //  NEW: Easy location display
              if (task.treeLocation != null)
                Chip(
                  avatar: Icon(Icons.location_on, size: 16),
                  label: Text(
                    task.treeLocation!.displayName,
                    style: TextStyle(fontSize: 12),
                  ),
                  backgroundColor: Colors.green[50],
                ),
            ],
          ),
        ),
      ),
    );
  }
}

// ============================================
// Enhanced Checklist Item
// ============================================

class ChecklistItemWidget extends StatelessWidget {
  final ChecklistItem item;
  final ValueChanged<bool> onCheckChanged;
  final VoidCallback onPhotoCapture;
  
  const ChecklistItemWidget({
    required this.item,
    required this.onCheckChanged,
    required this.onPhotoCapture,
  });
  
  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: ExpansionTile(
        leading: Checkbox(
          value: item.completed,
          onChanged: (value) => onCheckChanged(value ?? false),
        ),
        title: Row(
          children: [
            Expanded(
              child: Text(item.item, style: TextStyle(fontSize: 14)),
            ),
            
            //  Mandatory badge
            if (item.isMandatory)
              Container(
                padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.red[100],
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  ' WAJIB',
                  style: TextStyle(fontSize: 10, color: Colors.red[900]),
                ),
              ),
          ],
        ),
        subtitle: Row(
          children: [
            //  Photo indicator
            if (item.photoRequired) ...[
              Icon(Icons.camera_alt, size: 14, color: Colors.grey[600]),
              SizedBox(width: 4),
              Text(
                item.photoUrl != null ? 'Foto ' : 'Foto diperlukan',
                style: TextStyle(fontSize: 12),
              ),
              SizedBox(width: 12),
            ],
            
            //  Time estimate
            Icon(Icons.timer, size: 14, color: Colors.grey[600]),
            SizedBox(width: 4),
            Text('~${item.estimatedTimeMins} menit', style: TextStyle(fontSize: 12)),
          ],
        ),
        children: [
          //  Guidance text
          if (item.guidance.isNotEmpty)
            Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(' Panduan:', style: TextStyle(fontWeight: FontWeight.bold)),
                  SizedBox(height: 4),
                  Text(item.guidance, style: TextStyle(fontSize: 13)),
                  SizedBox(height: 12),
                  
                  //  Photo capture button
                  if (item.photoRequired)
                    ElevatedButton.icon(
                      icon: Icon(Icons.add_a_photo),
                      label: Text(item.photoUrl != null ? 'Ganti Foto' : 'Ambil Foto'),
                      onPressed: onPhotoCapture,
                    ),
                ],
              ),
            ),
          
          // Photo preview
          if (item.photoUrl != null)
            Padding(
              padding: EdgeInsets.all(16),
              child: Image.network(item.photoUrl!, height: 150, fit: BoxFit.cover),
            ),
        ],
      ),
    );
  }
}
```

### Submit Hasil with Compliance Tracking

```dart
Future<void> submitHasil(
  String idTugas,
  String idPetugas,
  List<ChecklistItem> checklist,
  SOPReference? sopReference,
) async {
  // Calculate compliance
  final totalItems = checklist.length;
  final completedItems = checklist.where((item) => item.completed).length;
  final mandatoryItems = checklist.where((item) => item.isMandatory).length;
  final mandatoryCompleted = checklist
      .where((item) => item.isMandatory && item.completed)
      .length;
  
  final complianceRate = (completedItems / totalItems) * 100;
  
  //  Apply 70% penalty if mandatory items not complete
  final finalComplianceRate = mandatoryCompleted == mandatoryItems
      ? complianceRate
      : min(complianceRate, 70.0);
  
  final payload = {
    'id_tugas': idTugas,
    'id_petugas': idPetugas,
    'hasil_json': {
      'checklist_completed': checklist.map((item) => item.toSubmitJson()).toList(),
      
      //  NEW: SOP Compliance tracking
      if (sopReference != null)
        'sop_compliance': {
          'id_sop': sopReference.idSop,
          'sop_version': sopReference.sopVersion,
          'mandatory_completed': mandatoryCompleted,
          'mandatory_total': mandatoryItems,
          'compliance_rate': finalComplianceRate,
        },
    },
  };
  
  try {
    final response = await dio.post(
      '/api/v1/spk/log_aktivitas',
      data: payload,
    );
    
    if (response.data['success']) {
      // Show success message
      Get.snackbar(
        'Berhasil',
        'Hasil validasi berhasil dikirim. Compliance: ${finalComplianceRate.toStringAsFixed(1)}%',
        backgroundColor: Colors.green[100],
      );
    }
  } catch (e) {
    Get.snackbar('Error', 'Gagal mengirim hasil: $e');
  }
}
```

---

## 5. TypeScript Interfaces

Complete TypeScript definitions for type safety:

```typescript
// ============================================
// API Response Types
// ============================================

interface CreateSPKResponse {
  success: boolean;
  message: string;
  data: {
    spk: SPKDetail;
    tugas: TaskDetail[];
    summary: SPKSummary;
  };
}

// ============================================
// SPK Level
// ============================================

interface SPKDetail {
  id_spk: string;
  no_spk: string;
  nama_spk: string;
  jenis_kegiatan: 'VALIDASI_DRONE_NDRE' | string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  prioritas: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  created_by: string;
  assigned_to: string;
  target_selesai: string; // ISO date
  catatan?: string;
  created_at: string;
  
  //  NEW: SOP Reference
  sop_reference?: SOPReference;
}

interface SOPReference {
  id_sop: string;
  sop_code: string;        // e.g., "SOP-VAL-001"
  sop_version: string;     // e.g., "v1.0"
  sop_name: string;        // e.g., "SOP Validasi Lapangan Ground Truth v1.0"
  mandatory_photos?: number;      // Only in target_json.sop_reference
  estimated_time_mins?: number;   // Only in target_json.sop_reference
}

// ============================================
// Task Level
// ============================================

interface TaskDetail {
  id_tugas: string;
  id_spk: string;
  id_pelaksana: string;
  tipe_tugas: string;
  status_tugas: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  prioritas: number;
  task_priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  task_description: string;
  deadline: string; // ISO date
  pic_name?: string;
  
  //  NEW: Tree Location (shortcut field)
  tree_location?: TreeLocation;
  
  target_json: TargetJson;
}

interface TreeLocation {
  divisi: string;        // e.g., "AME II"
  blok: string;          // e.g., "D01"
  blok_detail: string;   // e.g., "D001A"
  n_baris: number;       // e.g., 1
  n_pokok: number;       // e.g., 5
}

interface TargetJson {
  id_npokok: string;
  tree_id: string;
  
  // Tree location (also available at tugas level)
  tree_location?: TreeLocation;
  
  drone_data: {
    id_observasi: string;
    tanggal_survey: string;
    ndre_value: number;
    ndre_classification: string;
  };
  
  //  NEW: Dynamic checklist with metadata
  validation_checklist: ChecklistItem[];
  
  //  NEW: SOP Reference (full details with totals)
  sop_reference?: SOPReference;
}

interface ChecklistItem {
  id: number;
  item: string;
  
  //  NEW: Metadata
  is_mandatory: boolean;
  photo_required: boolean;
  guidance: string;
  estimated_time_mins: number;
  
  // Runtime state (not from API, managed by frontend)
  completed?: boolean;
  photo_url?: string;
  notes?: string;
}

// ============================================
// Summary Level
// ============================================

interface SPKSummary {
  total_trees: number;
  stress_levels: {
    stres_berat: number;
    stres_sedang: number;
    sehat: number;
  };
  priority: string;
  deadline: string;
  
  //  NEW: Location Breakdown
  locations: LocationBreakdown[];
}

interface LocationBreakdown {
  divisi: string;
  blok: string;
  blok_detail: string;
  tree_count: number;
  trees: TreeReference[];
}

interface TreeReference {
  n_baris: number;
  n_pokok: number;
  id_tugas: string;
}

// ============================================
// Submit Hasil Types
// ============================================

interface SubmitHasilPayload {
  id_tugas: string;
  id_petugas: string;
  hasil_json: {
    checklist_completed: ChecklistSubmission[];
    sop_compliance?: SOPComplianceData;
  };
}

interface ChecklistSubmission {
  id: number;
  completed: boolean;
  photo_url?: string;
  notes?: string;
}

interface SOPComplianceData {
  id_sop: string;
  sop_version: string;
  mandatory_completed: number;
  mandatory_total: number;
  compliance_rate: number;  // 0-100, max 70 if mandatory incomplete
}
```

---

## 6. Breaking Changes

###  TIDAK ADA Breaking Changes

Semua field baru bersifat **optional** dan **backward compatible**:

-  **Field lama tetap ada** - Response structure tidak berubah
-  **Request body tidak berubah** - Endpoint signature sama
-  **Fallback mechanism** - Jika SOP tidak ditemukan, gunakan checklist default
-  **Type-safe** - TypeScript interfaces support optional fields

### Backward Compatibility Strategy

```typescript
//  Safe access with fallback
function getLocationDisplay(task: TaskDetail): string {
  // Try shortcut first, fallback to nested location
  const loc = task.tree_location || task.target_json.tree_location;
  return loc ? `Blok ${loc.blok_detail}, Baris ${loc.n_baris}, Pokok ${loc.n_pokok}` : 'N/A';
}

//  Safe SOP display
function renderSOPBadge(spk: SPKDetail): ReactNode {
  if (!spk.sop_reference) return null;
  return <SOPBadge sop={spk.sop_reference} />;
}

//  Safe checklist metadata access
function renderChecklistItem(item: ChecklistItem): ReactNode {
  return (
    <div>
      <input type="checkbox" />
      <label>{item.item}</label>
      
      {/* Only show if metadata exists */}
      {item.is_mandatory && <span> Wajib</span>}
      {item.photo_required && <span></span>}
      {item.guidance && <Tooltip content={item.guidance} />}
    </div>
  );
}
```

---

## 7. Migration Path

### Option A: Gradual Migration (Recommended )

Deploy frontend updates incrementally tanpa breaking existing features.

**Phase 1: Display Only** (No breaking changes, 1-2 days)
- Update display components untuk show new fields (jika ada)
- Maintain fallback ke field lama
- No logic changes

```typescript
// Add fallback to existing code
const location = task.tree_location || task.target_json.tree_location;
```

**Phase 2: UI Enhancements** (Add new features, 3-5 days)
- Implement SOP badge di SPK header
- Add location breakdown grouping
- Add enhanced checklist display (mandatory, photo, guidance)

**Phase 3: Full Integration** (Enable all features, 1 week)
- Implement compliance tracking
- Add progress indicators
- Enable photo capture workflow
- Add guidance tooltips

### Option B: Full Upgrade (All-at-once)

Update seluruh codebase sekaligus. Cocok untuk codebase kecil atau tim kecil.

**Steps**:
1. Update TypeScript interfaces
2. Update all components to use new fields
3. Test thoroughly with sample response
4. Deploy in one go

---

## 8. Testing Guide

### Test Scenario 1: Create SPK with SOP 

**Request**:
```bash
POST http://localhost:3000/api/v1/spk/validasi-drone
Content-Type: application/json

{
  "created_by": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10",
  "assigned_to": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "trees": [
    "24ad6423-f07c-4496-994d-856a79ec619a",
    "d92b8a49-9863-45bd-a883-7e5b713ad455"
  ],
  "priority": "HIGH",
  "deadline": "2025-11-25",
  "notes": "Test SOP Integration"
}
```

**Verification Checklist**:
- [ ] `success` = true
- [ ] `spk.sop_reference` ada dan berisi:
  - [ ] `sop_code` = "SOP-VAL-001"
  - [ ] `sop_version` = "v1.0"
  - [ ] `sop_name` = "SOP Validasi Lapangan Ground Truth v1.0"
- [ ] `tugas[0].tree_location` ada dengan:
  - [ ] `divisi` = "AME II"
  - [ ] `blok_detail` = "D001A"
  - [ ] `n_baris` = number
  - [ ] `n_pokok` = number
- [ ] `summary.locations` ada dengan minimal 1 entry
- [ ] `tugas[0].target_json.validation_checklist` berisi 6 items
- [ ] Setiap checklist item punya metadata:
  - [ ] `is_mandatory` (boolean)
  - [ ] `photo_required` (boolean)
  - [ ] `guidance` (string)
  - [ ] `estimated_time_mins` (number)

### Test Scenario 2: Backward Compatibility 

**Mock Old Response** (simulate v1.2):
```typescript
const oldResponse: CreateSPKResponse = {
  success: true,
  message: "OK",
  data: {
    spk: {
      id_spk: "uuid",
      no_spk: "SPK-12345",
      // NO sop_reference field
    } as SPKDetail,
    tugas: [{
      id_tugas: "uuid",
      task_description: "Task 1",
      // NO tree_location field
      target_json: {
        tree_location: { divisi: "AME II", blok_detail: "D001A", n_baris: 1, n_pokok: 1 },
        validation_checklist: [
          { id: 1, item: "Check leaves" } // No metadata
        ]
      }
    }] as TaskDetail[],
    summary: {
      total_trees: 2,
      // NO locations field
    } as SPKSummary
  }
};
```

**Test Code**:
```typescript
//  Should NOT crash
function testBackwardCompat(response: CreateSPKResponse) {
  const { spk, tugas, summary } = response.data;
  
  // Test SOP display
  const sopDisplay = spk.sop_reference 
    ? `${spk.sop_reference.sop_code} ${spk.sop_reference.sop_version}`
    : 'No SOP';
  console.log('SOP:', sopDisplay); // Should print "No SOP" for old response
  
  // Test location display
  const loc = tugas[0].tree_location || tugas[0].target_json.tree_location;
  const locDisplay = loc ? `${loc.blok_detail} B${loc.n_baris} P${loc.n_pokok}` : 'N/A';
  console.log('Location:', locDisplay); // Should work for both old and new
  
  // Test locations breakdown
  const locationCount = summary.locations?.length || 0;
  console.log('Location groups:', locationCount); // Should be 0 for old response
  
  // Test checklist metadata
  const firstItem = tugas[0].target_json.validation_checklist[0];
  const isMandatory = firstItem.is_mandatory ?? false; // Use nullish coalescing
  const photoRequired = firstItem.photo_required ?? false;
  console.log('Mandatory:', isMandatory); // Should be false for old response
}

testBackwardCompat(oldResponse); //  Should pass without errors
```

### Test Scenario 3: UI Component Testing

**React Testing Library Example**:
```typescript
import { render, screen } from '@testing-library/react';

test('displays SOP badge when sop_reference exists', () => {
  const spk = {
    no_spk: 'SPK-12345',
    sop_reference: {
      sop_code: 'SOP-VAL-001',
      sop_version: 'v1.0',
      sop_name: 'Test SOP'
    }
  } as SPKDetail;
  
  render(<SPKHeader spk={spk} />);
  
  expect(screen.getByText(/SOP-VAL-001 v1.0/i)).toBeInTheDocument();
});

test('handles missing sop_reference gracefully', () => {
  const spk = {
    no_spk: 'SPK-12345',
    // NO sop_reference
  } as SPKDetail;
  
  render(<SPKHeader spk={spk} />);
  
  expect(screen.queryByText(/SOP-VAL/i)).not.toBeInTheDocument();
});
```

---

## 9. Support & Questions

### FAQ

**Q1: Apakah wajib menampilkan semua field baru?**  
**A**: Tidak. Field baru bersifat **optional enhancement**. Anda bisa adopt secara bertahap sesuai prioritas:
- Priority 1: Tree location display (user request utama)
- Priority 2: SOP badge
- Priority 3: Enhanced checklist metadata

**Q2: Bagaimana jika `sop_reference` null?**  
**A**: Artinya belum ada SOP untuk jenis kegiatan tersebut. Backend akan gunakan checklist default (hardcoded). Frontend cukup:
- Hide SOP badge
- Display checklist tanpa metadata (fallback ke basic display)

**Q3: Apakah checklist format berubah?**  
**A**: Struktur dasar **sama** (`id`, `item`). Hanya **tambahan** field metadata:
- `is_mandatory`, `photo_required`, `guidance`, `estimated_time_mins`
- Old code yang hanya akses `id` dan `item` tetap jalan

**Q4: Bagaimana cara test tanpa hit production API?**  
**A**: Gunakan sample response:
1. Copy JSON dari `docs/SAMPLE_RESPONSE_SPK_WITH_SOP.json`
2. Mock API call di test/development environment
3. Verify UI rendering dengan mock data

**Q5: Apakah ada perubahan di endpoint lain?**  
**A**: **Tidak**. Hanya endpoint `POST /api/v1/spk/validasi-drone` yang enhanced. Endpoint lain (GET list SPK, submit hasil, dll) tidak berubah.

**Q6: Bagaimana cara track compliance rate 70% penalty?**  
**A**: Saat surveyor submit hasil:
1. Hitung `mandatory_completed` vs `mandatory_total`
2. Jika `mandatory_completed < mandatory_total`, set `compliance_rate = Math.min(actual_rate, 70)`
3. Send ke backend via `hasil_json.sop_compliance`

**Q7: Apakah perlu update existing SPK yang sudah dibuat?**  
**A**: **Tidak perlu**. SPK lama tetap valid. Hanya SPK baru (dibuat setelah migration) yang akan punya SOP reference.

### Kontak Support

- **Backend Developer**: Mastoro Shadiq
- **Repository**: `dashboard-poac` (GitHub: mastoroshadiq-prog)
- **Documentation Folder**: `docs/`
- **Sample Response**: `docs/SAMPLE_RESPONSE_SPK_WITH_SOP.json`
- **Quick Reference**: `docs/QUICK_REFERENCE_SOP.md`
- **Backend Implementation Guide**: `docs/IMPLEMENTATION_GUIDE_SOP_INTEGRATION.md`

### Related Files

**SQL Scripts**:
- `sql/migration_001_sop_integration.sql` - Database schema migration
- `sql/seed_001_sop_initial_data.sql` - Initial SOP data (SOP-VAL-001 v1.0)

**Backend Services**:
- `services/spkValidasiDroneService.js` - SPK creation with SOP integration
- `services/sopComplianceService.js` - Compliance tracking logic

**Documentation**:
- `QUICK_START_SOP_INTEGRATION.md` - Quick deployment guide (root folder)
- `docs/ANALISIS_ENHANCEMENT_SPK_DETAIL_DAN_SOP.md` - Requirements analysis
- `docs/DELIVERABLES_SOP_INTEGRATION.md` - Features delivered summary
- `docs/SUMMARY_SOP_INTEGRATION_COMPLETE.md` - Executive summary

---

## 10. Next Phase Features (Roadmap)

Fitur-fitur ini sudah **dipersiapkan di database** tapi belum di-expose ke API. Akan diimplementasikan di fase berikutnya:

### Phase 2: SOP Compliance Tracking (Ready to implement)
- **Backend Ready**: `sopComplianceService.js` sudah dibuat
- **Database Ready**: Tabel `sop_compliance_log` sudah ada
- **Feature**:
  - Auto-log compliance saat surveyor submit hasil
  - Rule: Jika mandatory items < 100%, max compliance rate = 70%
  - Return compliance_rate di response
- **Effort**: 2-3 jam (tinggal integrate service ke endpoint)

### Phase 3: SOP Versioning Management (Database ready)
- **Database Ready**: Tabel `sop_version_history`, trigger auto-deprecation
- **Feature**:
  - API untuk create/update SOP
  - Approval workflow (draft  active)
  - Version diff viewer
  - Auto-deprecation old versions saat new version activated
- **Effort**: 1-2 minggu (UI + API layer)

### Phase 4: SOP Analytics Dashboard
- **Database Ready**: View `v_sop_compliance_summary`
- **Feature**:
  - Overall compliance rate by SOP
  - Compliance rate by surveyor
  - Most frequently missed mandatory items
  - Average completion time vs estimated time
  - Heatmap: blok dengan low compliance
  - Trend analysis over time
- **Effort**: 1-2 minggu

### Phase 5: Dynamic Form Builder (Advanced)
- **Database Ready**: JSONB structure supports flexible schema
- **Feature**:
  - Visual editor untuk SOP checklist creation
  - Drag-and-drop checklist items
  - Conditional logic (show item X if Y = value)
  - Custom validation rules
  - Photo capture configuration
- **Effort**: 3-4 minggu

---

## Changelog

### v1.3 (14 Nov 2025) - SOP Integration 

**Added**:
-  `sop_reference` field at SPK level (SOP code, version, name)
-  `tree_location` shortcut field at tugas level (divisi, blok, baris, pokok)
-  `locations[]` breakdown in summary (auto-grouped by blok)
-  Enhanced checklist with metadata:
  - `is_mandatory` (boolean) - Item wajib atau tidak
  - `photo_required` (boolean) - Perlu foto atau tidak
  - `guidance` (string) - Panduan detail untuk surveyor
  - `estimated_time_mins` (number) - Estimasi waktu pengerjaan
-  `sop_reference` in target_json with totals (mandatory_photos, estimated_time_mins)

**Database**:
-  Created `sop_master` table with versioning support
-  Created `sop_compliance_log` table for tracking
-  Created `sop_version_history` table for audit trail
-  Added `id_sop`, `sop_version_used` columns to `spk_header`
-  Created views and triggers for SOP management

**Backward Compatibility**:
-  All new fields optional
-  Old response structure preserved
-  Fallback to hardcoded checklist if SOP not found
-  No breaking changes

### v1.2 (Previous)
- Basic SPK creation with hardcoded checklist (6 items)
- Location info only in `task_description` string
- No SOP integration
- No metadata on checklist items

---

##  Summary

**Key Benefits for Frontend**:
1.  **Easier location display** - No parsing needed
2.  **Automatic grouping** - Backend provides location breakdown
3.  **Rich metadata** - Better UX with guidance, time estimates
4.  **SOP versioning** - Future-proof for evolving procedures
5.  **Backward compatible** - Deploy without breaking existing code

**Implementation Priority**:
1. **Must Have**: Tree location display (user request utama)
2. **Should Have**: SOP badge, location breakdown
3. **Nice to Have**: Enhanced checklist metadata, guidance tooltips

**Estimated Integration Time**:
- **Minimal (Priority 1 only)**: 1-2 days
- **Standard (Priority 1-2)**: 3-5 days
- **Full (All priorities)**: 1-2 weeks

---

** Happy Coding!**  

Untuk pertanyaan lebih lanjut, silakan hubungi tim backend atau baca `QUICK_REFERENCE_SOP.md` untuk ringkasan cepat.

**Last Updated**: 14 November 2025  
**Version**: v1.3  
**Backend Status**:  Production Ready
