#  Quick Reference - SOP Integration v1.3

**1-page cheat sheet untuk Frontend Dashboard (Platform B - Web)**

>  **Target**: Dashboard Web menggunakan React/Vue/TypeScript  
>  **Untuk Mobile App**: Lihat Section 4 di FRONTEND_SOP_INTEGRATION_GUIDE.md

---

##  New Fields Summary

| Field Location | Field Name | Type | Description |
|---------------|-----------|------|-------------|
| `spk.sop_reference` | Object | SOPReference | Info SOP yang digunakan (code, version, name) |
| `tugas[].tree_location` | Object | TreeLocation | Shortcut lokasi pohon (divisi, blok, baris, pokok) |
| `summary.locations[]` | Array | LocationBreakdown | Grouping pohon per blok dengan tree count |
| `target_json.validation_checklist[].is_mandatory` | Boolean | - | Item wajib atau tidak |
| `target_json.validation_checklist[].photo_required` | Boolean | - | Perlu foto atau tidak |
| `target_json.validation_checklist[].guidance` | String | - | Panduan untuk surveyor |
| `target_json.validation_checklist[].estimated_time_mins` | Number | - | Estimasi waktu pengerjaan |

---

##  5-Minute Quick Start

### TypeScript Interface

```typescript
interface SPKResponse {
  success: boolean;
  data: {
    spk: {
      id_spk: string;
      no_spk: string;
      sop_reference?: {
        sop_code: string;      // "SOP-VAL-001"
        sop_version: string;   // "v1.0"
        sop_name: string;
      };
    };
    tugas: {
      id_tugas: string;
      tree_location?: {
        divisi: string;
        blok_detail: string;
        n_baris: number;
        n_pokok: number;
      };
      target_json: {
        validation_checklist: {
          id: number;
          item: string;
          is_mandatory: boolean;
          photo_required: boolean;
          guidance: string;
          estimated_time_mins: number;
        }[];
      };
    }[];
    summary: {
      total_trees: number;
      locations: {
        divisi: string;
        blok_detail: string;
        tree_count: number;
        trees: { n_baris: number; n_pokok: number; id_tugas: string }[];
      }[];
    };
  };
}
```

### React/Vue Code Snippet

```tsx
// Display SOP Badge
{spk.sop_reference && (
  <span className="badge">
     {spk.sop_reference.sop_code} {spk.sop_reference.sop_version}
  </span>
)}

// Display Tree Location (easy way)
{tugas.tree_location && (
  <div>Blok {tugas.tree_location.blok_detail}, Baris {tugas.tree_location.n_baris}, Pokok {tugas.tree_location.n_pokok}</div>
)}

// Display Location Breakdown
{summary.locations.map(loc => (
  <div key={loc.blok_detail}>
    <strong>{loc.divisi} - Blok {loc.blok_detail}</strong>
    <span>{loc.tree_count} pohon</span>
  </div>
))}

// Display Enhanced Checklist
{checklist.map(item => (
  <div key={item.id}>
    {item.is_mandatory && <span className="badge-danger"> Wajib</span>}
    <label>{item.item}</label>
    {item.photo_required && <span></span>}
    <small>{item.guidance}</small>
    <small> ~{item.estimated_time_mins} min</small>
  </div>
))}
```

### Flutter/Dart Code Snippet

```dart
// Parse tree location
class TreeLocation {
  final String divisi;
  final String blokDetail;
  final int nBaris;
  final int nPokok;
  
  TreeLocation.fromJson(Map<String, dynamic> json)
      : divisi = json['divisi'],
        blokDetail = json['blok_detail'],
        nBaris = json['n_baris'],
        nPokok = json['n_pokok'];
  
  String get displayName => 'Blok $blokDetail, Baris $nBaris, Pokok $nPokok';
}

// Display in UI
if (task.treeLocation != null)
  Chip(
    avatar: Icon(Icons.location_on),
    label: Text(task.treeLocation!.displayName),
  )

// Display checklist with metadata
ListTile(
  leading: Checkbox(value: item.completed),
  title: Row(
    children: [
      Text(item.item),
      if (item.isMandatory) Chip(label: Text('WAJIB')),
    ],
  ),
  subtitle: Column(
    children: [
      if (item.guidance != null) Text(item.guidance!),
      Row(children: [
        if (item.photoRequired) Icon(Icons.camera_alt),
        Icon(Icons.timer),
        Text('~${item.estimatedTimeMins} menit'),
      ]),
    ],
  ),
)
```

