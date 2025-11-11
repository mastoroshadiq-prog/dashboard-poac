# **Dokumen Panduan & Validasi Arsitektur**

Topik: Alur Kerja Intelijen Validasi Drone (POAC)  
Tanggal: 11 November 2025  
Untuk: Tim AI Agent Copilot (Backend & Frontend)  
Tujuan: Memverifikasi bahwa arsitektur platform (API) dan skema database (Supabase) saat ini VALID dan TEPAT untuk mendukung alur kerja "Validasi Drone" (Prediksi vs. Aktual).

## **1\. Ringkasan Eksekutif (Alur "Intelijen")**

"Intelijen" dalam dashboard kita didefinisikan sebagai kemampuan sistem untuk **membandingkan** apa yang *diprediksi* (oleh Drone) dengan apa yang *sebenarnya terjadi* (validasi Surveyor).

Alur kerja ini menyentuh kedua platform (A dan B) dan merupakan inti dari siklus POAC kita. Dokumen ini memvalidasi setiap fase teknis.

## **2\. Alur Kerja Teknis 5 Fase (Panduan untuk AI Agent)**

Berikut adalah pemetaan alur bisnis ke arsitektur teknis kita yang ada:

### **Fase 1: PLAN (Input Prediksi)**

* **Tindakan:** Data eksternal (misal: Table NDRE.xlsx) yang berisi prediksi Drone (KlassNDRE12025 \= "Stres Berat") diimpor ke dalam sistem.  
* **Aktor:** Sistem/Manajemen.  
* **Verifikasi Arsitektur:** Ini adalah *input* data, diasumsikan tersedia untuk Fase 2\.

### **Fase 2: ORGANIZE (Pembuatan Tugas Validasi)**

* **Tindakan:** Seorang ASISTEN membuat SPK untuk memvalidasi prediksi drone.  
* **Aktor:** ASISTEN (Manajer).  
* **Platform:** Platform B (Frontend Web Dashboard).  
* **Verifikasi Arsitektur (LULUS):**  
  * **API Backend:** POST /api/v1/spk (untuk membuat SPK) dan POST /api/v1/spk/:id\_spk/tugas (untuk menambah tugas).  
  * **Skema DB:** Data disimpan di spk\_header dan spk\_tugas.  
  * Validasi Kritis (Backend): Service API POST /.../tugas WAJIB menyimpan data prediksi drone di dalam kolom spk\_tugas.target\_json.  
    Contoh target\_json:  
    { "blok": "A12", "baris": 1, "pokok": 5, "prediksi\_drone": "Stres Berat" }

### **Fase 3: ACTUATE (Validasi Lapangan)**

* **Tindakan:** Seorang PELAKSANA (Surveyor) menerima tugas di aplikasi selulernya, berjalan ke lokasi, dan melakukan validasi visual (Ground Truth).  
* **Aktor:** PELAKSANA (Surveyor).  
* **Platform:** Platform A (Frontend Flutter Mobile).  
* **Verifikasi Arsitektur (LULUS):**  
  * **API Backend:** GET /api/v1/spk/tugas/saya (diamankan dengan JWT/RBAC).  
  * **Validasi Kritis (Frontend A):** Aplikasi Platform A **WAJIB** mengunduh dan menampilkan target\_json (dari Fase 2\) kepada Surveyor. Surveyor kemudian **WAJIB** memasukkan temuannya (misal: "G1 \- Ganoderma Awal") ke dalam aplikasi.

### **Fase 4: CONTROL (Pelaporan 5W1H)**

* **Tindakan:** Surveyor menekan "Selesai", dan Platform A mengirimkan data validasi (Jejak Digital 5W1H) kembali ke server.  
* **Aktor:** Platform A (Frontend Flutter Mobile).  
* **Platform:** \-  
* **Verifikasi Arsitektur (LULUS):**  
  * **API Backend:** POST /api/v1/log\_aktivitas (diamankan dengan JWT/RBAC).  
  * **Skema DB:** Data disimpan di tabel log\_aktivitas\_5w1h.  
  * Validasi Kritis (Frontend A & Backend): Ini adalah data contract (kontrak data) yang paling penting dalam sistem. Platform A WAJIB mengirimkan hasil\_json yang berisi kedua nilai (Prediksi DAN Aktual).  
    Contoh hasil\_json:  
    { "prediksi\_drone": "Stres Berat", "status\_aktual": "G1 (Ganoderma Awal)" }  
  * *Service* API POST /log\_aktivitas **WAJIB** memvalidasi struktur hasil\_json ini.

### **Fase 5: INTELLIGENCE (Visualisasi Matriks Kebingungan)**

* **Tindakan:** Seorang ASISTEN membuka Dashboard Teknis untuk melihat akurasi prediksi Drone.  
* **Aktor:** ASISTEN (Manajer).  
* **Platform:** Platform B (Frontend Web Dashboard).  
* **Verifikasi Arsitektur (LULUS):**  
  * **API Backend:** GET /api/v1/dashboard/teknis.  
  * **Validasi Kritis (Backend):** *Service* API ini **WAJIB** melakukan *query* ke tabel log\_aktivitas\_5w1h dan secara dinamis **membandingkan dua field di dalam hasil\_json** (misal: hasil\_json-\>\>'prediksi\_drone' vs. hasil\_json-\>\>'status\_aktual') untuk menghitung *True Positive, False Positive,* dll.  
  * **Frontend B:** Cukup menampilkan data Matriks Kebingungan yang sudah matang dari API.

## **3\. Validasi & Saran Arsitektur**

