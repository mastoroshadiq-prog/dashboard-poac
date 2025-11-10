# PERINTAH KERJA BACKEND - DUMMY DATA INJECTION

**Tanggal**: 10 November 2025  
**Untuk**: Tim AI Agent Backend  
**Dari**: Tim Frontend  
**Prioritas**: MEDIUM  
**Estimasi Waktu**: Analisis + Eksekusi oleh AI Agent  

---

## 📋 EXECUTIVE SUMMARY

Frontend telah mengimplementasikan **Interactive Drill-Down Dashboard** dengan Material 3 design. Untuk membuat dashboard lebih "hidup" dan realistis, diperlukan data dummy yang lebih bervariasi di database Supabase.

**CURRENT STATE**: Data di database masih sangat minim/statis  
**TARGET STATE**: Database terisi dengan data realistic untuk demo/testing  
**APPROACH**: Tim AI Agent Backend menganalisis skema existing dan inject dummy data yang sesuai  

---

## 🎯 BUSINESS REQUIREMENTS

### 1. **SOP Compliance Enhancement**

**REQUIREMENT:**
Dashboard menampilkan drill-down detail kepatuhan SOP yang breakdown menjadi:
- Item yang **Compliant** (5-7 items)
- Item yang **Non-Compliant** (3-5 items)
- Item yang **Partially Compliant** (2-3 items opsional)

**DATA YANG DIBUTUHKAN:**
```
COMPLIANT ITEMS:
- Personal Hygiene (score: 95%)
- Equipment Sanitasi (score: 88%)
- Dokumentasi Kerja (score: 92%)
- Penggunaan Masker (score: 96.5%)
- Hand Washing Protocol (score: 90%)

NON-COMPLIANT ITEMS:
- Waktu Istirahat (score: 45%, reason: "Sering melebihi waktu")
- Penggunaan APD (score: 60%, reason: "Tidak lengkap menggunakan APD")
- Kebersihan Area Kerja (score: 70%, reason: "Perlu peningkatan shift malam")
- Pelaporan Insiden (score: 55%, reason: "Keterlambatan >24 jam")
- Maintenance Schedule (score: 72%, reason: "Terlambat 1-2 hari")
```

**API EXPECTATION:**
```json
GET /api/v1/dashboard/kpi-eksekutif
{
  "sop_compliance_breakdown": {
    "compliant_items": [{"name": "...", "score": 95.0}],
    "non_compliant_items": [{"name": "...", "score": 45.0, "reason": "..."}]
  }
}
```

---

### 2. **Historical Trend Data Enhancement**

**REQUIREMENT:**
Chart trend kepatuhan SOP perlu data historis minimal **6-8 minggu** (saat ini hanya 1 minggu).

**DATA YANG DIBUTUHKAN:**
```
Week 1 (7 minggu lalu): 72.5%
Week 2 (6 minggu lalu): 75.8%
Week 3 (5 minggu lalu): 71.2%
Week 4 (4 minggu lalu): 78.9%
Week 5 (3 minggu lalu): 76.3%
Week 6 (2 minggu lalu): 80.1%
Week 7 (1 minggu lalu): 77.6%
Week 8 (current): 81.4%
```

**PATTERN**: Trend naik dengan fluktuasi minor (±3-5%)

---

### 3. **Planning Tasks Breakdown (Validasi, APH, Sanitasi)**

**REQUIREMENT:**
Setiap kategori planning (Validasi, APH, Sanitasi) memiliki drill-down detail tasks dengan:
- Task name
- Status: "Done", "In Progress", "Pending"
- PIC (Person In Charge)
- Deadline (tanggal)
- Priority: "high", "medium", "low"

**DATA YANG DIBUTUHKAN:**

