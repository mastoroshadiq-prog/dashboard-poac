# 🔥 CRITICAL ISSUE: Flutter App Errors After Backend Restart

**Date:** 13 November 2025, 16:30 WIB  
**Status:** 🔴 URGENT - Server keeps stopping after restart  
**Impact:** HIGH - Frontend completely blocked

---

## 🐛 **Problem Description**

Setiap kali backend direstart, Flutter app menampilkan error:

```
❌ [ValidationService] Error fetching confusion matrix: ClientException: Failed to  
   fetch, uri=http://localhost:3000/api/v1/validation/confusion-matrix?

❌ [ValidationService] Error fetching field vs drone: ClientException: Failed to    
   fetch, uri=http://localhost:3000/api/v1/validation/field-vs-drone?

❌ [AnalyticsService] Error fetching anomaly detection: ClientException: Failed to  
   fetch, uri=http://localhost:3000/api/v1/analytics/anomaly-detection?

❌ [AnalyticsService] Error fetching mandor performance: ClientException: Failed to 
   fetch, uri=http://localhost:3000/api/v1/analytics/mandor-performance?
```

---

## 🔍 **Root Cause Analysis**

### **Timeline of Events:**

1. ✅ Backend code updated (e.g., recommendation text fixes)
2. ✅ Server restart executed (`taskkill /F /IM node.exe; node index.js`)
3. ✅ Server starts successfully
4. ✅ Server listens on port 3000
5. ⏱️ **~3-10 seconds pass**
6. ❌ **Flutter app hits endpoints** (polling/retry mechanism)
7. ❌ **Server STOPS/CRASHES** (no error logged!)
8. ❌ Flutter gets `ClientException: Failed to fetch`
9. 🔄 Cycle repeats...

### **Possible Causes:**

#### **Hypothesis 1: Terminal Auto-Exit** ⭐ **MOST LIKELY**
```powershell
# When starting server in background:
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\backend-keboen; node index.js" -WindowStyle Minimized
```

**Problem:** Terminal window closes after a while, killing node process.

**Evidence:**
- Server starts OK
- No crash errors in logs
- Process just "disappears"
- Exit code 1 (abnormal termination)

**Solution:** Use proper process manager (PM2, nodemon, or Windows Service)

---

#### **Hypothesis 2: Flutter Polling Overwhelming Server**
```
[2025-11-13T09:23:27.310Z] GET /api/v1/dashboard/ndre-statistics
[2025-11-13T09:23:27.314Z] GET /api/v1/spk/kanban
[2025-11-13T09:23:27.318Z] GET /api/v1/validation/confusion-matrix?
[2025-11-13T09:23:27.319Z] GET /api/v1/validation/field-vs-drone?
[2025-11-13T09:23:27.321Z] GET /api/v1/analytics/anomaly-detection?
[2025-11-13T09:23:27.322Z] GET /api/v1/analytics/mandor-performance?
```

**Problem:** Flutter app sends **6 simultaneous requests** every few seconds.

**Evidence:**
- All requests hit within 12ms window (timestamp: 27.310 → 27.322)
- Server logs show burst requests
- No rate limiting or connection pooling

**Impact:** Overwhelms server during startup/warmup period

**Solution:** 
- Add rate limiting
- Implement exponential backoff in Flutter
- Add request queue/debouncing

---

#### **Hypothesis 3: Unhandled Promise Rejection**
```javascript
// Potential issue in route handlers:
router.get('/confusion-matrix', async (req, res) => {
  // If error occurs here but not caught:
  const data = await someAsyncOperation(); // Throws error
  res.json({ data }); // Never reached
});
```

**Problem:** Async errors not properly caught → process crash

**Evidence:**
- No error logs before server stops
- Process exits with code 1

**Solution:** Add global error handlers

---

## 🛠️ **Immediate Solutions**

### **Solution 1: Install PM2 (Process Manager)** ⭐ **RECOMMENDED**

```powershell
# Install PM2 globally
npm install -g pm2

# Start server with PM2
pm2 start index.js --name backend-keboen

# Server will auto-restart on crash!
pm2 logs backend-keboen  # View logs
pm2 status              # Check status
pm2 restart backend-keboen  # Manual restart
```

**Benefits:**
- ✅ Auto-restart on crash
- ✅ Logs preserved
- ✅ Won't die when terminal closes
- ✅ Cluster mode support
- ✅ Monitor CPU/memory

---

### **Solution 2: Add Keep-Alive Script** ✅ **CREATED**

File: `keep-alive-server.ps1`

```powershell
# Run server with auto-restart
.\keep-alive-server.ps1
```

**Features:**
- Health check every 10 seconds
- Auto-restart if server dies
- Max 5 restart attempts
- Logs all events

---

### **Solution 3: Add Rate Limiting to Backend**

```javascript
// index.js - Add before routes
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 50, // Max 50 requests per 10s per IP
  message: { 
    success: false, 
    error: 'Too many requests, please slow down' 
  }
});

app.use('/api/', limiter);
```

**Install:**
```powershell
npm install express-rate-limit
```

---

### **Solution 4: Fix Flutter App Polling** 🎯 **FRONTEND MUST DO**

#### **Current (BAD):**
```dart
// Flutter app hits ALL endpoints simultaneously
Timer.periodic(Duration(seconds: 5), (timer) {
  fetchNDREStatistics();
  fetchKanban();
  fetchConfusionMatrix();
  fetchFieldVsDrone();
  fetchAnomalyDetection();
  fetchMandorPerformance();
  // 6 requests at once!
});
```

