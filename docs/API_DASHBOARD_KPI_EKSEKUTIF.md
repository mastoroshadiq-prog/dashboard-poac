# API DOCUMENTATION - Dashboard KPI Eksekutif

## 🎯 Endpoint: GET /api/v1/dashboard/kpi_eksekutif

**Tujuan:** Mengambil data KPI/KRI untuk Dashboard Eksekutif (Tampilan 1)

**Sesuai Tugas:** 3.2 - Dashboard Eksekutif (Fitur M-1.1 & M-1.2)

**Sub-Proses:** SP-3 (Kontrol & Penyempurnaan)

---

## 📡 Request

### URL
```
GET http://localhost:3000/api/v1/dashboard/kpi_eksekutif
```

### Query Parameters (Optional)

| Parameter  | Type   | Required | Description                          | Example        |
|------------|--------|----------|--------------------------------------|----------------|
| estate     | string | No       | Filter by estate ID                  | `EST001`       |
| date_from  | string | No       | Start date (ISO 8601: YYYY-MM-DD)    | `2025-10-01`   |
| date_to    | string | No       | End date (ISO 8601: YYYY-MM-DD)      | `2025-11-05`   |

### Headers
```
Content-Type: application/json
```

### Authentication
**Status:** Tidak diperlukan untuk fase 1 (akan ditambahkan JWT di fase berikutnya)

---

## 📥 Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "kri_lead_time_aph": 2.0,
    "kri_kepatuhan_sop": 75.0,
    "tren_insidensi_baru": [
      {
        "date": "2025-10-28",
        "count": 1
      },
      {
        "date": "2025-10-29",
        "count": 0
      },
      {
        "date": "2025-10-30",
        "count": 2
      }
    ],
    "tren_g4_aktif": 2,
    "generated_at": "2025-11-05T12:34:56.789Z",
    "filters": {
      "estate": null
    }
  },
  "message": "Data KPI Eksekutif berhasil diambil"
}
```

### Error Response (400 Bad Request)

```json
{
  "success": false,
  "error": "Invalid estate parameter format",
  "message": "Parameter estate harus alphanumeric (max 50 karakter)"
}
```

### Error Response (500 Internal Server Error)

```json
{
  "success": false,
  "error": "Database connection failed",
  "message": "Gagal mengambil data KPI Eksekutif"
}
```

---

## 📊 Data Structure Explanation

### 1. `kri_lead_time_aph` (Float)

**Deskripsi:** Rata-rata waktu (dalam hari) dari deteksi G1 hingga eksekusi APH

**Logika Perhitungan:**
- Cari semua log dengan `status_aktual` = "G1 (Ganoderma Awal)"
- Cari log APH untuk pohon yang sama
- Hitung selisih waktu: `timestamp_aph - timestamp_g1`
- Return rata-rata dalam hari

**Dummy Data Expected:** `2.0` hari

**SQL Query:**
```sql
WITH g1_detections AS (
  SELECT 
    id_npokok,
    timestamp_eksekusi as detected_at
  FROM log_aktivitas_5w1h
  WHERE hasil_json->>'status_aktual' = 'G1 (Ganoderma Awal)'
),
aph_executions AS (
  SELECT 
    id_npokok,
    timestamp_eksekusi as executed_at
  FROM log_aktivitas_5w1h
  WHERE hasil_json->>'tipe_aplikasi' = 'APH'
)
SELECT 
  AVG(EXTRACT(EPOCH FROM (aph.executed_at - g1.detected_at)) / 86400)::numeric(10,1) 
  as avg_lead_time_days
FROM g1_detections g1
INNER JOIN aph_executions aph ON g1.id_npokok = aph.id_npokok
WHERE aph.executed_at > g1.detected_at;
```

---

### 2. `kri_kepatuhan_sop` (Float - Percentage)

**Deskripsi:** Persentase kepatuhan SOP (% tugas yang selesai tepat waktu)

**Logika Perhitungan:**
- Count tugas dengan `status_tugas` = "SELESAI"
- Dibagi total tugas dengan status "SELESAI" atau "DIKERJAKAN"
- Return persentase (0-100)

**Dummy Data Expected:** `75.0` %

**Formula:**
```
(Jumlah SELESAI / Jumlah [SELESAI + DIKERJAKAN]) × 100
= (3 / 4) × 100 = 75.0%
```

---

### 3. `tren_insidensi_baru` (Array of Objects)

**Deskripsi:** Tren harian deteksi G1 baru (30 hari terakhir)

**Logika Perhitungan:**
- Filter log 30 hari terakhir
- Filter hanya yang `status_aktual` = "G1 (Ganoderma Awal)"
- Group by tanggal
- Count per hari

**Dummy Data Expected:**
```json
[
  { "date": "2025-10-28", "count": 1 }
]
```

**Object Structure:**
- `date`: ISO 8601 date string (YYYY-MM-DD)
- `count`: Integer, jumlah deteksi G1 pada tanggal tersebut

---

### 4. `tren_g4_aktif` (Integer)

**Deskripsi:** Jumlah pohon G4 yang belum disanitasi (active sanitasi tasks)

**Logika Perhitungan:**
- Count `spk_tugas` dengan `tipe_tugas` = "SANITASI"
- Dan `status_tugas` = "BARU" atau "DIKERJAKAN"

**Dummy Data Expected:** `2`

**SQL Query:**
```sql
SELECT COUNT(*) 
FROM spk_tugas
WHERE tipe_tugas = 'SANITASI'
  AND status_tugas IN ('BARU', 'DIKERJAKAN');