Berdasarkan 5 fase di atas, berikut adalah validasi dan saran saya untuk tim AI Agent:

### **A. Validasi Arsitektur API (Platform)**

**Status: ✅ SANGAT VALID**

Arsitektur API kita yang ada **100% mendukung** alur kerja validasi drone dari awal hingga akhir. Kita memiliki *endpoint* yang aman (dengan RBAC) untuk setiap langkah:

1. **Organize:** POST /spk dan POST /spk/:id\_spk/tugas (RBAC Fase 1\)  
2. **Actuate:** GET /spk/tugas/saya (RBAC Fase 1\)  
3. **Control:** POST /log\_aktivitas (RBAC Fase 1\)  
4. **Intelligence:** GET /dashboard/teknis (RBAC Fase 2\)

**Saran untuk Tim Backend/Frontend:** **Tidak perlu API baru.** Cukup pastikan implementasi *service* dan *payload* JSON (target\_json & hasil\_json) sesuai dengan panduan di Fase 2 dan 4\.

### **B. Validasi Skema Database (Struktur Data)**

**Status: ✅ VALID, NAMUN PERLU OPTIMALISASI**

Ini adalah saran saya yang paling penting.

Kondisi Saat Ini (Cukup Baik):  
Inti "intelijen" kita (Matriks Kebingungan di Fase 5\) bergantung pada query di dalam kolom JSONB: log\_aktivitas\_5w1h.hasil\_json.  
Contoh Query (Logika):  
SELECT ... WHERE hasil\_json-\>\>'prediksi\_drone' \= '...\_Berat' AND hasil\_json-\>\>'status\_aktual' \= 'G1'

* **Valid?** Ya. PostgreSQL (Supabase) sangat kuat dalam *query* JSONB.  
* **Optimal?** Tidak.

**Risiko (Prinsip "TEPAT"):**

1. **Kinerja (Speed):** *Query* di dalam JSONB (bahkan dengan GIN index) akan selalu lebih lambat daripada *query* pada kolom terstruktur, terutama saat data log\_aktivitas\_5w1h kita mencapai jutaan baris.  
2. **Integritas (Integrity):** Jika Platform A (Frontend) salah mengirim *key* (misal: status\_aktual vs status\_akurat), data akan tetap tersimpan, namun *query* intelijen di Fase 5 akan **GAGAL** secara diam-diam. Matriks Kebingungan akan salah.

## **4\. Rekomendasi (Tindakan untuk Tim AI Agent)**

Untuk membuat arsitektur kita tidak hanya *valid* tetapi juga *optimal, cepat,* dan *tangguh* (robust), saya sangat merekomendasikan:

### **SARAN \#1 (Kritis \- Tim Backend)**

**Tugas: Refactor Tabel log\_aktivitas\_5w1h dan Service Terkait.**

1. **Modifikasi Skema DB:** Tambahkan **kolom terstruktur (first-class columns)** ke tabel log\_aktivitas\_5w1h untuk data yang paling sering di-*query*:  
   ALTER TABLE log\_aktivitas\_5w1h  
   ADD COLUMN IF NOT EXISTS prediksi\_drone\_status VARCHAR(50),  
   ADD COLUMN IF NOT EXISTS aktual\_lapangan\_status VARCHAR(50);

2. **Buat Index:** Tambahkan *index* B-tree pada kolom baru ini untuk *query* super cepat.  
   CREATE INDEX IF NOT EXISTS idx\_log\_aktivitas\_validasi  
   ON log\_aktivitas\_5w1h (prediksi\_drone\_status, aktual\_lapangan\_status);

3. **Refactor Service POST /log\_aktivitas:**  
   * Saat *service* menerima hasil\_json dari Platform A (Fase 4), *service* **WAJIB** mengekstrak (parse) data dari JSON tersebut...  
   * ...dan mengisinya ke kolom terstruktur yang baru:  
     * prediksi\_drone\_status \= hasil\_json.prediksi\_drone  
     * aktual\_lapangan\_status \= hasil\_json.status\_aktual  
       4\* Kolom hasil\_json tetap disimpan (sebagai arsip), tetapi tidak lagi digunakan untuk query Matriks Kebingungan.  
4. **Refactor Service GET /dashboard/teknis:**  
   * Ubah *query* Matriks Kebingungan (Fase 5\) dari *query* JSONB...  
   * ...menjadi query pada kolom baru yang sudah ter-indeks:  
     Contoh Query (Logika Baru):  
     SELECT ... WHERE prediksi\_drone\_status \= '...\_Berat' AND aktual\_lapangan\_status \= 'G1'

### **SARAN \#2 (Kritis \- Tim Frontend A)**

**Tugas: Validasi Kontrak Data hasil\_json.**

* Pastikan *payload* yang dikirim ke POST /log\_aktivitas **100% konsisten** dan TEPAT, menggunakan *key* yang sudah disepakati: prediksi\_drone dan status\_aktual.

### **SARAN \#3 (Frontend B & Manajemen)**

**Tugas: Tidak Ada.**

* Tim Frontend B (Dashboard) dan Manajemen hanya perlu menikmati API GET /dashboard/teknis yang sekarang jauh lebih cepat dan lebih andal setelah Saran \#1 diimplementasikan.

### **Kesimpulan Validasi**

Arsitektur API kita **SUDAH VALID**. Namun, skema database kita untuk "intelijen" (tabel log\_aktivitas\_5w1h) perlu dioptimalkan (Saran \#1) untuk memastikan **Kinerja (Skalabilitas)** dan **Akurasi (Prinsip "TEPAT")** jangka panjang.