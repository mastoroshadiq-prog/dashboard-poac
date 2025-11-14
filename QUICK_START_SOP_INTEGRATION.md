# Quick Start - SOP Integration (5 Minutes)

## Step 1: Run SQL Migrations
1. Login to Supabase: https://wwbibxdhawlrhmvukovs.supabase.co
2. Go to SQL Editor
3. Copy-paste `sql/migration_001_sop_integration.sql` → Run
4. Copy-paste `sql/seed_001_sop_initial_data.sql` → Run

## Step 2: Verify
```sql
SELECT sop_code, sop_version, jenis_kegiatan, is_active FROM sop_master;
```
Expected: 1 row (SOP-VAL-001 v1.0)

## Step 3: Restart Backend
```powershell
pm2 restart backend-keboen
```

## Step 4: Test API
POST http://localhost:3000/api/v1/spk/validasi-drone

Check response includes:
- tree_location.n_baris
- tree_location.n_pokok
- sop_reference (if migration successful)

Done! 
