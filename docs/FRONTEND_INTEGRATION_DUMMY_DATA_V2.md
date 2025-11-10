# PANDUAN INTEGRASI FRONTEND - DUMMY DATA V2.0

**Tanggal**: 10 November 2025  
**Untuk**: Tim Frontend Flutter  
**Status**: ✅ Ready for Integration  
**Backend Commit**: `3455346`

---

## 📋 RINGKASAN PERUBAHAN

Backend telah menambahkan **data dummy komprehensif** untuk mendukung **Interactive Drill-Down Dashboard** tanpa mengubah struktur tabel (no new tables, no JSONB). Semua data sudah tersedia via API endpoints existing.

---

## 🎯 ENDPOINT YANG SUDAH ENHANCED

### 1. **GET /api/v1/dashboard/kpi-eksekutif**

**Perubahan**: Tambahan 2 field baru untuk drill-down

#### Field Baru:

**A. `sop_compliance_breakdown`** (Object)
- **Deskripsi**: Breakdown detail kepatuhan SOP yang bisa di-drill-down
- **Struktur**:
  - `compliant_items[]` - Array items yang compliant (7 items)
  - `non_compliant_items[]` - Array items yang non-compliant (5 items)  
  - `partially_compliant_items[]` - Array items yang partially compliant (2 items)
- **Data per Item**:
  - `name` (String) - Nama SOP item
  - `score` (Number) - Score kepatuhan 0-100
  - `reason` (String) - Alasan untuk non-compliant items
- **Use Case**: Tampilkan di dialog saat user tap gauge "Kepatuhan SOP"

**B. `tren_kepatuhan_sop`** (Array)
- **Deskripsi**: Historis trend kepatuhan SOP 8 minggu terakhir
- **Struktur**: Array of objects dengan 8 data points
- **Data per Week**:
  - `periode` (String) - Label "Week 1", "Week 2", dst
  - `nilai` (Number) - Persentase kepatuhan
  - `tanggal` (Date) - Tanggal snapshot
- **Pattern Data**: Trend naik dari 72.5% (Week 1) → 81.4% (Week 8)
- **Use Case**: Chart line/area untuk visualisasi trend

#### Backward Compatibility:
- ✅ Semua field lama tetap ada
- ✅ Response structure tidak berubah
- ✅ Hanya **tambahan** field baru

---

### 2. **GET /api/v1/dashboard/operasional**

**Perubahan**: Tambahan 6 field baru untuk drill-down tasks & blockers

#### Field Baru di `data_corong`:

**A. Planning Tasks (3 fields)**
- `validasi_tasks[]` - Array tasks kategori Validasi (6 tasks)
- `aph_tasks[]` - Array tasks kategori APH (5 tasks)
- `sanitasi_tasks[]` - Array tasks kategori Sanitasi (5 tasks)

**Data per Task**:
- `name` (String) - Nama task
- `status` (String) - "Done", "In Progress", atau "Pending"
- `pic` (String) - Person In Charge
- `deadline` (Date) - Target selesai
- `priority` (String) - "high", "medium", atau "low"

**Use Case**: List tasks di dialog saat user tap gauge kategori planning

**B. Blockers Detail (3 fields)**
- `validasi_blockers_detail[]` - Array blockers kategori Validasi (3 items)
- `aph_blockers_detail[]` - Array blockers kategori APH (3 items)
- `sanitasi_blockers_detail[]` - Array blockers kategori Sanitasi (3 items)

**Data per Blocker**:
- `description` (String) - Detail hambatan
- `severity` (String) - "HIGH", "MEDIUM", atau "LOW"
- `status` (String) - "OPEN" atau "RESOLVED"
- `since` (Date) - Tanggal mulai blocker

**Use Case**: List blockers dengan severity indicator di dialog planning

#### Backward Compatibility:
- ✅ Semua field lama (`target_validasi`, `validasi_selesai`, dll) tetap ada
- ✅ Field calculated blockers lama (`blockers_validasi[]`) tetap berfungsi
- ✅ Hanya **tambahan** field detail baru

---

## 🔌 IMPLEMENTASI DI FRONTEND

### Step 1: Update Model/DTO (Jika Ada)

**Action**: Tambahkan field baru ke data model
- Jangan hapus field lama
- Tambahkan field optional untuk backward compatibility
- Handle null/empty array dengan graceful degradation

### Step 2: Update API Service Call

**Action**: Tidak perlu ubah apapun
- Endpoint URL sama
- Method sama (GET)
- Header sama (Authorization Bearer token)
- Response akan otomatis include field baru

### Step 3: Konsumsi Data Baru di UI

**Untuk SOP Compliance Breakdown**:
1. Parse `response.data.sop_compliance_breakdown`
2. Loop `compliant_items[]` untuk tampilkan list hijau
3. Loop `non_compliant_items[]` untuk tampilkan list merah dengan reason
4. Loop `partially_compliant_items[]` untuk tampilkan list kuning
5. Tampilkan score dengan format persentase

**Untuk Tren Kepatuhan SOP**:
1. Parse `response.data.tren_kepatuhan_sop[]`
2. Extract array `nilai` untuk Y-axis chart
3. Extract array `periode` untuk X-axis labels
4. Render LineChart atau AreaChart dengan 8 data points

