# GodJira Setup Guide - macOS

This guide covers setting up GodJira on macOS (Intel and Apple Silicon M1/M2/M3).

## Prerequisites

### Required Software

- **Node.js 20+** (LTS recommended)
- **pnpm 9+** (package manager)
- **PostgreSQL 15+** (database)
- **Git** (pre-installed on macOS)
- **Xcode Command Line Tools**

### Optional (Recommended)

- **Homebrew** (package manager for macOS)
- **Docker Desktop** (for containerized database)
- **Visual Studio Code** (IDE)

---

## Installation Steps

### 0. Install Xcode Command Line Tools

```bash
# Required for compiling native modules
xcode-select --install

# Verify installation
xcode-select -p
# Should output: /Library/Developer/CommandLineTools
```

---

### 1. Install Homebrew (if not installed)

```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# For Apple Silicon (M1/M2/M3), add to PATH
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"

# Verify installation
brew --version
```

---

### 2. Install Node.js 20 LTS

#### Using Homebrew (Recommended)
```bash
# Install Node.js 20
brew install node@20

# Link Node.js 20
brew link node@20

# Verify installation
node --version  # Should be v20.x.x
npm --version
```

#### Using nvm (Alternative)
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Reload shell configuration
source ~/.zshrc  # or ~/.bash_profile

# Install Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# Verify installation
node --version
```

#### Using Official Installer
```bash
# Download from nodejs.org
# https://nodejs.org/en/download/
# Choose "macOS Installer (.pkg)" for your architecture

# Verify installation
node --version
```

---

### 3. Install pnpm

```bash
# Install pnpm globally
npm install -g pnpm

# Verify installation
pnpm --version  # Should be 9.x.x or higher

# Alternative: Using Homebrew
brew install pnpm

# Alternative: Using standalone script
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

---

### 4. Install PostgreSQL 15+

#### Option A: Using Homebrew (Recommended)
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Verify installation
psql --version

# Add to PATH (for psql command)
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### Option B: Using Postgres.app
```bash
# Download Postgres.app from https://postgresapp.com/
# Drag to Applications folder
# Click "Initialize" to create default database

# Add to PATH
echo 'export PATH="/Applications/Postgres.app/Contents/Versions/15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify installation
psql --version
```

#### Option C: Using Docker Desktop
```bash
# Install Docker Desktop from https://www.docker.com/products/docker-desktop
# Or using Homebrew:
brew install --cask docker

# Start Docker Desktop (first time)
open -a Docker

# Wait for Docker to start, then run PostgreSQL
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

### 5. Configure PostgreSQL

#### Create Database and User

```bash
# Connect to PostgreSQL (default postgres user)
psql postgres

# In psql shell:
CREATE USER godjira WITH PASSWORD 'godjira_password';
CREATE DATABASE godjira OWNER godjira;
GRANT ALL PRIVILEGES ON DATABASE godjira TO godjira;

# Exit psql
\q
```

#### If using Postgres.app

```bash
# Postgres.app creates a user with your macOS username
psql

# Then run the CREATE commands above
```

---

### 6. Clone and Setup GodJira

```bash
# Navigate to your projects directory
cd ~/Projects  # or wherever you keep projects

# Clone repository
git clone https://github.com/yourusername/GodJira.git
cd GodJira

# Install all dependencies (monorepo)
pnpm install

# Copy environment template (will be created in Step 3)
cp .env.example apps/.env

# Edit environment variables
nano apps/.env  # or use VS Code: code apps/.env
```

---

### 7. Configure Environment Variables

Edit `apps/.env` with your database connection:

```env
# Database
DATABASE_URL="postgresql://godjira:godjira_password@localhost:5432/godjira?schema=public"

# JWT Secrets (generate strong secrets using command below)
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

#### Generate Secure Secrets

```bash
# Generate random secrets for JWT
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output to JWT_SECRET

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output to JWT_REFRESH_SECRET
```

---

### 8. Initialize Database

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

### 9. Start Development Servers

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
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port in apps/.env
PORT=3001
```

### Issue: PostgreSQL connection refused

```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# If not running, start it
brew services start postgresql@15

