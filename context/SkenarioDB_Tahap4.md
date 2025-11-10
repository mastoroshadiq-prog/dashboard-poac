# Skenario Database Model Kebun Tahap 4

# Skenario Pemodelan SOP Perkebunan

**Definisi
Standard Operating Procedure (SOP) Perkebunan** adalah sekumpulan pedoman atau tata cara baku yang
digunakan oleh perusahaan perkebunan kelapa sawit untuk memastikan setiap aktivitas operasional
dilakukan sesuai dengan standar teknis, hukum, dan sertifikasi (misalnya GAP, ISPO, RSPO).

- SOP berfungsi sebagai **acuan kerja** bagi tenaga kerja di lapangan dan staf manajemen.
- SOP menjamin **keseragaman proses** , **efisiensi kerja** , **kualitas hasil** , dan **kepatuhan regulasi**.
- Dalam perkebunan besar, SOP juga menjadi **dokumen audit** untuk menunjukkan bahwa
    pengelolaan kebun dilakukan secara berkelanjutan, ramah lingkungan, dan sesuai standar industri.

**Klasifikasi /Pengelompokan SOP**
Secara umum, SOP dalam perkebunan sawit dapat dikelompokkan dalam 8 kategori besar:

1. **SOP Pembukaan & Persiapan Lahan**
    - Survei & pemetaan lahan
    - Land clearing (pembersihan lahan)
    - Pembuatan blok, jalan, parit
2. **SOP Pembibitan**
    - Penerimaan benih
    - Pre-nursery & main nursery
    - Seleksi bibit
3. **SOP Penanaman**
    - Transportasi bibit ke lapangan
    - Penanaman sesuai jarak tanam standar
    - Pemupukan dasar
4. **SOP Pemeliharaan Tanaman**
    - Pemupukan rutin (TBM/TM)
    - Penyulaman bibit mati
    - Pengendalian gulma, hama, penyakit
    - Pemangkasan pelepah
5. **SOP Panen**
    - Kriteria matang panen
    - Rotasi panen
    - Pengangkutan ke TPH (Tempat Pengumpulan Hasil)
    - Sortasi buah
6. **SOP Pascapanen & Logistik**
    - Pengangkutan hasil panen ke PKS (Pabrik Kelapa Sawit)
    - Penyimpanan & pengiriman
    - Pengelolaan reject/afkir
7. **SOP Administrasi & Keuangan**
    - Pencatatan kegiatan lapangan
    - Absensi & premi tenaga kerja
    - Laporan produksi harian, mingguan, bulanan
8. **SOP Audit & Monitoring**
    - Monitoring produktivitas blok
    - Audit internal kepatuhan SOP
    - Pelaporan keberlanjutan (ISPO/RSPO)


**Tujuan Utama SOP Perkebunan Sawit**

- Menjamin **efektivitas & efisiensi** operasional.
- Menstandarkan prosedur kerja untuk **mengurangi kesalahan**.
- Menjadi dasar **pelatihan tenaga kerja**.
- Mendukung **akuntabilitas & transparansi** dalam pengelolaan kebun.
- Memenuhi **persyaratan sertifikasi** (ISPO, RSPO, GAP).
- Mendukung prinsip **sustainability** (ramah lingkungan & sosial).

**Struktur SOP (Level Pemahaman)**

1. **Level Proses (Workflow SOP)**
    Urutan fase besar, misalnya: _Pembukaan Lahan → Pembibitan → Penanaman → Pemeliharaan →_
    _Panen → Pascapanen → Administrasi → Audit_.
2. **Level Entitas (High-Level ERD Kandidat)**
    Entitas yang terkait SOP, misalnya: _Blok, Tanaman, SubTindakan, Tenaga Kerja, Hasil Panen_.
3. **Level Sub-Tindakan (Detail SOP)**
    Aktivitas detail yang diikat dengan SOP Referensi, misalnya:
       - FT01: Survei lahan (GAP-ISPO-001)
       - FT03: Pemupukan TBM (GAP-ISPO-021)
       - FT05: Panen TBS (GAP-ISPO-040)

**Contoh Catatan Operasional Harian Perkebunan**

```
Tanggal Blok Tindakan NamaTindakan SOP TenagaKerja Jumlah Hasil/Output Keterangan
2025-08-20 A01 ST01 Survei Lahan GAP-ISPO-001 Tim Surveyor 3 15 Ha disurvei Kondisi tanah rata, akses bagus
2025-08-20 A02 ST02 Land Clearing GAP-ISPO-002 Kontraktor 10 8 Ha dibersihkan Kayu dibawa ke TPH
2025-08-21 B01 ST03 Penanaman Bibit GAP-ISPO-010 Mandor Budi 6 1.200 bibit ditanam 95% bibit sehat
2025-08-21 B02 ST05 Pemupukan TBM GAP-ISPO-021 Mandor Sari 4 200 kg pupuk NPK Pupuk diaplikasi sesuai dosis
2025-08-21 C01 ST08 Panen TBS GAP-ISPO-040 Tim Panen 1 12 15.2 ton TBS Rotasi ke-3, kualitas buah bagus
2025-08-21 C01 ST09 Sortasi Buah GAP-ISPO-041 Tim Sortasi 3 14.8 ton lulus sortasi 0.4 ton reject (buah mentah/afkir)
```
**Penjelasan**

