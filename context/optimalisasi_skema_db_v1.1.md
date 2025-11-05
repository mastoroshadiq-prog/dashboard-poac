# **DOKUMEN PANDUAN: Optimalisasi Skema Database untuk Dashboard KPI v1.1**

## **1\. Konteks Strategis & Misi (MENGAPA)**

**Misi Kita:** Kita sedang membangun "Sistem Saraf Digital" untuk mengimplementasikan siklus **POAC (Planning, Organizing, Actuating, Control)**. Tujuannya adalah untuk beralih dari manajemen reaktif (BAU) ke manajemen risiko proaktif, yang dipandu oleh 3 Prinsip: **Simple, Tepat, dan Peningkatan Bertahap**.

**Tujuan Dokumen Ini:** Skema database kita saat ini **sangat kuat** dalam *Manajemen Aset* (Asset Management \- mengetahui Aset kita) dan *Manajemen Organisasi* (Organization Management \- mengetahui Staf kita). Namun, skema ini **belum memadai** untuk *Manajemen Kerja* (Work Management).

Kita tidak bisa menjawab pertanyaan KPI krusial seperti:

* "Berapa *lead time* dari SPK dibuat hingga eksekusi selesai?"  
* "Berapa *persen kepatuhan* Mandor terhadap SPK?"  
* "Berapa *false positive rate* dari deteksi Drone?"

Dokumen ini merinci 3 tabel transaksional **tambahan** yang diperlukan untuk "menghidupkan" skema Anda dan mengaktifkan Dashboard Monitoring KPI.

## **2\. Analisis Skema Saat Ini (Kekuatan & Celah)**

Skema Anda (disediakan dalam schema\_database.txt) sudah menyediakan fondasi yang luar biasa:

### **Kekuatan (Apa yang SUDAH BAIK):**

1. **Fondasi Aset (Jembatan Penerjemah):**  
   * kebun\_n\_pokok \+ master\_ancak secara sempurna mendefinisikan lokasi fisik setiap pohon (Blok, Baris, Pokok). Ini adalah inti dari prinsip **"Simple"** untuk Mandor.  
2. **Fondasi Intelijen (Drone):**  
   * kebun\_observasi adalah tempat ideal untuk menyimpan data mentah NDRE/NDVI (Sub-Proses 1.1).  
   * master\_standar\_vegetasi adalah implementasi teknis yang **sempurna** dari "Tabel Aturan Klasifikasi UMH" (Respons 68\) yang kita butuhkan untuk prinsip **"Peningkatan Bertahap"**.  
3. **Fondasi Organisasi (Struktur 'WHO'):**  
   * Rangkaian tabel master\_pihak, pihak\_peran, pihak\_posisi, dan posisi\_struktur sangat detail. Ini memungkinkan kita membangun **Akses Berbasis Peran** (Role-Based Access) yang dibutuhkan untuk Dashboard (Respons 71).  
   * Tabel tupoksi\_tipe dan posisi\_tupoksi mendefinisikan **kapabilitas konseptual** dari setiap peran.

### **Celah Kritis (Apa yang HILANG):**

Kita kehilangan "Mesin" yang menghubungkan Intelijen (Drone) dengan Aset (Pohon) dan Organisasi (Staf).

1. **CELAH \#1: Mesin Penugasan (SPK/Work Order)**  
   * **Masalah:** Tidak ada tabel untuk *membuat, menetapkan, dan melacak* SPK Digital (Surat Perintah Kerja). Kita tidak tahu "Tugas 1.5 & 1.6" (Organizing) sedang berjalan.  
2. **CELAH \#2: Mesin Pencatatan (Jejak Digital 5W1H)**  
   * **Masalah:** Ini adalah celah paling fatal. Tidak ada tabel untuk **menerima dan menyimpan input** dari Mandor di Aplikasi POAC (Actuating). Di mana kita menyimpan "Jejak Digital 5W1H" (Tugas 2.1, 2.3, 2.4)?  
   * **Dampak:** Tanpa data ini, kita tidak memiliki "C" (Control) dalam siklus POAC. Dashboard KPI kita akan kosong.

### **2.5. Ulasan Penting: Perbedaan tupoksi vs. spk (Justifikasi Penambahan)**

