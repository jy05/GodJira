#!/usr/bin/env pwsh
# Generate Secure Secrets for GodJira Production
# Creates encryption keys, JWT secrets, and database passwords

param(
    [switch]$All,
    [switch]$EncryptionKey,
    [switch]$JwtSecrets,
    [switch]$DatabasePassword,
    [switch]$RedisPassword,
    [string]$OutputFile = ".env.prod"
)

$ErrorActionPreference = "Stop"

Write-Host "=== GodJira Secret Generator ===" -ForegroundColor Cyan
Write-Host ""

# Function to generate random hex string
function New-HexSecret {
    param([int]$Bytes = 32)
    
    $randomBytes = New-Object byte[] $Bytes
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($randomBytes)
    $rng.Dispose()
    
    return [System.BitConverter]::ToString($randomBytes) -replace '-', '' | ForEach-Object { $_.ToLower() }
}

# Function to generate random base64 string
function New-Base64Secret {
    param([int]$Bytes = 32)
    
    $randomBytes = New-Object byte[] $Bytes
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($randomBytes)
    $rng.Dispose()
    
    return [Convert]::ToBase64String($randomBytes)
}

# Function to generate random password
function New-RandomPassword {
    param([int]$Length = 32)
    
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?"
    $password = -join ((1..$Length) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
    
    return $password
}

$secrets = @{}

if ($All -or $EncryptionKey) {
    Write-Host "Generating encryption key (AES-256)..." -ForegroundColor Yellow
    $secrets['ENCRYPTION_KEY'] = New-HexSecret -Bytes 32
    Write-Host "  ✓ ENCRYPTION_KEY generated" -ForegroundColor Green
}

if ($All -or $JwtSecrets) {
    Write-Host "Generating JWT secrets..." -ForegroundColor Yellow
    $secrets['JWT_SECRET'] = New-Base64Secret -Bytes 64
    $secrets['JWT_REFRESH_SECRET'] = New-Base64Secret -Bytes 64
    Write-Host "  ✓ JWT_SECRET generated" -ForegroundColor Green
    Write-Host "  ✓ JWT_REFRESH_SECRET generated" -ForegroundColor Green
}

if ($All -or $DatabasePassword) {
    Write-Host "Generating database password..." -ForegroundColor Yellow
    $secrets['POSTGRES_PASSWORD'] = New-RandomPassword -Length 32
    Write-Host "  ✓ POSTGRES_PASSWORD generated" -ForegroundColor Green
}

if ($All -or $RedisPassword) {
    Write-Host "Generating Redis password..." -ForegroundColor Yellow
    $secrets['REDIS_PASSWORD'] = New-RandomPassword -Length 32
    Write-Host "  ✓ REDIS_PASSWORD generated" -ForegroundColor Green
}

Write-Host ""

if ($secrets.Count -eq 0) {
    Write-Host "No secrets generated. Use -All or specify individual options:" -ForegroundColor Red
    Write-Host "  -All                  Generate all secrets" -ForegroundColor Yellow
    Write-Host "  -EncryptionKey       Generate encryption key" -ForegroundColor Yellow
    Write-Host "  -JwtSecrets          Generate JWT secrets" -ForegroundColor Yellow
    Write-Host "  -DatabasePassword    Generate database password" -ForegroundColor Yellow
    Write-Host "  -RedisPassword       Generate Redis password" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Example: .\generate-secrets.ps1 -All -OutputFile .env.prod" -ForegroundColor Cyan
    exit 1
}

# Display secrets
Write-Host "=== Generated Secrets ===" -ForegroundColor Green
Write-Host ""
foreach ($key in $secrets.Keys) {
    $maskedValue = $secrets[$key].Substring(0, [Math]::Min(8, $secrets[$key].Length)) + "..." + 
                   $secrets[$key].Substring([Math]::Max(0, $secrets[$key].Length - 8))
    Write-Host "$key=$maskedValue" -ForegroundColor White
}
Write-Host ""

# Save to file
if ($OutputFile) {
    $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $RootDir = Split-Path -Parent $ScriptDir
    $outputPath = Join-Path $RootDir $OutputFile
    
    if (Test-Path $outputPath) {
        Write-Host "WARNING: $OutputFile already exists" -ForegroundColor Yellow
        $overwrite = Read-Host "Overwrite? (y/N)"
        if ($overwrite -ne 'y' -and $overwrite -ne 'Y') {
            Write-Host "Aborted. Secrets not saved." -ForegroundColor Red
            exit 1
        }
    }
    
    # Create production .env file
    $envContent = @"
# GodJira Production Environment Variables
# Generated on: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss UTC")
# 
# CRITICAL: Keep this file secure and never commit to git!
# Add to .gitignore: .env.prod

# ===========================
# ENCRYPTION (REQUIRED)
# ===========================
$(if ($secrets.ContainsKey('ENCRYPTION_KEY')) { "ENCRYPTION_KEY=$($secrets['ENCRYPTION_KEY'])" } else { "# ENCRYPTION_KEY=<generate-with-script>" })

# ===========================
# JWT AUTHENTICATION (REQUIRED)
# ===========================
$(if ($secrets.ContainsKey('JWT_SECRET')) { "JWT_SECRET=$($secrets['JWT_SECRET'])" } else { "# JWT_SECRET=<generate-with-script>" })
$(if ($secrets.ContainsKey('JWT_REFRESH_SECRET')) { "JWT_REFRESH_SECRET=$($secrets['JWT_REFRESH_SECRET'])" } else { "# JWT_REFRESH_SECRET=<generate-with-script>" })

# ===========================
# DATABASE
# ===========================
POSTGRES_USER=godjira
$(if ($secrets.ContainsKey('POSTGRES_PASSWORD')) { "POSTGRES_PASSWORD=$($secrets['POSTGRES_PASSWORD'])" } else { "# POSTGRES_PASSWORD=<generate-with-script>" })
POSTGRES_DB=godjira_prod
POSTGRES_PORT=5432

# ===========================
# REDIS
# ===========================
$(if ($secrets.ContainsKey('REDIS_PASSWORD')) { "REDIS_PASSWORD=$($secrets['REDIS_PASSWORD'])" } else { "# REDIS_PASSWORD=<generate-with-script>" })
REDIS_PORT=6379

# ===========================
# APPLICATION
# ===========================
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
VITE_API_BASE_URL=https://yourdomain.com/api
VITE_WS_URL=wss://yourdomain.com

# ===========================
# EMAIL (SMTP)
# ===========================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM_NAME=GodJira
MAIL_FROM_EMAIL=noreply@yourdomain.com
MAIL_SECURE=true

# ===========================
# FILE UPLOAD
# ===========================
MAX_FILE_SIZE=26214400

# ===========================
# RATE LIMITING
# ===========================
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=100

# ===========================
# LOGGING
# ===========================
LOG_LEVEL=info
"@
    
    $envContent | Out-File -FilePath $outputPath -Encoding UTF8
    Write-Host "Secrets saved to: $outputPath" -ForegroundColor Green
    Write-Host ""
}

Write-Host "=== Important Security Notes ===" -ForegroundColor Yellow
Write-Host "  1. Keep $OutputFile secure and NEVER commit to version control" -ForegroundColor White
Write-Host "  2. Add '$OutputFile' to .gitignore" -ForegroundColor White
Write-Host "  3. For production, use a secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.)" -ForegroundColor White
Write-Host "  4. Rotate secrets periodically (every 90 days recommended)" -ForegroundColor White
Write-Host "  5. Use different secrets for each environment (dev/staging/prod)" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review and update $OutputFile with your SMTP settings" -ForegroundColor White
Write-Host "  2. Update FRONTEND_URL and domain settings" -ForegroundColor White
Write-Host "  3. Run: .\scripts\generate-certs.ps1 -All" -ForegroundColor White
Write-Host "  4. Run: docker-compose -f docker-compose.prod.yml up -d" -ForegroundColor White
Write-Host ""
