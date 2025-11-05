# GodJira

GodJira is an enterprise-grade project management system inspired by Atlassian JIRA. Built with NestJS, Prisma, PostgreSQL, and React, it provides comprehensive issue tracking, sprint management, team collaboration, and real-time notifications.

The system is designed for containerized deployment on Kubernetes, featuring a complete REST API backend with 113 endpoints across 16 modules, WebSocket-based real-time updates, and advanced analytics capabilities. It includes full support for agile workflows with sprint planning, burndown charts, time tracking, file attachments, and role-based access control.

GodJira implements NIST-compliant security standards with JWT authentication, bcrypt password hashing, rate limiting, and comprehensive audit logging. The architecture supports horizontal scaling through stateless API design and includes integrated monitoring with Prometheus and Grafana.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Dependencies](#dependencies)
- [Installation](#installation)
  - [Linux](#linux)
  - [macOS](#macos)
  - [Windows](#windows)

## Prerequisites

- Docker 20 or higher
- Docker Compose 2 or higher
- Kubernetes cluster (for production deployment)
- kubectl configured and connected to your cluster
- Helm 3 (for Kubernetes deployment)
- Git

### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install Docker
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Install Git
sudo apt install -y git
```

### macOS

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Docker Desktop
brew install --cask docker

# Install kubectl
brew install kubectl

# Install Helm
brew install helm

# Install Git
brew install git
```

### Windows (PowerShell - Run as Administrator)

```powershell
# Install Chocolatey if not already installed
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Docker Desktop
choco install -y docker-desktop

# Install kubectl
choco install -y kubernetes-cli

# Install Helm
choco install -y kubernetes-helm

# Install Git
choco install -y git

# Restart required after installation
Write-Host "Please restart your computer to complete the installation"
```

## Dependencies

- Node.js 20 or higher
- pnpm 9 or higher
- PostgreSQL 15 or higher (containerized)

### Linux (Ubuntu/Debian)

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Verify installations
node --version
pnpm --version
```

### macOS

```bash
# Install Node.js 20
brew install node@20
brew link node@20

# Install pnpm
npm install -g pnpm

# Verify installations
node --version
pnpm --version
```

### Windows (PowerShell - Run as Administrator)

```powershell
# Install Node.js 20
choco install -y nodejs-lts

# Install pnpm
npm install -g pnpm

# Verify installations
node --version
pnpm --version
```

## Installation

### Linux

1. Clone the repository

```bash
git clone https://github.com/yourusername/GodJira.git
cd GodJira
```

2. Install project dependencies

```bash
pnpm install
```

3. Configure environment variables

```bash
cp apps/.env.example apps/.env
cp web/.env.example web/.env
```

Edit `apps/.env` with your configuration:

```env
DATABASE_URL="postgresql://godjira:password@postgres:5432/godjira_dev"
JWT_SECRET="your-secret-key-minimum-32-characters-long"
JWT_REFRESH_SECRET="your-refresh-secret-minimum-32-characters-long"
```

4. Start the application with Docker Compose

```bash
docker-compose -f docker-compose.dev.yml up -d
```

5. Access the application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api/docs
- Mailhog: http://localhost:8025
- pgAdmin: http://localhost:5050

6. View logs

```bash
docker-compose -f docker-compose.dev.yml logs -f
```

7. Stop the application

```bash
docker-compose -f docker-compose.dev.yml down
```

### macOS

### Windows
