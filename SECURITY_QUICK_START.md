# 🔒 Security Quick Start Guide

## ⚠️ CRITICAL: Read This Before Deploying!

All hardcoded passwords have been removed from GodJira. You **MUST** configure secure credentials before starting any services.

## Quick Setup (3 Steps)

### 1️⃣ Generate Secure Secrets

**Windows PowerShell:**
```powershell
.\scripts\generate-secrets.ps1 -All
```

This creates a `.env` file with cryptographically secure random secrets.

**Linux/macOS:**
```bash
# Copy template
cp .env.example .env

# Generate secrets and add to .env manually
echo "JWT_SECRET=$(openssl rand -base64 64)" >> .env
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 64)" >> .env
echo "ENCRYPTION_KEY=$(openssl rand -hex 32)" >> .env
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32)" >> .env
echo "PGADMIN_PASSWORD=$(openssl rand -base64 32)" >> .env
echo "GRAFANA_PASSWORD=$(openssl rand -base64 32)" >> .env
```

### 2️⃣ Verify Your .env File

Check that NO placeholder values remain:
```bash
# These should NOT appear in your .env file:
❌ CHANGE_THIS_PASSWORD
❌ GENERATE_SECURE_SECRET
❌ PLACEHOLDER
❌ your-super-secret
❌ godjira123
❌ admin123
```

### 3️⃣ Start Services

**Docker Compose (Development):**
```bash
# Source your .env file first
source .env  # Linux/macOS
# OR
Get-Content .env | ForEach-Object { $_ -split '=' | Set-Variable }  # PowerShell

# Then start
docker-compose -f docker-compose.dev.yml up -d
```

**Kubernetes:**
```bash
# Create secrets from your .env file
kubectl create secret generic api-secret --from-env-file=.env -n godjira
kubectl create secret generic postgres-secret --from-env-file=.env -n godjira

# Deploy
kubectl apply -f k8s/
```

## ✅ Security Checklist

Before deploying to ANY environment:

- [ ] `.env` file created with secure random values
- [ ] NO placeholder passwords remain in `.env`
- [ ] `.env` is in `.gitignore` (already configured)
- [ ] Never committed `.env` to version control
- [ ] Used minimum 32 characters for all passwords
- [ ] Different secrets for each environment (dev/staging/prod)

## 🚫 Common Mistakes to Avoid

1. **Using example passwords from documentation**
   - All examples in docs are intentionally weak
   - Generate your own secure credentials

2. **Reusing passwords across environments**
   - Development and production must have different credentials
   - Each environment should have unique secrets

3. **Committing .env files**
   - Already prevented by `.gitignore`
   - Double-check before pushing to git

4. **Skipping password generation**
   - Services will fail to start without proper credentials
   - Docker Compose requires `POSTGRES_PASSWORD`, `PGADMIN_PASSWORD`, `GRAFANA_PASSWORD`

## 📚 More Information

- **Full Security Guide**: [SECURITY.md](./SECURITY.md)
- **Environment Variables**: [docs/env.md](./docs/env.md)
- **Production Deployment**: [docs/PRODUCTION_SECURITY.md](./docs/PRODUCTION_SECURITY.md)

## 🆘 Troubleshooting

**Error: "POSTGRES_PASSWORD must be set"**
- Solution: Set the environment variable before running docker-compose
- `export POSTGRES_PASSWORD="your-secure-password"`

**Error: "JWT_SECRET is required"**
- Solution: Check your `.env` file in the `apps/` directory
- Ensure JWT_SECRET is set and not a placeholder

**Services won't start**
- Verify all required environment variables are set
- Check `docker-compose config` to see resolved values
- Never use placeholder or example passwords

---

**Remember**: Security is not optional. Taking 5 minutes to set up proper credentials prevents hours of security incident response later.