#### **Better (GOOD):**
```dart
// Add exponential backoff on error
int retryCount = 0;
int maxRetries = 3;

Future<void> fetchDataWithRetry() async {
  try {
    await fetchConfusionMatrix();
    retryCount = 0; // Reset on success
  } catch (e) {
    retryCount++;
    if (retryCount < maxRetries) {
      // Wait longer each retry: 2s, 4s, 8s
      await Future.delayed(Duration(seconds: 2 ^ retryCount));
      await fetchDataWithRetry();
    } else {
      // Show error to user after max retries
      showErrorDialog('Backend not responding');
    }
  }
}
```

#### **Best (RECOMMENDED):**
```dart
// Only fetch data when screen is active
class DashboardScreen extends StatefulWidget {
  @override
  void initState() {
    super.initState();
    // Fetch once on init
    _loadData();
  }
  
  Future<void> _loadData() async {
    setState(() => isLoading = true);
    
    try {
      // Sequential requests (not simultaneous)
      await fetchConfusionMatrix();
      await Future.delayed(Duration(milliseconds: 100));
      await fetchFieldVsDrone();
      await Future.delayed(Duration(milliseconds: 100));
      await fetchAnomalyDetection();
      // ...
    } catch (e) {
      // Handle error gracefully
      showSnackBar('Failed to load data. Pull to refresh.');
    } finally {
      setState(() => isLoading = false);
    }
  }
  
  // Add pull-to-refresh instead of auto-polling
  RefreshIndicator(
    onRefresh: _loadData,
    child: ListView(...)
  );
}
```

**Key Changes:**
- ✅ No auto-polling (only manual refresh)
- ✅ Sequential requests (not simultaneous)
- ✅ Exponential backoff on error
- ✅ User-controlled refresh (pull-to-refresh)

---

## 📊 **Request Pattern Analysis**

### **Current Pattern (PROBLEMATIC):**
```
Time      | Request
----------|------------------------------------------
00:00.000 | GET /api/v1/dashboard/ndre-statistics
00:00.004 | GET /api/v1/spk/kanban
00:00.008 | GET /api/v1/validation/confusion-matrix
00:00.009 | GET /api/v1/validation/field-vs-drone
00:00.011 | GET /api/v1/analytics/anomaly-detection
00:00.012 | GET /api/v1/analytics/mandor-performance
```
**Total: 6 requests in 12ms burst!**

### **Recommended Pattern:**
```
Time      | Request
----------|------------------------------------------
00:00.000 | GET /api/v1/spk/kanban
00:00.500 | GET /api/v1/validation/confusion-matrix
00:01.000 | GET /api/v1/validation/field-vs-drone
00:01.500 | GET /api/v1/analytics/anomaly-detection
00:02.000 | GET /api/v1/analytics/mandor-performance
00:02.500 | GET /api/v1/dashboard/ndre-statistics
```
**Total: 6 requests in 2.5s (staggered)**

---

## 🎯 **Action Items**

### **Backend Team (ME):**
- [x] ✅ Create keep-alive script
- [ ] ⏳ Install PM2 for production
- [ ] ⏳ Add rate limiting middleware
- [ ] ⏳ Add global error handler
- [ ] ⏳ Add request logging (response time tracking)

### **Frontend Team (URGENT!):**
- [ ] ❌ **STOP auto-polling** (causing server overload)
- [ ] ❌ **Implement exponential backoff**
- [ ] ❌ **Add manual refresh** (pull-to-refresh)
- [ ] ❌ **Stagger requests** (don't send all at once)
- [ ] ❌ **Handle connection errors gracefully**

---

## 🚨 **Critical Message to Frontend Team**

### **YOUR APP IS OVERWHELMING THE SERVER!**

**Evidence:**
1. 6 simultaneous requests every 5 seconds
2. No retry delay (instant retry on failure)
3. Polling continues even when server is down
4. Requests sent in 12ms burst

**Impact:**
- Server can't keep up with request volume
- Process crashes under load
- Backend dev frustrated with constant restarts
- Integration testing impossible

**What You MUST Change:**

1. **REMOVE auto-polling:**
   ```dart
   // ❌ DELETE THIS:
   Timer.periodic(Duration(seconds: 5), fetchAllData);
   ```

2. **ADD manual refresh:**
   ```dart
   // ✅ ADD THIS:
   RefreshIndicator(onRefresh: fetchAllData, child: ...)
   ```

3. **ADD exponential backoff:**
   ```dart
   // ✅ ADD THIS:
   if (response fails) {
     await Future.delayed(Duration(seconds: 2 ^ retryCount));
   }
   ```

4. **STAGGER requests:**
   ```dart
   // ✅ ADD THIS:
   await fetchConfusionMatrix();
   await Future.delayed(Duration(milliseconds: 500));
   await fetchFieldVsDrone();
   ```

---

## 📝 **Temporary Workaround**

While frontend fixes their polling:

**Use PM2 to keep server alive:**
```powershell
npm install -g pm2
pm2 start index.js --name backend-keboen
pm2 logs
```

**Or use keep-alive script:**
```powershell
.\keep-alive-server.ps1
```

**Backend will auto-restart** when Flutter app kills it! 🔄

---

## 🎉 **Success Criteria**

Server restart should NOT cause errors if:
- ✅ Frontend implements exponential backoff
- ✅ Frontend stops auto-polling
- ✅ Backend uses PM2 for auto-restart
- ✅ Rate limiting prevents overload

---

**Status:** 🔴 BLOCKING ISSUE  
**Priority:** P0 - CRITICAL  
**Owner:** Frontend Team MUST fix polling behavior  
**Workaround:** Backend uses PM2/keep-alive script  

*Last Updated: 13 November 2025, 16:30 WIB*