**VALIDASI (6 tasks):**
```
✅ Done (2 tasks):
  - Persiapan Dokumentasi Validasi | PIC: Ahmad Fauzi | Deadline: +5 days
  - Review Prosedur Validasi | PIC: Budi Santoso | Deadline: +7 days

🔄 In Progress (1 task):
  - Training Tim Validasi | PIC: Citra Dewi | Deadline: +10 days

⏳ Pending (3 tasks):
  - Implementasi Sistem Validasi | PIC: Dewi Lestari | Deadline: +14 days
  - Quality Check Validasi | PIC: Eko Prasetyo | Deadline: +21 days
  - Testing & Verification | PIC: Fitri Handayani | Deadline: +25 days
```

**APH (5 tasks):**
```
✅ Done (1 task):
  - Inspeksi Fasilitas APH | PIC: Gunawan | Deadline: +3 days

🔄 In Progress (2 tasks):
  - Update Prosedur Handling | PIC: Hendra Wijaya | Deadline: +8 days
  - Sertifikasi Tim APH | PIC: Indah Permata | Deadline: +12 days

⏳ Pending (2 tasks):
  - Audit Kepatuhan APH | PIC: Joko Susilo | Deadline: +15 days
  - Implementasi Cold Chain | PIC: Kartika Sari | Deadline: +20 days
```

**SANITASI (5 tasks):**
```
✅ Done (0 tasks)

🔄 In Progress (1 task):
  - Pelatihan Sanitasi Pekerja | PIC: Lukman Hakim | Deadline: +6 days

⏳ Pending (4 tasks):
  - Procurement Chemical Sanitasi | PIC: Maya Safitri | Deadline: +10 days
  - Setup Monitoring System | PIC: Nugroho | Deadline: +18 days
  - Deep Cleaning Schedule | PIC: Olivia | Deadline: +22 days
  - Dokumentasi SOP Sanitasi | PIC: Pandu Wicaksono | Deadline: +28 days
```

**API EXPECTATION:**
```json
GET /api/v1/dashboard/operasional
{
  "data_corong": {
    "validasi_tasks": [{"task_name": "...", "status": "Done", "pic": "...", "deadline": "2025-11-15"}],
    "aph_tasks": [...],
    "sanitasi_tasks": [...]
  }
}
```

---

### 4. **Blockers & Risk Indicators**

**REQUIREMENT:**
Setiap kategori planning memiliki **blockers/hambatan** yang sedang terjadi:
- Blocker description (teks)
- Severity: "high", "medium", "low"
- Status: "open", "resolved"

**DATA YANG DIBUTUHKAN:**

**VALIDASI BLOCKERS (3 items):**
```
⚠️ HIGH: Menunggu approval dari Quality Assurance Department
⚠️ MEDIUM: Kekurangan personel terlatih untuk validasi
⚠️ HIGH: Software validasi belum terintegrasi dengan sistem utama
```

**APH BLOCKERS (3 items):**
```
⚠️ HIGH: Equipment cold storage masih dalam proses procurement
⚠️ MEDIUM: Sertifikasi halal untuk produk APH pending
⚠️ LOW: Koordinasi dengan supplier untuk standar handling belum final
```

**SANITASI BLOCKERS (3 items):**
```
⚠️ MEDIUM: Budget untuk chemical sanitasi premium belum disetujui
⚠️ HIGH: Area renovasi menghalangi akses untuk deep cleaning
⚠️ MEDIUM: Training schedule bentrok dengan production deadline
```

**API EXPECTATION:**
```json
GET /api/v1/dashboard/operasional
{
  "data_corong": {
    "validasi_blockers": [{"description": "...", "severity": "high"}],
    "aph_blockers": [...],
    "sanitasi_blockers": [...]
  }
}
```

---

### 5. **Deadline & Risk Level Fields**

**REQUIREMENT:**
Field yang saat ini **NULL** perlu diisi:
- `deadline_validasi`: Tanggal deadline untuk validasi
- `deadline_aph`: Tanggal deadline untuk APH
- `deadline_sanitasi`: Tanggal deadline untuk sanitasi
- `risk_level_validasi`: "HIGH", "MEDIUM", "LOW"
- `risk_level_aph`: "HIGH", "MEDIUM", "LOW"
- `risk_level_sanitasi`: "HIGH", "MEDIUM", "LOW"

