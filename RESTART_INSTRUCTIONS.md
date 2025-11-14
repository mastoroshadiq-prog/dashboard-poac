# 🔥 CRITICAL: Server Restart Required

## Problem
Backend code sudah di-fix, tapi Node.js masih load **OLD CODE dari memory cache**.

Frontend masih dapat error:
```
❌ TypeError: null: type 'Null' is not a subtype of type 'num'
❌ TypeError: null: type 'Null' is not a subtype of type 'String'
```

## Solution: FORCE RESTART

### Step 1: Kill ALL Node Processes
```powershell
# Di PowerShell (Run as Administrator):
taskkill /F /IM node.exe
```

Output expected:
```
SUCCESS: The process "node.exe" with PID XXXXX has been terminated.
```

### Step 2: Wait 3 seconds
```powershell
Start-Sleep -Seconds 3
```

### Step 3: Delete Node Module Cache (Optional tapi recommended)
```powershell
cd D:\backend-keboen
Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
```

### Step 4: Start Fresh Server
```powershell
cd D:\backend-keboen
node index.js
```

Expected output:
```
============================================================
🚀 BACKEND API - SISTEM SARAF DIGITAL KEBUN
============================================================
📡 Server running on: http://localhost:3000
✅ Supabase connection established
```

### Step 5: Verify Endpoints (Critical!)

Open browser atau Postman, test:

1. **Confusion Matrix:**
   ```
   GET http://localhost:3000/api/v1/validation/confusion-matrix
   ```
   
   Expected response:
   ```json
   {
     "success": true,
     "data": {
       "matrix": { ... },
       "metrics": { ... },
       "per_divisi": [
         {
           "divisi": "Divisi 1",
           "true_positive": 50,
           "false_positive": 10,
           "true_negative": 300,
           "false_negative": 10,
           "accuracy": 94.6
         },
         {
           "divisi": "Divisi 2",
           "true_positive": 68,
           "false_positive": 13,
           "true_negative": 445,
           "false_negative": 14,
           "accuracy": 95.0
         }
       ]
     }
   }
   ```
   
   **✅ Check:** `per_divisi` harus berisi 2 objects (BUKAN empty array!)

2. **Field vs Drone:**
   ```
   GET http://localhost:3000/api/v1/validation/field-vs-drone
   ```
   
   **✅ Check:** All strings non-empty, all numbers valid (no null)

3. **NDRE Statistics:**
   ```
   GET http://localhost:3000/api/v1/dashboard/ndre-statistics
   ```
   
   Expected:
   ```json
   {
     "success": true,
     "data": {
       "total_trees": 910,
       "distribution": {
         "stres_berat": 141,
         "stres_sedang": 763,
         "sehat": 6
       }
     }
   }
   ```

### Step 6: Restart Flutter App

Setelah backend verified:

1. **Stop Flutter app** (jangan hot reload!)
2. **Full restart** (Run > Start Without Debugging)
3. **Clear app cache** (optional):
   ```dart
   flutter clean
   flutter pub get
   flutter run
   ```

---

## Troubleshooting

### Problem: "taskkill: The process 'node.exe' not found"
**Solution:** Server sudah mati, langsung ke Step 4

### Problem: "Port 3000 already in use"
**Solution:**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill specific PID
taskkill /F /PID <PID_NUMBER>
```

### Problem: Frontend masih dapat null setelah restart
**Possible causes:**
1. Frontend masih gunakan cached response
2. Frontend hit WRONG URL (double /api/v1)
3. Server restart INCOMPLETE (cek Step 1-4 lagi)

**Debug:**
- Buka Chrome DevTools > Network tab
- Liat actual response dari endpoint
- Cek apakah per_divisi ada atau empty array

---

## Why This Happened?

Node.js menggunakan **module caching** untuk performance:
- Saat `require('./routes/validationRoutes')` pertama kali, code di-load ke RAM
- Edit file TIDAK otomatis reload code di RAM
- Butuh **full server restart** untuk clear cache

**Solusi jangka panjang:** Install `nodemon` untuk auto-reload:
```powershell
npm install -g nodemon
nodemon index.js  # Instead of: node index.js
```

---

**Last Updated:** 13 November 2025, 15:25 WIB  
**Status:** All fixes VERIFIED in source files, waiting server restart
