# GodJira Production Security Guide

This document provides comprehensive security implementation details for deploying GodJira in production with encryption-at-rest, TLS/HTTPS, and security hardening.

## Table of Contents

1. [Security Overview](#security-overview)
2. [Data-at-Rest Encryption](#data-at-rest-encryption)
3. [Data-in-Transit Encryption (TLS/HTTPS)](#data-in-transit-encryption)
4. [Production Deployment](#production-deployment)
5. [Secrets Management](#secrets-management)
6. [Security Checklist](#security-checklist)
7. [Compliance & Auditing](#compliance--auditing)
8. [Troubleshooting](#troubleshooting)

---

## Security Overview

### Security Features Implemented

✅ **Data-at-Rest Encryption**
- AES-256-GCM encryption for sensitive data (attachments, etc.)
- Secure key management with environment variables
- Automatic encryption/decryption in application layer

✅ **Data-in-Transit Encryption**
- TLS 1.2/1.3 for HTTPS (nginx reverse proxy)
- PostgreSQL SSL connections
- Redis TLS connections
- Strong cipher suites and security headers

✅ **Authentication & Authorization**
- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Account lockout after failed attempts
- Rate limiting and DDoS protection

✅ **Security Hardening**
- HSTS, CSP, X-Frame-Options, and other security headers
- No-new-privileges security options for containers
- Read-only root filesystems where possible
- Minimal attack surface

### Threat Model

**Protected Against:**
- Man-in-the-middle (MITM) attacks → TLS/SSL encryption
- Data breaches → Encrypted data-at-rest
- Brute force attacks → Rate limiting + account lockout
- XSS/CSRF → Security headers + CSP
- SQL injection → Prisma ORM with parameterized queries
- Session hijacking → Secure cookies + JWT refresh rotation

**Additional Recommendations:**
- WAF (Web Application Firewall) for production
- DDoS protection (Cloudflare, AWS Shield, etc.)
- Regular security audits and penetration testing
- Vulnerability scanning (Snyk, Dependabot, etc.)

---

## Data-at-Rest Encryption

### Implementation Details

**Algorithm:** AES-256-GCM (Galois/Counter Mode)
- Key Size: 256 bits (32 bytes)
- IV Size: 128 bits (16 bytes, randomly generated per encryption)
- Authentication Tag: 128 bits (16 bytes)

**File Location:** `apps/src/common/utils/encryption.utils.ts`

### Encrypted Data

Currently encrypted in database:
- ✅ Attachment data (base64 data URLs)
- ✅ Attachment thumbnails
- 🔄 User avatars (can be added similarly)
- 🔄 Sensitive user fields (optional, can be added)

### Encryption Key Management

#### Development
```bash
# Encryption key is optional in development (uses default fallback)
# WARNING: Default key is NOT secure - for dev only!
```

#### Production (REQUIRED)

**Option 1: Generate with OpenSSL**
```bash
# Generate 256-bit (32 byte) key
openssl rand -hex 32

# Output example:
# a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd
```

**Option 2: Use PowerShell Script**
```powershell
# Generate all secrets including encryption key
.\scripts\generate-secrets.ps1 -All -OutputFile .env.prod
```

**Option 3: Secrets Manager (Recommended)**
```bash
# AWS Secrets Manager
aws secretsmanager create-secret \
  --name godjira/encryption-key \
  --secret-string "$(openssl rand -hex 32)"

# HashiCorp Vault
vault kv put secret/godjira encryption_key="$(openssl rand -hex 32)"

# Azure Key Vault
az keyvault secret set \
  --vault-name godjira-vault \
  --name encryption-key \
  --value "$(openssl rand -hex 32)"
```

### Setting Encryption Key

**Docker Compose:**
```yaml
# In docker-compose.prod.yml
environment:
  ENCRYPTION_KEY: ${ENCRYPTION_KEY}  # From .env.prod
```

**Kubernetes:**
```yaml
# Create secret
kubectl create secret generic godjira-secrets \
  --from-literal=encryption-key=$(openssl rand -hex 32) \
  -n godjira

# Reference in deployment
env:
  - name: ENCRYPTION_KEY
    valueFrom:
      secretKeyRef:
        name: godjira-secrets
        key: encryption-key
```

### Verifying Encryption

Check the health endpoint:
```bash
curl https://your-domain.com/health

# Response should include:
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "encryption": {
      "status": "up",
      "configured": true,
      "keyLength": 32,
      "environment": "production"
    }
  }
}
```

### Key Rotation (Advanced)

**Warning:** Key rotation requires re-encrypting all existing data.

```typescript
// Pseudo-code for key rotation
// 1. Keep old key as ENCRYPTION_KEY_OLD
// 2. Set new key as ENCRYPTION_KEY
// 3. Re-encrypt all attachments:

import { decrypt } from './encryption.utils';
import { encrypt } from './encryption.utils';

// For each encrypted attachment:
const oldKey = process.env.ENCRYPTION_KEY_OLD;
const newKey = process.env.ENCRYPTION_KEY;

// Decrypt with old key, encrypt with new key
const decrypted = decryptWithKey(attachment.data, oldKey);
const reencrypted = encryptWithKey(decrypted, newKey);

// Update database
await prisma.attachment.update({
  where: { id: attachment.id },
  data: { data: reencrypted }
});
```

**Recommended Rotation Schedule:** Every 90-180 days

---

## Data-in-Transit Encryption

### TLS/HTTPS Setup

#### Architecture

```
Internet → Nginx (TLS Termination) → API/Web (Internal HTTP)
                                   ↓
                        PostgreSQL (SSL) + Redis (TLS)
```

### Certificate Generation

#### Option 1: Self-Signed (Development/Staging)

```powershell
# Generate all certificates
.\scripts\generate-certs.ps1 -All -Domain yourdomain.com

# This creates:
# - docker/nginx/ssl/fullchain.pem & privkey.pem
# - docker/postgres/ssl/server.crt & server.key
# - docker/redis/ssl/redis.crt & redis.key
# - docker/ssl/client/client.crt & client.key
```

#### Option 2: Let's Encrypt (Production - Recommended)

**Using Certbot with Docker:**

```yaml
# Add to docker-compose.prod.yml
certbot:
  image: certbot/certbot
  container_name: godjira-certbot
  volumes:
    - ./docker/nginx/ssl:/etc/letsencrypt
    - ./docker/certbot:/var/www/certbot
  entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
```

**Initial certificate:**
```bash
# Stop nginx temporarily
docker-compose -f docker-compose.prod.yml stop nginx

# Get certificate
docker run -it --rm \
  -v ./docker/nginx/ssl:/etc/letsencrypt \
  -v ./docker/certbot:/var/www/certbot \
  certbot/certbot certonly \
  --standalone \
  -d yourdomain.com \
  -d api.yourdomain.com \
  --email admin@yourdomain.com \
  --agree-tos

# Start nginx
docker-compose -f docker-compose.prod.yml start nginx
```

**Auto-renewal:**
```bash
# Certbot container automatically renews every 12 hours
# nginx will need to reload: docker-compose exec nginx nginx -s reload
```

#### Option 3: Cloud Provider Certificates

**AWS Certificate Manager:**
```bash
# Use AWS ALB/NLB with ACM for automatic cert management
# Terminate TLS at load balancer, forward to container
```

**Cloudflare:**
```bash
# Use Cloudflare for TLS termination
# Enable "Full (strict)" SSL mode
# Use origin certificates for nginx
```

### PostgreSQL SSL Configuration

**Files Created:**
- `docker/postgres/postgresql.conf` - SSL settings
- `docker/postgres/ssl/server.crt` - Server certificate
- `docker/postgres/ssl/server.key` - Server private key
- `docker/postgres/ssl/ca.crt` - Certificate authority

**Verification:**
```bash
# Check SSL is enabled
docker-compose exec postgres psql -U godjira -d godjira_prod -c "SHOW ssl;"

# Expected output:
  ssl  
-------
  on
```

### Redis TLS Configuration

**Files Created:**
- `docker/redis/redis.conf` - TLS settings
- `docker/redis/ssl/redis.crt` - Redis certificate
- `docker/redis/ssl/redis.key` - Redis private key
- `docker/redis/ssl/ca.crt` - Certificate authority

**Verification:**
```bash
# Test TLS connection
docker-compose exec redis redis-cli \
  --tls \
  --cert /etc/redis/ssl/redis.crt \
  --key /etc/redis/ssl/redis.key \
  --cacert /etc/redis/ssl/ca.crt \
  ping

# Expected output: PONG
```

### Security Headers

**Implemented in nginx.conf:**

```nginx
# HSTS - Force HTTPS for 1 year
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

# Prevent clickjacking
X-Frame-Options: DENY

# Prevent MIME sniffing
X-Content-Type-Options: nosniff

# XSS Protection
X-XSS-Protection: 1; mode=block

# Referrer Policy
Referrer-Policy: strict-origin-when-cross-origin

# Content Security Policy
Content-Security-Policy: default-src 'self'; ...

# Permissions Policy
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

**Testing Headers:**
```bash
curl -I https://yourdomain.com

# Or use: https://securityheaders.com/
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] Generate encryption key (`openssl rand -hex 32`)
- [ ] Generate JWT secrets (`generate-secrets.ps1 -JwtSecrets`)
- [ ] Generate database/Redis passwords
- [ ] Generate SSL certificates (`generate-certs.ps1 -All` or Let's Encrypt)
- [ ] Update `.env.prod` with all secrets
- [ ] Update `docker-compose.prod.yml` with domain names
- [ ] Configure SMTP settings for email
- [ ] Set up backups for PostgreSQL volume
- [ ] Configure monitoring (Prometheus/Grafana)
- [ ] Set up log aggregation (ELK, Loki, etc.)

### Deployment Steps

**1. Generate Secrets**
```powershell
# Generate all secrets
.\scripts\generate-secrets.ps1 -All -OutputFile .env.prod

# Review and update .env.prod
notepad .env.prod
```

**2. Generate Certificates**
```powershell
# For self-signed (dev/staging)
.\scripts\generate-certs.ps1 -All -Domain yourdomain.com

# For Let's Encrypt (production)
# See "Certificate Generation" section above
```

**3. Review Configuration**
```bash
# Verify docker-compose.prod.yml
# Update domain names in nginx.conf
# Update FRONTEND_URL in .env.prod
```

**4. Build and Deploy**
```bash
# Build images
docker-compose -f docker-compose.prod.yml build --no-cache

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

**5. Run Migrations**
```bash
# Wait for PostgreSQL to be ready
docker-compose -f docker-compose.prod.yml logs postgres | grep "ready to accept connections"

# Run Prisma migrations
docker-compose -f docker-compose.prod.yml exec api pnpm prisma migrate deploy
```

**6. Verify Deployment**
```bash
# Health check
curl https://yourdomain.com/health

# API documentation
curl https://yourdomain.com/api/docs

# Test encryption status
curl https://yourdomain.com/health | jq '.info.encryption'
```

### Docker Compose Production

```bash
# Start
docker-compose -f docker-compose.prod.yml up -d

# Stop
docker-compose -f docker-compose.prod.yml down

# Restart
docker-compose -f docker-compose.prod.yml restart

# View logs
docker-compose -f docker-compose.prod.yml logs -f [service]

# Scale API instances
docker-compose -f docker-compose.prod.yml up -d --scale api=3
```

### Kubernetes Deployment

See [K8S_DEPLOYMENT.md](./K8S_DEPLOYMENT.md) for Kubernetes-specific instructions with Helm.

**Key differences for encryption:**
```yaml
# Create encryption secret
kubectl create secret generic godjira-encryption \
  --from-literal=encryption-key=$(openssl rand -hex 32) \
  -n godjira

# Update deployment to reference secret
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  template:
    spec:
      containers:
      - name: api
        env:
        - name: ENCRYPTION_KEY
          valueFrom:
            secretKeyRef:
              name: godjira-encryption
              key: encryption-key
```

---

## Secrets Management

### Development
```bash
# Use .env file (not committed to git)
cp .env.example .env
# Edit .env with development values
```

### Production Options

#### Option 1: Environment Variables (Simplest)
```bash
# Set in .env.prod (not committed to git)
# Reference in docker-compose.prod.yml
```

#### Option 2: Docker Secrets
```yaml
# docker-compose.prod.yml
secrets:
  encryption_key:
    external: true
  jwt_secret:
    external: true

services:
  api:
    secrets:
      - encryption_key
      - jwt_secret
    environment:
      ENCRYPTION_KEY_FILE: /run/secrets/encryption_key
```

#### Option 3: AWS Secrets Manager
```bash
# Store secrets
aws secretsmanager create-secret \
  --name godjira/prod/encryption-key \
  --secret-string "$(openssl rand -hex 32)"

# Retrieve in application startup
# Use AWS SDK or secrets manager container sidecar
```

#### Option 4: HashiCorp Vault
```bash
# Store secrets
vault kv put secret/godjira/prod \
  encryption_key="$(openssl rand -hex 32)" \
  jwt_secret="$(openssl rand -base64 64)"

# Inject with Vault agent or CSI driver
```

#### Option 5: Kubernetes Secrets
```bash
# Create from literals
kubectl create secret generic godjira-secrets \
  --from-literal=encryption-key=$(openssl rand -hex 32) \
  --from-literal=jwt-secret=$(openssl rand -base64 64) \
  -n godjira

# Or from files
kubectl create secret generic godjira-secrets \
  --from-file=encryption-key=./secrets/encryption.key \
  --from-file=jwt-secret=./secrets/jwt.secret \
  -n godjira
```

### Secret Rotation

**Recommended Schedule:**
- Encryption keys: 90-180 days
- JWT secrets: 90 days
- Database passwords: 180 days
- SSL certificates: Auto-renewal (Let's Encrypt) or 1 year

**Rotation Procedure:**
1. Generate new secret
2. Deploy new secret alongside old (transition period)
3. Update application to use new secret
4. Verify functionality
5. Remove old secret after grace period

---

## Security Checklist

### Pre-Production

- [ ] All secrets generated with cryptographically secure methods
- [ ] `.env.prod` and SSL certificates NOT committed to git
- [ ] SSL/TLS certificates installed and valid
- [ ] Encryption key configured and verified
- [ ] Database using SSL connections
- [ ] Redis using TLS connections
- [ ] Nginx security headers configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured (FRONTEND_URL only)
- [ ] Admin credentials changed from defaults
- [ ] Firewall rules configured (only 80, 443 exposed)

### Post-Deployment

- [ ] Health endpoint returns encryption status: "up"
- [ ] HTTPS redirects working (HTTP → HTTPS)
- [ ] SSL Labs test: A+ rating (https://www.ssllabs.com/ssltest/)
- [ ] Security headers test passing (https://securityheaders.com/)
- [ ] Database backups configured and tested
- [ ] Monitoring and alerting set up
- [ ] Log aggregation configured
- [ ] Penetration testing completed
- [ ] Vulnerability scanning set up (Snyk, Dependabot)
- [ ] Incident response plan documented

### Ongoing

- [ ] Regular security updates (monthly)
- [ ] Secret rotation (per schedule)
- [ ] SSL certificate renewal (automatic with Let's Encrypt)
- [ ] Security audit logs reviewed
- [ ] Backup restoration tested
- [ ] Disaster recovery drills
- [ ] Dependency vulnerability scans

---

## Compliance & Auditing

### Data Protection

**GDPR Compliance:**
- ✅ Data encrypted at rest (AES-256-GCM)
- ✅ Data encrypted in transit (TLS 1.2/1.3)
- ✅ Right to erasure (user deletion endpoint)
- ✅ Data minimization (only necessary data stored)
- 🔄 Data portability (export endpoints implemented)
- 🔄 Privacy policy (add to frontend)

**HIPAA Compliance (if applicable):**
- ✅ Encryption at rest and in transit
- ✅ Access controls and authentication
- ✅ Audit logs (database queries logged)
- 🔄 BAA (Business Associate Agreement) required
- 🔄 Additional audit logging needed

**SOC 2 Compliance:**
- ✅ Security controls implemented
- ✅ Encryption and access controls
- 🔄 Formal security policies needed
- 🔄 Third-party audit required

### Audit Logging

Current logging:
- ✅ API access logs (nginx)
- ✅ Database queries (PostgreSQL logs)
- ✅ Authentication events (application logs)
- ✅ Failed login attempts (application logs)

**Enhance logging:**
```typescript
// Add to important operations
logger.info('Sensitive operation', {
  userId: user.id,
  action: 'ATTACHMENT_DOWNLOAD',
  resource: attachment.id,
  timestamp: new Date().toISOString(),
  ip: request.ip,
});
```

### Encryption Verification

**Automated Testing:**
```typescript
// test/encryption.e2e.spec.ts
describe('Encryption E2E', () => {
  it('should store encrypted data in database', async () => {
    // Upload attachment
    const response = await uploadAttachment(file);
    
    // Query database directly
    const dbRecord = await prisma.attachment.findUnique({
      where: { id: response.id }
    });
    
    // Verify data is encrypted (starts with "encrypted:")
    expect(dbRecord.data).toMatch(/^encrypted:/);
    
    // Verify retrieval decrypts correctly
    const retrieved = await getAttachment(response.id);
    expect(retrieved.data).toMatch(/^data:/);
  });
});
```

---

## Troubleshooting

### Encryption Issues

**Problem: "ENCRYPTION_KEY environment variable is required"**
```bash
# Solution: Set encryption key
export ENCRYPTION_KEY=$(openssl rand -hex 32)

# Or in .env.prod
echo "ENCRYPTION_KEY=$(openssl rand -hex 32)" >> .env.prod
```

**Problem: "Decryption failed: Invalid encrypted data format"**
```bash
# Cause: Data was not encrypted or key changed
# Solution: Check encryption key matches what was used to encrypt
# If key was rotated, see "Key Rotation" section
```

**Problem: Health check shows encryption status "down"**
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs api | grep -i encryption

# Verify key is set
docker-compose -f docker-compose.prod.yml exec api env | grep ENCRYPTION_KEY

# Test encryption manually
docker-compose -f docker-compose.prod.yml exec api node -e "
  const { validateEncryptionSetup } = require('./dist/common/utils/encryption.utils');
  console.log(validateEncryptionSetup());
"
```

### TLS/SSL Issues

**Problem: "certificate verify failed"**
```bash
# PostgreSQL SSL
# Check certificate files exist
ls -la docker/postgres/ssl/

# Verify certificate validity
openssl x509 -in docker/postgres/ssl/server.crt -text -noout

# Check certificate matches key
openssl x509 -noout -modulus -in docker/postgres/ssl/server.crt | openssl md5
openssl rsa -noout -modulus -in docker/postgres/ssl/server.key | openssl md5
```

**Problem: "nginx: [emerg] cannot load certificate"**
```bash
# Check nginx SSL files
ls -la docker/nginx/ssl/

# Verify certificate chain
openssl verify -CAfile docker/nginx/ssl/chain.pem docker/nginx/ssl/fullchain.pem

# Check nginx config syntax
docker-compose -f docker-compose.prod.yml exec nginx nginx -t
```

**Problem: "Redis TLS connection failed"**
```bash
# Test Redis TLS
docker-compose exec redis redis-cli \
  --tls \
  --cert /etc/redis/ssl/redis.crt \
  --key /etc/redis/ssl/redis.key \
  --cacert /etc/redis/ssl/ca.crt \
  --no-auth-warning \
  ping

# Check Redis logs
docker-compose -f docker-compose.prod.yml logs redis | grep -i tls
```

### Performance Issues

**Problem: Slow attachment uploads/downloads**
```bash
# Encryption adds ~5-10% overhead
# Optimize:
# 1. Use nginx caching for static content
# 2. Enable gzip compression (already in nginx.conf)
# 3. Consider CDN for large files
# 4. Monitor CPU usage during encryption operations
```

**Problem: Database connection slow**
```bash
# SSL handshake adds latency
# Optimize:
# 1. Use connection pooling (Prisma does this)
# 2. Keep connections alive (configured in Prisma)
# 3. Monitor PostgreSQL SSL connections:
SELECT * FROM pg_stat_ssl;
```

### Security Alerts

**Problem: SSL Labs grade below A**
```bash
# Check SSL configuration
curl https://www.ssllabs.com/ssltest/analyze.html?d=yourdomain.com

# Common fixes:
# 1. Enable HSTS (already in nginx.conf)
# 2. Enable OCSP stapling (already in nginx.conf)
# 3. Use strong cipher suites (already configured)
# 4. Ensure TLS 1.2+ only (already configured)
```

**Problem: Failed security header tests**
```bash
# Test headers
curl -I https://yourdomain.com | grep -E "X-|Content-Security-Policy|Strict-Transport"

# All security headers are configured in nginx.conf
# If missing, verify nginx configuration loaded:
docker-compose exec nginx nginx -T | grep add_header
```

---

## Additional Resources

### Tools

- **SSL Testing:** https://www.ssllabs.com/ssltest/
- **Security Headers:** https://securityheaders.com/
- **OWASP ZAP:** https://www.zaproxy.org/ (penetration testing)
- **Snyk:** https://snyk.io/ (vulnerability scanning)

### Documentation

- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **NIST Encryption:** https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines
- **Let's Encrypt:** https://letsencrypt.org/docs/
- **Docker Security:** https://docs.docker.com/engine/security/

### Support

For security issues:
- **Email:** security@godjira.com
- **Bug Bounty:** https://godjira.com/security
- **Security Policy:** SECURITY.md

---

**Last Updated:** 2025-11-27  
**Version:** 1.0.0  
**Maintained By:** GodJira Security Team
