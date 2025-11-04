# GodJira Setup Guide - Linux

This guide covers setting up GodJira on Linux distributions (Ubuntu, Debian, Fedora, Arch, etc.).

## Prerequisites

### Required Software

- **Node.js 20+** (LTS recommended)
- **pnpm 9+** (package manager)
- **PostgreSQL 15+** (database)
- **Git** (version control)

### Optional (Recommended)

- **Docker** & **Docker Compose** (for containerized database)
- **Visual Studio Code** (IDE)

---

## Installation Steps

### 1. Install Node.js 20 LTS

#### Ubuntu/Debian
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be v20.x.x
npm --version
```

#### Fedora
```bash
# Using NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

# Verify installation
node --version
```

#### Arch Linux
```bash
sudo pacman -S nodejs npm

# Verify installation
node --version
```

#### Using nvm (All distributions)
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload shell configuration
source ~/.bashrc  # or ~/.zshrc

# Install Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# Verify installation
node --version
```

---

### 2. Install pnpm

```bash
# Install pnpm globally
npm install -g pnpm

# Verify installation
pnpm --version  # Should be 9.x.x or higher

# Alternative: Using standalone script (no Node.js required)
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

---

### 3. Install PostgreSQL 15+

#### Ubuntu/Debian
```bash
# Add PostgreSQL APT repository
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update

# Install PostgreSQL 15
sudo apt-get install -y postgresql-15 postgresql-contrib-15

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
psql --version
```

#### Fedora
```bash
# Install PostgreSQL
sudo dnf install -y postgresql-server postgresql-contrib

# Initialize database
sudo postgresql-setup --initdb

# Start and enable service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
psql --version
```

#### Arch Linux
```bash
# Install PostgreSQL
sudo pacman -S postgresql

# Initialize database cluster
sudo -u postgres initdb -D /var/lib/postgres/data

# Start and enable service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
psql --version
```

#### Using Docker (All distributions)
```bash
# Install Docker if not already installed
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Run PostgreSQL container
docker run -d \
  --name godjira-postgres \
  -e POSTGRES_USER=godjira \
  -e POSTGRES_PASSWORD=godjira_password \
  -e POSTGRES_DB=godjira \
  -p 5432:5432 \
  -v godjira_pgdata:/var/lib/postgresql/data \
  postgres:15-alpine

# Verify container is running
docker ps | grep godjira-postgres
```

---

### 4. Configure PostgreSQL

#### Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# In psql shell:
CREATE USER godjira WITH PASSWORD 'godjira_password';
CREATE DATABASE godjira OWNER godjira;
GRANT ALL PRIVILEGES ON DATABASE godjira TO godjira;

# Exit psql
\q
```

#### Enable Remote Connections (if needed)

```bash
# Edit postgresql.conf
sudo nano /etc/postgresql/15/main/postgresql.conf

# Find and modify:
listen_addresses = 'localhost'  # Change to '*' for all interfaces

# Edit pg_hba.conf for authentication
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Add line for local network:
host    all             all             0.0.0.0/0               md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

### 5. Clone and Setup GodJira

```bash
# Clone repository
git clone https://github.com/yourusername/GodJira.git
cd GodJira

# Install all dependencies (monorepo)
pnpm install

# Copy environment template (will be created in Step 3)
cp .env.example apps/.env

# Edit environment variables
nano apps/.env
```

---

### 6. Configure Environment Variables

Edit `apps/.env` with your database connection:

```env
# Database
DATABASE_URL="postgresql://godjira:godjira_password@localhost:5432/godjira?schema=public"

# JWT Secrets (generate strong secrets)
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this"

# Application
NODE_ENV="development"
PORT=3000

# Email (optional for development)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@godjira.com"

# File Upload
MAX_FILE_SIZE=20971520  # 20MB in bytes
UPLOAD_PATH="./uploads"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"
```

---

### 7. Initialize Database

```bash
# Navigate to backend
cd apps

