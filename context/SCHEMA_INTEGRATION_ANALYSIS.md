# ANALISIS INTEGRASI SCHEMA: Existing vs New Tables

**Tanggal**: 10 November 2025  
**Konteks**: Tim developer sudah create new schema di Supabase  
**Tujuan**: Integration plan untuk maximize value dari schema baru  
**Status**: 🔴 CRITICAL - Must align sebelum implement Phase 1

---

## 📋 EXECUTIVE SUMMARY

Tim developer sudah membuat **10 tabel baru** di Supabase yang **PERFECTLY ALIGN** dengan konsep Tahap 3 & 4:

### Schema SOP (4 tables):
1. ✅ `sop_tipe` → Master kategori SOP (TS01-TS08)
2. ✅ `sop_tipe_versi` → Version control untuk kategori SOP
3. ✅ `sop_referensi` → Detail SOP (GAP-ISPO-XXX)
4. ✅ `sop_referensi_versi` → Version control untuk detail SOP

### Schema OPS (6 tables):
1. ✅ `ops_fase_besar` → Fase tindakan (Validasi, APH, Sanitasi, Panen)
2. ✅ `ops_sub_tindakan` → Sub-tindakan detail per fase
3. ✅ `ops_jadwal_tindakan` → Planning schedule
4. ✅ `ops_eksekusi_tindakan` → Realisasi lapangan
5. ✅ `ops_spk_tindakan` → SPK yang link ke jadwal tindakan
6. ⚠️ (Reference to `id_tanaman` - table belum ada di schema)

**IMPLIKASI KRUSIAL:**
- 🔴 **Current dashboard menggunakan**: `spk_header`, `spk_tugas`, `master_pihak` (old schema)
- 🟢 **Tim sudah siapkan**: `ops_*`, `sop_*` tables (new schema)
- 🟡 **Challenge**: Bridge 2 schema tanpa breaking existing functionality

---

## 🔍 PART 1: DETAILED SCHEMA ANALYSIS

### A. SOP SCHEMA (sop_schema_supabase.txt)

#### **1. sop_tipe** (Master SOP Categories)

```sql
CREATE TABLE public.sop_tipe (
    id_tipe_sop uuid DEFAULT uuid_generate_v4() NOT NULL,
    nama_tipe_sop varchar(100) NOT NULL,
    deskripsi text NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz NULL,
    CONSTRAINT plant_pk_sop_tipe PRIMARY KEY (id_tipe_sop)
);
```

**Mapping to Tahap 4 Document:**
| Field Supabase | Field Tahap 4 | Notes |
|----------------|---------------|-------|
| id_tipe_sop (uuid) | ID_TipeSOP (VARCHAR) | ✅ Better: UUID > VARCHAR |
| nama_tipe_sop | Nama_TipeSOP | ✅ Perfect match |
| deskripsi | Deskripsi | ✅ Perfect match |
| created_at/updated_at | - | ✅ Extra: Audit trail |

**Example Data (Should be inserted):**
```sql
INSERT INTO sop_tipe (nama_tipe_sop, deskripsi) VALUES
  ('SOP Pembukaan & Persiapan Lahan', 'Land clearing, survei, pemetaan'),
  ('SOP Pembibitan', 'Nursery management, seleksi bibit'),
  ('SOP Penanaman', 'Penanaman bibit di lapangan'),
  ('SOP Pemeliharaan Tanaman', 'Pemupukan, penyulaman, gulma, pruning'),
  ('SOP Panen', 'Kriteria matang, rotasi, pengangkutan TBS'),
  ('SOP Pascapanen & Logistik', 'Transportasi ke PKS, handling'),
  ('SOP Administrasi & Keuangan', 'Pencatatan, absensi, pelaporan'),
  ('SOP Audit & Monitoring', 'Audit internal, compliance ISPO/RSPO');
```

**Current Status Dashboard:**
- ❌ Dashboard belum query dari `sop_tipe`
- ❌ Current SOP compliance di `master_pihak` tidak link ke `sop_tipe`
- 🔴 **ACTION NEEDED**: Migrate SOP data atau bridge kedua table

---

#### **2. sop_referensi** (Detail SOP)

```sql
CREATE TABLE public.sop_referensi (
    id_sop uuid DEFAULT uuid_generate_v4() NOT NULL,
    id_tipe_sop uuid NULL,
    nama_sop varchar(100) NOT NULL,
    deskripsi text NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz NULL,
    CONSTRAINT plant_pk_sop_referensi PRIMARY KEY (id_sop),
    CONSTRAINT fk_sop_referensi_tipe
        FOREIGN KEY(id_tipe_sop)
        REFERENCES public.sop_tipe(id_tipe_sop)
);
```

