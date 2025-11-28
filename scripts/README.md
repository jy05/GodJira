# GodJira Security Scripts

This directory contains PowerShell scripts for generating security credentials and SSL/TLS certificates for GodJira deployment.

## Scripts Overview

### 1. `generate-secrets.ps1`

Generates cryptographically secure secrets for production deployment.

**Usage:**
```powershell
# Generate all secrets
.\scripts\generate-secrets.ps1 -All -OutputFile .env.prod

# Generate specific secrets
.\scripts\generate-secrets.ps1 -EncryptionKey -JwtSecrets
.\scripts\generate-secrets.ps1 -DatabasePassword -RedisPassword

# Output to custom file
.\scripts\generate-secrets.ps1 -All -OutputFile .env.staging
```

**Generates:**
- `ENCRYPTION_KEY` - AES-256 encryption key (64 hex chars)
- `JWT_SECRET` - JWT signing secret (base64)
- `JWT_REFRESH_SECRET` - JWT refresh token secret (base64)
- `POSTGRES_PASSWORD` - PostgreSQL password (32 chars)
- `REDIS_PASSWORD` - Redis password (32 chars)

**Output:** Creates `.env.prod` file with all secrets and configuration template.

**Security Notes:**
- Secrets are generated using `System.Security.Cryptography.RandomNumberGenerator`
- Encryption key is 256-bit (32 bytes) hex-encoded
- JWT secrets are 512-bit (64 bytes) base64-encoded
- Passwords include special characters for maximum security

---

### 2. `generate-certs.ps1`

Generates SSL/TLS certificates for Docker Compose and Kubernetes deployments.

**Usage:**
```powershell
# Generate all certificates
.\scripts\generate-certs.ps1 -All -Domain yourdomain.com

# Generate specific certificates
.\scripts\generate-certs.ps1 -Component nginx -Domain yourdomain.com
.\scripts\generate-certs.ps1 -Component postgres
.\scripts\generate-certs.ps1 -Component redis
.\scripts\generate-certs.ps1 -Component client

# Custom validity period
.\scripts\generate-certs.ps1 -All -Days 730  # 2 years
```

**Generates:**
- Certificate Authority (CA)
- Nginx TLS certificates (fullchain.pem, privkey.pem)
- PostgreSQL SSL certificates (server.crt, server.key)
- Redis TLS certificates (redis.crt, redis.key)
- Client certificates for database connections

**Output:** Creates certificates in:
- `docker/nginx/ssl/`
- `docker/postgres/ssl/`
- `docker/redis/ssl/`
- `docker/ssl/client/`
- `docker/ssl/ca/` (Certificate Authority)

**Security Notes:**
- Creates self-signed certificates for development/staging
- Uses 4096-bit RSA for CA, 2048-bit RSA for server certs
- Includes Subject Alternative Names (SAN) for proper hostname verification
- For production, use Let's Encrypt or trusted CA

---

## Quick Start

### Development Environment

```powershell
# 1. Generate secrets (optional for dev - uses defaults)
.\scripts\generate-secrets.ps1 -All -OutputFile .env

# 2. Start development containers
docker-compose -f docker-compose.dev.yml up -d
```

### Production Environment

```powershell
# 1. Generate secrets (REQUIRED)
.\scripts\generate-secrets.ps1 -All -OutputFile .env.prod

# 2. Generate SSL certificates
.\scripts\generate-certs.ps1 -All -Domain yourdomain.com

# 3. Review and update .env.prod
#    - Set SMTP settings
#    - Update domain URLs
#    - Verify all secrets

# 4. Start production containers
docker-compose -f docker-compose.prod.yml up -d

# 5. Verify encryption
curl https://yourdomain.com/health | jq '.info.encryption'
```

### Kubernetes Deployment

```powershell
# 1. Generate secrets locally
.\scripts\generate-secrets.ps1 -All -OutputFile .env.k8s

# 2. Create Kubernetes secrets
kubectl create secret generic godjira-encryption \
  --from-literal=encryption-key=<from-.env.k8s> \
  -n godjira

kubectl create secret generic godjira-jwt \
  --from-literal=jwt-secret=<from-.env.k8s> \
  --from-literal=jwt-refresh-secret=<from-.env.k8s> \
  -n godjira

kubectl create secret generic godjira-db \
  --from-literal=postgres-password=<from-.env.k8s> \
  -n godjira

# 3. Deploy with Helm
helm install godjira ./helm/godjira \
  --namespace godjira \
  --create-namespace \
  --set api.secrets.existingSecret=godjira-jwt \
  --set api.encryption.existingSecret=godjira-encryption \
  --set postgresql.auth.existingSecret=godjira-db

# Note: K8s uses cert-manager with Let's Encrypt for TLS
```

