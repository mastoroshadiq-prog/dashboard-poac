# **Panduan Implementasi AI-Assisted: Platform B (Dashboard Manajemen) v1.0**

UNTUK: Gemy (Project Manager) & Tim Developer  
DARI: Mitra AI Anda (Gemini)  
SUBJEK: Panduan komprehensif (Modul, Fitur MoSCoW, dan Prompt Taktis AI) untuk membangun Platform B (Aset 2.2).

## **1\. Filosofi & Pendekatan (Strategi "Jalan Sempit")**

Platform B (Dashboard Web) adalah **alat Kontrol (C)** utama dalam siklus POAC kita. Ini adalah "wajah" dari data kita untuk Manajemen (AM, GM, Wk. Dir, Finance) dan GIS.

* **Tujuan Strategis:** Mengubah Jejak Digital 5W1H (dari Platform A) menjadi intelijen yang dapat ditindaklanjuti. Ini adalah alat kita untuk **mengungkap "Misteri Produksi Stabil"** dan **membuktikan ROI** dari strategi mitigasi kita.  
* **Tech Stack (Sesuai MPP):** Kita akan menggunakan *stack* pengembangan cepat (Respons 72, 73):  
  * **Frontend:** Template **AdminLTE** (atau sejenisnya).  
  * **Grafik:** **ApexCharts.js** (untuk KPI/KRI, Corong, Speedometer).  
  * **Peta:** **Leaflet.js** \+ **Leaflet.markercluster** (untuk Peta GIS Interaktif).  
  * **Backend:** API yang ditenagai oleh database utama kita (PostgreSQL/Supabase \+ Firebase).  
* **Peran Anda (PM):** Anda adalah **"Penerjemah"** dan **"Penjaga Gerbang Scope"**.  
* **Peran AI Agent:** AI adalah **"Akselerator Kode"**.

## **2\. Pendekatan Prioritas: Metode MoSCoW (WAJIB)**