**Example Data (Should be inserted):**
```sql
-- Assuming id_tipe_sop for 'SOP Panen' = 'xxx-xxx-xxx'
INSERT INTO sop_referensi (id_tipe_sop, nama_sop, deskripsi) VALUES
  ('xxx-xxx-xxx', 'Panen TBS - Kriteria Matang', 'GAP-ISPO-040: Kriteria brondolan, fraksi matang'),
  ('xxx-xxx-xxx', 'Sortasi Buah TBS', 'GAP-ISPO-041: Quality control, reject handling');
```

**Current Status Dashboard:**
- ❌ Dashboard belum aware tentang SOP reference code
- ⚠️ Current dummy data di `master_pihak` pakai field `sop_reason` (text biasa)
- 🔴 **ACTION NEEDED**: Link compliance records ke `sop_referensi`

---

#### **3. sop_tipe_versi** & **sop_referensi_versi** (Version Control)

**Key Fields:**
- `versi` (v1.0, v2.0, etc.)
- `from_date` / `thru_date` (effective period)
- `dok_url` (link to PDF/document)
- `catatan` (revision notes)

**Strategic Value:**
- ✅ Track SOP evolution over time
- ✅ Audit trail: "Which SOP version was enforced when?"
- ✅ Compliance dapat di-validate against correct version

**Current Status Dashboard:**
- ❌ Belum digunakan sama sekali
- 🟢 **FUTURE ENHANCEMENT**: Phase 3 or later

---

### B. OPS SCHEMA (ops_schema_supabase.txt)

#### **1. ops_fase_besar** (Major Phases)

```sql
CREATE TABLE public.ops_fase_besar (
    id_fase_besar uuid DEFAULT uuid_generate_v4() NOT NULL,
    nama_fase varchar(100) NOT NULL,
    umur_mulai int NULL,
    umur_selesai int NULL,
    deskripsi varchar(255) NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz NULL,
    CONSTRAINT plant_pk_fase_besar PRIMARY KEY (id_fase_besar)
);
```

**Example Data (Should be inserted):**
```sql
INSERT INTO ops_fase_besar (nama_fase, umur_mulai, umur_selesai, deskripsi) VALUES
  ('Persiapan Lahan', NULL, NULL, 'Land clearing, drainase, jalur tanam'),
  ('Penanaman Bibit', NULL, NULL, 'Penanaman bibit di lapangan'),
  ('Pemeliharaan TBM', 0, 3, 'Penyulaman, pemupukan, gulma TBM'),
  ('Perawatan TM', 3, 25, 'Pemangkasan, pemupukan produksi, IPM'),
  ('Pemanenan', 3, 25, 'Panen TBS, sortasi, angkut'),
  ('Replanting', 25, NULL, 'Penebangan tua, persiapan ulang');
```

**Mapping to Current Dashboard:**
| Fase Besar | Current Implementation | Status |
|------------|------------------------|--------|
| Pemeliharaan TBM | APH + Sanitasi (partial) | ⚠️ Implicit |
| Perawatan TM | APH + Sanitasi (partial) | ⚠️ Implicit |
| **Pemanenan** | ❌ **MISSING** | 🔴 Critical gap |

**Current Status Dashboard:**
- ❌ Dashboard tidak query dari `ops_fase_besar`
- ⚠️ Fase implicit via `tipe_tugas` di `spk_tugas` (VALIDASI_DRONE, APH, SANITASI)
- 🔴 **ACTION NEEDED**: Bridge atau migrate ke explicit phases

---

#### **2. ops_sub_tindakan** (Sub-Actions per Phase)

```sql
CREATE TABLE public.ops_sub_tindakan (
    id_sub_tindakan uuid DEFAULT uuid_generate_v4() NOT NULL,
    id_fase_besar uuid NULL,
    nama_sub varchar(100) NOT NULL,
    deskripsi varchar(255) NULL,
    ...
    CONSTRAINT fk_sub_tindakan_fase
        FOREIGN KEY(id_fase_besar)
        REFERENCES public.ops_fase_besar(id_fase_besar)
);
```

