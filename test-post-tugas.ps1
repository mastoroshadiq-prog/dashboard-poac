# TEST SCRIPT untuk POST SPK Tugas (Batch)
# PowerShell Script - M-4.2

Write-Host "TEST POST /api/v1/spk/:id_spk/tugas (Batch)" -ForegroundColor Cyan
Write-Host "============================================================"

# PENTING: Ganti dengan ID SPK yang valid dari database Anda
# Cara mendapatkan ID SPK:
# 1. Buat SPK dulu dengan: powershell -ExecutionPolicy Bypass -File test-post-spk.ps1
# 2. Copy id_spk dari response
# 3. Paste di variable $idSpk di bawah ini

$idSpk = "5d557154-76a8-4801-b90a-5853279173bb"  # GANTI dengan ID SPK yang valid!

Write-Host ""
Write-Host "CATATAN: Pastikan ID SPK valid!" -ForegroundColor Yellow
Write-Host "ID SPK yang digunakan: $idSpk" -ForegroundColor Cyan
Write-Host ""

$url = "http://localhost:3000/api/v1/spk/$idSpk/tugas"

# Data tugas (batch) yang akan di-POST
$requestBody = @{
    tugas = @(
        @{
            id_pelaksana = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10"
            tipe_tugas = "VALIDASI_DRONE"
            target_json = @{
                blok = "A1"
                id_pohon = @(
                    "pohon-001",
                    "pohon-002",
                    "pohon-003"
                )
                keterangan = "Validasi hasil deteksi drone zona kuning"
            }
            prioritas = 1  # Tinggi
        },
        @{
            id_pelaksana = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
            tipe_tugas = "VALIDASI_DRONE"
            target_json = @{
                blok = "A2"
                id_pohon = @(
                    "pohon-004",
                    "pohon-005"
                )
                keterangan = "Validasi Blok A2"
            }
            prioritas = 2  # Sedang
        },
        @{
            id_pelaksana = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12"
            tipe_tugas = "APH"
            target_json = @{
                blok = "B1"
                id_pohon = @(
                    "pohon-006"
                )
                volume_target = "2L per pohon"
            }
            prioritas = 1  # Tinggi
        }
    )
} | ConvertTo-Json -Depth 10

Write-Host "Request Body (3 tugas):" -ForegroundColor Yellow
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
    Write-Host "   Jumlah tugas ditambahkan: $($response.data.jumlah_tugas_ditambahkan)" -ForegroundColor Cyan
    
    if ($response.data.tugas) {
        Write-Host ""
        Write-Host "Detail Tugas yang Ditambahkan:" -ForegroundColor Cyan
        $response.data.tugas | ForEach-Object {
            Write-Host "   - ID Tugas: $($_.id_tugas)" -ForegroundColor White
            Write-Host "     Tipe: $($_.tipe_tugas), Status: $($_.status_tugas), Prioritas: $($_.prioritas)" -ForegroundColor Gray
        }
    }
    
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
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Cek data di Supabase tabel 'spk_tugas'" -ForegroundColor White
Write-Host "2. Verifikasi semua tugas tercatat dengan status BARU" -ForegroundColor White
Write-Host "3. Lanjut ke M-5.1: GET Daftar Tugas" -ForegroundColor White
