#!/usr/bin/env pwsh
# Generate SSL/TLS Certificates for GodJira Production
# This script creates self-signed certificates for development/staging
# For production, use Let's Encrypt or your certificate authority

param(
    [ValidateSet('all', 'nginx', 'postgres', 'redis', 'client')]
    [string]$Component = 'all',
    
    [string]$Domain = 'godjira.local',
    
    [int]$Days = 365
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir

Write-Host "=== GodJira SSL Certificate Generator ===" -ForegroundColor Cyan
Write-Host "Component: $Component" -ForegroundColor Green
Write-Host "Domain: $Domain" -ForegroundColor Green
Write-Host "Validity: $Days days" -ForegroundColor Green
Write-Host ""

# Create SSL directories
$SslDirs = @(
    "$RootDir/docker/nginx/ssl",
    "$RootDir/docker/postgres/ssl",
    "$RootDir/docker/redis/ssl",
    "$RootDir/docker/ssl/client"
)

foreach ($dir in $SslDirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created directory: $dir" -ForegroundColor Yellow
    }
}

# Function to generate CA certificate
function New-CACertificate {
    param([string]$OutDir)
    
    Write-Host "Generating Certificate Authority (CA)..." -ForegroundColor Cyan
    
    $caKey = "$OutDir/ca.key"
    $caCert = "$OutDir/ca.crt"
    
    # Generate CA private key
    & openssl genrsa -out $caKey 4096 2>&1 | Out-Null
    
    # Generate CA certificate
    $subject = "/C=US/ST=State/L=City/O=GodJira/OU=IT/CN=GodJira CA"
    & openssl req -new -x509 -days $Days -key $caKey -out $caCert -subj $subject 2>&1 | Out-Null
    
    Write-Host "  ✓ CA Certificate: $caCert" -ForegroundColor Green
    Write-Host "  ✓ CA Key: $caKey" -ForegroundColor Green
}