**Example Data (Critical for Phase 1 - PANEN):**
```sql
-- Assuming id_fase_besar for 'Pemanenan' = 'yyy-yyy-yyy'
INSERT INTO ops_sub_tindakan (id_fase_besar, nama_sub, deskripsi) VALUES
  ('yyy-yyy-yyy', 'Panen TBS Rotasi 1', 'Panen sesuai kriteria matang, rotasi pertama'),
  ('yyy-yyy-yyy', 'Panen TBS Rotasi 2', 'Panen rotasi kedua (7-10 hari kemudian)'),
  ('yyy-yyy-yyy', 'Sortasi Buah', 'Quality control, pisahkan TBS lulus vs reject'),
  ('yyy-yyy-yyy', 'Angkut ke TPH', 'Transportasi TBS ke Tempat Pengumpulan Hasil'),
  ('yyy-yyy-yyy', 'Kirim ke PKS', 'Pengiriman TBS ke Pabrik Kelapa Sawit');
```

**Current Status Dashboard:**
- ❌ Dashboard tidak aware tentang sub-tindakan struktur
- ⚠️ Implicitly covered by `spk_tugas.nama_tugas` (free text)
- 🔴 **ACTION NEEDED**: Standardize via `ops_sub_tindakan`

---

#### **3. ops_jadwal_tindakan** (Planning Schedule)

```sql
CREATE TABLE public.ops_jadwal_tindakan (
    id_jadwal_tindakan uuid DEFAULT uuid_generate_v4() NOT NULL,
    id_tanaman uuid NULL,  -- ⚠️ References table yang belum ada
    id_sub_tindakan uuid NULL,
    frekuensi varchar(50) NOT NULL,  -- "2x/minggu", "Setiap 7 hari"
    interval_hari int NULL,          -- 7, 14, 30, etc.
    tanggal_mulai timestamptz NOT NULL,
    tanggal_selesai date NULL,
    ...
);
```

**Mapping to Current Dashboard:**
| Field OPS | Field Current | Table | Notes |
|-----------|---------------|-------|-------|
| id_jadwal_tindakan | id_spk | spk_header | ⚠️ Conceptually similar |
| id_sub_tindakan | tipe_tugas | spk_tugas | ⚠️ Loose match |
| frekuensi | - | - | ❌ Not tracked currently |
| interval_hari | - | - | ❌ Not tracked currently |
| tanggal_mulai | tanggal_mulai | spk_header | ✅ Match |
| tanggal_selesai | tanggal_target_selesai | spk_header | ✅ Match |

**Challenge:**
- `id_tanaman` → References table yang tidak ada di schema
- Apakah ini per-tree tracking? Or per-block (afdeling)?
- 🟡 **CLARIFICATION NEEDED**: Scope of `id_tanaman`

**Current Status Dashboard:**
- ⚠️ Partially covered by `spk_header` + `spk_tugas`
- ❌ Frekuensi & interval tidak tracked
- 🟡 **DECISION NEEDED**: Migrate to `ops_jadwal_tindakan` or bridge?

---

#### **4. ops_eksekusi_tindakan** (Field Execution)

```sql
CREATE TABLE public.ops_eksekusi_tindakan (
    id_eksekusi_tindakan uuid DEFAULT uuid_generate_v4() NOT NULL,
    id_jadwal_tindakan uuid NULL,
    tanggal_eksekusi date NOT NULL,
    hasil varchar(255) NULL,      -- "15.2 ton TBS", "200 kg NPK"
    petugas varchar(100) NULL,
    catatan varchar(255) NULL,
    ...
);
```

**Mapping to Current Dashboard:**
| Field OPS | Field Current | Table | Notes |
|-----------|---------------|-------|-------|
| tanggal_eksekusi | tanggal_mulai | spk_header | ⚠️ Loose match |
| hasil | - | - | ❌ **MISSING - CRITICAL!** |
| petugas | nama_mandor | spk_header | ⚠️ Partial match |
| catatan | catatan | spk_header | ✅ Match |

**KEY INSIGHT:**
- Field `hasil` is **EXACTLY** what we need for PANEN tracking!
- This is the **OUTPUT** field missing from current schema
- 🔴 **ACTION CRITICAL**: Utilize this for Phase 1

**Current Status Dashboard:**
- ❌ Not used at all
- 🔴 **MUST USE**: This is the MISSING LINK for outcome tracking

---

#### **5. ops_spk_tindakan** (SPK for Actions)

```sql
CREATE TABLE public.ops_spk_tindakan (
    id_spk uuid DEFAULT uuid_generate_v4() NOT NULL,
    id_jadwal_tindakan uuid NULL,
    nomor_spk varchar(100) NOT NULL,
    tanggal_terbit date NOT NULL,
    tanggal_mulai date NOT NULL,
    tanggal_selesai date NULL,
    status varchar(50) DEFAULT 'DRAFT' NOT NULL,
    penanggung_jawab varchar(100) NULL,
    mandor varchar(100) NULL,
    lokasi varchar(255) NULL,
    uraian_pekerjaan varchar(255) NULL,
    catatan varchar(255) NULL,
    ...
);
```

