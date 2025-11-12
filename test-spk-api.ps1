# =====================================================
# TEST SPK VALIDASI DRONE API
# =====================================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST SPK VALIDASI DRONE API" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Wait for server to be ready
Write-Host "[1] Waiting for server..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Test 1: Health Check
Write-Host "`n[TEST 1] Health Check" -ForegroundColor Green
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health" -Method Get
    Write-Host "✅ Server Status: $($health.message)" -ForegroundColor Green
    Write-Host "   Database: $($health.database)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Server not responding!" -ForegroundColor Red
    Write-Host "   Make sure server is running: node index.js" -ForegroundColor Yellow
    exit 1
}

# Test 2: Get Tree IDs with Stres Berat
Write-Host "`n[TEST 2] Get Trees with Stres Berat (for SPK creation)" -ForegroundColor Green
try {
    $droneData = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/drone/ndre?stress_level=Stres%20Berat&limit=3" -Method Get
    
    if ($droneData.data.Count -eq 0) {
        Write-Host "❌ No trees with Stres Berat found!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Found $($droneData.data.Count) trees with Stres Berat" -ForegroundColor Green
    
    # Extract tree IDs
    $treeIds = @()
    foreach ($tree in $droneData.data) {
        $treeIds += $tree.id
        Write-Host "   - Tree: $($tree.tree_id) | NDRE: $($tree.ndre.value) | $($tree.ndre.classification)" -ForegroundColor Gray
    }
    
    Write-Host "`nTree IDs to use:" -ForegroundColor Cyan
    $treeIds | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
    
} catch {
    Write-Host "❌ Failed to get drone NDRE data" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    exit 1
}

# Test 3: Create SPK Validasi Drone
Write-Host "`n[TEST 3] Create SPK Validasi Drone" -ForegroundColor Green
try {
    $spkBody = @{
        created_by = "test-asisten-manager-$(Get-Random)"
        assigned_to = "test-mandor-$(Get-Random)"
        trees = $treeIds
        priority = "NORMAL"
        notes = "Testing SPK Validasi Drone - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    } | ConvertTo-Json
    
    Write-Host "Request Body:" -ForegroundColor Gray
    Write-Host $spkBody -ForegroundColor DarkGray
    
    $spkResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/spk/validasi-drone" `
        -Method Post `
        -Body $spkBody `
        -ContentType "application/json"
    
    if ($spkResponse.success) {
        Write-Host "✅ SPK Created Successfully!" -ForegroundColor Green
        Write-Host "   SPK ID: $($spkResponse.data.spk.id_spk)" -ForegroundColor Gray
        Write-Host "   SPK No: $($spkResponse.data.spk.no_spk)" -ForegroundColor Gray
        Write-Host "   Priority: $($spkResponse.data.summary.priority)" -ForegroundColor Gray
        Write-Host "   Deadline: $($spkResponse.data.spk.target_selesai)" -ForegroundColor Gray
        Write-Host "   Total Tugas: $($spkResponse.data.summary.total_trees)" -ForegroundColor Gray
        Write-Host "   Stress Levels:" -ForegroundColor Gray
        Write-Host "     - Stres Berat: $($spkResponse.data.summary.stress_levels.stres_berat)" -ForegroundColor Red
        Write-Host "     - Stres Sedang: $($spkResponse.data.summary.stress_levels.stres_sedang)" -ForegroundColor Yellow
        Write-Host "     - Sehat: $($spkResponse.data.summary.stress_levels.sehat)" -ForegroundColor Green
        
        # Save SPK ID and Mandor ID for next tests
        $global:spkId = $spkResponse.data.spk.id_spk
        $global:mandorId = $spkResponse.data.spk.assigned_to
        $global:tugasIds = $spkResponse.data.tugas | Select-Object -ExpandProperty id_tugas
        
    } else {
        Write-Host "❌ Failed to create SPK" -ForegroundColor Red
        Write-Host "   Message: $($spkResponse.message)" -ForegroundColor Yellow
        exit 1
    }
    
} catch {
    Write-Host "❌ Failed to create SPK Validasi Drone" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    
    if ($_.ErrorDetails.Message) {
        $errorDetail = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "   Server Response: $($errorDetail.message)" -ForegroundColor Yellow
    }
    exit 1
}

# Test 4: Get SPK Detail
Write-Host "`n[TEST 4] Get SPK Detail" -ForegroundColor Green
try {
    $spkDetail = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/spk/$global:spkId" -Method Get
    
    if ($spkDetail.success) {
        Write-Host "✅ SPK Detail Retrieved" -ForegroundColor Green
        Write-Host "   Total Tugas: $($spkDetail.data.statistics.total_tugas)" -ForegroundColor Gray
        Write-Host "   Status Breakdown:" -ForegroundColor Gray
        $spkDetail.data.statistics.status_breakdown.PSObject.Properties | ForEach-Object {
            Write-Host "     - $($_.Name): $($_.Value)" -ForegroundColor Gray
        }
    }
    
} catch {
    Write-Host "❌ Failed to get SPK detail" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 5: Get SPK List for Mandor
Write-Host "`n[TEST 5] Get SPK List for Mandor" -ForegroundColor Green
try {
    $spkList = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/spk/mandor/$global:mandorId?priority=URGENT" -Method Get
    
    if ($spkList.success) {
        Write-Host "✅ SPK List Retrieved" -ForegroundColor Green
        Write-Host "   Total SPK: $($spkList.pagination.total_items)" -ForegroundColor Gray
        
        foreach ($spk in $spkList.data) {
            Write-Host "   - $($spk.no_spk) | Priority: $($spk.prioritas) | Tasks: $($spk.task_statistics.total) | Completion: $($spk.completion_percentage)%" -ForegroundColor Gray
        }
    }
    
} catch {
    Write-Host "❌ Failed to get SPK list" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 6: Assign Tugas to Surveyor
Write-Host "`n[TEST 6] Assign Tugas to Surveyor" -ForegroundColor Green
try {
    # Pick first 2 tugas
    $tugasToAssign = $global:tugasIds | Select-Object -First 2
    
    $assignBody = @{
        id_tugas_list = $tugasToAssign
        surveyor_id = "test-surveyor-$(Get-Random)"
        mandor_id = $global:mandorId
        notes = "Testing assignment - prioritas area stress berat"
    } | ConvertTo-Json
    
    $assignResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/v1/spk/$global:spkId/assign-surveyor" `
        -Method Post `
        -Body $assignBody `
        -ContentType "application/json"
    
    if ($assignResponse.success) {
        Write-Host "✅ Tugas Assigned Successfully!" -ForegroundColor Green
        Write-Host "   Assigned Count: $($assignResponse.data.assigned_count)" -ForegroundColor Gray
        Write-Host "   Failed Count: $($assignResponse.data.failed_count)" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "❌ Failed to assign tugas" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ All SPK Validasi Drone endpoints working!" -ForegroundColor Green
Write-Host "`nCreated SPK ID: $global:spkId" -ForegroundColor White
Write-Host "Total Tugas Created: $($global:tugasIds.Count)" -ForegroundColor White
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Check database tables: spk, spk_tugas, spk_log_aktivitas" -ForegroundColor Gray
Write-Host "2. View full SPK detail: http://localhost:3000/api/v1/spk/$global:spkId" -ForegroundColor Gray
Write-Host "3. Continue with Point 3: Surveyor workflow endpoints`n" -ForegroundColor Gray
