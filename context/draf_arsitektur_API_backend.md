# **Draf Arsitektur API (Kontrak API) untuk Implementasi Dashboard POAC v1.0**

**Tujuan:** Mendefinisikan "pipa ledeng" (API endpoints) yang menghubungkan semua komponen "Sistem Saraf Digital" (Aset 2.2) kita. Ini adalah "Technical Blueprint" untuk tim developer backend.

API ini dibagi berdasarkan 3 Sub-Proses POAC yang telah kita definisikan (sesuai Respons 74).

### **1\. API untuk Sub-Proses 1: INTELIJEN & PERENCANAAN (Oleh AM/GIS di Platform B)**

**Tujuan:** Membuat dan mendistribusikan Work Order (SPK) digital.

* **POST /api/v1/spk**  
  * **Tujuan:** Membuat spk\_header baru (Tugas 1.5).  
  * **Input (Body):** { nama\_spk: "...", id\_asisten\_pembuat: "...", tanggal\_target: "..." }  
  * **Output:** { id\_spk\_baru: "..." }  
* **POST /api/v1/spk/{id\_spk}/tugas**  
  * **Tujuan:** Menambahkan 1 atau lebih spk\_tugas (multi-tugas) ke SPK Header (Tugas 1.5). Ini juga bisa dipicu oleh *trigger* GIS atau integrasi Peta (M-4.3).  
  * **Input (Body):** \[ { id\_pelaksana: "...", tipe\_tugas: "VALIDASI\_DRONE", target\_json: "{...}" }, ... \]  
  * **Output:** { status: "sukses", jumlah\_tugas\_dibuat: 2 }  
* **GET /api/v1/tugas?user={id\_mandor}** (Sinkronisasi Platform A \- Offline-First)  
  * **Tujuan:** (Tugas 1.6) Dipanggil oleh Aplikasi Flutter (Platform A) saat sinkronisasi di kantor.  
  * **Output:** Mengembalikan daftar spk\_tugas yang *status*\-nya "Baru" dan ditugaskan ke id\_mandor tersebut (sesuai Tuntunan "Simple" \- Respons 94).  
* **GET /api/v1/masterdata/pohon?blok={id\_blok}** (Sinkronisasi Platform A \- Offline-First)  
  * **Tujuan:** (Tugas 1.6) Dipanggil oleh Flutter setelah mengunduh tugas, untuk mengambil data master pohon yang relevan.  
  * **Output:** GeoJSON atau JSON berisi data kebun\_n\_pokok (Ancak, Lat/Long) untuk blok tersebut, untuk disimpan di SQLite lokal.

### **2\. API untuk Sub-Proses 2: EKSEKUSI & PELAPORAN (Oleh Mandor di Platform A)**

**Tujuan:** Menerima Jejak Digital 5W1H dari lapangan. Ini adalah API terpenting.

* **POST /api/v1/log\_aktivitas**  
  * **Tujuan:** (Tugas 2.1, 2.3, 2.4) Dipanggil oleh Aplikasi Flutter saat sinkronisasi di kantor untuk meng-upload *batch* data dari SQLite lokal.  
  * **Input (Body):** \[ { id\_tugas: "...", id\_npokok: "...", timestamp\_eksekusi: "...", gps: "...", hasil\_json: "{...}" }, ... \] (Berisi puluhan/ratusan log).  
  * **Tindakan Server (Wajib):** Server harus **memvalidasi setiap log** (Tuntunan Keamanan, Respons 76). Server mengambil id\_petugas dari token otentikasi (JWT) dan timestamp dari NOW() (Tuntunan Akuntabilitas 5W1H).  
  * **Output:** { status: "sukses", log\_diterima: 150, log\_gagal: 2 }

### **3\. API untuk Sub-Proses 3: KONTROL & PENYEMPURNAAN (Oleh Manajemen di Platform B)**

**Tujuan:** Menyajikan data KPI/KRI yang sudah diolah (agregasi) untuk Dashboard. Ini adalah API yang "dibaca" oleh ApexCharts dan Leaflet.

* **GET /api/v1/dashboard/kpi\_eksekutif?estate={id\_estate}**  
  * **Tujuan:** (Tugas 3.2) Mengisi **Dashboard Tampilan 1 (Eksekutif)** (Fitur M-1.1, M-1.2).  
  * **Output:** JSON tunggal berisi angka-angka yang sudah dihitung: { "kri\_lead\_time\_aph": 2.8, "kri\_kepatuhan\_sop": 95.0, "tren\_insidensi\_baru": \[...\], "tren\_g4\_aktif": \[...\] }  
* **GET /api/v1/dashboard/operasional?divisi={id\_divisi}**  
  * **Tujuan:** (Tugas 3.1) Mengisi **Dashboard Tampilan 2 (Operasional)** (Fitur M-2.1, M-2.2).  
  * **Output:** JSON berisi data untuk Corong Alur Kerja (Funnel) dan Papan Peringkat Tim.  
* **GET /api/v1/dashboard/teknis?umh={id\_umh}**  
  * **Tujuan:** (Tugas 3.3) Mengisi **Dashboard Tampilan 3 (Teknis)** (Fitur M-3.1, M-3.2).  
  * **Output:** JSON berisi data mentah untuk Matriks Kebingungan (% False Positive, dll).  
* **GET /api/v1/peta/cluster?bbox={...}**  
  * **Tujuan:** (Fitur M-2.3) Mengisi **Peta GIS Leaflet** (Tampilan 2\) dengan data 1.2jt pohon.  
  * **Output:** GeoJSON berisi *cluster* pohon (jika di-zoom out) atau titik-titik pohon individual (jika di-zoom in) untuk *bounding box* (bbox) peta yang terlihat, lengkap dengan status M-K-H. (Wajib menerapkan Leaflet.markercluster di frontend).