**Comparison with Existing `spk_header`:**

| Field | ops_spk_tindakan | spk_header (existing) | Match? |
|-------|------------------|----------------------|--------|
| ID | id_spk (uuid) | id_spk (uuid) | ✅ Same |
| Nomor | nomor_spk | nama_spk | ⚠️ Different purpose |
| Status | status | id_status (FK) | ⚠️ Different structure |
| PJ | penanggung_jawab | - | ❌ Not in old |
| Mandor | mandor | nama_mandor | ✅ Match |
| Lokasi | lokasi | - | ❌ Not in old |
| Uraian | uraian_pekerjaan | - | ❌ Not in old |

**CRITICAL OBSERVATION:**
- `ops_spk_tindakan` is **MORE COMPLETE** than `spk_header`
- Has proper workflow: DRAFT → APPROVED → IN_PROGRESS → COMPLETED
- Has clear ownership: penanggung_jawab + mandor
- 🔴 **STRATEGIC DECISION NEEDED**: Migrate or coexist?

---

## 🔥 PART 2: GAP ANALYSIS & STRATEGIC IMPLICATIONS

### A. Current Dashboard Data Flow

```
┌─────────────────────────────────────────────────────┐
│ CURRENT SCHEMA (OLD - Production)                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  spk_header (Planning)                             │
│    ├─ id_spk                                       │
│    ├─ nama_spk                                     │
│    ├─ id_status (FK to master_status)             │
│    ├─ tanggal_mulai                               │
│    ├─ tanggal_target_selesai                      │
│    └─ nama_mandor                                 │
│         │                                          │
│         ├─> spk_tugas (Tasks)                     │
│         │     ├─ id_tugas                         │
│         │     ├─ nama_tugas                       │
│         │     ├─ tipe_tugas (VALIDASI_DRONE, APH, SANITASI) │
│         │     └─ status_tugas                     │
│         │                                          │
│         └─> master_pihak (SOP Items - dummy)      │
│               ├─ tipe = 'SOP_ITEM'                │
│               ├─ sop_score                        │
│               └─ sop_category (COMPLIANT/NON)    │
│                                                     │
│  ❌ MISSING: Output/Result tracking                │
│  ❌ MISSING: Panen phase                           │
│  ❌ MISSING: Proper SOP structure                  │
└─────────────────────────────────────────────────────┘
```

### B. New Schema (by Team - Ready in Supabase)

```
┌─────────────────────────────────────────────────────┐
│ NEW SCHEMA (by Development Team)                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ops_fase_besar (Phases)                           │
│    ├─ Pemeliharaan TBM                            │
│    ├─ Perawatan TM                                │
│    └─ Pemanenan ⭐ NEW!                            │
│         │                                          │
│         └─> ops_sub_tindakan (Sub-actions)        │
│               ├─ Panen TBS Rotasi 1               │
│               ├─ Sortasi Buah                     │
│               └─ Angkut ke TPH                    │
│                    │                               │
│                    └─> ops_jadwal_tindakan (Schedule) │
│                          ├─ frekuensi             │
│                          └─ interval_hari         │
│                               │                    │
│                               ├─> ops_eksekusi_tindakan (Actual) │
│                               │     └─ hasil ⭐ OUTPUT FIELD! │
│                               │                    │
│                               └─> ops_spk_tindakan (SPK) │
│                                     └─ More complete than old │
│                                                     │
│  sop_tipe (SOP Categories)                         │
│    ├─ SOP Pemeliharaan                            │
│    ├─ SOP Panen ⭐ NEW!                            │
│    └─ SOP Audit                                   │
│         │                                          │
│         └─> sop_referensi (SOP Details)           │
│               ├─ GAP-ISPO-040 (Panen TBS)         │
│               └─ GAP-ISPO-041 (Sortasi)           │
│                    │                               │
│                    └─> sop_referensi_versi (Version Control) │
│                          └─ Track SOP evolution    │
│                                                     │
│  ✅ HAS: Output tracking (ops_eksekusi_tindakan.hasil) │
│  ✅ HAS: Panen phase (ops_fase_besar + sub)       │
│  ✅ HAS: Proper SOP structure (sop_tipe + ref)    │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 PART 3: INTEGRATION STRATEGY

### OPTION 1: FULL MIGRATION (Ideal but High Risk)

**Approach:**
- Migrate ALL data from old schema → new schema
- Deprecate `spk_header`, `spk_tugas`, `master_pihak` (SOP items)
- Rewrite ALL service functions to query new tables

**Pros:**
- ✅ Clean architecture
- ✅ Follow proper data modeling
- ✅ Leverage all new features (version control, phases, etc.)

**Cons:**
- ❌ HIGH RISK: Breaking changes to production
- ❌ LONG TIMELINE: 1-2 weeks rewrite
- ❌ TESTING OVERHEAD: Regression testing all features
- ❌ FRONTEND IMPACT: May need changes

**Verdict:** ❌ **NOT RECOMMENDED** for immediate Phase 1

---

### OPTION 2: DUAL SCHEMA (Bridge Approach) ⭐ **RECOMMENDED**

**Approach:**
- Keep old schema for existing features (Validasi, APH, Sanitasi)
- Use new schema for NEW features (Panen, advanced SOP)
- Create bridge queries that join both schemas

**Implementation Plan:**

#### **Phase 1A: Use NEW schema for PANEN tracking**

```sql
-- Insert master data ke new tables
INSERT INTO ops_fase_besar (nama_fase, deskripsi) 
VALUES ('Pemanenan', 'Panen TBS, sortasi, angkut');