# Generate Prisma client
pnpm prisma:generate

# Run database migrations
pnpm prisma:migrate

# (Optional) Seed database with sample data
pnpm prisma:seed
```

---

### 8. Start Development Servers

#### Terminal 1: Backend API
```bash
cd apps
pnpm dev

# Backend will start on http://localhost:3000
# Swagger docs: http://localhost:3000/api/docs
```

#### Terminal 2: Frontend (when ready)
```bash
cd web
pnpm dev

# Frontend will start on http://localhost:5173
```

---

## Verification

### Test Backend API

```bash
# Health check
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","info":{"database":{"status":"up"},...}}

# API documentation
# Open browser: http://localhost:3000/api/docs
```

### Test Database Connection

```bash
# Connect to database
psql -h localhost -U godjira -d godjira

# List tables
\dt

# You should see: User, Project, Issue, Sprint, Comment, etc.
```

---

## Common Issues & Troubleshooting

### Issue: Port 3000 already in use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port in apps/.env
PORT=3001
```

### Issue: PostgreSQL connection refused

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# If not running, start it
sudo systemctl start postgresql

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### Issue: Permission denied for database

```bash
# Reconnect as postgres user and grant permissions
sudo -u postgres psql

# Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE godjira TO godjira;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO godjira;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO godjira;
```

### Issue: Prisma migration fails

```bash
# Reset database (WARNING: Deletes all data)
cd apps
pnpm prisma migrate reset

# Or manually drop and recreate
psql -U postgres
DROP DATABASE godjira;
CREATE DATABASE godjira OWNER godjira;
\q

# Run migrations again
pnpm prisma migrate deploy
```

### Issue: pnpm install fails

```bash
# Clear pnpm cache
pnpm store prune

# Delete node_modules and reinstall
rm -rf node_modules
pnpm install

# If still failing, check Node.js version
node --version  # Must be 20.x or higher
```

### Issue: File upload permissions

```bash
# Ensure uploads directory exists and is writable
cd apps
mkdir -p uploads
chmod 755 uploads

# Check ownership
ls -la uploads/
```

---

## Development Tools

### Prisma Studio (Database GUI)

```bash
cd apps
pnpm prisma:studio

# Opens at http://localhost:5555
```

### VS Code Extensions (Recommended)

- **Prisma** (Prisma.prisma)
- **ESLint** (dbaeumer.vscode-eslint)
- **Prettier** (esbenp.prettier-vscode)
- **TypeScript Vue Plugin** (Vue.volar)
- **REST Client** (humao.rest-client)

### Shell Aliases (Optional)

Add to `~/.bashrc` or `~/.zshrc`:

```bash
# GodJira shortcuts
alias gj-api="cd ~/GodJira/apps && pnpm dev"
alias gj-web="cd ~/GodJira/web && pnpm dev"
alias gj-db="cd ~/GodJira/apps && pnpm prisma:studio"
alias gj-migrate="cd ~/GodJira/apps && pnpm prisma:migrate"
```

---

## Production Deployment

For production deployment on Linux servers, see:
- `K8S_DEPLOYMENT.md` - Kubernetes deployment
- `docker-compose.yml` - Docker Compose deployment
- `/docs/architecture.md` - System architecture (to be created)

---

## Next Steps

1. ✅ Backend API running on port 3000
2. ✅ Database migrations applied
3. ✅ Swagger documentation accessible
4. 📋 Start frontend development (see `FRONTEND.md`)
5. 📋 Configure email service (optional)
6. 📋 Set up monitoring (Prometheus + Grafana)

---

## Getting Help

- **Backend API Docs**: http://localhost:3000/api/docs
- **README**: `../README.md` (main documentation)
- **Stack Details**: `../Stack Details.txt`
- **Frontend Guide**: `../FRONTEND.md`

---

**Last Updated**: November 4, 2025  
**Tested On**: Ubuntu 22.04 LTS, Fedora 38, Arch Linux (2024)