- **Tanggal** → kapan kegiatan dilakukan.
- **Blok** → lokasi kegiatan (misal: A01, B02, C01).
- **ID_SubTindakan** & **NamaSubTindakan** → lookup dari master SubTindakan.
- **ID_SOP** → referensi standar yang digunakan.
- **TenagaKerja** → siapa yang bertanggung jawab (mandor/tim/kontraktor).
- **JumlahPekerja** → tenaga kerja yang terlibat.
- **Hasil/Output** → hasil kegiatan (ha, jumlah bibit, ton TBS, dll).
- **Keterangan** → catatan tambahan lapangan.

**Data Contoh Pra-Pemodelan**

Contoh **data mentah** (dummy) agar mudah dipahami sebelum masuk ke desain model database.

**Entitas Sub-Tindakan (detail dalam tiap fase)**

```
ID_SubTindakan FaseTindakan (FK) NamaSubTindakan SOP_Referensi
ST01 FT01 Survei Lahan GAP-ISPO-
ST02 FT01 Land Clearing GAP-ISPO-
ST03 FT02 Penanaman Bibit GAP-ISPO-
ST04 FT03 Penyulaman GAP-ISPO-
ST05 FT03 Pemupukan TBM GAP-ISPO-
```

```
ID_SubTindakan FaseTindakan (FK) NamaSubTindakan SOP_Referensi
ST06 FT03 Pengendalian Gulma GAP-ISPO-
ST07 FT04 Pemangkasan Pelepah GAP-ISPO-
ST08 FT05 Panen TBS GAP-ISPO-
ST09 FT05 Sortasi Buah GAP-ISPO-
ST10 FT06 Penebangan Pohon Tua GAP-ISPO-
```
**Tipe_SOP**

```
ID_TipeSOP NamaTipeSOP Deskripsi
TS01 SOP Pembukaan & Persiapan Semua SOP tentang pembukaan lahan
TS02 SOP Pembibitan Semua SOP tentang pembibitan
TS03 SOP Penanaman Semua SOP tentang penanaman
TS04 SOP Pemeliharaan Tanaman Semua SOP pemeliharaan TBM & TM
TS05 SOP Panen SOP panen, sortasi, transportasi hasil
TS06 SOP Pascapanen & Logistik SOP handling pasca panen & distribusi
TS07 SOP Administrasi & Keuangan SOP pencatatan, pelaporan, keuangan
TS08 SOP Audit & Monitoring SOP audit internal, monitoring kebun
```
**Tipe_SOP_Versi**

```
ID_Versi ID_TipeSOP Versi From_Date Thru_Date Dok_URL
V001 TS05 v1.0 2024-01-15 2025-01-14 /dokumen/SOP_Panen_v1.pdf
V002 TS05 v2.0 2025-01-15 NULL /dokumen/SOP_Panen_v2.pdf
```
**SOP_Referensi**

```
ID_SOP ID_TipeSOP Nama_SOP
GAP-ISPO-040 TS05 Panen TBS
GAP-ISPO-041 TS05 Sortasi Buah
```
Dengan ini:

- Semua **SOP detail** (Panen TBS, Sortasi Buah) tetap mengacu ke **kategori SOP Panen (TS05)**.
- Kalau versi **dokumen besar** berubah, tetap tercatat di Tipe_SOP_Versi.
- Kalau nanti diperlukan, versi **dokumen detail** bisa dicatat di tabel SOP_Referensi_Versi.

**Desain Model SOP Perkebunan**
Untuk kepentingan digitalisasi (MIS/ERP), SOP dapat dimodelkan dalam entitas:

- **Tipe_SOP** → kelompok besar (kategori SOP).
- **SOP_Referensi** → daftar SOP detail.
- **SubTindakan** → aktivitas lapangan yang merujuk SOP tertentu.
- **Versi SOP (from_date, thru_date)** → histori perubahan SOP tetap terjaga.
**1. Tabel Sub Tindakan**

```
Kolom Tipe Data Keterangan
sub_tindakan_id INT (PK, Identity) Primary key
fase_tindakan_id INT (FK) Relasi ke FaseTindakanUtama
nama_sub VARCHAR(100) Sub-tindakan (contoh: Penyulaman, Pemupukan TBM, Panen TBS)
```

```
Kolom Tipe Data Keterangan
sop_referensi VARCHAR(50) Kode SOP atau dokumen referensi GAP/ISPO/RSPO
created_at DATETIME2 Tanggal pencatatan data
updated_at DATETIME2 Tanggal perubahan terakhir
```
**Tipe_SOP**

```
Kolom Tipe Data Keterangan
ID_TipeSOP VARCHAR(10) Primary Key, identitas unik tipe SOP (contoh: TS05)
Nama_TipeSOP VARCHAR(100) Nama kategori SOP (contoh: SOP Panen)
Deskripsi TEXT Penjelasan umum SOP kategori besar
```
**Tipe_SOP_Versi**

