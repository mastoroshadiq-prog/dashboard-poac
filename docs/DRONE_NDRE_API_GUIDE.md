# DRONE NDRE API - TESTING GUIDE

## Base URL
```
http://localhost:3000/api/v1/drone
```

## Endpoints

### 1. Get Filter Options
**GET** `/ndre/filters`

**Description:** Mendapatkan daftar filter options untuk UI dropdown (divisi, blok, stress levels)

**Response Example:**
```json
{
  "success": true,
  "filters": {
    "divisi": ["AME II"],
    "blok": ["D01", "D02"],
    "blok_detail": ["D001A", "D001B"],
    "stress_levels": ["Stres Berat", "Stres Sedang", "Sehat"]
  }
}
```

**Test in Browser:**
```
http://localhost:3000/api/v1/drone/ndre/filters
```

---

### 2. Get NDRE Statistics
**GET** `/ndre/statistics`

**Description:** Mendapatkan statistik NDRE (aggregated data)

**Query Parameters:**
- `divisi` (optional): Filter by division
- `blok` (optional): Filter by block
- `date_from` (optional): Start date (YYYY-MM-DD)
- `date_to` (optional): End date (YYYY-MM-DD)

**Response Example:**
```json
{
  "success": true,
  "statistics": {
    "total_trees": 1000,
    "classification": {
      "Stres Berat": {
        "count": 450,
        "percentage": "45.00",
        "priority": "URGENT",
        "color": "#DC2626"
      },
      "Stres Sedang": {
        "count": 350,
        "percentage": "35.00",
        "priority": "HIGH",
        "color": "#F59E0B"
      },
      "Sehat": {
        "count": 200,
        "percentage": "20.00",
        "priority": "NORMAL",
        "color": "#10B981"
      }
    },
    "ndre_range": {
      "min": "0.3000",
      "max": "0.9000",
      "avg": "0.5500"
    },
    "recommendations": {
      "urgent_validation": 450,
      "high_priority": 350,
      "total_needs_attention": 800
    }
  }
}
```

**Test in Browser:**
```
http://localhost:3000/api/v1/drone/ndre/statistics
http://localhost:3000/api/v1/drone/ndre/statistics?divisi=AME%20II
```

---

### 3. Get NDRE Data (Map View)
**GET** `/ndre`

**Description:** Mendapatkan data NDRE lengkap untuk ditampilkan di Map/Peta

**Query Parameters:**
- `divisi` (optional): Filter by division
- `blok` (optional): Filter by block
- `blok_detail` (optional): Filter by detailed block
- `stress_level` (optional): Filter by classification (e.g., "Stres Berat")
- `date_from` (optional): Start date (YYYY-MM-DD)
- `date_to` (optional): End date (YYYY-MM-DD)
- `ndre_min` (optional): Minimum NDRE value (0-1)
- `ndre_max` (optional): Maximum NDRE value (0-1)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50, max: 500)

**Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-observasi",
      "tree_id": "P-D001A-01-01",
      "location": {
        "divisi": "AME II",
        "blok": "D01",
        "blok_detail": "D001A",
        "n_baris": 1,
        "n_pokok": 1,
        "latitude": 1.50007,
        "longitude": 101.50008
      },
      "ndre": {
        "value": 0.3862,
        "classification": "Stres Berat",
        "color": "#DC2626",
        "status": "URGENT"
      },
      "survey": {
        "date": "2025-01-25",
        "type": "DRONE_NDRE",
        "notes": "Pokok Utama"
      },
      "metadata": {
        "object_id": 167903,
        "divisi": "AME II",
        "blok": "D01",
        "blok_detail": "D001A",
        "tahun_tanam": 2009
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total_items": 1000,
    "total_pages": 20
  },
  "statistics": {
    "total_trees": 1000,
    "classification": { ... },
    "ndre_range": { ... },
    "recommendations": { ... }
  }
}
```

**Test in Browser:**
```
# All data (first 50 items)
http://localhost:3000/api/v1/drone/ndre

# Filter by stress level (Stres Berat only)
http://localhost:3000/api/v1/drone/ndre?stress_level=Stres%20Berat&limit=10

# Filter by division and block
http://localhost:3000/api/v1/drone/ndre?divisi=AME%20II&blok=D01&limit=20

# Filter by NDRE value range (severe stress < 0.4)
http://localhost:3000/api/v1/drone/ndre?ndre_max=0.4&limit=10

# Pagination
http://localhost:3000/api/v1/drone/ndre?page=2&limit=50
```

---

### 4. Get Tree Detail
**GET** `/tree/:id_npokok`

**Description:** Mendapatkan detail lengkap pohon specific (untuk validasi)

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id_npokok": "uuid",
    "id_tanaman": "P-D001A-01-01",
    "divisi": "AME II",
    "blok": "D01",
    "blok_detail": "D001A",
    "n_baris": 1,
    "n_pokok": 1,
    "object_id": 167903,
    "tgl_tanam": "2009-01-01",
    "kebun_observasi": [
      {
        "id_observasi": "uuid",
        "tanggal_survey": "2025-01-25",
        "jenis_survey": "DRONE_NDRE",
        "ndre_value": 0.3862,
        "ndre_classification": "Stres Berat",
        "keterangan": "Pokok Utama"
      }
    ]
  }
}
```

**Test in Browser:**
```
http://localhost:3000/api/v1/drone/tree/{id_npokok}
```

---

## Frontend UI Recommendations

### Map View
- Use **Leaflet.js** or **Google Maps API** for interactive map
- Plot trees as markers with color coding:
  - 🔴 Red (#DC2626): Stres Berat (URGENT)
  - 🟠 Orange (#F59E0B): Stres Sedang (HIGH)
  - 🟢 Green (#10B981): Sehat (NORMAL)
- Add marker clustering for performance (thousands of trees)
- Show popup on marker click with tree details

### Filter Panel
- Dropdown for Division (fetch from `/ndre/filters`)
- Dropdown for Block (fetch from `/ndre/filters`)
- Dropdown for Stress Level (fetch from `/ndre/filters`)
- Date range picker
- NDRE value slider (0.0 - 1.0)

### Statistics Panel
- Pie chart for stress classification distribution
- Bar chart for NDRE value distribution
- Key metrics cards:
  - Total Trees Surveyed
  - Urgent Validation Needed (Stres Berat count)
  - Average NDRE Value

### Action Buttons
- **Create SPK** button untuk pohon yang selected
- **Export to CSV** untuk filtered data
- **Print Report** untuk summary statistics

---

## Next Steps
1. ✅ Test endpoints di browser
2. 🔄 Create SPK Validasi endpoint (Todo #2)
3. 🔄 Mandor assignment endpoint (Todo #3)
4. 🔄 Analisis ops_* tables untuk SPK generic (Todo #4)
