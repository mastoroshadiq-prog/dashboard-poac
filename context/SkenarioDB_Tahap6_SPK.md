# Skenario Database Model Kebun Tahap 6

# Skenario Pemodelan SPK

# Surat Perintah Kerja

## Dalam manajemen operasional perkebunan sawit, rantai hubungan antara SOP → Jadwal Operasional →

## SPK memang menjadi alur utama dalam memastikan kegiatan lapangan berjalan terukur, konsisten, dan

## terdokumentasi.

## Mari kita uraikan sedikit untuk memperjelas konteksnya:

## 1. SOP (Standard Operating Procedure)

## • Merupakan dokumen acuan utama yang menjelaskan apa yang harus dilakukan, bagaimana

## caranya, oleh siapa, kapan, dan dengan standar apa.

## • Contoh SOP di kebun sawit:

## • Panen : Kriteria matang panen, alat yang digunakan, waktu panen, dan cara pengangkutan

## TBS (Tandan Buah Segar).

## • Pemupukan : Jenis pupuk, dosis, frekuensi, dan tata cara aplikasi.

## • Penyemprotan : Jenis bahan kimia, rasio campuran, area yang disemprot, serta keamanan

## pekerja.

## SOP berfungsi sebagai pola dasar operasional agar seluruh kegiatan seragam dan bisa diaudit.

## 2. Penjadwalan Operasional

## • Ini adalah turunan langsung dari SOP , tetapi lebih bersifat manajerial dan dinamis.

## • Mengatur kapan setiap kegiatan dilakukan, di blok mana , dan oleh tim siapa.

## • Misalnya:

## • Blok A1 → Panen → Tanggal 10–11 November

## • Blok B2 → Pemupukan Urea → Tanggal 12–13 November

## Penjadwalan juga memperhatikan faktor cuaca, ketersediaan tenaga kerja, alat, dan input (pupuk, bahan

## kimia, BBM, dsb.).

## 3. SPK (Surat Perintah Kerja)

## • SPK adalah dokumen pelaksana teknis dari jadwal tersebut — sifatnya instruksi formal kepada

## mandor atau krani.

## • Berisi rincian:

## • Jenis pekerjaan (misal: “Pemupukan blok B2 dengan Urea 200 kg”)

## • Lokasi & waktu kerja

## • Tim pelaksana (nama pekerja / mandor)

## • Alokasi sumber daya (alat, bahan, kendaraan)

## • Target output (misal: 40 ha dalam 2 hari)

## SPK bisa juga menjadi dasar pengawasan dan pencatatan hasil kerja , yang nantinya masuk ke laporan

## harian atau sistem ERP kebun.

## Alur Konsep Hubungan dengan SOP

## SOP → Jadwal Operasional → SPK → Pelaksanaan & Laporan

## Dengan cara ini, semua aktivitas kebun bisa ditelusuri balik (traceable) , terukur , dan selaras dengan

## standar manajemen mutu (misalnya ISO 9001 atau ISPO/RSPO untuk sustainability).

## Alur Konsep Hubungan dengan Fase Besar

## fase_besar → sub_tindakan → jadwal_tindakan → SPK → eksekusi_tindakan


## Penjelasan singkat:

- **fase_besar** = fase umur tanaman (misal: pembibitan, vegetatif, produktif)
- **sub_tindakan** = aktivitas dalam fase (misal: penyiraman, pemupukan, panen)
- **jadwal_tindakan** = rencana waktu kegiatan
- **spk_tindakan** = dokumen perintah kerja yang menjabarkan _siapa melakukan apa, di mana, dan_

## dengan sumber daya apa

- **eksekusi_tindakan** = realisasi lapangan atas SPK

## Hubungan SPK dengan Eksekusi

## Karena 1 SPK bisa menghasilkan beberapa eksekusi (misalnya satu SPK panen dilakukan selama 3 hari atau

## oleh beberapa tim), maka perlu ditambahkan kolom referensi untuk id_spk di entitas eksekusi_tindakan.

## Ringkasan Alur Data

## Tahap Entitas Deskripsi

## 1 fase_besar Tahapan umur tanaman

## 2 sub_tindakan Aktivitas detail per fase

## 3 jadwal_tindakan Jadwal rencana kegiatan

## 4 spk_tindakan Surat perintah kerja (dokumen resmi pelaksanaan)

## 5 eksekusi_tindakan Hasil realisasi lapangan dari SPK

## Contoh Skenario

## Entitas Data Contoh

## fase_besar "Fase Produktif (umur 36–180 bulan)"

## sub_tindakan "Panen TBS"

## jadwal_tindakan "Panen blok B2 setiap 10 hari"

## spk_tindakan "SPK/2025/011 — Panen Blok B2, tanggal 10–11 November, Mandor: Joko"

## eksekusi_tindakan "Tanggal 10 Nov: 35 ton, Tanggal 11 Nov: 38 ton"

