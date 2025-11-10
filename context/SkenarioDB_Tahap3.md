# Skenario Database Model Kebun Tahap 3

# Skenario Pemodelan Fase Tindakan

**Definisi
Tindakan** adalah aktivitas operasional yang dilakukan terhadap tanaman sawit dari awal penanaman
hingga masa replanting.

- Setiap tindakan memiliki tujuan (misalnya meningkatkan pertumbuhan vegetatif, menjaga
    produktivitas, atau regenerasi).
- Tindakan dapat berupa **sub-tindakan rutin** (misalnya pemupukan, panen, pengendalian gulma)
    maupun **tindakan insidental** (misalnya penyulaman, pengendalian hama darurat).
- Setiap tindakan dicatat dalam sistem agar dapat dipantau, dievaluasi, dan diaudit (khususnya untuk
    kepatuhan GAP, ISPO, RSPO).

**Fase Tindakan**
Mengacu pada pedoman GAP kelapa sawit, siklus hidup tanaman dibagi menjadi fase besar, dan dalam
setiap fase terdapat tindakan utama:

1. **Pembibitan (nursery)**
    - Pre-nursery (±3 bulan).
    - Main nursery (±9–12 bulan).
    - Total ±12–15 bulan.
2. **Tanaman Belum Menghasilkan (TBM, umur 0–3 tahun)**
    - Fase pertumbuhan vegetatif.
    - Tindakan utama: pemupukan, penyulaman, pengendalian gulma, penanaman cover crop,
       pruning ringan.
3. **Tanaman Menghasilkan (TM, umur ±3–25 tahun)**
    - Fase produktif panen TBS (tandan buah segar).
    - Tindakan utama: panen, pemupukan produksi, pruning, pengendalian gulma & hama,
       perawatan jalan & TPH.
4. **Replanting (Peremajaan, umur >25 tahun)**
    - Produktivitas menurun → tanaman ditebang & ditanam ulang.
    - Tindakan utama: penebangan, pengolahan residu, penanaman cover crop baru, persiapan
       bibit baru.

**Standar Scheduling**
Praktik standar di perkebunan besar (estate management) adalah menjadwalkan tindakan secara
sistematis:

- **Harian:** Panen, patroli hama, pengawasan K3.
- **Mingguan:** Panen (2x/minggu), kontrol gulma ringan.
- **Bulanan:** Monitoring hama/penyakit, laporan kegiatan.
- **Triwulanan:** Pemupukan berdasarkan analisis tanah/daun.
- **Tahunan:** Pruning besar, perbaikan infrastruktur, audit ISPO/RSPO.
Contoh frekuensi:
- Panen: setiap 7–10 hari sekali.
- Pemupukan TBM: 3–4 kali/tahun.
- Pengendalian gulma: 6–8 kali/tahun.
- Pruning: 1–2 kali/tahun.

**Data Contoh Pra-Pemodelan**
Sebelum dimodelkan ke dalam entitas, data mentah diklasifikasikan sebagai berikut:

- **TipeTanaman** : Nursery, TBM, TM, Replanting.


- **FaseBesar** : Persiapan lahan, Penanaman bibit, Pemeliharaan TBM, Perawatan TM, Pemanenan,
    Replanting.
- **SubTindakan** : Pemupukan, Pengendalian gulma, Panen, Pruning, Penyulaman, Perawatan jalan, dll.
- **Jadwal** : Frekuensi, interval, tanggal mulai, tanggal selesai.
- **Eksekusi: Catatan pelaksanaan, hasil, petugas, catatan lapangan.**

Contoh **data mentah** (dummy) agar mudah dipahami sebelum masuk ke desain model database.

**1. Entitas TipeTanaman**
    **id_tipe nama_tipe deskripsi**
T01 TBM Tanaman Belum Menghasilkan (0–3 th)
T02 TM Tanaman Menghasilkan (3–25 th)
T03 Replanting Tanaman tua yang akan diremajakan
**2. Entitas Tanaman**
    **id_tanaman id_tipe id_deret nomor_urut tanggal_tanam varietas status**
P0001 T01 D001 1 2022-03-10 DxP Marihat hidup
P0002 T01 D001 2 2022-03-10 DxP Marihat hidup
P0100 T02 D005 100 2010-07-05 DxP Socfindo produktif
P0205 T03 D009 205 1995-08-22 DxP AVROS replant
**3. Entitas Tindakan Utama (6 fase besar)**
    **ID_FaseTindakan NamaFase Deskripsi**
