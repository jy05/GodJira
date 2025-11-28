# Security Guidelines for GodJira

## ⚠️ Critical Security Notice

This document outlines the security measures implemented in GodJira and critical steps required before deploying to any environment.

## 🔒 Fixed Security Issues (November 27, 2025)

### Removed Hardcoded Credentials
All hardcoded credentials have been removed from:
- ✅ `docker-compose.yml` - Now uses environment variables
- ✅ `k8s/api-deployment.yaml` - Secrets replaced with PLACEHOLDER values
- ✅ `k8s/postgres-statefulset.yaml` - Password must be provided externally
- ✅ `helm/values.yaml` - Password must be set at install time
- ✅ `.env.example` files - No weak example passwords

## 🚨 Before Deployment Checklist

### Required Actions for ALL Environments

- [ ] **Copy `.env.example` to `.env`** and fill in ALL required values
- [ ] **Generate secure secrets** using provided scripts:
  ```powershell
  .\scripts\generate-secrets.ps1 -All
  ```
- [ ] **Never commit `.env` files** - Verify `.gitignore` includes `.env`
- [ ] **Set unique passwords** for each environment (dev, staging, production)
- [ ] **Use minimum 32 characters** for all passwords and secrets
- [ ] **Verify DATABASE_URL** does not contain weak passwords

### Docker Compose Deployments

The following environment variables **MUST** be set before running `docker-compose up`:

```bash
# Required - will fail if not set
export POSTGRES_PASSWORD="<secure-random-32-chars>"
export PGADMIN_PASSWORD="<secure-random-password>"
export GRAFANA_PASSWORD="<secure-random-password>"

# Run docker-compose
docker-compose up -d
```

### Kubernetes Deployments

Secrets **MUST** be created externally before applying manifests:

```bash
# 1. Generate secrets (NEVER commit these commands to git!)
JWT_SECRET=$(openssl rand -base64 64)
JWT_REFRESH_SECRET=$(openssl rand -base64 64)
ENCRYPTION_KEY=$(openssl rand -hex 32)
DB_PASSWORD=$(openssl rand -base64 32)

# 2. Create Kubernetes secrets
kubectl create secret generic api-secret \
  --from-literal=DATABASE_URL="postgresql://godjira:${DB_PASSWORD}@postgres:5432/godjira?schema=public" \
  --from-literal=JWT_SECRET="${JWT_SECRET}" \
  --from-literal=JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET}" \
  --from-literal=ENCRYPTION_KEY="${ENCRYPTION_KEY}" \
  --namespace=godjira

kubectl create secret generic postgres-secret \
  --from-literal=POSTGRES_PASSWORD="${DB_PASSWORD}" \
  --namespace=godjira

# 3. Apply manifests (secrets are now external)
kubectl apply -f k8s/
```

### Helm Deployments

**NEVER** use default values - provide secrets via command line or values file:

```bash
# Option 1: Command line (recommended for CI/CD)
helm install godjira ./helm \
  --set postgresql.auth.password="$(openssl rand -base64 32)" \
  --set api.secrets.jwtSecret="$(openssl rand -base64 64)" \
  --set api.secrets.jwtRefreshSecret="$(openssl rand -base64 64)" \
  --set api.secrets.encryptionKey="$(openssl rand -hex 32)"

# Option 2: Separate values file (DO NOT commit to git!)
helm install godjira ./helm -f secrets.yaml
```

## 🔐 Secret Management Best Practices

### Development Environment
- Use `.env` files (excluded from git)
- Generate unique secrets even for development
- Never share development credentials

### Production Environment
Use external secret management:
- **AWS**: AWS Secrets Manager or Parameter Store
- **Azure**: Azure Key Vault
- **GCP**: Google Secret Manager
- **Generic**: HashiCorp Vault
- **Kubernetes**: External Secrets Operator, Sealed Secrets, or SOPS

### Example: External Secrets Operator
```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: api-secret
  namespace: godjira
spec:
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: api-secret
  data:
    - secretKey: JWT_SECRET
      remoteRef:
        key: godjira/production/jwt-secret
```

## 📋 Environment Variables Reference

### Critical Secrets (Must be unique and secure)
| Variable | Generation Method | Minimum Entropy |
|----------|------------------|-----------------|
| `POSTGRES_PASSWORD` | `openssl rand -base64 32` | 256 bits |
| `JWT_SECRET` | `openssl rand -base64 64` | 512 bits |
| `JWT_REFRESH_SECRET` | `openssl rand -base64 64` | 512 bits |
| `ENCRYPTION_KEY` | `openssl rand -hex 32` | 256 bits |
| `SESSION_SECRET` | `openssl rand -base64 32` | 256 bits |

### Passwords Policy
- **Minimum length**: 32 characters for service accounts
- **Character set**: Use base64 or hex encoding from crypto-secure RNG
- **Rotation**: Change passwords quarterly in production
- **Unique**: Never reuse passwords across environments

## 🛡️ Additional Security Measures

### Network Security
- Use TLS/SSL for all external connections
- Enable PostgreSQL SSL mode in production
- Use private networks for service-to-service communication

### Authentication & Authorization
- JWT tokens are stateless with short expiration (30 minutes)
- Refresh tokens expire after 7 days
- Account lockout after 5 failed login attempts
- NIST-compliant password policy enforced

### Data Protection
- Sensitive data encrypted at rest using AES-256-GCM
- Passwords hashed with bcrypt (12 rounds)
- File uploads scanned and validated
- SQL injection prevention via Prisma ORM

### Monitoring & Auditing
- All authentication events logged
- Failed login attempts tracked
- Admin actions audited
- Prometheus metrics for security monitoring

## 🚫 What NOT to Do

❌ **Never** commit files containing:
- `.env` files
- `secrets.yaml` files
- Any file with actual passwords or API keys
- Database backup files with sensitive data

❌ **Never** use in production:
- Example passwords from documentation
- Default credentials
- Weak passwords (less than 32 characters)
- Same password across environments

❌ **Never** store secrets in:
- Git repositories
- ConfigMaps (use Secrets instead)
- Application code
- Container images
- Log files

## 🔍 Verification Commands

Check for accidentally committed secrets:
```bash
# Scan for potential secrets in git history
git log -p | grep -i "password\|secret\|key"

# Use git-secrets to prevent commits
git secrets --scan
```

Verify environment variables are set:
```bash
# Docker Compose
docker-compose config

# Kubernetes
kubectl get secrets -n godjira
kubectl describe secret api-secret -n godjira
```

## 📞 Security Contact

If you discover a security vulnerability:
1. **DO NOT** open a public issue
2. Email: security@godjira.com (if configured)
3. Include details and steps to reproduce
4. Allow 48 hours for initial response

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/)
- [Kubernetes Secrets Management](https://kubernetes.io/docs/concepts/configuration/secret/)
- [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/)

---

**Last Updated**: November 27, 2025
**Version**: 1.0
