#!/usr/bin/env pwsh
# ZoaDex One-Click Deploy Script
# Deploys the full stack (PostGIS + Backend + Frontend) on Windows

param(
    [switch]$SkipBuild,
    [switch]$Stop,
    [int]$BackendPort = 8080,
    [int]$FrontendPort = 3000
)

$ErrorActionPreference = 'Stop'
$PROJECT_ROOT = $PSScriptRoot
$API_DIR = "$PROJECT_ROOT\zoadex-api"
$WEB_DIR = "$PROJECT_ROOT\zoadex-web"
$JAVA_HOME_PATH = "$env:USERPROFILE\.jdks\ms-21.0.10"

Write-Host "🧬 ZoaDex Deployment" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan

if ($Stop) {
    Write-Host "Stopping ZoaDex services..." -ForegroundColor Yellow
    Get-NetTCPConnection -LocalPort $BackendPort -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
    docker stop zoadex-postgres-1 -ErrorAction SilentlyContinue 2>$null
    Write-Host "✓ Services stopped" -ForegroundColor Green
    exit 0
}

# Step 1: Ensure Docker (PostgreSQL + PostGIS)
Write-Host "`n[1/5] 🐘 Starting PostgreSQL with PostGIS..." -ForegroundColor Cyan
Push-Location $PROJECT_ROOT
docker-compose up -d
Pop-Location
Start-Sleep -Seconds 5
Write-Host "✓ PostgreSQL running on port 5432" -ForegroundColor Green

# Step 2: Build Frontend
if (-not $SkipBuild) {
    Write-Host "`n[2/5] 🎷 Building frontend..." -ForegroundColor Cyan
    Push-Location $WEB_DIR
    npm install --silent
    npm run build
    Pop-Location
    Write-Host "✓ Frontend built to zoadex-web/dist/" -ForegroundColor Green
} else {
    Write-Host "`n[2/5] ⏩ Skipping frontend build (--SkipBuild)" -ForegroundColor Yellow
}

# Step 3: Build Backend
if (-not $SkipBuild) {
    Write-Host "`n[3/5] ☕ Building backend..." -ForegroundColor Cyan
    Push-Location $API_DIR
    $env:JAVA_HOME = $JAVA_HOME_PATH
    & .\mvnw.cmd package -DskipTests -B -q
    Pop-Location
    Write-Host "✓ Backend JAR built" -ForegroundColor Green
} else {
    Write-Host "`n[3/5] ⏩ Skipping backend build (--SkipBuild)" -ForegroundColor Yellow
}

# Step 4: Start Backend
Write-Host "`n[4/5] 🚀 Starting backend on port $BackendPort..." -ForegroundColor Cyan
# Kill existing instance
Get-NetTCPConnection -LocalPort $BackendPort -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 2

$env:JAVA_HOME = $JAVA_HOME_PATH
$jarFile = Get-ChildItem "$API_DIR\target\*.jar" | Where-Object { $_.Name -notlike '*-sources*' -and $_.Name -notlike '*-javadoc*' } | Select-Object -First 1
Start-Process -FilePath "$JAVA_HOME_PATH\bin\java.exe" -ArgumentList "-jar", $jarFile.FullName, "--server.port=$BackendPort" -WindowStyle Minimized
Write-Host "✓ Backend starting on http://localhost:$BackendPort" -ForegroundColor Green

# Step 5: Serve Frontend
Write-Host "`n[5/5] 🌐 Serving frontend on port $FrontendPort..." -ForegroundColor Cyan
# Use npx serve for static hosting
$distPath = "$WEB_DIR\dist"
Start-Process -FilePath "npx" -ArgumentList "serve", $distPath, "-l", $FrontendPort, "-s" -WindowStyle Minimized
Write-Host "✓ Frontend serving on http://localhost:$FrontendPort" -ForegroundColor Green

# Done
Write-Host "`n✅ ZoaDex is running!" -ForegroundColor Green
Write-Host "   Frontend: http://localhost:$FrontendPort" -ForegroundColor White
Write-Host "   Backend:  http://localhost:$BackendPort" -ForegroundColor White
Write-Host "   Database: localhost:5432 (zoadex/zoadex)" -ForegroundColor White
Write-Host "`n   To stop: .\deploy.ps1 -Stop" -ForegroundColor DarkGray