## =======================================================================================

## Script DDL SQL Server

## dengan tambahan created_at dan updated_at di semua tabel

## =======================================================================================

### -- ===========================================

### -- FASE BESAR & SUB TINDAKAN

### -- ===========================================

**CREATE TABLE** fase_besar (
id_fase_besar **NVARCHAR** ( 50 ) **DEFAULT** NEWID() **NOT NULL** ,
nama_fase **NVARCHAR** ( 100 ) **NOT NULL** ,
umur_mulai **INT NULL** ,
umur_selesai **INT NULL** ,
deskripsi **NVARCHAR** ( 255 ) **NULL** ,
created_at **DATETIME NOT NULL DEFAULT GETDATE** (),
updated_at **DATETIME NULL** ,
**CONSTRAINT** plant_pk_fase_besar **PRIMARY KEY** (id_fase_besar)
);


**CREATE TABLE** sub_tindakan (
id_sub_tindakan **NVARCHAR** ( 50 ) **DEFAULT** NEWID() **NOT NULL** ,
id_fase_besar **NVARCHAR** ( 50 ) **NULL** ,
nama_sub **NVARCHAR** ( 100 ) **NOT NULL** ,
deskripsi **NVARCHAR** ( 255 ) **NULL** ,
created_at **DATETIME NOT NULL DEFAULT GETDATE** (),
updated_at **DATETIME NULL** ,
**CONSTRAINT** plant_pk_sub_tindakan **PRIMARY KEY** (id_sub_tindakan)
);

### -- ===========================================

### -- JADWAL DAN EKSEKUSI

### -- ===========================================

**CREATE TABLE** jadwal_tindakan (
id_jadwal_tindakan **NVARCHAR** ( 50 ) **DEFAULT** NEWID() **NOT NULL** ,
id_tanaman **NVARCHAR** ( 50 ) **NULL** ,
id_sub_tindakan **NVARCHAR** ( 50 ) **NULL** ,
frekuensi **NVARCHAR** ( 50 ) **NOT NULL** , -- harian, mingguan, bulanan
interval_hari **INT NULL** , -- misal setiap 14 hari
tanggal_mulai **DATETIME NOT NULL DEFAULT GETDATE** (),
tanggal_selesai **DATE NULL** ,
created_at **DATETIME NOT NULL DEFAULT GETDATE** (),
updated_at **DATETIME NULL** ,
**CONSTRAINT** plant_pk_jadwal_tindakan **PRIMARY KEY** (id_jadwal_tindakan)
);

**CREATE TABLE** eksekusi_tindakan (
id_eksekusi_tindakan **NVARCHAR** ( 50 ) **DEFAULT** NEWID() **NOT NULL** ,
id_jadwal_tindakan **NVARCHAR** ( 50 ) **NULL** ,
tanggal_eksekusi **DATE NOT NULL** ,
hasil **NVARCHAR** ( 255 ) **NULL** ,
petugas **NVARCHAR** ( 100 ) **NULL** ,
catatan **NVARCHAR** ( 255 ) **NULL** ,
created_at **DATETIME NOT NULL DEFAULT GETDATE** (),
updated_at **DATETIME NULL** ,
**CONSTRAINT** plant_pk_eksekusi_tindakan **PRIMARY KEY** (id_eksekusi_tindakan)
);

-- ===========================================
-- SURAT PERINTAH KERJA (SPK)
-- ===========================================
**CREATE TABLE** spk_tindakan (
id_spk **NVARCHAR** ( 50 ) **DEFAULT** NEWID() **NOT NULL** ,
id_jadwal_tindakan **NVARCHAR** ( 50 ) **NULL** , -- acuan dari jadwal
nomor_spk **NVARCHAR** ( 100 ) **NOT NULL** , -- nomor dokumen SPK
tanggal_terbit **DATE NOT NULL** ,
tanggal_mulai **DATE NOT NULL** ,
tanggal_selesai **DATE NULL** ,
status **NVARCHAR** ( 50 ) **NOT NULL DEFAULT** 'DRAFT', -- DRAFT / DISETUJUI / SELESAI /
DIBATALKAN
penanggung_jawab **NVARCHAR** ( 100 ) **NULL** , -- misal: Asisten Kebun
mandor **NVARCHAR** ( 100 ) **NULL** , -- mandor pelaksana
lokasi **NVARCHAR** ( 255 ) **NULL** , -- bisa berupa blok, afdeling, dsb
uraian_pekerjaan **NVARCHAR** ( 255 ) **NULL** , -- deskripsi singkat isi SPK
catatan **NVARCHAR** ( 255 ) **NULL** ,
created_at **DATETIME NOT NULL DEFAULT GETDATE** (),
updated_at **DATETIME NULL** ,
**CONSTRAINT** plant_pk_spk_tindakan **PRIMARY KEY** (id_spk)
);