INSERT INTO ops_sub_tindakan (id_fase_besar, nama_sub) 
VALUES 
  ('<fase_panen_id>', 'Panen TBS Rotasi 1'),
  ('<fase_panen_id>', 'Sortasi Buah TBS');

-- Create planning
INSERT INTO ops_jadwal_tindakan (id_sub_tindakan, frekuensi, interval_hari, tanggal_mulai)
VALUES ('<sub_panen_id>', '2x per minggu', 7, '2025-11-01');

-- Record actual harvest
INSERT INTO ops_eksekusi_tindakan (id_jadwal_tindakan, tanggal_eksekusi, hasil, petugas)
VALUES 
  ('<jadwal_id>', '2025-11-08', '102.5 ton TBS, reject 2.1%', 'Tim Panen 1'),
  ('<jadwal_id>', '2025-11-15', '108.3 ton TBS, reject 1.9%', 'Tim Panen 1');
```

**Service Function:**
```javascript
// NEW FUNCTION in operasionalService.js
async function getPanenMetrics() {
  // Query from NEW schema
  const { data: eksekusi } = await supabase
    .from('ops_eksekusi_tindakan')
    .select(`
      tanggal_eksekusi,
      hasil,
      petugas,
      ops_jadwal_tindakan (
        ops_sub_tindakan (
          nama_sub,
          ops_fase_besar ( nama_fase )
        )
      )
    `)
    .eq('ops_jadwal_tindakan.ops_sub_tindakan.ops_fase_besar.nama_fase', 'Pemanenan')
    .gte('tanggal_eksekusi', startOfMonth)
    .lte('tanggal_eksekusi', endOfMonth);
  
  // Parse hasil field: "102.5 ton TBS, reject 2.1%"
  const panenData = eksekusi.map(row => {
    const [tonStr, rejectStr] = row.hasil.split(', ');
    const ton = parseFloat(tonStr.match(/[\d.]+/)[0]);
    const rejectPersen = parseFloat(rejectStr.match(/[\d.]+/)[0]);
    
    return {
      tanggal: row.tanggal_eksekusi,
      ton_tbs: ton,
      reject_persen: rejectPersen,
      petugas: row.petugas
    };
  });
  
  return {
    total_ton: panenData.reduce((sum, d) => sum + d.ton_tbs, 0),
    avg_reject: panenData.reduce((sum, d) => sum + d.reject_persen, 0) / panenData.length,
    weekly_data: panenData
  };
}
```

**Pros:**
- ✅ LOW RISK: No changes to existing features
- ✅ FAST: Can implement Phase 1 immediately
- ✅ LEVERAGE NEW SCHEMA: Use `ops_eksekusi_tindakan.hasil` for output tracking
- ✅ PROPER STRUCTURE: Use `ops_fase_besar` for Panen phase

**Cons:**
- ⚠️ DUAL MAINTENANCE: Query from 2 schemas
- ⚠️ COMPLEXITY: Service functions need to join both

**Verdict:** ✅ **RECOMMENDED** for Phase 1

---

#### **Phase 1B: Use NEW schema for SOP Category Breakdown**

```sql
-- Insert SOP master data
INSERT INTO sop_tipe (nama_tipe_sop, deskripsi) VALUES
  ('SOP Pemeliharaan Tanaman', 'Pemupukan, penyulaman, gulma, pruning'),
  ('SOP Panen', 'Kriteria matang, rotasi, pengangkutan TBS'),
  ('SOP Audit & Monitoring', 'Audit internal, compliance ISPO/RSPO');

