# KONFIRMASI PEMAHAMAN ARSITEK - FASE 1

**Tanggal:** 5 November 2025  
**Status:** ✅ SIAP - Buku Pedoman/Aturan Dipahami  
**Arsitek:** Gemini 2.5 Pro (Senior Software Architect)

---

## ✅ KONFIRMASI PEMAHAMAN FILOSOFI 3P

### 1. SIMPLE (Sederhana)
- ✅ Kerumitan di backend & dashboard, BUKAN di aplikasi lapangan
- ✅ UI Mandor: minimalis, berbasis tugas, offline-first
- ✅ Sistem harus mudah digunakan di lapangan tanpa koneksi internet

### 2. TEPAT (Akurat)
- ✅ Data adalah raja - setiap eksekusi wajib menghasilkan **Jejak Digital 5W1H**:
  - **Siapa** (UserID - dari JWT/Auth)
  - **Apa** (Tipe Tugas, Status Pohon)
  - **Kapan** (Timestamp Server - non-negotiable)
  - **Di Mana** (GPS Coordinates, ID Pohon, Blok)
  - **Mengapa** (Work Order ID, Alasan)
  - **Bagaimana** (Metode, Foto, Catatan)
- ✅ Integritas data dengan validasi server-side adalah **NON-NEGOTIABLE**
- ✅ **JANGAN PERCAYA INPUT DARI HP** - validasi ulang di backend

### 3. PENINGKATAN BERTAHAP (Iteratif)
- ✅ Sistem dirancang sebagai **Closed Loop**:
  - Data dikumpulkan (Actuating) → Memberi feedback (Control) → Menyempurnakan Planning
- ✅ False Positives/Negatives dari lapangan → Update Tabel Aturan Klasifikasi UMH
- ✅ Continuous improvement berdasarkan data aktual

---

## ✅ ARSITEKTUR DUA PLATFORM

### Platform A (Lapangan - Mandor/Surveyor)
- **Teknologi:** Flutter (Native/Hybrid)
- **Database Lokal:** SQLite (via sqflite)
- **Security:** flutter_secure_storage (PIN Lokal)
- **Peta Offline:** MapLibre GL + MBTiles + GeoJSON
- **Sinkronisasi:** flutter_workmanager (background sync)
- **Kompresi:** flutter_image_compress
- **Fitur Kunci:**
  - ✅ **Offline-First** architecture
  - ✅ UI berbasis Task List
  - ✅ Grid sederhana (non-GIS) yang meniru layout ancak blok
  - ✅ Auto-sync saat ada koneksi

### Platform B (Manajemen - AM, GIS, GM)
- **Teknologi:** Web Dashboard (Browser-based)
- **Template:** AdminLTE atau sejenisnya
- **Grafik:** ApexCharts.js
- **Peta:** Leaflet.js + **leaflet.markercluster** (WAJIB untuk 1.2 juta pohon)
- **Fitur Kunci:**
  - ✅ Peta GIS Interaktif
  - ✅ Dashboard KPI/KRI (Funnel, Speedometer, Trend)
  - ✅ 3 Tampilan: Eksekutif, Operasional, Teknis

---

## ✅ ALUR KERJA UTAMA (SIKLUS POAC)

### SP-1: Intel & Plan
1. **Input:** Data Drone (NDRE, Papan Kalibrasi, UMH)
2. **Proses:** Analis GIS menggunakan Dashboard Teknis (Tampilan 3)
3. **Output:** Sistem generate **Work Order Validasi** (Task 1.5)
4. **Distribusi:** Backend distribute WO ke Platform A Mandor (Task 1.6)

### SP-2: Eksekusi & Lapor
1. **Task 2.1:** Mandor terima WO Validasi → Input status aktual via UI Grid
   - Status: G0, G1, Defisiensi, Stres Air, G3, G4, dll.
   - Wajib: Foto, GPS, Timestamp, Catatan
2. **Task 2.2:** Backend **AUTO-TRIGGER** Work Order baru:
   ```
   IF (G1 OR Defisiensi OR Stres_Lain OR G0_FalsePositive)
     → Generate Work Order APH (Target: Tim Aplikasi)
   
   IF (G3 OR G4)
     → Generate Work Order Sanitasi (Target: Tim Sanitasi)
   ```
