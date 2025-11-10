# ⚡ PHASE 1 - QUICK START

**Goal:** Add PANEN tracking in 15 minutes

---

## 🎯 3-STEP EXECUTION

### STEP 1: Run SQL (5 min)
```
1. Open: Supabase Dashboard → SQL Editor
2. Copy: sql/phase1_ALL_IN_ONE.sql (entire file)
3. Paste & RUN
4. Check: Should see "✅ PHASE 1 DATA SETUP COMPLETE!"
```

### STEP 2: Test Backend (3 min)
```powershell
# Terminal 1: Start server
node index.js

# Terminal 2: Run test
node test-panen-api.js
```

**Expected:** `🎉 ALL TESTS PASSED!`

### STEP 3: Commit (2 min)
```powershell
git add .
git commit -m "feat: implement PANEN tracking (Tahap 6 model)"
git push origin main
```

---

## ✅ SUCCESS CRITERIA

- [x] SQL verification shows: 1, 4, 1, 4, 1, 4, 8
- [x] Test shows: Total TBS ~895 ton
- [x] Test shows: Avg Reject ~2.16%
- [x] Test shows: 7/7 validations passed

---

## 🚨 QUICK TROUBLESHOOTING

**Error: "relation does not exist"**
→ Schema not deployed. Contact tim developer.

**Error: "permission denied"**
→ RLS issue. Run: `ALTER TABLE ops_eksekusi_tindakan DISABLE ROW LEVEL SECURITY;`

**Test shows: Total TBS = 0**
→ Re-run Step 1 completely.

---

## 📊 WHAT YOU GET

**API Response:** `GET /api/v1/dashboard/operasional`
```json
{
  "kpi_hasil_panen": {
    "summary": {
      "total_ton_tbs": 895.3,
      "avg_reject_persen": 2.16,
      "total_spk": 4,
      "total_executions": 8
    },
    "by_spk": [ 4 SPK documents with details ],
    "weekly_breakdown": [ weekly stats ]
  }
}
```

**Data Added:**
- 1 SOP category + 4 SOP details
- 1 fase + 4 sub-actions + 1 schedule
- 4 SPK documents
- 8 harvest executions (895.3 ton TBS)

---

## 📖 MORE INFO

- Full guide: `docs/PHASE1_EXECUTION_GUIDE.md`
- Summary: `docs/PHASE1_IMPLEMENTATION_SUMMARY.md`
- Architecture: `context/FINAL_COMPREHENSIVE_ANALYSIS_TAHAP_3_4_6.md`

---

**Time to execute:** ~15 minutes  
**Ready?** Let's GO! 🚀