```
Kolom Tipe Data Keterangan
ID_Versi VARCHAR(15) Primary Key, identitas unik versi SOP (contoh: V001)
ID_TipeSOP VARCHAR(10) Foreign Key ke Tipe_SOP
Versi VARCHAR(10) Nomor versi (contoh: v1.0, v2.0)
Tgl_Versi DATE Tanggal dokumen disahkan
From_Date DATE Tanggal mulai berlaku
Thru_Date DATE Tanggal akhir berlaku (NULL = masih berlaku)
Dok_URL VARCHAR(255) Link ke dokumen SOP versi tertentu
Catatan TEXT Catatan revisi/perubahan isi SOP
```
**SOP_Referensi**

```
Kolom Tipe Data Keterangan
ID_SOP VARCHAR(20) Primary Key, identitas unik SOP (contoh: GAP-ISPO-040)
ID_TipeSOP VARCHAR(10) Foreign Key ke Tipe_SOP
Nama_SOP VARCHAR(100) Nama SOP detail (contoh: Panen TBS)
Deskripsi TEXT Ringkasan SOP detail
```
**SOP_Referensi_Versi** **_(opsional, jika tiap SOP detail juga punya versi)_**

```
Kolom Tipe Data Keterangan
ID_RefVersi VARCHAR(15) Primary Key, identitas unik versi SOP detail
ID_SOP VARCHAR(20) Foreign Key ke SOP_Referensi
Versi VARCHAR(10) Nomor versi (contoh: v1.0, v1.1, v2.0)
From_Date DATE Tanggal mulai berlaku
Thru_Date DATE Tanggal akhir berlaku (NULL = masih berlaku)
Dok_URL VARCHAR(255) Link dokumen digital SOP detail versi tertentu
Catatan TEXT Catatan perubahan (misalnya update regulasi, perbaikan teknis)
```

## =======================================================================================

Script DDL SQL Server
dengan tambahan **created_at** dan **updated_at** di semua tabel
=======================================================================================

-- ===========================================
-- Sub-Tindakan
-- ===========================================

CREATE TABLE SubTindakan (
sub_tindakan_id INT IDENTITY(1,1) PRIMARY KEY,
fase_besar_id INT NOT NULL,
nama_sub NVARCHAR(100) NOT NULL,
deskripsi NVARCHAR(255) NULL,
created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
updated_at DATETIME2 NULL,
CONSTRAINT FK_SubTindakan_FaseBesar FOREIGN KEY (fase_besar_id) REFERENCES
FaseBesar(fase_besar_id)
);

-- ===========================================
-- Master Data SOP Perkebunan
-- ===========================================

CREATE TABLE Tipe_SOP (
ID_TipeSOP VARCHAR(10) NOT NULL PRIMARY KEY, -- contoh: TS
Nama_TipeSOP VARCHAR(100) NOT NULL, -- contoh: SOP Panen
Deskripsi TEXT NULL -- penjelasan umum
);

CREATE TABLE Tipe_SOP_Versi (
ID_Versi VARCHAR(15) NOT NULL PRIMARY KEY, -- contoh: V
ID_TipeSOP VARCHAR(10) NOT NULL, -- FK ke Tipe_SOP
Versi VARCHAR(10) NOT NULL, -- contoh: v1.
Tgl_Versi DATE NOT NULL, -- tanggal disahkan
From_Date DATE NOT NULL, -- tanggal mulai berlaku
Thru_Date DATE NULL, -- NULL = masih berlaku
Dok_URL VARCHAR(255) NULL, -- link dokumen
Catatan TEXT NULL, -- catatan revisi
CONSTRAINT FK_TipeSOP FOREIGN KEY (ID_TipeSOP) REFERENCES Tipe_SOP(ID_TipeSOP)
);

CREATE TABLE SOP_Referensi (
ID_SOP VARCHAR(20) NOT NULL PRIMARY KEY, -- contoh: GAP-ISPO-
ID_TipeSOP VARCHAR(10) NOT NULL, -- FK ke Tipe_SOP
Nama_SOP VARCHAR(100) NOT NULL, -- contoh: Panen TBS
Deskripsi TEXT NULL, -- ringkasan SOP detail
CONSTRAINT FK_SOP_Tipe FOREIGN KEY (ID_TipeSOP) REFERENCES Tipe_SOP(ID_TipeSOP)
);

CREATE TABLE SOP_Referensi_Versi (
ID_RefVersi VARCHAR(15) NOT NULL PRIMARY KEY, -- contoh: RV
ID_SOP VARCHAR(20) NOT NULL, -- FK ke SOP_Referensi
Versi VARCHAR(10) NOT NULL, -- contoh: v1.
From_Date DATE NOT NULL, -- tanggal berlaku
Thru_Date DATE NULL, -- NULL = masih berlaku
Dok_URL VARCHAR(255) NULL, -- link dokumen
Catatan TEXT NULL, -- catatan revisi
CONSTRAINT FK_RefSOP FOREIGN KEY (ID_SOP) REFERENCES SOP_Referensi(ID_SOP)
);