```

---

## 🧪 Testing dengan cURL

### Basic Request
```bash
curl -X GET http://localhost:3000/api/v1/dashboard/kpi_eksekutif
```

### With Query Parameters
```bash
curl -X GET "http://localhost:3000/api/v1/dashboard/kpi_eksekutif?estate=EST001"
```

### With Date Range
```bash
curl -X GET "http://localhost:3000/api/v1/dashboard/kpi_eksekutif?date_from=2025-10-01&date_to=2025-11-05"
```

---

## 🧪 Testing dengan Postman

1. **Method:** GET
2. **URL:** `http://localhost:3000/api/v1/dashboard/kpi_eksekutif`
3. **Params:**
   - Key: `estate`, Value: `EST001` (optional)
   - Key: `date_from`, Value: `2025-10-01` (optional)
   - Key: `date_to`, Value: `2025-11-05` (optional)
4. **Headers:**
   - `Content-Type`: `application/json`

---

## 🔐 Security & Validation

### Server-Side Validation (Sesuai Filosofi TEPAT)

1. **Parameter `estate`:**
   - Format: Alphanumeric + underscore + hyphen
   - Max length: 50 characters
   - Regex: `/^[a-zA-Z0-9_-]{1,50}$/`

2. **Parameter `date_from` & `date_to`:**
   - Format: ISO 8601 (YYYY-MM-DD)
   - Validated dengan `new Date()`
   - Return 400 jika format invalid

3. **Response Validation:**
   - Semua data wajib dari database, tidak ada data hard-coded
   - Jika query gagal, return 0 atau [] (empty array), bukan throw error
   - Error logging di console untuk debugging

---

## 📋 Database Requirements

### Tables Required
- `log_aktivitas_5w1h`
- `spk_tugas`

### Columns Required

**log_aktivitas_5w1h:**
- `id_npokok` (string)
- `timestamp_eksekusi` (timestamp)
- `hasil_json` (jsonb) dengan keys:
  - `status_aktual` (string)
  - `tipe_aplikasi` (string)

**spk_tugas:**
- `status_tugas` (string: BARU, DIKERJAKAN, SELESAI)
- `tipe_tugas` (string: VALIDASI_DRONE, APH, SANITASI)

---

## 🚀 Frontend Integration (Platform B - Dashboard)

### JavaScript/Fetch Example

```javascript
async function loadKpiEksekutif() {
  try {
    const response = await fetch('http://localhost:3000/api/v1/dashboard/kpi_eksekutif');
    const result = await response.json();
    
    if (result.success) {
      const { data } = result;
      
      // Update UI
      document.getElementById('kri-lead-time').textContent = data.kri_lead_time_aph + ' hari';
      document.getElementById('kri-kepatuhan').textContent = data.kri_kepatuhan_sop + '%';
      
      // Render chart dengan ApexCharts
      renderTrenInsidensiChart(data.tren_insidensi_baru);
      
      // Update badge G4
      document.getElementById('g4-aktif').textContent = data.tren_g4_aktif;
    }
  } catch (error) {
    console.error('Error loading KPI:', error);
  }
}
```

### ApexCharts Integration Example

```javascript
function renderTrenInsidensiChart(trenData) {
  const options = {
    chart: { type: 'line', height: 350 },
    series: [{
      name: 'Deteksi G1 Baru',
      data: trenData.map(item => item.count)
    }],
    xaxis: {
      categories: trenData.map(item => item.date)
    }
  };
  
  const chart = new ApexCharts(document.querySelector("#chart"), options);
  chart.render();
}
```

---

## 🐛 Troubleshooting

### Error: "Database connection failed"
**Solusi:**
1. Check file `.env` sudah dibuat (copy dari `.env.example`)
2. Pastikan `SUPABASE_URL` dan `SUPABASE_KEY` sudah diisi
3. Test koneksi dengan `GET /health`

### Error: "Endpoint not found"
**Solusi:**
1. Pastikan server berjalan (`npm run dev`)
2. Check URL dengan benar: `/api/v1/dashboard/kpi_eksekutif`
3. Method harus GET, bukan POST

### Response: semua nilai 0 atau []
**Solusi:**
1. Check apakah dummy data sudah di-insert ke Supabase
2. Run SQL script `dummy_data_v1_2.sql`
3. Verifikasi dengan query manual di Supabase SQL Editor

---

## 📝 Notes

- Endpoint ini mengikuti **Filosofi TEPAT**: Data real-time dari database, validasi server-side ketat
- Mengikuti **Tuntunan Skalabilitas**: Agregasi di database, parallel queries
- Mengikuti **Tuntunan Dokumentasi**: Semua contoh request/response disertakan
- Status: ✅ **Production Ready** (setelah .env dikonfigurasi)

---

*Dokumentasi ini adalah bagian dari API Contract sesuai `draf_arsitektur_API_backend.md`*