3. **Task 2.3 & 2.4:** Tim Aplikasi/Sanitasi eksekusi → Lapor penyelesaian via Platform A

### SP-3: Kontrol & Penyempurnaan
1. Data 5W1H dari SP-2 → **Langsung** isi Dashboard (Tampilan 1 & 2)
2. Ukur KPI/KRI real-time
3. **Feedback Loop (Task 3.4):**
   - Data False Positives/Negatives → Analis GIS
   - Update **Tabel Aturan Klasifikasi UMH**
   - Improve akurasi deteksi drone untuk siklus berikutnya

---

## ✅ TUNTUNAN NON-FUNGSIONAL

### Security
- ✅ Validasi server-side untuk **SEMUA** input
- ✅ **JANGAN PERCAYA HP** - validasi ulang di backend
- ✅ JWT untuk autentikasi UserID
- ✅ Timestamp menggunakan server time (bukan client)
- ✅ HTTPS untuk semua API endpoint
- ✅ Input sanitization & SQL injection prevention

### Scalability
- ✅ Pagination untuk semua API list (Work Orders, Trees, dll.)
- ✅ Database indexing pada:
  - ID Pohon
  - Blok
  - Timestamp
  - Work Order ID
  - UserID
- ✅ MarkerCluster untuk peta (handle 1.2 juta pohon)
- ✅ Lazy loading untuk data besar

### Code Quality
- ✅ Git version control
- ✅ Clean code principles
- ✅ Readable & well-commented
- ✅ Modular architecture
- ✅ Error handling & logging

### Documentation
- ✅ Setiap API endpoint wajib dokumentasi:
  - Method (GET/POST/PUT/DELETE)
  - Request body/params (dengan contoh)
  - Response format (dengan contoh)
  - Error codes & messages
  - Authentication requirements

### Interoperability
- ✅ Database: PostgreSQL (SQL standard)
- ✅ PostGIS extension untuk geospatial data
- ✅ Easy export ke CSV/Excel
- ✅ RESTful API standard
- ✅ JSON format untuk data exchange

---

## ✅ TECH STACK YANG AKAN DIGUNAKAN

### Backend (Cloud @Cost)
- **Primary:** Node.js (Express.js)
- **Database:** PostgreSQL + PostGIS
- **Alternative Cloud:** Firebase (Auth, Firestore, Storage) dan/atau Supabase
- **Authentication:** JWT
- **API:** RESTful
- **File Storage:** Cloud storage untuk foto lapangan

### Platform A (Mobile - Flutter)
- **Framework:** Flutter
- **Local DB:** SQLite (sqflite)
- **Secure Storage:** flutter_secure_storage
- **Maps:** MapLibre GL / flutter_map
- **Offline Maps:** MBTiles + GeoJSON
- **Background Sync:** flutter_workmanager
- **Image Compression:** flutter_image_compress

### Platform B (Dashboard - Web)
- **Template:** AdminLTE atau sejenisnya
- **Charts:** ApexCharts.js
- **Maps:** Leaflet.js + leaflet.markercluster
- **Frontend:** HTML/CSS/JavaScript (atau Vue.js/React jika diperlukan)

---

## ✅ KONTEKS BISNIS SPESIFIK

### Skala Operasi
- **Total Pohon:** 1.2 juta pohon kelapa sawit
- **User Groups:** Mandor, Tim Aplikasi, Tim Sanitasi, Analis GIS, AM, GM
- **Work Order Types:** Validasi, APH, Sanitasi

### SOP Kunci

#### SOP 5.3 - Aplikasi APH
- **Target:** SEMUA pohon Zona Kuning
- **Kriteria:** G1, Defisiensi, Stres Air, G0 False Positive
- **Tujuan:** Preventif / PGPF (Perawatan Generatif Produktif Fase)

#### SOP 5.4 Opsi B - Sanitasi Tunggul G4
- **Metode:** Infusi Paksa
- **Teknik:** Bor/Cacah + Volume 2-3L
- **Bahan:** Asap Cair (Pirolisis) atau Konsorsium Mikroba (Lampiran H)