-- Insert SOP detail
INSERT INTO sop_referensi (id_tipe_sop, nama_sop, deskripsi) VALUES
  ('<tipe_pemeliharaan>', 'Pemupukan TBM Sesuai Dosis', 'GAP-ISPO-021'),
  ('<tipe_panen>', 'Kriteria Matang Panen TBS', 'GAP-ISPO-040'),
  ('<tipe_panen>', 'Sortasi dan Quality Control', 'GAP-ISPO-041');
```

**Bridge Strategy:**
```javascript
// ENHANCED FUNCTION in dashboardService.js
async function calculateSopComplianceBreakdown() {
  // Query SOP categories from NEW schema
  const { data: sopTypes } = await supabase
    .from('sop_tipe')
    .select('id_tipe_sop, nama_tipe_sop');
  
  // Query compliance items from OLD schema (existing dummy data)
  const { data: items } = await supabase
    .from('master_pihak')
    .select('nama, sop_category, sop_score, sop_reason')
    .eq('tipe', 'SOP_ITEM');
  
  // Bridge: Map items to categories (manual for now, can enhance later)
  const breakdown = sopTypes.map(type => {
    // Simple keyword matching (enhance later with proper FK)
    const typeItems = items.filter(item => 
      item.nama.toLowerCase().includes(type.nama_tipe_sop.split(' ')[1]?.toLowerCase())
    );
    
    return {
      category: type.nama_tipe_sop,
      total_items: typeItems.length,
      compliant: typeItems.filter(i => i.sop_category === 'COMPLIANT').length,
      non_compliant: typeItems.filter(i => i.sop_category === 'NON_COMPLIANT').length,
      partial: typeItems.filter(i => i.sop_category === 'PARTIALLY_COMPLIANT').length,
      items: typeItems
    };
  });
  
  return { by_category: breakdown };
}
```

---

### OPTION 3: GRADUAL MIGRATION (Long-term)

**Roadmap:**

**Q4 2025 (Now):**
- Use new schema for Panen + SOP categories (Phase 1)
- Keep old schema for Validasi, APH, Sanitasi

**Q1 2026:**
- Migrate Validasi tracking to `ops_sub_tindakan`
- Link to proper `sop_referensi`

**Q2 2026:**
- Migrate APH & Sanitasi to new schema
- Deprecate `spk_header.nama_spk` hack (DUMMY_TREND_%, etc.)

**Q3 2026:**
- Full migration complete
- Archive old tables or keep for historical data

---

## 📊 PART 4: REVISED PHASE 1 IMPLEMENTATION PLAN

### Phase 1 Deliverables (REVISED with New Schema)

#### **A. Master Data Setup (SQL)**

**File:** `sql/setup_master_data_ops_sop.sql`

```sql
-- ================================================
-- STEP 1: Setup OPS Master Data
-- ================================================

-- Insert Fase Besar: Pemanenan
INSERT INTO ops_fase_besar (nama_fase, umur_mulai, umur_selesai, deskripsi)
VALUES ('Pemanenan', 3, 25, 'Panen TBS, sortasi, transportasi ke PKS')
RETURNING id_fase_besar;
-- Save this ID as: fase_panen_id

-- Insert Sub-Tindakan for Panen
INSERT INTO ops_sub_tindakan (id_fase_besar, nama_sub, deskripsi) VALUES
  ('<fase_panen_id>', 'Panen TBS Rotasi Rutin', 'Panen sesuai kriteria matang, interval 7-10 hari'),
  ('<fase_panen_id>', 'Sortasi Buah TBS', 'Quality control: pisahkan lulus vs reject'),
  ('<fase_panen_id>', 'Angkut ke TPH', 'Transportasi TBS ke Tempat Pengumpulan Hasil'),
  ('<fase_panen_id>', 'Kirim ke PKS', 'Pengiriman TBS ke Pabrik Kelapa Sawit');

-- ================================================
-- STEP 2: Setup SOP Master Data
-- ================================================

-- Insert SOP Tipe
INSERT INTO sop_tipe (nama_tipe_sop, deskripsi) VALUES
  ('SOP Pemeliharaan Tanaman', 'Pemupukan, penyulaman, pengendalian gulma & hama'),
  ('SOP Panen', 'Kriteria matang, rotasi, sortasi, pengangkutan TBS'),
  ('SOP Audit & Monitoring', 'Audit internal, monitoring compliance ISPO/RSPO');

