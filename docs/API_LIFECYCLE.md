# API LIFECYCLE - MULTI-PHASE OPERATIONS

## Overview
Backend service untuk lifecycle management kelapa sawit dari Pembibitan sampai Replanting (5 phases).

**Created:** November 11, 2025  
**Phase:** 2 - Multi-Phase Lifecycle Data  
**Status:** ✅ Implemented & Tested

---

## Endpoints

### 1. GET /api/v1/lifecycle/overview

**Description:** Get summary across all 5 lifecycle phases

**Response:**
```json
{
  "phases": [
    {
      "nama_fase": "Pembibitan",
      "umur_range": "0-1 tahun",
      "total_spks": 2,
      "total_executions": 4,
      "spks_selesai": 2,
      "completion_rate": 100
    },
    ...
  ],
  "summary": {
    "total_phases": 5,
    "total_spks_all": 11,
    "total_executions_all": 22,
    "avg_completion": 80
  },
  "health_index": 76
}
```

**Test Result (Nov 11, 2025):**
- ✅ 11 SPKs total
- ✅ 22 Executions total
- ✅ 80% average completion
- ✅ Health index: 76

---

### 2. GET /api/v1/lifecycle/phase/:phase_name

**Description:** Get detailed metrics for specific phase

**Parameters:**
- `phase_name` (path): Pembibitan, TBM, TM, Pemanenan, Replanting

**Example:** `GET /api/v1/lifecycle/phase/Pembibitan`

**Response:**
```json
{
  "phase_info": {
    "nama_fase": "Pembibitan",
    "umur_mulai": 0,
    "umur_selesai": 1,
    "deskripsi": "Fase pembibitan dan perawatan bibit..."
  },
  "summary": {
    "total_sub_activities": 1,
    "total_schedules": 1,
    "total_spks": 2,
    "total_executions": 4,
    "spks_selesai": 2,
    "completion_rate": 100
  },
  "by_spk": [
    {
      "nomor_spk": "SPK/PEMBIBITAN/2025/001",
      "status": "SELESAI",
      "tanggal_terbit": "2025-01-15",
      "tanggal_mulai": "2025-01-20",
      "tanggal_selesai": "2025-02-20",
      "lokasi": "Nursery Blok A",
      "mandor": "Budi Santoso",
      "uraian_pekerjaan": "Perawatan bibit kelapa sawit...",
      "sub_activity": "Perawatan Bibit",
      "execution_count": 2,
      "executions": [
        {
          "tanggal": "2025-01-22",
          "hasil": "2500 bibit dipupuk, kondisi baik",
          "petugas": "Tim Pembibitan A"
        },
        ...
      ]
    },
    ...
  ],
  "weekly_breakdown": [
    {
      "week": "2025-W3",
      "spk_count": 1,
      "execution_count": 1
    },
    ...
  ]
}
```

**Test Result (Pembibitan):**
- ✅ 2 SPKs
- ✅ 4 Executions
- ✅ 100% completion rate
- ✅ Weekly breakdown: 4 weeks

---

### 3. GET /api/v1/lifecycle/sop-compliance

**Description:** Get SOP compliance metrics by phase

**Response:**
```json
{
  "by_phase": [
    {
      "nama_fase": "TBM",
      "sop_count": 3,
      "spk_count": 3,
      "compliance_ratio": 1,
      "status": "COMPLIANT"
    },
    {
      "nama_fase": "Pembibitan",
      "sop_count": 3,
      "spk_count": 2,
      "compliance_ratio": 0.67,
      "status": "NEEDS_ATTENTION"
    },
    ...
  ],
  "overall_compliance": 50,
  "non_compliant_phases": [
    {
      "nama_fase": "Pembibitan",
      "issue": "Low SPK/SOP ratio (0.67). Expected >= 0.8"
    },
    ...
  ]
}
```

**Test Result:**
- ✅ Overall compliance: 50%
- ✅ Compliant phases: TBM, TM
- ✅ Needs attention: Pembibitan, Panen, Replanting

---

## Database Schema Used