### Auto-Trigger Logic (CRITICAL)
```javascript
// Pseudo-code untuk Task 2.2
if (statusPohon === 'G1' || 
    statusPohon === 'Defisiensi' || 
    statusPohon === 'Stres_Air' || 
    (statusPohon === 'G0' && isFalsePositive === true)) {
    
    generateWorkOrder({
        type: 'APH',
        targetTeam: 'Tim_Aplikasi',
        priority: 'HIGH',
        sop: 'SOP_5.3'
    });
}

if (statusPohon === 'G3' || statusPohon === 'G4') {
    generateWorkOrder({
        type: 'Sanitasi',
        targetTeam: 'Tim_Sanitasi',
        priority: statusPohon === 'G4' ? 'CRITICAL' : 'HIGH',
        sop: 'SOP_5.4_B'
    });
}
```

---

## ✅ JEJAK DIGITAL 5W1H (MANDATORY STRUCTURE)

Setiap eksekusi tugas lapangan WAJIB menghasilkan:

```json
{
  "who": {
    "userId": "string (dari JWT)",
    "userName": "string",
    "role": "string (Mandor/Tim_Aplikasi/Tim_Sanitasi)"
  },
  "what": {
    "taskType": "string (Validasi/APH/Sanitasi)",
    "workOrderId": "string",
    "treeStatus": "string (G0/G1/G3/G4/etc)",
    "action": "string (deskripsi tindakan)"
  },
  "when": {
    "timestamp": "ISO 8601 (SERVER TIME - non-negotiable)",
    "duration": "number (menit)"
  },
  "where": {
    "treeId": "string",
    "blockId": "string",
    "gpsCoordinates": {
      "latitude": "number",
      "longitude": "number",
      "accuracy": "number (meter)"
    }
  },
  "why": {
    "reason": "string",
    "workOrderSource": "string (Drone/Manual/Auto-Trigger)",
    "notes": "string"
  },
  "how": {
    "method": "string (SOP reference)",
    "materials": ["array of strings"],
    "photos": ["array of URLs/paths"],
    "quantity": "number (jika APH: liter, jika Sanitasi: volume)",
    "verification": {
      "beforePhoto": "string (URL)",
      "afterPhoto": "string (URL)"
    }
  }
}
```

---

## 🎯 STATE KONFIRMASI

**Status:** ✅ **FASE 1 SELESAI - SIAP UNTUK IMPLEMENTASI**

Saya telah memahami:
- ✅ Filosofi 3P (Simple, Tepat, Peningkatan Bertahap)
- ✅ Arsitektur Dua Platform (A & B)
- ✅ Alur Kerja POAC (SP-1, SP-2, SP-3)
- ✅ Tuntunan Non-Fungsional (Security, Scalability, Code Quality)
- ✅ Tech Stack yang akan digunakan
- ✅ Konteks Bisnis & SOP Kunci
- ✅ Struktur Jejak Digital 5W1H

**Arsitek siap menerima tugas implementasi berikutnya.**

---

## 📋 CATATAN UNTUK FASE BERIKUTNYA

Tugas yang dapat dimulai:
1. **Desain Skema Database** (PostgreSQL + PostGIS)
2. **Arsitektur API Endpoints** (RESTful design)
3. **Setup Backend Framework** (Node.js + Express)
4. **Implementasi Authentication** (JWT)
5. **Core Features:**
   - Task 1.5: Generate Work Order Validasi
   - Task 1.6: Distribute Work Order ke Platform A
   - Task 2.1: API untuk input validasi Mandor
   - Task 2.2: Auto-trigger Work Order APH/Sanitasi
   - Task 2.3 & 2.4: API untuk lapor penyelesaian
   - Task 3.4: API untuk update Tabel Aturan Klasifikasi

**Menunggu instruksi untuk melanjutkan ke fase implementasi.**

---

*Dokumen ini adalah bukti bahwa Arsitek telah memahami dan siap mengimplementasikan sistem sesuai buku pedoman/aturan yang telah ditetapkan.*
