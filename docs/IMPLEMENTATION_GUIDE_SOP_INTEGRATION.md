# Implementation Guide - SOP Integration

## Overview
Option D: Hybrid System dengan SOP versioning, SPK-SOP link, dynamic checklist, dan compliance tracking.

## Files Created
1. sql/migration_001_sop_integration.sql - Schema
2. sql/seed_001_sop_initial_data.sql - Initial data
3. services/sopComplianceService.js - Compliance service

## Database Schema
- sop_master: Master SOP dengan versioning
- sop_compliance_log: Compliance tracking
- sop_version_history: Audit trail
- spk_header: Added id_sop, sop_version_used columns

## Backend Changes Needed
File: services/spkValidasiDroneService.js

Add after line 95 (after stress level calculation):
```javascript
const { data: sopData } = await supabase
  .from('sop_master')
  .select('*')
  .eq('jenis_kegiatan', 'VALIDASI_DRONE_NDRE')
  .eq('is_active', true)
  .single();
```

Modify SPK header creation (line ~110):
```javascript
const spkData = {
  // ... existing fields
  id_sop: sopData?.id_sop || null,
  sop_version_used: sopData?.sop_version || null,
};
```

Modify task target_json (line ~170):
```javascript
validation_checklist: sopData?.checklist_items || defaultChecklist,
sop_reference: sopData ? {
  id_sop: sopData.id_sop,
  sop_code: sopData.sop_code,
  sop_version: sopData.sop_version,
} : null,
```

Add before module.exports:
```javascript
function getLocationBreakdown(tasks) {
  const locationMap = {};
  tasks.forEach(task => {
    const loc = task.target_json?.tree_location;
    if (!loc) return;
    const key = loc.blok_detail;
    if (!locationMap[key]) {
      locationMap[key] = { blok_detail: key, divisi: loc.divisi, trees: [] };
    }
    locationMap[key].trees.push({
      tree_id: task.target_json.tree_id,
      baris: loc.n_baris,
      pokok: loc.n_pokok,
      ndre_classification: task.target_json.drone_data?.ndre_classification
    });
  });
  return Object.values(locationMap);
}
```

Modify return statement (line ~220):
```javascript
return {
  spk: { ... },
  tugas: tugasData.map(t => ({
    ...t,
    tree_location: t.target_json?.tree_location || null,
  })),
  summary: {
    // ... existing fields
    locations: getLocationBreakdown(tugasData),
  },
};
```

## Testing
1. Create SPK  Check sop_reference present
2. Check tree_location.n_baris, n_pokok present
3. Check summary.locations array present

## Next Steps
- Modify POST /log_aktivitas for compliance logging
- Create SOP management endpoints
- Platform A integration
