@echo off
echo =====================================================
echo  RESTART BACKEND WITH FRESH MODULE CACHE
echo =====================================================
echo.
echo Stopping any running node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting backend server...
echo.
node index.js
