# Test SPK Validasi Drone API dengan PowerShell
Write-Host "Testing SPK Validasi Drone API..." -ForegroundColor Cyan

# Step 1: Health check
Write-Host "`n[1] Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri 'http://localhost:3000/health' -Method GET
    Write-Host "✅ Server healthy" -ForegroundColor Green
} catch {
    Write-Host "❌ Server not running" -ForegroundColor Red
    exit 1
}

# Step 2: Get trees
Write-Host "`n[2] Getting trees with Stres Berat..." -ForegroundColor Yellow
try {
    $trees = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/drone/ndre?stress_level=Stres%20Berat&limit=3' -Method GET
    $treeIds = $trees.data | ForEach-Object { $_.id }
    Write-Host "✅ Found $($treeIds.Count) trees" -ForegroundColor Green
    $trees.data | ForEach-Object {
        Write-Host "   - $($_.tree_id): NDRE $($_.ndre.value) ($($_.ndre.classification))"
    }
} catch {
    Write-Host "❌ Failed to get trees: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Create SPK
Write-Host "`n[3] Creating SPK..." -ForegroundColor Yellow
$body = @{
    created_by = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
    assigned_to = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'
    trees = @($treeIds)
    priority = 'NORMAL'
    notes = 'Test from PowerShell script'
} | ConvertTo-Json

Write-Host "Request body:" -ForegroundColor Gray
Write-Host $body -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/v1/spk/validasi-drone' `
        -Method POST `
        -Body $body `
        -ContentType 'application/json'
    
    Write-Host "✅ SPK Created!" -ForegroundColor Green
    Write-Host "SPK ID: $($response.data.spk.id_spk)" -ForegroundColor Green
    Write-Host "Total Tugas: $($response.data.tugas.Count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create SPK" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
}
