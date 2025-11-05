# TEST CURL untuk POST SPK Header
# PowerShell Script

Write-Host "TEST POST /api/v1/spk/" -ForegroundColor Cyan
Write-Host "============================================================"

# Pastikan server running di http://localhost:3000
$url = "http://localhost:3000/api/v1/spk/"

# Data yang akan di-POST
$requestBody = @{
    nama_spk = "SPK Validasi Drone Blok A1 - Test PowerShell"
    id_asisten_pembuat = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10"
    tanggal_target_selesai = "2025-11-30"
    keterangan = "Test insert dari PowerShell script"
} | ConvertTo-Json

Write-Host ""
Write-Host "Request Body:" -ForegroundColor Yellow
Write-Host $requestBody

Write-Host ""
Write-Host "Sending POST request..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Body $requestBody -ContentType "application/json"
    
    Write-Host ""
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "============================================================"
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
    Write-Host ""
    Write-Host "Data berhasil disimpan ke Supabase!" -ForegroundColor Green
    Write-Host "   ID SPK: $($response.data.id_spk)" -ForegroundColor Cyan
    Write-Host "   Status: $($response.data.status_spk)" -ForegroundColor Cyan
    Write-Host "   Tanggal Dibuat: $($response.data.tanggal_dibuat)" -ForegroundColor Cyan
    
} catch {
    Write-Host ""
    Write-Host "ERROR!" -ForegroundColor Red
    Write-Host "============================================================"
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "Response Body:" -ForegroundColor Yellow
        Write-Host $responseBody
    }
}

Write-Host ""
Write-Host "============================================================"
Write-Host "Test selesai!" -ForegroundColor Cyan