Tim developer mungkin bertanya: *"Kita sudah punya tabel tupoksi\_tipe dan posisi\_tupoksi. Mengapa kita perlu tabel spk\_ baru? Bukankah ini redundan?"*

Ini adalah pertanyaan arsitektural yang sangat penting. Jawabannya adalah: Keduanya memiliki **fungsi yang fundamental berbeda** dan **keduanya kita butuhkan** untuk membangun sistem yang cerdas.

**Analogi Sederhana: Restoran**

1. **Skema tupoksi Anda (yang ada) \= "Job Description" (Deskripsi Pekerjaan)**  
   * Ini adalah **Master Data Konseptual**.  
   * Tabel posisi\_tupoksi memberi tahu kita: "Posisi 'Koki' (posisi) *bertanggung jawab* untuk 'Memasak Steak' (tupoksi\_tipe)."  
   * Ini menjawab pertanyaan: "Seorang Mandor *secara umum BISA* melakukan apa?"  
2. **Skema spk\_ (yang kita tambah) \= "Bon Pesanan Dapur" (Work Order)**  
   * Ini adalah **Data Transaksional (Log)**.  
   * Tabel spk\_tugas memberi tahu kita: "Koki A (id\_pelaksana) *ditugaskan* (id\_tugas) untuk 'Memasak Steak' (tipe\_tugas) untuk 'Meja 5' (target\_json) pada 'Pukul 19:05' (timestamp)."

**Mengapa tupoksi Tidak Cukup:**

Tabel posisi\_tupoksi Anda hanya memberi tahu kita bahwa "Mandor (posisi) bisa melakukan Sensus (tupoksi)". Tabel ini **tidak memiliki kolom** untuk mencatat jutaan transaksi harian seperti:

* Kapan tugas spesifik ini diberikan?  
* Apa target spesifiknya (Pohon ID \#123 sampai \#145)?  
* Apa statusnya (Baru, Dikerjakan, Selesai)?  
* Kapan tepatnya (5W1H) tugas ini diselesaikan oleh Mandor A?  
* Apa hasil inputnya ({"status\_aktual": "G1", ...})?

Mencoba "menjejalkan" jutaan catatan transaksi SPK ke dalam tabel master posisi\_tupoksi akan **merusak total** arsitektur database Anda.

**Bagaimana Keduanya Bekerja Sama (Sinergi Cerdas):**

Kita TIDAK membuang skema tupoksi Anda. Kita **menggunakannya** untuk membuat proses *pembuatan* SPK (di Dashboard Manajemen, Platform B) menjadi lebih cerdas dan aman:

1. Saat Asisten Manajer (AM) membuat SPK baru (di Modul 4 Dashboard).  
2. Dia memilih tipe\_tugas (misal: "VALIDASI\_DRONE"). Daftar ini ditarik dari tabel **tupoksi\_tipe** Anda.  
3. Dia ingin menugaskan Mandor. Sistem secara cerdas **menggunakan skema Anda** (tabel posisi\_struktur, pihak\_posisi, posisi\_tupoksi) untuk memfilter dan **hanya menampilkan 5 Mandor di bawahnya yang memiliki 'tupoksi' 'VALIDASI\_DRONE'**.  
4. Dia memilih "Mandor A". Barulah sistem membuat *record* transaksional baru di spk\_tugas.

**Kesimpulan:** Skema tupoksi adalah **Buku Aturan (Rulebook)** kita. Skema spk\_ adalah **Buku Catatan Kerja (Logbook)** kita. Kita membutuhkan keduanya untuk membangun sistem POAC yang cerdas dan akuntabel.

## **3\. Optimalisasi Skema Database (Rekomendasi Teknis)**

Untuk menutup celah ini, kita perlu menambahkan **3 tabel transaksional baru** berikut.

### **3.1. Tabel spk\_header (Induk Penugasan)**

Tabel ini melacak SPK (Work Order) secara keseluruhan.

CREATE TABLE PLANTDB.dbo.spk\_header (  
    id\_spk nvarchar(50) COLLATE SQL\_Latin1\_General\_CP1\_CI\_AS DEFAULT newid() NOT NULL,  
    nama\_spk nvarchar(255) COLLATE SQL\_Latin1\_General\_CP1\_CI\_AS NOT NULL,  
    \-- (FK ke master\_pihak.id\_pihak) \- Siapa yang membuat SPK (misal: Asisten)  
    id\_asisten\_pembuat nvarchar(50) COLLATE SQL\_Latin1\_General\_CP1\_CI\_AS NOT NULL,  
    tanggal\_dibuat datetime DEFAULT getdate() NOT NULL,  
    tanggal\_target\_selesai date NULL,  
    status\_spk nvarchar(20) COLLATE SQL\_Latin1\_General\_CP1\_CI\_AS DEFAULT 'BARU' NOT NULL, \-- BARU, DIKERJAKAN, SELESAI  
    keterangan text COLLATE SQL\_Latin1\_General\_CP1\_CI\_AS NULL,  
      
    CONSTRAINT pk\_\_spk\_header PRIMARY KEY (id\_spk)  
);

### **3.2. Tabel spk\_tugas (Tugas Spesifik / Multi-Tugas)**

Ini adalah "jantung" dari penugasan (Organizing), yang mendukung asumsi kita (Respons 85\) bahwa 1 SPK bisa memiliki banyak tugas.

CREATE TABLE PLANTDB.dbo.spk\_tugas (  
    id\_tugas nvarchar(50) COLLATE SQL\_Latin1\_General\_CP1\_CI\_AS DEFAULT newid() NOT NULL,  
    \-- (FK ke spk\_header.id\_spk) \- Tugas ini bagian dari SPK mana  
    id\_spk nvarchar(50) COLLATE SQL\_Latin1\_General\_CP1\_CI\_AS NOT NULL,  
    \-- (FK ke master\_pihak.id\_pihak) \- Siapa yang ditugaskan (Mandor/Surveyor)  
    id\_pelaksana nvarchar(50) COLLATE SQL\_Latin1\_General\_CP1\_CI\_AS NOT NULL,  
      
    \-- (FK ke tupoksi\_tipe.kode\_tipe) \- Menghubungkan ke Buku Aturan Anda  
    tipe\_tugas nvarchar(15) COLLATE SQL\_Latin1\_General\_CP1\_CI\_AS NOT NULL, \-- 'VALIDASI\_DRONE', 'APH', 'SANITASI', 'PUPUK'  
    status\_tugas nvarchar(20) COLLATE SQL\_Latin1\_General\_CP1\_CI\_AS DEFAULT 'BARU' NOT NULL, \-- BARU, DIKERJAKAN, SELESAI, GAGAL  
      
    \-- Menyimpan target kerja (Blok, Baris, atau ID Pohon spesifik)  
    target\_json ntext COLLATE SQL\_Latin1\_General\_CP1\_CI\_AS NOT NULL,   
      
    prioritas int DEFAULT 2 NOT NULL, \-- 1=Tinggi, 2=Sedang, 3=Rendah  
      
    CONSTRAINT pk\_\_spk\_tugas PRIMARY KEY (id\_tugas),  
    CONSTRAINT fk\_\_spk\_tugas\_header FOREIGN KEY (id\_spk) REFERENCES PLANTDB.dbo.spk\_header(id\_spk),  
    CONSTRAINT fk\_\_spk\_tugas\_pelaksana FOREIGN KEY (id\_pelaksana) REFERENCES PLANTDB.dbo.master\_pihak(id\_pihak),  
    CONSTRAINT fk\_\_spk\_tugas\_tipe FOREIGN KEY (tipe\_tugas) REFERENCES PLANTDB.dbo.tupoksi\_tipe(kode\_tipe)  
);

### **3.3. Tabel log\_aktivitas\_5w1h (Jejak Digital \- Paling Kritis)**

Ini adalah tabel **paling penting** untuk Dashboard KPI. Setiap kali Mandor menekan "Simpan" di aplikasi (Actuating), satu baris (record) dibuat di sini.

CREATE TABLE PLANTDB.dbo.log\_aktivitas\_5w1h (  
    id\_log nvarchar(50) COLLATE SQL\_Latin1\_General\_CP1\_CI\_AS DEFAULT newid() NOT NULL,  
    \-- (FK ke spk\_tugas.id\_tugas) \- Aktivitas ini menyelesaikan tugas mana  
    id\_tugas nvarchar(50) COLLATE SQL\_Latin1\_General\_CP1\_CI\_AS NOT NULL,  
      
    \-- \== INTI 5W1H \==  
      
    \-- WHO (Siapa)  
    \-- (FK ke master\_pihak.id\_pihak) \- Siapa yang melakukan  
    id\_petugas nvarchar(50) COLLATE SQL\_Latin1\_General\_CP1\_CI\_AS NOT NULL,  
      
    \-- WHEN (Kapan)  
    timestamp\_eksekusi datetime DEFAULT getdate() NOT NULL, \-- Waktu HP/Server saat data disimpan  
      
    \-- WHERE (Di Mana)  
    \-- (FK ke kebun\_n\_pokok.id\_npokok) \- Pohon mana yang dikerjakan  
    id\_npokok nvarchar(50) COLLATE SQL\_Latin1\_General\_CP1\_CI\_AS NOT NULL,   
    gps\_eksekusi nvarchar(100) COLLATE SQL\_Latin1\_General\_CP1\_CI\_AS NULL, \-- "Lat,Long" dari GPS HP  
      
    \-- WHAT / WHY / HOW (Apa hasilnya)  
    \-- JSON untuk menyimpan semua hasil input:   
    \-- {"status\_aktual": "G1", "index\_gano": 1, "status\_miring": 0, "foto\_url": "...", "catatan": "..."}  
    hasil\_json ntext COLLATE SQL\_Latin1\_General\_CP1\_CI\_AS NULL,  
      
    \-- Status Sinkronisasi (Untuk logika Offline-First)  
    status\_sinkronisasi int DEFAULT 0 NOT NULL, \-- 0=Lokal, 1=Sudah Sinkron  
      
    CONSTRAINT pk\_\_log\_aktivitas PRIMARY KEY (id\_log),  
    CONSTRAINT fk\_\_log\_tugas FOREIGN KEY (id\_tugas) REFERENCES PLANTDB.dbo.spk\_tugas(id\_tugas),  
    CONSTRAINT fk\_\_log\_petugas FOREIGN KEY (id\_petugas) REFERENCES PLANTDB.dbo.master\_pihak(id\_pihak),  
    CONSTRAINT fk\_\_log\_pokok FOREIGN KEY (id\_npokok) REFERENCES PLANTDB.dbo.kebun\_n\_pokok(id\_npokok)  
);

## **4\. Alur Kerja Data POAC (Bagaimana Semuanya Terhubung)**

1. **(P) Plan:** Analis GIS (menggunakan kebun\_observasi & master\_standar\_vegetasi) mengidentifikasi Zona Kuning.  
2. **(O) Organize:** Manajer (menggunakan tupoksi\_tipe & posisi\_struktur) membuat data di spk\_header dan spk\_tugas.  
3. **(A) Actuate:** Aplikasi POAC mengunduh tugas $\\to$ Mandor eksekusi $\\to$ Aplikasi POAC **membuat data baru** di log\_aktivitas\_5w1h.  
4. **(C) Control:** **Dashboard KPI** Anda sekarang bisa **menjalankan *query*** untuk menghitung:  
   * **KPI Lead Time:** (AVG(log\_aktivitas\_5w1h.timestamp\_eksekusi) \- AVG(spk\_header.tanggal\_dibuat))  
   * **KPI Kepatuhan:** (COUNT(log\_aktivitas\_5w1h) / COUNT(target\_json dari spk\_tugas))  
   * **KPI Peningkatan Bertahap:** (SELECT hasil\_json FROM log\_aktivitas\_5w1h) vs (SELECT ndre FROM kebun\_observasi)

## **5\. Kesimpulan**

Tiga tabel baru ini adalah "Mesin" yang hilang. Mereka **mengaktifkan** skema aset Anda yang sudah kuat, mengubahnya dari database statis menjadi **"Sistem Saraf Digital"** yang hidup dan dapat diukur, yang sepenuhnya mendukung implementasi Dashboard KPI kita.