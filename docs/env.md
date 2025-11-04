# Environment Variables Documentation

This document describes all environment variables used by GodJira backend API. All variables are configured in the `.env` file (see `.env.example` for a template).

## Quick Reference

```bash
# Copy template and edit
cp .env.example .env

# Required variables (application will not start without these):
DATABASE_URL
JWT_SECRET
JWT_REFRESH_SECRET
```

---

## Table of Contents

1. [Database Configuration](#database-configuration)
2. [Application Settings](#application-settings)
3. [Authentication & Security](#authentication--security)
4. [Email Configuration](#email-configuration)
5. [File Upload Settings](#file-upload-settings)
6. [CORS & Frontend](#cors--frontend)
7. [Rate Limiting](#rate-limiting)
8. [Logging & Monitoring](#logging--monitoring)
9. [Optional Services](#optional-services)
10. [Development vs Production](#development-vs-production)

---

## Database Configuration

### `DATABASE_URL` 
**Required** | Type: `string` | No default

PostgreSQL connection string in the format:
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
```

**Examples:**
```bash
# Local development
DATABASE_URL="postgresql://godjira:password123@localhost:5432/godjira_dev?schema=public"

# Docker container
DATABASE_URL="postgresql://godjira:password123@postgres-dev:5432/godjira_dev?schema=public"

# Production with SSL
DATABASE_URL="postgresql://user:pass@prod-db.example.com:5432/godjira?schema=public&sslmode=require"
```

**Used by:** Prisma ORM for all database operations

**Validation:**
- Must be a valid PostgreSQL connection string
- Database must be PostgreSQL 15+
- Schema must exist (typically `public`)

---

### Docker Compose Variables (when using `docker-compose.dev.yml`)

#### `POSTGRES_USER`
**Optional** | Type: `string` | Default: `godjira`

PostgreSQL username for database container.

#### `POSTGRES_PASSWORD`
**Optional** | Type: `string` | Default: `godjira_dev_password`

PostgreSQL password for database container.

**⚠️ Security:** Change default password for production!

#### `POSTGRES_DB`
**Optional** | Type: `string` | Default: `godjira_dev`

PostgreSQL database name to create on container startup.

#### `POSTGRES_PORT`
**Optional** | Type: `number` | Default: `5432`

Port to expose PostgreSQL on host machine.

---

## Application Settings

### `NODE_ENV`
**Optional** | Type: `string` | Default: `development`

Node.js environment mode.

**Allowed values:**
- `development` - Enables debug logging, hot-reload, detailed errors
- `production` - Optimized builds, minimal logging, error sanitization
- `test` - Used for automated testing

**Effects:**
- Affects logging verbosity
- Changes error response detail level
- Enables/disables debugging features

---

### `PORT`
**Optional** | Type: `number` | Default: `3000`

Port number for the HTTP server to listen on.

**Examples:**
```bash
PORT=3000  # Default
PORT=8080  # Alternative port
PORT=80    # HTTP (requires elevated permissions)
```

**Note:** When using Docker, ensure this matches the exposed port in `docker-compose.yml`.

---

## Authentication & Security

### `JWT_SECRET`
**Required** | Type: `string` | No default

Secret key for signing JWT access tokens. Must be a strong, random string.

**Generate secure secret:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL (Linux/macOS)
openssl rand -hex 32

# Using PowerShell (Windows)
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })
```

**⚠️ Security:**
- **Minimum 32 characters** recommended
- **Never commit to version control**
- **Must be different from `JWT_REFRESH_SECRET`**
- Changing this will invalidate all active access tokens

**Used by:**
- JWT token signing/verification
- Access token generation (30-minute expiry)
- WebSocket authentication

---

### `JWT_REFRESH_SECRET`
**Required** | Type: `string` | No default

Secret key for signing JWT refresh tokens. Must be different from `JWT_SECRET`.

**Generate secure secret:**
```bash
# Same methods as JWT_SECRET, but generate a different value
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**⚠️ Security:**
- **Must be different from `JWT_SECRET`**
- Changing this will invalidate all active refresh tokens (force logout all users)

**Used by:**
- Refresh token generation (7-day expiry)
- Token refresh endpoint

---

### `JWT_EXPIRES_IN`
**Optional** | Type: `string` | Default: `30m`

Access token expiration time. Uses [vercel/ms](https://github.com/vercel/ms) format.

**Examples:**
```bash
JWT_EXPIRES_IN=30m   # 30 minutes (default)
JWT_EXPIRES_IN=1h    # 1 hour
JWT_EXPIRES_IN=15m   # 15 minutes (more secure)
JWT_EXPIRES_IN=2h    # 2 hours (less secure)
```

**Recommended:** `15m` to `1h` for production

---

### `JWT_REFRESH_EXPIRES_IN`
**Optional** | Type: `string` | Default: `7d`

Refresh token expiration time.

**Examples:**
```bash
JWT_REFRESH_EXPIRES_IN=7d    # 7 days (default)
JWT_REFRESH_EXPIRES_IN=14d   # 14 days
JWT_REFRESH_EXPIRES_IN=30d   # 30 days
JWT_REFRESH_EXPIRES_IN=1h    # 1 hour (very secure, inconvenient)
```

**Recommended:** `7d` to `30d` for production

---

### `BCRYPT_ROUNDS`
**Optional** | Type: `number` | Default: `12`

Number of bcrypt hashing rounds for password encryption.

**Allowed values:** `10` to `15`

**Performance impact:**
- `10` = Fast, less secure (~100ms)
- `12` = Balanced, NIST-compliant (~300ms) ✅ **Recommended**
- `14` = Slow, very secure (~1200ms)
- `15` = Very slow, maximum security (~2500ms)

**⚠️ Security:** 
- **Minimum 12 rounds** for NIST compliance
- Higher values increase security but slow down login/registration

---

### `MAX_LOGIN_ATTEMPTS`
**Optional** | Type: `number` | Default: `5`

Maximum failed login attempts before account lockout.

**Examples:**
```bash
MAX_LOGIN_ATTEMPTS=5    # Default (NIST recommended)
MAX_LOGIN_ATTEMPTS=3    # More strict
MAX_LOGIN_ATTEMPTS=10   # More lenient
```

**Recommended:** `3` to `5` for production

---

### `LOCK_DURATION_MINUTES`
**Optional** | Type: `number` | Default: `15`

Account lockout duration in minutes after exceeding `MAX_LOGIN_ATTEMPTS`.

**Examples:**
```bash
LOCK_DURATION_MINUTES=15   # Default
LOCK_DURATION_MINUTES=30   # 30 minutes
LOCK_DURATION_MINUTES=60   # 1 hour
```

**Recommended:** `15` to `30` minutes

---

### `PASSWORD_HISTORY_SIZE`
**Optional** | Type: `number` | Default: `5`

Number of previous passwords to prevent reuse.

**Examples:**
```bash
PASSWORD_HISTORY_SIZE=5    # Default (NIST recommended)
PASSWORD_HISTORY_SIZE=10   # More strict
PASSWORD_HISTORY_SIZE=3    # Less strict
```

**Recommended:** `5` to `10` for production

---

### `SESSION_SECRET`
**Optional** | Type: `string` | No default

Secret key for session management (if using sessions).

**Generate:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Note:** Currently not actively used (JWT tokens used instead)

---

## Email Configuration

All email variables use the `MAIL_` prefix (not `SMTP_`).

### `MAIL_HOST`
**Required for emails** | Type: `string` | No default

SMTP server hostname.

**Examples:**
```bash
# Gmail
MAIL_HOST=smtp.gmail.com

# Outlook
MAIL_HOST=smtp-mail.outlook.com

# SendGrid
MAIL_HOST=smtp.sendgrid.net

# Mailhog (development)
MAIL_HOST=mailhog-dev

# Mailtrap (testing)
MAIL_HOST=smtp.mailtrap.io
```

---

### `MAIL_PORT`
**Required for emails** | Type: `number` | No default

SMTP server port.

**Common ports:**
```bash
MAIL_PORT=25     # Non-encrypted (not recommended)
MAIL_PORT=587    # TLS/STARTTLS (recommended) ✅
MAIL_PORT=465    # SSL
MAIL_PORT=2525   # Alternative TLS port
MAIL_PORT=1025   # Mailhog (development)
```

**Recommended:** `587` with `MAIL_SECURE=false`

---

### `MAIL_SECURE`
**Optional** | Type: `boolean` | Default: `false`

Enable SSL/TLS connection.

**Values:**
```bash
MAIL_SECURE=false  # Use STARTTLS (port 587) ✅ Recommended
MAIL_SECURE=true   # Use SSL (port 465)
```

**Note:** Most modern SMTP servers use port 587 with `MAIL_SECURE=false`

---

### `MAIL_USER`
**Required for emails** | Type: `string` | No default

SMTP authentication username.

**Examples:**
```bash
MAIL_USER=your-email@gmail.com
MAIL_USER=apikey  # SendGrid uses 'apikey' as username
MAIL_USER=          # Leave empty for Mailhog/Mailtrap
```

---

### `MAIL_PASSWORD`
**Required for emails** | Type: `string` | No default

SMTP authentication password or API key.

**Examples:**
```bash
# Gmail: Use App Password, not regular password
MAIL_PASSWORD=abcd efgh ijkl mnop

# SendGrid: Use API key as password
MAIL_PASSWORD=SG.xxxxxxxxxxxxxxxxxxx

# Mailhog: Leave empty
MAIL_PASSWORD=
```

**⚠️ Security:**
- Never commit to version control
- Use app-specific passwords for Gmail
- Use API keys instead of passwords when possible

---

### `MAIL_FROM_NAME`
**Optional** | Type: `string` | Default: `GodJira`

Display name in "From" field of emails.

**Examples:**
```bash
MAIL_FROM_NAME=GodJira
MAIL_FROM_NAME=GodJira Support
MAIL_FROM_NAME=Project Management System
```

---

### `MAIL_FROM_EMAIL`
**Required for emails** | Type: `string` | No default

Email address in "From" field.

**Examples:**
```bash
MAIL_FROM_EMAIL=noreply@godjira.com
MAIL_FROM_EMAIL=support@yourcompany.com
MAIL_FROM_EMAIL=notifications@example.com
```

**Note:** Must be a valid email address that your SMTP server allows sending from.

---

## File Upload Settings

### `MAX_FILE_SIZE`
**Optional** | Type: `number` | Default: `20971520` (20MB)

Maximum file size in bytes for attachments.

**Examples:**
```bash
MAX_FILE_SIZE=10485760   # 10MB
MAX_FILE_SIZE=20971520   # 20MB (default)
MAX_FILE_SIZE=52428800   # 50MB
MAX_FILE_SIZE=104857600  # 100MB
```

**Note:** Also requires web server (nginx/Apache) upload limit configuration.

---

### `MAX_AVATAR_SIZE`
**Optional** | Type: `number` | Default: `10485760` (10MB)

Maximum file size in bytes for user avatars.

**Examples:**
```bash
MAX_AVATAR_SIZE=5242880    # 5MB
MAX_AVATAR_SIZE=10485760   # 10MB (default)
```

**Note:** Avatars are stored as Base64 in database, so smaller is better.

---

### `UPLOAD_PATH`
**Optional** | Type: `string` | Default: `./uploads`

Directory path for storing uploaded files (relative or absolute).

**Examples:**
```bash
UPLOAD_PATH=./uploads              # Relative to app root
UPLOAD_PATH=/var/www/godjira/uploads  # Absolute path
UPLOAD_PATH=/app/uploads           # Docker container path
```

**Requirements:**
- Directory must be writable by application user
- Must be persistent in production (use volumes in Docker)

---

## CORS & Frontend

### `FRONTEND_URL`
**Required** | Type: `string` | Default: `http://localhost:5173`

Frontend application URL for CORS and email links.

**Examples:**
```bash
# Development
FRONTEND_URL=http://localhost:5173

# Production
FRONTEND_URL=https://godjira.yourcompany.com

# Multiple environments
FRONTEND_URL=https://app.example.com
```

**Used for:**
- CORS origin validation
- Email link generation (password reset, email verification)
- WebSocket origin validation

---

### `ALLOWED_ORIGINS`
**Optional** | Type: `string` (comma-separated) | Uses `FRONTEND_URL`

Additional allowed CORS origins.

**Examples:**
```bash
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://staging.godjira.com
```

---

## Rate Limiting

Rate limiting is configured in code (`app.module.ts`) but can be overridden:

### Default Configuration
- **TTL:** 60,000ms (1 minute)
- **Limit:** 100 requests per minute per IP

**To modify:** Edit `ThrottlerModule.forRoot()` in `apps/src/app.module.ts`

**Example override (future enhancement):**
```bash
RATE_LIMIT_TTL=60000     # 1 minute in milliseconds
RATE_LIMIT_MAX=100       # Max requests per TTL
```

---

## Logging & Monitoring

### `LOG_LEVEL`
**Optional** | Type: `string` | Default: `info` (production) / `debug` (development)

Application logging verbosity.

**Allowed values:** `error`, `warn`, `info`, `debug`, `verbose`

**Examples:**
```bash
LOG_LEVEL=error    # Only errors (production)
LOG_LEVEL=warn     # Errors and warnings
LOG_LEVEL=info     # General information (default)
LOG_LEVEL=debug    # Detailed debugging (development)
LOG_LEVEL=verbose  # Everything (very noisy)
```

**Recommended:** `info` for production, `debug` for development

---

### `LOG_FORMAT`
**Optional** | Type: `string` | Default: `json`

Log output format.

**Allowed values:**
- `json` - Structured JSON logs (best for production)
- `pretty` - Human-readable colored logs (best for development)

---

### `METRICS_ENABLED`
**Optional** | Type: `boolean` | Default: `true`

Enable Prometheus metrics endpoint.

**Values:**
```bash
METRICS_ENABLED=true   # Enable /metrics endpoint
METRICS_ENABLED=false  # Disable metrics
```

**Metrics endpoint:** `GET /metrics` (Prometheus format)

---

### `METRICS_PORT`
**Optional** | Type: `number` | Default: `9090`

Port for Prometheus metrics (if using separate metrics server).

**Note:** Currently metrics are exposed on main API port, not separate port.

---

## Optional Services

### Redis (Optional - Not currently implemented)

```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

**Future use:** Session storage, caching, rate limiting

---

### Sentry (Optional - Not currently implemented)

```bash
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
SENTRY_ENVIRONMENT=production
```

**Future use:** Error tracking and monitoring

---

### AWS S3 (Optional - Not currently implemented)

```bash
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=godjira-uploads
```

**Future use:** Cloud file storage instead of local filesystem

---

## Development vs Production

### Development Configuration

```bash
# .env.development
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://godjira:dev_password@localhost:5432/godjira_dev?schema=public

JWT_SECRET=dev-jwt-secret-not-for-production
JWT_REFRESH_SECRET=dev-refresh-secret-not-for-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Use Mailhog for email testing
MAIL_HOST=mailhog-dev
MAIL_PORT=1025
MAIL_SECURE=false
MAIL_FROM_EMAIL=noreply@godjira.dev

MAX_FILE_SIZE=20971520
UPLOAD_PATH=./uploads

FRONTEND_URL=http://localhost:5173

LOG_LEVEL=debug
LOG_FORMAT=pretty
```

### Production Configuration

```bash
# .env.production
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://godjira:STRONG_PASSWORD@db.example.com:5432/godjira?schema=public&sslmode=require

# MUST generate strong secrets!
JWT_SECRET=<64-char-random-hex>
JWT_REFRESH_SECRET=<64-char-random-hex>
JWT_EXPIRES_IN=30m
JWT_REFRESH_EXPIRES_IN=7d

BCRYPT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCK_DURATION_MINUTES=15

# Real SMTP service
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=apikey
MAIL_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxx
MAIL_FROM_EMAIL=noreply@yourcompany.com

MAX_FILE_SIZE=20971520
UPLOAD_PATH=/var/www/godjira/uploads

FRONTEND_URL=https://godjira.yourcompany.com

LOG_LEVEL=info
LOG_FORMAT=json
METRICS_ENABLED=true
```

---

## Validation & Testing

### Check Required Variables

```bash
# Run this in apps/ directory
pnpm prisma generate

# If DATABASE_URL is missing:
# Error: Environment variable not found: DATABASE_URL
```

### Test Email Configuration

```bash
# Use this endpoint to test email
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check logs for email sending status
```

### Generate Secure Secrets Script

Create `scripts/generate-secrets.sh`:
```bash
#!/bin/bash
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
echo "JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
echo "SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
```

---

## Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Generate strong random secrets (32+ bytes)
- [ ] Set `NODE_ENV=production`
- [ ] Use real SMTP service (not Mailhog)
- [ ] Enable SSL for database connection
- [ ] Set `BCRYPT_ROUNDS=12` minimum
- [ ] Limit `MAX_LOGIN_ATTEMPTS` to 5 or less
- [ ] Set `JWT_EXPIRES_IN` to 30m or less
- [ ] Use strong `POSTGRES_PASSWORD`
- [ ] Never commit `.env` to version control
- [ ] Restrict file upload sizes (`MAX_FILE_SIZE`)
- [ ] Configure proper CORS origins
- [ ] Enable metrics for monitoring
- [ ] Set appropriate log levels

---

## Troubleshooting

### Application won't start

**Check:**
1. Is `DATABASE_URL` set and valid?
2. Is PostgreSQL running and accessible?
3. Are `JWT_SECRET` and `JWT_REFRESH_SECRET` set?

```bash
# Test database connection
psql "$DATABASE_URL"
```

### Emails not sending

**Check:**
1. Are all `MAIL_*` variables set?
2. Is SMTP server accessible?
3. Are credentials correct?
4. Check logs for email errors

```bash
# Test SMTP connection
telnet smtp.gmail.com 587
```

### File uploads failing

**Check:**
1. Does `UPLOAD_PATH` directory exist?
2. Is directory writable?
3. Is file size within `MAX_FILE_SIZE` limit?

```bash
# Check permissions
ls -la ./uploads
chmod 755 ./uploads
```

### JWT tokens invalid

**Check:**
1. Did you change `JWT_SECRET` or `JWT_REFRESH_SECRET`?
   - This invalidates all existing tokens
2. Are secrets the same across all instances?
3. Check token expiration times

---

## Related Documentation

- [Setup Guide (Linux)](./setup-linux.md)
- [Setup Guide (macOS)](./setup-macos.md)
- [Docker Development](./docker-dev.md)
- [Architecture Overview](./architecture.md) (coming soon)

---

**Last Updated**: November 4, 2025  
**Version**: 1.0.0