-- Insert SOP Referensi
INSERT INTO sop_referensi (id_tipe_sop, nama_sop, deskripsi) VALUES
  ((SELECT id_tipe_sop FROM sop_tipe WHERE nama_tipe_sop = 'SOP Panen'), 
   'Kriteria Matang Panen TBS', 
   'GAP-ISPO-040: Kriteria brondolan jatuh, fraksi matang minimal'),
  
  ((SELECT id_tipe_sop FROM sop_tipe WHERE nama_tipe_sop = 'SOP Panen'),
   'Sortasi dan Quality Control TBS',
   'GAP-ISPO-041: Standar sortasi, handling reject/afkir');
```

#### **B. Dummy Panen Data (SQL)**

**File:** `sql/dummy_data_v3_panen_with_new_schema.sql`

```sql
-- ================================================
-- STEP 3: Create Panen Jadwal (Planning)
-- ================================================

-- 4 weeks of harvest schedule
INSERT INTO ops_jadwal_tindakan (
  id_sub_tindakan, 
  frekuensi, 
  interval_hari, 
  tanggal_mulai
) VALUES
  ((SELECT id_sub_tindakan FROM ops_sub_tindakan WHERE nama_sub = 'Panen TBS Rotasi Rutin'),
   '2x per minggu',
   7,
   '2025-10-14');
-- Save ID as: jadwal_panen_id

-- ================================================
-- STEP 4: Create Panen Eksekusi (Actual Data)
-- ================================================

-- Week 1
INSERT INTO ops_eksekusi_tindakan (
  id_jadwal_tindakan,
  tanggal_eksekusi,
  hasil,
  petugas,
  catatan
) VALUES
  ('<jadwal_panen_id>', '2025-10-14', '102.5 ton TBS, reject 2.1 ton (2.0%)', 'Tim Panen 1', 'Blok A1-A5, cuaca cerah'),
  ('<jadwal_panen_id>', '2025-10-18', '98.3 ton TBS, reject 1.9 ton (1.9%)', 'Tim Panen 2', 'Blok A6-A10, rotasi ke-2');

-- Week 2
INSERT INTO ops_eksekusi_tindakan (id_jadwal_tindakan, tanggal_eksekusi, hasil, petugas, catatan) VALUES
  ('<jadwal_panen_id>', '2025-10-21', '108.3 ton TBS, reject 2.0 ton (1.8%)', 'Tim Panen 1', 'Blok B1-B5'),
  ('<jadwal_panen_id>', '2025-10-25', '105.7 ton TBS, reject 2.2 ton (2.1%)', 'Tim Panen 2', 'Blok B6-B10');

-- Week 3
INSERT INTO ops_eksekusi_tindakan (id_jadwal_tindakan, tanggal_eksekusi, hasil, petugas, catatan) VALUES
  ('<jadwal_panen_id>', '2025-10-28', '115.2 ton TBS, reject 2.5 ton (2.2%)', 'Tim Panen 1', 'Blok C1-C5'),
  ('<jadwal_panen_id>', '2025-11-01', '112.8 ton TBS, reject 2.8 ton (2.4%)', 'Tim Panen 2', 'Blok C6-C10');

-- Week 4 (Current)
INSERT INTO ops_eksekusi_tindakan (id_jadwal_tindakan, tanggal_eksekusi, hasil, petugas, catatan) VALUES
  ('<jadwal_panen_id>', '2025-11-04', '118.5 ton TBS, reject 2.9 ton (2.4%)', 'Tim Panen 1', 'Blok D1-D5'),
  ('<jadwal_panen_id>', '2025-11-08', '124.0 ton TBS, reject 3.2 ton (2.6%)', 'Tim Panen 2', 'Blok D6-D10');

-- Total: 8 panen events (4 weeks × 2 rotations)
-- Total TBS: ~895 ton
-- Avg reject: ~2.2%
```

#### **C. Service Function Updates**

**File:** `services/operasionalService.js`

```javascript
/**
 * NEW FUNCTION: Get Panen Metrics from ops_eksekusi_tindakan
 * Uses NEW schema created by development team
 */