**Untuk Planning Tasks**:
1. Parse `response.data.data_corong.validasi_tasks[]` (atau aph/sanitasi)
2. Group by status: "Done", "In Progress", "Pending"
3. Render dengan icon/color sesuai status
4. Tampilkan PIC dan deadline
5. Sort by priority: HIGH → MEDIUM → LOW

**Untuk Blockers Detail**:
1. Parse `response.data.data_corong.validasi_blockers_detail[]`
2. Sort by severity: HIGH → MEDIUM → LOW
3. Render dengan color indicator:
   - HIGH: Red
   - MEDIUM: Orange  
   - LOW: Yellow
4. Tampilkan description dan since date

---

## ✅ VERIFICATION CHECKLIST

Sebelum deploy ke production, pastikan:

### Testing API Response:
- [ ] Hit endpoint `/api/v1/dashboard/kpi-eksekutif` berhasil (200 OK)
- [ ] Field `sop_compliance_breakdown` ada di response
- [ ] Field `tren_kepatuhan_sop` berisi 8 data points
- [ ] Hit endpoint `/api/v1/dashboard/operasional` berhasil (200 OK)
- [ ] Field `validasi_tasks`, `aph_tasks`, `sanitasi_tasks` ada di response
- [ ] Field `validasi_blockers_detail`, etc ada di response

### Testing UI Components:
- [ ] Dialog SOP Compliance Detail menampilkan breakdown items
- [ ] Chart trend menampilkan 8 minggu data
- [ ] Dialog Planning Detail menampilkan tasks dengan status
- [ ] Dialog Planning Detail menampilkan blockers dengan severity
- [ ] Semua data tidak null/error
- [ ] Loading state berfungsi dengan baik

### Edge Cases:
- [ ] Handle ketika array kosong (fallback UI)
- [ ] Handle ketika field null (gunakan default value)
- [ ] Handle error response dari API
- [ ] Handle timeout/network error

---

## 📊 DATA YANG TERSEDIA

### SOP Compliance Items: **14 total**
- 7 Compliant (score 87.5% - 96.5%)
- 5 Non-Compliant (score 45% - 72%)
- 2 Partially Compliant (score 75% - 78%)

### Historical Trend: **8 weeks**
- Pattern: Upward trend dengan fluktuasi minor
- Range: 71.2% - 81.4%

### Planning Tasks: **16 total**
- Validasi: 6 tasks (2 Done, 1 In Progress, 3 Pending)
- APH: 5 tasks (1 Done, 2 In Progress, 2 Pending)
- Sanitasi: 5 tasks (0 Done, 1 In Progress, 4 Pending)

### Blockers: **9 total**
- Validasi: 3 blockers (2 HIGH, 1 MEDIUM)
- APH: 3 blockers (1 HIGH, 1 MEDIUM, 1 LOW)
- Sanitasi: 3 blockers (2 HIGH, 1 MEDIUM)

---

## 🚨 CATATAN PENTING

### Jangan Hardcode Data di Frontend
- ❌ JANGAN gunakan dummy data hardcoded lagi
- ✅ SEMUA data harus dari API response
- ✅ Backend sudah inject 63 records ke database

### Maintain Backward Compatibility
- ✅ Field lama tetap digunakan untuk existing features
- ✅ Field baru optional untuk enhancement features
- ✅ App tidak crash jika field baru null

### Performance Consideration
- Response size bertambah ~2-3 KB per endpoint
- Masih sangat acceptable untuk mobile app
- Gunakan loading indicator saat fetch data

---

## 🐛 TROUBLESHOOTING

### "Field baru tidak muncul di response"
**Solusi**: 
- Pastikan backend sudah updated (commit `3455346`)
- Pastikan SQL script sudah di-execute di database
- Clear app cache dan re-fetch data

### "Array kosong untuk tasks/blockers"
**Solusi**:
- Cek apakah SQL script sudah berhasil insert data
- Verify dengan query manual di Supabase
- Pastikan filter kategori benar (VALIDASI vs VALIDASI_DRONE)

### "Score atau nilai aneh/tidak realistis"
**Expected**:
- SOP score: 0-100 (decimal)
- Trend percentage: 70-85% range
- Ini adalah dummy data untuk testing, bukan data production

---

## 📞 KOORDINASI

### Jika Ada Issue:
1. Cek response API di browser/Postman dulu
2. Screenshot response dan error message
3. Inform backend team via channel koordinasi
4. Jangan modify hardcoded data tanpa koordinasi

### Timeline Integration:
- **Phase 1**: Update model & parse response (1 jam)
- **Phase 2**: Implement drill-down dialogs (2-3 jam)
- **Phase 3**: Testing & refinement (1 jam)
- **Total**: ~4-5 jam development time

---

## ✨ EXPECTED RESULT

Setelah integrasi selesai:
- ✅ User dapat tap gauge "Kepatuhan SOP" → Muncul dialog dengan breakdown detail
- ✅ User dapat lihat chart trend 8 minggu (bukan cuma 1 minggu)
- ✅ User dapat tap gauge "Validasi/APH/Sanitasi" → Muncul dialog dengan tasks & blockers
- ✅ Data real dari database (bukan hardcoded)
- ✅ Dashboard lebih interaktif dan informatif

---

**Status**: ✅ Backend Ready - Waiting for Frontend Integration  
**Next Action**: Frontend team implement drill-down dialogs dengan data dari API  
**Support**: Available untuk koordinasi dan troubleshooting  

---

_Dokumen ini adalah panduan high-level. Untuk detail teknis implementasi, refer ke response structure actual dari API._