FT01 Persiapan Lahan Land clearing, drainase, jalur tanam
FT02 Penanaman Bibit Penanaman bibit di lapangan
FT03 Pemeliharaan TBM Penyulaman, pemupukan, gulma, leguminosa
FT04 Perawatan TM Pemangkasan, pemupukan produksi, IPM
FT05 Pemanenan Panen TBS, sortasi, angkut
FT06 Replanting Penebangan tua, persiapan ulang
**4. Entitas Sub-Tindakan (detail dalam tiap fase)**
    **ID_SubTindakan FaseTindakan (FK) NamaSubTindakan SOP_Referensi**
ST01 FT01 Survei Lahan GAP-ISPO-
ST02 FT01 Land Clearing GAP-ISPO-
ST03 FT02 Penanaman Bibit GAP-ISPO-
ST04 FT03 Penyulaman GAP-ISPO-
ST05 FT03 Pemupukan TBM GAP-ISPO-
ST06 FT03 Pengendalian Gulma GAP-ISPO-
ST07 FT04 Pemangkasan Pelepah GAP-ISPO-
ST08 FT05 Panen TBS GAP-ISPO-
ST09 FT05 Sortasi Buah GAP-ISPO-
ST10 FT06 Penebangan Pohon Tua GAP-ISPO-


**Contoh Relasi Tanaman ↔ SubTindakan
ID_Tanaman SubTindakan (FK) TanggalEksekusi Petugas Catatan**
T001 ST04 (Penyulaman) 2023-06-15 Mandor A 3 bibit diganti
T003 ST08 (Panen TBS) 2025-08-19 Pemanen B 120 kg TBS
T004 ST10 (Replanting) 2025-07-01 Tim C 10 pohon ditebang

Dengan format ini:

- **TipeTanaman** jadi dasar siklus umur.
- **Tanaman** adalah wadah individu pohon.
- **FaseTindakanUtama** → payung kegiatan besar.
- **SubTindakan** → detail aktivitas sesuai SOP GAP/ISPO/RSPO.
- **Relasi Tanaman-SubTindakan** → catatan aktual di lapangan.

**Desain Model Fase Tindakan**

**1. Tabel TipeTanaman**
    **Kolom Tipe Data Keterangan**
id_tipe CHAR(3) Kode tipe tanaman (PK)
nama_tipe VARCHAR(50) Nama tipe tanaman (TBM, TM, Replanting)
deskripsi VARCHAR(200) Deskripsi tambahan
**2. Tabel Tanaman**
    **Kolom Tipe Data Keterangan**
id_tanaman CHAR(6) ID unik tanaman (PK)
id_tipe CHAR(3) FK ke TipeTanaman
id_deret CHAR(5) Kode deret tanaman (FK → tabel Deret bila ada)
nomor_urut INT Nomor urut dalam deret (1–143)
tanggal_tanam DATE Tanggal tanam
varietas VARCHAR(50) Varietas bibit (DxP Marihat, DxP Socfindo, dll)
status VARCHAR(20) Status tanaman (hidup, mati, produktif, replant)

**Tabel FaseTindakanUtama
Kolom Tipe Data Keterangan**
fase_tindakan_id INT (PK, Identity) Primary key
nama_fase VARCHAR(100) Nama fase besar (Persiapan lahan, Penanaman, TBM, TM, Panen, Replanting)
deskripsi VARCHAR(255) Deskripsi ringkas fase
created_at DATETIME2 Tanggal pencatatan data
updated_at DATETIME2 Tanggal perubahan terakhir


**Tabel SubTindakan
Kolom Tipe Data Keterangan**
sub_tindakan_id INT (PK, Identity) Primary key
fase_tindakan_id INT (FK) Relasi ke FaseTindakanUtama
nama_sub VARCHAR(100) Sub-tindakan (contoh: Penyulaman, Pemupukan TBM, Panen TBS)
sop_referensi VARCHAR(50) Kode SOP atau dokumen referensi GAP/ISPO/RSPO
created_at DATETIME2 Tanggal pencatatan data
updated_at DATETIME2 Tanggal perubahan terakhir

