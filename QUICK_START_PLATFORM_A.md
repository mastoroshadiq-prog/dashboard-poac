# 🚀 QUICK START: Platform A Integration

**2 Endpoint Baru untuk Aplikasi Flutter (Mandor)**

---

## ⚡ Setup Cepat (5 Menit)

### **1. Install Dependencies**
```bash
npm install
# jsonwebtoken sudah di-install otomatis
```

### **2. Generate JWT Secret**
```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copy output, lalu tambahkan ke .env
```

### **3. Update .env**
```env
# Tambahkan di file .env Anda
JWT_SECRET=<hasil-generate-di-atas>
JWT_EXPIRES_IN=7d
```

### **4. Create Table di Supabase**
```bash
# Buka Supabase Dashboard → SQL Editor
# Copy-paste content dari: sql/create_log_aktivitas_5w1h.sql
# Execute
```

### **5. Generate JWT Token untuk Testing**
```bash
node generate-jwt-token.js
```

Copy token yang di-generate, contoh:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **6. Start Server**
```bash
node index.js
```

### **7. Test Endpoints**
```bash
node test-platform-a.js
```

---

## 📱 Endpoint 1: Ambil Tugas Saya

**GET /api/v1/spk/tugas/saya**

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Params:**
- `page` (optional, default: 1)
- `limit` (optional, default: 100, max: 500)
- `status` (optional, default: 'BARU,DIKERJAKAN')

**PowerShell Test:**
```powershell
$token = "<your-jwt-token>"

Invoke-RestMethod `
  -Uri "http://localhost:3000/api/v1/spk/tugas/saya?page=1&limit=10" `
  -Method GET `
  -Headers @{ Authorization = "Bearer $token" }
```

---

## 📱 Endpoint 2: Upload Log Aktivitas (dengan Auto-Trigger!)

**POST /api/v1/spk/log_aktivitas**

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "log_aktivitas": [
    {
      "id_tugas": "uuid-tugas-dari-database",
      "id_npokok": "pohon-001",
      "timestamp_eksekusi": "2025-11-06T14:30:00Z",
      "gps_eksekusi": {
        "lat": -6.123456,
        "lon": 106.789012
      },
      "hasil_json": {
        "status_aktual": "G1",
        "tipe_kejadian": "VALIDASI_DRONE",
        "keterangan": "Pohon sakit berat"
      }
    }
  ]
}
```

**PowerShell Test:**
```powershell
$token = "<your-jwt-token>"
$body = @{
  log_aktivitas = @(
    @{
      id_tugas = "uuid-tugas-real"
      id_npokok = "pohon-001"
      timestamp_eksekusi = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
      gps_eksekusi = @{ lat = -6.123; lon = 106.789 }
      hasil_json = @{
        status_aktual = "G1"
        tipe_kejadian = "VALIDASI_DRONE"
        keterangan = "Test auto-trigger"
      }
    }
  )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod `
  -Uri "http://localhost:3000/api/v1/spk/log_aktivitas" `
  -Method POST `
  -Headers @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" } `
  -Body $body
```

---

## 🔧 Auto-Trigger Rules

| Status Aktual | Action | Work Order Created |
|---------------|--------|-------------------|
| **G1** | Pohon Sakit Berat | ✅ **APH** (Priority 1) |
| G2 | Pohon Sehat | ❌ No trigger |
| G3 | Butuh Sanitasi | ❌ No trigger (bisa di-enable) |
| **G4** | Butuh Sanitasi Urgent | ✅ **SANITASI** (Priority 1) |

---

## 📊 Verify Results

### **Check Log:**
```sql
SELECT * FROM log_aktivitas_5w1h 
ORDER BY created_at DESC 
LIMIT 10;
```

### **Check Auto-Created Work Orders:**
```sql
SELECT * FROM spk_tugas 
WHERE tipe_tugas IN ('APH', 'SANITASI') 
AND catatan LIKE '%Auto-generated%'
ORDER BY tanggal_dibuat DESC 
LIMIT 10;
```

### **Check Status Update:**
```sql
SELECT id_tugas, tipe_tugas, status_tugas 
FROM spk_tugas 
WHERE status_tugas = 'DIKERJAKAN'
ORDER BY updated_at DESC 
LIMIT 10;
```

---

## 🐛 Troubleshooting

### **Error: "Token tidak ditemukan"**
- Pastikan header `Authorization: Bearer <token>` ada
- Format harus persis: `Bearer <token>` (ada spasi)

### **Error: "Token expired"**
- Generate token baru: `node generate-jwt-token.js`
- Token default expire 7 hari

### **Error: "id_tugas tidak ditemukan"**
- Sesuaikan `id_tugas` di test script dengan data real di database
- Query tugas yang ada: `SELECT id_tugas FROM spk_tugas LIMIT 5;`

### **Server not responding**
- Pastikan server running: `node index.js`
- Check port 3000 tidak dipakai aplikasi lain

---

## 📚 Documentation

- **Full Docs:** `docs/VERIFICATION_PLATFORM_A_INTEGRATION.md`
- **API Routes:** `routes/spkRoutes.js`
- **Service Logic:** `services/spkService.js`
- **Auth Middleware:** `middleware/authMiddleware.js`

---

**Happy Coding!** 🚀
