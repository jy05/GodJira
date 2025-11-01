# GodJira Backend - Quick Start Script
# Run this script to set up and start the GodJira backend

Write-Host "🚀 GodJira Backend - Quick Start" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Check if pnpm is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $pnpmVersion = pnpm --version
    Write-Host "✅ pnpm $pnpmVersion found" -ForegroundColor Green
} catch {
    Write-Host "❌ pnpm not found. Installing pnpm..." -ForegroundColor Red
    npm install -g pnpm
}

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
pnpm install

# Start PostgreSQL
Write-Host ""
Write-Host "🐘 Starting PostgreSQL database..." -ForegroundColor Yellow
docker-compose up -d postgres

Write-Host "Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Setup database
Write-Host ""
Write-Host "🗄️ Setting up database..." -ForegroundColor Yellow
Set-Location apps/api

# Generate Prisma Client
Write-Host "Generating Prisma Client..." -ForegroundColor Yellow
pnpm prisma generate

# Run migrations
Write-Host "Running database migrations..." -ForegroundColor Yellow
pnpm prisma migrate dev --name init

# Return to root
Set-Location ../..

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 GodJira Backend is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Available services:" -ForegroundColor Cyan
Write-Host "  - PostgreSQL: localhost:5432" -ForegroundColor White
Write-Host "  - PgAdmin: http://localhost:5050 (admin@godjira.local / admin123)" -ForegroundColor White
Write-Host ""
Write-Host "To start the API server:" -ForegroundColor Cyan
Write-Host "  cd apps/api" -ForegroundColor White
Write-Host "  pnpm dev" -ForegroundColor White
Write-Host ""
Write-Host "The API will be available at:" -ForegroundColor Cyan
Write-Host "  - API: http://localhost:3000" -ForegroundColor White
Write-Host "  - Swagger Docs: http://localhost:3000/api/docs" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to start the API server (or Ctrl+C to exit)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "🚀 Starting API server..." -ForegroundColor Green
Set-Location apps/api
pnpm dev
