# TEST M-4.2 via API - PowerShell Script
# Run in separate terminal AFTER starting server with `node index.js`

Write-Host "TEST M-4.2: Add Tugas ke SPK (via API)" -ForegroundColor Cyan
Write-Host ("=" * 60)

# Get latest SPK ID
Write-Host "`n1. Fetching latest SPK..." -ForegroundColor Yellow

# Replace with actual SPK ID from database or previous test
$id_spk = Read-Host "Enter SPK ID (or press Enter to use sample)"

if (-not $id_spk) {
    # Sample UUID - replace with actual from your spk_header table
    $id_spk = "36c5bf5a-2bc6-4319-a1bc-a0c134f65d3e"
    Write-Host "Using sample ID: $id_spk" -ForegroundColor Gray
}

# Get pelaksana IDs
Write-Host "`n2. Enter pelaksana IDs..." -ForegroundColor Yellow
$pelaksana1 = Read-Host "Pelaksana 1 ID (or press Enter for sample)"
$pelaksana2 = Read-Host "Pelaksana 2 ID (or press Enter for sample)"

if (-not $pelaksana1) {
    $pelaksana1 = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10"
    Write-Host "Using sample ID: $pelaksana1" -ForegroundColor Gray
}
if (-not $pelaksana2) {
    $pelaksana2 = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
    Write-Host "Using sample ID: $pelaksana2" -ForegroundColor Gray
}

# Prepare request body
$tugasArray = @(
    @{
        id_pelaksana = $pelaksana1
        tipe_tugas = "VALIDASI_DRONE"
        target_json = @{
            blok = "A1"
            id_pohon = @("pohon-001", "pohon-002")
        }
        prioritas = 1
    },
    @{
        id_pelaksana = $pelaksana2
        tipe_tugas = "APH"
        target_json = @{
            blok = "B1"
            id_pohon = @("pohon-003")
        }
        prioritas = 2
    }
)

$body = @{ tugas = $tugasArray } | ConvertTo-Json -Depth 10

Write-Host "`n3. Request Body:" -ForegroundColor Yellow
Write-Host $body

Write-Host "`n4. Posting to API..." -ForegroundColor Yellow
$url = "http://localhost:3000/api/v1/spk/$id_spk/tugas"

try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Body $body -ContentType "application/json"
    
    Write-Host "`nSUCCESS!" -ForegroundColor Green
    Write-Host ("=" * 60)
    Write-Host "`nResponse:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
    Write-Host "`nData berhasil disimpan ke spk_tugas!" -ForegroundColor Green
    Write-Host "Jumlah tugas: $($response.data.jumlah_tugas_ditambahkan)" -ForegroundColor Cyan
    
} catch {
    Write-Host "`nERROR!" -ForegroundColor Red
    Write-Host ("=" * 60)
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "`nResponse Body:" -ForegroundColor Yellow
        Write-Host $responseBody
    }
}

Write-Host "`n" + ("=" * 60)
Write-Host "Test selesai!" -ForegroundColor Cyan