### Tables
1. **ops_fase_besar** - Lifecycle phases (5 phases)
2. **ops_sub_tindakan** - Sub-activities per phase
3. **ops_jadwal_tindakan** - Activity schedules
4. **ops_spk_tindakan** - Work orders (SPK)
5. **ops_eksekusi_tindakan** - Execution logs
6. **sop_tipe** - SOP types
7. **sop_referensi** - SOP references

### Relationships
```
ops_fase_besar (1) --< (many) ops_sub_tindakan
ops_sub_tindakan (1) --< (many) ops_jadwal_tindakan
ops_jadwal_tindakan (1) --< (many) ops_spk_tindakan
ops_spk_tindakan (1) --< (many) ops_eksekusi_tindakan

sop_tipe (1) --< (many) sop_referensi
```

---

## Service Functions

### File: `services/lifecycleService.js`

**Functions:**
1. `getPhaseMetrics(phase_name)` - Get metrics for specific phase
2. `getLifecycleOverview()` - Get overview across all phases
3. `getSOPComplianceByPhase()` - Get SOP compliance metrics

**Helper:**
- `getWeekNumber(date)` - Calculate ISO week number

---

## Testing

### Direct Test (Bypass HTTP)
```bash
node test-lifecycle-direct.js
```

**Test Coverage:**
- ✅ getLifecycleOverview() - All phases summary
- ✅ getPhaseMetrics("Pembibitan") - Specific phase detail
- ✅ getSOPComplianceByPhase() - SOP compliance check

**Test Results (Nov 11, 2025):**
```
✅ ALL TESTS PASSED

Summary:
  - Total Phases: 5
  - Total SPKs: 11
  - Total Executions: 22
  - Avg Completion: 80%
  - Health Index: 76

Phases:
  • Pembibitan: 2 SPKs, 4 exec, 100% complete
  • TBM: 3 SPKs, 6 exec, 100% complete
  • Pemanenan: 4 SPKs, 8 exec, 100% complete
  • TM: 2 SPKs, 4 exec, 100% complete
  • Replanting: 0 SPKs, 0 exec, 0% complete

SOP Compliance:
  • TBM: COMPLIANT (ratio 1.0)
  • TM: COMPLIANT (ratio 1.0)
  • Pembibitan: NEEDS_ATTENTION (ratio 0.67)
  • Panen: NEEDS_ATTENTION (ratio 0)
  • Replanting: NEEDS_ATTENTION (ratio 0)
```

---

## Implementation Notes

### Data Validation ✅
- All UUID types verified against schema
- All column names match actual Supabase schema
- All table structures validated
- Foreign key relationships preserved

### Query Optimization
- Minimal column selection for performance
- JOIN optimization with `.select()` syntax
- Data aggregation in JavaScript (after fetch)
- Weekly breakdown calculation using ISO week numbers

### Error Handling
- Try-catch blocks in all async functions
- Null checks for missing data
- Graceful degradation (empty arrays instead of errors)
- Console logging for debugging

### Business Logic
- **Health Index:** Weighted average of completion rate (70%) and execution density (30%)
- **Compliance Ratio:** SPK count / SOP count (threshold: 0.8)
- **Completion Rate:** (Completed SPKs / Total SPKs) × 100%

---

## Next Steps (Future Enhancement)

1. **Dashboard Integration:**
   - Add lifecycle overview widget to operasionalService.js
   - Add phase selector component in frontend
   - Add SOP compliance alerts

2. **Authentication:**
   - Add JWT middleware to lifecycle routes
   - Implement RBAC for lifecycle endpoints
   - Add role-based data filtering

3. **Analytics:**
   - Add trend analysis (month-over-month growth)
   - Add productivity metrics per phase
   - Add cost analysis per phase

4. **Frontend Integration:**
   - Create lifecycle dashboard component
   - Add phase detail view
   - Add SOP compliance charts

---

## Version History

**v1.0.0 - November 11, 2025**
- ✅ Initial implementation
- ✅ 3 endpoints created
- ✅ 3 service functions implemented
- ✅ Direct testing passed
- ✅ Documentation completed

---

## Author
Backend Team - Sistem Saraf Digital Kebun  
Phase 2: Multi-Phase Lifecycle Data
