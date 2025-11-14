# Keep-Alive Server Script
# Automatically restart server if it crashes

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🔄 AUTO-RESTART SERVER (Keep Alive Mode)" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

$maxRestarts = 5
$restartCount = 0
$startTime = Get-Date

while ($restartCount -lt $maxRestarts) {
    $restartCount++
    
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] " -NoNewline
    Write-Host "Starting server (Attempt $restartCount/$maxRestarts)..." -ForegroundColor Yellow
    
    # Kill any existing node processes
    taskkill /F /IM node.exe 2>&1 | Out-Null
    Start-Sleep -Seconds 1
    
    # Start server process
    $process = Start-Process -FilePath "node" -ArgumentList "index.js" -WorkingDirectory "D:\backend-keboen" -PassThru -NoNewWindow
    
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] " -NoNewline
    Write-Host "✅ Server started (PID: $($process.Id))" -ForegroundColor Green
    
    # Wait a bit for server to fully start
    Start-Sleep -Seconds 3
    
    # Monitor server health
    $checkInterval = 10 # seconds
    $consecutiveFailures = 0
    $maxConsecutiveFailures = 3
    
    while ($true) {
        Start-Sleep -Seconds $checkInterval
        
        # Check if process still running
        if ($process.HasExited) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] " -NoNewline
            Write-Host "❌ Server process exited (Exit Code: $($process.ExitCode))" -ForegroundColor Red
            break
        }
        
        # Health check
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 3 -UseBasicParsing
            $consecutiveFailures = 0
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ✓ Health check OK" -ForegroundColor DarkGreen
        }
        catch {
            $consecutiveFailures++
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] " -NoNewline
            Write-Host "⚠️  Health check failed ($consecutiveFailures/$maxConsecutiveFailures)" -ForegroundColor Yellow
            
            if ($consecutiveFailures -ge $maxConsecutiveFailures) {
                Write-Host "[$(Get-Date -Format 'HH:mm:ss')] " -NoNewline
                Write-Host "❌ Server not responding. Killing process..." -ForegroundColor Red
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                break
            }
        }
    }
    
    Write-Host "`n[$(Get-Date -Format 'HH:mm:ss')] Restarting in 3 seconds...`n" -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

$totalTime = ((Get-Date) - $startTime).TotalMinutes
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "❌ Max restart attempts reached ($maxRestarts)" -ForegroundColor Red
Write-Host "Total runtime: $([math]::Round($totalTime, 2)) minutes" -ForegroundColor Gray
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Please check server logs for errors." -ForegroundColor Yellow
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