---

##  Test Endpoints

**Test API**: `POST http://localhost:3000/api/v1/spk/validasi-drone`

**Sample Request**:
```json
{
  "created_by": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10",
  "assigned_to": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "trees": [
    "24ad6423-f07c-4496-994d-856a79ec619a",
    "d92b8a49-9863-45bd-a883-7e5b713ad455"
  ],
  "priority": "HIGH",
  "deadline": "2025-11-25"
}
```

**Expected Response**:
-  `spk.sop_reference` = SOP-VAL-001 v1.0
-  `tugas[0].tree_location` = { divisi: "AME II", blok_detail: "D001A", n_baris: 1, n_pokok: 1 }
-  `summary.locations` = [ { blok_detail: "D001A", tree_count: 2, ... } ]
-  `validation_checklist[0].is_mandatory` = true
-  `validation_checklist[0].photo_required` = true

---

##  Important Notes

### Backward Compatibility
-  Semua field baru **optional**
-  Field lama tetap ada
-  Code lama tetap jalan

### Fallback Strategy
```typescript
// Always use fallback for optional fields
const location = task.tree_location || task.target_json.tree_location;
const sopCode = spk.sop_reference?.sop_code || 'N/A';
```

### Mandatory vs Optional Items
- `is_mandatory: true`  Item wajib dikerjakan
- `is_mandatory: false`  Item optional
- **Rule**: Jika mandatory items < 100%, compliance rate max 70%

---

##  UI Recommendations

### Priority 1 (Must Have)
1. Display `tree_location` di task card
2. Display SOP badge di SPK header (jika ada)
3. Show mandatory indicator () di checklist

### Priority 2 (Should Have)
1. Display `summary.locations` untuk grouping per blok
2. Show photo required indicator () di checklist
3. Show time estimate per checklist item

### Priority 3 (Nice to Have)
1. Display `guidance` text di popover/tooltip
2. Progress tracker dengan mandatory items tracking
3. Compliance rate calculator

---

##  Test Verification Checklist

Sebelum deploy ke production, pastikan:

- [ ] SOP badge muncul di SPK header (jika `sop_reference` ada)
- [ ] Tree location display mudah dibaca: "Blok D001A, Baris 1, Pokok 5"
- [ ] Location breakdown per blok ditampilkan dengan benar
- [ ] Checklist item menampilkan mandatory indicator
- [ ] Checklist item menampilkan photo required indicator
- [ ] Guidance text accessible (tooltip/popover)
- [ ] Time estimate visible per item
- [ ] Backward compatible: code tetap jalan jika field baru tidak ada

---

##  Support

**Full Documentation**: `docs/FRONTEND_SOP_INTEGRATION_GUIDE.md`  
**Sample Response**: `docs/SAMPLE_RESPONSE_SPK_WITH_SOP.json`  
**Backend Developer**: Mastoro Shadiq

---

##  Related Files

- `sql/migration_001_sop_integration.sql` - Database schema
- `sql/seed_001_sop_initial_data.sql` - Initial SOP data
- `services/spkValidasiDroneService.js` - Backend service (enhanced)
- `services/sopComplianceService.js` - Compliance tracking
- `docs/IMPLEMENTATION_GUIDE_SOP_INTEGRATION.md` - Backend implementation guide

---

**Last Updated**: 14 November 2025  
**Version**: v1.3

