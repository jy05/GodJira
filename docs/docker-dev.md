# Docker Development Environment Guide

This guide explains how to use Docker Compose for local development with hot-reload, debugging, and email testing.

## Quick Start

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Start all development services
docker-compose -f docker-compose.dev.yml up -d

# 3. View logs
docker-compose -f docker-compose.dev.yml logs -f api-dev

# 4. Stop services
docker-compose -f docker-compose.dev.yml down
```

---

## Services Overview

### Development Services (`docker-compose.dev.yml`)

| Service | Port | Description | URL |
|---------|------|-------------|-----|
| **postgres-dev** | 5432 | PostgreSQL 15 database | `postgresql://localhost:5432` |
| **api-dev** | 3000 | NestJS API (hot-reload) | http://localhost:3000 |
| **pgadmin-dev** | 5050 | Database management UI | http://localhost:5050 |
| **redis-dev** | 6379 | Redis cache (optional) | `redis://localhost:6379` |
| **mailhog-dev** | 1025, 8025 | Email testing | http://localhost:8025 |

### Production Services (`docker-compose.yml`)

| Service | Port | Description | URL |
|---------|------|-------------|-----|
| **postgres** | 5432 | PostgreSQL production | `postgresql://localhost:5432` |
| **pgadmin** | 5050 | Database UI | http://localhost:5050 |
| **prometheus** | 9090 | Metrics collection | http://localhost:9090 |
| **grafana** | 3001 | Metrics dashboard | http://localhost:3001 |

---

## Prerequisites

- **Docker Desktop** 4.x+ (with Docker Compose V2)
- **4GB RAM** minimum allocated to Docker
- **10GB disk space** for images and volumes

### Install Docker Desktop

**Windows/macOS:**
- Download from https://www.docker.com/products/docker-desktop

**Linux:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

---

## Setup Steps

### 1. Environment Configuration

```bash
# Copy template
cp .env.example .env

# Edit with your values
nano .env  # or use your editor

# Minimum required changes:
# - JWT_SECRET (generate secure random string)
# - JWT_REFRESH_SECRET (generate secure random string)
```

**Generate Secure Secrets:**
```bash
# On Linux/macOS
openssl rand -hex 32

# On Windows (PowerShell)
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Max 256) })

# Using Node.js (all platforms)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 2. Start Development Environment

```bash
# Start all services in background
docker-compose -f docker-compose.dev.yml up -d

# Start specific services
docker-compose -f docker-compose.dev.yml up -d postgres-dev api-dev

# Start with logs (foreground)
docker-compose -f docker-compose.dev.yml up
```

**First-time setup:**
```bash
# Wait for services to be healthy
docker-compose -f docker-compose.dev.yml ps

# Run database migrations
docker-compose -f docker-compose.dev.yml exec api-dev pnpm prisma:migrate

# (Optional) Seed database
docker-compose -f docker-compose.dev.yml exec api-dev pnpm prisma:seed
```

---

### 3. Verify Services

```bash
# Check service status
docker-compose -f docker-compose.dev.yml ps

# Expected output:
# NAME                    STATUS      PORTS
# godjira-postgres-dev    Up (healthy)   0.0.0.0:5432->5432/tcp
# godjira-api-dev         Up             0.0.0.0:3000->3000/tcp
# godjira-pgadmin-dev     Up             0.0.0.0:5050->80/tcp
# godjira-mailhog-dev     Up             0.0.0.0:1025->1025/tcp, 0.0.0.0:8025->8025/tcp

# Test API health
curl http://localhost:3000/health

# Test API docs
# Open browser: http://localhost:3000/api/docs
```

---

## Development Workflow

### Hot Reload

The API service is configured with volume mounts for hot-reload:

```bash
# Edit code in apps/src/
# Changes will be automatically detected and the server will restart

# View reload logs
docker-compose -f docker-compose.dev.yml logs -f api-dev
```

### Database Management

**Using PgAdmin:**
1. Open http://localhost:5050
2. Login with credentials from `.env` (default: `admin@godjira.dev` / `admin123`)
3. Server connection is auto-configured (postgres-dev)
4. Browse tables, run queries, view data

**Using CLI:**
```bash
# Connect to PostgreSQL from host
psql -h localhost -U godjira -d godjira_dev

# Connect from within container
docker-compose -f docker-compose.dev.yml exec postgres-dev psql -U godjira -d godjira_dev
```

**Prisma Studio:**
```bash
# Open Prisma Studio GUI
docker-compose -f docker-compose.dev.yml exec api-dev pnpm prisma:studio

# Opens at http://localhost:5555
```

### Email Testing with Mailhog

```bash
# Configure API to use Mailhog in .env:
# SMTP_HOST=mailhog-dev
# SMTP_PORT=1025

# All emails will be captured by Mailhog (not sent)
# View emails at: http://localhost:8025

# Test registration/password reset flows without real email
```

### Running Migrations

```bash
# Create new migration
docker-compose -f docker-compose.dev.yml exec api-dev pnpm prisma migrate dev --name add_new_feature

# Apply migrations
docker-compose -f docker-compose.dev.yml exec api-dev pnpm prisma migrate deploy

# Reset database (WARNING: Deletes all data)
docker-compose -f docker-compose.dev.yml exec api-dev pnpm prisma migrate reset
```

### Debugging

**Enable Node.js Inspector:**

Edit `docker-compose.dev.yml` and change the command:
```yaml
api-dev:
  # Change from:
  command: pnpm --filter @godjira/api dev
  
  # To:
  command: pnpm --filter @godjira/api start:debug
