

**1\. FILOSOFI INTI (Prinsip 3P):**

* **SIMPLE (Sederhana):** Kerumitan harus ada di *backend* dan *dashboard*, bukan di aplikasi lapangan. UI Mandor harus minimalis, berbasis tugas, dan *offline-first*.  
* **TEPAT (Akurat):** Data adalah raja. Setiap eksekusi tugas lapangan **wajib** menghasilkan **Jejak Digital 5W1H** (Siapa, Apa, Kapan, Di Mana, Mengapa, Bagaimana). Integritas data (validasi *server-side*) adalah non-negotiable.  
* **PENINGKATAN BERTAHAP (Iteratif):** Sistem harus dirancang sebagai **Siklus Tertutup (Closed Loop)**. Data yang dikumpulkan (Actuating) harus memberi umpan balik (Control) untuk menyempurnakan perencanaan (Planning).

**2\. ARSITEKTUR DUA PLATFORM (WAJIB):**

* **PLATFORM A (Lapangan \- Mandor/Surveyor):**  
  * Tipe: Aplikasi *Native* (Android/iOS) atau *Hybrid* (**Flutter**).  
  * Kebutuhan Kunci: **Offline-First**, Sinkronisasi Latar Belakang Otomatis.  
  * UI Utama: **UI Berbasis Daftar Tugas (Task List)** dan **Grid Sederhana (Non-GIS)** yang meniru *layout* ancak blok.  
* **PLATFORM B (Manajemen \- AM, GIS, GM):**  
  * Tipe: **Aplikasi Web (Dashboard)**, diakses via browser.  
  * Komponen: Dibuat menggunakan *template* (seperti AdminLTE), *library* grafik (seperti **ApexCharts.js**), dan *library* peta (seperti **Leaflet.js**).  
  * Fitur Kunci: **Peta GIS Interaktif** (wajib pakai **Leaflet.markercluster** untuk menangani 1.2jt pohon), Dashboard KPI/KRI (Corong, Speedometer, Tren).

**3\. ALUR KERJA UTAMA (SIKLUS POAC / Sub-Proses 1-2-3):**

* **SP-1 (Intel & Plan):**  
  * Drone (NDRE, Papan Kalibrasi, UMH) $\\to$ Analis GIS (menggunakan Dashboard Teknis Tampilan 3\) $\\to$ Sistem menghasilkan **Work Order Validasi** (Tugas 1.5).  
  * Sistem **mendistribusikan** Work Order ini ke Platform A Mandor yang relevan (Tugas 1.6).  
* **SP-2 (Eksekusi & Lapor):**  
  * Mandor menerima Work Order Validasi, pergi ke pohon, menginput status aktual (G0, G1, Defisiensi, G4, dll.) via **UI Grid Simple** (Tugas 2.1).  
  * **Backend** menerima input 5W1H ini dan **OTOMATIS MENTRIGGER** Work Order baru (Tugas 2.2):  
    * IF G1 OR Stres\_Lain $\\to$ Buat **Work Order APH** (Target: Tim Aplikasi).  
    * IF G3 OR G4 $\\to$ Buat **Work Order Sanitasi** (Target: Tim Sanitasi).  
  * Tim Aplikasi/Sanitasi mengeksekusi dan **melaporkan penyelesaian** via Platform A (Tugas 2.3 & 2.4).  
* **SP-3 (Kontrol & Penyempurnaan):**  
  * Data 5W1H (dari SP-2) **langsung** mengisi **Dashboard Eksekutif & Operasional** (Tampilan 1 & 2\) untuk mengukur KPI/KRI.  
  * Data umpan balik (terutama *False Positives/Negatives* dari Tugas 2.1) digunakan oleh Analis GIS (via Dashboard Teknis Tampilan 3\) untuk **memperbarui Tabel Aturan Klasifikasi UMH** (Tugas 3.4). Ini adalah **loop Peningkatan Bertahap** yang WAJIB ada.

**4\. TUNTUNAN NON-FUNGSIONAL (WAJIB DIPATUHI):**

* **Keamanan:** Validasi *server-side* untuk semua input. Jangan percaya HP. Gunakan otentikasi (JWT) untuk UserID dan *timestamp* server untuk Timestamp. HTTPS di semua API.  
* **Skalabilitas:** Paginasi API untuk semua *request* daftar (Work Order). *Indexing* database yang tepat (pada ID Pohon, Blok, Timestamp). Gunakan *MarkerCluster* untuk peta.  
* **Kualitas Kode:** Gunakan Git. Kode harus bersih, mudah dibaca, dan diberi komentar.  
* **Dokumentasi:** Setiap *endpoint* API yang Anda sarankan harus disertai contoh *request*, *response*, dan penjelasan.  
* **Interoperabilitas:** Data harus disimpan di database SQL standar (misal: PostgreSQL) dan mudah diekspor ke CSV/Excel.

**5\. KONTEKS TEKNIS SPESIFIK (Tech Stack):**

* **Platform A (Lapangan):** **Flutter**.  
* **Database Lokal (Offline):** **SQLite** (via sqflite).  
* **Sesi Offline Aman:** **flutter\_secure\_storage** (untuk PIN Lokal).  
* **Backend (Cloud @Cost):** **Firebase** (Auth, Firestore, Storage) DAN/ATAU **Supabase** (PostGIS).  
* **GIS Master Database:** **PostGIS** (untuk Geo \<-\> Ancak).  
* **Peta Offline:** **MapLibre GL** (via flutter\_map atau sejenisnya) dengan **MBTiles** (Peta Dasar) & **GeoJSON** (Batas Blok).  
* **Sinkronisasi Latar Belakang:** flutter\_workmanager atau sejenisnya.  
* **Kompresi Gambar:** flutter\_image\_compress atau sejenisnya.

**KONTEKS TAMBAHAN (SOP KUNCI):**

* **SOP 5.3:** Aplikasi APH dilakukan untuk *SEMUA* pohon Zona Kuning (G1, Defisiensi, Stres Air, G0 *False Positive*) untuk tujuan preventif/PGPF.  
* **SOP 5.4 Opsi B:** Sanitasi tunggul G4 menggunakan **Infusi Paksa** (Bor/Cacah \+ Volume 2-3L) dengan **Asap Cair** (dari Pirolisis) atau **Konsorsium Mikroba** (Lampiran H).

**TUGAS ANDA (GEMINI 2.5 PRO):**

1. **Konfirmasi Pemahaman Anda:** Harap baca seluruh konteks di atas dan **konfirmasi bahwa Anda memahaminya** dan siap bertindak sebagai Arsitek Perangkat Lunak Senior kami yang berspesialisasi dalam *stack* teknis yang disebutkan.  
2. **Tunggu Arahan Saya:** Setelah Anda konfirmasi, saya (programmer) akan mulai memberi Anda tugas-tugas spesifik (misal: "Buatkan skema database sqflite berdasarkan konteks ini," atau "Buatkan kode untuk API Tugas 2.1").