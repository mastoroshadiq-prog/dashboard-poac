# Start Backend Server with PM2 (Production Process Manager)
# Run: .\start-server.ps1

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "🚀 Starting Backend Server with PM2..." -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan

# Check if PM2 is installed
Write-Host "`n🔍 Checking PM2 installation..." -ForegroundColor Yellow
if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  PM2 not installed. Installing globally..." -ForegroundColor Yellow
    npm install -g pm2 | Out-Null
    Write-Host "✅ PM2 installed successfully!" -ForegroundColor Green
} else {
    Write-Host "✅ PM2 already installed" -ForegroundColor Green
}

# Stop existing PM2 instances
Write-Host "`n🔍 Stopping existing server instances..." -ForegroundColor Yellow
pm2 stop backend-keboen 2>&1 | Out-Null
pm2 delete backend-keboen 2>&1 | Out-Null
taskkill /F /IM node.exe 2>&1 | Out-Null

Start-Sleep -Seconds 2
Write-Host "✅ Old processes cleaned up" -ForegroundColor Green

# Start server with PM2
Write-Host "`n🚀 Starting server with PM2..." -ForegroundColor Cyan
Write-Host "⚡ Benefits: Auto-restart on crash, keeps alive when terminal closes`n" -ForegroundColor Gray

pm2 start index.js --name backend-keboen

Start-Sleep -Seconds 3

# Show status
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "✅ SERVER STARTED SUCCESSFULLY" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""

pm2 status

Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "📚 Useful PM2 Commands:" -ForegroundColor Yellow
Write-Host "  pm2 logs                    - View live server logs"
Write-Host "  pm2 monit                   - Monitor CPU/memory usage"
Write-Host "  pm2 restart backend-keboen  - Restart server"
Write-Host "  pm2 stop backend-keboen     - Stop server"
Write-Host "  pm2 delete backend-keboen   - Remove from PM2"
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""