Ya, pertanyaan Anda tepat. Menggunakan **MoSCoW (Must, Should, Could, Won't)** adalah **wajib** untuk proyek ini. Mengingat sumber daya kita terbatas (*pro bono*) dan kita menghadapi resistensi politis (TBA), kita harus **kejam dalam memprioritaskan (ruthless prioritization)**.

* **M (Must Have):** Fitur Minimum (MVP) yang diperlukan untuk **membuktikan nilai** dan **memenangkan "Jalan Sempit"**. Tanpa ini, Dashboard gagal.  
* **S (Should Have):** Fitur penting yang sangat meningkatkan nilai, tapi bisa ditunda ke Fase 2 jika sumber daya terbatas.  
* **C (Could Have):** Fitur "Bagus untuk dimiliki" (Nice to have). Meningkatkan UI/UX tapi tidak esensial.  
* **W (Won't Have):** Fitur yang secara sadar kita **TIDAK** akan bangun di versi ini untuk menghindari *scope creep*.

## **3\. Modul Platform B (Struktur Fungsional)**

Kita akan membagi Platform B menjadi 5 Modul utama (Respons 70, 71):

1. **Modul 1: Dashboard Eksekutif (Tampilan 1\)** (Target: GM, Wk. Dir)  
2. **Modul 2: Dashboard Operasional (Tampilan 2\)** (Target: Asisten Manajer)  
3. **Modul 3: Dashboard Teknis (Tampilan 3\)** (Target: GIS, PM/Gemy)  
4. **Modul 4: Manajemen SPK (Penugasan)** (Target: AM, GIS)  
5. **Modul 5: Administrasi Pengguna & Aset** (Target: Admin/PM)

## **4\. Definisi & Prioritas Fitur (MoSCoW)**

Berikut adalah *breakdown* fitur untuk setiap modul, diprioritaskan menggunakan MoSCoW. Ini adalah **Product Backlog** Anda.

### **Modul 1: Dashboard Eksekutif (Tampilan 1 \- "Simple")**

* **M (Must Have):**  
  * M-1.1: Widget **"Lampu KRI (Key Risk Indicators)"** (Respons 70\) (misal: 3 Speedometer ApexCharts) untuk:  
    * KRI Kolaborasi (Lead Time Validasi $\\to$ Eksekusi).  
    * KRI Kepatuhan SOP (Work Order Selesai).  
  * M-1.2: Widget **"Grafik Tren KPI Biologis"** (Respons 70\) (Grafik Garis ApexCharts) untuk:  
    * Laju Insidensi Baru (G1 Terkonfirmasi) (Tren vs Target).  
    * Jumlah Pohon G4 (Belum Disanitasi) (Tren vs Target).  
  * M-1.3: Widget **"Peta Risiko Aset (Heatmap)"** (Respons 70\) (Peta Leaflet).  
  * M-1.4: Filter Global berdasarkan **Estate** & **Tanggal**.  
* **S (Should Have):**  
  * S-1.1: Kemampuan untuk *drill-down* (klik) dari Heatmap ke Peta GIS Interaktif (Modul 2).  
* **W (Won't Have):**  
  * W-1.1: Peta 3D, kustomisasi *widget* oleh pengguna.

### **Modul 2: Dashboard Operasional (Tampilan 2 \- "Tepat")**

* **M (Must Have):**  
  * M-2.1: Widget **"Corong Alur Kerja (Funnel Chart)"** (Respons 70\) (ApexCharts). Menampilkan *bottleneck* (Target $\\to$ Validasi Selesai $\\to$ APH Selesai $\\to$ Sanitasi Selesai).  
  * M-2.2: Widget **"Papan Peringkat Kepatuhan Tim"** (Respons 70\) (Tabel HTML). Menampilkan (per Mandor/Tim): % WO Selesai, Rata2 Lead Time Validasi.  
  * M-2.3: Widget **"Peta GIS Interaktif"** (Respons 72).  
    * **WAJIB:** Menggunakan **Leaflet.js \+ Leaflet.markercluster** (Tuntunan Skalabilitas).  
    * **WAJIB:** Menampilkan 1.2jt pohon (di-cluster) dengan warna (M-K-H) dari kebun\_observasi & master\_standar\_vegetasi.  
  * M-2.4: Kemampuan **Klik Pohon** di peta untuk melihat histori 5W1H (dari log\_aktivitas\_5w1h).  
  * M-2.5: Filter per **Divisi** & **Blok**.  
* **S (Should Have):**  
  * S-2.1: Kemampuan **Ekspor Data ke CSV/Excel** (Tuntunan Interoperabilitas).  
* **C (Could Have):**  
  * C-2.1: Menampilkan foto bukti G4/Sanitasi langsung di *popup* peta.

### **Modul 3: Dashboard Teknis (Tampilan 3 \- "Peningkatan Bertahap")**

* **M (Must Have):**  
  * M-3.1: Widget **"Matriks Kebingungan (Confusion Matrix)"** (Respons 70).  
    * Menghitung % False Positives (Drone Kuning, Mandor G0) dan % False Negatives (Drone Hijau, Mandor G1).  
  * M-3.2: Widget **"Distribusi NDRE vs. Status Validasi (per UMH)"** (Respons 70\) (Histogram/Box Plot ApexCharts).  
* **S (Should Have):**  
  * S-3.1: Alat untuk **memperbarui master\_standar\_vegetasi (Tabel Aturan Klasifikasi UMH)** langsung dari UI, setelah menganalisis data (Tugas 3.4).

### **Modul 4: Manajemen SPK (Penugasan)**

* **M (Must Have):**  
  * M-4.1: Form sederhana untuk **Membuat SPK Header** (Respons 98).  
  * M-4.2: UI untuk **Menambah SPK Tugas** (Respons 98), termasuk memilih tipe\_tugas (APH, Sanitasi, dll) dan target (target\_json).  
  * M-4.3 (Integrasi Peta): Kemampuan untuk **memilih pohon di Peta GIS (Modul 2\)** dan menekan tombol **"Buat Work Order Sanitasi"** (Respons 71).  
* **S (Should Have):**  
  * S-4.1: UI untuk mengelola *template* SPK (misal: "Sensus Rutin Bulanan").

### **Modul 5: Administrasi Pengguna & Aset**

* **M (Must Have):**  
  * M-5.1: UI CRUD (Create, Read, Update, Delete) sederhana untuk master\_pihak (Manajemen Pengguna).  
  * M-5.2: UI untuk **menetapkan Peran & Wilayah Kerja** (Respons 94), misal: "Mandor A" $\\to$ Peran=MANDOR, Wilayah\_Kerja=Blok\_F10.  
* **S (Should Have):**  
  * S-5.1: UI CRUD untuk kebun\_n\_pokok (Manajemen Aset Pohon).  
  * S-5.2: UI CRUD untuk master\_ancak (Manajemen Aset Wilayah).

## **5\. Panduan Implementasi AI-Assisted (Langkah PM)**

Gunakan **"Master Priming Prompt" (MPP)** (Respons 80\) sebagai konteks AI Anda. Lalu, gunakan MoSCoW ini untuk mem-breakdown pekerjaan.

**LANGKAH 1: FOKUS "MUST HAVE" \- BANGUN FONDASI & MVP**

1. **PM ke AI:** "Gemy, (konteks MPP), saya perlu skema database PostgreSQL untuk Platform B. Gunakan skema dari optimalisasi\_skema\_db\_v1.md (Respons 101\) dan tambahkan tabel dashboard\_users serta tabel untuk Modul 4 & 5 (Manajemen SPK & Pengguna)."  
2. **PM ke AI:** "Gemy, (konteks MPP), saya perlu API Backend (misal: Node.js/Express) untuk CRUD semua tabel tersebut. Terapkan **Tuntunan Keamanan (Validasi Server-Side)** dan **Skalabilitas (Paginasi)**."  
3. **PM ke AI:** "Gemy, (konteks MPP), saya perlu API Agregasi (GET /api/v1/kpi/lead\_time) untuk **Fitur M-1.1 (Lampu KRI)**."  
4. **PM ke AI:** "Gemy, (konteks MPP), saya mengerjakan Dashboard Web (Platform B) menggunakan AdminLTE, ApexCharts.js, dan Leaflet.js."  
5. **PM ke AI:** "Bantu saya buat **Fitur M-2.3 (Peta GIS)**. Berikan kode Leaflet.js yang menggunakan **Leaflet.markercluster** untuk memuat 50.000 titik GeoJSON dari API GET /api/v1/trees\_by\_blok?blok=G-14."  
6. **PM ke AI:** "Bantu saya buat **Fitur M-1.1 (Lampu KRI)**. Berikan kode ApexCharts.js untuk membuat 3 **'Speedometer'** (Radial Gauge Chart)."  
7. **PM ke AI:** "Bantu saya buat **Fitur M-2.1 (Corong Alur Kerja)**. Berikan kode ApexCharts.js untuk membuat **'Funnel Chart'**."  
8. *(...lanjutkan untuk semua fitur "MUST HAVE"...)*

**LANGKAH 2: RILIS & UJI COBA (PILOT)**

* (Sesuai Tuntunan Implementasi, Respons 78, Fase 3.1) Luncurkan Dashboard MVP (hanya fitur "Must Have") ke 1 Divisi Pilot. Kumpulkan *feedback* dari AM.

**LANGKAH 3: ITERASI (PENINGKATAN BERTAHAP)**

* (Sesuai Respons 74, 75\) Gunakan *feedback* untuk memperbaiki *bug* atau UI.  
* **PM ke AI:** "Gemy, (konteks MPP), AM Pilot saya bilang *query* Peta (M-2.3) lambat. Ini adalah *query* SQL saya... Tolong bantu **optimalkan (review)** berdasarkan **Tuntunan Skalabilitas (Indexing)**."

**LANGKAH 4: BANGUN "SHOULD HAVE"**

* Setelah MVP stabil, baru mulai kerjakan fitur "Should Have".  
* **PM ke AI:** "Gemy, (konteks MPP), saya ingin menambahkan **Fitur S-2.1 (Ekspor CSV)** ke Peta GIS (Modul 2\) saya..."