**Tabel JadwalTindakan (Perencanaan)
Kolom Tipe Data Keterangan**
jadwal_id INT (PK, Identity) Primary key
blok VARCHAR(20) Blok kebun (A1, B2, dst.)
tahun_tanam INT Tahun tanam tanaman di blok
umur_tanaman INT Umur tanaman (tahun)
sub_tindakan_id INT (FK) Relasi ke SubTindakan
frekuensi VARCHAR(50) Contoh: 2x/minggu, 4x/tahun
periode VARCHAR(100) Contoh: Jan, Apr, Jul, Okt atau “Senin & Kamis”
penanggung_jawab VARCHAR(100) Mandor/Asisten yang bertugas
catatan VARCHAR(255) Catatan tambahan
created_at DATETIME2 Tanggal pencatatan data
updated_at DATETIME2 Tanggal perubahan terakhir

**Tabel EksekusiTindakan (Realisasi Lapangan)
Kolom Tipe Data Keterangan**
pelaksanaan_id INT (PK, Identity) Primary key
tanaman_id INT (FK) Relasi ke Tanaman (pohon individu)
sub_tindakan_id INT (FK) Relasi ke SubTindakan
tanggal_eksekusi DATE Tanggal tindakan dilakukan
petugas VARCHAR(100) Nama petugas lapangan
hasil VARCHAR(100) Hasil tindakan (misal: kg TBS, jumlah bibit)
catatan VARCHAR(255) Catatan kondisi lapangan
created_at DATETIME2 Tanggal pencatatan data
updated_at DATETIME2 Tanggal perubahan terakhir

Dengan model ini:

- **Perencanaan** dicatat di JadwalTindakan.
- **Realisasi lapangan** dicatat di PelaksanaanTindakan.
- **Standarisasi teknis** terjaga lewat SubTindakan yang terkait ke SOP.
- **Tracking umur tanaman** lewat TipeTanaman + Tanaman.


## =======================================================================================

Script DDL SQL Server
dengan tambahan **created_at** dan **updated_at** di semua tabel
=======================================================================================

-- ===========================================
-- Master Data
-- ===========================================
CREATE TABLE TipeTanaman (
tipe_id INT IDENTITY(1,1) PRIMARY KEY,
nama_tipe NVARCHAR(100) NOT NULL,
deskripsi NVARCHAR(255) NULL,
created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
updated_at DATETIME2 NULL
);
CREATE TABLE Tanaman (
tanaman_id INT IDENTITY(1,1) PRIMARY KEY,
kode_tanaman NVARCHAR(50) NOT NULL,
tipe_id INT NOT NULL,
tanggal_tanam DATE NOT NULL,
lokasi NVARCHAR(100) NOT NULL,
status NVARCHAR(50) NOT NULL,
created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
updated_at DATETIME2 NULL,
CONSTRAINT FK_Tanaman_Tipe FOREIGN KEY (tipe_id) REFERENCES TipeTanaman(tipe_id)
);
-- ===========================================
-- Fase Besar & Sub-Tindakan
-- ===========================================
CREATE TABLE FaseBesar (
fase_besar_id INT IDENTITY(1,1) PRIMARY KEY,
nama_fase NVARCHAR(100) NOT NULL,
umur_mulai INT NULL,
umur_selesai INT NULL,
deskripsi NVARCHAR(255) NULL,
created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
updated_at DATETIME2 NULL
);
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
-- Jadwal dan Eksekusi
-- ===========================================
CREATE TABLE JadwalTindakan (
jadwal_id INT IDENTITY(1,1) PRIMARY KEY,
tanaman_id INT NOT NULL,
sub_tindakan_id INT NOT NULL,
frekuensi NVARCHAR(50) NOT NULL, -- harian, mingguan, bulanan
interval_hari INT NULL, -- misal setiap 14 hari
tanggal_mulai DATE NOT NULL,
tanggal_selesai DATE NULL,
created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
updated_at DATETIME2 NULL,
CONSTRAINT FK_Jadwal_Tanaman FOREIGN KEY (tanaman_id) REFERENCES Tanaman(tanaman_id),
CONSTRAINT FK_Jadwal_SubTindakan FOREIGN KEY (sub_tindakan_id) REFERENCES
SubTindakan(sub_tindakan_id)
);
CREATE TABLE EksekusiTindakan (
eksekusi_id INT IDENTITY(1,1) PRIMARY KEY,
jadwal_id INT NOT NULL,


tanggal_eksekusi DATE NOT NULL,
hasil NVARCHAR(255) NULL,
petugas NVARCHAR(100) NULL,
catatan NVARCHAR(255) NULL,
created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
updated_at DATETIME2 NULL,
CONSTRAINT FK_Eksekusi_Jadwal FOREIGN KEY (jadwal_id) REFERENCES JadwalTindakan(jadwal_id)
);