# For Postgres.app, ensure the app is running
open -a Postgres

# Check PostgreSQL logs
tail -f /opt/homebrew/var/log/postgresql@15.log
```

### Issue: "psql: command not found"

```bash
# Add PostgreSQL to PATH (Homebrew)
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# For Postgres.app
echo 'export PATH="/Applications/Postgres.app/Contents/Versions/15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Issue: Apple Silicon (M1/M2/M3) native module errors

```bash
# Some npm packages need to be rebuilt for ARM64
cd apps
pnpm rebuild

# If sharp or bcrypt fails, try:
pnpm add sharp --force
pnpm add bcrypt --force

# Ensure you're using ARM64 Node.js (not Rosetta)
node -p "process.arch"  # Should output: arm64
```

### Issue: Permission denied for database

```bash
# Reconnect as superuser and grant permissions
psql postgres

# Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE godjira TO godjira;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO godjira;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO godjira;

# For Postgres.app, you may need to use your macOS username
GRANT ALL PRIVILEGES ON DATABASE godjira TO <your_username>;
```

### Issue: Prisma migration fails

```bash
# Reset database (WARNING: Deletes all data)
cd apps
pnpm prisma migrate reset

# Or manually drop and recreate
psql postgres
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

# Check architecture (Apple Silicon)
node -p "process.arch"  # Should be arm64
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

### Issue: "Cannot find module" after installing dependencies

```bash
# Regenerate Prisma client
cd apps
pnpm prisma:generate

# Clear TypeScript build cache
rm -rf dist
pnpm build
```

---

## macOS-Specific Optimizations

### Increase File Watcher Limit

```bash
# Add to ~/.zshrc or ~/.bash_profile
echo 'export CHOKIDAR_USEPOLLING=false' >> ~/.zshrc
echo 'export WATCHPACK_POLLING=false' >> ~/.zshrc
source ~/.zshrc
```

### Use macOS Keychain for Secrets (Optional)

```bash
# Store database password in Keychain
security add-generic-password -a godjira -s postgresql -w godjira_password

# Retrieve password in scripts
security find-generic-password -a godjira -s postgresql -w
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
- **REST Client** (humao.rest-client)
- **Docker** (ms-azuretools.vscode-docker)

### Shell Aliases (Optional)

Add to `~/.zshrc`:

```bash
# GodJira shortcuts
alias gj-api="cd ~/Projects/GodJira/apps && pnpm dev"
alias gj-web="cd ~/Projects/GodJira/web && pnpm dev"
alias gj-db="cd ~/Projects/GodJira/apps && pnpm prisma:studio"
alias gj-migrate="cd ~/Projects/GodJira/apps && pnpm prisma:migrate"

# Reload shell
source ~/.zshrc
```

### Homebrew Services Management

```bash
# List all services
brew services list

# Start PostgreSQL
brew services start postgresql@15

# Stop PostgreSQL
brew services stop postgresql@15

# Restart PostgreSQL
brew services restart postgresql@15
```

---

## Production Deployment

For production deployment, see:
- `K8S_DEPLOYMENT.md` - Kubernetes deployment
- `docker-compose.yml` - Docker Compose deployment
- `/docs/architecture.md` - System architecture (to be created)

---

## Performance Tips for macOS

1. **Use pnpm over npm** - Faster installs with shared dependencies
2. **Enable SSD TRIM** - `sudo trimforce enable` (if not already enabled)
3. **Disable Spotlight indexing** for `node_modules` folders
4. **Use Docker Desktop with Rosetta 2** if on Apple Silicon for better compatibility
5. **Allocate more memory to Node.js** if needed: `export NODE_OPTIONS="--max-old-space-size=4096"`

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
- **Homebrew Issues**: `brew doctor`
- **Docker Issues**: Check Docker Desktop logs

---

**Last Updated**: November 4, 2025  
**Tested On**: macOS Sonoma 14.x (Intel), macOS Sequoia 15.x (Apple Silicon M2)