async function getPanenMetrics(startDate, endDate) {
  const { data: eksekusiPanen, error } = await supabase
    .from('ops_eksekusi_tindakan')
    .select(`
      id_eksekusi_tindakan,
      tanggal_eksekusi,
      hasil,
      petugas,
      catatan,
      ops_jadwal_tindakan (
        frekuensi,
        interval_hari,
        ops_sub_tindakan (
          nama_sub,
          ops_fase_besar ( nama_fase )
        )
      )
    `)
    .gte('tanggal_eksekusi', startDate)
    .lte('tanggal_eksekusi', endDate)
    .order('tanggal_eksekusi', { ascending: true });
  
  if (error) throw error;
  
  // Filter only Panen phase
  const panenOnly = eksekusiPanen.filter(row =>
    row.ops_jadwal_tindakan?.ops_sub_tindakan?.ops_fase_besar?.nama_fase === 'Pemanenan'
  );
  
  // Parse hasil field: "102.5 ton TBS, reject 2.1 ton (2.0%)"
  const parsedData = panenOnly.map(row => {
    const hasilText = row.hasil || '';
    
    // Extract TBS tonnage
    const tonMatch = hasilText.match(/([\d.]+)\s*ton TBS/i);
    const ton = tonMatch ? parseFloat(tonMatch[1]) : 0;
    
    // Extract reject percentage
    const rejectMatch = hasilText.match(/reject.*?\(([\d.]+)%\)/i);
    const rejectPersen = rejectMatch ? parseFloat(rejectMatch[1]) : 0;
    
    return {
      tanggal: row.tanggal_eksekusi,
      ton_tbs: ton,
      reject_persen: rejectPersen,
      petugas: row.petugas,
      lokasi: row.catatan?.match(/Blok\s+[\w-]+/i)?.[0] || 'Unknown'
    };
  });
  
  const totalTon = parsedData.reduce((sum, d) => sum + d.ton_tbs, 0);
  const avgReject = parsedData.length > 0
    ? parsedData.reduce((sum, d) => sum + d.reject_persen, 0) / parsedData.length
    : 0;
  
  return {
    total_ton_actual: totalTon,
    avg_reject_persen: avgReject,
    harvest_count: parsedData.length,
    weekly_breakdown: parsedData
  };
}
```

---

## 🚀 PART 5: IMMEDIATE ACTIONS

### What I Need from You (Team Coordination):

#### **1. Verify Schema Status in Supabase**
- ✅ Confirm tables exist: `sop_tipe`, `sop_referensi`, `ops_fase_besar`, `ops_sub_tindakan`, `ops_jadwal_tindakan`, `ops_eksekusi_tindakan`
- ⚠️ Check: Are they empty or already have data?
- ⚠️ Clarify: What is `id_tanaman` in `ops_jadwal_tindakan`? (Per-tree? Per-block?)

#### **2. Team Alignment**
- 📋 Confirm: Can I insert master data to these tables? (sop_tipe, ops_fase_besar)
- 📋 Confirm: Can I create dummy data for testing? (ops_eksekusi_tindakan)
- 📋 Policy: Should I keep old schema running or plan migration?

#### **3. Technical Decisions**
- ❓ RLS (Row Level Security): Are these tables protected? Need service role?
- ❓ API Access: Can existing Supabase client access these tables?
- ❓ Indexes: Do we need to create indexes for performance?

---

## ⚠️ CRITICAL UPDATE - TAHAP 6 CONTEXT ADDED

### NEW INFORMATION RECEIVED (Nov 10, 2025):

PM shared **SkenarioDB_Tahap6_SPK.md** yang menjelaskan:
- Alur lengkap: **SOP → Jadwal Operasional → SPK → Pelaksanaan**
- Relasi: **fase_besar → sub_tindakan → jadwal_tindakan → spk_tindakan → eksekusi_tindakan**
- **ops_spk_tindakan** sudah ada di Supabase (dari tim developer)

**IMPLIKASI:**
- 🔴 Current `spk_header` + `spk_tugas` might be DEPRECATED/REPLACED by `ops_spk_tindakan`
- 🔴 Need to REVISE entire strategy considering Tahap 6 workflow
- 🔴 HOLD Phase 1 execution until complete analysis done

**STATUS:** 🟡 **ANALYSIS IN PROGRESS**

---

## 💡 NEXT STEPS (REVISED)

**IMMEDIATE:**
1. ⏸️ **PAUSE** Phase 1 implementation
2. 📖 Deep analysis of Tahap 6 (SPK workflow)
3. 🔄 Update integration strategy with complete picture
4. 📊 Create comprehensive decision matrix
5. 🎯 Present final recommendation to PM

**TIMELINE:**
- Analysis completion: 30-45 minutes
- Updated recommendation: Ready for review
- Decision from PM: GO/WAIT/REVISE
- Execution: After approval with complete context

**Ready to continue with full context! 🚀**