```

Then connect debugger to `localhost:9229` (port is exposed in compose file).

**VS Code Debug Configuration** (`.vscode/launch.json`):
```json
{
  "type": "node",
  "request": "attach",
  "name": "Docker: Attach to Node",
  "port": 9229,
  "address": "localhost",
  "localRoot": "${workspaceFolder}/apps",
  "remoteRoot": "/app/apps",
  "protocol": "inspector"
}
```

---

## Common Commands

### Service Management

```bash
# Start services
docker-compose -f docker-compose.dev.yml up -d

# Stop services (keeps data)
docker-compose -f docker-compose.dev.yml stop

# Stop and remove containers (keeps volumes)
docker-compose -f docker-compose.dev.yml down

# Stop and remove everything (including volumes - DELETES DATA)
docker-compose -f docker-compose.dev.yml down -v

# Restart specific service
docker-compose -f docker-compose.dev.yml restart api-dev

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# View logs for specific service
docker-compose -f docker-compose.dev.yml logs -f api-dev
```

### Container Management

```bash
# List running containers
docker-compose -f docker-compose.dev.yml ps

# Execute command in container
docker-compose -f docker-compose.dev.yml exec api-dev sh

# View container resource usage
docker stats

# Inspect container
docker-compose -f docker-compose.dev.yml exec api-dev env
```

### Database Management

```bash
# Backup database
docker-compose -f docker-compose.dev.yml exec postgres-dev pg_dump -U godjira godjira_dev > backup.sql

# Restore database
docker-compose -f docker-compose.dev.yml exec -T postgres-dev psql -U godjira godjira_dev < backup.sql

# Drop and recreate database
docker-compose -f docker-compose.dev.yml exec postgres-dev psql -U godjira -c "DROP DATABASE godjira_dev;"
docker-compose -f docker-compose.dev.yml exec postgres-dev psql -U godjira -c "CREATE DATABASE godjira_dev OWNER godjira;"
```

### Volume Management

```bash
# List volumes
docker volume ls | grep godjira

# Inspect volume
docker volume inspect godjira_postgres_dev_data

# Remove unused volumes
docker volume prune

# Backup volume
docker run --rm -v godjira_postgres_dev_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# Restore volume
docker run --rm -v godjira_postgres_dev_data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

---

## Troubleshooting

### Issue: Port already in use

```bash
# Find process using port 3000
# Linux/macOS:
lsof -i :3000
# Windows:
netstat -ano | findstr :3000

# Kill the process or change port in .env
PORT=3001
```

### Issue: Container keeps restarting

```bash
# View logs to see error
docker-compose -f docker-compose.dev.yml logs api-dev

# Common causes:
# - Database not ready (wait for postgres-dev to be healthy)
# - Missing environment variables (check .env)
# - Port conflict (check ports in docker-compose.dev.yml)
```

### Issue: Database connection refused

```bash
# Check if postgres is healthy
docker-compose -f docker-compose.dev.yml ps postgres-dev

# Check postgres logs
docker-compose -f docker-compose.dev.yml logs postgres-dev

# Restart postgres
docker-compose -f docker-compose.dev.yml restart postgres-dev
```

### Issue: Hot reload not working

```bash
# Check volume mounts
docker-compose -f docker-compose.dev.yml config | grep volumes

# Restart API container
docker-compose -f docker-compose.dev.yml restart api-dev

# On Windows with WSL2, ensure code is in Linux filesystem
# (not /mnt/c/, but in ~/projects/)
```

### Issue: Out of disk space

```bash
# Remove unused containers, networks, images
docker system prune

# Remove unused volumes (WARNING: Deletes data)
docker volume prune

# View disk usage
docker system df
```

### Issue: Slow performance on Windows/macOS

```bash
# Increase Docker Desktop resources:
# Settings → Resources → Advanced
# - CPUs: 4+
# - Memory: 4GB+
# - Swap: 2GB+

# Use named volumes instead of bind mounts for node_modules
# (already configured in docker-compose.dev.yml)
```

---

## Production Deployment

For production, use `docker-compose.yml` or Kubernetes:

```bash
# Production Docker Compose
docker-compose up -d

# Or deploy to Kubernetes
kubectl apply -f k8s/

# Or use Helm
helm install godjira ./helm/godjira
```

See:
- `K8S_DEPLOYMENT.md` - Kubernetes deployment guide
- `/helm/godjira/` - Helm charts
- `docker-compose.yml` - Production compose file

---

## Performance Tips

1. **Use Named Volumes** - Already configured for `node_modules`
2. **Allocate Enough RAM** - Minimum 4GB to Docker
3. **Enable BuildKit** - `export DOCKER_BUILDKIT=1`
4. **Use Multi-stage Builds** - Production Dockerfile uses this
5. **Prune Regularly** - `docker system prune` weekly

---

## Security Notes

- **Never commit `.env`** - Already in `.gitignore`
- **Change default passwords** - Update in `.env` before deploying
- **Use secrets management** - For production, use Docker Secrets or K8s Secrets
- **Scan images** - `docker scan godjira-api-dev` to check for vulnerabilities
- **Limit container privileges** - Already configured (non-root user)

---

## Next Steps

1. ✅ Development environment running
2. 📋 Start coding with hot-reload enabled
3. 📋 Test emails with Mailhog (http://localhost:8025)
4. 📋 Manage database with PgAdmin (http://localhost:5050)
5. 📋 Deploy to production (see `K8S_DEPLOYMENT.md`)

---

**Last Updated**: November 4, 2025  
**Tested With**: Docker Desktop 4.25+ on Windows/macOS/Linux