**SUGGESTED VALUES:**
```
deadline_validasi: +14 days dari sekarang
deadline_aph: +20 days dari sekarang
deadline_sanitasi: +28 days dari sekarang

risk_level_validasi: MEDIUM
risk_level_aph: HIGH
risk_level_sanitasi: MEDIUM
```

---

## 🎨 UI CONTEXT (Untuk Pemahaman)

Frontend telah membuat **2 interactive drill-down dialogs**:

1. **SOP Compliance Detail Dialog** - Trigger saat user klik gauge "Kepatuhan SOP"
   - Menampilkan breakdown compliant vs non-compliant items
   - Menampilkan score dan reason untuk setiap item
   - Menggunakan Material 3 Card design

2. **Planning Detail Dialog** - Trigger saat user klik gauge "Validasi", "APH", atau "Sanitasi"
   - Menampilkan daftar tasks dengan status (Done/In Progress/Pending)
   - Menampilkan PIC, deadline, dan priority
   - Menampilkan blockers jika ada
   - Menampilkan risk indicators

**SAAT INI:** Dialog sudah berfungsi dengan **hardcoded dummy data di frontend**  
**TARGET:** Dialog fetch data **real dari backend API**

---

## 🔧 TECHNICAL EXPECTATIONS

### Backend AI Agent Tasks:

1. ✅ **ANALYZE** existing database schema Supabase
   - Identifikasi tabel yang sudah ada
   - Identifikasi kolom yang perlu diisi
   - Identifikasi constraint dan relasi

2. ✅ **CREATE/MODIFY** schema jika diperlukan
   - Tambahkan tabel baru jika belum ada
   - Tambahkan kolom baru jika belum ada
   - Pastikan compliance dengan Supabase best practices

3. ✅ **INJECT** dummy data realistic
   - INSERT data sesuai requirements di atas
   - Gunakan tanggal relative (CURRENT_DATE + INTERVAL)
   - Pastikan data konsisten dan logical

4. ✅ **UPDATE** API endpoints
   - Modifikasi response format sesuai API EXPECTATION
   - Tambahkan query untuk fetch data baru
   - Maintain backward compatibility

5. ✅ **VERIFY** hasil
   - Test endpoint dengan Postman/curl
   - Pastikan data muncul di response
   - Dokumentasikan perubahan

---

## ✅ SUCCESS CRITERIA

Backend dianggap **SUKSES** jika:

1. ✅ Endpoint `GET /api/v1/dashboard/kpi-eksekutif` return field `sop_compliance_breakdown`
2. ✅ Endpoint `GET /api/v1/dashboard/kpi-eksekutif` return trend data minimal 6 minggu
3. ✅ Endpoint `GET /api/v1/dashboard/operasional` return field `validasi_tasks`, `aph_tasks`, `sanitasi_tasks`
4. ✅ Endpoint `GET /api/v1/dashboard/operasional` return field `validasi_blockers`, `aph_blockers`, `sanitasi_blockers`
5. ✅ Field deadline dan risk_level tidak NULL
6. ✅ Frontend dapat menampilkan drill-down dialog dengan data real (bukan hardcoded)

---

## � NOTES UNTUK TIM BACKEND

- **JANGAN** buat skema database dari nol - gunakan skema existing
- **SESUAIKAN** dengan naming convention database yang sudah ada
- **MAINTAIN** backward compatibility - jangan break existing API
- **DOKUMENTASIKAN** perubahan yang dilakukan
- **TEST** endpoint sebelum inform frontend

---

## 📞 COORDINATION

**Setelah Selesai:**
1. Inform frontend bahwa API sudah updated
2. Share response format baru (jika ada perubahan)
3. Koordinasi testing bersama
4. Deploy ke staging untuk verification

**Timeline Expected:**  
⏰ Analisis: 30 menit  
⏰ Implementation: 1-2 jam  
⏰ Testing: 30 menit  
⏰ **TOTAL**: 2-3 jam  

---

**Status**: ⏳ Pending AI Agent Backend Execution  
**Last Updated**: 10 November 2025  
**Version**: 2.0 (Requirement-Based)  