# Function to generate server certificate
function New-ServerCertificate {
    param(
        [string]$Name,
        [string]$OutDir,
        [string]$CADir,
        [string]$CN
    )
    
    Write-Host "Generating $Name certificate..." -ForegroundColor Cyan
    
    $serverKey = "$OutDir/$Name.key"
    $serverCsr = "$OutDir/$Name.csr"
    $serverCert = "$OutDir/$Name.crt"
    $extFile = "$OutDir/$Name.ext"
    
    # Generate server private key
    & openssl genrsa -out $serverKey 2048 2>&1 | Out-Null
    
    # Generate certificate signing request
    $subject = "/C=US/ST=State/L=City/O=GodJira/OU=IT/CN=$CN"
    & openssl req -new -key $serverKey -out $serverCsr -subj $subject 2>&1 | Out-Null
    
    # Create extensions file
    @"
subjectAltName = DNS:$CN,DNS:localhost,IP:127.0.0.1
extendedKeyUsage = serverAuth
"@ | Out-File -FilePath $extFile -Encoding ASCII
    
    # Sign certificate with CA
    & openssl x509 -req -in $serverCsr -CA "$CADir/ca.crt" -CAkey "$CADir/ca.key" `
        -CAcreateserial -out $serverCert -days $Days -extfile $extFile 2>&1 | Out-Null
    
    # Copy CA cert to output directory
    Copy-Item "$CADir/ca.crt" "$OutDir/ca.crt" -Force
    
    # Clean up CSR and extensions file
    Remove-Item $serverCsr -Force
    Remove-Item $extFile -Force
    
    # Set proper permissions (read-only for keys)
    if ($IsLinux -or $IsMacOS) {
        chmod 600 $serverKey
        chmod 644 $serverCert
    }
    
    Write-Host "  ✓ Server Certificate: $serverCert" -ForegroundColor Green
    Write-Host "  ✓ Server Key: $serverKey" -ForegroundColor Green
}

# Check if OpenSSL is installed
try {
    $null = & openssl version
} catch {
    Write-Host "ERROR: OpenSSL is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Install OpenSSL:" -ForegroundColor Yellow
    Write-Host "  Windows: choco install openssl" -ForegroundColor Yellow
    Write-Host "  Linux: sudo apt-get install openssl" -ForegroundColor Yellow
    Write-Host "  macOS: brew install openssl" -ForegroundColor Yellow
    exit 1
}

# Generate certificates based on component
$caDir = "$RootDir/docker/ssl/ca"
if (!(Test-Path $caDir)) {
    New-Item -ItemType Directory -Path $caDir -Force | Out-Null
}

# Generate CA (needed for all components)
if (!(Test-Path "$caDir/ca.crt")) {
    New-CACertificate -OutDir $caDir
}

switch ($Component) {
    'all' {
        New-ServerCertificate -Name 'fullchain' -OutDir "$RootDir/docker/nginx/ssl" -CADir $caDir -CN $Domain
        New-ServerCertificate -Name 'server' -OutDir "$RootDir/docker/postgres/ssl" -CADir $caDir -CN 'postgres'
        New-ServerCertificate -Name 'redis' -OutDir "$RootDir/docker/redis/ssl" -CADir $caDir -CN 'redis'
        New-ServerCertificate -Name 'client' -OutDir "$RootDir/docker/ssl/client" -CADir $caDir -CN 'client'
        
        # Copy fullchain.pem and privkey.pem for nginx
        Copy-Item "$RootDir/docker/nginx/ssl/fullchain.crt" "$RootDir/docker/nginx/ssl/fullchain.pem" -Force
        Copy-Item "$RootDir/docker/nginx/ssl/fullchain.key" "$RootDir/docker/nginx/ssl/privkey.pem" -Force
        Copy-Item "$RootDir/docker/nginx/ssl/ca.crt" "$RootDir/docker/nginx/ssl/chain.pem" -Force
    }
    'nginx' {
        New-ServerCertificate -Name 'fullchain' -OutDir "$RootDir/docker/nginx/ssl" -CADir $caDir -CN $Domain
        Copy-Item "$RootDir/docker/nginx/ssl/fullchain.crt" "$RootDir/docker/nginx/ssl/fullchain.pem" -Force
        Copy-Item "$RootDir/docker/nginx/ssl/fullchain.key" "$RootDir/docker/nginx/ssl/privkey.pem" -Force
        Copy-Item "$RootDir/docker/nginx/ssl/ca.crt" "$RootDir/docker/nginx/ssl/chain.pem" -Force
    }
    'postgres' {
        New-ServerCertificate -Name 'server' -OutDir "$RootDir/docker/postgres/ssl" -CADir $caDir -CN 'postgres'
    }
    'redis' {
        New-ServerCertificate -Name 'redis' -OutDir "$RootDir/docker/redis/ssl" -CADir $caDir -CN 'redis'
    }
    'client' {
        New-ServerCertificate -Name 'client' -OutDir "$RootDir/docker/ssl/client" -CADir $caDir -CN 'client'
    }
}

Write-Host ""
Write-Host "=== Certificate Generation Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT:" -ForegroundColor Yellow
Write-Host "  - These are SELF-SIGNED certificates for development/staging" -ForegroundColor Yellow
Write-Host "  - For production, use Let's Encrypt or a trusted CA" -ForegroundColor Yellow
Write-Host "  - Keep private keys (.key files) secure and never commit to git" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Add .gitignore entries for SSL directories" -ForegroundColor White
Write-Host "  2. Review docker-compose.prod.yml for certificate paths" -ForegroundColor White
Write-Host "  3. Set environment variables (ENCRYPTION_KEY, JWT_SECRET, etc.)" -ForegroundColor White
Write-Host "  4. Run: docker-compose -f docker-compose.prod.yml up -d" -ForegroundColor White
Write-Host ""