---

## Certificate Management

### Certificate Validity

Generated certificates are valid for **365 days** by default.

```powershell
# Generate certificates valid for 2 years
.\scripts\generate-certs.ps1 -All -Days 730
```

### Certificate Verification

```powershell
# Check certificate details
openssl x509 -in docker/nginx/ssl/fullchain.crt -text -noout

# Verify certificate matches private key
openssl x509 -noout -modulus -in docker/nginx/ssl/fullchain.crt | openssl md5
openssl rsa -noout -modulus -in docker/nginx/ssl/privkey.pem | openssl md5
# Both should output the same hash

# Check certificate expiration
openssl x509 -in docker/nginx/ssl/fullchain.crt -noout -dates
```

### Certificate Renewal

**Self-Signed (Development):**
```powershell
# Re-run script to generate new certificates
.\scripts\generate-certs.ps1 -All -Domain yourdomain.com

# Restart containers to load new certificates
docker-compose -f docker-compose.prod.yml restart nginx postgres redis
```

**Let's Encrypt (Production):**
```bash
# Certbot automatically renews (configured in docker-compose.prod.yml)
# Manual renewal:
docker-compose exec certbot certbot renew

# Reload nginx after renewal
docker-compose exec nginx nginx -s reload
```

---

## Security Best Practices

### Secret Management

1. **Never commit secrets to git**
   - `.env.prod` is in `.gitignore`
   - SSL private keys (`.key` files) are in `.gitignore`

2. **Use different secrets per environment**
   ```powershell
   .\scripts\generate-secrets.ps1 -All -OutputFile .env.dev
   .\scripts\generate-secrets.ps1 -All -OutputFile .env.staging
   .\scripts\generate-secrets.ps1 -All -OutputFile .env.prod
   ```

3. **Rotate secrets periodically**
   - Encryption keys: Every 90-180 days
   - JWT secrets: Every 90 days
   - Passwords: Every 180 days
   - SSL certificates: Auto-renewed (Let's Encrypt) or annually

4. **Use secrets management for production**
   - AWS Secrets Manager
   - HashiCorp Vault
   - Azure Key Vault
   - Kubernetes Secrets (with encryption at rest)

### Certificate Management

1. **Development/Staging: Self-signed certificates**
   ```powershell
   .\scripts\generate-certs.ps1 -All
   ```

2. **Production: Let's Encrypt or trusted CA**
   - Let's Encrypt (free, auto-renewal)
   - Commercial CA (DigiCert, GlobalSign, etc.)
   - Cloud provider certificates (AWS ACM, Azure Cert Service)

3. **Certificate security**
   - Keep private keys secure (never commit to git)
   - Use strong key sizes (2048-bit RSA minimum)
   - Enable OCSP stapling for revocation checking
   - Monitor certificate expiration (set alerts)

---

## Troubleshooting

### OpenSSL Not Found

**Windows:**
```powershell
# Install with Chocolatey
choco install openssl

# Or download from: https://slproweb.com/products/Win32OpenSSL.html
```

**Linux:**
```bash
sudo apt-get install openssl
```

**macOS:**
```bash
brew install openssl
```

### Permission Denied on Private Keys

```powershell
# Linux/macOS: Set proper permissions
chmod 600 docker/postgres/ssl/server.key
chmod 600 docker/redis/ssl/redis.key
chmod 600 docker/nginx/ssl/privkey.pem
```

### Certificate Verification Failed

```powershell
# Verify certificate chain
openssl verify -CAfile docker/nginx/ssl/chain.pem docker/nginx/ssl/fullchain.pem

# Expected output: OK
```

### Encryption Key Format Error

```powershell
# Encryption key must be exactly 64 hex characters
# Verify length:
$key = "your-encryption-key-here"
$key.Length  # Should be 64

# Regenerate if needed:
.\scripts\generate-secrets.ps1 -EncryptionKey
```

---

## References

- **Production Security Guide:** [../docs/PRODUCTION_SECURITY.md](../docs/PRODUCTION_SECURITY.md)
- **Kubernetes Deployment:** [../docs/K8S_DEPLOYMENT.md](../docs/K8S_DEPLOYMENT.md)
- **Environment Variables:** [../docs/env.md](../docs/env.md)
- **OpenSSL Documentation:** https://www.openssl.org/docs/
- **Let's Encrypt:** https://letsencrypt.org/docs/

---

**Last Updated:** 2025-11-27  
**Maintainer:** GodJira DevOps Team
